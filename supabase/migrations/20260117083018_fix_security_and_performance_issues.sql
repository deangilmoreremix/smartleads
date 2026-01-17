/*
  # Fix Security and Performance Issues
  
  ## Summary
  This migration addresses multiple security and performance concerns identified in the database audit.
  
  ## Changes
  
  ### 1. Missing Foreign Key Indexes
  Adding indexes for foreign keys that were missing covering indexes:
  - inbox_messages.contact_id
  - user_feature_overrides.granted_by
  - user_roles.granted_by
  
  ### 2. RLS Policy Performance Optimization
  Replacing `auth.uid()` with `(select auth.uid())` in RLS policies to prevent
  re-evaluation for each row, improving query performance at scale.
  
  ### 3. Function Search Path Security
  Adding explicit search_path to functions to prevent search path injection attacks.
  
  ### 4. Always-True RLS Policy Fixes
  Fixing policies that were allowing unrestricted access.
  
  ## Security Impact
  - Improved query performance for RLS-protected tables
  - Prevented potential search path manipulation attacks
  - Tightened access controls on audit_logs
*/

-- ============================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_inbox_messages_contact_id 
  ON public.inbox_messages(contact_id);

CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_granted_by 
  ON public.user_feature_overrides(granted_by);

CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by 
  ON public.user_roles(granted_by);

-- ============================================
-- PART 2: Fix Function Search Paths
-- ============================================

