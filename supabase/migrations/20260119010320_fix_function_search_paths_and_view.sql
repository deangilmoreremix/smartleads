/*
  # Fix Function Search Paths and View Security
  
  ## Summary
  This migration fixes function search path issues and ensures the system health view is secure.
  
  ## Changes
  
  ### 1. Drop Old Function Versions
  Remove old versions of functions that don't have proper search_path configuration.
  
  ### 2. Recreate System Health Metrics View
  Ensure the view doesn't have SECURITY DEFINER property.
  
  ## Security Impact
  - Prevents search_path manipulation attacks
  - Ensures functions run with predictable schema resolution
*/

-- ============================================
-- PART 1: Drop Old Function Versions Without Search Path
-- ============================================

-- Drop old version of safe_increment_counter
DROP FUNCTION IF EXISTS public.safe_increment_counter(
  table_name text, 
  counter_column text, 
  id_column text, 
  id_value uuid, 
  increment_by integer
);

-- Drop old version of batch_update_email_status
DROP FUNCTION IF EXISTS public.batch_update_email_status(
  email_ids uuid[], 
  new_status text, 
  sent_timestamp timestamp with time zone
);

-- ============================================
-- PART 2: Ensure System Health Metrics View is Secure
-- ============================================

-- Drop and recreate view to ensure no SECURITY DEFINER
DROP VIEW IF EXISTS public.system_health_metrics CASCADE;

CREATE VIEW public.system_health_metrics 
WITH (security_invoker = true) AS
SELECT 
  'database_connections'::text as metric_name,
  count(*)::text as metric_value,
  NOW() as measured_at
FROM pg_stat_activity
WHERE datname = current_database()
UNION ALL
SELECT 
  'table_count'::text as metric_name,
  count(*)::text as metric_value,
  NOW() as measured_at
FROM information_schema.tables
WHERE table_schema = 'public';

-- Grant access to authenticated users
GRANT SELECT ON public.system_health_metrics TO authenticated;

COMMENT ON VIEW public.system_health_metrics IS 'System health metrics with security_invoker to prevent privilege escalation';
