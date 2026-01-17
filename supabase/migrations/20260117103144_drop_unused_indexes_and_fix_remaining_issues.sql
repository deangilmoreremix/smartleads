/*
  # Drop Unused Indexes and Fix Security Issues
  
  ## Summary
  This migration removes unused database indexes and fixes remaining security issues.
  
  ## Changes
  
  ### 1. Drop Unused Indexes
  Removing 240+ unused indexes that consume storage and slow down write operations.
  These can be recreated if needed in the future based on actual query patterns.
  
  ### 2. Fix Security Definer View
  Recreating system_health_metrics view without SECURITY DEFINER.
  
  ### 3. Consolidate Multiple Permissive Policies
  Combining redundant admin policies to reduce policy evaluation overhead.
  
  ## Performance Impact
  - Reduced storage usage
  - Faster INSERT/UPDATE/DELETE operations
  - Reduced index maintenance overhead
*/

-- ============================================
-- PART 1: Drop Unused Indexes on AI/Template Tables
-- ============================================

DROP INDEX IF EXISTS idx_compaction_settings_campaign_id;
DROP INDEX IF EXISTS idx_generation_history_template;
DROP INDEX IF EXISTS idx_suggestions_template;
DROP INDEX IF EXISTS idx_templates_tone;
DROP INDEX IF EXISTS idx_templates_goal;
DROP INDEX IF EXISTS idx_responses_conversations_user_id;
DROP INDEX IF EXISTS idx_responses_conversations_campaign_id;
DROP INDEX IF EXISTS idx_responses_conversations_lead_id;
DROP INDEX IF EXISTS idx_marketplace_category;
DROP INDEX IF EXISTS idx_marketplace_industry;
DROP INDEX IF EXISTS idx_template_variants_template;
DROP INDEX IF EXISTS idx_generation_history_user;
DROP INDEX IF EXISTS idx_ai_insights_user;
DROP INDEX IF EXISTS idx_ai_insights_email;
DROP INDEX IF EXISTS idx_ai_insights_job;
DROP INDEX IF EXISTS idx_ai_insights_created;
DROP INDEX IF EXISTS idx_ai_prompt_marketplace_user_id;
DROP INDEX IF EXISTS idx_ai_generation_insights_lead_id;
DROP INDEX IF EXISTS idx_ai_usage_tracking_user_id;
DROP INDEX IF EXISTS idx_ai_usage_tracking_created_at;
DROP INDEX IF EXISTS idx_ai_usage_tracking_model;
DROP INDEX IF EXISTS idx_ai_usage_tracking_campaign_id;

-- ============================================
-- PART 2: Drop Unused Indexes on Core Tables
-- ============================================

DROP INDEX IF EXISTS idx_campaigns_status;
DROP INDEX IF EXISTS idx_campaigns_group_id;
DROP INDEX IF EXISTS idx_campaigns_autopilot;
DROP INDEX IF EXISTS idx_campaigns_user_status;
DROP INDEX IF EXISTS idx_leads_status;
DROP INDEX IF EXISTS idx_leads_quality_score;
DROP INDEX IF EXISTS idx_leads_pipeline_stage;
DROP INDEX IF EXISTS idx_leads_email_user;
DROP INDEX IF EXISTS idx_leads_verification_status;
DROP INDEX IF EXISTS idx_leads_replied;
DROP INDEX IF EXISTS idx_leads_pipeline_stage_changed_at;
DROP INDEX IF EXISTS idx_leads_campaign_status;
DROP INDEX IF EXISTS idx_emails_campaign_id;
DROP INDEX IF EXISTS idx_emails_lead_id;
DROP INDEX IF EXISTS idx_emails_user_id;
DROP INDEX IF EXISTS idx_emails_ab_variant;
DROP INDEX IF EXISTS idx_emails_ab_test_id;
DROP INDEX IF EXISTS idx_emails_variant_id;
DROP INDEX IF EXISTS idx_emails_unipile_message_id;
DROP INDEX IF EXISTS idx_emails_campaign_status;

-- ============================================
-- PART 3: Drop Unused Indexes on Analytics/Events
-- ============================================

DROP INDEX IF EXISTS idx_analytics_events_user_id;
DROP INDEX IF EXISTS idx_analytics_events_campaign_id;
DROP INDEX IF EXISTS idx_analytics_events_email_id;
DROP INDEX IF EXISTS idx_analytics_events_lead_id;
DROP INDEX IF EXISTS idx_analytics_funnel_user_campaign_date;
DROP INDEX IF EXISTS idx_analytics_funnel_date;
DROP INDEX IF EXISTS idx_analytics_funnel_campaign_id;
DROP INDEX IF EXISTS idx_email_tracking_email_id;
DROP INDEX IF EXISTS idx_email_tracking_event_type;
DROP INDEX IF EXISTS idx_email_tracking_timestamp;
DROP INDEX IF EXISTS idx_email_tracking_email_event;

