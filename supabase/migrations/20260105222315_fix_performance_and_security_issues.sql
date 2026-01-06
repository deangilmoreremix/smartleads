/*
  # Fix Performance and Security Issues

  ## Changes
  
  ### 1. Add Missing Foreign Key Indexes
  - Add indexes on foreign key columns that were missing:
    - ai_prompt_marketplace.user_id
    - analytics_events.email_id
    - analytics_events.lead_id
    - emails.user_id
    - lead_contacts.campaign_id
    - lead_images.user_id
    - lead_reviews.user_id
    - lead_social_profiles.user_id

  ### 2. Optimize RLS Policies
  - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies
  - This prevents per-row re-evaluation and improves query performance at scale
  - Affects all tables with RLS policies

  ### 3. Fix Function Search Path
  - Add `SET search_path = ''` to all functions to make them security definer safe
  - Affects: update_job_progress, update_email_status_from_event, handle_new_user, reset_daily_email_counts, handle_updated_at

  ## Notes
  - Unused indexes warnings are expected for new projects and will be utilized as data grows
  - Auth DB connection strategy must be configured in Supabase dashboard (not via SQL)
*/

-- =============================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_ai_prompt_marketplace_user_id 
  ON public.ai_prompt_marketplace(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_email_id 
  ON public.analytics_events(email_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_lead_id 
  ON public.analytics_events(lead_id);

CREATE INDEX IF NOT EXISTS idx_emails_user_id 
  ON public.emails(user_id);

CREATE INDEX IF NOT EXISTS idx_lead_contacts_campaign_id 
  ON public.lead_contacts(campaign_id);

CREATE INDEX IF NOT EXISTS idx_lead_images_user_id 
  ON public.lead_images(user_id);

CREATE INDEX IF NOT EXISTS idx_lead_reviews_user_id 
  ON public.lead_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_lead_social_profiles_user_id 
  ON public.lead_social_profiles(user_id);

-- =============================================
-- PART 2: OPTIMIZE RLS POLICIES
-- =============================================

-- Drop and recreate all RLS policies with optimized auth.uid() calls

-- profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- subscriptions table
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- campaigns table
DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.campaigns;

CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own campaigns" ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own campaigns" ON public.campaigns
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.campaigns
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- leads table
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- emails table
DROP POLICY IF EXISTS "Users can view own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can insert own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can update own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON public.emails;

CREATE POLICY "Users can view own emails" ON public.emails
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own emails" ON public.emails
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own emails" ON public.emails
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own emails" ON public.emails
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- user_settings table
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- analytics_events table
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_events;

CREATE POLICY "Users can view own analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own analytics" ON public.analytics_events
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- campaign_jobs table
DROP POLICY IF EXISTS "Users can view own campaign jobs" ON public.campaign_jobs;
DROP POLICY IF EXISTS "Users can insert own campaign jobs" ON public.campaign_jobs;
DROP POLICY IF EXISTS "Users can update own campaign jobs" ON public.campaign_jobs;
DROP POLICY IF EXISTS "Users can delete own campaign jobs" ON public.campaign_jobs;

CREATE POLICY "Users can view own campaign jobs" ON public.campaign_jobs
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own campaign jobs" ON public.campaign_jobs
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own campaign jobs" ON public.campaign_jobs
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own campaign jobs" ON public.campaign_jobs
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- email_templates table
DROP POLICY IF EXISTS "Users can view own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON public.email_templates;

CREATE POLICY "Users can view own templates" ON public.email_templates
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own templates" ON public.email_templates
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own templates" ON public.email_templates
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own templates" ON public.email_templates
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- gmail_accounts table
DROP POLICY IF EXISTS "Users can view own gmail accounts" ON public.gmail_accounts;
DROP POLICY IF EXISTS "Users can insert own gmail accounts" ON public.gmail_accounts;
DROP POLICY IF EXISTS "Users can update own gmail accounts" ON public.gmail_accounts;
DROP POLICY IF EXISTS "Users can delete own gmail accounts" ON public.gmail_accounts;

CREATE POLICY "Users can view own gmail accounts" ON public.gmail_accounts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own gmail accounts" ON public.gmail_accounts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own gmail accounts" ON public.gmail_accounts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own gmail accounts" ON public.gmail_accounts
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- lead_contacts table
DROP POLICY IF EXISTS "Users can view own lead contacts" ON public.lead_contacts;
DROP POLICY IF EXISTS "Users can insert own lead contacts" ON public.lead_contacts;
DROP POLICY IF EXISTS "Users can update own lead contacts" ON public.lead_contacts;
DROP POLICY IF EXISTS "Users can delete own lead contacts" ON public.lead_contacts;

CREATE POLICY "Users can view own lead contacts" ON public.lead_contacts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own lead contacts" ON public.lead_contacts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own lead contacts" ON public.lead_contacts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own lead contacts" ON public.lead_contacts
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- lead_social_profiles table
DROP POLICY IF EXISTS "Users can view own social profiles" ON public.lead_social_profiles;
DROP POLICY IF EXISTS "Users can insert own social profiles" ON public.lead_social_profiles;
DROP POLICY IF EXISTS "Users can update own social profiles" ON public.lead_social_profiles;
DROP POLICY IF EXISTS "Users can delete own social profiles" ON public.lead_social_profiles;

CREATE POLICY "Users can view own social profiles" ON public.lead_social_profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own social profiles" ON public.lead_social_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own social profiles" ON public.lead_social_profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own social profiles" ON public.lead_social_profiles
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- lead_reviews table
DROP POLICY IF EXISTS "Users can view own lead reviews" ON public.lead_reviews;
DROP POLICY IF EXISTS "Users can insert own lead reviews" ON public.lead_reviews;
DROP POLICY IF EXISTS "Users can update own lead reviews" ON public.lead_reviews;
DROP POLICY IF EXISTS "Users can delete own lead reviews" ON public.lead_reviews;

CREATE POLICY "Users can view own lead reviews" ON public.lead_reviews
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own lead reviews" ON public.lead_reviews
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own lead reviews" ON public.lead_reviews
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own lead reviews" ON public.lead_reviews
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- lead_images table
DROP POLICY IF EXISTS "Users can view own lead images" ON public.lead_images;
DROP POLICY IF EXISTS "Users can insert own lead images" ON public.lead_images;
DROP POLICY IF EXISTS "Users can update own lead images" ON public.lead_images;
DROP POLICY IF EXISTS "Users can delete own lead images" ON public.lead_images;

CREATE POLICY "Users can view own lead images" ON public.lead_images
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own lead images" ON public.lead_images
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own lead images" ON public.lead_images
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own lead images" ON public.lead_images
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ai_prompt_marketplace table
DROP POLICY IF EXISTS "Users can view public marketplace prompts" ON public.ai_prompt_marketplace;
DROP POLICY IF EXISTS "Users can create marketplace prompts" ON public.ai_prompt_marketplace;
DROP POLICY IF EXISTS "Users can update own marketplace prompts" ON public.ai_prompt_marketplace;
DROP POLICY IF EXISTS "Users can delete own marketplace prompts" ON public.ai_prompt_marketplace;

CREATE POLICY "Users can view public marketplace prompts" ON public.ai_prompt_marketplace
  FOR SELECT TO authenticated
  USING (is_public = true OR (select auth.uid()) = user_id);

CREATE POLICY "Users can create marketplace prompts" ON public.ai_prompt_marketplace
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own marketplace prompts" ON public.ai_prompt_marketplace
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own marketplace prompts" ON public.ai_prompt_marketplace
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- template_variants table
DROP POLICY IF EXISTS "Users can view own template variants" ON public.template_variants;
DROP POLICY IF EXISTS "Users can create template variants" ON public.template_variants;
DROP POLICY IF EXISTS "Users can update own template variants" ON public.template_variants;
DROP POLICY IF EXISTS "Users can delete own template variants" ON public.template_variants;

CREATE POLICY "Users can view own template variants" ON public.template_variants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = template_variants.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create template variants" ON public.template_variants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = template_variants.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own template variants" ON public.template_variants
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = template_variants.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = template_variants.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own template variants" ON public.template_variants
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = template_variants.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

-- user_ai_preferences table
DROP POLICY IF EXISTS "Users can view own AI preferences" ON public.user_ai_preferences;
DROP POLICY IF EXISTS "Users can create own AI preferences" ON public.user_ai_preferences;
DROP POLICY IF EXISTS "Users can update own AI preferences" ON public.user_ai_preferences;
DROP POLICY IF EXISTS "Users can delete own AI preferences" ON public.user_ai_preferences;

CREATE POLICY "Users can view own AI preferences" ON public.user_ai_preferences
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own AI preferences" ON public.user_ai_preferences
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own AI preferences" ON public.user_ai_preferences
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own AI preferences" ON public.user_ai_preferences
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ai_generation_history table
DROP POLICY IF EXISTS "Users can view own generation history" ON public.ai_generation_history;
DROP POLICY IF EXISTS "Users can create generation history" ON public.ai_generation_history;
DROP POLICY IF EXISTS "Users can update own generation history" ON public.ai_generation_history;
DROP POLICY IF EXISTS "Users can delete own generation history" ON public.ai_generation_history;

CREATE POLICY "Users can view own generation history" ON public.ai_generation_history
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create generation history" ON public.ai_generation_history
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own generation history" ON public.ai_generation_history
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own generation history" ON public.ai_generation_history
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ai_prompt_suggestions table
DROP POLICY IF EXISTS "Users can view suggestions for own templates" ON public.ai_prompt_suggestions;
DROP POLICY IF EXISTS "System can create suggestions" ON public.ai_prompt_suggestions;
DROP POLICY IF EXISTS "Users can update suggestions for own templates" ON public.ai_prompt_suggestions;
DROP POLICY IF EXISTS "Users can delete suggestions for own templates" ON public.ai_prompt_suggestions;

CREATE POLICY "Users can view suggestions for own templates" ON public.ai_prompt_suggestions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = ai_prompt_suggestions.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

CREATE POLICY "System can create suggestions" ON public.ai_prompt_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update suggestions for own templates" ON public.ai_prompt_suggestions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = ai_prompt_suggestions.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = ai_prompt_suggestions.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete suggestions for own templates" ON public.ai_prompt_suggestions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = ai_prompt_suggestions.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

-- agent_jobs table
DROP POLICY IF EXISTS "Users can view own agent jobs" ON public.agent_jobs;
DROP POLICY IF EXISTS "Users can insert own agent jobs" ON public.agent_jobs;
DROP POLICY IF EXISTS "Users can update own agent jobs" ON public.agent_jobs;

CREATE POLICY "Users can view own agent jobs" ON public.agent_jobs
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own agent jobs" ON public.agent_jobs
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own agent jobs" ON public.agent_jobs
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- template_performance_metrics table
DROP POLICY IF EXISTS "Users can view metrics for own templates" ON public.template_performance_metrics;
DROP POLICY IF EXISTS "System can create performance metrics" ON public.template_performance_metrics;
DROP POLICY IF EXISTS "System can update performance metrics" ON public.template_performance_metrics;
DROP POLICY IF EXISTS "Users can delete metrics for own templates" ON public.template_performance_metrics;

CREATE POLICY "Users can view metrics for own templates" ON public.template_performance_metrics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = template_performance_metrics.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

CREATE POLICY "System can create performance metrics" ON public.template_performance_metrics
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update performance metrics" ON public.template_performance_metrics
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete metrics for own templates" ON public.template_performance_metrics
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates 
      WHERE email_templates.id = template_performance_metrics.template_id 
      AND email_templates.user_id = (select auth.uid())
    )
  );

