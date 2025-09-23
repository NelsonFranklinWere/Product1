/*
  # Customer Messages and Interactions

  1. New Tables
    - `customer_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `platform` (text)
      - `from_user` (text)
      - `from_user_id` (text, platform-specific)
      - `content` (text)
      - `message_type` (text, enum-like)
      - `is_read` (boolean)
      - `replied_at` (timestamp)
      - `reply_content` (text)
      - `created_at` (timestamp)

    - `customer_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `platform` (text)
      - `interaction_type` (text)
      - `notes` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own customer data
*/

CREATE TABLE IF NOT EXISTS customer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  from_user text NOT NULL,
  from_user_id text,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'message' CHECK (message_type IN ('message', 'comment', 'mention', 'review')),
  is_read boolean DEFAULT false,
  replied_at timestamptz,
  reply_content text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  platform text NOT NULL,
  interaction_type text NOT NULL DEFAULT 'inquiry' CHECK (interaction_type IN ('inquiry', 'complaint', 'support', 'lead', 'sale')),
  notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

-- Customer messages policies
CREATE POLICY "Users can view own customer messages"
  ON customer_messages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own customer messages"
  ON customer_messages
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Customer interactions policies
CREATE POLICY "Users can view own customer interactions"
  ON customer_interactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own customer interactions"
  ON customer_interactions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_customer_interactions_updated_at
  BEFORE UPDATE ON customer_interactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();