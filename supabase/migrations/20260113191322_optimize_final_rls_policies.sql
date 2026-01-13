/*
  # Optimize Final RLS Policies

  1. Finish optimizing all remaining RLS policies
  2. Covers: automation_schedules, email_previews, idempotency_keys
  3. Covers: job_checkpoints, dead_letter_items, rate_limit_buckets
  4. Covers: rate_limit_violations, campaign_locks, user_concurrency
  5. Covers: notifications, retry_queue, operation_spans, user_onboarding
*/

-- automation_schedules
DROP POLICY IF EXISTS "Users can view own automation schedules" ON public.automation_schedules;
CREATE POLICY "Users can view own automation schedules" ON public.automation_schedules FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own automation schedules" ON public.automation_schedules;
CREATE POLICY "Users can insert own automation schedules" ON public.automation_schedules FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own automation schedules" ON public.automation_schedules;
CREATE POLICY "Users can update own automation schedules" ON public.automation_schedules FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own automation schedules" ON public.automation_schedules;
CREATE POLICY "Users can delete own automation schedules" ON public.automation_schedules FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- email_previews
DROP POLICY IF EXISTS "Users can view own email previews" ON public.email_previews;
CREATE POLICY "Users can view own email previews" ON public.email_previews FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own email previews" ON public.email_previews;
CREATE POLICY "Users can insert own email previews" ON public.email_previews FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own email previews" ON public.email_previews;
CREATE POLICY "Users can update own email previews" ON public.email_previews FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own email previews" ON public.email_previews;
CREATE POLICY "Users can delete own email previews" ON public.email_previews FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- idempotency_keys
DROP POLICY IF EXISTS "Users can view own idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Users can view own idempotency keys" ON public.idempotency_keys FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Users can insert own idempotency keys" ON public.idempotency_keys FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Users can update own idempotency keys" ON public.idempotency_keys FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

-- job_checkpoints
DROP POLICY IF EXISTS "Users can view own job checkpoints" ON public.job_checkpoints;
CREATE POLICY "Users can view own job checkpoints" ON public.job_checkpoints FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own job checkpoints" ON public.job_checkpoints;
CREATE POLICY "Users can insert own job checkpoints" ON public.job_checkpoints FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own job checkpoints" ON public.job_checkpoints;
CREATE POLICY "Users can update own job checkpoints" ON public.job_checkpoints FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

-- dead_letter_items
DROP POLICY IF EXISTS "Users can view own dead letter items" ON public.dead_letter_items;
CREATE POLICY "Users can view own dead letter items" ON public.dead_letter_items FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- rate_limit_buckets
DROP POLICY IF EXISTS "Users can view own rate limit buckets" ON public.rate_limit_buckets;
CREATE POLICY "Users can view own rate limit buckets" ON public.rate_limit_buckets FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- rate_limit_violations
DROP POLICY IF EXISTS "Users can view own rate limit violations" ON public.rate_limit_violations;
CREATE POLICY "Users can view own rate limit violations" ON public.rate_limit_violations FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- campaign_locks
DROP POLICY IF EXISTS "Users can view locks for own campaigns" ON public.campaign_locks;
CREATE POLICY "Users can view locks for own campaigns" ON public.campaign_locks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_locks.campaign_id AND campaigns.user_id = (select auth.uid())));

-- user_concurrency
DROP POLICY IF EXISTS "Users can view own concurrency" ON public.user_concurrency;
CREATE POLICY "Users can view own concurrency" ON public.user_concurrency FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- retry_queue
DROP POLICY IF EXISTS "Users can view own retry queue items" ON public.retry_queue;
CREATE POLICY "Users can view own retry queue items" ON public.retry_queue FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- operation_spans
DROP POLICY IF EXISTS "Users can view own operation spans" ON public.operation_spans;
CREATE POLICY "Users can view own operation spans" ON public.operation_spans FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- user_onboarding
DROP POLICY IF EXISTS "Users can view own onboarding data" ON public.user_onboarding;
CREATE POLICY "Users can view own onboarding data" ON public.user_onboarding FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can insert own onboarding data" ON public.user_onboarding;
CREATE POLICY "Users can insert own onboarding data" ON public.user_onboarding FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Users can update own onboarding data" ON public.user_onboarding;
CREATE POLICY "Users can update own onboarding data" ON public.user_onboarding FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
