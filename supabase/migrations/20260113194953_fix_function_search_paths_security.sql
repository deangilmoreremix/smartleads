/*
  # Fix Function Search Paths for SQL Injection Protection

  ## Security Issue
  Functions without explicit search_path settings are vulnerable to SQL injection through 
  schema manipulation. This migration sets search_path to 'pg_catalog, public' for all
  functions to prevent attackers from creating malicious functions in higher-priority schemas.

  ## Functions Secured (68 total)
  
  ### Locking & Concurrency Functions
  - acquire_campaign_lock
  - acquire_concurrency_slot
  - extend_campaign_lock
  - release_campaign_lock
  - release_concurrency_slot
  
  ### Queue Management Functions
  - add_to_retry_queue
  - move_to_dead_letter
  - process_retry_queue_batch
  - get_next_retry_job
  - claim_email_for_sending
  - claim_next_job
  
  ### Job Processing Functions
  - complete_job
  - fail_job
  - detect_stale_jobs
  - save_job_checkpoint
  - get_job_checkpoint
  - update_job_progress (2 signatures)
  
  ### Rate Limiting Functions
  - check_rate_limit
  - increment_rate_limit
  - cleanup_old_rate_limit_buckets
  
  ### Circuit Breaker Functions
  - check_circuit_breaker
  - record_circuit_failure
  - record_circuit_success
  
  ### Email Processing Functions
  - send_email_atomic
  - fail_email_send
  - process_sequence_step_atomic
  - pause_sequence_on_reply
  - get_next_leads_to_email
  - is_within_send_window
  
  ### Lead & Campaign Functions
  - complete_scrape_atomic
  - calculate_lead_priority_score
  - calculate_lead_quality_score
  - calculate_email_priority
  - update_campaign_priority_scores
  
  ### System Monitoring Functions
  - get_system_health
  - update_health_check
  - update_system_health_checks
  - collect_queue_metrics
  - start_operation_span
  - end_operation_span
  
  ### Cleanup & Maintenance Functions
  - cleanup_old_system_logs
  - cleanup_expired_idempotency_keys
  - run_daily_cleanup
  - reset_daily_email_counts
  - reset_daily_gmail_counters
  
  ### Notification Functions
  - create_notification_from_tracking_event
  - create_notification_on_campaign_complete
  - create_notification_on_scraping_complete
  - check_notification_preference
  
  ### Authentication & Authorization Functions
  - handle_new_user
  - check_feature_flag
  - check_storage_quota
  - update_user_storage_usage
  
  ### Trigger Functions
  - handle_updated_at
  - update_updated_at_column
  - update_email_status_from_event
  - update_lead_quality_score
  - update_lead_intent_score
  - update_priority_on_health_change
  - update_priority_on_intent_change
  - sync_campaign_autopilot_flag
  - update_queue_tables_timestamp
  - update_retry_monitoring_timestamp
  - update_user_onboarding_timestamp
  
  ### Idempotency Functions
  - check_idempotency
  - complete_idempotency
  
  ### Pipeline & Stage Functions
  - auto_advance_pipeline_stage
  - create_default_pipeline_stages
  
  ### Miscellaneous Functions
  - calculate_backoff_delay
  - check_dead_letter_alerts
  - create_default_custom_tools
  - deduct_credits_atomic

  ## Impact
  - Defense-in-depth security measure
  - Prevents schema-based SQL injection attacks
  - No application code changes required
  - No performance impact
  
  ## Risk Mitigation
  After this migration:
  - Attackers cannot hijack function behavior via schema manipulation
  - Functions will only use objects from pg_catalog and public schemas
  - Malicious schemas cannot be injected into function execution context
*/

