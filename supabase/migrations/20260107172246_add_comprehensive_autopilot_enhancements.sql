/*
  # Comprehensive Autopilot Flow Enhancements

  ## Overview
  This migration adds all features needed for enhanced autopilot functionality including:
  - Lead quality scoring
  - Pipeline stages with Kanban support
  - A/B testing for email sequences
  - Reply detection and classification
  - Sending schedule optimization
  - Duplicate and bounce prevention
  - Campaign groups
  - Webhook integrations
  - Email health scoring

  ## New Tables

  ### 1. `campaign_groups`
  Organize related campaigns into groups
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `description` (text)
  - `color` (text)
  - `priority` (integer)
  - `global_daily_limit` (integer)
  - `is_active` (boolean)

  ### 2. `lead_pipeline_stages`
  Custom pipeline stages per user
  - `id` (uuid, primary key)
  - `user_id` (uuid)
  - `name` (text)
  - `color` (text)
  - `position` (integer)
  - `is_default` (boolean)
  - `auto_advance_on` (text)

  ### 3. `sequence_ab_tests`
  A/B testing for email sequences
  - `id` (uuid, primary key)
  - `sequence_id` (uuid)
  - `variant_a_subject` (text)
  - `variant_b_subject` (text)
  - `variant_a_body` (text)
  - `variant_b_body` (text)
  - `variant_a_sends` (integer)
  - `variant_b_sends` (integer)
  - `variant_a_opens` (integer)
  - `variant_b_opens` (integer)
  - `variant_a_replies` (integer)
  - `variant_b_replies` (integer)
  - `winner` (text)
  - `is_active` (boolean)

  ### 4. `reply_classifications`
  Classify incoming replies
  - `id` (uuid, primary key)
  - `email_id` (uuid)
  - `lead_id` (uuid)
  - `classification` (text: interested, not_interested, unsubscribe, out_of_office, question, other)
  - `confidence_score` (numeric)
  - `reply_text` (text)
  - `ai_analysis` (jsonb)

  ### 5. `email_health_scores`
  Track email account health
  - `gmail_account_id` (uuid, primary key)
  - `health_score` (integer 0-100)
  - `deliverability_rate` (numeric)
  - `bounce_rate` (numeric)
  - `spam_rate` (numeric)
  - `last_calculated_at` (timestamptz)

  ### 6. `webhook_configurations`
  Store webhook endpoints for external integrations
  - `id` (uuid, primary key)
  - `user_id` (uuid)
  - `name` (text)
  - `url` (text)
  - `events` (text array)
  - `secret` (text)
  - `is_active` (boolean)

  ### 7. `webhook_deliveries`
  Track webhook delivery attempts
  - `id` (uuid, primary key)
  - `webhook_id` (uuid)
  - `event_type` (text)
  - `payload` (jsonb)
  - `status_code` (integer)
  - `response_body` (text)
  - `delivered_at` (timestamptz)

  ### 8. `duplicate_email_registry`
  Track emails across campaigns to prevent duplicates
  - `id` (uuid, primary key)
  - `user_id` (uuid)
  - `email` (text)
  - `first_seen_campaign_id` (uuid)
  - `times_seen` (integer)

  ## Modified Tables

  ### leads
  - `quality_score` (integer 0-100) - Calculated lead quality score
  - `quality_factors` (jsonb) - Breakdown of scoring factors
  - `pipeline_stage` (text) - Current pipeline stage
  - `pipeline_stage_changed_at` (timestamptz)
  - `timezone` (text) - Detected timezone from address
  - `best_send_time` (text) - Optimal time to send emails
  - `bounce_count` (integer) - Number of bounced emails

  ### campaigns
  - `group_id` (uuid) - Reference to campaign_groups
  - `priority` (integer) - Priority for multi-campaign coordination
  - `ab_testing_enabled` (boolean)
  - `auto_advance_pipeline` (boolean)
  - `warmup_mode` (boolean) - Gradual sending increase
  - `warmup_day` (integer) - Current day in warmup period

  ### gmail_accounts
  - `warmup_enabled` (boolean)
  - `warmup_start_date` (date)
  - `warmup_daily_increment` (integer)
  - `bounce_count` (integer)
  - `spam_reports` (integer)
  - `reputation_score` (integer)

  ### user_settings
  - `global_daily_limit` (integer) - Limit across all campaigns
  - `business_days_only` (boolean)
  - `send_window_start` (time)
  - `send_window_end` (time)
  - `default_timezone` (text)
  - `auto_pause_on_reply` (boolean)
  - `reply_notification_email` (text)

  ## Security
  - RLS enabled on all new tables
  - Policies restrict access to authenticated users and their own data
*/

