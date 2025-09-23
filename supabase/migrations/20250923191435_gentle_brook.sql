/*
  # Social Media Accounts Management

  1. New Tables
    - `social_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `platform` (text, enum-like)
      - `account_name` (text)
      - `account_id` (text, platform-specific ID)
      - `followers` (integer)
      - `is_connected` (boolean)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `token_expires_at` (timestamp)
      - `last_sync` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `social_accounts` table
    - Add policies for users to manage their own social accounts
*/

CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'whatsapp', 'tiktok', 'linkedin')),
  account_name text NOT NULL,
  account_id text,
  followers integer DEFAULT 0,
  is_connected boolean DEFAULT false,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social accounts"
  ON social_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own social accounts"
  ON social_accounts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();