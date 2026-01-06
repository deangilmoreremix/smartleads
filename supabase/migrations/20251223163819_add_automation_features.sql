/*
  # Add Automation Features Schema

  ## Overview
  Adds support for automated campaign execution, job queue system, and enhanced email tracking

  ## New Tables
  
  ### 1. `campaign_jobs`
  Background jobs for automated campaign tasks
  - `id` (uuid, primary key)
  - `campaign_id` (uuid, references campaigns)
  - `user_id` (uuid, references profiles)
  - `job_type` (text: 'scrape_leads', 'generate_emails', 'send_emails', 'schedule_campaign')
  - `status` (text: 'pending', 'processing', 'completed', 'failed')
  - `progress` (integer, 0-100)
  - `total_items` (integer)
  - `processed_items` (integer)
  - `result_data` (jsonb, stores job results)
  - `error_message` (text, optional)
  - `started_at` (timestamptz, optional)
  - `completed_at` (timestamptz, optional)
  - `created_at` (timestamptz)

  ### 2. `email_templates`
  Reusable email templates with AI variables
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `subject` (text)
  - `body` (text)
  - `variables` (jsonb, stores template variables)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `gmail_accounts`
  Connected Gmail accounts for sending
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `email` (text)
  - `access_token` (text, encrypted)
  - `refresh_token` (text, encrypted)
  - `daily_limit` (integer, default 50)
  - `emails_sent_today` (integer, default 0)
  - `last_reset_at` (timestamptz)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Modified Tables
  
  ### `campaigns`
  Add automation settings
  - `automation_enabled` (boolean)
  - `scraping_status` (text)
  - `ai_personalization` (boolean)
  - `sending_schedule` (jsonb)

  ### `leads`
  Add scraping metadata
  - `scraped_data` (jsonb, raw Google Maps data)
  - `personalization_score` (integer, 0-100)
  - `last_contacted_at` (timestamptz)

  ### `emails`
  Add AI generation metadata
  - `ai_generated` (boolean)
  - `generation_prompt` (text)
  - `personalization_tokens` (jsonb)

  ## Security
  - Enable RLS on all new tables
  - Add policies for user data isolation
*/

-- Add columns to existing campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS automation_enabled boolean DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS scraping_status text DEFAULT 'not_started' CHECK (scraping_status IN ('not_started', 'in_progress', 'completed', 'failed'));
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ai_personalization boolean DEFAULT true;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sending_schedule jsonb DEFAULT '{"enabled": false, "start_hour": 9, "end_hour": 17, "days": [1,2,3,4,5], "timezone": "UTC"}';

-- Add columns to existing leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS scraped_data jsonb DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS personalization_score integer DEFAULT 0 CHECK (personalization_score >= 0 AND personalization_score <= 100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

-- Add columns to existing emails table
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS generation_prompt text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS personalization_tokens jsonb DEFAULT '{}';

-- Create campaign_jobs table
CREATE TABLE IF NOT EXISTS campaign_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('scrape_leads', 'generate_emails', 'send_emails', 'schedule_campaign')),
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_items integer DEFAULT 0,
  processed_items integer DEFAULT 0,
  result_data jsonb DEFAULT '{}',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gmail_accounts table
CREATE TABLE IF NOT EXISTS gmail_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  access_token text,
  refresh_token text,
  daily_limit integer DEFAULT 50,
  emails_sent_today integer DEFAULT 0,
  last_reset_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_campaign_id ON campaign_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_user_id ON campaign_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_status ON campaign_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_accounts_user_id ON gmail_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_accounts_is_active ON gmail_accounts(is_active);

-- Enable RLS
ALTER TABLE campaign_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_jobs
CREATE POLICY "Users can view own campaign jobs"
  ON campaign_jobs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own campaign jobs"
  ON campaign_jobs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own campaign jobs"
  ON campaign_jobs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own campaign jobs"
  ON campaign_jobs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for email_templates
CREATE POLICY "Users can view own templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own templates"
  ON email_templates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for gmail_accounts
CREATE POLICY "Users can view own gmail accounts"
  ON gmail_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own gmail accounts"
  ON gmail_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own gmail accounts"
  ON gmail_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own gmail accounts"
  ON gmail_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to reset daily email counts
CREATE OR REPLACE FUNCTION reset_daily_email_counts()
RETURNS void AS $$
BEGIN
  UPDATE gmail_accounts
  SET emails_sent_today = 0,
      last_reset_at = now()
  WHERE last_reset_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql;

-- Trigger for email_templates updated_at
DROP TRIGGER IF EXISTS email_templates_updated_at ON email_templates;
CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for gmail_accounts updated_at
DROP TRIGGER IF EXISTS gmail_accounts_updated_at ON gmail_accounts;
CREATE TRIGGER gmail_accounts_updated_at
  BEFORE UPDATE ON gmail_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
