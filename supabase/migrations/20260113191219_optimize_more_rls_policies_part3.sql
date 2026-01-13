/*
  # Optimize More RLS Policies - Part 3

  1. Continue optimizing RLS policies with (select auth.uid())
  2. Covers: system_logs, email_send_queue, autopilot_runs
  3. Covers: cfg_grammars, custom_tools, allowed_tools_config
*/

-- system_logs
DROP POLICY IF EXISTS "Users can read own logs" ON public.system_logs;
CREATE POLICY "Users can read own logs" ON public.system_logs
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- email_send_queue
DROP POLICY IF EXISTS "Users can view own email queue" ON public.email_send_queue;
CREATE POLICY "Users can view own email queue" ON public.email_send_queue
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert into own email queue" ON public.email_send_queue;
CREATE POLICY "Users can insert into own email queue" ON public.email_send_queue
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own email queue" ON public.email_send_queue;
CREATE POLICY "Users can update own email queue" ON public.email_send_queue
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete from own email queue" ON public.email_send_queue;
CREATE POLICY "Users can delete from own email queue" ON public.email_send_queue
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- autopilot_runs
DROP POLICY IF EXISTS "Users can view own autopilot runs" ON public.autopilot_runs;
CREATE POLICY "Users can view own autopilot runs" ON public.autopilot_runs
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own autopilot runs" ON public.autopilot_runs;
CREATE POLICY "Users can insert own autopilot runs" ON public.autopilot_runs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own autopilot runs" ON public.autopilot_runs;
CREATE POLICY "Users can update own autopilot runs" ON public.autopilot_runs
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- cfg_grammars
DROP POLICY IF EXISTS "Users can view own CFG grammars" ON public.cfg_grammars;
CREATE POLICY "Users can view own CFG grammars" ON public.cfg_grammars
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own CFG grammars" ON public.cfg_grammars;
CREATE POLICY "Users can create own CFG grammars" ON public.cfg_grammars
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own CFG grammars" ON public.cfg_grammars;
CREATE POLICY "Users can update own CFG grammars" ON public.cfg_grammars
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own CFG grammars" ON public.cfg_grammars;
CREATE POLICY "Users can delete own CFG grammars" ON public.cfg_grammars
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- custom_tools
DROP POLICY IF EXISTS "Users can view own custom tools" ON public.custom_tools;
CREATE POLICY "Users can view own custom tools" ON public.custom_tools
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own custom tools" ON public.custom_tools;
CREATE POLICY "Users can create own custom tools" ON public.custom_tools
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own custom tools" ON public.custom_tools;
CREATE POLICY "Users can update own custom tools" ON public.custom_tools
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own custom tools" ON public.custom_tools;
CREATE POLICY "Users can delete own custom tools" ON public.custom_tools
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- allowed_tools_config
DROP POLICY IF EXISTS "Users can view own allowed tools config" ON public.allowed_tools_config;
CREATE POLICY "Users can view own allowed tools config" ON public.allowed_tools_config
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own allowed tools config" ON public.allowed_tools_config;
CREATE POLICY "Users can create own allowed tools config" ON public.allowed_tools_config
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own allowed tools config" ON public.allowed_tools_config;
CREATE POLICY "Users can update own allowed tools config" ON public.allowed_tools_config
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own allowed tools config" ON public.allowed_tools_config;
CREATE POLICY "Users can delete own allowed tools config" ON public.allowed_tools_config
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));
