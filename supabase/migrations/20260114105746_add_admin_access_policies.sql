/*
  # Add Admin Access Policies for Admin Panel

  1. Changes
    - Add admin SELECT policies on subscriptions table
    - Add admin UPDATE policies on subscriptions table
    - Add admin SELECT policies on profiles table (view all)
    - Add admin SELECT policies on campaigns table (view all)
    - Add admin SELECT policies on emails table (view all)
    - Add admin SELECT policies on campaign_jobs table (view all)

  2. Security
    - All admin policies check profiles.is_admin = true
    - Policies use EXISTS subquery for performance
    - Original user-level policies remain unchanged
*/

-- Admin can view all subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Admins can view all subscriptions'
  ) THEN
    CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Admin can update all subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Admins can update all subscriptions'
  ) THEN
    CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
      FOR UPDATE TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Admin can view all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" ON public.profiles
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
      ));
  END IF;
END $$;

-- Admin can update all profiles (for admin status changes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles" ON public.profiles
      FOR UPDATE TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
      ));
  END IF;
END $$;

-- Admin can view all campaigns (for overview stats)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'campaigns' 
    AND policyname = 'Admins can view all campaigns'
  ) THEN
    CREATE POLICY "Admins can view all campaigns" ON public.campaigns
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Admin can view all leads (for overview stats)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leads' 
    AND policyname = 'Admins can view all leads'
  ) THEN
    CREATE POLICY "Admins can view all leads" ON public.leads
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Admin can view all emails (for queue monitoring)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'emails' 
    AND policyname = 'Admins can view all emails'
  ) THEN
    CREATE POLICY "Admins can view all emails" ON public.emails
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Admin can update all emails (for requeuing failed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'emails' 
    AND policyname = 'Admins can update all emails'
  ) THEN
    CREATE POLICY "Admins can update all emails" ON public.emails
      FOR UPDATE TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Admin can view all campaign jobs (for job monitoring)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'campaign_jobs' 
    AND policyname = 'Admins can view all campaign jobs'
  ) THEN
    CREATE POLICY "Admins can view all campaign jobs" ON public.campaign_jobs
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Admin can update all campaign jobs (for retrying failed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'campaign_jobs' 
    AND policyname = 'Admins can update all campaign jobs'
  ) THEN
    CREATE POLICY "Admins can update all campaign jobs" ON public.campaign_jobs
      FOR UPDATE TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Admin can view all file uploads (for storage monitoring)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'file_uploads' 
    AND policyname = 'Admins can view all file uploads'
  ) THEN
    CREATE POLICY "Admins can view all file uploads" ON public.file_uploads
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
      ));
  END IF;
END $$;

-- Create indexes for admin policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