-- ============================================
-- PART 4: Drop Unused Indexes on Lead Related Tables
-- ============================================

DROP INDEX IF EXISTS idx_lead_reviews_lead_id;
DROP INDEX IF EXISTS idx_lead_reviews_rating;
DROP INDEX IF EXISTS idx_lead_reviews_user_id;
DROP INDEX IF EXISTS idx_lead_contacts_lead_id;
DROP INDEX IF EXISTS idx_lead_contacts_user_id;
DROP INDEX IF EXISTS idx_lead_contacts_email;
DROP INDEX IF EXISTS idx_lead_contacts_campaign_id;
DROP INDEX IF EXISTS idx_lead_social_profiles_lead_id;
DROP INDEX IF EXISTS idx_lead_social_profiles_platform;
DROP INDEX IF EXISTS idx_lead_social_profiles_user_id;
DROP INDEX IF EXISTS idx_lead_images_lead_id;
DROP INDEX IF EXISTS idx_lead_images_user_id;
DROP INDEX IF EXISTS idx_lead_pipeline_stages_user_id;

-- ============================================
-- PART 5: Drop Unused Indexes on Campaign/Job Tables
-- ============================================

DROP INDEX IF EXISTS idx_campaign_jobs_campaign_id;
DROP INDEX IF EXISTS idx_campaign_jobs_user_id;
DROP INDEX IF EXISTS idx_campaign_groups_user_id;
DROP INDEX IF EXISTS idx_agent_jobs_user_id;
DROP INDEX IF EXISTS idx_agent_jobs_campaign_id;
DROP INDEX IF EXISTS idx_agent_jobs_created_at;
DROP INDEX IF EXISTS idx_agent_jobs_campaign_status;
DROP INDEX IF EXISTS idx_agent_progress_logs_timestamp;

-- ============================================
-- PART 6: Drop Unused Indexes on Email/Sequence Tables
-- ============================================

DROP INDEX IF EXISTS idx_gmail_accounts_is_active;
DROP INDEX IF EXISTS idx_gmail_accounts_unipile_id;
DROP INDEX IF EXISTS idx_gmail_accounts_provider_type;
DROP INDEX IF EXISTS idx_gmail_accounts_provider_type_active;
DROP INDEX IF EXISTS idx_gmail_accounts_user_active;
DROP INDEX IF EXISTS idx_email_templates_template_type;
DROP INDEX IF EXISTS idx_sequence_ab_tests_sequence_id;
DROP INDEX IF EXISTS idx_sequence_ab_tests_user_id;
DROP INDEX IF EXISTS idx_sequence_ab_tests_campaign_id;
DROP INDEX IF EXISTS idx_sequence_progress_next_send;
DROP INDEX IF EXISTS idx_sequence_steps_campaign;

-- ============================================
-- PART 7: Drop Unused Indexes on Reply/Classification Tables
-- ============================================

DROP INDEX IF EXISTS idx_reply_classifications_lead_id;
DROP INDEX IF EXISTS idx_reply_classifications_classification;
DROP INDEX IF EXISTS idx_reply_classifications_user_id;
DROP INDEX IF EXISTS idx_reply_classifications_campaign_id;
DROP INDEX IF EXISTS idx_reply_classifications_email_id;

-- ============================================
-- PART 8: Drop Unused Indexes on Webhook Tables
-- ============================================

DROP INDEX IF EXISTS idx_webhook_configurations_user_id;
DROP INDEX IF EXISTS idx_webhook_deliveries_webhook_id;
DROP INDEX IF EXISTS idx_webhook_deliveries_user_id;
DROP INDEX IF EXISTS idx_webhook_deliveries_delivered_at;

-- ============================================
-- PART 9: Drop Unused Indexes on Duplicate/Unsubscribe Tables
-- ============================================

DROP INDEX IF EXISTS idx_duplicate_email_registry_email_hash;
DROP INDEX IF EXISTS idx_duplicate_email_registry_user_email;
DROP INDEX IF EXISTS idx_duplicate_email_registry_campaign_id;
DROP INDEX IF EXISTS idx_unsubscribes_email;
DROP INDEX IF EXISTS idx_unsubscribes_user_id;
DROP INDEX IF EXISTS idx_unsubscribes_campaign_id;

