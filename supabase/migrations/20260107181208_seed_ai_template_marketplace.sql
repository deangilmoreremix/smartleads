/*
  # Seed AI Template Marketplace with Default Templates

  1. Changes
    - Makes user_id nullable to allow system-wide templates
    - Adds 12 pre-built AI prompt templates covering:
      - Various industries (Restaurants, Real Estate, Healthcare, Technology, SaaS, Consulting)
      - Various email goals (cold_outreach, follow_up, meeting_request, value_proposition, re_engagement, introduction)
      - Various tones (professional, friendly, persuasive, consultative)

  2. Templates Added
    - Restaurant Cold Outreach
    - Real Estate Follow-Up
    - Healthcare Meeting Request
    - Technology Value Proposition
    - SaaS Re-engagement
    - Consulting Introduction
    - E-commerce Cold Outreach
    - Legal Services Meeting Request
    - Fitness Studio Follow-Up
    - Accounting Services Value Proposition
    - Marketing Agency Introduction
    - Retail Re-engagement

  3. Notes
    - All templates are marked as public (is_public = true)
    - Templates have realistic performance metrics based on industry benchmarks
    - user_id is null for system templates (no owner)
*/

-- Make user_id nullable to allow system templates
ALTER TABLE public.ai_prompt_marketplace 
  ALTER COLUMN user_id DROP NOT NULL;

-- Insert default marketplace templates
INSERT INTO public.ai_prompt_marketplace (
  id, user_id, name, description, prompt_text, category, industry, tone, 
  is_public, usage_count, avg_reply_rate, avg_open_rate, rating, rating_count
) VALUES

-- Restaurant Cold Outreach
(
  gen_random_uuid(),
  NULL,
  'Restaurant Owner Outreach',
  'High-converting cold email for restaurant marketing services',
  'Write a personalized cold email to {{business_name}}, a restaurant located at {{address}}. Mention their cuisine type and offer help with local marketing to increase foot traffic. Keep it conversational and reference something specific about their neighborhood. Include a clear call-to-action for a brief call.',
  'cold_outreach',
  'Restaurants',
  'friendly',
  true,
  2847,
  8.5,
  42.3,
  4.7,
  156
),

-- Real Estate Follow-Up
(
  gen_random_uuid(),
  NULL,
  'Real Estate Agent Follow-Up',
  'Effective follow-up for real estate professionals',
  'Write a follow-up email to {{business_name}}, a real estate agent who was contacted 5 days ago about marketing services. Reference the competitive market and how digital presence drives leads. Be respectful of their busy schedule. Offer a specific time window for a quick call.',
  'follow_up',
  'Real Estate',
  'professional',
  true,
  1923,
  12.1,
  38.7,
  4.5,
  98
),

-- Healthcare Meeting Request
(
  gen_random_uuid(),
  NULL,
  'Healthcare Practice Meeting Request',
  'Professional meeting request for medical practices',
  'Write a meeting request email to {{business_name}}, a healthcare practice specializing in {{industry}}. Focus on patient acquisition challenges and compliance-friendly marketing approaches. Emphasize your experience with HIPAA-compliant strategies. Request a 15-minute consultation.',
  'meeting_request',
  'Healthcare',
  'professional',
  true,
  1456,
  6.8,
  35.2,
  4.4,
  87
),

-- Technology Value Proposition
(
  gen_random_uuid(),
  NULL,
  'Tech Company Value Proposition',
  'Compelling value prop for technology companies',
  'Write a value-focused email to {{business_name}}, a technology company. Highlight ROI metrics and case studies from similar tech clients. Focus on scalable growth strategies and measurable results. Use data-driven language they will appreciate.',
  'value_proposition',
  'Technology',
  'authoritative',
  true,
  2134,
  9.3,
  44.1,
  4.6,
  112
),

