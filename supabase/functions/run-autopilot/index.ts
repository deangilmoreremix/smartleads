import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import OpenAI from 'npm:openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AutopilotConfig {
  campaignId?: string;
  userId?: string;
  runType?: 'full_cycle' | 'scrape_only' | 'generate_only' | 'send_only' | 'process_sequences';
  forceRun?: boolean;
}

interface CampaignSettings {
  campaign_id: string;
  is_enabled: boolean;
  daily_email_limit: number;
  send_interval_minutes: number;
  send_window_start: string;
  send_window_end: string;
  timezone: string;
  business_days_only: boolean;
  warmup_enabled: boolean;
  warmup_daily_increase: number;
  ab_testing_enabled: boolean;
  scrape_when_low: boolean;
  min_leads_threshold: number;
  scrape_count_on_low: number;
}

async function logProgress(
  supabase: SupabaseClient,
  jobId: string,
  options: { level?: string; icon?: string; message: string; metadata?: Record<string, unknown> }
): Promise<void> {
  try {
    await supabase.from('agent_progress_logs').insert({
      job_id: jobId,
      log_level: options.level || 'info',
      icon: options.icon || 'info',
      message: options.message,
      metadata: options.metadata || {},
    });
  } catch (error) {
    console.error('Log failed:', error);
  }
}

function isWithinSendWindow(settings: CampaignSettings): boolean {
  const now = new Date();
  const timezone = settings.timezone || 'America/New_York';
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false });
  const timeParts = formatter.formatToParts(now);
  const hour = parseInt(timeParts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(timeParts.find(p => p.type === 'minute')?.value || '0');
  const currentTime = hour * 60 + minute;
  const [startHour, startMinute] = (settings.send_window_start || '09:00').split(':').map(Number);
  const [endHour, endMinute] = (settings.send_window_end || '17:00').split(':').map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  if (settings.business_days_only) {
    const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' });
    const dayOfWeek = dayFormatter.format(now);
    if (dayOfWeek === 'Sat' || dayOfWeek === 'Sun') return false;
  }
  return currentTime >= startTime && currentTime <= endTime;
}

async function getAvailableGmailAccount(supabase: SupabaseClient, userId: string): Promise<{ id: string; email: string; unipile_account_id: string; emails_sent_today: number; daily_limit: number } | null> {
  const { data: accounts } = await supabase.from('gmail_accounts').select('*').eq('user_id', userId).eq('is_active', true).not('unipile_account_id', 'is', null);
  if (!accounts || accounts.length === 0) return null;
  const now = new Date();
  for (const account of accounts) {
    if (account.last_reset_at) {
      const lastReset = new Date(account.last_reset_at);
      const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceReset >= 1) {
        await supabase.from('gmail_accounts').update({ emails_sent_today: 0, last_reset_at: now.toISOString() }).eq('id', account.id);
        account.emails_sent_today = 0;
      }
    }
    if (account.emails_sent_today < account.daily_limit) return account;
  }
  return null;
}

async function getPrioritizedLeads(supabase: SupabaseClient, campaignId: string, limit: number): Promise<Array<{ lead_id: string; email: string; business_name: string; priority_score: number; intent_score: number; website_health: number; recommended_approach: string }>> {
  const { data, error } = await supabase.rpc('get_next_leads_to_email', { p_campaign_id: campaignId, p_limit: limit });
  if (error) { console.error('Error getting prioritized leads:', error); return []; }
  return data || [];
}

