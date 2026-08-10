export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          avatar_url: string | null
          company_logo: string | null
          storage_used_bytes: number
          created_at: string
          updated_at: string
          is_admin: boolean | null
          organization_id: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          company_logo?: string | null
          storage_used_bytes?: number
          created_at?: string
          updated_at?: string
          is_admin: boolean | null
          organization_id: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          company_logo?: string | null
          storage_used_bytes?: number
          created_at?: string
          updated_at?: string
          is_admin: boolean | null
          organization_id: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'free' | 'starter' | 'professional' | 'enterprise'
          status: 'active' | 'cancelled' | 'expired'
          credits_remaining: number
          credits_total: number
          billing_cycle_start: string
          billing_cycle_end: string
          storage_limit_bytes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type?: 'free' | 'starter' | 'professional' | 'enterprise'
          status?: 'active' | 'cancelled' | 'expired'
          credits_remaining?: number
          credits_total?: number
          billing_cycle_start?: string
          billing_cycle_end?: string
          storage_limit_bytes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'free' | 'starter' | 'professional' | 'enterprise'
          status?: 'active' | 'cancelled' | 'expired'
          credits_remaining?: number
          credits_total?: number
          billing_cycle_start?: string
          billing_cycle_end?: string
          storage_limit_bytes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          niche: string
          location: string
          ai_prompt: string | null
          status: 'draft' | 'active' | 'paused' | 'completed'
          email_template: string | null
          total_leads: number
          emails_sent: number
          emails_opened: number
          emails_replied: number
          automation_enabled: boolean
          scraping_status: 'not_started' | 'in_progress' | 'completed' | 'failed'
          ai_personalization: boolean
          sending_schedule: Json
          created_at: string
          updated_at: string
          launched_at: string | null
          apify_settings: Json | null
          group_id: string | null
          priority: number | null
          ab_testing_enabled: boolean | null
          auto_advance_pipeline: boolean | null
          warmup_mode: boolean | null
          warmup_day: number | null
          cost_per_lead: string | null
          total_cost: string | null
          rtrvr_settings: Json | null
          scraping_provider: string | null
          openai_extraction_enabled: boolean | null
          autopilot_next_run_at: string | null
          autopilot_cron_expression: string | null
          autopilot_schedule_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          niche: string
          location: string
          ai_prompt?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed'
          email_template?: string | null
          total_leads?: number
          emails_sent?: number
          emails_opened?: number
          emails_replied?: number
          automation_enabled?: boolean
          scraping_status?: 'not_started' | 'in_progress' | 'completed' | 'failed'
          ai_personalization?: boolean
          sending_schedule?: Json
          created_at?: string
          updated_at?: string
          launched_at?: string | null
          apify_settings: Json | null
          group_id: string | null
          priority: number | null
          ab_testing_enabled: boolean | null
          auto_advance_pipeline: boolean | null
          warmup_mode: boolean | null
          warmup_day: number | null
          cost_per_lead: string | null
          total_cost: string | null
          rtrvr_settings: Json | null
          scraping_provider: string | null
          openai_extraction_enabled: boolean | null
          autopilot_next_run_at: string | null
          autopilot_cron_expression: string | null
          autopilot_schedule_id: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          niche?: string
          location?: string
          ai_prompt?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed'
          email_template?: string | null
          total_leads?: number
          emails_sent?: number
          emails_opened?: number
          emails_replied?: number
          automation_enabled?: boolean
          scraping_status?: 'not_started' | 'in_progress' | 'completed' | 'failed'
          ai_personalization?: boolean
          sending_schedule?: Json
          created_at?: string
          updated_at?: string
          launched_at?: string | null
          apify_settings: Json | null
          group_id: string | null
          priority: number | null
          ab_testing_enabled: boolean | null
          auto_advance_pipeline: boolean | null
          warmup_mode: boolean | null
          warmup_day: number | null
          cost_per_lead: string | null
          total_cost: string | null
          rtrvr_settings: Json | null
          scraping_provider: string | null
          openai_extraction_enabled: boolean | null
          autopilot_next_run_at: string | null
          autopilot_cron_expression: string | null
          autopilot_schedule_id: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          business_name: string
          email: string
          phone: string | null
          address: string | null
          website: string | null
          rating: number | null
          review_count: number
          email_type: 'personal' | 'generic' | 'unknown'
          decision_maker_name: string | null
          status: 'new' | 'contacted' | 'replied' | 'converted' | 'bounced'
          google_maps_url: string | null
          notes: string | null
          scraped_data: Json
          personalization_score: number
          last_contacted_at: string | null
          email_verified: boolean
          verification_status: 'pending' | 'valid' | 'invalid' | 'risky'
          verification_date: string | null
          verification_details: Json | null
          has_replied: boolean
          replied_at: string | null
          last_email_sent_at: string | null
          emails_sent_count: number
          created_at: string
          updated_at: string
          real_email: string | null
          social_profiles: Json | null
          employee_count: number | null
          industry: string | null
          opening_hours: Json | null
          image_categories: Json | null
          reviews_distribution: Json | null
          popular_times: Json | null
          questions_answers: Json | null
          web_results: Json | null
          directory_places: Json | null
          quality_score: number | null
          quality_factors: Json | null
          pipeline_stage: string | null
          pipeline_stage_changed_at: string | null
          timezone: string | null
          best_send_time: string | null
          bounce_count: number | null
          ab_variant: string | null
          extraction_confidence: string | null
          extraction_source: string | null
          research_completed: boolean | null
          website_health_checked: boolean | null
          intent_score: number | null
          sources_count: number | null
          priority_score: number | null
          queue_position: number | null
          last_queued_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          business_name: string
          email: string
          phone?: string | null
          address?: string | null
          website?: string | null
          rating?: number | null
          review_count?: number
          email_type?: 'personal' | 'generic' | 'unknown'
          decision_maker_name?: string | null
          status?: 'new' | 'contacted' | 'replied' | 'converted' | 'bounced'
          google_maps_url?: string | null
          notes?: string | null
          scraped_data?: Json
          personalization_score?: number
          last_contacted_at?: string | null
          email_verified?: boolean
          verification_status?: 'pending' | 'valid' | 'invalid' | 'risky'
          verification_date?: string | null
          verification_details?: Json | null
          has_replied?: boolean
          replied_at?: string | null
          last_email_sent_at?: string | null
          emails_sent_count?: number
          created_at?: string
          updated_at?: string
          real_email: string | null
          social_profiles: Json | null
          employee_count: number | null
          industry: string | null
          opening_hours: Json | null
          image_categories: Json | null
          reviews_distribution: Json | null
          popular_times: Json | null
          questions_answers: Json | null
          web_results: Json | null
          directory_places: Json | null
          quality_score: number | null
          quality_factors: Json | null
          pipeline_stage: string | null
          pipeline_stage_changed_at: string | null
          timezone: string | null
          best_send_time: string | null
          bounce_count: number | null
          ab_variant: string | null
          extraction_confidence: string | null
          extraction_source: string | null
          research_completed: boolean | null
          website_health_checked: boolean | null
          intent_score: number | null
          sources_count: number | null
          priority_score: number | null
          queue_position: number | null
          last_queued_at: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string
          business_name?: string
          email?: string
          phone?: string | null
          address?: string | null
          website?: string | null
          rating?: number | null
          review_count?: number
          email_type?: 'personal' | 'generic' | 'unknown'
          decision_maker_name?: string | null
          status?: 'new' | 'contacted' | 'replied' | 'converted' | 'bounced'
          google_maps_url?: string | null
          notes?: string | null
          scraped_data?: Json
          personalization_score?: number
          last_contacted_at?: string | null
          email_verified?: boolean
          verification_status?: 'pending' | 'valid' | 'invalid' | 'risky'
          verification_date?: string | null
          verification_details?: Json | null
          has_replied?: boolean
          replied_at?: string | null
          last_email_sent_at?: string | null
          emails_sent_count?: number
          created_at?: string
          updated_at?: string
          real_email: string | null
          social_profiles: Json | null
          employee_count: number | null
          industry: string | null
          opening_hours: Json | null
          image_categories: Json | null
          reviews_distribution: Json | null
          popular_times: Json | null
          questions_answers: Json | null
          web_results: Json | null
          directory_places: Json | null
          quality_score: number | null
          quality_factors: Json | null
          pipeline_stage: string | null
          pipeline_stage_changed_at: string | null
          timezone: string | null
          best_send_time: string | null
          bounce_count: number | null
          ab_variant: string | null
          extraction_confidence: string | null
          extraction_source: string | null
          research_completed: boolean | null
          website_health_checked: boolean | null
          intent_score: number | null
          sources_count: number | null
          priority_score: number | null
          queue_position: number | null
          last_queued_at: string | null
        }
        Relationships: []
      }
      emails: {
        Row: {
          id: string
          campaign_id: string
          lead_id: string
          user_id: string
          subject: string
          body: string
          personalization_data: Json
          status: 'queued' | 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
          sent_at: string | null
          opened_at: string | null
          replied_at: string | null
          error_message: string | null
          ai_generated: boolean
          generation_prompt: string | null
          personalization_tokens: Json
          created_at: string
          variant_id: string | null
          unipile_message_id: string | null
          ab_variant: string | null
          ab_test_id: string | null
          sequence_step: number | null
        }
        Insert: {
          id?: string
          campaign_id: string
          lead_id: string
          user_id: string
          subject: string
          body: string
          personalization_data?: Json
          status?: 'queued' | 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
          sent_at?: string | null
          opened_at?: string | null
          replied_at?: string | null
          error_message?: string | null
          ai_generated?: boolean
          generation_prompt?: string | null
          personalization_tokens?: Json
          created_at?: string
          variant_id: string | null
          unipile_message_id: string | null
          ab_variant: string | null
          ab_test_id: string | null
          sequence_step: number | null
        }
        Update: {
          id?: string
          campaign_id?: string
          lead_id?: string
          user_id?: string
          subject?: string
          body?: string
          personalization_data?: Json
          status?: 'queued' | 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
          sent_at?: string | null
          opened_at?: string | null
          replied_at?: string | null
          error_message?: string | null
          ai_generated?: boolean
          generation_prompt?: string | null
          personalization_tokens?: Json
          created_at?: string
          variant_id: string | null
          unipile_message_id: string | null
          ab_variant: string | null
          ab_test_id: string | null
          sequence_step: number | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          gmail_accounts: Json
          daily_email_limit: number
          email_sending_schedule: Json
          ai_model_preference: string
          notification_preferences: Json
          created_at: string
          updated_at: string
          global_daily_limit: number | null
          business_days_only: boolean | null
          send_window_start: string | null
          send_window_end: string | null
          default_timezone: string | null
          auto_pause_on_reply: boolean | null
          reply_notification_email: string | null
          apify_auto_enrich: boolean | null
          apify_default_settings: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          gmail_accounts?: Json
          daily_email_limit?: number
          email_sending_schedule?: Json
          ai_model_preference?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
          global_daily_limit: number | null
          business_days_only: boolean | null
          send_window_start: string | null
          send_window_end: string | null
          default_timezone: string | null
          auto_pause_on_reply: boolean | null
          reply_notification_email: string | null
          apify_auto_enrich: boolean | null
          apify_default_settings: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          gmail_accounts?: Json
          daily_email_limit?: number
          email_sending_schedule?: Json
          ai_model_preference?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
          global_daily_limit: number | null
          business_days_only: boolean | null
          send_window_start: string | null
          send_window_end: string | null
          default_timezone: string | null
          auto_pause_on_reply: boolean | null
          reply_notification_email: string | null
          apify_auto_enrich: boolean | null
          apify_default_settings: Json | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string
          campaign_id: string | null
          lead_id: string | null
          email_id: string | null
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          campaign_id?: string | null
          lead_id?: string | null
          email_id?: string | null
          event_type: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          campaign_id?: string | null
          lead_id?: string | null
          email_id?: string | null
          event_type?: string
          event_data?: Json
          created_at?: string
        }
        Relationships: []
      }
      campaign_jobs: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          job_type: 'scrape_leads' | 'generate_emails' | 'send_emails' | 'schedule_campaign'
          status: 'pending' | 'processing' | 'completed' | 'failed'
          progress: number
          total_items: number
          processed_items: number
          result_data: Json
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          job_type: 'scrape_leads' | 'generate_emails' | 'send_emails' | 'schedule_campaign'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          progress?: number
          total_items?: number
          processed_items?: number
          result_data?: Json
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string
          job_type?: 'scrape_leads' | 'generate_emails' | 'send_emails' | 'schedule_campaign'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          progress?: number
          total_items?: number
          processed_items?: number
          result_data?: Json
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          subject: string
          body: string
          template_type: 'manual' | 'ai'
          ai_prompt: string | null
          pitch: string | null
          tone: string
          email_goal: string
          industry: string | null
          target_audience: string | null
          ai_quality_score: number
          personalization_level: string
          is_marketplace_template: boolean
          variables: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          subject: string
          body: string
          template_type?: 'manual' | 'ai'
          ai_prompt?: string | null
          pitch?: string | null
          tone?: string
          email_goal?: string
          industry?: string | null
          target_audience?: string | null
          ai_quality_score?: number
          personalization_level?: string
          is_marketplace_template?: boolean
          variables?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          subject?: string
          body?: string
          template_type?: 'manual' | 'ai'
          ai_prompt?: string | null
          pitch?: string | null
          tone?: string
          email_goal?: string
          industry?: string | null
          target_audience?: string | null
          ai_quality_score?: number
          personalization_level?: string
          is_marketplace_template?: boolean
          variables?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_prompt_marketplace: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          prompt_text: string
          category: 'cold_outreach' | 'follow_up' | 'meeting_request' | 'value_proposition' | 're_engagement' | 'introduction' | 'other'
          industry: string | null
          tone: 'professional' | 'friendly' | 'casual' | 'persuasive' | 'authoritative' | 'empathetic' | 'urgent' | 'consultative'
          is_public: boolean
          usage_count: number
          avg_reply_rate: number
          avg_open_rate: number
          rating: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          prompt_text: string
          category?: 'cold_outreach' | 'follow_up' | 'meeting_request' | 'value_proposition' | 're_engagement' | 'introduction' | 'other'
          industry?: string | null
          tone?: 'professional' | 'friendly' | 'casual' | 'persuasive' | 'authoritative' | 'empathetic' | 'urgent' | 'consultative'
          is_public?: boolean
          usage_count?: number
          avg_reply_rate?: number
          avg_open_rate?: number
          rating?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          prompt_text?: string
          category?: 'cold_outreach' | 'follow_up' | 'meeting_request' | 'value_proposition' | 're_engagement' | 'introduction' | 'other'
          industry?: string | null
          tone?: 'professional' | 'friendly' | 'casual' | 'persuasive' | 'authoritative' | 'empathetic' | 'urgent' | 'consultative'
          is_public?: boolean
          usage_count?: number
          avg_reply_rate?: number
          avg_open_rate?: number
          rating?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      template_variants: {
        Row: {
          id: string
          template_id: string
          variant_name: string
          subject: string | null
          body: string | null
          ai_prompt: string | null
          sent_count: number
          open_count: number
          reply_count: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          variant_name: string
          subject?: string | null
          body?: string | null
          ai_prompt?: string | null
          sent_count?: number
          open_count?: number
          reply_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          variant_name?: string
          subject?: string | null
          body?: string | null
          ai_prompt?: string | null
          sent_count?: number
          open_count?: number
          reply_count?: number
          created_at?: string
        }
        Relationships: []
      }
      user_ai_preferences: {
        Row: {
          user_id: string
          preferred_tone: string
          preferred_length: 'short' | 'medium' | 'long'
          ai_model: 'gpt-4' | 'gpt-3.5' | 'claude'
          creativity_level: number
          brand_voice: string | null
          avoid_phrases: string[]
          custom_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          preferred_tone?: string
          preferred_length?: 'short' | 'medium' | 'long'
          ai_model?: 'gpt-4' | 'gpt-3.5' | 'claude'
          creativity_level?: number
          brand_voice?: string | null
          avoid_phrases?: string[]
          custom_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          preferred_tone?: string
          preferred_length?: 'short' | 'medium' | 'long'
          ai_model?: 'gpt-4' | 'gpt-3.5' | 'claude'
          creativity_level?: number
          brand_voice?: string | null
          avoid_phrases?: string[]
          custom_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_generation_history: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          prompt_used: string
          generated_subject: string | null
          generated_body: string | null
          user_rating: number | null
          was_edited: boolean
          performance_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id?: string | null
          prompt_used: string
          generated_subject?: string | null
          generated_body?: string | null
          user_rating?: number | null
          was_edited?: boolean
          performance_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string | null
          prompt_used?: string
          generated_subject?: string | null
          generated_body?: string | null
          user_rating?: number | null
          was_edited?: boolean
          performance_score?: number | null
          created_at?: string
        }
        Relationships: []
      }
      ai_prompt_suggestions: {
        Row: {
          id: string
          template_id: string
          suggestion_type: 'tone' | 'personalization' | 'clarity' | 'specificity' | 'length' | 'variable_usage' | 'compliance' | 'engagement'
          suggestion_text: string
          priority: number
          was_applied: boolean
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          suggestion_type: 'tone' | 'personalization' | 'clarity' | 'specificity' | 'length' | 'variable_usage' | 'compliance' | 'engagement'
          suggestion_text: string
          priority?: number
          was_applied?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          suggestion_type?: 'tone' | 'personalization' | 'clarity' | 'specificity' | 'length' | 'variable_usage' | 'compliance' | 'engagement'
          suggestion_text?: string
          priority?: number
          was_applied?: boolean
          created_at?: string
        }
        Relationships: []
      }
      template_performance_metrics: {
        Row: {
          template_id: string
          total_sent: number
          total_opened: number
          total_replied: number
          total_bounced: number
          avg_response_time_hours: number | null
          open_rate: number
          reply_rate: number
          quality_score: number
          personalization_score: number
          spam_score: number
          last_calculated_at: string | null
          updated_at: string
        }
        Insert: {
          template_id: string
          total_sent?: number
          total_opened?: number
          total_replied?: number
          total_bounced?: number
          avg_response_time_hours?: number | null
          open_rate?: number
          reply_rate?: number
          quality_score?: number
          personalization_score?: number
          spam_score?: number
          last_calculated_at?: string | null
          updated_at?: string
        }
        Update: {
          template_id?: string
          total_sent?: number
          total_opened?: number
          total_replied?: number
          total_bounced?: number
          avg_response_time_hours?: number | null
          open_rate?: number
          reply_rate?: number
          quality_score?: number
          personalization_score?: number
          spam_score?: number
          last_calculated_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gmail_accounts: {
        Row: {
          id: string
          user_id: string
          email: string
          access_token: string | null
          refresh_token: string | null
          daily_limit: number
          emails_sent_today: number
          last_reset_at: string
          is_active: boolean
          created_at: string
          updated_at: string
          unipile_account_id: string | null
          unipile_provider: string | null
          unipile_connected_at: string | null
          webhook_enabled: boolean | null
          warmup_enabled: boolean | null
          warmup_start_date: string | null
          warmup_daily_increment: number | null
          bounce_count: number | null
          spam_reports: number | null
          reputation_score: number | null
          provider_type: string | null
          linkedin_profile_url: string | null
          connection_quota_daily: number | null
          messages_sent_today: number | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          access_token?: string | null
          refresh_token?: string | null
          daily_limit?: number
          emails_sent_today?: number
          last_reset_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          unipile_account_id: string | null
          unipile_provider: string | null
          unipile_connected_at: string | null
          webhook_enabled: boolean | null
          warmup_enabled: boolean | null
          warmup_start_date: string | null
          warmup_daily_increment: number | null
          bounce_count: number | null
          spam_reports: number | null
          reputation_score: number | null
          provider_type: string | null
          linkedin_profile_url: string | null
          connection_quota_daily: number | null
          messages_sent_today: number | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          access_token?: string | null
          refresh_token?: string | null
          daily_limit?: number
          emails_sent_today?: number
          last_reset_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          unipile_account_id: string | null
          unipile_provider: string | null
          unipile_connected_at: string | null
          webhook_enabled: boolean | null
          warmup_enabled: boolean | null
          warmup_start_date: string | null
          warmup_daily_increment: number | null
          bounce_count: number | null
          spam_reports: number | null
          reputation_score: number | null
          provider_type: string | null
          linkedin_profile_url: string | null
          connection_quota_daily: number | null
          messages_sent_today: number | null
        }
        Relationships: []
      }
      email_attachments: {
        Row: {
          id: string
          user_id: string
          campaign_id: string | null
          variant_id: string | null
          file_path: string
          file_name: string
          file_size: number
          mime_type: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          campaign_id?: string | null
          variant_id?: string | null
          file_path: string
          file_name: string
          file_size: number
          mime_type: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          campaign_id?: string | null
          variant_id?: string | null
          file_path?: string
          file_name?: string
          file_size?: number
          mime_type?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          file_path: string
          bucket_name: string
          file_size: number
          mime_type: string
          original_filename: string | null
          uploaded_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          bucket_name: string
          file_size: number
          mime_type: string
          original_filename?: string | null
          uploaded_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          bucket_name?: string
          file_size?: number
          mime_type?: string
          original_filename?: string | null
          uploaded_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      lead_images: {
        Row: {
          id: string
          lead_id: string
          user_id: string
          image_url: string
          thumbnail_url: string | null
          author_name: string | null
          category: string | null
          caption: string | null
          is_primary: boolean
          is_local_storage: boolean
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          user_id: string
          image_url: string
          thumbnail_url?: string | null
          author_name?: string | null
          category?: string | null
          caption?: string | null
          is_primary?: boolean
          is_local_storage?: boolean
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          user_id?: string
          image_url?: string
          thumbnail_url?: string | null
          author_name?: string | null
          category?: string | null
          caption?: string | null
          is_primary?: boolean
          is_local_storage?: boolean
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'reply' | 'open' | 'bounce' | 'campaign_complete' | 'leads_scraped' | 'credits_low' | 'system'
          title: string
          message: string
          campaign_id: string | null
          lead_id: string | null
          email_id: string | null
          metadata: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'reply' | 'open' | 'bounce' | 'campaign_complete' | 'leads_scraped' | 'credits_low' | 'system'
          title: string
          message: string
          campaign_id?: string | null
          lead_id?: string | null
          email_id?: string | null
          metadata?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'reply' | 'open' | 'bounce' | 'campaign_complete' | 'leads_scraped' | 'credits_low' | 'system'
          title?: string
          message?: string
          campaign_id?: string | null
          lead_id?: string | null
          email_id?: string | null
          metadata?: Json
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      agent_jobs: {
        Row: {
          id: string | null
          user_id: string
          campaign_id: string | null
          job_type: string
          status: string
          progress_percentage: number | null
          total_steps: number | null
          completed_steps: number | null
          result_data: Json | null
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          campaign_id: string | null
          job_type: string
          status: string
          progress_percentage: number | null
          total_steps: number | null
          completed_steps: number | null
          result_data: Json | null
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          campaign_id: string | null
          job_type: string | null
          status: string | null
          progress_percentage: number | null
          total_steps: number | null
          completed_steps: number | null
          result_data: Json | null
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string | null
        }
        Relationships: []
      }
      agent_progress_logs: {
        Row: {
          id: string | null
          job_id: string
          timestamp: string | null
          log_level: string
          icon: string
          message: string
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id: string
          job_id: string
          timestamp: string | null
          log_level: string
          icon: string
          message: string
          metadata: Json | null
          created_at: string | null
        }
        Update: {
          id: string | null
          job_id: string | null
          timestamp: string | null
          log_level: string | null
          icon: string | null
          message: string | null
          metadata: Json | null
          created_at: string | null
        }
        Relationships: []
      }
      analytics_funnel: {
        Row: {
          id: string | null
          user_id: string
          campaign_id: string | null
          date: string
          leads_scraped: number | null
          leads_qualified: number | null
          emails_sent: number | null
          emails_opened: number | null
          emails_replied: number | null
          meetings_scheduled: number | null
          deals_converted: number | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          campaign_id: string | null
          date: string
          leads_scraped: number | null
          leads_qualified: number | null
          emails_sent: number | null
          emails_opened: number | null
          emails_replied: number | null
          meetings_scheduled: number | null
          deals_converted: number | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          campaign_id: string | null
          date: string | null
          leads_scraped: number | null
          leads_qualified: number | null
          emails_sent: number | null
          emails_opened: number | null
          emails_replied: number | null
          meetings_scheduled: number | null
          deals_converted: number | null
          created_at: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string | null
          user_id: string | null
          target_user_id: string | null
          action: string
          resource: string
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string | null
          target_user_id: string | null
          action: string
          resource: string
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          target_user_id: string | null
          action: string | null
          resource: string | null
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Relationships: []
      }
      automation_schedules: {
        Row: {
          id: string | null
          user_id: string
          campaign_id: string | null
          description: string | null
          cron_expression: string | null
          timezone: string | null
          business_days_only: boolean | null
          max_emails_per_day: number | null
          min_interval_minutes: number | null
          auto_scrape_when_low: boolean | null
          scrape_count_on_low: number | null
          next_run_at: string | null
          last_run_at: string | null
          last_run_status: string | null
          total_emails_sent: number | null
          total_leads_scraped: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          campaign_id: string | null
          description: string | null
          cron_expression: string | null
          timezone: string | null
          business_days_only: boolean | null
          max_emails_per_day: number | null
          min_interval_minutes: number | null
          auto_scrape_when_low: boolean | null
          scrape_count_on_low: number | null
          next_run_at: string | null
          last_run_at: string | null
          last_run_status: string | null
          total_emails_sent: number | null
          total_leads_scraped: number | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          campaign_id: string | null
          description: string | null
          cron_expression: string | null
          timezone: string | null
          business_days_only: boolean | null
          max_emails_per_day: number | null
          min_interval_minutes: number | null
          auto_scrape_when_low: boolean | null
          scrape_count_on_low: number | null
          next_run_at: string | null
          last_run_at: string | null
          last_run_status: string | null
          total_emails_sent: number | null
          total_leads_scraped: number | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      campaign_groups: {
        Row: {
          id: string | null
          user_id: string
          name: string
          description: string | null
          color: string | null
          priority: number | null
          global_daily_limit: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string | null
          priority: number | null
          global_daily_limit: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          name: string | null
          description: string | null
          color: string | null
          priority: number | null
          global_daily_limit: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      competitor_tracking: {
        Row: {
          id: string | null
          user_id: string
          competitor_website: string
          competitor_description: string | null
          services_offered: Json | null
          target_market: string | null
          content_strategy_notes: string | null
          social_media_presence: Json | null
          monitor_services: boolean | null
          monitor_hiring: boolean | null
          alert_on_changes: boolean | null
          last_change_detected_at: string | null
          change_history: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          competitor_website: string
          competitor_description: string | null
          services_offered: Json | null
          target_market: string | null
          content_strategy_notes: string | null
          social_media_presence: Json | null
          monitor_services: boolean | null
          monitor_hiring: boolean | null
          alert_on_changes: boolean | null
          last_change_detected_at: string | null
          change_history: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          competitor_website: string | null
          competitor_description: string | null
          services_offered: Json | null
          target_market: string | null
          content_strategy_notes: string | null
          social_media_presence: Json | null
          monitor_services: boolean | null
          monitor_hiring: boolean | null
          alert_on_changes: boolean | null
          last_change_detected_at: string | null
          change_history: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      duplicate_email_registry: {
        Row: {
          id: string | null
          user_id: string
          email: string
          email_hash: string
          first_seen_campaign_id: string | null
          first_seen_at: string | null
          times_seen: number | null
          last_seen_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          email: string
          email_hash: string
          first_seen_campaign_id: string | null
          first_seen_at: string | null
          times_seen: number | null
          last_seen_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          email: string | null
          email_hash: string | null
          first_seen_campaign_id: string | null
          first_seen_at: string | null
          times_seen: number | null
          last_seen_at: string | null
        }
        Relationships: []
      }
      email_health_scores: {
        Row: {
          gmail_account_id: string | null
          user_id: string
          health_score: number | null
          deliverability_rate: string | null
          bounce_rate: string | null
          spam_rate: string | null
          open_rate: string | null
          reply_rate: string | null
          total_sent: number | null
          total_bounced: number | null
          total_spam_reports: number | null
          last_calculated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          gmail_account_id: string | null
          user_id: string
          health_score: number | null
          deliverability_rate: string | null
          bounce_rate: string | null
          spam_rate: string | null
          open_rate: string | null
          reply_rate: string | null
          total_sent: number | null
          total_bounced: number | null
          total_spam_reports: number | null
          last_calculated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          gmail_account_id: string | null
          user_id: string | null
          health_score: number | null
          deliverability_rate: string | null
          bounce_rate: string | null
          spam_rate: string | null
          open_rate: string | null
          reply_rate: string | null
          total_sent: number | null
          total_bounced: number | null
          total_spam_reports: number | null
          last_calculated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      email_previews: {
        Row: {
          id: string | null
          user_id: string
          lead_id: string
          campaign_id: string
          body: string
          html_body: string | null
          personalization_data: Json | null
          pain_points_addressed: Json | null
          conversation_starter: string | null
          tech_stack_mentioned: Json | null
          decision_maker_info: Json | null
          spam_score: number | null
          personalization_score: number | null
          reviewed_at: string | null
          edited_subject: string | null
          edited_body: string | null
          rejection_reason: string | null
          template_id: string | null
          variant_id: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          lead_id: string
          campaign_id: string
          body: string
          html_body: string | null
          personalization_data: Json | null
          pain_points_addressed: Json | null
          conversation_starter: string | null
          tech_stack_mentioned: Json | null
          decision_maker_info: Json | null
          spam_score: number | null
          personalization_score: number | null
          reviewed_at: string | null
          edited_subject: string | null
          edited_body: string | null
          rejection_reason: string | null
          template_id: string | null
          variant_id: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          lead_id: string | null
          campaign_id: string | null
          body: string | null
          html_body: string | null
          personalization_data: Json | null
          pain_points_addressed: Json | null
          conversation_starter: string | null
          tech_stack_mentioned: Json | null
          decision_maker_info: Json | null
          spam_score: number | null
          personalization_score: number | null
          reviewed_at: string | null
          edited_subject: string | null
          edited_body: string | null
          rejection_reason: string | null
          template_id: string | null
          variant_id: string | null
          created_at: string | null
        }
        Relationships: []
      }
      email_priority_queue: {
        Row: {
          id: string | null
          user_id: string
          campaign_id: string
          lead_id: string
          email_id: string | null
          intent_score: number | null
          website_health_score: number | null
          recency_score: number | null
          queue_position: number | null
          send_window_start: string | null
          send_window_end: string | null
          timezone: string | null
          business_days_only: boolean | null
          last_attempt_at: string | null
          error_message: string | null
          recommended_approach: string | null
          personalization_hints: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          campaign_id: string
          lead_id: string
          email_id: string | null
          intent_score: number | null
          website_health_score: number | null
          recency_score: number | null
          queue_position: number | null
          send_window_start: string | null
          send_window_end: string | null
          timezone: string | null
          business_days_only: boolean | null
          last_attempt_at: string | null
          error_message: string | null
          recommended_approach: string | null
          personalization_hints: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          campaign_id: string | null
          lead_id: string | null
          email_id: string | null
          intent_score: number | null
          website_health_score: number | null
          recency_score: number | null
          queue_position: number | null
          send_window_start: string | null
          send_window_end: string | null
          timezone: string | null
          business_days_only: boolean | null
          last_attempt_at: string | null
          error_message: string | null
          recommended_approach: string | null
          personalization_hints: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      email_sequence_steps: {
        Row: {
          id: string | null
          campaign_id: string
          step_number: number
          delay_days: string
          subject: string
          body: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          campaign_id: string
          step_number: number
          delay_days: string
          subject: string
          body: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          campaign_id: string | null
          step_number: number | null
          delay_days: string | null
          subject: string | null
          body: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      email_tracking_events: {
        Row: {
          id: string | null
          email_id: string
          event_type: string
          event_timestamp: string
          raw_webhook_data: Json | null
          user_agent: string | null
          ip_address: string | null
          link_url: string | null
          error_details: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email_id: string
          event_type: string
          event_timestamp: string
          raw_webhook_data: Json | null
          user_agent: string | null
          ip_address: string | null
          link_url: string | null
          error_details: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          email_id: string | null
          event_type: string | null
          event_timestamp: string | null
          raw_webhook_data: Json | null
          user_agent: string | null
          ip_address: string | null
          link_url: string | null
          error_details: string | null
          created_at: string | null
        }
        Relationships: []
      }
      feature_flags_v2: {
        Row: {
          id: string | null
          flag_name: string
          description: string
          enabled: boolean
          rollout_percentage: number | null
          required_plan: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          flag_name: string
          description: string
          enabled: boolean
          rollout_percentage: number | null
          required_plan: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          flag_name: string | null
          description: string | null
          enabled: boolean | null
          rollout_percentage: number | null
          required_plan: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      inbox_contacts: {
        Row: {
          id: string | null
          name: string
          email: string
          company: string | null
          role: string | null
          avatar_url: string | null
          linkedin_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          email: string
          company: string | null
          role: string | null
          avatar_url: string | null
          linkedin_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          name: string | null
          email: string | null
          company: string | null
          role: string | null
          avatar_url: string | null
          linkedin_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      inbox_conversations: {
        Row: {
          id: string | null
          user_id: string
          contact_id: string
          platform: string
          status: string
          last_message: string | null
          last_message_at: string | null
          unread_count: string
          is_archived: string
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          contact_id: string
          platform: string
          status: string
          last_message: string | null
          last_message_at: string | null
          unread_count: string
          is_archived: string
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          contact_id: string | null
          platform: string | null
          status: string | null
          last_message: string | null
          last_message_at: string | null
          unread_count: string | null
          is_archived: string | null
          created_at: string | null
        }
        Relationships: []
      }
      inbox_messages: {
        Row: {
          id: string | null
          conversation_id: string
          sender_id: string
          direction: string
          message_type: string
          subject: string | null
          body: string
          voice_note_url: string | null
          voice_note_duration: number | null
          credits_used: string
          sent_at: string | null
          read_at: string | null
        }
        Insert: {
          id: string
          conversation_id: string
          sender_id: string
          direction: string
          message_type: string
          subject: string | null
          body: string
          voice_note_url: string | null
          voice_note_duration: number | null
          credits_used: string
          sent_at: string | null
          read_at: string | null
        }
        Update: {
          id: string | null
          conversation_id: string | null
          sender_id: string | null
          direction: string | null
          message_type: string | null
          subject: string | null
          body: string | null
          voice_note_url: string | null
          voice_note_duration: number | null
          credits_used: string | null
          sent_at: string | null
          read_at: string | null
        }
        Relationships: []
      }
      intent_signals: {
        Row: {
          id: string | null
          user_id: string
          lead_id: string | null
          campaign_id: string | null
          signal_strength: string | null
          description: string | null
          source_url: string | null
          source_platform: string | null
          company_website: string | null
          company_location: string | null
          expires_at: string | null
          is_actionable: boolean | null
          action_taken: boolean | null
          action_notes: string | null
          matched_keywords: Json | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          lead_id: string | null
          campaign_id: string | null
          signal_strength: string | null
          description: string | null
          source_url: string | null
          source_platform: string | null
          company_website: string | null
          company_location: string | null
          expires_at: string | null
          is_actionable: boolean | null
          action_taken: boolean | null
          action_notes: string | null
          matched_keywords: Json | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          lead_id: string | null
          campaign_id: string | null
          signal_strength: string | null
          description: string | null
          source_url: string | null
          source_platform: string | null
          company_website: string | null
          company_location: string | null
          expires_at: string | null
          is_actionable: boolean | null
          action_taken: boolean | null
          action_notes: string | null
          matched_keywords: Json | null
          created_at: string | null
        }
        Relationships: []
      }
      lead_contacts: {
        Row: {
          id: string | null
          lead_id: string
          user_id: string
          campaign_id: string
          full_name: string | null
          job_title: string | null
          email: string | null
          phone: string | null
          linkedin_url: string | null
          department: string | null
          seniority: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          lead_id: string
          user_id: string
          campaign_id: string
          full_name: string | null
          job_title: string | null
          email: string | null
          phone: string | null
          linkedin_url: string | null
          department: string | null
          seniority: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          lead_id: string | null
          user_id: string | null
          campaign_id: string | null
          full_name: string | null
          job_title: string | null
          email: string | null
          phone: string | null
          linkedin_url: string | null
          department: string | null
          seniority: string | null
          created_at: string | null
        }
        Relationships: []
      }
      lead_pipeline_stages: {
        Row: {
          id: string | null
          user_id: string
          name: string
          color: string | null
          position: number
          is_default: boolean | null
          auto_advance_on: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          name: string
          color: string | null
          position: number
          is_default: boolean | null
          auto_advance_on: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          name: string | null
          color: string | null
          position: number | null
          is_default: boolean | null
          auto_advance_on: string | null
          created_at: string | null
        }
        Relationships: []
      }
      lead_research: {
        Row: {
          id: string | null
          lead_id: string
          user_id: string
          main_services: Json | null
          recent_blog_posts: Json | null
          recent_news: Json | null
          company_size_estimate: string | null
          founding_year: number | null
          tech_stack: Json | null
          conversation_starters: Json | null
          pages_analyzed: number | null
          research_cost_usd: string | null
          last_researched_at: string | null
          research_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          lead_id: string
          user_id: string
          main_services: Json | null
          recent_blog_posts: Json | null
          recent_news: Json | null
          company_size_estimate: string | null
          founding_year: number | null
          tech_stack: Json | null
          conversation_starters: Json | null
          pages_analyzed: number | null
          research_cost_usd: string | null
          last_researched_at: string | null
          research_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          lead_id: string | null
          user_id: string | null
          main_services: Json | null
          recent_blog_posts: Json | null
          recent_news: Json | null
          company_size_estimate: string | null
          founding_year: number | null
          tech_stack: Json | null
          conversation_starters: Json | null
          pages_analyzed: number | null
          research_cost_usd: string | null
          last_researched_at: string | null
          research_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      lead_reviews: {
        Row: {
          id: string | null
          lead_id: string
          user_id: string
          reviewer_name: string | null
          reviewer_photo: string | null
          rating: number | null
          text: string | null
          publish_date: string | null
          response_text: string | null
          response_date: string | null
          likes: number | null
          review_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          lead_id: string
          user_id: string
          reviewer_name: string | null
          reviewer_photo: string | null
          rating: number | null
          text: string | null
          publish_date: string | null
          response_text: string | null
          response_date: string | null
          likes: number | null
          review_url: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          lead_id: string | null
          user_id: string | null
          reviewer_name: string | null
          reviewer_photo: string | null
          rating: number | null
          text: string | null
          publish_date: string | null
          response_text: string | null
          response_date: string | null
          likes: number | null
          review_url: string | null
          created_at: string | null
        }
        Relationships: []
      }
      lead_sequence_progress: {
        Row: {
          id: string | null
          lead_id: string
          current_step: number | null
          next_send_date: string | null
          is_paused: boolean | null
          pause_reason: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          lead_id: string
          current_step: number | null
          next_send_date: string | null
          is_paused: boolean | null
          pause_reason: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          lead_id: string | null
          current_step: number | null
          next_send_date: string | null
          is_paused: boolean | null
          pause_reason: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      lead_social_profiles: {
        Row: {
          id: string | null
          lead_id: string
          user_id: string
          platform: string
          profile_url: string
          profile_name: string | null
          followers: number | null
          following: number | null
          posts_count: number | null
          is_verified: boolean | null
          description: string | null
          profile_picture: string | null
          enriched_data: Json | null
          created_at: string | null
        }
        Insert: {
          id: string
          lead_id: string
          user_id: string
          platform: string
          profile_url: string
          profile_name: string | null
          followers: number | null
          following: number | null
          posts_count: number | null
          is_verified: boolean | null
          description: string | null
          profile_picture: string | null
          enriched_data: Json | null
          created_at: string | null
        }
        Update: {
          id: string | null
          lead_id: string | null
          user_id: string | null
          platform: string | null
          profile_url: string | null
          profile_name: string | null
          followers: number | null
          following: number | null
          posts_count: number | null
          is_verified: boolean | null
          description: string | null
          profile_picture: string | null
          enriched_data: Json | null
          created_at: string | null
        }
        Relationships: []
      }
      multi_source_leads: {
        Row: {
          id: string | null
          lead_id: string | null
          user_id: string
          campaign_id: string | null
          source_url: string | null
          source_id: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          source_review_count: number | null
          source_categories: Json | null
          merged_into_lead_id: string | null
          confidence_score: number | null
          scraped_at: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          lead_id: string | null
          user_id: string
          campaign_id: string | null
          source_url: string | null
          source_id: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          source_review_count: number | null
          source_categories: Json | null
          merged_into_lead_id: string | null
          confidence_score: number | null
          scraped_at: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          lead_id: string | null
          user_id: string | null
          campaign_id: string | null
          source_url: string | null
          source_id: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          source_review_count: number | null
          source_categories: Json | null
          merged_into_lead_id: string | null
          confidence_score: number | null
          scraped_at: string | null
          created_at: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          id: string | null
          name: string
          description: string
          resource: string
          action: string
          created_at: string | null
        }
        Insert: {
          id: string
          name: string
          description: string
          resource: string
          action: string
          created_at: string | null
        }
        Update: {
          id: string | null
          name: string | null
          description: string | null
          resource: string | null
          action: string | null
          created_at: string | null
        }
        Relationships: []
      }
      reply_classifications: {
        Row: {
          id: string | null
          user_id: string
          email_id: string | null
          lead_id: string
          campaign_id: string | null
          classification: string
          confidence_score: string | null
          reply_text: string | null
          reply_subject: string | null
          ai_analysis: Json | null
          is_reviewed: boolean | null
          reviewed_at: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          email_id: string | null
          lead_id: string
          campaign_id: string | null
          classification: string
          confidence_score: string | null
          reply_text: string | null
          reply_subject: string | null
          ai_analysis: Json | null
          is_reviewed: boolean | null
          reviewed_at: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          email_id: string | null
          lead_id: string | null
          campaign_id: string | null
          classification: string | null
          confidence_score: string | null
          reply_text: string | null
          reply_subject: string | null
          ai_analysis: Json | null
          is_reviewed: boolean | null
          reviewed_at: string | null
          created_at: string | null
        }
        Relationships: []
      }
      research_jobs: {
        Row: {
          id: string | null
          user_id: string
          lead_id: string | null
          campaign_id: string | null
          progress_percentage: number | null
          error_message: string | null
          openai_tokens_used: number | null
          total_cost_usd: string | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          lead_id: string | null
          campaign_id: string | null
          progress_percentage: number | null
          error_message: string | null
          openai_tokens_used: number | null
          total_cost_usd: string | null
          completed_at: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          lead_id: string | null
          campaign_id: string | null
          progress_percentage: number | null
          error_message: string | null
          openai_tokens_used: number | null
          total_cost_usd: string | null
          completed_at: string | null
          created_at: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string | null
          role_id: string
          permission_id: string
          created_at: string | null
        }
        Insert: {
          id: string
          role_id: string
          permission_id: string
          created_at: string | null
        }
        Update: {
          id: string | null
          role_id: string | null
          permission_id: string | null
          created_at: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string | null
          name: string
          description: string
          level: string
          created_at: string | null
        }
        Insert: {
          id: string
          name: string
          description: string
          level: string
          created_at: string | null
        }
        Update: {
          id: string | null
          name: string | null
          description: string | null
          level: string | null
          created_at: string | null
        }
        Relationships: []
      }
      rtrvr_usage_logs: {
        Row: {
          id: string | null
          user_id: string
          campaign_id: string | null
          agent_job_id: string | null
          trajectory_id: string | null
          scrape_count: number | null
          total_pages_scraped: number | null
          browser_credits_used: string | null
          proxy_credits_used: string | null
          rtrvr_cost_usd: string | null
          openai_input_tokens: number | null
          openai_output_tokens: number | null
          openai_cost_usd: string | null
          total_cost_usd: string | null
          request_duration_ms: number | null
          scrape_type: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          campaign_id: string | null
          agent_job_id: string | null
          trajectory_id: string | null
          scrape_count: number | null
          total_pages_scraped: number | null
          browser_credits_used: string | null
          proxy_credits_used: string | null
          rtrvr_cost_usd: string | null
          openai_input_tokens: number | null
          openai_output_tokens: number | null
          openai_cost_usd: string | null
          total_cost_usd: string | null
          request_duration_ms: number | null
          scrape_type: string | null
          metadata: Json | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          campaign_id: string | null
          agent_job_id: string | null
          trajectory_id: string | null
          scrape_count: number | null
          total_pages_scraped: number | null
          browser_credits_used: string | null
          proxy_credits_used: string | null
          rtrvr_cost_usd: string | null
          openai_input_tokens: number | null
          openai_output_tokens: number | null
          openai_cost_usd: string | null
          total_cost_usd: string | null
          request_duration_ms: number | null
          scrape_type: string | null
          metadata: Json | null
          created_at: string | null
        }
        Relationships: []
      }
      scraping_templates: {
        Row: {
          id: string | null
          user_id: string
          description: string | null
          category: string | null
          industry: string | null
          extraction_schema: Json
          navigation_steps: Json | null
          wait_for_selector: string | null
          timeout_ms: number | null
          proxy_mode: string | null
          success_rate: string | null
          total_uses: number | null
          is_marketplace: boolean | null
          marketplace_price: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          description: string | null
          category: string | null
          industry: string | null
          extraction_schema: Json
          navigation_steps: Json | null
          wait_for_selector: string | null
          timeout_ms: number | null
          proxy_mode: string | null
          success_rate: string | null
          total_uses: number | null
          is_marketplace: boolean | null
          marketplace_price: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          description: string | null
          category: string | null
          industry: string | null
          extraction_schema: Json | null
          navigation_steps: Json | null
          wait_for_selector: string | null
          timeout_ms: number | null
          proxy_mode: string | null
          success_rate: string | null
          total_uses: number | null
          is_marketplace: boolean | null
          marketplace_price: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      sequence_ab_tests: {
        Row: {
          id: string | null
          sequence_id: string
          step_number: number | null
          variant_a_subject: string | null
          variant_b_subject: string | null
          variant_a_body: string | null
          variant_b_body: string | null
          variant_a_sends: number | null
          variant_b_sends: number | null
          variant_a_opens: number | null
          variant_b_opens: number | null
          variant_a_replies: number | null
          variant_b_replies: number | null
          winner: string | null
          winner_selected_at: string | null
          min_sample_size: number | null
          confidence_threshold: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          campaign_id: string | null
        }
        Insert: {
          id: string
          sequence_id: string
          step_number: number | null
          variant_a_subject: string | null
          variant_b_subject: string | null
          variant_a_body: string | null
          variant_b_body: string | null
          variant_a_sends: number | null
          variant_b_sends: number | null
          variant_a_opens: number | null
          variant_b_opens: number | null
          variant_a_replies: number | null
          variant_b_replies: number | null
          winner: string | null
          winner_selected_at: string | null
          min_sample_size: number | null
          confidence_threshold: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          campaign_id: string | null
        }
        Update: {
          id: string | null
          sequence_id: string | null
          step_number: number | null
          variant_a_subject: string | null
          variant_b_subject: string | null
          variant_a_body: string | null
          variant_b_body: string | null
          variant_a_sends: number | null
          variant_b_sends: number | null
          variant_a_opens: number | null
          variant_b_opens: number | null
          variant_a_replies: number | null
          variant_b_replies: number | null
          winner: string | null
          winner_selected_at: string | null
          min_sample_size: number | null
          confidence_threshold: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          campaign_id: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string | null
          name: string
          display_name: string
          description: string
          price_monthly: string
          price_yearly: string
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          max_campaigns: string
          max_leads_per_campaign: string
          max_email_accounts: string
          features: Json
          is_active: boolean | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          display_name: string
          description: string
          price_monthly: string
          price_yearly: string
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          max_campaigns: string
          max_leads_per_campaign: string
          max_email_accounts: string
          features: Json
          is_active: boolean | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          name: string | null
          display_name: string | null
          description: string | null
          price_monthly: string | null
          price_yearly: string | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          max_campaigns: string | null
          max_leads_per_campaign: string | null
          max_email_accounts: string | null
          features: Json | null
          is_active: boolean | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          id: string | null
          user_id: string | null
          campaign_id: string | null
          lead_id: string | null
          log_level: string
          category: string
          message: string
          details: Json | null
          error_message: string | null
          error_stack: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string | null
          campaign_id: string | null
          lead_id: string | null
          log_level: string
          category: string
          message: string
          details: Json | null
          error_message: string | null
          error_stack: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          campaign_id: string | null
          lead_id: string | null
          log_level: string | null
          category: string | null
          message: string | null
          details: Json | null
          error_message: string | null
          error_stack: string | null
          created_at: string | null
        }
        Relationships: []
      }
      unsubscribes: {
        Row: {
          id: string | null
          email: string
          user_id: string | null
          campaign_id: string | null
          unsubscribed_at: string | null
          reason: string | null
          ip_address: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          user_id: string | null
          campaign_id: string | null
          unsubscribed_at: string | null
          reason: string | null
          ip_address: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          email: string | null
          user_id: string | null
          campaign_id: string | null
          unsubscribed_at: string | null
          reason: string | null
          ip_address: string | null
          created_at: string | null
        }
        Relationships: []
      }
      user_feature_overrides: {
        Row: {
          id: string | null
          user_id: string
          feature_flag_id: string
          enabled: boolean
          granted_by: string | null
          expires_at: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          feature_flag_id: string
          enabled: boolean
          granted_by: string | null
          expires_at: string | null
          created_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          feature_flag_id: string | null
          enabled: boolean | null
          granted_by: string | null
          expires_at: string | null
          created_at: string | null
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          id: string | null
          user_id: string
          welcome_completed: boolean | null
          dashboard_tour_completed: boolean | null
          campaign_tour_completed: boolean | null
          leads_tour_completed: boolean | null
          templates_tour_completed: boolean | null
          accounts_tour_completed: boolean | null
          autopilot_tour_completed: boolean | null
          first_campaign_created: boolean | null
          first_email_sent: boolean | null
          first_reply_received: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          welcome_completed: boolean | null
          dashboard_tour_completed: boolean | null
          campaign_tour_completed: boolean | null
          leads_tour_completed: boolean | null
          templates_tour_completed: boolean | null
          accounts_tour_completed: boolean | null
          autopilot_tour_completed: boolean | null
          first_campaign_created: boolean | null
          first_email_sent: boolean | null
          first_reply_received: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          welcome_completed: boolean | null
          dashboard_tour_completed: boolean | null
          campaign_tour_completed: boolean | null
          leads_tour_completed: boolean | null
          templates_tour_completed: boolean | null
          accounts_tour_completed: boolean | null
          autopilot_tour_completed: boolean | null
          first_campaign_created: boolean | null
          first_email_sent: boolean | null
          first_reply_received: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string | null
          user_id: string
          role_id: string
          granted_by: string | null
          granted_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          role_id: string
          granted_by: string | null
          granted_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          role_id: string | null
          granted_by: string | null
          granted_at: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string | null
          user_id: string
          plan_id: string
          status: string
          billing_cycle: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          plan_id: string
          status: string
          billing_cycle: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          plan_id: string | null
          status: string | null
          billing_cycle: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      webhook_configurations: {
        Row: {
          id: string | null
          user_id: string
          name: string
          url: string
          events: string
          secret: string | null
          headers: Json | null
          is_active: boolean | null
          last_triggered_at: string | null
          failure_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          name: string
          url: string
          events: string
          secret: string | null
          headers: Json | null
          is_active: boolean | null
          last_triggered_at: string | null
          failure_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          user_id: string | null
          name: string | null
          url: string | null
          events: string | null
          secret: string | null
          headers: Json | null
          is_active: boolean | null
          last_triggered_at: string | null
          failure_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          id: string | null
          webhook_id: string
          user_id: string
          event_type: string
          payload: Json
          status_code: number | null
          response_body: string | null
          error_message: string | null
          attempt_count: number | null
          delivered_at: string | null
        }
        Insert: {
          id: string
          webhook_id: string
          user_id: string
          event_type: string
          payload: Json
          status_code: number | null
          response_body: string | null
          error_message: string | null
          attempt_count: number | null
          delivered_at: string | null
        }
        Update: {
          id: string | null
          webhook_id: string | null
          user_id: string | null
          event_type: string | null
          payload: Json | null
          status_code: number | null
          response_body: string | null
          error_message: string | null
          attempt_count: number | null
          delivered_at: string | null
        }
        Relationships: []
      }
      website_health_scores: {
        Row: {
          id: string | null
          lead_id: string
          user_id: string
          seo_score: number | null
          mobile_score: number | null
          security_score: number | null
          performance_score: number | null
          has_meta_description: boolean | null
          has_structured_data: boolean | null
          has_sitemap: boolean | null
          has_robots_txt: boolean | null
          ssl_expiry_date: string | null
          has_security_headers: boolean | null
          total_page_size_kb: number | null
          image_optimization_score: number | null
          last_blog_update: string | null
          design_age_estimate: string | null
          has_contact_form: boolean | null
          has_live_chat: boolean | null
          detected_analytics: Json | null
          detected_marketing_tools: Json | null
          detected_ecommerce: string | null
          improvement_opportunities: Json | null
          recommended_services: Json | null
          last_checked_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          lead_id: string
          user_id: string
          seo_score: number | null
          mobile_score: number | null
          security_score: number | null
          performance_score: number | null
          has_meta_description: boolean | null
          has_structured_data: boolean | null
          has_sitemap: boolean | null
          has_robots_txt: boolean | null
          ssl_expiry_date: string | null
          has_security_headers: boolean | null
          total_page_size_kb: number | null
          image_optimization_score: number | null
          last_blog_update: string | null
          design_age_estimate: string | null
          has_contact_form: boolean | null
          has_live_chat: boolean | null
          detected_analytics: Json | null
          detected_marketing_tools: Json | null
          detected_ecommerce: string | null
          improvement_opportunities: Json | null
          recommended_services: Json | null
          last_checked_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          id: string | null
          lead_id: string | null
          user_id: string | null
          seo_score: number | null
          mobile_score: number | null
          security_score: number | null
          performance_score: number | null
          has_meta_description: boolean | null
          has_structured_data: boolean | null
          has_sitemap: boolean | null
          has_robots_txt: boolean | null
          ssl_expiry_date: string | null
          has_security_headers: boolean | null
          total_page_size_kb: number | null
          image_optimization_score: number | null
          last_blog_update: string | null
          design_age_estimate: string | null
          has_contact_form: boolean | null
          has_live_chat: boolean | null
          detected_analytics: Json | null
          detected_marketing_tools: Json | null
          detected_ecommerce: string | null
          improvement_opportunities: Json | null
          recommended_services: Json | null
          last_checked_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