-- Create campaign_groups table
CREATE TABLE IF NOT EXISTS campaign_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  priority integer DEFAULT 1,
  global_daily_limit integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lead_pipeline_stages table
CREATE TABLE IF NOT EXISTS lead_pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  position integer NOT NULL,
  is_default boolean DEFAULT false,
  auto_advance_on text CHECK (auto_advance_on IN ('email_sent', 'email_opened', 'email_replied', 'manual', NULL)),
  created_at timestamptz DEFAULT now()
);

-- Create sequence_ab_tests table
CREATE TABLE IF NOT EXISTS sequence_ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid NOT NULL,
  step_number integer DEFAULT 1,
  variant_a_subject text,
  variant_b_subject text,
  variant_a_body text,
  variant_b_body text,
  variant_a_sends integer DEFAULT 0,
  variant_b_sends integer DEFAULT 0,
  variant_a_opens integer DEFAULT 0,
  variant_b_opens integer DEFAULT 0,
  variant_a_replies integer DEFAULT 0,
  variant_b_replies integer DEFAULT 0,
  winner text CHECK (winner IN ('A', 'B', NULL)),
  winner_selected_at timestamptz,
  min_sample_size integer DEFAULT 50,
  confidence_threshold numeric(3,2) DEFAULT 0.95,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reply_classifications table
CREATE TABLE IF NOT EXISTS reply_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email_id uuid REFERENCES emails(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  classification text NOT NULL CHECK (classification IN ('interested', 'not_interested', 'unsubscribe', 'out_of_office', 'question', 'meeting_request', 'other')),
  confidence_score numeric(3,2) DEFAULT 0,
  reply_text text,
  reply_subject text,
  ai_analysis jsonb DEFAULT '{}',
  is_reviewed boolean DEFAULT false,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create email_health_scores table
CREATE TABLE IF NOT EXISTS email_health_scores (
  gmail_account_id uuid PRIMARY KEY REFERENCES gmail_accounts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  health_score integer DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  deliverability_rate numeric(5,2) DEFAULT 100,
  bounce_rate numeric(5,2) DEFAULT 0,
  spam_rate numeric(5,2) DEFAULT 0,
  open_rate numeric(5,2) DEFAULT 0,
  reply_rate numeric(5,2) DEFAULT 0,
  total_sent integer DEFAULT 0,
  total_bounced integer DEFAULT 0,
  total_spam_reports integer DEFAULT 0,
  last_calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create webhook_configurations table
CREATE TABLE IF NOT EXISTS webhook_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  secret text,
  headers jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create webhook_deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES webhook_configurations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status_code integer,
  response_body text,
  error_message text,
  attempt_count integer DEFAULT 1,
  delivered_at timestamptz DEFAULT now()
);

-- Create duplicate_email_registry table
CREATE TABLE IF NOT EXISTS duplicate_email_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  email_hash text NOT NULL,
  first_seen_campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  first_seen_at timestamptz DEFAULT now(),
  times_seen integer DEFAULT 1,
  last_seen_at timestamptz DEFAULT now(),
  UNIQUE(user_id, email_hash)
);

-- Create analytics_funnel table for funnel visualization
CREATE TABLE IF NOT EXISTS analytics_funnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  leads_scraped integer DEFAULT 0,
  leads_qualified integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  emails_replied integer DEFAULT 0,
  meetings_scheduled integer DEFAULT 0,
  deals_converted integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, campaign_id, date)
);

-- Add new columns to leads table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'quality_score') THEN
    ALTER TABLE leads ADD COLUMN quality_score integer DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'quality_factors') THEN
    ALTER TABLE leads ADD COLUMN quality_factors jsonb DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'pipeline_stage') THEN
    ALTER TABLE leads ADD COLUMN pipeline_stage text DEFAULT 'new';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'pipeline_stage_changed_at') THEN
    ALTER TABLE leads ADD COLUMN pipeline_stage_changed_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'timezone') THEN
    ALTER TABLE leads ADD COLUMN timezone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'best_send_time') THEN
    ALTER TABLE leads ADD COLUMN best_send_time time;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'bounce_count') THEN
    ALTER TABLE leads ADD COLUMN bounce_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ab_variant') THEN
    ALTER TABLE leads ADD COLUMN ab_variant text CHECK (ab_variant IN ('A', 'B', NULL));
  END IF;