async function getLeadIntelligence(supabase: SupabaseClient, leadId: string): Promise<{ services: string[]; painPoints: string[]; conversationStarter: string | null; techStack: string[]; companySize: string | null; decisionMaker: { name: string; role: string } | null; websiteHealth: { seoScore: number; hasSSL: boolean; mobileScore: number; recommendedServices: string[] } | null; intentSignals: Array<{ type: string; strength: string; title: string }> }> {
  const [researchResult, healthResult, signalsResult] = await Promise.all([
    supabase.from('lead_research').select('*').eq('lead_id', leadId).maybeSingle(),
    supabase.from('website_health_scores').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('intent_signals').select('signal_type, signal_strength, title').eq('lead_id', leadId).eq('is_actionable', true).order('relevance_score', { ascending: false }).limit(5),
  ]);
  const research = researchResult.data;
  const health = healthResult.data;
  const signals = signalsResult.data || [];
  return {
    services: Array.isArray(research?.main_services) ? research.main_services.map((s: { name: string }) => s.name) : [],
    painPoints: Array.isArray(research?.identified_pain_points) ? research.identified_pain_points : [],
    conversationStarter: Array.isArray(research?.conversation_starters) && research.conversation_starters.length > 0 ? research.conversation_starters[0] : null,
    techStack: Array.isArray(research?.tech_stack) ? research.tech_stack : [],
    companySize: research?.company_size_estimate || null,
    decisionMaker: Array.isArray(research?.decision_makers) && research.decision_makers.length > 0 ? research.decision_makers[0] : null,
    websiteHealth: health ? { seoScore: health.seo_score || 0, hasSSL: health.has_ssl || false, mobileScore: health.mobile_score || 0, recommendedServices: Array.isArray(health.recommended_services) ? health.recommended_services : [] } : null,
    intentSignals: signals.map((s: { signal_type: string; signal_strength: string; title: string }) => ({ type: s.signal_type, strength: s.signal_strength, title: s.title })),
  };
}

function buildIntentBasedApproach(intentSignals: Array<{ type: string; strength: string; title: string }>, websiteHealth: { seoScore: number; hasSSL: boolean; mobileScore: number; recommendedServices: string[] } | null): { approach: string; hooks: string[] } {
  const hooks: string[] = [];
  let approach = 'standard';
  for (const signal of intentSignals) {
    switch (signal.type) {
      case 'hiring_surge': case 'job_posting': hooks.push(`Reference their growth: ${signal.title}`); approach = 'growth_focused'; break;
      case 'funding_announcement': hooks.push('Congratulate on funding and offer scaling services'); approach = 'high_value'; break;
      case 'negative_review': hooks.push('Offer reputation management or service improvement'); approach = 'problem_solver'; break;
      case 'expansion_news': hooks.push('Reference expansion and offer support services'); approach = 'growth_focused'; break;
      case 'technology_adoption': hooks.push(`Mention their tech adoption: ${signal.title}`); approach = 'tech_savvy'; break;
    }
  }
  if (websiteHealth) {
    if (websiteHealth.seoScore < 50) hooks.push('Pitch SEO improvement services');
    if (!websiteHealth.hasSSL) hooks.push('Pitch security audit and SSL implementation');
    if (websiteHealth.mobileScore < 60) hooks.push('Pitch mobile optimization');
    if (websiteHealth.recommendedServices.length > 0) hooks.push(`Recommended services: ${websiteHealth.recommendedServices.slice(0, 3).join(', ')}`);
  }
  return { approach, hooks };
}

