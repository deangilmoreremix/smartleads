/*
  # Add Lead Intelligence Features
  
  This migration adds comprehensive lead intelligence capabilities including:
  
  1. New Tables
    - `lead_research` - Deep research data for each lead (website content, team members, tech stack)
    - `intent_signals` - Buying signals detected from various sources (job postings, funding, reviews)
    - `website_health_scores` - SEO and technical health scores for lead websites
    - `competitor_tracking` - Track competitors for market intelligence
    - `scraping_templates` - User-defined custom scraping configurations
    - `multi_source_leads` - Leads aggregated from multiple platforms
  
  2. Security
    - RLS enabled on all new tables
    - Policies for authenticated users to access their own data
  
  3. Indexes
    - Performance indexes on frequently queried columns
*/

-- Lead Research table for deep website analysis
CREATE TABLE IF NOT EXISTS lead_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Website content analysis
  website_content text,
  main_services jsonb DEFAULT '[]'::jsonb,
  unique_value_proposition text,
  recent_blog_posts jsonb DEFAULT '[]'::jsonb,
  recent_news jsonb DEFAULT '[]'::jsonb,
  
  -- Team and company info
  team_members jsonb DEFAULT '[]'::jsonb,
  company_size_estimate text,
  founding_year integer,
  tech_stack jsonb DEFAULT '[]'::jsonb,
  
  -- Pain points and opportunities
  identified_pain_points jsonb DEFAULT '[]'::jsonb,
  conversation_starters jsonb DEFAULT '[]'::jsonb,
  
  -- Decision maker discovery
  decision_makers jsonb DEFAULT '[]'::jsonb,
  
  -- Research metadata
  research_depth text DEFAULT 'basic' CHECK (research_depth IN ('basic', 'standard', 'deep')),
  pages_analyzed integer DEFAULT 0,
  research_cost_usd numeric(10,4) DEFAULT 0,
  last_researched_at timestamptz,
  research_status text DEFAULT 'pending' CHECK (research_status IN ('pending', 'in_progress', 'completed', 'failed')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Intent Signals table for buying signal detection
CREATE TABLE IF NOT EXISTS intent_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Signal details
  signal_type text NOT NULL CHECK (signal_type IN (
    'job_posting', 'funding_announcement', 'expansion_news', 
    'negative_review', 'technology_adoption', 'leadership_change',
    'acquisition', 'partnership', 'product_launch', 'hiring_surge'
  )),
  signal_strength text DEFAULT 'medium' CHECK (signal_strength IN ('low', 'medium', 'high', 'critical')),
  
  -- Signal content
  title text NOT NULL,
  description text,
  source_url text,
  source_platform text,
  
  -- Company info (if not linked to lead)
  company_name text,
  company_website text,
  company_location text,
  
  -- Metadata
  detected_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_actionable boolean DEFAULT true,
  action_taken boolean DEFAULT false,
  action_notes text,
  
  -- Relevance scoring
  relevance_score integer DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  matched_keywords jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamptz DEFAULT now()
);

-- Website Health Scores table
CREATE TABLE IF NOT EXISTS website_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Overall scores
  overall_score integer DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  seo_score integer DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  mobile_score integer DEFAULT 0 CHECK (mobile_score >= 0 AND mobile_score <= 100),
  security_score integer DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
  performance_score integer DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  
  -- SEO details
  has_meta_title boolean DEFAULT false,
  has_meta_description boolean DEFAULT false,
  has_h1_tag boolean DEFAULT false,
  has_structured_data boolean DEFAULT false,
  has_sitemap boolean DEFAULT false,
  has_robots_txt boolean DEFAULT false,
  
  -- Security details
  has_ssl boolean DEFAULT false,
  ssl_expiry_date date,
  has_security_headers boolean DEFAULT false,
  
  -- Performance details
  page_load_time_ms integer,
  total_page_size_kb integer,
  image_optimization_score integer,
  
  -- Design and content
  copyright_year integer,
  last_blog_update date,
  design_age_estimate text,
  has_contact_form boolean DEFAULT false,
  has_live_chat boolean DEFAULT false,
  
  -- Technology detection
  detected_cms text,
  detected_analytics jsonb DEFAULT '[]'::jsonb,
  detected_marketing_tools jsonb DEFAULT '[]'::jsonb,
  detected_ecommerce text,
  
  -- Issues and recommendations
  critical_issues jsonb DEFAULT '[]'::jsonb,
  improvement_opportunities jsonb DEFAULT '[]'::jsonb,
  
  -- Conversion potential
  conversion_potential text DEFAULT 'medium' CHECK (conversion_potential IN ('low', 'medium', 'high', 'very_high')),
  recommended_services jsonb DEFAULT '[]'::jsonb,
  
  last_checked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Competitor Tracking table