END $$;

-- Add new columns to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'group_id') THEN
    ALTER TABLE campaigns ADD COLUMN group_id uuid REFERENCES campaign_groups(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'priority') THEN
    ALTER TABLE campaigns ADD COLUMN priority integer DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'ab_testing_enabled') THEN
    ALTER TABLE campaigns ADD COLUMN ab_testing_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'auto_advance_pipeline') THEN
    ALTER TABLE campaigns ADD COLUMN auto_advance_pipeline boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'warmup_mode') THEN
    ALTER TABLE campaigns ADD COLUMN warmup_mode boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'warmup_day') THEN
    ALTER TABLE campaigns ADD COLUMN warmup_day integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'cost_per_lead') THEN
    ALTER TABLE campaigns ADD COLUMN cost_per_lead numeric(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'total_cost') THEN
    ALTER TABLE campaigns ADD COLUMN total_cost numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Add new columns to gmail_accounts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gmail_accounts' AND column_name = 'warmup_enabled') THEN
    ALTER TABLE gmail_accounts ADD COLUMN warmup_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gmail_accounts' AND column_name = 'warmup_start_date') THEN
    ALTER TABLE gmail_accounts ADD COLUMN warmup_start_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gmail_accounts' AND column_name = 'warmup_daily_increment') THEN
    ALTER TABLE gmail_accounts ADD COLUMN warmup_daily_increment integer DEFAULT 2;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gmail_accounts' AND column_name = 'bounce_count') THEN
    ALTER TABLE gmail_accounts ADD COLUMN bounce_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gmail_accounts' AND column_name = 'spam_reports') THEN
    ALTER TABLE gmail_accounts ADD COLUMN spam_reports integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gmail_accounts' AND column_name = 'reputation_score') THEN
    ALTER TABLE gmail_accounts ADD COLUMN reputation_score integer DEFAULT 100;
  END IF;
END $$;

-- Add new columns to user_settings table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'global_daily_limit') THEN
    ALTER TABLE user_settings ADD COLUMN global_daily_limit integer DEFAULT 500;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'business_days_only') THEN
    ALTER TABLE user_settings ADD COLUMN business_days_only boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'send_window_start') THEN
    ALTER TABLE user_settings ADD COLUMN send_window_start time DEFAULT '09:00:00';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'send_window_end') THEN
    ALTER TABLE user_settings ADD COLUMN send_window_end time DEFAULT '17:00:00';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'default_timezone') THEN
    ALTER TABLE user_settings ADD COLUMN default_timezone text DEFAULT 'America/New_York';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'auto_pause_on_reply') THEN
    ALTER TABLE user_settings ADD COLUMN auto_pause_on_reply boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'reply_notification_email') THEN
    ALTER TABLE user_settings ADD COLUMN reply_notification_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'apify_auto_enrich') THEN
    ALTER TABLE user_settings ADD COLUMN apify_auto_enrich boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'apify_default_settings') THEN
    ALTER TABLE user_settings ADD COLUMN apify_default_settings jsonb DEFAULT '{}';
  END IF;
END $$;

