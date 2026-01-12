/*
  # Add User Onboarding Tracking

  1. New Tables
    - `user_onboarding`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `welcome_completed` (boolean) - Welcome modal dismissed
      - `dashboard_tour_completed` (boolean) - Dashboard walkthrough done
      - `campaign_tour_completed` (boolean) - Campaign creation tour done
      - `leads_tour_completed` (boolean) - Leads page tour done
      - `templates_tour_completed` (boolean) - Templates tour done
      - `accounts_tour_completed` (boolean) - Accounts tour done
      - `autopilot_tour_completed` (boolean) - Autopilot tour done
      - `first_campaign_created` (boolean) - Milestone tracking
      - `first_email_sent` (boolean) - Milestone tracking
      - `first_reply_received` (boolean) - Milestone tracking
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_onboarding` table
    - Add policies for users to read/update their own onboarding data
*/

CREATE TABLE IF NOT EXISTS user_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  welcome_completed boolean DEFAULT false,
  dashboard_tour_completed boolean DEFAULT false,
  campaign_tour_completed boolean DEFAULT false,
  leads_tour_completed boolean DEFAULT false,
  templates_tour_completed boolean DEFAULT false,
  accounts_tour_completed boolean DEFAULT false,
  autopilot_tour_completed boolean DEFAULT false,
  first_campaign_created boolean DEFAULT false,
  first_email_sent boolean DEFAULT false,
  first_reply_received boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding data"
  ON user_onboarding
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding data"
  ON user_onboarding
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data"
  ON user_onboarding
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);

CREATE OR REPLACE FUNCTION update_user_onboarding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_onboarding_updated_at ON user_onboarding;
CREATE TRIGGER user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_user_onboarding_timestamp();