-- email_tracking_events table
DROP POLICY IF EXISTS "Users can view tracking events for own emails" ON public.email_tracking_events;
DROP POLICY IF EXISTS "System can create tracking events" ON public.email_tracking_events;

CREATE POLICY "Users can view tracking events for own emails" ON public.email_tracking_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM emails 
      WHERE emails.id = email_tracking_events.email_id 
      AND emails.user_id = (select auth.uid())
    )
  );

CREATE POLICY "System can create tracking events" ON public.email_tracking_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- agent_progress_logs table
DROP POLICY IF EXISTS "Users can view logs for their jobs" ON public.agent_progress_logs;

CREATE POLICY "Users can view logs for their jobs" ON public.agent_progress_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_jobs 
      WHERE agent_jobs.id = agent_progress_logs.job_id 
      AND agent_jobs.user_id = (select auth.uid())
    )
  );

-- unsubscribes table
DROP POLICY IF EXISTS "Users can view own unsubscribes" ON public.unsubscribes;

CREATE POLICY "Users can view own unsubscribes" ON public.unsubscribes
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- =============================================
-- PART 3: FIX FUNCTION SEARCH PATH
-- =============================================

-- Fix update_job_progress function
CREATE OR REPLACE FUNCTION public.update_job_progress(
  p_job_id uuid,
  p_status text,
  p_current_step text DEFAULT NULL,
  p_total_steps integer DEFAULT NULL,
  p_completed_steps integer DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.agent_jobs
  SET 
    status = p_status,
    current_step = COALESCE(p_current_step, current_step),
    total_steps = COALESCE(p_total_steps, total_steps),
    completed_steps = COALESCE(p_completed_steps, completed_steps),
    error_message = p_error_message,
    updated_at = now()
  WHERE id = p_job_id;
END;
$$;

-- Fix update_email_status_from_event function
CREATE OR REPLACE FUNCTION public.update_email_status_from_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.event_type = 'opened' THEN
    UPDATE public.emails
    SET status = 'opened', updated_at = now()
    WHERE id = NEW.email_id AND status = 'sent';
  ELSIF NEW.event_type = 'clicked' THEN
    UPDATE public.emails
    SET status = 'clicked', updated_at = now()
    WHERE id = NEW.email_id;
  ELSIF NEW.event_type = 'bounced' THEN
    UPDATE public.emails
    SET status = 'bounced', updated_at = now()
    WHERE id = NEW.email_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, now())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Fix reset_daily_email_counts function
CREATE OR REPLACE FUNCTION public.reset_daily_email_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.gmail_accounts
  SET 
    daily_sent_count = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE
    OR last_reset_date IS NULL;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;