import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const RTRVR_BASE_URL = 'https://api.rtrvr.ai';

interface RtrvrScrapeResult {
  content: string;
  accessibilityTree?: Record<string, unknown>;
  url: string;
  usage: { browserCredits: number; proxyCredits: number };
  trajectoryId: string;
}

interface RtrvrAgentResult {
  success: boolean;
  finalUrl: string;
  steps: Array<{ action: string; url: string; content?: string; timestamp: string }>;
  extractedData: Record<string, unknown>;
  content: string;
  usage: { browserCredits: number; proxyCredits: number; totalSteps: number };
  trajectoryId: string;
}

class RtrvrClient {
  private apiKey: string;
  private totalBrowserCredits = 0;
  private totalProxyCredits = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async scrape(url: string, options: { onlyTextContent?: boolean; timeout?: number } = {}): Promise<RtrvrScrapeResult> {
    const { onlyTextContent = false, timeout = 30000 } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${RTRVR_BASE_URL}/scrape`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, onlyTextContent, proxyMode: 'default' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Scrape failed: ${response.status}`);
      const data = await response.json();
      this.totalBrowserCredits += data.usage?.browserCredits || 0;
      this.totalProxyCredits += data.usage?.proxyCredits || 0;
      return {
        content: data.content || data.text || '',
        accessibilityTree: data.accessibilityTree,
        url: data.url || url,
        usage: { browserCredits: data.usage?.browserCredits || 0, proxyCredits: data.usage?.proxyCredits || 0 },
        trajectoryId: data.trajectoryId || crypto.randomUUID(),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async agent(task: string, startUrl: string, options: { maxSteps?: number; timeout?: number } = {}): Promise<RtrvrAgentResult> {
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
      return {
        success: data.success ?? true,
        finalUrl: data.finalUrl || startUrl,
        steps: data.steps || [],
        extractedData: data.extractedData || data.data || {},
        content: data.content || '',
        usage: { browserCredits: data.usage?.browserCredits || 0, proxyCredits: data.usage?.proxyCredits || 0, totalSteps: data.steps?.length || 0 },
        trajectoryId: data.trajectoryId || crypto.randomUUID(),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async scrapeBatch(urls: string[], options: { onlyTextContent?: boolean; timeout?: number } = {}): Promise<Map<string, RtrvrScrapeResult | Error>> {
    const results = new Map<string, RtrvrScrapeResult | Error>();
    for (const url of urls) {
      try {
        const result = await this.scrape(url, options);
        results.set(url, result);
      } catch (error) {
        results.set(url, error instanceof Error ? error : new Error(String(error)));
      }
    }
    return results;
  }

  getUsageStats() {
    return { totalBrowserCredits: this.totalBrowserCredits, totalProxyCredits: this.totalProxyCredits };
  }

  calculateCost() {
    const browserCost = this.totalBrowserCredits * 0.001;
    const proxyCost = this.totalProxyCredits * 0.0005;
    return { browserCost, proxyCost, total: browserCost + proxyCost };
  }
}

interface DeepResearchRequest {
  leadId: string;
  depth?: 'basic' | 'standard' | 'deep';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function logProgress(supabase: SupabaseClient, jobId: string, options: { level?: string; icon?: string; message: string; metadata?: Record<string, unknown> }): Promise<void> {
  try {
    await supabase.from('agent_progress_logs').insert({ job_id: jobId, log_level: options.level || 'info', icon: options.icon || '💡', message: options.message, metadata: options.metadata || {} });
  } catch (error) {
    console.error('Log failed:', error);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

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

    const { leadId, depth = 'standard' }: DeepResearchRequest = await req.json();
    if (!leadId) throw new Error('Missing leadId');

    const { data: lead, error: leadError } = await supabase.from('leads').select('*').eq('id', leadId).eq('user_id', user.id).single();
    if (leadError || !lead) throw new Error('Lead not found');
    if (!lead.website) throw new Error('Lead has no website');

    const rtrvrApiKey = Deno.env.get('RTRVR_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!rtrvrApiKey) throw new Error('RTRVR_API_KEY not configured');
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY not configured');

    const rtrvr = new RtrvrClient(rtrvrApiKey);

    jobId = crypto.randomUUID();
    await supabase.from('research_jobs').insert({ id: jobId, user_id: user.id, lead_id: leadId, campaign_id: lead.campaign_id, job_type: 'deep_research', status: 'running', progress_percentage: 0, config: { depth } });

    await logProgress(supabase, jobId, { level: 'info', icon: '🔍', message: `Starting ${depth} research on ${lead.business_name}` });

    const homepage = await rtrvr.scrape(lead.website, { onlyTextContent: false, timeout: 45000 });
    await supabase.from('research_jobs').update({ progress_percentage: 20 }).eq('id', jobId);

    let allContent = homepage.content;
    const baseUrl = new URL(lead.website).origin;
    const pagesToScrape: string[] = [];

    if (depth === 'standard' || depth === 'deep') {
      pagesToScrape.push(`${baseUrl}/about`, `${baseUrl}/about-us`, `${baseUrl}/services`, `${baseUrl}/contact`);
    }
    if (depth === 'deep') {
      pagesToScrape.push(`${baseUrl}/team`, `${baseUrl}/pricing`, `${baseUrl}/blog`);
    }

    if (pagesToScrape.length > 0) {
      await logProgress(supabase, jobId, { level: 'loading', icon: '🌐', message: `Scraping ${pagesToScrape.length} additional pages...` });
      const additionalPages = await rtrvr.scrapeBatch(pagesToScrape, { onlyTextContent: true, timeout: 30000 });
      additionalPages.forEach((result, url) => {
        if (!(result instanceof Error)) allContent += `\n\n--- ${url} ---\n${result.content}`;
      });
    }

    await supabase.from('research_jobs').update({ progress_percentage: 50 }).eq('id', jobId);
    await logProgress(supabase, jobId, { level: 'loading', icon: '🤖', message: 'GPT-5.2 analyzing content...' });

    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Extract structured business data. Return valid JSON only.' },
          { role: 'user', content: `Analyze website for ${lead.business_name} (${lead.website}):\n\n${allContent.slice(0, 40000)}\n\nExtract JSON: {main_services: [{name, description}], unique_value_proposition: string, team_members: [{name, role, email?}], company_size_estimate: "solo"|"small"|"medium"|"large", founding_year?: number, tech_stack: string[], identified_pain_points: string[], conversation_starters: string[], decision_makers: [{name, role, email?, linkedin?}]}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    const analysisData = await analysisResponse.json();
    let extractedInfo: Record<string, unknown> = {};
    try { extractedInfo = JSON.parse(analysisData.choices[0]?.message?.content || '{}'); } catch { /* ignore */ }

    await supabase.from('research_jobs').update({ progress_percentage: 75 }).eq('id', jobId);

    let decisionMakers: Array<{ name: string; role: string }> = [];
    if (depth === 'deep') {
      await logProgress(supabase, jobId, { level: 'loading', icon: '👤', message: 'Finding decision makers...' });
      try {
        const searchQuery = encodeURIComponent(`"${lead.business_name}" site:linkedin.com/in CEO OR founder OR owner`);
        const dmResult = await rtrvr.agent(`Find decision makers at "${lead.business_name}"`, `https://www.google.com/search?q=${searchQuery}`, { maxSteps: 5, timeout: 60000 });
        if (Array.isArray(dmResult.extractedData?.decisionMakers)) decisionMakers = dmResult.extractedData.decisionMakers as typeof decisionMakers;
      } catch { /* ignore */ }
    }

    await logProgress(supabase, jobId, { level: 'loading', icon: '💾', message: 'Saving research...' });

    const researchData = {
      lead_id: leadId,
      user_id: user.id,
      website_content: allContent.slice(0, 100000),
      main_services: extractedInfo.main_services || [],
      unique_value_proposition: extractedInfo.unique_value_proposition || null,
      recent_blog_posts: extractedInfo.recent_blog_posts || [],
      team_members: extractedInfo.team_members || [],
      company_size_estimate: extractedInfo.company_size_estimate || null,
      founding_year: extractedInfo.founding_year || null,
      tech_stack: extractedInfo.tech_stack || [],
      identified_pain_points: extractedInfo.identified_pain_points || [],
      conversation_starters: extractedInfo.conversation_starters || [],
      decision_makers: [...(Array.isArray(extractedInfo.decision_makers) ? extractedInfo.decision_makers : []), ...decisionMakers],
      research_depth: depth,
      pages_analyzed: 1 + pagesToScrape.length,
      research_status: 'completed',
      last_researched_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase.from('lead_research').select('id').eq('lead_id', leadId).maybeSingle();
    if (existing) await supabase.from('lead_research').update(researchData).eq('id', existing.id);
    else await supabase.from('lead_research').insert(researchData);

    await supabase.from('leads').update({ research_completed: true }).eq('id', leadId);

    const usage = rtrvr.getUsageStats();
    const cost = rtrvr.calculateCost();

    await supabase.from('research_jobs').update({ status: 'completed', progress_percentage: 100, result_data: { pagesAnalyzed: researchData.pages_analyzed, servicesFound: (researchData.main_services as unknown[]).length, decisionMakersFound: (researchData.decision_makers as unknown[]).length }, rtrvr_credits_used: usage.totalBrowserCredits + usage.totalProxyCredits, total_cost_usd: cost.total, completed_at: new Date().toISOString() }).eq('id', jobId);

    await logProgress(supabase, jobId, { level: 'success', icon: '✅', message: `Research complete! Found ${(researchData.main_services as unknown[]).length} services, ${(researchData.decision_makers as unknown[]).length} decision makers` });

    return new Response(JSON.stringify({ success: true, jobId, research: researchData, cost: cost.total, durationMs: Date.now() - startTime }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    if (jobId && supabase!) {
      await supabase.from('research_jobs').update({ status: 'failed', result_data: { error: error instanceof Error ? error.message : 'Unknown' } }).eq('id', jobId);
      await logProgress(supabase!, jobId, { level: 'error', icon: '❌', message: `Failed: ${error instanceof Error ? error.message : 'Unknown'}` });
    }
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown', jobId }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});