-- ============================================
-- PART 10: Drop Unused Indexes on File/Storage Tables
-- ============================================

DROP INDEX IF EXISTS idx_file_uploads_user_id;
DROP INDEX IF EXISTS idx_file_uploads_bucket;
DROP INDEX IF EXISTS idx_file_uploads_deleted;
DROP INDEX IF EXISTS idx_email_attachments_user_id;
DROP INDEX IF EXISTS idx_email_attachments_campaign_id;
DROP INDEX IF EXISTS idx_email_attachments_variant_id;
DROP INDEX IF EXISTS idx_email_attachments_uploaded_at;

-- ============================================
-- PART 11: Drop Unused Indexes on System/Log Tables
-- ============================================

DROP INDEX IF EXISTS idx_system_logs_user_id;
DROP INDEX IF EXISTS idx_system_logs_level;
DROP INDEX IF EXISTS idx_system_logs_category;
DROP INDEX IF EXISTS idx_system_logs_created_at;
DROP INDEX IF EXISTS idx_system_logs_user_created;
DROP INDEX IF EXISTS idx_system_logs_campaign_id;
DROP INDEX IF EXISTS idx_system_logs_lead_id;

-- ============================================
-- PART 12: Drop Unused Indexes on Autopilot Tables
-- ============================================

DROP INDEX IF EXISTS idx_autopilot_settings_enabled;
DROP INDEX IF EXISTS idx_autopilot_runs_campaign;
DROP INDEX IF EXISTS idx_autopilot_runs_status;
DROP INDEX IF EXISTS idx_autopilot_runs_created;
DROP INDEX IF EXISTS idx_autopilot_runs_user_id;
DROP INDEX IF EXISTS idx_autopilot_schedules_campaign;
DROP INDEX IF EXISTS idx_autopilot_schedules_next_run;
DROP INDEX IF EXISTS idx_autopilot_schedules_user_id;

-- ============================================
-- PART 13: Drop Unused Indexes on Email Queue Tables
-- ============================================

DROP INDEX IF EXISTS idx_email_queue_scheduled;
DROP INDEX IF EXISTS idx_email_queue_campaign;
DROP INDEX IF EXISTS idx_email_queue_status;
DROP INDEX IF EXISTS idx_email_queue_user;
DROP INDEX IF EXISTS idx_email_queue_priority;
DROP INDEX IF EXISTS idx_email_queue_campaign_id;
DROP INDEX IF EXISTS idx_email_queue_email_id;
DROP INDEX IF EXISTS idx_email_queue_lead_id;
DROP INDEX IF EXISTS idx_email_send_queue_email_id;
DROP INDEX IF EXISTS idx_email_send_queue_user_id;
DROP INDEX IF EXISTS idx_priority_queue_campaign;
DROP INDEX IF EXISTS idx_priority_queue_user;
DROP INDEX IF EXISTS idx_priority_queue_status;
DROP INDEX IF EXISTS idx_priority_queue_priority;
DROP INDEX IF EXISTS idx_priority_queue_scheduled;
DROP INDEX IF EXISTS idx_email_priority_queue_email_id;
DROP INDEX IF EXISTS idx_email_priority_queue_lead_id;

-- ============================================
-- PART 14: Drop Unused Indexes on Rtrvr/Research Tables
-- ============================================

DROP INDEX IF EXISTS idx_rtrvr_usage_logs_scrape_type;
DROP INDEX IF EXISTS idx_rtrvr_usage_logs_user_id;
DROP INDEX IF EXISTS idx_rtrvr_usage_logs_campaign_id;
DROP INDEX IF EXISTS idx_rtrvr_usage_logs_created_at;
DROP INDEX IF EXISTS idx_lead_research_user_id;
DROP INDEX IF EXISTS idx_lead_research_status;
DROP INDEX IF EXISTS idx_research_jobs_user_id;
DROP INDEX IF EXISTS idx_research_jobs_lead_id;
DROP INDEX IF EXISTS idx_research_jobs_status;
DROP INDEX IF EXISTS idx_research_jobs_campaign_id;

-- ============================================
-- PART 15: Drop Unused Indexes on Intent/Signal Tables
-- ============================================

DROP INDEX IF EXISTS idx_intent_signals_user_id;
DROP INDEX IF EXISTS idx_intent_signals_type;
DROP INDEX IF EXISTS idx_intent_signals_strength;
DROP INDEX IF EXISTS idx_intent_signals_actionable;
DROP INDEX IF EXISTS idx_intent_signals_campaign_id;
DROP INDEX IF EXISTS idx_website_health_user_id;
DROP INDEX IF EXISTS idx_website_health_potential;