-- Locking & Concurrency Functions
ALTER FUNCTION public.acquire_campaign_lock(p_campaign_id uuid, p_lock_type text, p_locked_by text, p_timeout_seconds integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.acquire_concurrency_slot(p_user_id uuid, p_operation_type text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.extend_campaign_lock(p_campaign_id uuid, p_lock_type text, p_locked_by text, p_additional_seconds integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.release_campaign_lock(p_campaign_id uuid, p_lock_type text, p_locked_by text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.release_concurrency_slot(p_user_id uuid, p_operation_type text) SET search_path = pg_catalog, public;

-- Queue Management Functions
ALTER FUNCTION public.add_to_retry_queue(p_original_job_id uuid, p_original_table text, p_user_id uuid, p_campaign_id uuid, p_operation_type text, p_payload jsonb, p_error_message text, p_error_code text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.move_to_dead_letter(p_original_queue text, p_original_message_id bigint, p_user_id uuid, p_campaign_id uuid, p_payload jsonb, p_error_message text, p_error_history jsonb, p_retry_count integer, p_failure_reason text, p_failure_category text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.process_retry_queue_batch(p_batch_size integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_next_retry_job(p_operation_type text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.claim_email_for_sending(p_user_id uuid, p_campaign_id uuid, p_batch_size integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.claim_next_job(p_job_type text, p_user_id uuid) SET search_path = pg_catalog, public;

-- Job Processing Functions (note: update_job_progress has 2 signatures)
ALTER FUNCTION public.complete_job(p_job_id uuid, p_result_data jsonb, p_processed_items integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.fail_job(p_job_id uuid, p_error_message text, p_should_retry boolean) SET search_path = pg_catalog, public;
ALTER FUNCTION public.detect_stale_jobs(p_stale_threshold_minutes integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.save_job_checkpoint(p_job_id uuid, p_job_type text, p_user_id uuid, p_campaign_id uuid, p_last_processed_id text, p_last_processed_index integer, p_items_completed integer, p_items_remaining integer, p_items_failed integer, p_checkpoint_data jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_job_checkpoint(p_job_id uuid, p_job_type text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_job_progress() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_job_progress(p_job_id uuid, p_status text, p_current_step text, p_total_steps integer, p_completed_steps integer, p_error_message text) SET search_path = pg_catalog, public;

-- Rate Limiting Functions
ALTER FUNCTION public.check_rate_limit(p_user_id uuid, p_operation_type text, p_tokens integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.increment_rate_limit(p_user_id uuid, p_operation_type text, p_tokens integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.cleanup_old_rate_limit_buckets() SET search_path = pg_catalog, public;

-- Circuit Breaker Functions
ALTER FUNCTION public.check_circuit_breaker(p_service_name text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_circuit_failure(p_service_name text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_circuit_success(p_service_name text) SET search_path = pg_catalog, public;

-- Email Processing Functions
ALTER FUNCTION public.send_email_atomic(p_email_id uuid, p_user_id uuid, p_gmail_account_id uuid, p_message_id text, p_thread_id text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.fail_email_send(p_email_id uuid, p_error_message text, p_error_code text, p_should_retry boolean) SET search_path = pg_catalog, public;
ALTER FUNCTION public.process_sequence_step_atomic(p_lead_id uuid, p_sequence_id uuid, p_step_number integer, p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.pause_sequence_on_reply(p_lead_id uuid, p_reply_type text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_next_leads_to_email(p_campaign_id uuid, p_limit integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_within_send_window(p_start_hour integer, p_end_hour integer, p_timezone text, p_business_days_only boolean) SET search_path = pg_catalog, public;

-- Lead & Campaign Functions
ALTER FUNCTION public.complete_scrape_atomic(p_campaign_id uuid, p_user_id uuid, p_lead_data jsonb, p_contacts jsonb, p_social_profiles jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.calculate_lead_priority_score(p_lead_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.calculate_lead_quality_score(p_rating numeric, p_review_count integer, p_has_website boolean, p_has_real_email boolean, p_has_social_profiles boolean, p_employee_count integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.calculate_email_priority(p_intent_score integer, p_website_health integer, p_days_since_contact integer, p_has_decision_maker boolean) SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_campaign_priority_scores(p_campaign_id uuid) SET search_path = pg_catalog, public;

-- System Monitoring Functions
ALTER FUNCTION public.get_system_health() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_health_check(p_check_name text, p_status text, p_response_time_ms integer, p_error_message text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_system_health_checks() SET search_path = pg_catalog, public;
ALTER FUNCTION public.collect_queue_metrics() SET search_path = pg_catalog, public;
ALTER FUNCTION public.start_operation_span(p_trace_id uuid, p_operation_name text, p_operation_type text, p_user_id uuid, p_parent_span_id uuid, p_metadata jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.end_operation_span(p_span_id uuid, p_status text, p_error_message text, p_metadata jsonb) SET search_path = pg_catalog, public;

-- Cleanup & Maintenance Functions
ALTER FUNCTION public.cleanup_old_system_logs() SET search_path = pg_catalog, public;
ALTER FUNCTION public.cleanup_expired_idempotency_keys() SET search_path = pg_catalog, public;
ALTER FUNCTION public.run_daily_cleanup() SET search_path = pg_catalog, public;
ALTER FUNCTION public.reset_daily_email_counts() SET search_path = pg_catalog, public;
ALTER FUNCTION public.reset_daily_gmail_counters() SET search_path = pg_catalog, public;

-- Notification Functions
ALTER FUNCTION public.create_notification_from_tracking_event() SET search_path = pg_catalog, public;
ALTER FUNCTION public.create_notification_on_campaign_complete() SET search_path = pg_catalog, public;
ALTER FUNCTION public.create_notification_on_scraping_complete() SET search_path = pg_catalog, public;
ALTER FUNCTION public.check_notification_preference(p_user_id uuid, p_notification_type text) SET search_path = pg_catalog, public;

-- Authentication & Authorization Functions
ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public;
ALTER FUNCTION public.check_feature_flag(p_flag_name text, p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.check_storage_quota(p_user_id uuid, p_file_size bigint) SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_user_storage_usage() SET search_path = pg_catalog, public;

-- Trigger Functions
ALTER FUNCTION public.handle_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_email_status_from_event() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_lead_quality_score() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_lead_intent_score() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_priority_on_health_change() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_priority_on_intent_change() SET search_path = pg_catalog, public;
ALTER FUNCTION public.sync_campaign_autopilot_flag() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_queue_tables_timestamp() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_retry_monitoring_timestamp() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_user_onboarding_timestamp() SET search_path = pg_catalog, public;

-- Idempotency Functions
ALTER FUNCTION public.check_idempotency(p_key text, p_operation_type text, p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.complete_idempotency(p_key text, p_status text, p_response jsonb) SET search_path = pg_catalog, public;

-- Pipeline & Stage Functions
ALTER FUNCTION public.auto_advance_pipeline_stage() SET search_path = pg_catalog, public;
ALTER FUNCTION public.create_default_pipeline_stages() SET search_path = pg_catalog, public;

-- Miscellaneous Functions
ALTER FUNCTION public.calculate_backoff_delay(p_operation_type text, p_retry_count integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.check_dead_letter_alerts() SET search_path = pg_catalog, public;
ALTER FUNCTION public.create_default_custom_tools() SET search_path = pg_catalog, public;
ALTER FUNCTION public.deduct_credits_atomic(p_user_id uuid, p_amount integer, p_operation_type text, p_reference_id uuid) SET search_path = pg_catalog, public;