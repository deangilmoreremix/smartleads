import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import OpenAI from 'npm:openai@4';

async function logProgress(
  supabase: SupabaseClient,
  jobId: string,
  options: {
    level?: 'info' | 'success' | 'warning' | 'error' | 'loading';
    icon?: string;
    message: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const { level = 'info', icon = '💡', message, metadata = {} } = options;
  try {
    await supabase.from('agent_progress_logs').insert({
      job_id: jobId,
      log_level: level,
      icon,
      message,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log progress:', error);
  }
}

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
          openai,
          supabaseClient
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

async function getLeadIntelligence(
  supabaseClient: any,
  leadId: string
): Promise<{
  services: string[];
  painPoints: string[];
  conversationStarter: string | null;
  techStack: string[];
  companySize: string | null;
  decisionMaker: { name: string; role: string } | null;
  websiteHealth: {
    seoScore: number;
    hasSSL: boolean;
    mobileScore: number;
    recommendedServices: string[];
  } | null;
  intentSignals: Array<{ type: string; strength: string; title: string }>;
}> {
  const [researchResult, healthResult, signalsResult] = await Promise.all([
    supabaseClient
      .from('lead_research')
      .select('*')
      .eq('lead_id', leadId)
      .maybeSingle(),
    supabaseClient
      .from('website_health_scores')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseClient
      .from('intent_signals')
      .select('signal_type, signal_strength, title')
      .eq('lead_id', leadId)
      .eq('is_actionable', true)
      .order('relevance_score', { ascending: false })
      .limit(5),
  ]);

  const research = researchResult.data;
  const health = healthResult.data;
  const signals = signalsResult.data || [];

  return {
    services: Array.isArray(research?.main_services)
      ? research.main_services.map((s: { name: string }) => s.name)
      : [],
    painPoints: Array.isArray(research?.identified_pain_points)
      ? research.identified_pain_points
      : [],
    conversationStarter: Array.isArray(research?.conversation_starters) && research.conversation_starters.length > 0
      ? research.conversation_starters[0]
      : null,
    techStack: Array.isArray(research?.tech_stack) ? research.tech_stack : [],
    companySize: research?.company_size_estimate || null,
    decisionMaker: Array.isArray(research?.decision_makers) && research.decision_makers.length > 0
      ? research.decision_makers[0]
      : null,
    websiteHealth: health ? {
      seoScore: health.seo_score || 0,
      hasSSL: health.has_ssl || false,
      mobileScore: health.mobile_score || 0,
      recommendedServices: Array.isArray(health.recommended_services) ? health.recommended_services : [],
    } : null,
    intentSignals: signals.map((s: { signal_type: string; signal_strength: string; title: string }) => ({
      type: s.signal_type,
      strength: s.signal_strength,
      title: s.title,
    })),
  };
}

function buildIntentBasedApproach(
  intentSignals: Array<{ type: string; strength: string; title: string }>,
  websiteHealth: { seoScore: number; hasSSL: boolean; mobileScore: number; recommendedServices: string[] } | null
): { approach: string; hooks: string[]; serviceRecommendations: string[] } {
  const hooks: string[] = [];
  const serviceRecommendations: string[] = [];
  let approach = 'standard';

  for (const signal of intentSignals) {
    switch (signal.type) {
      case 'hiring_surge':
      case 'job_posting':
        hooks.push(`Reference their growth: "${signal.title}"`);
        approach = 'growth_focused';
        break;
      case 'funding_announcement':
        hooks.push('Congratulate on funding and offer scaling services');
        approach = 'high_value';
        break;
      case 'negative_review':
        hooks.push('Offer reputation management or service improvement');
        approach = 'problem_solver';
        serviceRecommendations.push('Reputation management');
        break;
      case 'expansion_news':
        hooks.push('Reference expansion and offer support services');
        approach = 'growth_focused';
        break;
      case 'technology_adoption':
        hooks.push(`Mention their tech adoption: "${signal.title}"`);
        approach = 'tech_savvy';
        break;
    }
  }

  if (websiteHealth) {
    if (websiteHealth.seoScore < 50) {
      serviceRecommendations.push('SEO optimization');
      hooks.push('Their website could rank higher with SEO improvements');
    }
    if (!websiteHealth.hasSSL) {
      serviceRecommendations.push('SSL certificate and security audit');
      hooks.push('Security improvement opportunity');
    }
    if (websiteHealth.mobileScore < 60) {
      serviceRecommendations.push('Mobile optimization');
      hooks.push('Mobile experience needs improvement');
    }
    if (websiteHealth.recommendedServices.length > 0) {
      serviceRecommendations.push(...websiteHealth.recommendedServices.slice(0, 3));
    }
  }

  return { approach, hooks, serviceRecommendations };
}

async function generatePersonalizedEmail(
  lead: any,
  campaign: any,
  template: any | null,
  variant: any | null,
  userPrefs: any | null,
  openai: OpenAI,
  supabaseClient?: any
): Promise<{ subject: string; body: string; prompt: string; tokens: any; qualityScore?: number; intelligence?: any }> {
  const businessName = lead.business_name || 'your business';
  const reviews = lead.scraped_data?.reviews || [];
  const rating = lead.rating || 0;
  const reviewCount = lead.review_count || 0;
  const location = lead.address || campaign.location || 'your area';
  const website = lead.website || '';
  const phone = lead.phone || '';

  let intelligence = null;
  let intentApproach = null;

  if (supabaseClient && lead.id) {
    try {
      intelligence = await getLeadIntelligence(supabaseClient, lead.id);
      intentApproach = buildIntentBasedApproach(intelligence.intentSignals, intelligence.websiteHealth);
    } catch (err) {
      console.log('Failed to fetch lead intelligence:', err);
    }
  }

  const firstName = intelligence?.decisionMaker?.name?.split(' ')[0] ||
    lead.decision_maker_name ||
    (lead.email ? lead.email.split('@')[0].split('.')[0] : 'there');
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const reviewInsight = reviews.length > 0 && reviews[0].text
    ? reviews[0].text.substring(0, 100)
    : null;

  const tokens: any = {
    business_name: businessName,
    decision_maker_name: capitalizedName,
    first_name: capitalizedName,
    location,
    rating: rating.toString(),
    review_count: reviewCount.toString(),
    website,
    phone,
    niche: campaign.niche || 'business',
    services: intelligence?.services?.slice(0, 3).join(', ') || '',
    pain_points: intelligence?.painPoints?.slice(0, 2).join('; ') || '',
    conversation_starter: intelligence?.conversationStarter || '',
    tech_stack: intelligence?.techStack?.slice(0, 3).join(', ') || '',
    company_size: intelligence?.companySize || '',
    decision_maker_role: intelligence?.decisionMaker?.role || 'Owner',
    recommended_services: intentApproach?.serviceRecommendations?.slice(0, 3).join(', ') || '',
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

  const brandVoice = userPrefs?.brand_voice || '';
  const avoidPhrases = userPrefs?.avoid_phrases || [];
  const customInstructions = userPrefs?.custom_instructions || '';

  let systemPrompt = `You are an expert cold email writer specializing in B2B outreach.

Before writing, analyze the business data to identify key personalization opportunities. Consider:
- What makes this business unique based on their reviews and rating?
- What pain points might they have in their industry?
- What value can we offer that's specifically relevant to them?

${intentApproach && intentApproach.approach !== 'standard' ? `
APPROACH TO USE: ${intentApproach.approach}
${intentApproach.hooks.length > 0 ? `PERSONALIZATION HOOKS:\n${intentApproach.hooks.map(h => `- ${h}`).join('\n')}` : ''}
` : ''}

${intelligence && intelligence.intentSignals.length > 0 ? `
INTENT SIGNALS DETECTED (use these subtly):
${intelligence.intentSignals.map((s: { type: string; title: string; strength: string }) => `- ${s.type}: ${s.title} (${s.strength} priority)`).join('\n')}
` : ''}

${intelligence && intelligence.websiteHealth ? `
WEBSITE ANALYSIS (identify opportunities):
- SEO Score: ${intelligence.websiteHealth.seoScore}/100${intelligence.websiteHealth.seoScore < 50 ? ' (opportunity for SEO services)' : ''}
- Mobile Score: ${intelligence.websiteHealth.mobileScore}/100${intelligence.websiteHealth.mobileScore < 60 ? ' (needs mobile optimization)' : ''}
- Has SSL: ${intelligence.websiteHealth.hasSSL ? 'Yes' : 'No (security vulnerability)'}
${intelligence.websiteHealth.recommendedServices.length > 0 ? `- Recommended Services: ${intelligence.websiteHealth.recommendedServices.slice(0, 3).join(', ')}` : ''}
` : ''}

${intelligence && intelligence.painPoints.length > 0 ? `
IDENTIFIED PAIN POINTS:
${intelligence.painPoints.slice(0, 3).map((p: string) => `- ${p}`).join('\n')}
` : ''}

Then write a personalized, compelling email that:
- Is concise (100-150 words)
- Feels human and conversational, not AI-generated
- Shows genuine research about the recipient
- Includes a clear, specific value proposition
- References specific details about their business (not generic)
- Naturally incorporates intent signals without being obvious
- Ends with a simple, low-friction call to action
- Avoids marketing jargon, excessive enthusiasm, and spam triggers

You MUST respond with valid JSON in this exact format:
{
  "subject": "5-8 word compelling subject line",
  "body": "The full email body text",
  "quality_score": 0-100 rating based on personalization depth, spam trigger avoidance, clarity, value proposition, and likelihood to get a response
}`;

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

    userPrompt = `First, analyze this business data and identify 2-3 specific personalization opportunities:\n\nBusiness: ${businessName}\nIndustry: ${campaign.niche}\nLocation: ${location}\nDecision Maker: ${capitalizedName}\n${rating > 0 ? `Rating: ${rating} stars (${reviewCount} reviews)` : ''}\n${reviewInsight ? `Recent review: "${reviewInsight}"` : ''}\n\nThen, based on your analysis, ${aiPrompt}\n\nRespond with JSON only.`;
  } else {
    userPrompt = `Write a cold email for:
Business: ${businessName}
Industry: ${campaign.niche}
Location: ${location}
Decision Maker: ${capitalizedName}${intelligence?.decisionMaker?.role ? ` (${intelligence.decisionMaker.role})` : ''}
${rating > 0 ? `Rating: ${rating} stars (${reviewCount} reviews)` : ''}
${reviewInsight ? `Recent review: "${reviewInsight}"` : ''}
${tokens.services ? `Main Services: ${tokens.services}` : ''}
${tokens.pain_points ? `Pain Points: ${tokens.pain_points}` : ''}
${tokens.conversation_starter ? `Conversation Starter: ${tokens.conversation_starter}` : ''}
${tokens.tech_stack ? `Tech Stack: ${tokens.tech_stack}` : ''}
${tokens.company_size ? `Company Size: ${tokens.company_size}` : ''}

Write a personalized email that offers value specifically relevant to their situation. Respond with JSON only.`;
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-5.2',
      instructions: systemPrompt,
      input: userPrompt,
      reasoning: { effort: 'medium' },
      text: { format: { type: 'json_object' } },
    });

    const outputText = response.output?.[0]?.content?.[0]?.text || '{}';
    let parsed: { subject?: string; body?: string; quality_score?: number };

    try {
      parsed = JSON.parse(outputText);
    } catch {
      const subjectMatch = outputText.match(/"subject"\s*:\s*"([^"]+)"/);
      const bodyMatch = outputText.match(/"body"\s*:\s*"([\s\S]*?)(?:"\s*,|\"\s*\})/);
      const scoreMatch = outputText.match(/"quality_score"\s*:\s*(\d+)/);
      parsed = {
        subject: subjectMatch?.[1] || `Quick question about ${businessName}`,
        body: bodyMatch?.[1]?.replace(/\\n/g, '\n') || outputText,
        quality_score: scoreMatch ? parseInt(scoreMatch[1]) : undefined,
      };
    }

    return {
      subject: parsed.subject || `Quick question about ${businessName}`,
      body: parsed.body || '',
      prompt: userPrompt,
      tokens,
      qualityScore: parsed.quality_score,
      intelligence: intelligence ? {
        servicesUsed: intelligence.services.length > 0,
        painPointsUsed: intelligence.painPoints.length > 0,
        intentSignalsUsed: intelligence.intentSignals.length,
        websiteHealthUsed: !!intelligence.websiteHealth,
        approachUsed: intentApproach?.approach || 'standard',
      } : null,
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