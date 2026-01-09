/*
  # Add Autopilot Queue and Scheduling System
  
  This migration adds comprehensive automation features for the autopilot system:
  
  1. New Tables
    - `email_priority_queue` - Intelligent queue that ranks leads by intent score and conversion potential
    - `automation_schedules` - Visual scheduler for setting exact send times
    - `automation_runs` - Tracks each automation cycle with detailed metrics
    - `email_previews` - Stores generated email previews before sending
  
  2. New Columns
    - Added to campaigns: `autopilot_next_run_at`, `autopilot_cron_expression`
    - Added to leads: `priority_score`, `queue_position`
  
  3. Security
    - RLS enabled on all new tables
    - Service role bypass for edge functions
  
  4. Functions
    - `calculate_lead_priority_score` - Combines intent, website health, and recency
    - `get_next_leads_to_email` - Returns prioritized leads for sending
*/

-- Email Priority Queue table
CREATE TABLE IF NOT EXISTS email_priority_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  email_id uuid REFERENCES emails(id) ON DELETE SET NULL,
  
  -- Priority scoring
  priority_score integer DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  intent_score integer DEFAULT 0,
  website_health_score integer DEFAULT 0,
  recency_score integer DEFAULT 0,
  
  -- Queue status
  queue_status text DEFAULT 'pending' CHECK (queue_status IN ('pending', 'ready', 'processing', 'sent', 'failed', 'skipped')),
  queue_position integer,
  
  -- Scheduling
  scheduled_for timestamptz,
  send_window_start time,
  send_window_end time,
  timezone text DEFAULT 'America/New_York',
  business_days_only boolean DEFAULT true,
  
  -- Processing metadata
  attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  error_message text,
  
  -- Intent-based customization
  intent_signals jsonb DEFAULT '[]'::jsonb,
  recommended_approach text,
  personalization_hints jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Automation Schedules table for visual scheduler
CREATE TABLE IF NOT EXISTS automation_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Schedule name and description
  name text NOT NULL,
  description text,
  
  -- Schedule configuration
  schedule_type text DEFAULT 'daily' CHECK (schedule_type IN ('daily', 'weekly', 'custom', 'one_time')),
  cron_expression text,
  
  -- Time windows
  send_windows jsonb DEFAULT '[{"start": "09:00", "end": "17:00"}]'::jsonb,
  timezone text DEFAULT 'America/New_York',
  business_days_only boolean DEFAULT true,
  excluded_dates jsonb DEFAULT '[]'::jsonb,
  
  -- Limits
  max_emails_per_run integer DEFAULT 50,
  max_emails_per_day integer DEFAULT 100,
  min_interval_minutes integer DEFAULT 5,
  
  -- Actions to perform
  actions jsonb DEFAULT '["scrape_leads", "generate_emails", "send_emails"]'::jsonb,
  
  -- Lead thresholds
  min_leads_threshold integer DEFAULT 10,
  auto_scrape_when_low boolean DEFAULT true,
  scrape_count_on_low integer DEFAULT 50,
  
  -- Status
  is_active boolean DEFAULT true,
  next_run_at timestamptz,
  last_run_at timestamptz,
  last_run_status text,
  
  -- Stats
  total_runs integer DEFAULT 0,
  total_emails_sent integer DEFAULT 0,
  total_leads_scraped integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email Previews table for preview before sending
CREATE TABLE IF NOT EXISTS email_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Preview content
  subject text NOT NULL,
  body text NOT NULL,
  html_body text,
  
  -- Personalization data used
  tokens_used jsonb DEFAULT '{}'::jsonb,
  personalization_data jsonb DEFAULT '{}'::jsonb,
  
  -- Deep personalization tokens
  services_mentioned jsonb DEFAULT '[]'::jsonb,
  pain_points_addressed jsonb DEFAULT '[]'::jsonb,
  conversation_starter text,
  tech_stack_mentioned jsonb DEFAULT '[]'::jsonb,
  decision_maker_info jsonb,
  
  -- Quality metrics
  quality_score integer,
  spam_score integer,
  personalization_score integer,
  
  -- Approval workflow
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'edited', 'rejected', 'sent')),
  reviewed_at timestamptz,
  edited_subject text,
  edited_body text,
  rejection_reason text,
  
  -- Metadata
  generated_at timestamptz DEFAULT now(),
  template_id uuid,
  variant_id uuid,
  
  created_at timestamptz DEFAULT now()
);

-- Add new columns to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'autopilot_next_run_at'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN autopilot_next_run_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'autopilot_cron_expression'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN autopilot_cron_expression text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'autopilot_schedule_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN autopilot_schedule_id uuid;
  END IF;
END $$;

-- Add new columns to leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'priority_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN priority_score integer DEFAULT 50;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'queue_position'
  ) THEN
    ALTER TABLE leads ADD COLUMN queue_position integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'last_queued_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_queued_at timestamptz;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE email_priority_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_previews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_priority_queue
CREATE POLICY "Users can view own priority queue"
  ON email_priority_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own priority queue"
  ON email_priority_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own priority queue"
  ON email_priority_queue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own priority queue"
  ON email_priority_queue FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypass for edge functions
CREATE POLICY "Service role can manage priority queue"
  ON email_priority_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for automation_schedules
