/*
  # Optimize More RLS Policies - Part 1

  1. Continue optimizing RLS policies with (select auth.uid())
  2. Covers: duplicate_email_registry, analytics_funnel, sequence_ab_tests
  3. Covers: reply_classifications, rtrvr_usage_logs, ai_generation_insights
*/

-- duplicate_email_registry
DROP POLICY IF EXISTS "Users can view own duplicate registry" ON public.duplicate_email_registry;
CREATE POLICY "Users can view own duplicate registry" ON public.duplicate_email_registry
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own duplicate registry" ON public.duplicate_email_registry;
CREATE POLICY "Users can insert own duplicate registry" ON public.duplicate_email_registry
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own duplicate registry" ON public.duplicate_email_registry;
CREATE POLICY "Users can update own duplicate registry" ON public.duplicate_email_registry
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- analytics_funnel
DROP POLICY IF EXISTS "Users can view own funnel analytics" ON public.analytics_funnel;
CREATE POLICY "Users can view own funnel analytics" ON public.analytics_funnel
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own funnel analytics" ON public.analytics_funnel;
CREATE POLICY "Users can insert own funnel analytics" ON public.analytics_funnel
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own funnel analytics" ON public.analytics_funnel;
CREATE POLICY "Users can update own funnel analytics" ON public.analytics_funnel
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- sequence_ab_tests
DROP POLICY IF EXISTS "Users can view own AB tests" ON public.sequence_ab_tests;
CREATE POLICY "Users can view own AB tests" ON public.sequence_ab_tests
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own AB tests" ON public.sequence_ab_tests;
CREATE POLICY "Users can insert own AB tests" ON public.sequence_ab_tests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own AB tests" ON public.sequence_ab_tests;
CREATE POLICY "Users can update own AB tests" ON public.sequence_ab_tests
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own AB tests" ON public.sequence_ab_tests;
CREATE POLICY "Users can delete own AB tests" ON public.sequence_ab_tests
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- reply_classifications
DROP POLICY IF EXISTS "Users can view own reply classifications" ON public.reply_classifications;
CREATE POLICY "Users can view own reply classifications" ON public.reply_classifications
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own reply classifications" ON public.reply_classifications;
CREATE POLICY "Users can insert own reply classifications" ON public.reply_classifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own reply classifications" ON public.reply_classifications;
CREATE POLICY "Users can update own reply classifications" ON public.reply_classifications
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own reply classifications" ON public.reply_classifications;
CREATE POLICY "Users can delete own reply classifications" ON public.reply_classifications
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- rtrvr_usage_logs
DROP POLICY IF EXISTS "Users can view own rtrvr usage logs" ON public.rtrvr_usage_logs;
CREATE POLICY "Users can view own rtrvr usage logs" ON public.rtrvr_usage_logs
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own rtrvr usage logs" ON public.rtrvr_usage_logs;
CREATE POLICY "Users can insert own rtrvr usage logs" ON public.rtrvr_usage_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ai_generation_insights
DROP POLICY IF EXISTS "Users can view own AI insights" ON public.ai_generation_insights;
CREATE POLICY "Users can view own AI insights" ON public.ai_generation_insights
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own AI insights" ON public.ai_generation_insights;
CREATE POLICY "Users can insert own AI insights" ON public.ai_generation_insights
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own AI insights" ON public.ai_generation_insights;
CREATE POLICY "Users can delete own AI insights" ON public.ai_generation_insights
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));
