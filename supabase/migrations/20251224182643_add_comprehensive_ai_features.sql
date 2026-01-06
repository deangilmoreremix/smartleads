/*
  # Add Comprehensive AI Enhancement Features

  ## Overview
  Adds complete AI enhancement infrastructure for intelligent template creation

  ## New Tables
  
  ### `ai_prompt_marketplace`
  Stores community-shared AI prompts with performance metrics
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - Creator of the prompt
  - `name` (text) - Prompt name
  - `description` (text) - What the prompt does
  - `prompt_text` (text) - The actual AI prompt
  - `category` (text) - Email goal (cold_outreach, follow_up, etc.)
  - `industry` (text) - Target industry
  - `tone` (text) - Communication tone
  - `is_public` (boolean) - Whether shared publicly
  - `usage_count` (integer) - Times used by others
  - `avg_reply_rate` (decimal) - Average reply rate
  - `avg_open_rate` (decimal) - Average open rate
  - `rating` (decimal) - User rating 1-5
  - `rating_count` (integer) - Number of ratings
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `template_variants`
  A/B testing variants for templates
  - `id` (uuid, primary key)
  - `template_id` (uuid, references email_templates)
  - `variant_name` (text) - Name of variant (A, B, C)
  - `subject` (text)
  - `body` (text)
  - `ai_prompt` (text) - For AI variants
  - `sent_count` (integer)
  - `open_count` (integer)
  - `reply_count` (integer)
  - `created_at` (timestamptz)

  ### `user_ai_preferences`
  User's AI configuration and learned preferences
  - `user_id` (uuid, primary key, references auth.users)
  - `preferred_tone` (text) - Default tone
  - `preferred_length` (text) - short, medium, long
  - `ai_model` (text) - gpt-4, gpt-3.5, claude
  - `creativity_level` (decimal) - 0.0 to 1.0
  - `brand_voice` (text) - Custom brand voice instructions
  - `avoid_phrases` (text[]) - Phrases to avoid
  - `custom_instructions` (text) - Additional AI instructions
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `ai_generation_history`
  Track AI generations for learning
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `template_id` (uuid, references email_templates)
  - `prompt_used` (text)
  - `generated_subject` (text)
  - `generated_body` (text)
  - `user_rating` (integer) - 1-5 stars
  - `was_edited` (boolean)
  - `performance_score` (decimal)
  - `created_at` (timestamptz)

  ### `ai_prompt_suggestions`
  AI-generated suggestions for improving prompts
  - `id` (uuid, primary key)
  - `template_id` (uuid, references email_templates)
  - `suggestion_type` (text) - tone, personalization, clarity, etc.
  - `suggestion_text` (text)
  - `priority` (integer) - 1-10
  - `was_applied` (boolean)
  - `created_at` (timestamptz)

  ### `template_performance_metrics`
  Detailed performance tracking for templates
  - `template_id` (uuid, primary key, references email_templates)
  - `total_sent` (integer)
  - `total_opened` (integer)
  - `total_replied` (integer)
  - `total_bounced` (integer)
  - `avg_response_time_hours` (decimal)
  - `open_rate` (decimal)
  - `reply_rate` (decimal)
  - `quality_score` (decimal) - AI-calculated quality
  - `personalization_score` (decimal)
  - `spam_score` (decimal)
  - `last_calculated_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Modified Tables

  ### `email_templates`
  - `tone` (text) - professional, friendly, casual, etc.
  - `email_goal` (text) - cold_outreach, follow_up, etc.
  - `industry` (text) - Target industry
  - `target_audience` (text) - Decision maker type
  - `ai_quality_score` (decimal) - Real-time quality score
  - `personalization_level` (text) - low, medium, high
  - `is_marketplace_template` (boolean) - Cloned from marketplace

  ## Security
  - RLS enabled on all new tables
  - Users can only access their own data
  - Marketplace templates are publicly readable when is_public=true

  ## Important Notes
  - Uses IF NOT EXISTS to prevent errors on re-run
  - Comprehensive indexing for performance
  - Cascading deletes where appropriate
*/

-- Create ai_prompt_marketplace table
CREATE TABLE IF NOT EXISTS ai_prompt_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  prompt_text text NOT NULL,
  category text DEFAULT 'cold_outreach' CHECK (category IN ('cold_outreach', 'follow_up', 'meeting_request', 'value_proposition', 're_engagement', 'introduction', 'other')),
  industry text,
  tone text DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'casual', 'persuasive', 'authoritative', 'empathetic', 'urgent', 'consultative')),
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  avg_reply_rate decimal(5,2) DEFAULT 0.0,
  avg_open_rate decimal(5,2) DEFAULT 0.0,
  rating decimal(3,2) DEFAULT 0.0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create template_variants table