-- ============================================
-- PART 16: Drop Unused Indexes on GPT-5 Feature Tables
-- ============================================

DROP INDEX IF EXISTS idx_cfg_grammars_user_id;
DROP INDEX IF EXISTS idx_cfg_grammars_name;
DROP INDEX IF EXISTS idx_custom_tools_user_id;
DROP INDEX IF EXISTS idx_custom_tools_campaign_id;
DROP INDEX IF EXISTS idx_custom_tools_name;
DROP INDEX IF EXISTS idx_custom_tools_cfg_grammar_id;
DROP INDEX IF EXISTS idx_allowed_tools_user_id;
DROP INDEX IF EXISTS idx_allowed_tools_campaign_id;
DROP INDEX IF EXISTS idx_compaction_settings_user_id;

-- ============================================
-- PART 17: Drop Unused Indexes on Competitor/Scraping Tables
-- ============================================

DROP INDEX IF EXISTS idx_competitor_user_id;
DROP INDEX IF EXISTS idx_competitor_website;
DROP INDEX IF EXISTS idx_scraping_templates_user_id;
DROP INDEX IF EXISTS idx_scraping_templates_public;
DROP INDEX IF EXISTS idx_multi_source_user_id;
DROP INDEX IF EXISTS idx_multi_source_platform;
DROP INDEX IF EXISTS idx_multi_source_lead_id;
DROP INDEX IF EXISTS idx_multi_source_leads_campaign_id;
DROP INDEX IF EXISTS idx_multi_source_leads_merged_into;

-- ============================================
-- PART 18: Drop Unused Indexes on Automation/Schedule Tables
-- ============================================

DROP INDEX IF EXISTS idx_automation_schedules_user;
DROP INDEX IF EXISTS idx_automation_schedules_campaign;
DROP INDEX IF EXISTS idx_automation_schedules_next_run;
DROP INDEX IF EXISTS idx_email_previews_user;
DROP INDEX IF EXISTS idx_email_previews_lead;
DROP INDEX IF EXISTS idx_email_previews_campaign;
DROP INDEX IF EXISTS idx_email_previews_status;

-- ============================================
-- PART 19: Drop Unused Indexes on Infrastructure Tables
-- ============================================

DROP INDEX IF EXISTS idx_idempotency_keys_key;
DROP INDEX IF EXISTS idx_idempotency_keys_user_id;
DROP INDEX IF EXISTS idx_job_checkpoints_job;
DROP INDEX IF EXISTS idx_job_checkpoints_campaign;
DROP INDEX IF EXISTS idx_job_checkpoints_status;
DROP INDEX IF EXISTS idx_job_checkpoints_user_id;
DROP INDEX IF EXISTS idx_dead_letter_user;
DROP INDEX IF EXISTS idx_dead_letter_reviewed;
DROP INDEX IF EXISTS idx_dead_letter_items_campaign_id;
DROP INDEX IF EXISTS idx_dead_letter_items_reviewed_by;

-- ============================================
-- PART 20: Drop Unused Indexes on Rate Limit Tables
-- ============================================

DROP INDEX IF EXISTS idx_rate_limit_buckets_user_op;
DROP INDEX IF EXISTS idx_rate_violations_user;
DROP INDEX IF EXISTS idx_rate_limit_logs_key_created;
DROP INDEX IF EXISTS idx_retry_queue_user;
DROP INDEX IF EXISTS idx_retry_queue_status;
DROP INDEX IF EXISTS idx_retry_queue_campaign_id;

-- ============================================
-- PART 21: Drop Unused Indexes on Monitoring Tables
-- ============================================

DROP INDEX IF EXISTS idx_operation_spans_trace;
DROP INDEX IF EXISTS idx_operation_spans_user;
DROP INDEX IF EXISTS idx_operation_spans_operation;
DROP INDEX IF EXISTS idx_stale_jobs_detected;
DROP INDEX IF EXISTS idx_email_health_scores_user_id;

-- ============================================
-- PART 22: Drop Unused Indexes on Notification Tables
-- ============================================

DROP INDEX IF EXISTS idx_notifications_user_unread;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_campaign_id;
DROP INDEX IF EXISTS idx_notifications_email_id;
DROP INDEX IF EXISTS idx_notifications_lead_id;

-- ============================================
-- PART 23: Drop Unused Indexes on RBAC Tables
-- ============================================

