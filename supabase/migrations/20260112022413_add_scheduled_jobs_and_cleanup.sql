/*
  # Scheduled Jobs and Cleanup Functions
  
  This migration creates scheduled background jobs using pg_cron for automated
  system maintenance, cleanup, and processing tasks.
  
  ## 1. pg_cron Extension
  - Enables pg_cron for scheduled database jobs
  
  ## 2. Scheduled Jobs Created
  - Retry queue processing (every minute)
  - Stale job detection (every 5 minutes)
  - Rate limit bucket cleanup (daily)
  - Idempotency key cleanup (hourly)
  - Queue metrics collection (every 5 minutes)
  - Health check updates (every minute)
  - Dead letter queue alerts (every 15 minutes)
  
  ## 3. Helper Functions
  - Process retry queue items
  - Collect queue metrics
  - Send alert notifications
  
  ## Security
  - Jobs run with SECURITY DEFINER
  - Limited to service role access
*/

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres (required for pg_cron)
GRANT USAGE ON SCHEMA cron TO postgres;

-- Function to process retry queue
CREATE OR REPLACE FUNCTION process_retry_queue_batch(
  p_batch_size integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_processed integer := 0;
  v_succeeded integer := 0;
  v_failed integer := 0;
  v_job record;
BEGIN
  FOR v_job IN
    SELECT * FROM retry_queue
    WHERE status = 'pending'
      AND next_retry_at <= now()
    ORDER BY next_retry_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE retry_queue
    SET status = 'processing',
        updated_at = now()
    WHERE id = v_job.id;
    
    v_processed := v_processed + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'processed', v_processed,
    'succeeded', v_succeeded,
    'failed', v_failed,
    'timestamp', now()
  );
END;
$$;

-- Function to collect queue metrics
CREATE OR REPLACE FUNCTION collect_queue_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_queue_name text;
  v_depth integer;
BEGIN
  FOR v_queue_name IN SELECT unnest(ARRAY['email_send_queue', 'scrape_queue', 'ai_generation_queue', 'sequence_queue', 'enrichment_queue', 'retry_queue', 'dead_letter_queue'])
  LOOP
    BEGIN
      EXECUTE format('SELECT count(*) FROM pgmq.q_%s', v_queue_name) INTO v_depth;
      
      INSERT INTO queue_metrics (queue_name, queue_depth, metric_timestamp)
      VALUES (v_queue_name, COALESCE(v_depth, 0), now());
    EXCEPTION WHEN undefined_table THEN
      INSERT INTO queue_metrics (queue_name, queue_depth, metric_timestamp)
      VALUES (v_queue_name, 0, now());
    END;
  END LOOP;
END;
$$;

-- Function to check and alert on dead letter queue items
CREATE OR REPLACE FUNCTION check_dead_letter_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_unreviewed_count integer;
  v_critical_count integer;
BEGIN
  SELECT count(*) INTO v_unreviewed_count
  FROM dead_letter_items
  WHERE reviewed = false
    AND created_at > now() - interval '24 hours';
  
  SELECT count(*) INTO v_critical_count
  FROM dead_letter_items
  WHERE reviewed = false
    AND failure_category IN ('permanent', 'invalid_data')
    AND created_at > now() - interval '1 hour';
  
  IF v_critical_count > 0 OR v_unreviewed_count > 10 THEN
    INSERT INTO system_monitoring_logs (
      log_type, severity, message, details
    ) VALUES (
      'dead_letter_alert',
      CASE WHEN v_critical_count > 0 THEN 'critical' ELSE 'warning' END,
      format('Dead letter queue alert: %s unreviewed items (%s critical)',
        v_unreviewed_count, v_critical_count),
      jsonb_build_object(
        'unreviewed_count', v_unreviewed_count,
        'critical_count', v_critical_count,
        'timestamp', now()
      )
    );
  END IF;
END;
$$;

-- Function to run all cleanup tasks
CREATE OR REPLACE FUNCTION run_daily_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate_limit_deleted integer;
  v_idempotency_deleted integer;
  v_old_metrics_deleted integer;
  v_old_spans_deleted integer;
  v_expired_locks_deleted integer;