CREATE TABLE IF NOT EXISTS template_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES email_templates(id) ON DELETE CASCADE NOT NULL,
  variant_name text NOT NULL,
  subject text,
  body text,
  ai_prompt text,
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_ai_preferences table
CREATE TABLE IF NOT EXISTS user_ai_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_tone text DEFAULT 'professional',
  preferred_length text DEFAULT 'medium' CHECK (preferred_length IN ('short', 'medium', 'long')),
  ai_model text DEFAULT 'gpt-4' CHECK (ai_model IN ('gpt-4', 'gpt-3.5', 'claude')),
  creativity_level decimal(3,2) DEFAULT 0.7,
  brand_voice text,
  avoid_phrases text[] DEFAULT '{}',
  custom_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_generation_history table
CREATE TABLE IF NOT EXISTS ai_generation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  prompt_used text NOT NULL,
  generated_subject text,
  generated_body text,
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  was_edited boolean DEFAULT false,
  performance_score decimal(5,2),
  created_at timestamptz DEFAULT now()
);

-- Create ai_prompt_suggestions table
CREATE TABLE IF NOT EXISTS ai_prompt_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES email_templates(id) ON DELETE CASCADE NOT NULL,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('tone', 'personalization', 'clarity', 'specificity', 'length', 'variable_usage', 'compliance', 'engagement')),
  suggestion_text text NOT NULL,
  priority integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  was_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create template_performance_metrics table
CREATE TABLE IF NOT EXISTS template_performance_metrics (
  template_id uuid PRIMARY KEY REFERENCES email_templates(id) ON DELETE CASCADE,
  total_sent integer DEFAULT 0,
  total_opened integer DEFAULT 0,
  total_replied integer DEFAULT 0,
  total_bounced integer DEFAULT 0,
  avg_response_time_hours decimal(10,2),
  open_rate decimal(5,2) DEFAULT 0.0,
  reply_rate decimal(5,2) DEFAULT 0.0,
  quality_score decimal(5,2) DEFAULT 0.0,
  personalization_score decimal(5,2) DEFAULT 0.0,
  spam_score decimal(5,2) DEFAULT 0.0,
  last_calculated_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to email_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'tone'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN tone text DEFAULT 'professional';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'email_goal'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN email_goal text DEFAULT 'cold_outreach';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'industry'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN industry text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'target_audience'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN target_audience text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'ai_quality_score'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN ai_quality_score decimal(5,2) DEFAULT 0.0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'personalization_level'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN personalization_level text DEFAULT 'medium';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'is_marketplace_template'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN is_marketplace_template boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON ai_prompt_marketplace(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_industry ON ai_prompt_marketplace(industry);
CREATE INDEX IF NOT EXISTS idx_marketplace_public ON ai_prompt_marketplace(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_rating ON ai_prompt_marketplace(rating DESC);
CREATE INDEX IF NOT EXISTS idx_template_variants_template ON template_variants(template_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_user ON ai_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_template ON ai_generation_history(template_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_template ON ai_prompt_suggestions(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_tone ON email_templates(tone);
CREATE INDEX IF NOT EXISTS idx_templates_goal ON email_templates(email_goal);

-- Enable RLS on all new tables
ALTER TABLE ai_prompt_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_prompt_marketplace
CREATE POLICY "Users can view public marketplace prompts"
  ON ai_prompt_marketplace FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create marketplace prompts"
  ON ai_prompt_marketplace FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own marketplace prompts"
  ON ai_prompt_marketplace FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own marketplace prompts"
  ON ai_prompt_marketplace FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for template_variants
CREATE POLICY "Users can view own template variants"
  ON template_variants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_variants.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create template variants"
  ON template_variants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_variants.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own template variants"
  ON template_variants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_variants.template_id
      AND email_templates.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_variants.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own template variants"
  ON template_variants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_variants.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

-- RLS Policies for user_ai_preferences
CREATE POLICY "Users can view own AI preferences"
  ON user_ai_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own AI preferences"
  ON user_ai_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own AI preferences"
  ON user_ai_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own AI preferences"
  ON user_ai_preferences FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for ai_generation_history
CREATE POLICY "Users can view own generation history"
  ON ai_generation_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create generation history"
  ON ai_generation_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own generation history"
  ON ai_generation_history FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own generation history"
  ON ai_generation_history FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for ai_prompt_suggestions
CREATE POLICY "Users can view suggestions for own templates"
  ON ai_prompt_suggestions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = ai_prompt_suggestions.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create suggestions"
  ON ai_prompt_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = ai_prompt_suggestions.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update suggestions for own templates"
  ON ai_prompt_suggestions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = ai_prompt_suggestions.template_id
      AND email_templates.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = ai_prompt_suggestions.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete suggestions for own templates"
  ON ai_prompt_suggestions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = ai_prompt_suggestions.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

-- RLS Policies for template_performance_metrics
CREATE POLICY "Users can view metrics for own templates"
  ON template_performance_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_performance_metrics.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create performance metrics"
  ON template_performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_performance_metrics.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "System can update performance metrics"
  ON template_performance_metrics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_performance_metrics.template_id
      AND email_templates.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_performance_metrics.template_id
      AND email_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete metrics for own templates"
  ON template_performance_metrics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_templates
      WHERE email_templates.id = template_performance_metrics.template_id
      AND email_templates.user_id = auth.uid()
    )
  );