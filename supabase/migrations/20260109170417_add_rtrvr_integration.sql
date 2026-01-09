/*
  # Migrate from Apify to rtrvr.ai Integration

  ## Overview
  Replaces Apify-based scraping with rtrvr.ai and adds support for GPT-5.2 
  Responses API for intelligent data extraction.

  ## Changes to `campaigns` Table
  - Add `rtrvr_settings` (jsonb) - Configuration for rtrvr.ai scraping
  - Add `scraping_provider` (text) - Default 'rtrvr', allows future providers
  - Add `openai_extraction_enabled` (boolean) - Whether to use GPT-5.2 for extraction
  - Migrate data from `apify_settings` to `rtrvr_settings`

  ## New Table: `rtrvr_usage_logs`
  Tracks rtrvr.ai and OpenAI usage for cost monitoring
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `campaign_id` (uuid, references campaigns)
  - `agent_job_id` (uuid, references agent_jobs)
  - `trajectory_id` (text) - rtrvr.ai trajectory ID for tracking
  - `scrape_count` (integer) - Number of pages scraped
  - `total_pages_scraped` (integer)
  - `browser_credits_used` (numeric)
  - `proxy_credits_used` (numeric)
  - `rtrvr_cost_usd` (numeric)
  - `openai_input_tokens` (integer) - GPT-5.2 input tokens
  - `openai_output_tokens` (integer) - GPT-5.2 output tokens
  - `openai_cost_usd` (numeric)
  - `total_cost_usd` (numeric)
  - `request_duration_ms` (integer)
  - `scrape_type` (text) - 'google_maps' | 'website_enrichment'
  - `metadata` (jsonb) - Additional tracking data
  - `created_at` (timestamptz)

  ## Modified Table: `user_ai_preferences`
  - Update ai_model enum to include 'gpt-5.2'

  ## Security
  - Enable RLS on rtrvr_usage_logs
  - Policies restrict access to user's own data
*/

-- Add rtrvr.ai columns to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS rtrvr_settings jsonb DEFAULT '{
  "maxLeads": 50,
  "enableWebsiteEnrichment": true,
  "enableSocialExtraction": true,
  "enableAiExtraction": true,
  "scrapingThoroughness": "standard",
  "extractContacts": true,
  "extractReviews": false,
  "maxReviews": 5
}'::jsonb;

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS scraping_provider text DEFAULT 'rtrvr';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS openai_extraction_enabled boolean DEFAULT true;

-- Migrate existing apify_settings to rtrvr_settings where applicable
DO $$
BEGIN
  UPDATE campaigns
  SET rtrvr_settings = jsonb_build_object(
    'maxLeads', COALESCE((apify_settings->>'maxCrawledPlacesPerSearch')::integer, 50),
    'enableWebsiteEnrichment', COALESCE((apify_settings->>'scrapePlaceDetailPage')::boolean, true),
    'enableSocialExtraction', COALESCE(
      (apify_settings->'scrapeSocialMediaProfiles'->>'facebooks')::boolean OR
      (apify_settings->'scrapeSocialMediaProfiles'->>'instagrams')::boolean,
      true
    ),
    'enableAiExtraction', true,
    'scrapingThoroughness', 'standard',
    'extractContacts', COALESCE((apify_settings->>'scrapeContacts')::boolean, true),
    'extractReviews', COALESCE((apify_settings->>'maxReviews')::integer > 0, false),
    'maxReviews', COALESCE((apify_settings->>'maxReviews')::integer, 5)
  )
  WHERE apify_settings IS NOT NULL 
    AND apify_settings != '{}'::jsonb
    AND rtrvr_settings = '{
      "maxLeads": 50,
      "enableWebsiteEnrichment": true,
      "enableSocialExtraction": true,
      "enableAiExtraction": true,
      "scrapingThoroughness": "standard",
      "extractContacts": true,
      "extractReviews": false,
      "maxReviews": 5
    }'::jsonb;
END $$;

-- Create rtrvr_usage_logs table
CREATE TABLE IF NOT EXISTS rtrvr_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  agent_job_id uuid,
  trajectory_id text,
  scrape_count integer DEFAULT 0,
  total_pages_scraped integer DEFAULT 0,
  browser_credits_used numeric(10,4) DEFAULT 0,
  proxy_credits_used numeric(10,4) DEFAULT 0,
  rtrvr_cost_usd numeric(10,4) DEFAULT 0,
  openai_input_tokens integer DEFAULT 0,
  openai_output_tokens integer DEFAULT 0,
  openai_cost_usd numeric(10,4) DEFAULT 0,
  total_cost_usd numeric(10,4) DEFAULT 0,
  request_duration_ms integer,
  scrape_type text CHECK (scrape_type IN ('google_maps', 'website_enrichment', 'combined')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for rtrvr_usage_logs
CREATE INDEX IF NOT EXISTS idx_rtrvr_usage_logs_user_id ON rtrvr_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rtrvr_usage_logs_campaign_id ON rtrvr_usage_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_rtrvr_usage_logs_created_at ON rtrvr_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rtrvr_usage_logs_scrape_type ON rtrvr_usage_logs(scrape_type);

-- Enable RLS on rtrvr_usage_logs
ALTER TABLE rtrvr_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rtrvr_usage_logs
CREATE POLICY "Users can view own rtrvr usage logs"
  ON rtrvr_usage_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own rtrvr usage logs"
  ON rtrvr_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Service role policy for edge functions
CREATE POLICY "Service role can manage all rtrvr usage logs"
  ON rtrvr_usage_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update user_ai_preferences ai_model constraint to include gpt-5.2
DO $$
BEGIN
  ALTER TABLE user_ai_preferences DROP CONSTRAINT IF EXISTS user_ai_preferences_ai_model_check;
  ALTER TABLE user_ai_preferences ADD CONSTRAINT user_ai_preferences_ai_model_check 
    CHECK (ai_model IN ('gpt-4', 'gpt-3.5', 'gpt-5.2', 'claude'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add column for tracking extraction quality metrics
ALTER TABLE leads ADD COLUMN IF NOT EXISTS extraction_confidence numeric(3,2) DEFAULT 1.0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS extraction_source text DEFAULT 'rtrvr';