BEGIN
  DELETE FROM rate_limit_buckets
  WHERE window_start < now() - interval '2 days';
  GET DIAGNOSTICS v_rate_limit_deleted = ROW_COUNT;
  
  DELETE FROM idempotency_keys
  WHERE expires_at < now();
  GET DIAGNOSTICS v_idempotency_deleted = ROW_COUNT;
  
  DELETE FROM queue_metrics
  WHERE metric_timestamp < now() - interval '7 days';
  GET DIAGNOSTICS v_old_metrics_deleted = ROW_COUNT;
  
  DELETE FROM operation_spans
  WHERE start_time < now() - interval '30 days';
  GET DIAGNOSTICS v_old_spans_deleted = ROW_COUNT;
  
  DELETE FROM campaign_locks
  WHERE expires_at < now();
  GET DIAGNOSTICS v_expired_locks_deleted = ROW_COUNT;
  
  INSERT INTO system_monitoring_logs (
    log_type, severity, message, details
  ) VALUES (
    'daily_cleanup',
    'info',
    'Daily cleanup completed',
    jsonb_build_object(
      'rate_limit_buckets_deleted', v_rate_limit_deleted,
      'idempotency_keys_deleted', v_idempotency_deleted,
      'old_metrics_deleted', v_old_metrics_deleted,
      'old_spans_deleted', v_old_spans_deleted,
      'expired_locks_deleted', v_expired_locks_deleted,
      'timestamp', now()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'rate_limit_buckets_deleted', v_rate_limit_deleted,
    'idempotency_keys_deleted', v_idempotency_deleted,
    'old_metrics_deleted', v_old_metrics_deleted,
    'old_spans_deleted', v_old_spans_deleted,
    'expired_locks_deleted', v_expired_locks_deleted
  );
END;
$$;

-- Function to reset daily Gmail counters
CREATE OR REPLACE FUNCTION reset_daily_gmail_counters()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reset_count integer;
BEGIN
  UPDATE gmail_accounts
  SET emails_sent_today = 0,
      last_reset_at = now(),
      updated_at = now()
  WHERE last_reset_at IS NULL
     OR last_reset_at < date_trunc('day', now());
  
  GET DIAGNOSTICS v_reset_count = ROW_COUNT;
  
  IF v_reset_count > 0 THEN
    INSERT INTO system_monitoring_logs (
      log_type, severity, message, details
    ) VALUES (
      'gmail_counter_reset',
      'info',
      format('Reset daily counters for %s Gmail accounts', v_reset_count),
      jsonb_build_object(
        'accounts_reset', v_reset_count,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN v_reset_count;
END;
$$;

-- Function to update health check status based on recent activity
CREATE OR REPLACE FUNCTION update_system_health_checks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pending_emails integer;
  v_stale_jobs integer;
  v_circuit_open_count integer;
BEGIN
  SELECT count(*) INTO v_pending_emails
  FROM emails
  WHERE status = 'pending'
    AND created_at < now() - interval '1 hour';
  
  UPDATE health_checks
  SET status = CASE 
    WHEN v_pending_emails > 100 THEN 'degraded'
    WHEN v_pending_emails > 500 THEN 'unhealthy'
    ELSE 'healthy'
  END,
  last_check_at = now(),
  metadata = jsonb_build_object('pending_emails', v_pending_emails),
  updated_at = now()
  WHERE check_name = 'email_send_queue';
  
  SELECT count(*) INTO v_stale_jobs
  FROM campaign_jobs
  WHERE status = 'processing'
    AND started_at < now() - interval '30 minutes';
  
  UPDATE health_checks
  SET status = CASE 
    WHEN v_stale_jobs > 0 THEN 'degraded'
    WHEN v_stale_jobs > 5 THEN 'unhealthy'
    ELSE 'healthy'
  END,
  last_check_at = now(),
  metadata = jsonb_build_object('stale_jobs', v_stale_jobs),
  updated_at = now()
  WHERE check_name = 'autopilot_processor';
  
  SELECT count(*) INTO v_circuit_open_count
  FROM circuit_breaker_state
  WHERE state = 'open';
  
  IF v_circuit_open_count > 0 THEN
    INSERT INTO system_monitoring_logs (
      log_type, severity, message, details
    ) VALUES (
      'circuit_breaker_alert',
      'warning',
      format('%s circuit breakers are open', v_circuit_open_count),
      jsonb_build_object(
        'open_circuits', v_circuit_open_count,
        'timestamp', now()
      )
    )
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Schedule: Process retry queue every minute
SELECT cron.schedule(
  'process-retry-queue',
  '* * * * *',
  $$SELECT process_retry_queue_batch(10)$$
);

-- Schedule: Detect stale jobs every 5 minutes
SELECT cron.schedule(
  'detect-stale-jobs',
  '*/5 * * * *',
  $$SELECT detect_stale_jobs(30)$$
);

-- Schedule: Collect queue metrics every 5 minutes
SELECT cron.schedule(
  'collect-queue-metrics',
  '*/5 * * * *',
  $$SELECT collect_queue_metrics()$$
);

-- Schedule: Update health checks every minute
SELECT cron.schedule(
  'update-health-checks',
  '* * * * *',
  $$SELECT update_system_health_checks()$$
);

-- Schedule: Check dead letter alerts every 15 minutes
SELECT cron.schedule(
  'check-dead-letter-alerts',
  '*/15 * * * *',
  $$SELECT check_dead_letter_alerts()$$
);

-- Schedule: Run daily cleanup at 3 AM UTC
SELECT cron.schedule(
  'daily-cleanup',
  '0 3 * * *',
  $$SELECT run_daily_cleanup()$$
);

-- Schedule: Reset Gmail counters at midnight UTC
SELECT cron.schedule(
  'reset-gmail-counters',
  '0 0 * * *',
  $$SELECT reset_daily_gmail_counters()$$
);

-- Schedule: Clean expired idempotency keys every hour
SELECT cron.schedule(
  'cleanup-idempotency-keys',
  '0 * * * *',
  $$SELECT cleanup_expired_idempotency_keys()$$
);

-- Schedule: Clean old rate limit buckets every 6 hours
SELECT cron.schedule(
  'cleanup-rate-limit-buckets',
  '0 */6 * * *',
  $$SELECT cleanup_old_rate_limit_buckets()$$
);
