import { createClient } from 'npm:@supabase/supabase-js@2';
import OpenAI from 'npm:openai@4';
import { logProgress } from '../_shared/progress-logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateEmailsRequest {
  campaignId: string;
  leadIds?: string[];
  templateId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let supabaseClient: any;
  let jobId: string | undefined;

  try {
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { campaignId, leadIds, templateId }: GenerateEmailsRequest = await req.json();

    if (!campaignId || typeof campaignId !== 'string') {
      throw new Error('Invalid campaignId');
    }

    if (leadIds && !Array.isArray(leadIds)) {
      throw new Error('leadIds must be an array');
    }

    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found or access denied');
    }

    const { data: userPrefs } = await supabaseClient
      .from('user_ai_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let emailTemplate = null;
    let templateVariants: any[] = [];
    if (templateId) {
      const { data: template, error: templateError } = await supabaseClient
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('user_id', user.id)
        .single();

      if (templateError) {
        throw new Error('Template not found or access denied');
      }

      emailTemplate = template;

      const { data: variants } = await supabaseClient
        .from('template_variants')
        .select('*')
        .eq('template_id', templateId);

      if (variants && variants.length > 0) {
        templateVariants = variants;
      }
    }

    let leadsQuery = supabaseClient
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id);

    if (leadIds && leadIds.length > 0) {
      leadsQuery = leadsQuery.in('id', leadIds);
    }

    const { data: leads, error: leadsError } = await leadsQuery;
    if (leadsError) throw leadsError;

    if (!leads || leads.length === 0) {
      throw new Error('No leads found for this campaign');
    }

    jobId = crypto.randomUUID();
    await supabaseClient.from('agent_jobs').insert({
      id: jobId,
      campaign_id: campaignId,
      user_id: user.id,
      job_type: 'email_generation',
      status: 'initializing',
      progress_percentage: 0,
      total_steps: 4,
      completed_steps: 0,
      result_data: {
        campaign_name: campaign.name || 'Campaign'
      }
    });

    await logProgress(supabaseClient, jobId, {
      level: 'info',
      icon: '🤖',
      message: 'Agent initialized successfully'
    });

    await supabaseClient.from('agent_jobs').update({
      status: 'running',
      progress_percentage: 25,
      completed_steps: 1
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'info',
      icon: '📊',
      message: `Analyzing ${leads.length} leads from campaign`
    });

    const generatedEmails = [];
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    await supabaseClient.from('agent_jobs').update({
      progress_percentage: 50,
      completed_steps: 2
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'loading',
      icon: '✍️',
      message: 'Generating personalized emails with GPT-5.2...'
    });

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];

      try {
        let selectedVariant = null;
        if (templateVariants.length > 0) {
          const randomIndex = Math.floor(Math.random() * templateVariants.length);
          selectedVariant = templateVariants[randomIndex];

          await supabaseClient
            .from('template_variants')
            .update({ sent_count: selectedVariant.sent_count + 1 })
            .eq('id', selectedVariant.id);
        }

        const emailContent = await generatePersonalizedEmail(
          lead,
          campaign,
          emailTemplate,
          selectedVariant,
          userPrefs,
          openai
        );

        const { data: insertedEmail } = await supabaseClient
          .from('emails')
          .insert({
            campaign_id: campaignId,
            lead_id: lead.id,
            user_id: user.id,
            subject: emailContent.subject,
            body: emailContent.body,
            ai_generated: true,
            generation_prompt: emailContent.prompt,
            personalization_tokens: emailContent.tokens,
            personalization_data: emailContent.qualityScore ? { quality_score: emailContent.qualityScore } : null,
            status: 'queued',
            variant_id: selectedVariant?.id || null,
          })
          .select()
          .single();

        if (insertedEmail) {
          generatedEmails.push(insertedEmail);
        }

        if (emailTemplate && emailTemplate.template_type === 'ai') {
          await supabaseClient.from('ai_generation_history').insert({
            user_id: user.id,
            template_id: emailTemplate.id,
            prompt_used: emailContent.prompt,
            generated_subject: emailContent.subject,
            generated_body: emailContent.body,
            was_edited: false,
          });
        }

        if ((i + 1) % 5 === 0 || i === leads.length - 1) {
          await logProgress(supabaseClient, jobId, {
            level: 'info',
            icon: '✅',
            message: `Generated ${i + 1} of ${leads.length} emails...`
          });
        }
      } catch (error: any) {
        console.error(`Failed to generate email for lead ${lead.id}:`, error);

        await logProgress(supabaseClient, jobId, {
          level: 'warning',
          icon: '⚠️',
          message: `Skipped lead ${i + 1} due to error`
        });
      }
    }

    await logProgress(supabaseClient, jobId, {
      level: 'success',
      icon: '💾',
      message: `Successfully generated ${generatedEmails.length} personalized emails`
    });

    await supabaseClient.from('agent_jobs').update({
      progress_percentage: 75,
      completed_steps: 3
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'loading',
      icon: '📋',
      message: 'Running quality checks...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await supabaseClient
      .from('agent_jobs')
      .update({
        status: generatedEmails.length > 0 ? 'completed' : 'failed',
        progress_percentage: 100,
        completed_steps: 4,
        result_data: {
          campaign_name: campaign.name || 'Campaign',
          leadsFound: 0,
          emailsGenerated: generatedEmails.length,
          emailsSent: 0
        },
      })
      .eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'success',
      icon: '🎉',
      message: `Agent completed! ${generatedEmails.length} emails ready to send`
    });

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        emailsGenerated: generatedEmails.length,
        totalLeads: leads.length,
        emails: generatedEmails.slice(0, 5),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Email generation error:', error);

    if (supabaseClient && jobId) {
      await supabaseClient
        .from('agent_jobs')
        .update({
          status: 'failed',
          error_message: error.message || 'Failed to generate emails'
        })
        .eq('id', jobId);

      await logProgress(supabaseClient, jobId, {
        level: 'error',
        icon: '❌',
        message: `Error: ${error.message || 'Failed to generate emails'}`
      });
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate emails' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generatePersonalizedEmail(
  lead: any,
  campaign: any,
  template: any | null,
  variant: any | null,
  userPrefs: any | null,
  openai: OpenAI
): Promise<{ subject: string; body: string; prompt: string; tokens: any; qualityScore?: number }> {
  const businessName = lead.business_name || 'your business';
  const reviews = lead.scraped_data?.reviews || [];
  const rating = lead.rating || 0;
  const reviewCount = lead.review_count || 0;
  const location = lead.address || campaign.location || 'your area';
  const website = lead.website || '';
  const phone = lead.phone || '';

  const firstName = lead.decision_maker_name ||
    (lead.email ? lead.email.split('@')[0].split('.')[0] : 'there');
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const reviewInsight = reviews.length > 0 && reviews[0].text
    ? reviews[0].text.substring(0, 100)
    : null;

  const tokens: any = {
    business_name: businessName,
    decision_maker_name: capitalizedName,
    location,
    rating: rating.toString(),
    review_count: reviewCount.toString(),
    website,
    phone,
    niche: campaign.niche || 'business',
  };

  if (variant && variant.subject && variant.body) {
    let subject = variant.subject || '';
    let body = variant.body || '';

    Object.keys(tokens).forEach(key => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(placeholder, tokens[key]);
      body = body.replace(placeholder, tokens[key]);
    });

    return {
      subject,
      body,
      prompt: variant.ai_prompt || 'Variant template used',
      tokens,
    };
  }

  if (template && template.template_type === 'manual') {
    let subject = template.subject || '';
    let body = template.body || '';

    Object.keys(tokens).forEach(key => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(placeholder, tokens[key]);
      body = body.replace(placeholder, tokens[key]);
    });

    if (template.pitch) {
      body = body.replace(/\{\{pitch\}\}/g, template.pitch);
    }

    return {
      subject,
      body,
      prompt: 'Manual template used',
      tokens,
    };
  }

  const aiModel = userPrefs?.ai_model || 'gpt-5.2';
  const creativityLevel = userPrefs?.creativity_level || 0.75;
  const brandVoice = userPrefs?.brand_voice || '';
  const avoidPhrases = userPrefs?.avoid_phrases || [];
  const customInstructions = userPrefs?.custom_instructions || '';

  let systemPrompt = `You are an expert cold email writer specializing in B2B outreach powered by GPT-5.2's advanced reasoning.

Before writing, analyze the business data to identify key personalization opportunities. Consider:
- What makes this business unique based on their reviews and rating?
- What pain points might they have in their industry?
- What value can we offer that's specifically relevant to them?

Then write a personalized, compelling email that:
- Is concise (100-150 words)
- Feels human and conversational, not AI-generated
- Shows genuine research about the recipient
- Includes a clear, specific value proposition
- References specific details about their business (not generic)
- Ends with a simple, low-friction call to action
- Avoids marketing jargon, excessive enthusiasm, and spam triggers`;

  if (brandVoice) {
    systemPrompt += `\n\nBrand Voice: ${brandVoice}`;
  }

  if (avoidPhrases.length > 0) {
    systemPrompt += `\n\nAvoid these phrases: ${avoidPhrases.join(', ')}`;
  }

  if (customInstructions) {
    systemPrompt += `\n\nCustom Instructions: ${customInstructions}`;
  }

  let userPrompt = '';

  if (template && template.template_type === 'ai' && template.ai_prompt) {
    let aiPrompt = template.ai_prompt;

    Object.keys(tokens).forEach(key => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      aiPrompt = aiPrompt.replace(placeholder, tokens[key]);
    });

    if (template.pitch) {
      aiPrompt = aiPrompt.replace(/\{\{pitch\}\}/g, template.pitch);
    }

    systemPrompt += `\n\nTone: ${template.tone || 'professional'}
Email Goal: ${template.email_goal?.replace('_', ' ') || 'cold outreach'}
Target Industry: ${template.industry || campaign.niche}
Target Audience: ${template.target_audience || 'business owners'}`;

    userPrompt = `First, analyze this business data and identify 2-3 specific personalization opportunities:\n\nBusiness: ${businessName}\nIndustry: ${campaign.niche}\nLocation: ${location}\nDecision Maker: ${capitalizedName}\n${rating > 0 ? `Rating: ${rating} stars (${reviewCount} reviews)` : ''}\n${reviewInsight ? `Recent review: "${reviewInsight}"` : ''}\n\nThen, based on your analysis, ${aiPrompt}`;
  } else {
    userPrompt = `First, analyze this business and identify specific personalization angles:\n\nBusiness: ${businessName}\nIndustry: ${campaign.niche}\nLocation: ${location}\nDecision Maker: ${capitalizedName}\n${rating > 0 ? `Rating: ${rating} stars (${reviewCount} reviews)` : ''}\n${reviewInsight ? `Recent review mentions: "${reviewInsight}"` : ''}\n\nBased on your analysis, write a personalized cold email that acknowledges their ${rating > 0 ? 'strong reputation' : 'business'} and offers value specifically relevant to their situation.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: aiModel === 'gpt-5.2' ? 'gpt-5-2025-12' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: creativityLevel,
      max_tokens: 800,
    });

    const generatedBody = completion.choices[0]?.message?.content?.trim() || '';

    const subjectCompletion = await openai.chat.completions.create({
      model: aiModel === 'gpt-5.2' ? 'gpt-5-2025-12' : 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing compelling email subject lines. Write a short (5-8 words), personalized subject line that will get opened. Be specific and relevant to the business. Avoid generic phrases, hype words, and spam triggers like "Amazing", "Free", "Act now". Focus on curiosity or specific value.'
        },
        {
          role: 'user',
          content: `Write a subject line for this email to ${capitalizedName} at ${businessName}:\n\n${generatedBody}`
        }
      ],
      temperature: creativityLevel + 0.05,
      max_tokens: 50,
    });

    const generatedSubject = subjectCompletion.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') ||
      `Quick question about ${businessName}`;

    let qualityScore;
    if (aiModel === 'gpt-5.2') {
      try {
        const qualityCompletion = await openai.chat.completions.create({
          model: 'gpt-5-2025-12',
          messages: [
            {
              role: 'system',
              content: 'Analyze this cold email and rate its quality on a scale of 0-100. Consider: personalization depth, spam trigger avoidance, clarity, value proposition, and likelihood to get a response. Return ONLY a number.'
            },
            {
              role: 'user',
              content: `Subject: ${generatedSubject}\n\nBody: ${generatedBody}`
            }
          ],
          temperature: 0.3,
          max_tokens: 10,
        });
        qualityScore = parseInt(qualityCompletion.choices[0]?.message?.content?.trim() || '0');
      } catch (e) {
        console.log('Quality scoring failed, continuing without score');
      }
    }

    return {
      subject: generatedSubject,
      body: generatedBody,
      prompt: userPrompt,
      tokens,
      qualityScore,
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    if (error.status === 429) {
      throw new Error('Rate limit reached. Please try again in a moment.');
    }

    if (error.status === 401) {
      throw new Error('OpenAI API key is invalid');
    }

    throw new Error(`AI generation failed: ${error.message}`);
  }
}