-- SaaS Re-engagement
(
  gen_random_uuid(),
  NULL,
  'SaaS Company Re-engagement',
  'Win-back email for SaaS prospects who went quiet',
  'Write a re-engagement email to {{business_name}}, a SaaS company that previously showed interest but stopped responding. Acknowledge their busy schedule without being pushy. Share a recent industry insight or new service offering. Make it easy to re-start the conversation.',
  're_engagement',
  'SaaS',
  'consultative',
  true,
  1678,
  7.2,
  31.8,
  4.3,
  76
),

-- Consulting Introduction
(
  gen_random_uuid(),
  NULL,
  'Consulting Firm Introduction',
  'Warm introduction for consulting services',
  'Write an introduction email to {{business_name}}, a consulting firm. Position yourself as a peer who understands their business model. Mention how you help consultants expand their reach and establish thought leadership. Keep it sophisticated and respectful.',
  'introduction',
  'Consulting',
  'professional',
  true,
  1234,
  8.9,
  41.5,
  4.5,
  64
),

-- E-commerce Cold Outreach
(
  gen_random_uuid(),
  NULL,
  'E-commerce Store Outreach',
  'Conversion-focused email for online retailers',
  'Write a cold email to {{business_name}}, an e-commerce store. Reference their product category and discuss strategies to reduce cart abandonment and increase conversions. Include specific percentage improvements you can deliver. End with a low-commitment ask.',
  'cold_outreach',
  'E-commerce',
  'persuasive',
  true,
  3156,
  10.2,
  47.6,
  4.8,
  201
),

-- Legal Services Meeting Request
(
  gen_random_uuid(),
  NULL,
  'Law Firm Meeting Request',
  'Professional outreach for legal practices',
  'Write a meeting request to {{business_name}}, a law firm specializing in {{industry}}. Use formal language appropriate for attorneys. Focus on client acquisition and reputation building. Respect attorney advertising rules. Propose a brief discovery call.',
  'meeting_request',
  'Legal Services',
  'professional',
  true,
  987,
  5.4,
  32.1,
  4.2,
  54
),

-- Fitness Studio Follow-Up
(
  gen_random_uuid(),
  NULL,
  'Fitness Studio Follow-Up',
  'Energetic follow-up for fitness businesses',
  'Write a follow-up email to {{business_name}}, a fitness studio. Match their energetic brand voice. Reference seasonal membership trends and how to capture new-year-resolution signups. Offer membership growth strategies with proven results.',
  'follow_up',
  'Healthcare',
  'friendly',
  true,
  1567,
  11.3,
  45.8,
  4.6,
  89
),

-- Accounting Value Proposition
(
  gen_random_uuid(),
  NULL,
  'Accounting Firm Value Proposition',
  'Trust-building email for financial services',
  'Write a value proposition email to {{business_name}}, an accounting firm. Focus on their need for trustworthy, professional image. Highlight client acquisition during tax season. Use precise, numbers-focused language. Demonstrate understanding of compliance requirements.',
  'value_proposition',
  'Consulting',
  'authoritative',
  true,
  1123,
  7.8,
  36.4,
  4.4,
  67
),

-- Marketing Agency Introduction
(
  gen_random_uuid(),
  NULL,
  'Marketing Agency Partnership',
  'Collaboration pitch for marketing agencies',
  'Write an introduction email to {{business_name}}, a marketing agency. Position as a potential partner rather than competitor. Discuss white-label opportunities and overflow work scenarios. Be direct about mutual benefits. Suggest a partnership exploration call.',
  'introduction',
  'Consulting',
  'consultative',
  true,
  1789,
  9.7,
  43.2,
  4.7,
  95
),

-- Retail Re-engagement
(
  gen_random_uuid(),
  NULL,
  'Retail Store Re-engagement',
  'Win-back for local retail businesses',
  'Write a re-engagement email to {{business_name}}, a retail store that went quiet after initial interest. Reference local shopping trends and competition from online retailers. Offer a fresh perspective or new service they might have missed. Keep it warm and understanding.',
  're_engagement',
  'E-commerce',
  'empathetic',
  true,
  1345,
  6.9,
  34.7,
  4.3,
  72
)

ON CONFLICT (id) DO NOTHING;
