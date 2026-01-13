/*
  # Fix Missing Indexes and RLS Performance

  1. Performance Optimizations
    - Add missing indexes on all foreign key columns for better query performance
    
  2. RLS Policy Performance
    - Optimize RLS policies to use (select auth.uid()) instead of auth.uid()
    - This prevents re-evaluation for each row

  Important: All changes are backwards compatible
*/

-- ============================================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_generation_insights_lead_id ON public.ai_generation_insights(lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_campaign_id ON public.ai_usage_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_funnel_campaign_id ON public.analytics_funnel(campaign_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_runs_user_id ON public.autopilot_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_schedules_user_id ON public.autopilot_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_tools_cfg_grammar_id ON public.custom_tools(cfg_grammar_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_items_campaign_id ON public.dead_letter_items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_items_reviewed_by ON public.dead_letter_items(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_duplicate_email_registry_campaign_id ON public.duplicate_email_registry(first_seen_campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_health_scores_user_id ON public.email_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_email_priority_queue_email_id ON public.email_priority_queue(email_id);
CREATE INDEX IF NOT EXISTS idx_email_priority_queue_lead_id ON public.email_priority_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_campaign_id ON public.email_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_email_id ON public.email_queue(email_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_lead_id ON public.email_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_send_queue_email_id ON public.email_send_queue(email_id);
CREATE INDEX IF NOT EXISTS idx_email_send_queue_user_id ON public.email_send_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_user_id ON public.idempotency_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_intent_signals_campaign_id ON public.intent_signals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_job_checkpoints_user_id ON public.job_checkpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_multi_source_leads_campaign_id ON public.multi_source_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_multi_source_leads_merged_into ON public.multi_source_leads(merged_into_lead_id);
CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id ON public.notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notifications_email_id ON public.notifications(email_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lead_id ON public.notifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_reply_classifications_email_id ON public.reply_classifications(email_id);
CREATE INDEX IF NOT EXISTS idx_research_jobs_campaign_id ON public.research_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_retry_queue_campaign_id ON public.retry_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_campaign_id ON public.system_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_lead_id ON public.system_logs(lead_id);

-- ============================================================================
-- PART 2: OPTIMIZE RLS POLICIES - Campaign Groups
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own campaign groups" ON public.campaign_groups;
CREATE POLICY "Users can view own campaign groups" ON public.campaign_groups
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own campaign groups" ON public.campaign_groups;
CREATE POLICY "Users can insert own campaign groups" ON public.campaign_groups
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own campaign groups" ON public.campaign_groups;
CREATE POLICY "Users can update own campaign groups" ON public.campaign_groups
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own campaign groups" ON public.campaign_groups;
CREATE POLICY "Users can delete own campaign groups" ON public.campaign_groups
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 3: OPTIMIZE RLS POLICIES - Lead Pipeline Stages
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own pipeline stages" ON public.lead_pipeline_stages;
CREATE POLICY "Users can view own pipeline stages" ON public.lead_pipeline_stages
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own pipeline stages" ON public.lead_pipeline_stages;
CREATE POLICY "Users can insert own pipeline stages" ON public.lead_pipeline_stages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own pipeline stages" ON public.lead_pipeline_stages;
CREATE POLICY "Users can update own pipeline stages" ON public.lead_pipeline_stages
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own pipeline stages" ON public.lead_pipeline_stages;
CREATE POLICY "Users can delete own pipeline stages" ON public.lead_pipeline_stages
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 4: OPTIMIZE RLS POLICIES - Email Health Scores
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own email health scores" ON public.email_health_scores;
CREATE POLICY "Users can view own email health scores" ON public.email_health_scores
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own email health scores" ON public.email_health_scores;
CREATE POLICY "Users can insert own email health scores" ON public.email_health_scores
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own email health scores" ON public.email_health_scores;
CREATE POLICY "Users can update own email health scores" ON public.email_health_scores
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- PART 5: OPTIMIZE RLS POLICIES - Webhooks
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own webhook configs" ON public.webhook_configurations;
CREATE POLICY "Users can view own webhook configs" ON public.webhook_configurations
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own webhook configs" ON public.webhook_configurations;
CREATE POLICY "Users can insert own webhook configs" ON public.webhook_configurations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own webhook configs" ON public.webhook_configurations;
CREATE POLICY "Users can update own webhook configs" ON public.webhook_configurations
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own webhook configs" ON public.webhook_configurations;
CREATE POLICY "Users can delete own webhook configs" ON public.webhook_configurations
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Users can view own webhook deliveries" ON public.webhook_deliveries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM webhook_configurations
      WHERE webhook_configurations.id = webhook_deliveries.webhook_id
      AND webhook_configurations.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Users can insert own webhook deliveries" ON public.webhook_deliveries
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM webhook_configurations
      WHERE webhook_configurations.id = webhook_deliveries.webhook_id
      AND webhook_configurations.user_id = (select auth.uid())
    )
  );
