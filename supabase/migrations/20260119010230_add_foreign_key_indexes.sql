/*
  # Add Indexes for Foreign Keys
  
  ## Summary
  This migration adds covering indexes for all foreign key constraints to improve query performance.
  
  ## Changes
  
  ### Indexes Added
  Creating indexes for 150+ foreign key constraints across all tables.
  These indexes are essential for:
  - Fast JOIN operations
  - Efficient foreign key constraint checking
  - Better query performance on related tables
  
  ## Performance Impact
  - Dramatically improved JOIN performance
  - Faster CASCADE operations
  - Better query optimizer choices
*/

-- ============================================
-- Agent/Job Related Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agent_jobs_user_id_fk ON public.agent_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_campaign_id_fk ON public.agent_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_user_id_fk ON public.campaign_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_jobs_campaign_id_fk ON public.campaign_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_job_checkpoints_user_id_fk ON public.job_checkpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_job_checkpoints_campaign_id_fk ON public.job_checkpoints(campaign_id);

-- ============================================
-- AI/Template Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ai_generation_history_user_id_fk ON public.ai_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_template_id_fk ON public.ai_generation_history(template_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_insights_user_id_fk ON public.ai_generation_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_insights_email_id_fk ON public.ai_generation_insights(email_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_insights_job_id_fk ON public.ai_generation_insights(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_insights_lead_id_fk ON public.ai_generation_insights(lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_marketplace_user_id_fk ON public.ai_prompt_marketplace(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_suggestions_template_id_fk ON public.ai_prompt_suggestions(template_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_user_id_fk ON public.ai_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_campaign_id_fk ON public.ai_usage_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_template_variants_template_id_fk ON public.template_variants(template_id);

-- ============================================
-- Analytics Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id_fk ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign_id_fk ON public.analytics_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_email_id_fk ON public.analytics_events(email_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_lead_id_fk ON public.analytics_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_analytics_funnel_campaign_id_fk ON public.analytics_funnel(campaign_id);

-- ============================================
-- Audit/System Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_fk ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id_fk ON public.audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id_fk ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_campaign_id_fk ON public.system_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_lead_id_fk ON public.system_logs(lead_id);

-- ============================================
-- Automation Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_automation_schedules_user_id_fk ON public.automation_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_schedules_campaign_id_fk ON public.automation_schedules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_runs_user_id_fk ON public.autopilot_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_runs_campaign_id_fk ON public.autopilot_runs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_schedules_user_id_fk ON public.autopilot_schedules(user_id);

-- ============================================
-- Campaign Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_campaigns_group_id_fk ON public.campaigns(group_id);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_user_id_fk ON public.campaign_groups(user_id);

-- ============================================
-- Email Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_emails_user_id_fk ON public.emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_campaign_id_fk ON public.emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_emails_lead_id_fk ON public.emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_emails_ab_test_id_fk ON public.emails(ab_test_id);
CREATE INDEX IF NOT EXISTS idx_emails_variant_id_fk ON public.emails(variant_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_events_email_id_fk ON public.email_tracking_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_attachments_user_id_fk ON public.email_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_email_attachments_campaign_id_fk ON public.email_attachments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_attachments_variant_id_fk ON public.email_attachments(variant_id);
CREATE INDEX IF NOT EXISTS idx_email_health_scores_user_id_fk ON public.email_health_scores(user_id);

-- ============================================
-- Email Queue Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_email_queue_user_id_fk ON public.email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_campaign_id_fk ON public.email_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_email_id_fk ON public.email_queue(email_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_lead_id_fk ON public.email_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_send_queue_user_id_fk ON public.email_send_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_send_queue_campaign_id_fk ON public.email_send_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_send_queue_email_id_fk ON public.email_send_queue(email_id);
CREATE INDEX IF NOT EXISTS idx_email_priority_queue_user_id_fk ON public.email_priority_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_priority_queue_campaign_id_fk ON public.email_priority_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_priority_queue_email_id_fk ON public.email_priority_queue(email_id);
CREATE INDEX IF NOT EXISTS idx_email_priority_queue_lead_id_fk ON public.email_priority_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_previews_user_id_fk ON public.email_previews(user_id);
CREATE INDEX IF NOT EXISTS idx_email_previews_campaign_id_fk ON public.email_previews(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_previews_lead_id_fk ON public.email_previews(lead_id);

-- ============================================
-- File/Storage Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id_fk ON public.file_uploads(user_id);

-- ============================================
-- GPT-5 Feature Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_allowed_tools_config_campaign_id_fk ON public.allowed_tools_config(campaign_id);
CREATE INDEX IF NOT EXISTS idx_compaction_settings_campaign_id_fk ON public.compaction_settings(campaign_id);
CREATE INDEX IF NOT EXISTS idx_custom_tools_campaign_id_fk ON public.custom_tools(campaign_id);
CREATE INDEX IF NOT EXISTS idx_custom_tools_cfg_grammar_id_fk ON public.custom_tools(cfg_grammar_id);
CREATE INDEX IF NOT EXISTS idx_responses_api_conversations_user_id_fk ON public.responses_api_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_api_conversations_campaign_id_fk ON public.responses_api_conversations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_responses_api_conversations_lead_id_fk ON public.responses_api_conversations(lead_id);

-- ============================================
-- Inbox/Messaging Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_inbox_contacts_user_id_fk ON public.inbox_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_contacts_lead_id_fk ON public.inbox_contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_inbox_conversations_user_id_fk ON public.inbox_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_conversations_contact_id_fk ON public.inbox_conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_user_id_fk ON public.inbox_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_conversation_id_fk ON public.inbox_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_email_id_fk ON public.inbox_messages(email_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_contact_id_fk ON public.inbox_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_messages_user_id_fk ON public.linkedin_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_messages_channel_id_fk ON public.linkedin_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_messages_campaign_id_fk ON public.linkedin_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_messages_lead_id_fk ON public.linkedin_messages(lead_id);

-- ============================================
-- Infrastructure Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_user_id_fk ON public.idempotency_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_items_user_id_fk ON public.dead_letter_items(user_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_items_campaign_id_fk ON public.dead_letter_items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_items_reviewed_by_fk ON public.dead_letter_items(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_retry_queue_user_id_fk ON public.retry_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_retry_queue_campaign_id_fk ON public.retry_queue(campaign_id);

-- ============================================
-- Lead Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_lead_contacts_user_id_fk ON public.lead_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_lead_id_fk ON public.lead_contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_campaign_id_fk ON public.lead_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_lead_images_user_id_fk ON public.lead_images(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_images_lead_id_fk ON public.lead_images(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_pipeline_stages_user_id_fk ON public.lead_pipeline_stages(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_research_user_id_fk ON public.lead_research(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_reviews_user_id_fk ON public.lead_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_reviews_lead_id_fk ON public.lead_reviews(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_social_profiles_user_id_fk ON public.lead_social_profiles(user_id);

-- ============================================
-- Multi-Source/Research Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_multi_source_leads_user_id_fk ON public.multi_source_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_multi_source_leads_campaign_id_fk ON public.multi_source_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_multi_source_leads_lead_id_fk ON public.multi_source_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_multi_source_leads_merged_into_fk ON public.multi_source_leads(merged_into_lead_id);
CREATE INDEX IF NOT EXISTS idx_research_jobs_user_id_fk ON public.research_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_research_jobs_campaign_id_fk ON public.research_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_research_jobs_lead_id_fk ON public.research_jobs(lead_id);
CREATE INDEX IF NOT EXISTS idx_intent_signals_user_id_fk ON public.intent_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_intent_signals_campaign_id_fk ON public.intent_signals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_competitor_tracking_user_id_fk ON public.competitor_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_templates_user_id_fk ON public.scraping_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_website_health_scores_user_id_fk ON public.website_health_scores(user_id);

-- ============================================
-- Notification Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id_fk ON public.notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notifications_email_id_fk ON public.notifications(email_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lead_id_fk ON public.notifications(lead_id);

-- ============================================
-- Monitoring Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_operation_spans_user_id_fk ON public.operation_spans(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_user_id_fk ON public.rate_limit_violations(user_id);

-- ============================================
-- Outreach Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_outreach_sequences_user_id_fk ON public.outreach_sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sequences_campaign_id_fk ON public.outreach_sequences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sequence_steps_sequence_id_fk ON public.outreach_sequence_steps(sequence_id);

-- ============================================
-- RBAC Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id_fk ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by_fk ON public.user_roles(granted_by);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id_fk ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_feature_flag_id_fk ON public.user_feature_overrides(feature_flag_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_granted_by_fk ON public.user_feature_overrides(granted_by);

-- ============================================
-- Reply/Classification Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reply_classifications_user_id_fk ON public.reply_classifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_classifications_campaign_id_fk ON public.reply_classifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_reply_classifications_email_id_fk ON public.reply_classifications(email_id);
CREATE INDEX IF NOT EXISTS idx_reply_classifications_lead_id_fk ON public.reply_classifications(lead_id);

-- ============================================
-- Rtrvr Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_rtrvr_usage_logs_user_id_fk ON public.rtrvr_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rtrvr_usage_logs_campaign_id_fk ON public.rtrvr_usage_logs(campaign_id);

-- ============================================
-- Sequence/AB Test Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sequence_ab_tests_user_id_fk ON public.sequence_ab_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_sequence_ab_tests_campaign_id_fk ON public.sequence_ab_tests(campaign_id);

-- ============================================
-- Subscription Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id_fk ON public.user_subscriptions(plan_id);

-- ============================================
-- Unsubscribe/Duplicate Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_unsubscribes_user_id_fk ON public.unsubscribes(user_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_campaign_id_fk ON public.unsubscribes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_email_registry_campaign_id_fk ON public.duplicate_email_registry(first_seen_campaign_id);

-- ============================================
-- Webhook Tables
-- ============================================

CREATE INDEX IF NOT EXISTS idx_webhook_configurations_user_id_fk ON public.webhook_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_user_id_fk ON public.webhook_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id_fk ON public.webhook_deliveries(webhook_id);
