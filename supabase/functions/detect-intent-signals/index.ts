import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const RTRVR_BASE_URL = 'https://api.rtrvr.ai';

class RtrvrClient {
  private apiKey: string;
  private totalBrowserCredits = 0;
  private totalProxyCredits = 0;

  constructor(apiKey: string) { this.apiKey = apiKey; }

  async agent(task: string, startUrl: string, options: { maxSteps?: number; timeout?: number } = {}) {
    const { maxSteps = 10, timeout = 120000 } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(`${RTRVR_BASE_URL}/agent`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, url: startUrl, maxSteps, proxyMode: 'default' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Agent failed: ${response.status}`);
      const data = await response.json();
      this.totalBrowserCredits += data.usage?.browserCredits || 0;
      this.totalProxyCredits += data.usage?.proxyCredits || 0;
      return { success: data.success ?? true, extractedData: data.extractedData || data.data || {}, content: data.content || '', usage: { browserCredits: data.usage?.browserCredits || 0, proxyCredits: data.usage?.proxyCredits || 0 } };
    } catch (error) { clearTimeout(timeoutId); throw error; }
  }

  getUsageStats() { return { totalBrowserCredits: this.totalBrowserCredits, totalProxyCredits: this.totalProxyCredits }; }
  calculateCost() { return { total: this.totalBrowserCredits * 0.001 + this.totalProxyCredits * 0.0005 }; }
}

const SIGNAL_CONFIGS: Record<string, { terms: string[]; strength: string }> = {
  job_posting: { terms: ['hiring', 'job opening', 'careers'], strength: 'high' },
  funding_announcement: { terms: ['funding', 'raised', 'series'], strength: 'critical' },
  expansion_news: { terms: ['expansion', 'new location', 'growing'], strength: 'high' },
  negative_review: { terms: ['1 star', 'terrible', 'worst'], strength: 'medium' },
  leadership_change: { terms: ['new CEO', 'appointed', 'joins as'], strength: 'high' },
  acquisition: { terms: ['acquired', 'acquisition', 'merger'], strength: 'critical' },
  partnership: { terms: ['partnership', 'partners with'], strength: 'medium' },
  product_launch: { terms: ['launches', 'new product'], strength: 'medium' },
  hiring_surge: { terms: ['multiple positions', 'rapid growth'], strength: 'high' },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function logProgress(supabase: SupabaseClient, jobId: string, options: { level?: string; icon?: string; message: string }) {
  try { await supabase.from('agent_progress_logs').insert({ job_id: jobId, log_level: options.level || 'info', icon: options.icon || '💡', message: options.message, metadata: {} }); } catch { /* ignore */ }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  const startTime = Date.now();
  let supabase: SupabaseClient;
  let jobId: string | undefined;

  try {
    supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { leadId, companyName, campaignId } = await req.json();

    let targetCompany = companyName;
    let targetLeadId = leadId;
    let targetCampaignId = campaignId;

    if (leadId) {
      const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).eq('user_id', user.id).single();
      if (!lead) throw new Error('Lead not found');
      targetCompany = lead.business_name;
      targetCampaignId = lead.campaign_id;
    }

    if (!targetCompany) throw new Error('Missing companyName or leadId');

    const rtrvrApiKey = Deno.env.get('RTRVR_API_KEY');
    if (!rtrvrApiKey) throw new Error('RTRVR_API_KEY not configured');

    const rtrvr = new RtrvrClient(rtrvrApiKey);

    jobId = crypto.randomUUID();
    await supabase.from('research_jobs').insert({ id: jobId, user_id: user.id, lead_id: targetLeadId || null, campaign_id: targetCampaignId || null, job_type: 'intent_signals', status: 'running', progress_percentage: 0, config: { companyName: targetCompany } });

    await logProgress(supabase, jobId, { level: 'info', icon: '📡', message: `Scanning for buying signals: ${targetCompany}` });

    const detectedSignals: Array<{ type: string; strength: string; title: string; description: string; sourceUrl: string; relevanceScore: number; matchedKeywords: string[] }> = [];

    const searchQuery = encodeURIComponent(`"${targetCompany}" hiring OR funding OR expansion OR acquisition`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbs=qdr:m`;

    await logProgress(supabase, jobId, { level: 'loading', icon: '🔍', message: 'Searching news and announcements...' });

    try {
      const result = await rtrvr.agent(`Search for recent news about "${targetCompany}". Find job postings, funding news, expansions, leadership changes. Extract title, source, summary for each.`, searchUrl, { maxSteps: 6, timeout: 60000 });
      await supabase.from('research_jobs').update({ progress_percentage: 50 }).eq('id', jobId);

      if (result.extractedData && Array.isArray(result.extractedData.signals)) {
        for (const signal of result.extractedData.signals as Array<Record<string, unknown>>) {
          const title = String(signal.title || '');
          const summary = String(signal.summary || signal.description || '');
          const combined = (title + ' ' + summary).toLowerCase();
          
          let signalType = 'expansion_news';
          let strength = 'medium';
          const matchedKeywords: string[] = [];
          
          for (const [type, config] of Object.entries(SIGNAL_CONFIGS)) {
            for (const term of config.terms) {
              if (combined.includes(term.toLowerCase())) {
                signalType = type;
                strength = config.strength;
                matchedKeywords.push(term);
                break;
              }
            }
          }

          let relevanceScore = 50;
          if (combined.includes(targetCompany.toLowerCase())) relevanceScore += 20;
          if (matchedKeywords.length > 0) relevanceScore += matchedKeywords.length * 5;
          relevanceScore = Math.min(relevanceScore, 100);

          detectedSignals.push({ type: signalType, strength, title: title || 'News item', description: summary, sourceUrl: String(signal.url || ''), relevanceScore, matchedKeywords: [...new Set(matchedKeywords)] });
        }
      }
    } catch (error) {
      console.error('Signal search failed:', error);
    }

    await logProgress(supabase, jobId, { level: 'loading', icon: '💼', message: 'Checking job postings...' });

    try {
      const jobQuery = encodeURIComponent(`"${targetCompany}" jobs`);
      const jobResult = await rtrvr.agent(`Find job postings from "${targetCompany}". Extract job titles and locations.`, `https://www.google.com/search?q=${jobQuery}`, { maxSteps: 4, timeout: 45000 });
      
      if (jobResult.extractedData && Array.isArray(jobResult.extractedData.jobs)) {
        const jobCount = (jobResult.extractedData.jobs as unknown[]).length;
        if (jobCount > 0) {
          detectedSignals.push({
            type: jobCount > 3 ? 'hiring_surge' : 'job_posting',
            strength: jobCount > 3 ? 'high' : 'medium',
            title: `${targetCompany} is hiring (${jobCount} positions)`,
            description: `Found ${jobCount} job openings indicating business growth.`,
            sourceUrl: `https://www.google.com/search?q=${jobQuery}`,
            relevanceScore: Math.min(50 + jobCount * 10, 95),
            matchedKeywords: ['hiring', 'jobs'],
          });
        }
      }
    } catch { /* ignore */ }

    await supabase.from('research_jobs').update({ progress_percentage: 80 }).eq('id', jobId);
    await logProgress(supabase, jobId, { level: 'loading', icon: '💾', message: `Saving ${detectedSignals.length} signals...` });

    if (detectedSignals.length > 0) {
      await supabase.from('intent_signals').insert(detectedSignals.map(s => ({
        user_id: user.id,
        lead_id: targetLeadId || null,
        campaign_id: targetCampaignId || null,
        signal_type: s.type,
        signal_strength: s.strength,
        title: s.title,
        description: s.description,
        source_url: s.sourceUrl,
        source_platform: 'web',
        company_name: targetCompany,
        relevance_score: s.relevanceScore,
        matched_keywords: s.matchedKeywords,
        is_actionable: s.relevanceScore >= 50,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })));
    }

    const avgRelevance = detectedSignals.length > 0 ? Math.round(detectedSignals.reduce((sum, s) => sum + s.relevanceScore, 0) / detectedSignals.length) : 0;
    if (targetLeadId) await supabase.from('leads').update({ intent_score: avgRelevance }).eq('id', targetLeadId);

    const usage = rtrvr.getUsageStats();
    const cost = rtrvr.calculateCost();

    await supabase.from('research_jobs').update({ status: 'completed', progress_percentage: 100, result_data: { signalsFound: detectedSignals.length, highPriority: detectedSignals.filter(s => s.strength === 'high' || s.strength === 'critical').length, avgRelevance }, rtrvr_credits_used: usage.totalBrowserCredits + usage.totalProxyCredits, total_cost_usd: cost.total, completed_at: new Date().toISOString() }).eq('id', jobId);

    const highPriority = detectedSignals.filter(s => s.strength === 'high' || s.strength === 'critical').length;
    await logProgress(supabase, jobId, { level: 'success', icon: '✅', message: `Found ${detectedSignals.length} signals (${highPriority} high priority)` });

    return new Response(JSON.stringify({ success: true, jobId, signals: detectedSignals, summary: { total: detectedSignals.length, highPriority, avgRelevance }, cost: cost.total, durationMs: Date.now() - startTime }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    if (jobId && supabase!) {
      await supabase.from('research_jobs').update({ status: 'failed', result_data: { error: error instanceof Error ? error.message : 'Unknown' } }).eq('id', jobId);
      await logProgress(supabase!, jobId, { level: 'error', icon: '❌', message: `Failed: ${error instanceof Error ? error.message : 'Unknown'}` });
    }
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown', jobId }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});