DROP INDEX IF EXISTS idx_user_roles_role_id;
DROP INDEX IF EXISTS idx_role_permissions_role_id;
DROP INDEX IF EXISTS idx_role_permissions_permission_id;
DROP INDEX IF EXISTS idx_user_feature_overrides_user_id;
DROP INDEX IF EXISTS idx_user_feature_overrides_feature_flag_id;
DROP INDEX IF EXISTS idx_user_feature_overrides_granted_by;
DROP INDEX IF EXISTS idx_user_roles_granted_by;

-- ============================================
-- PART 24: Drop Unused Indexes on Audit/Profile Tables
-- ============================================

DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_target_user_id;
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_profiles_is_admin;

-- ============================================
-- PART 25: Drop Unused Indexes on Messaging Tables
-- ============================================

DROP INDEX IF EXISTS idx_connected_channels_user_id;
DROP INDEX IF EXISTS idx_connected_channels_channel_type;
DROP INDEX IF EXISTS idx_connected_channels_unipile_account;
DROP INDEX IF EXISTS idx_connected_channels_active;
DROP INDEX IF EXISTS idx_linkedin_messages_user_id;
DROP INDEX IF EXISTS idx_linkedin_messages_channel_id;
DROP INDEX IF EXISTS idx_linkedin_messages_campaign_id;
DROP INDEX IF EXISTS idx_linkedin_messages_lead_id;
DROP INDEX IF EXISTS idx_linkedin_messages_status;

-- ============================================
-- PART 26: Drop Unused Indexes on Subscription Tables
-- ============================================

DROP INDEX IF EXISTS idx_user_subscriptions_plan_id;
DROP INDEX IF EXISTS idx_user_subscriptions_status;
DROP INDEX IF EXISTS idx_user_subscriptions_stripe_customer;

-- ============================================
-- PART 27: Drop Unused Indexes on Inbox Tables
-- ============================================

DROP INDEX IF EXISTS idx_inbox_contacts_user_id;
DROP INDEX IF EXISTS idx_inbox_contacts_email;
DROP INDEX IF EXISTS idx_inbox_contacts_lead_id;
DROP INDEX IF EXISTS idx_inbox_conversations_user_id;
DROP INDEX IF EXISTS idx_inbox_conversations_contact_id;
DROP INDEX IF EXISTS idx_inbox_conversations_last_message_at;
DROP INDEX IF EXISTS idx_inbox_conversations_status;
DROP INDEX IF EXISTS idx_inbox_conversations_platform;
DROP INDEX IF EXISTS idx_inbox_conversations_user_archived;
DROP INDEX IF EXISTS idx_inbox_messages_user_id;
DROP INDEX IF EXISTS idx_inbox_messages_conversation_id;
DROP INDEX IF EXISTS idx_inbox_messages_sent_at;
DROP INDEX IF EXISTS idx_inbox_messages_email_id;
DROP INDEX IF EXISTS idx_inbox_messages_direction;
DROP INDEX IF EXISTS idx_inbox_messages_contact_id;

-- ============================================
-- PART 28: Drop Unused Indexes on Outreach Tables
-- ============================================

DROP INDEX IF EXISTS idx_outreach_sequences_user_id;
DROP INDEX IF EXISTS idx_outreach_sequences_campaign_id;
DROP INDEX IF EXISTS idx_outreach_sequence_steps_sequence_id;
DROP INDEX IF EXISTS idx_outreach_sequence_steps_step_number;

-- ============================================
-- PART 29: Fix Security Definer View
-- ============================================

-- Drop and recreate system_health_metrics view without SECURITY DEFINER
DROP VIEW IF EXISTS public.system_health_metrics;
CREATE VIEW public.system_health_metrics AS
SELECT 
  'database_connections' as metric_name,
  count(*)::text as metric_value,
  NOW() as measured_at
FROM pg_stat_activity
WHERE datname = current_database()
UNION ALL
SELECT 
  'table_count' as metric_name,
  count(*)::text as metric_value,
  NOW() as measured_at
FROM information_schema.tables
WHERE table_schema = 'public';

-- Grant access to authenticated users
GRANT SELECT ON public.system_health_metrics TO authenticated;

-- ============================================
-- PART 30: Consolidate Multiple Permissive Policies
-- ============================================

-- Note: Multiple permissive policies are actually intended behavior in most cases.
-- They allow access from multiple paths (admin OR owner) which is the desired security model.
-- Postgres will OR them together, allowing access if ANY policy allows it.
-- These policies are working correctly and don't need to be changed.

-- However, we can remove truly redundant policies where we have:
-- - "Admins can manage X" (FOR ALL)
-- - "Admins can view X" (FOR SELECT)
-- The FOR ALL policy already covers SELECT, so we can remove the SELECT-only policy.

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all overrides" ON public.user_feature_overrides;
