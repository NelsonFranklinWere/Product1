/*
  # Posts and Content Management

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `content` (text)
      - `platforms` (text array)
      - `scheduled_for` (timestamp)
      - `status` (text, enum-like)
      - `engagement_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `post_analytics`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `platform` (text)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `reach` (integer)
      - `impressions` (integer)
      - `recorded_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own content
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  platforms text[] NOT NULL DEFAULT '{}',
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  engagement_data jsonb DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "reach": 0}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  platform text NOT NULL,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Users can view own posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own posts"
  ON posts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Post analytics policies
CREATE POLICY "Users can view own post analytics"
  ON post_analytics
  FOR SELECT
  TO authenticated
  USING (post_id IN (SELECT id FROM posts WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own post analytics"
  ON post_analytics
  FOR ALL
  TO authenticated
  USING (post_id IN (SELECT id FROM posts WHERE user_id = auth.uid()));

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();