CREATE TABLE IF NOT EXISTS competitor_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Competitor info
  competitor_name text NOT NULL,
  competitor_website text NOT NULL,
  competitor_description text,
  
  -- Tracked data
  pricing_tiers jsonb DEFAULT '[]'::jsonb,
  services_offered jsonb DEFAULT '[]'::jsonb,
  target_market text,
  unique_features jsonb DEFAULT '[]'::jsonb,
  
  -- Marketing intelligence
  marketing_channels jsonb DEFAULT '[]'::jsonb,
  content_strategy_notes text,
  social_media_presence jsonb DEFAULT '{}'::jsonb,
  
  -- Monitoring settings
  monitor_pricing boolean DEFAULT true,
  monitor_services boolean DEFAULT true,
  monitor_hiring boolean DEFAULT false,
  alert_on_changes boolean DEFAULT true,
  
  -- Change history
  last_scraped_at timestamptz,
  last_change_detected_at timestamptz,
  change_history jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Custom Scraping Templates table
CREATE TABLE IF NOT EXISTS scraping_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template info
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  industry text,
  
  -- Configuration
  target_url_pattern text,
  extraction_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  navigation_steps jsonb DEFAULT '[]'::jsonb,
  
  -- Settings
  use_agent_api boolean DEFAULT false,
  wait_for_selector text,
  timeout_ms integer DEFAULT 30000,
  proxy_mode text DEFAULT 'default',
  
  -- Performance
  avg_extraction_time_ms integer,
  success_rate numeric(5,2),
  total_uses integer DEFAULT 0,
  
  -- Sharing
  is_public boolean DEFAULT false,
  is_marketplace boolean DEFAULT false,
  marketplace_price numeric(10,2),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Multi-source leads table for aggregation
CREATE TABLE IF NOT EXISTS multi_source_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Source information
  source_platform text NOT NULL CHECK (source_platform IN (
    'google_maps', 'yelp', 'yellow_pages', 'bbb', 
    'linkedin', 'crunchbase', 'industry_directory', 'custom'
  )),
  source_url text,
  source_id text,
  
  -- Raw data from source
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Normalized data
  business_name text,
  email text,
  phone text,
  website text,
  address text,
  
  -- Source-specific data
  source_rating numeric(3,2),
  source_review_count integer,
  source_categories jsonb DEFAULT '[]'::jsonb,
  
  -- Deduplication
  is_merged boolean DEFAULT false,
  merged_into_lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  confidence_score integer DEFAULT 50,
  
  scraped_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Research jobs table for tracking async research tasks
CREATE TABLE IF NOT EXISTS research_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Job configuration
  job_type text NOT NULL CHECK (job_type IN (
    'deep_research', 'intent_signals', 'website_health', 
    'competitor_analysis', 'multi_source_scrape', 'bulk_enrichment'
  )),
  
  -- Status tracking
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress_percentage integer DEFAULT 0,
  
  -- Configuration
  config jsonb DEFAULT '{}'::jsonb,
  
  -- Results
  result_data jsonb,
  error_message text,
  
  -- Cost tracking
  rtrvr_credits_used integer DEFAULT 0,
  openai_tokens_used integer DEFAULT 0,
  total_cost_usd numeric(10,4) DEFAULT 0,
  
  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE lead_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_source_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_research
CREATE POLICY "Users can view own lead research"
  ON lead_research FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lead research"
  ON lead_research FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lead research"
  ON lead_research FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lead research"
  ON lead_research FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for intent_signals
