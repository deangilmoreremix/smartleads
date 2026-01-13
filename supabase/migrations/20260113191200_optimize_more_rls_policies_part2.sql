/*
  # Optimize More RLS Policies - Part 2

  1. Continue optimizing RLS policies with (select auth.uid())
  2. Covers: file_uploads, email_attachments, ai_usage_tracking
  3. Covers: email_sequence_steps, lead_sequence_progress
*/

-- file_uploads
DROP POLICY IF EXISTS "Users can view own file uploads" ON public.file_uploads;
CREATE POLICY "Users can view own file uploads" ON public.file_uploads
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own file uploads" ON public.file_uploads;
CREATE POLICY "Users can insert own file uploads" ON public.file_uploads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own file uploads" ON public.file_uploads;
CREATE POLICY "Users can update own file uploads" ON public.file_uploads
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own file uploads" ON public.file_uploads;
CREATE POLICY "Users can delete own file uploads" ON public.file_uploads
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- email_attachments
DROP POLICY IF EXISTS "Users can view own email attachments" ON public.email_attachments;
CREATE POLICY "Users can view own email attachments" ON public.email_attachments
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own email attachments" ON public.email_attachments;
CREATE POLICY "Users can insert own email attachments" ON public.email_attachments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own email attachments" ON public.email_attachments;
CREATE POLICY "Users can update own email attachments" ON public.email_attachments
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own email attachments" ON public.email_attachments;
CREATE POLICY "Users can delete own email attachments" ON public.email_attachments
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ai_usage_tracking
DROP POLICY IF EXISTS "Users can view own usage" ON public.ai_usage_tracking;
CREATE POLICY "Users can view own usage" ON public.ai_usage_tracking
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own usage" ON public.ai_usage_tracking;
CREATE POLICY "Users can insert own usage" ON public.ai_usage_tracking
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- email_sequence_steps
DROP POLICY IF EXISTS "Users can view own campaign sequence steps" ON public.email_sequence_steps;
CREATE POLICY "Users can view own campaign sequence steps" ON public.email_sequence_steps
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own campaign sequence steps" ON public.email_sequence_steps;
CREATE POLICY "Users can insert own campaign sequence steps" ON public.email_sequence_steps
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own campaign sequence steps" ON public.email_sequence_steps;
CREATE POLICY "Users can update own campaign sequence steps" ON public.email_sequence_steps
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own campaign sequence steps" ON public.email_sequence_steps;
CREATE POLICY "Users can delete own campaign sequence steps" ON public.email_sequence_steps
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = (select auth.uid())
    )
  );

-- lead_sequence_progress
DROP POLICY IF EXISTS "Users can view own lead sequence progress" ON public.lead_sequence_progress;
CREATE POLICY "Users can view own lead sequence progress" ON public.lead_sequence_progress
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_sequence_progress.lead_id
      AND leads.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own lead sequence progress" ON public.lead_sequence_progress;
CREATE POLICY "Users can insert own lead sequence progress" ON public.lead_sequence_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_sequence_progress.lead_id
      AND leads.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own lead sequence progress" ON public.lead_sequence_progress;
CREATE POLICY "Users can update own lead sequence progress" ON public.lead_sequence_progress
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_sequence_progress.lead_id
      AND leads.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_sequence_progress.lead_id
      AND leads.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own lead sequence progress" ON public.lead_sequence_progress;
CREATE POLICY "Users can delete own lead sequence progress" ON public.lead_sequence_progress
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_sequence_progress.lead_id
      AND leads.user_id = (select auth.uid())
    )
  );