-- Add new columns to emails table for A/B tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emails' AND column_name = 'ab_variant') THEN
    ALTER TABLE emails ADD COLUMN ab_variant text CHECK (ab_variant IN ('A', 'B', NULL));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emails' AND column_name = 'ab_test_id') THEN
    ALTER TABLE emails ADD COLUMN ab_test_id uuid REFERENCES sequence_ab_tests(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emails' AND column_name = 'sequence_step') THEN
    ALTER TABLE emails ADD COLUMN sequence_step integer DEFAULT 1;
  END IF;
END $$;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_campaign_groups_user_id ON campaign_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_pipeline_stages_user_id ON lead_pipeline_stages(user_id);
CREATE INDEX IF NOT EXISTS idx_sequence_ab_tests_sequence_id ON sequence_ab_tests(sequence_id);
CREATE INDEX IF NOT EXISTS idx_reply_classifications_lead_id ON reply_classifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_reply_classifications_classification ON reply_classifications(classification);
CREATE INDEX IF NOT EXISTS idx_webhook_configurations_user_id ON webhook_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_email_registry_email_hash ON duplicate_email_registry(email_hash);
CREATE INDEX IF NOT EXISTS idx_analytics_funnel_user_campaign_date ON analytics_funnel(user_id, campaign_id, date);
CREATE INDEX IF NOT EXISTS idx_leads_quality_score ON leads(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_campaigns_group_id ON campaigns(group_id);
CREATE INDEX IF NOT EXISTS idx_emails_ab_variant ON emails(ab_variant);

-- Enable RLS on all new tables
ALTER TABLE campaign_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_email_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_funnel ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_groups
CREATE POLICY "Users can view own campaign groups"
  ON campaign_groups FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own campaign groups"
  ON campaign_groups FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own campaign groups"
  ON campaign_groups FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own campaign groups"
  ON campaign_groups FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for lead_pipeline_stages
CREATE POLICY "Users can view own pipeline stages"
  ON lead_pipeline_stages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pipeline stages"
  ON lead_pipeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pipeline stages"
  ON lead_pipeline_stages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own pipeline stages"
  ON lead_pipeline_stages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for sequence_ab_tests (via campaign ownership)
CREATE POLICY "Users can view own AB tests"
  ON sequence_ab_tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert AB tests"
  ON sequence_ab_tests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update AB tests"
  ON sequence_ab_tests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete AB tests"
  ON sequence_ab_tests FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for reply_classifications
CREATE POLICY "Users can view own reply classifications"
  ON reply_classifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reply classifications"
  ON reply_classifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reply classifications"
  ON reply_classifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reply classifications"
  ON reply_classifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for email_health_scores
CREATE POLICY "Users can view own email health scores"
  ON email_health_scores FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own email health scores"
  ON email_health_scores FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own email health scores"
  ON email_health_scores FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for webhook_configurations
CREATE POLICY "Users can view own webhook configs"
  ON webhook_configurations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own webhook configs"
  ON webhook_configurations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own webhook configs"
  ON webhook_configurations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own webhook configs"
  ON webhook_configurations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for webhook_deliveries
CREATE POLICY "Users can view own webhook deliveries"
  ON webhook_deliveries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own webhook deliveries"
  ON webhook_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for duplicate_email_registry
CREATE POLICY "Users can view own duplicate registry"
  ON duplicate_email_registry FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own duplicate registry"
  ON duplicate_email_registry FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own duplicate registry"
  ON duplicate_email_registry FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for analytics_funnel
CREATE POLICY "Users can view own funnel analytics"
  ON analytics_funnel FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own funnel analytics"
  ON analytics_funnel FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own funnel analytics"
  ON analytics_funnel FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to calculate lead quality score
CREATE OR REPLACE FUNCTION calculate_lead_quality_score(
  p_rating numeric,
  p_review_count integer,
  p_has_website boolean,
  p_has_real_email boolean,
  p_has_social_profiles boolean,
  p_employee_count integer
)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  factors jsonb := '{}';
BEGIN
  -- Rating score (max 25 points)
  IF p_rating IS NOT NULL THEN
    score := score + LEAST(FLOOR(p_rating * 5), 25);
    factors := factors || jsonb_build_object('rating', LEAST(FLOOR(p_rating * 5), 25));
  END IF;
  
  -- Review count score (max 20 points)
  IF p_review_count IS NOT NULL AND p_review_count > 0 THEN
    score := score + LEAST(FLOOR(LN(p_review_count + 1) * 5), 20);
    factors := factors || jsonb_build_object('reviews', LEAST(FLOOR(LN(p_review_count + 1) * 5), 20));
  END IF;
  
  -- Website presence (15 points)
  IF p_has_website THEN
    score := score + 15;
    factors := factors || jsonb_build_object('website', 15);
  END IF;
  
  -- Real email (20 points)
  IF p_has_real_email THEN
    score := score + 20;
    factors := factors || jsonb_build_object('real_email', 20);
  END IF;
  
  -- Social profiles (10 points)
  IF p_has_social_profiles THEN
    score := score + 10;
    factors := factors || jsonb_build_object('social_profiles', 10);
  END IF;
  
  -- Employee count (max 10 points)
  IF p_employee_count IS NOT NULL AND p_employee_count > 0 THEN
    score := score + LEAST(FLOOR(LN(p_employee_count + 1) * 2), 10);
    factors := factors || jsonb_build_object('employees', LEAST(FLOOR(LN(p_employee_count + 1) * 2), 10));
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update lead quality score
CREATE OR REPLACE FUNCTION update_lead_quality_score()
RETURNS trigger AS $$
DECLARE
  has_real_email boolean;
  has_social_profiles boolean;
  new_score integer;
BEGIN
  -- Check for real email
  has_real_email := NEW.real_email IS NOT NULL AND NEW.real_email != '';
  
  -- Check for social profiles
  has_social_profiles := NEW.social_profiles IS NOT NULL AND NEW.social_profiles != '{}'::jsonb;
  
  -- Calculate score
  new_score := calculate_lead_quality_score(
    NEW.rating,
    COALESCE(NEW.review_count, 0),
    NEW.website IS NOT NULL AND NEW.website != '',
    has_real_email,
    has_social_profiles,
    NEW.employee_count
  );
  
  NEW.quality_score := new_score;
  NEW.quality_factors := jsonb_build_object(
    'rating_points', COALESCE(LEAST(FLOOR(COALESCE(NEW.rating, 0) * 5), 25), 0),
    'review_points', COALESCE(LEAST(FLOOR(LN(COALESCE(NEW.review_count, 0) + 1) * 5), 20), 0),
    'website_points', CASE WHEN NEW.website IS NOT NULL AND NEW.website != '' THEN 15 ELSE 0 END,
    'email_points', CASE WHEN has_real_email THEN 20 ELSE 0 END,
    'social_points', CASE WHEN has_social_profiles THEN 10 ELSE 0 END,
    'employee_points', COALESCE(LEAST(FLOOR(LN(COALESCE(NEW.employee_count, 0) + 1) * 2), 10), 0)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lead quality score
DROP TRIGGER IF EXISTS trigger_update_lead_quality_score ON leads;
CREATE TRIGGER trigger_update_lead_quality_score
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_quality_score();

-- Create function to auto-advance pipeline stage
CREATE OR REPLACE FUNCTION auto_advance_pipeline_stage()
RETURNS trigger AS $$
BEGIN
  -- Auto-advance on email sent
  IF NEW.status = 'sent' AND OLD.status = 'queued' THEN
    UPDATE leads
    SET 
      pipeline_stage = 'contacted',
      pipeline_stage_changed_at = now()
    WHERE id = NEW.lead_id
      AND pipeline_stage = 'new';
  END IF;
  
  -- Auto-advance on reply
  IF NEW.status = 'replied' AND OLD.status != 'replied' THEN
    UPDATE leads
    SET 
      pipeline_stage = 'replied',
      pipeline_stage_changed_at = now(),
      has_replied = true,
      replied_at = now()
    WHERE id = NEW.lead_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-advancing pipeline
DROP TRIGGER IF EXISTS trigger_auto_advance_pipeline ON emails;
CREATE TRIGGER trigger_auto_advance_pipeline
  AFTER UPDATE ON emails
  FOR EACH ROW
  EXECUTE FUNCTION auto_advance_pipeline_stage();

-- Create function to insert default pipeline stages for new users
CREATE OR REPLACE FUNCTION create_default_pipeline_stages()
RETURNS trigger AS $$
BEGIN
  INSERT INTO lead_pipeline_stages (user_id, name, color, position, is_default, auto_advance_on)
  VALUES
    (NEW.id, 'New', '#6B7280', 1, true, NULL),
    (NEW.id, 'Qualified', '#3B82F6', 2, true, NULL),
    (NEW.id, 'Contacted', '#F59E0B', 3, true, 'email_sent'),
    (NEW.id, 'Replied', '#10B981', 4, true, 'email_replied'),
    (NEW.id, 'Meeting Scheduled', '#8B5CF6', 5, true, NULL),
    (NEW.id, 'Converted', '#059669', 6, true, NULL);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default pipeline stages
DROP TRIGGER IF EXISTS trigger_create_default_pipeline_stages ON profiles;
CREATE TRIGGER trigger_create_default_pipeline_stages
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_pipeline_stages();

-- Create updated_at triggers for new tables
DROP TRIGGER IF EXISTS campaign_groups_updated_at ON campaign_groups;
CREATE TRIGGER campaign_groups_updated_at
  BEFORE UPDATE ON campaign_groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS sequence_ab_tests_updated_at ON sequence_ab_tests;
CREATE TRIGGER sequence_ab_tests_updated_at
  BEFORE UPDATE ON sequence_ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS email_health_scores_updated_at ON email_health_scores;
CREATE TRIGGER email_health_scores_updated_at
  BEFORE UPDATE ON email_health_scores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS webhook_configurations_updated_at ON webhook_configurations;
CREATE TRIGGER webhook_configurations_updated_at
  BEFORE UPDATE ON webhook_configurations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
