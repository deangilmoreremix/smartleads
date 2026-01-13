/*
  # Optimize More RLS Policies - Part 4

  1. Continue optimizing RLS policies with (select auth.uid())
  2. Covers: compaction_settings, responses_api_conversations
  3. Covers: lead_research, intent_signals, website_health_scores
*/

-- compaction_settings
DROP POLICY IF EXISTS "Users can view own compaction settings" ON public.compaction_settings;
CREATE POLICY "Users can view own compaction settings" ON public.compaction_settings
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own compaction settings" ON public.compaction_settings;
CREATE POLICY "Users can create own compaction settings" ON public.compaction_settings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own compaction settings" ON public.compaction_settings;
CREATE POLICY "Users can update own compaction settings" ON public.compaction_settings
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own compaction settings" ON public.compaction_settings;
CREATE POLICY "Users can delete own compaction settings" ON public.compaction_settings
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- responses_api_conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON public.responses_api_conversations;
CREATE POLICY "Users can view own conversations" ON public.responses_api_conversations
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own conversations" ON public.responses_api_conversations;
CREATE POLICY "Users can create own conversations" ON public.responses_api_conversations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own conversations" ON public.responses_api_conversations;
CREATE POLICY "Users can update own conversations" ON public.responses_api_conversations
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.responses_api_conversations;
CREATE POLICY "Users can delete own conversations" ON public.responses_api_conversations
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- lead_research
DROP POLICY IF EXISTS "Users can view own lead research" ON public.lead_research;
CREATE POLICY "Users can view own lead research" ON public.lead_research
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own lead research" ON public.lead_research;
CREATE POLICY "Users can insert own lead research" ON public.lead_research
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own lead research" ON public.lead_research;
CREATE POLICY "Users can update own lead research" ON public.lead_research
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own lead research" ON public.lead_research;
CREATE POLICY "Users can delete own lead research" ON public.lead_research
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- intent_signals
DROP POLICY IF EXISTS "Users can view own intent signals" ON public.intent_signals;
CREATE POLICY "Users can view own intent signals" ON public.intent_signals
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own intent signals" ON public.intent_signals;
CREATE POLICY "Users can insert own intent signals" ON public.intent_signals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own intent signals" ON public.intent_signals;
CREATE POLICY "Users can update own intent signals" ON public.intent_signals
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own intent signals" ON public.intent_signals;
CREATE POLICY "Users can delete own intent signals" ON public.intent_signals
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- website_health_scores
DROP POLICY IF EXISTS "Users can view own website health scores" ON public.website_health_scores;
CREATE POLICY "Users can view own website health scores" ON public.website_health_scores
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own website health scores" ON public.website_health_scores;
CREATE POLICY "Users can insert own website health scores" ON public.website_health_scores
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own website health scores" ON public.website_health_scores;
CREATE POLICY "Users can update own website health scores" ON public.website_health_scores
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own website health scores" ON public.website_health_scores;
CREATE POLICY "Users can delete own website health scores" ON public.website_health_scores
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));