CREATE POLICY "Users can view own intent signals"
  ON intent_signals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intent signals"
  ON intent_signals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intent signals"
  ON intent_signals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own intent signals"
  ON intent_signals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for website_health_scores
CREATE POLICY "Users can view own website health scores"
  ON website_health_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own website health scores"
  ON website_health_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own website health scores"
  ON website_health_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own website health scores"
  ON website_health_scores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for competitor_tracking
CREATE POLICY "Users can view own competitor tracking"
  ON competitor_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitor tracking"
  ON competitor_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitor tracking"
  ON competitor_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitor tracking"
  ON competitor_tracking FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for scraping_templates
CREATE POLICY "Users can view own or public scraping templates"
  ON scraping_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own scraping templates"
  ON scraping_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scraping templates"
  ON scraping_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scraping templates"
  ON scraping_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for multi_source_leads
CREATE POLICY "Users can view own multi source leads"
  ON multi_source_leads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own multi source leads"
  ON multi_source_leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own multi source leads"
  ON multi_source_leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own multi source leads"
  ON multi_source_leads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for research_jobs
CREATE POLICY "Users can view own research jobs"
  ON research_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research jobs"
  ON research_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own research jobs"
  ON research_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own research jobs"
  ON research_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_lead_research_lead_id ON lead_research(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_research_user_id ON lead_research(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_research_status ON lead_research(research_status);

CREATE INDEX IF NOT EXISTS idx_intent_signals_user_id ON intent_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_intent_signals_lead_id ON intent_signals(lead_id);
CREATE INDEX IF NOT EXISTS idx_intent_signals_type ON intent_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_intent_signals_strength ON intent_signals(signal_strength);
CREATE INDEX IF NOT EXISTS idx_intent_signals_actionable ON intent_signals(is_actionable) WHERE is_actionable = true;

CREATE INDEX IF NOT EXISTS idx_website_health_lead_id ON website_health_scores(lead_id);
CREATE INDEX IF NOT EXISTS idx_website_health_user_id ON website_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_website_health_potential ON website_health_scores(conversion_potential);

CREATE INDEX IF NOT EXISTS idx_competitor_user_id ON competitor_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_website ON competitor_tracking(competitor_website);

CREATE INDEX IF NOT EXISTS idx_scraping_templates_user_id ON scraping_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_templates_public ON scraping_templates(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_multi_source_user_id ON multi_source_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_multi_source_platform ON multi_source_leads(source_platform);
CREATE INDEX IF NOT EXISTS idx_multi_source_lead_id ON multi_source_leads(lead_id);

CREATE INDEX IF NOT EXISTS idx_research_jobs_user_id ON research_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_research_jobs_lead_id ON research_jobs(lead_id);
CREATE INDEX IF NOT EXISTS idx_research_jobs_status ON research_jobs(status);

-- Add new columns to leads table for enhanced data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'research_completed'
  ) THEN
    ALTER TABLE leads ADD COLUMN research_completed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'website_health_checked'
  ) THEN
    ALTER TABLE leads ADD COLUMN website_health_checked boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'intent_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN intent_score integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'sources_count'
  ) THEN
    ALTER TABLE leads ADD COLUMN sources_count integer DEFAULT 1;
  END IF;
END $$;

-- Function to update lead intent score based on signals
CREATE OR REPLACE FUNCTION update_lead_intent_score()
RETURNS TRIGGER AS $$
DECLARE
  total_score integer;
BEGIN
  SELECT COALESCE(AVG(relevance_score), 0)::integer
  INTO total_score
  FROM intent_signals
  WHERE lead_id = NEW.lead_id AND is_actionable = true;
  
  UPDATE leads
  SET intent_score = total_score
  WHERE id = NEW.lead_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update intent scores
DROP TRIGGER IF EXISTS trigger_update_intent_score ON intent_signals;
CREATE TRIGGER trigger_update_intent_score
AFTER INSERT OR UPDATE ON intent_signals
FOR EACH ROW
WHEN (NEW.lead_id IS NOT NULL)
EXECUTE FUNCTION update_lead_intent_score();
