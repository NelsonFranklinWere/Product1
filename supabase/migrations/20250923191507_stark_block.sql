/*
  # Automation Rules and Compliance Tracking

  1. New Tables
    - `automation_rules`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text)
      - `description` (text)
      - `rule_type` (text, enum-like)
      - `trigger_conditions` (jsonb)
      - `actions` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `compliance_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `description` (text)
      - `compliance_type` (text, enum-like)
      - `due_date` (date)
      - `status` (text, enum-like)
      - `priority` (text, enum-like)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `automation_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `rule_id` (uuid, references automation_rules)
      - `action_taken` (text)
      - `result` (text)
      - `executed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own automation and compliance data
*/

CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL CHECK (rule_type IN ('response', 'scheduling', 'analytics', 'compliance', 'lead_scoring')),
  trigger_conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  compliance_type text NOT NULL CHECK (compliance_type IN ('kra', 'nema', 'business', 'data_protection', 'other')),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES automation_rules(id) ON DELETE SET NULL,
  action_taken text NOT NULL,
  result text,
  executed_at timestamptz DEFAULT now()
);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Automation rules policies
CREATE POLICY "Users can view own automation rules"
  ON automation_rules
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own automation rules"
  ON automation_rules
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Compliance items policies
CREATE POLICY "Users can view own compliance items"
  ON compliance_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own compliance items"
  ON compliance_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Automation logs policies
CREATE POLICY "Users can view own automation logs"
  ON automation_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own automation logs"
  ON automation_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_compliance_items_updated_at
  BEFORE UPDATE ON compliance_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();