async function generatePersonalizedEmailWithIntelligence(openai: OpenAI, lead: { business_name: string; email: string; website?: string; rating?: number; review_count?: number; address?: string }, campaign: { niche: string; location: string }, intelligence: Awaited<ReturnType<typeof getLeadIntelligence>>, intentApproach: { approach: string; hooks: string[] }, userPrefs: { brand_voice?: string; creativity_level?: number; avoid_phrases?: string[] } | null): Promise<{ subject: string; body: string; tokens: Record<string, string> }> {
  const businessName = lead.business_name || 'your business';
  const firstName = intelligence.decisionMaker?.name?.split(' ')[0] || (lead.email ? lead.email.split('@')[0].split('.')[0] : 'there');
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const tokens: Record<string, string> = { business_name: businessName, first_name: capitalizedName, decision_maker_name: intelligence.decisionMaker?.name || capitalizedName, decision_maker_role: intelligence.decisionMaker?.role || 'Owner', services: intelligence.services.slice(0, 3).join(', ') || 'your services', pain_points: intelligence.painPoints.slice(0, 2).join('; ') || '', conversation_starter: intelligence.conversationStarter || '', tech_stack: intelligence.techStack.slice(0, 3).join(', ') || '', company_size: intelligence.companySize || 'your team', niche: campaign.niche, location: lead.address || campaign.location };
  let systemPrompt = `You are an expert cold email writer. Write highly personalized B2B outreach emails.\n\nAPPROACH: ${intentApproach.approach}\n${intentApproach.hooks.length > 0 ? `HOOKS TO USE:\n${intentApproach.hooks.map(h => `- ${h}`).join('\n')}` : ''}\n\n${intelligence.intentSignals.length > 0 ? `INTENT SIGNALS DETECTED:\n${intelligence.intentSignals.map(s => `- ${s.type}: ${s.title} (${s.strength} priority)`).join('\n')}\n` : ''}\n\n${intelligence.websiteHealth ? `WEBSITE ANALYSIS:\n- SEO Score: ${intelligence.websiteHealth.seoScore}/100\n- Mobile Score: ${intelligence.websiteHealth.mobileScore}/100\n- Has SSL: ${intelligence.websiteHealth.hasSSL ? 'Yes' : 'No'}\n${intelligence.websiteHealth.recommendedServices.length > 0 ? `- Opportunities: ${intelligence.websiteHealth.recommendedServices.join(', ')}` : ''}\n` : ''}\n\nWrite a concise (100-150 words), highly personalized email that:\n- References specific details about their business\n- Uses the intent signals naturally\n- Addresses their likely pain points\n- Offers clear, specific value\n- Ends with a simple call to action\n- Avoids spam triggers and marketing jargon\n\nYou MUST respond with valid JSON: {"subject": "5-8 word subject line", "body": "email body text"}`;
  if (userPrefs?.brand_voice) systemPrompt += `\n\nBrand Voice: ${userPrefs.brand_voice}`;
  if (userPrefs?.avoid_phrases?.length) systemPrompt += `\n\nAvoid these phrases: ${userPrefs.avoid_phrases.join(', ')}`;
  const userPrompt = `Write a cold email for:\nBusiness: ${businessName}\nIndustry: ${campaign.niche}\nLocation: ${tokens.location}\nDecision Maker: ${tokens.decision_maker_name} (${tokens.decision_maker_role})\n${intelligence.services.length > 0 ? `Main Services: ${tokens.services}` : ''}\n${intelligence.painPoints.length > 0 ? `Pain Points: ${tokens.pain_points}` : ''}\n${intelligence.conversationStarter ? `Conversation Starter: ${tokens.conversation_starter}` : ''}\n${intelligence.techStack.length > 0 ? `Tech Stack: ${tokens.tech_stack}` : ''}\n${lead.rating ? `Rating: ${lead.rating} stars (${lead.review_count || 0} reviews)` : ''}\n\nRespond with JSON only.`;
  const response = await openai.responses.create({ model: 'gpt-5-mini', instructions: systemPrompt, input: userPrompt, reasoning: { effort: 'low' }, text: { format: { type: 'json_object' } } });
  const outputText = response.output?.[0]?.content?.[0]?.text || '{}';
  let parsed: { subject?: string; body?: string };
  try { parsed = JSON.parse(outputText); } catch { const subjectMatch = outputText.match(/"subject"\s*:\s*"([^"]+)"/); const bodyMatch = outputText.match(/"body"\s*:\s*"([\s\S]*?)(?:"\s*,|\"\s*\})/); parsed = { subject: subjectMatch?.[1] || `Quick question about ${businessName}`, body: bodyMatch?.[1]?.replace(/\\n/g, '\n') || outputText }; }
  return { subject: parsed.subject || `Quick question about ${businessName}`, body: parsed.body || '', tokens };
}

async function sendEmailViaUnipile(apiKey: string, gmailAccount: { unipile_account_id: string; email: string }, to: string, subject: string, body: string, campaignId: string): Promise<{ success: boolean; message_id?: string }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe?email=${encodeURIComponent(to)}&campaign_id=${campaignId}`;
  const htmlBody = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}p{margin-bottom:16px}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center}.unsubscribe{color:#9ca3af;text-decoration:none}</style></head><body>${body.split('\n').map(line => `<p>${line}</p>`).join('')}<div class="footer"><a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a></div></body></html>`;
  const response = await fetch('https://api.unipile.com/api/v1/emails', { method: 'POST', headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ account_id: gmailAccount.unipile_account_id, to: [{ email: to }], subject, body: htmlBody, body_type: 'html' }) });
  if (!response.ok) { const errorText = await response.text(); throw new Error(`Unipile error: ${errorText}`); }
  const result = await response.json();
  return { success: true, message_id: result.id || result.message_id };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  const startTime = Date.now();
  let supabase: SupabaseClient;
  let jobId: string | undefined;
  let userId: string | undefined;
  try {
    supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const config: AutopilotConfig = await req.json();
    const { campaignId, runType = 'full_cycle', forceRun = false } = config;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) { const token = authHeader.replace('Bearer ', ''); const { data: { user } } = await supabase.auth.getUser(token); if (user) userId = user.id; }
    if (config.userId) userId = config.userId;
    if (!userId) throw new Error('User ID required');
    let campaignsToProcess: Array<{ campaign_id: string; settings: CampaignSettings; campaign: Record<string, unknown> }> = [];
    if (campaignId) {
      const { data: settings } = await supabase.from('campaign_autopilot_settings').select('*').eq('campaign_id', campaignId).maybeSingle();
      const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', campaignId).eq('user_id', userId).single();
      if (campaign && (settings?.is_enabled || forceRun)) campaignsToProcess.push({ campaign_id: campaignId, settings: settings || { campaign_id: campaignId, is_enabled: true, daily_email_limit: 50, send_interval_minutes: 5 } as CampaignSettings, campaign });
    } else {
      const { data: allSettings } = await supabase.from('campaign_autopilot_settings').select(`*, campaigns!inner(*)`).eq('is_enabled', true).eq('campaigns.user_id', userId);
      if (allSettings) campaignsToProcess = allSettings.map((s: { campaign_id: string; campaigns: Record<string, unknown> }) => ({ campaign_id: s.campaign_id, settings: s as unknown as CampaignSettings, campaign: s.campaigns }));
    }
    if (campaignsToProcess.length === 0) return new Response(JSON.stringify({ success: true, message: 'No campaigns to process' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const results: Array<{ campaignId: string; campaignName: string; leadsScraped: number; emailsGenerated: number; emailsSent: number; sequencesProcessed: number; errors: string[] }> = [];
    const unipileApiKey = Deno.env.get('UNIPILE_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY not configured');
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const { data: userPrefs } = await supabase.from('user_ai_preferences').select('*').eq('user_id', userId).maybeSingle();
    for (const { campaign_id, settings, campaign } of campaignsToProcess) {
      const campaignResult = { campaignId: campaign_id, campaignName: (campaign as { name?: string }).name || 'Campaign', leadsScraped: 0, emailsGenerated: 0, emailsSent: 0, sequencesProcessed: 0, errors: [] as string[] };
      jobId = crypto.randomUUID();
      await supabase.from('agent_jobs').insert({ id: jobId, campaign_id, user_id: userId, job_type: 'autopilot_run', status: 'running', progress_percentage: 0, result_data: { campaign_name: campaignResult.campaignName, run_type: runType } });
      await logProgress(supabase, jobId, { level: 'info', icon: 'robot', message: `Starting autopilot cycle for ${campaignResult.campaignName}` });
      try {
        if (!forceRun && !isWithinSendWindow(settings)) { await logProgress(supabase, jobId, { level: 'info', icon: 'clock', message: 'Outside send window, skipping campaign' }); continue; }
        if (runType === 'full_cycle' || runType === 'process_sequences') {
          await logProgress(supabase, jobId, { level: 'loading', icon: 'list', message: 'Processing email sequences...' });
          const { data: readyLeads } = await supabase.from('lead_sequence_progress').select(`*, leads!inner(id, campaign_id, email, business_name, user_id, has_replied)`).eq('is_paused', false).is('completed_at', null).lte('next_send_date', new Date().toISOString()).limit(50);
          if (readyLeads && readyLeads.length > 0) {
            for (const progress of readyLeads) {
              const lead = progress.leads;
              if (!lead || lead.has_replied || lead.campaign_id !== campaign_id) continue;
              const { data: step } = await supabase.from('email_sequence_steps').select('*').eq('campaign_id', campaign_id).eq('step_number', progress.current_step).eq('is_active', true).maybeSingle();
              if (step) {
                await supabase.from('emails').insert({ campaign_id, lead_id: lead.id, user_id: userId, subject: step.subject.replace(/\{\{business_name\}\}/g, lead.business_name || ''), body: step.body.replace(/\{\{business_name\}\}/g, lead.business_name || ''), status: 'queued' });
                const nextStepNumber = progress.current_step + 1;
                const { data: nextStep } = await supabase.from('email_sequence_steps').select('delay_days').eq('campaign_id', campaign_id).eq('step_number', nextStepNumber).maybeSingle();
                if (nextStep) { const nextDate = new Date(); nextDate.setDate(nextDate.getDate() + nextStep.delay_days); await supabase.from('lead_sequence_progress').update({ current_step: nextStepNumber, next_send_date: nextDate.toISOString() }).eq('id', progress.id); } else { await supabase.from('lead_sequence_progress').update({ completed_at: new Date().toISOString() }).eq('id', progress.id); }
                campaignResult.sequencesProcessed++;
              }
            }
          }
        }
        if (runType === 'full_cycle' || runType === 'generate_only') {
          await logProgress(supabase, jobId, { level: 'loading', icon: 'pencil', message: 'Generating personalized emails with deep intelligence...' });
          const prioritizedLeads = await getPrioritizedLeads(supabase, campaign_id, settings.daily_email_limit || 50);
          for (const leadInfo of prioritizedLeads) {
            try {
              const { data: lead } = await supabase.from('leads').select('*').eq('id', leadInfo.lead_id).single();
              if (!lead) continue;
              const intelligence = await getLeadIntelligence(supabase, lead.id);
              const intentApproach = buildIntentBasedApproach(intelligence.intentSignals, intelligence.websiteHealth);
              const emailContent = await generatePersonalizedEmailWithIntelligence(openai, lead, campaign as { niche: string; location: string }, intelligence, intentApproach, userPrefs);
              await supabase.from('emails').insert({ campaign_id, lead_id: lead.id, user_id: userId, subject: emailContent.subject, body: emailContent.body, ai_generated: true, personalization_tokens: emailContent.tokens, personalization_data: { intent_approach: intentApproach.approach, hooks_used: intentApproach.hooks, intelligence_used: { services: intelligence.services.length > 0, pain_points: intelligence.painPoints.length > 0, intent_signals: intelligence.intentSignals.length > 0, website_health: !!intelligence.websiteHealth } }, status: 'queued' });
              await supabase.from('email_previews').insert({ user_id: userId, lead_id: lead.id, campaign_id, subject: emailContent.subject, body: emailContent.body, tokens_used: emailContent.tokens, services_mentioned: intelligence.services, pain_points_addressed: intelligence.painPoints, conversation_starter: intelligence.conversationStarter, tech_stack_mentioned: intelligence.techStack, decision_maker_info: intelligence.decisionMaker, status: 'pending' });
              campaignResult.emailsGenerated++;
              if (campaignResult.emailsGenerated % 5 === 0) await logProgress(supabase, jobId, { level: 'info', icon: 'check', message: `Generated ${campaignResult.emailsGenerated} personalized emails` });
            } catch (err) { campaignResult.errors.push(`Lead ${leadInfo.lead_id}: ${err instanceof Error ? err.message : 'Unknown error'}`); }
          }
        }
        if ((runType === 'full_cycle' || runType === 'send_only') && unipileApiKey) {
          await logProgress(supabase, jobId, { level: 'loading', icon: 'send', message: 'Sending queued emails...' });
          const gmailAccount = await getAvailableGmailAccount(supabase, userId);
          if (!gmailAccount) { await logProgress(supabase, jobId, { level: 'warning', icon: 'warning', message: 'No Gmail account available for sending' }); } else {
            const { data: queuedEmails } = await supabase.from('emails').select('*, leads!inner(email, business_name)').eq('campaign_id', campaign_id).eq('status', 'queued').order('created_at', { ascending: true }).limit(settings.daily_email_limit || 50);
            if (queuedEmails && queuedEmails.length > 0) {
              for (const email of queuedEmails) {
                if (gmailAccount.emails_sent_today >= gmailAccount.daily_limit) { await logProgress(supabase, jobId, { level: 'warning', icon: 'warning', message: 'Daily sending limit reached' }); break; }
                const { data: isUnsubscribed } = await supabase.from('unsubscribes').select('id').eq('email', email.leads.email.toLowerCase().trim()).maybeSingle();
                if (isUnsubscribed) { await supabase.from('emails').update({ status: 'skipped', error_message: 'Recipient unsubscribed' }).eq('id', email.id); continue; }
                try {
                  const result = await sendEmailViaUnipile(unipileApiKey, gmailAccount, email.leads.email, email.subject, email.body, campaign_id);
                  if (result.success) {
                    await supabase.from('emails').update({ status: 'sent', sent_at: new Date().toISOString(), unipile_message_id: result.message_id }).eq('id', email.id);
                    await supabase.from('leads').update({ status: 'contacted', last_contacted_at: new Date().toISOString() }).eq('id', email.lead_id);
                    await supabase.from('gmail_accounts').update({ emails_sent_today: gmailAccount.emails_sent_today + 1 }).eq('id', gmailAccount.id);
                    gmailAccount.emails_sent_today++;
                    campaignResult.emailsSent++;
                  }
                } catch (err) { await supabase.from('emails').update({ status: 'failed', error_message: err instanceof Error ? err.message : 'Send failed' }).eq('id', email.id); campaignResult.errors.push(`Email ${email.id}: ${err instanceof Error ? err.message : 'Send failed'}`); }
                await new Promise(resolve => setTimeout(resolve, (settings.send_interval_minutes || 5) * 1000));
              }
            }
          }
        }
        await supabase.from('autopilot_runs').insert({ campaign_id, user_id: userId, run_type: runType, status: 'completed', started_at: new Date(startTime).toISOString(), completed_at: new Date().toISOString(), leads_scraped: campaignResult.leadsScraped, emails_generated: campaignResult.emailsGenerated, emails_sent: campaignResult.emailsSent });
        await supabase.from('campaigns').update({ last_autopilot_run: new Date().toISOString(), total_autopilot_emails_sent: (campaign as { total_autopilot_emails_sent?: number }).total_autopilot_emails_sent || 0 + campaignResult.emailsSent }).eq('id', campaign_id);
        await supabase.from('agent_jobs').update({ status: 'completed', progress_percentage: 100, result_data: { campaign_name: campaignResult.campaignName, leadsScraped: campaignResult.leadsScraped, emailsGenerated: campaignResult.emailsGenerated, emailsSent: campaignResult.emailsSent, sequencesProcessed: campaignResult.sequencesProcessed } }).eq('id', jobId);
        await logProgress(supabase, jobId, { level: 'success', icon: 'party', message: `Autopilot complete! Generated ${campaignResult.emailsGenerated}, sent ${campaignResult.emailsSent} emails` });
      } catch (err) {
        campaignResult.errors.push(err instanceof Error ? err.message : 'Unknown error');
        if (jobId) { await supabase.from('agent_jobs').update({ status: 'failed', error_message: err instanceof Error ? err.message : 'Unknown error' }).eq('id', jobId); await logProgress(supabase, jobId, { level: 'error', icon: 'error', message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }); }
      }
      results.push(campaignResult);
    }
    const totalGenerated = results.reduce((sum, r) => sum + r.emailsGenerated, 0);
    const totalSent = results.reduce((sum, r) => sum + r.emailsSent, 0);
    return new Response(JSON.stringify({ success: true, campaigns: results.length, totalEmailsGenerated: totalGenerated, totalEmailsSent: totalSent, results, durationMs: Date.now() - startTime }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Autopilot error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});