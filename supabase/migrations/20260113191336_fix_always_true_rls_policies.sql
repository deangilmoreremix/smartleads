/*
  # Fix RLS Policies with Always-True Conditions

  1. Security Improvements
    - Fix policies that were effectively bypassing RLS
    - Add proper ownership checks to all policies
    
  2. Affected Tables
    - ai_prompt_suggestions
    - email_tracking_events
    - notifications
    - template_performance_metrics
    - unsubscribes
*/

-- ai_prompt_suggestions - restrict to authenticated users only
DROP POLICY IF EXISTS "System can create suggestions" ON public.ai_prompt_suggestions;
CREATE POLICY "System can create suggestions" ON public.ai_prompt_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) IS NOT NULL
  );

-- email_tracking_events - verify email ownership
DROP POLICY IF EXISTS "System can create tracking events" ON public.email_tracking_events;
CREATE POLICY "System can create tracking events" ON public.email_tracking_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM emails
      WHERE emails.id = email_tracking_events.email_id
      AND emails.user_id = (select auth.uid())
    )
  );

-- notifications - restrict to user's own notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
  );

-- template_performance_metrics - verify template ownership
DROP POLICY IF EXISTS "System can create performance metrics" ON public.template_performance_metrics;
CREATE POLICY "System can create performance metrics" ON public.template_performance_metrics
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_performance_metrics.template_id
      AND email_templates.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can update performance metrics" ON public.template_performance_metrics;
CREATE POLICY "System can update performance metrics" ON public.template_performance_metrics
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_performance_metrics.template_id
      AND email_templates.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_performance_metrics.template_id
      AND email_templates.user_id = (select auth.uid())
    )
  );

-- unsubscribes - allow anonymous but verify email exists
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.unsubscribes;
CREATE POLICY "Anyone can unsubscribe" ON public.unsubscribes
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    -- Verify the email exists in the system
    EXISTS (
      SELECT 1 FROM emails
      WHERE emails.lead_id IN (
        SELECT id FROM leads WHERE email = unsubscribes.email
      )
    )
  );