CREATE POLICY "Users can view own automation schedules"
  ON automation_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automation schedules"
  ON automation_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automation schedules"
  ON automation_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own automation schedules"
  ON automation_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY "Service role can manage automation schedules"
  ON automation_schedules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for email_previews
CREATE POLICY "Users can view own email previews"
  ON email_previews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email previews"
  ON email_previews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email previews"
  ON email_previews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own email previews"
  ON email_previews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_priority_queue_campaign ON email_priority_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_priority_queue_user ON email_priority_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_priority_queue_status ON email_priority_queue(queue_status);
CREATE INDEX IF NOT EXISTS idx_priority_queue_priority ON email_priority_queue(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_priority_queue_scheduled ON email_priority_queue(scheduled_for) WHERE scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_automation_schedules_user ON automation_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_schedules_campaign ON automation_schedules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_automation_schedules_next_run ON automation_schedules(next_run_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_email_previews_user ON email_previews(user_id);
CREATE INDEX IF NOT EXISTS idx_email_previews_lead ON email_previews(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_previews_campaign ON email_previews(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_previews_status ON email_previews(status);

-- Function to calculate lead priority score
CREATE OR REPLACE FUNCTION calculate_lead_priority_score(
  p_lead_id uuid
) RETURNS integer AS $$
DECLARE
  v_intent_score integer;
  v_health_score integer;
  v_recency_score integer;
  v_final_score integer;
  v_days_since_contact integer;
BEGIN
  -- Get intent score from lead
  SELECT COALESCE(intent_score, 0) INTO v_intent_score
  FROM leads WHERE id = p_lead_id;
  
  -- Get website health score
  SELECT COALESCE(overall_score, 50) INTO v_health_score
  FROM website_health_scores WHERE lead_id = p_lead_id
  ORDER BY created_at DESC LIMIT 1;
  
  -- Calculate recency score (higher if never contacted or contacted long ago)
  SELECT COALESCE(
    EXTRACT(DAY FROM now() - last_contacted_at)::integer,
    999
  ) INTO v_days_since_contact
  FROM leads WHERE id = p_lead_id;
  
  -- Convert days to score (0-100, higher = longer since contact)
  v_recency_score := LEAST(100, v_days_since_contact * 5);
  
  -- Calculate weighted final score
  -- Intent: 40%, Health: 30%, Recency: 30%
  v_final_score := (
    (v_intent_score * 0.4) +
    (v_health_score * 0.3) +
    (v_recency_score * 0.3)
  )::integer;
  
  -- Ensure score is within bounds
  RETURN GREATEST(0, LEAST(100, v_final_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next leads to email (prioritized)
CREATE OR REPLACE FUNCTION get_next_leads_to_email(
  p_campaign_id uuid,
  p_limit integer DEFAULT 50
) RETURNS TABLE (
  lead_id uuid,
  email text,
  business_name text,
  priority_score integer,
  intent_score integer,
  website_health integer,
  recommended_approach text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id as lead_id,
    l.email,
    l.business_name,
    COALESCE(l.priority_score, calculate_lead_priority_score(l.id)) as priority_score,
    COALESCE(l.intent_score, 0) as intent_score,
    COALESCE(whs.overall_score, 50) as website_health,
    CASE 
      WHEN COALESCE(l.intent_score, 0) >= 70 THEN 'high_intent_aggressive'
      WHEN whs.overall_score < 50 THEN 'website_improvement_pitch'
      WHEN COALESCE(l.intent_score, 0) >= 40 THEN 'moderate_interest_nurture'
      ELSE 'standard_outreach'
    END as recommended_approach
  FROM leads l
  LEFT JOIN website_health_scores whs ON whs.lead_id = l.id
  WHERE l.campaign_id = p_campaign_id
    AND l.status NOT IN ('unsubscribed', 'bounced', 'replied')
    AND NOT EXISTS (
      SELECT 1 FROM emails e 
      WHERE e.lead_id = l.id 
      AND e.status IN ('queued', 'sending')
    )
    AND (l.last_contacted_at IS NULL OR l.last_contacted_at < now() - interval '3 days')
  ORDER BY 
    COALESCE(l.priority_score, calculate_lead_priority_score(l.id)) DESC,
    l.intent_score DESC NULLS LAST,
    l.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update priority scores for a campaign
CREATE OR REPLACE FUNCTION update_campaign_priority_scores(
  p_campaign_id uuid
) RETURNS void AS $$
BEGIN
  UPDATE leads
  SET priority_score = calculate_lead_priority_score(id)
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update priority score when intent signals change
CREATE OR REPLACE FUNCTION update_priority_on_intent_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_id IS NOT NULL THEN
    UPDATE leads
    SET priority_score = calculate_lead_priority_score(NEW.lead_id)
    WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_priority_on_intent ON intent_signals;
CREATE TRIGGER trigger_update_priority_on_intent
AFTER INSERT OR UPDATE ON intent_signals
FOR EACH ROW
EXECUTE FUNCTION update_priority_on_intent_change();

-- Trigger to update priority score when website health changes
CREATE OR REPLACE FUNCTION update_priority_on_health_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads
  SET priority_score = calculate_lead_priority_score(NEW.lead_id)
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_priority_on_health ON website_health_scores;
CREATE TRIGGER trigger_update_priority_on_health
AFTER INSERT OR UPDATE ON website_health_scores
FOR EACH ROW
EXECUTE FUNCTION update_priority_on_health_change();
