/*
  # Add AI Template Support

  ## Overview
  Adds support for AI-generated email templates with GPT prompts

  ## Changes
  
  ### Modified Tables
  
  #### `email_templates`
  - `template_type` (text: 'manual', 'ai') - Whether template is manually written or AI-generated
  - `ai_prompt` (text, optional) - The prompt for GPT5 to generate personalized emails
  - `pitch` (text, optional) - User's pitch that can be referenced in templates
  
  ## Important Notes
  - Uses IF NOT EXISTS to prevent errors on re-run
  - Default template_type is 'manual' for existing templates
  - AI templates will use ai_prompt instead of subject/body during generation
*/

-- Add new columns to email_templates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'template_type'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN template_type text DEFAULT 'manual' NOT NULL CHECK (template_type IN ('manual', 'ai'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'ai_prompt'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN ai_prompt text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'pitch'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN pitch text;
  END IF;
END $$;

-- Create index for template_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_email_templates_template_type ON email_templates(template_type);
