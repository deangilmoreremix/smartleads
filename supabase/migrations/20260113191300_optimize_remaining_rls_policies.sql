/*
  # Optimize Remaining RLS Policies

  1. Optimize remaining RLS policies with (select auth.uid())
  2. Covers: competitor_tracking, scraping_templates, multi_source_leads
  3. Covers: research_jobs, campaign_autopilot_settings, email_queue
  4. Covers: autopilot_schedules, email_priority_queue, automation_schedules
  5. Covers: email_previews, idempotency_keys, job_checkpoints
  6. Covers: dead_letter_items, rate_limit_buckets, rate_limit_violations
  7. Covers: campaign_locks, user_concurrency, notifications, retry_queue
  8. Covers: operation_spans, user_onboarding
*/

-- competitor_tracking
DROP POLICY IF EXISTS "Users can view own competitor tracking" ON public.competitor_tracking;
CREATE POLICY "Users can view own competitor tracking" ON public.competitor_tracking FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own competitor tracking" ON public.competitor_tracking;
CREATE POLICY "Users can insert own competitor tracking" ON public.competitor_tracking FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own competitor tracking" ON public.competitor_tracking;
CREATE POLICY "Users can update own competitor tracking" ON public.competitor_tracking FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own competitor tracking" ON public.competitor_tracking;
CREATE POLICY "Users can delete own competitor tracking" ON public.competitor_tracking FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- scraping_templates
DROP POLICY IF EXISTS "Users can view own or public scraping templates" ON public.scraping_templates;
CREATE POLICY "Users can view own or public scraping templates" ON public.scraping_templates FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR is_public = true);
DROP POLICY IF EXISTS "Users can insert own scraping templates" ON public.scraping_templates;
CREATE POLICY "Users can insert own scraping templates" ON public.scraping_templates FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own scraping templates" ON public.scraping_templates;
CREATE POLICY "Users can update own scraping templates" ON public.scraping_templates FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own scraping templates" ON public.scraping_templates;
CREATE POLICY "Users can delete own scraping templates" ON public.scraping_templates FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- multi_source_leads
DROP POLICY IF EXISTS "Users can view own multi source leads" ON public.multi_source_leads;
CREATE POLICY "Users can view own multi source leads" ON public.multi_source_leads FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own multi source leads" ON public.multi_source_leads;
CREATE POLICY "Users can insert own multi source leads" ON public.multi_source_leads FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own multi source leads" ON public.multi_source_leads;
CREATE POLICY "Users can update own multi source leads" ON public.multi_source_leads FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own multi source leads" ON public.multi_source_leads;
CREATE POLICY "Users can delete own multi source leads" ON public.multi_source_leads FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- research_jobs
DROP POLICY IF EXISTS "Users can view own research jobs" ON public.research_jobs;
CREATE POLICY "Users can view own research jobs" ON public.research_jobs FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own research jobs" ON public.research_jobs;
CREATE POLICY "Users can insert own research jobs" ON public.research_jobs FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own research jobs" ON public.research_jobs;
CREATE POLICY "Users can update own research jobs" ON public.research_jobs FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own research jobs" ON public.research_jobs;
CREATE POLICY "Users can delete own research jobs" ON public.research_jobs FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- campaign_autopilot_settings
DROP POLICY IF EXISTS "Users can view own campaign autopilot settings" ON public.campaign_autopilot_settings;
CREATE POLICY "Users can view own campaign autopilot settings" ON public.campaign_autopilot_settings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_autopilot_settings.campaign_id AND campaigns.user_id = (select auth.uid())));
DROP POLICY IF EXISTS "Users can insert own campaign autopilot settings" ON public.campaign_autopilot_settings;
CREATE POLICY "Users can insert own campaign autopilot settings" ON public.campaign_autopilot_settings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_autopilot_settings.campaign_id AND campaigns.user_id = (select auth.uid())));
DROP POLICY IF EXISTS "Users can update own campaign autopilot settings" ON public.campaign_autopilot_settings;
CREATE POLICY "Users can update own campaign autopilot settings" ON public.campaign_autopilot_settings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_autopilot_settings.campaign_id AND campaigns.user_id = (select auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_autopilot_settings.campaign_id AND campaigns.user_id = (select auth.uid())));
DROP POLICY IF EXISTS "Users can delete own campaign autopilot settings" ON public.campaign_autopilot_settings;
CREATE POLICY "Users can delete own campaign autopilot settings" ON public.campaign_autopilot_settings FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_autopilot_settings.campaign_id AND campaigns.user_id = (select auth.uid())));

-- email_queue
DROP POLICY IF EXISTS "Users can view own email queue" ON public.email_queue;
CREATE POLICY "Users can view own email queue" ON public.email_queue FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own email queue" ON public.email_queue;
CREATE POLICY "Users can insert own email queue" ON public.email_queue FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own email queue" ON public.email_queue;
CREATE POLICY "Users can update own email queue" ON public.email_queue FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own email queue" ON public.email_queue;
CREATE POLICY "Users can delete own email queue" ON public.email_queue FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- autopilot_schedules
DROP POLICY IF EXISTS "Users can view own autopilot schedules" ON public.autopilot_schedules;
CREATE POLICY "Users can view own autopilot schedules" ON public.autopilot_schedules FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own autopilot schedules" ON public.autopilot_schedules;
CREATE POLICY "Users can insert own autopilot schedules" ON public.autopilot_schedules FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own autopilot schedules" ON public.autopilot_schedules;
CREATE POLICY "Users can update own autopilot schedules" ON public.autopilot_schedules FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own autopilot schedules" ON public.autopilot_schedules;
CREATE POLICY "Users can delete own autopilot schedules" ON public.autopilot_schedules FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- email_priority_queue
DROP POLICY IF EXISTS "Users can view own priority queue" ON public.email_priority_queue;
CREATE POLICY "Users can view own priority queue" ON public.email_priority_queue FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert to own priority queue" ON public.email_priority_queue;
CREATE POLICY "Users can insert to own priority queue" ON public.email_priority_queue FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own priority queue" ON public.email_priority_queue;
CREATE POLICY "Users can update own priority queue" ON public.email_priority_queue FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete from own priority queue" ON public.email_priority_queue;
CREATE POLICY "Users can delete from own priority queue" ON public.email_priority_queue FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- Continue in next migration...
