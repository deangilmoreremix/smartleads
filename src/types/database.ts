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
        }
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
        }
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
          created_at: string
          updated_at: string
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
          created_at?: string
          updated_at?: string
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
          created_at?: string
          updated_at?: string
        }
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
        }
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
        }
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
        }
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
      }
    }
  }
}