-- Fix cleanup_old_rate_limit_logs
DROP FUNCTION IF EXISTS public.cleanup_old_rate_limit_logs();
CREATE FUNCTION public.cleanup_old_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_logs 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Fix safe_increment_counter
DROP FUNCTION IF EXISTS public.safe_increment_counter(text, integer);
CREATE FUNCTION public.safe_increment_counter(
  p_key text,
  p_increment integer DEFAULT 1
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current integer;
BEGIN
  UPDATE public.rate_limit_buckets 
  SET tokens = tokens + p_increment
  WHERE key = p_key
  RETURNING tokens INTO v_current;
  
  IF NOT FOUND THEN
    INSERT INTO public.rate_limit_buckets (key, tokens)
    VALUES (p_key, p_increment)
    ON CONFLICT (key) DO UPDATE SET tokens = rate_limit_buckets.tokens + p_increment
    RETURNING tokens INTO v_current;
  END IF;
  
  RETURN COALESCE(v_current, 0);
END;
$$;

-- Fix batch_update_email_status
DROP FUNCTION IF EXISTS public.batch_update_email_status(uuid[], text);
CREATE FUNCTION public.batch_update_email_status(
  p_email_ids uuid[],
  p_status text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.emails
  SET status = p_status, updated_at = NOW()
  WHERE id = ANY(p_email_ids)
    AND user_id = auth.uid();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Fix is_valid_email (with CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS public.is_valid_email(text) CASCADE;
CREATE FUNCTION public.is_valid_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Recreate the constraint that depends on is_valid_email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_valid_email' AND table_name = 'leads'
  ) THEN
    ALTER TABLE public.leads 
    ADD CONSTRAINT leads_valid_email 
    CHECK (email IS NULL OR public.is_valid_email(email));
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Fix update_subscription_updated_at
DROP FUNCTION IF EXISTS public.update_subscription_updated_at() CASCADE;
CREATE FUNCTION public.update_subscription_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers that depend on update_subscription_updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
    CREATE TRIGGER update_user_subscriptions_updated_at
      BEFORE UPDATE ON public.user_subscriptions
      FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();
  END IF;
END $$;

-- Fix get_user_subscription
DROP FUNCTION IF EXISTS public.get_user_subscription(uuid);
CREATE FUNCTION public.get_user_subscription(p_user_id uuid)
RETURNS TABLE(
  plan_name text,
  status text,
  current_period_end timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name::text,
    us.status::text,
    us.current_period_end
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  LIMIT 1;
END;
$$;

-- Fix user_has_feature
DROP FUNCTION IF EXISTS public.user_has_feature(uuid, text);
CREATE FUNCTION public.user_has_feature(p_user_id uuid, p_feature_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_override_enabled boolean;
  v_flag_enabled boolean;
BEGIN
  SELECT enabled INTO v_override_enabled
  FROM public.user_feature_overrides ufo
  JOIN public.feature_flags_v2 ff ON ufo.feature_flag_id = ff.id
  WHERE ufo.user_id = p_user_id AND ff.key = p_feature_key;
  
  IF FOUND THEN
    RETURN v_override_enabled;
  END IF;
  
  SELECT enabled INTO v_flag_enabled
  FROM public.feature_flags_v2
  WHERE key = p_feature_key;
  
  RETURN COALESCE(v_flag_enabled, false);
END;
$$;

-- ============================================
-- PART 3: Fix RLS Policies - Profiles Table
-- ============================================

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 4: Fix RLS Policies - Campaign Jobs Table
-- ============================================

DROP POLICY IF EXISTS "Admins can update all campaign jobs" ON public.campaign_jobs;
CREATE POLICY "Admins can update all campaign jobs" ON public.campaign_jobs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all campaign jobs" ON public.campaign_jobs;
CREATE POLICY "Admins can view all campaign jobs" ON public.campaign_jobs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 5: Fix RLS Policies - Campaigns Table
-- ============================================

DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
CREATE POLICY "Admins can view all campaigns" ON public.campaigns
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 6: Fix RLS Policies - Emails Table
-- ============================================

DROP POLICY IF EXISTS "Admins can update all emails" ON public.emails;
CREATE POLICY "Admins can update all emails" ON public.emails
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all emails" ON public.emails;
CREATE POLICY "Admins can view all emails" ON public.emails
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 7: Fix RLS Policies - File Uploads Table
-- ============================================

DROP POLICY IF EXISTS "Admins can view all file uploads" ON public.file_uploads;
CREATE POLICY "Admins can view all file uploads" ON public.file_uploads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 8: Fix RLS Policies - Leads Table
-- ============================================

DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 9: Fix RLS Policies - User Roles Table
-- ============================================

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 10: Fix RLS Policies - Role Permissions Table
-- ============================================

DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 11: Fix RLS Policies - Feature Flags Table
-- ============================================

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags_v2;
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags_v2
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 12: Fix RLS Policies - User Feature Overrides Table
-- ============================================

DROP POLICY IF EXISTS "Admins can manage overrides" ON public.user_feature_overrides;
CREATE POLICY "Admins can manage overrides" ON public.user_feature_overrides
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all overrides" ON public.user_feature_overrides;
CREATE POLICY "Admins can view all overrides" ON public.user_feature_overrides
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can view own overrides" ON public.user_feature_overrides;
CREATE POLICY "Users can view own overrides" ON public.user_feature_overrides
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 13: Fix RLS Policies - Audit Logs Table
-- ============================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert own audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

-- ============================================
-- PART 14: Fix RLS Policies - Connected Channels Table
-- ============================================

DROP POLICY IF EXISTS "Users can delete own channels" ON public.connected_channels;
CREATE POLICY "Users can delete own channels" ON public.connected_channels
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own channels" ON public.connected_channels;
CREATE POLICY "Users can insert own channels" ON public.connected_channels
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own channels" ON public.connected_channels;
CREATE POLICY "Users can update own channels" ON public.connected_channels
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own channels" ON public.connected_channels;
CREATE POLICY "Users can view own channels" ON public.connected_channels
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 15: Fix RLS Policies - Subscriptions Table
-- ============================================

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 16: Fix RLS Policies - LinkedIn Messages Table
-- ============================================

DROP POLICY IF EXISTS "Users can insert own linkedin messages" ON public.linkedin_messages;
CREATE POLICY "Users can insert own linkedin messages" ON public.linkedin_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own linkedin messages" ON public.linkedin_messages;
CREATE POLICY "Users can update own linkedin messages" ON public.linkedin_messages
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own linkedin messages" ON public.linkedin_messages;
CREATE POLICY "Users can view own linkedin messages" ON public.linkedin_messages
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 17: Fix RLS Policies - Subscription Plans Table
-- ============================================

DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
CREATE POLICY "Admins can manage plans" ON public.subscription_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

-- ============================================
-- PART 18: Fix RLS Policies - User Subscriptions Table
-- ============================================

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can view all user subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 19: Fix RLS Policies - Inbox Contacts Table
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.inbox_contacts;
DROP POLICY IF EXISTS "Users can view own contacts" ON public.inbox_contacts;
CREATE POLICY "Users can view own contacts" ON public.inbox_contacts
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own contacts" ON public.inbox_contacts;
CREATE POLICY "Users can delete own contacts" ON public.inbox_contacts
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create contacts" ON public.inbox_contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.inbox_contacts;
CREATE POLICY "Users can insert own contacts" ON public.inbox_contacts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update contacts they have conversations with" ON public.inbox_contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.inbox_contacts;
CREATE POLICY "Users can update own contacts" ON public.inbox_contacts
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================
-- PART 20: Fix RLS Policies - Inbox Conversations Table
-- ============================================

DROP POLICY IF EXISTS "Users can create their own conversations" ON public.inbox_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.inbox_conversations;
CREATE POLICY "Users can insert own conversations" ON public.inbox_conversations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.inbox_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.inbox_conversations;
CREATE POLICY "Users can delete own conversations" ON public.inbox_conversations
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own conversations" ON public.inbox_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.inbox_conversations;
CREATE POLICY "Users can update own conversations" ON public.inbox_conversations
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own conversations" ON public.inbox_conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.inbox_conversations;
CREATE POLICY "Users can view own conversations" ON public.inbox_conversations
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 21: Fix RLS Policies - Outreach Sequences Table
-- ============================================

DROP POLICY IF EXISTS "Users can delete own sequences" ON public.outreach_sequences;
CREATE POLICY "Users can delete own sequences" ON public.outreach_sequences
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own sequences" ON public.outreach_sequences;
CREATE POLICY "Users can insert own sequences" ON public.outreach_sequences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own sequences" ON public.outreach_sequences;
CREATE POLICY "Users can update own sequences" ON public.outreach_sequences
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own sequences" ON public.outreach_sequences;
CREATE POLICY "Users can view own sequences" ON public.outreach_sequences
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 22: Fix RLS Policies - Outreach Sequence Steps Table
-- ============================================

DROP POLICY IF EXISTS "Users can delete own sequence steps" ON public.outreach_sequence_steps;
CREATE POLICY "Users can delete own sequence steps" ON public.outreach_sequence_steps
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.outreach_sequences os
      WHERE os.id = outreach_sequence_steps.sequence_id
      AND os.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own sequence steps" ON public.outreach_sequence_steps;
CREATE POLICY "Users can insert own sequence steps" ON public.outreach_sequence_steps
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outreach_sequences os
      WHERE os.id = outreach_sequence_steps.sequence_id
      AND os.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own sequence steps" ON public.outreach_sequence_steps;
CREATE POLICY "Users can update own sequence steps" ON public.outreach_sequence_steps
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.outreach_sequences os
      WHERE os.id = outreach_sequence_steps.sequence_id
      AND os.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outreach_sequences os
      WHERE os.id = outreach_sequence_steps.sequence_id
      AND os.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own sequence steps" ON public.outreach_sequence_steps;
CREATE POLICY "Users can view own sequence steps" ON public.outreach_sequence_steps
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.outreach_sequences os
      WHERE os.id = outreach_sequence_steps.sequence_id
      AND os.user_id = (select auth.uid())
    )
  );

-- ============================================
-- PART 23: Fix RLS Policies - Inbox Messages Table
-- ============================================

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.inbox_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.inbox_messages;
CREATE POLICY "Users can insert own messages" ON public.inbox_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own messages" ON public.inbox_messages;
CREATE POLICY "Users can delete own messages" ON public.inbox_messages
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.inbox_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.inbox_messages;
CREATE POLICY "Users can update own messages" ON public.inbox_messages
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.inbox_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.inbox_messages;
CREATE POLICY "Users can view own messages" ON public.inbox_messages
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 24: Fix Rate Limit Logs RLS Policy
-- Rate limit logs is a system table without user_id - restrict to service_role only
-- ============================================

DROP POLICY IF EXISTS "System can manage rate limit logs" ON public.rate_limit_logs;
CREATE POLICY "Service role can manage rate limit logs" ON public.rate_limit_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
