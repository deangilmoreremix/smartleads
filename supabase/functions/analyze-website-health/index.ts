import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const RTRVR_BASE_URL = 'https://api.rtrvr.ai';

class RtrvrClient {
  private apiKey: string;
  private totalBrowserCredits = 0;
  private totalProxyCredits = 0;

  constructor(apiKey: string) { this.apiKey = apiKey; }

  async scrape(url: string, options: { onlyTextContent?: boolean; timeout?: number } = {}) {
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
      return { content: data.content || data.text || '', url: data.url || url };
    } catch (error) { clearTimeout(timeoutId); throw error; }
  }

  getUsageStats() { return { totalBrowserCredits: this.totalBrowserCredits, totalProxyCredits: this.totalProxyCredits }; }
  calculateCost() { return { total: this.totalBrowserCredits * 0.001 + this.totalProxyCredits * 0.0005 }; }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function logProgress(supabase: SupabaseClient, jobId: string, options: { level?: string; icon?: string; message: string }) {
  try { await supabase.from('agent_progress_logs').insert({ job_id: jobId, log_level: options.level || 'info', icon: options.icon || '💡', message: options.message, metadata: {} }); } catch { /* ignore */ }
}

function detectCMS(content: string): string | null {
  const c = content.toLowerCase();
  if (c.includes('wp-content') || c.includes('wordpress')) return 'WordPress';
  if (c.includes('shopify')) return 'Shopify';
  if (c.includes('squarespace')) return 'Squarespace';
  if (c.includes('wix.com')) return 'Wix';
  if (c.includes('webflow')) return 'Webflow';
  if (c.includes('drupal')) return 'Drupal';
  if (c.includes('hubspot')) return 'HubSpot';
  return null;
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

    const { leadId } = await req.json();
    if (!leadId) throw new Error('Missing leadId');

    const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).eq('user_id', user.id).single();
    if (!lead) throw new Error('Lead not found');
    if (!lead.website) throw new Error('Lead has no website');

    const rtrvrApiKey = Deno.env.get('RTRVR_API_KEY');
    if (!rtrvrApiKey) throw new Error('RTRVR_API_KEY not configured');

    const rtrvr = new RtrvrClient(rtrvrApiKey);

    jobId = crypto.randomUUID();
    await supabase.from('research_jobs').insert({ id: jobId, user_id: user.id, lead_id: leadId, campaign_id: lead.campaign_id, job_type: 'website_health', status: 'running', progress_percentage: 0, config: { website: lead.website } });

    await logProgress(supabase, jobId, { level: 'info', icon: '🏥', message: `Analyzing: ${lead.website}` });

    const { content } = await rtrvr.scrape(lead.website, { onlyTextContent: false, timeout: 45000 });
    const c = content.toLowerCase();

    await supabase.from('research_jobs').update({ progress_percentage: 50 }).eq('id', jobId);
    await logProgress(supabase, jobId, { level: 'loading', icon: '📊', message: 'Calculating scores...' });

    const hasSsl = lead.website.startsWith('https://');
    const hasMetaTitle = c.includes('<title') || c.includes('meta title');
    const hasMetaDescription = c.includes('meta name="description"');
    const hasH1 = c.includes('<h1') || c.includes('heading level 1');
    const hasContactForm = c.includes('form') && c.includes('submit');
    const hasLiveChat = c.includes('chat') && (c.includes('intercom') || c.includes('drift') || c.includes('zendesk') || c.includes('live'));
    const detectedCms = detectCMS(content);

    let copyrightYear: number | null = null;
    const yearMatch = content.match(/\u00a9\s*(\d{4})|copyright\s*(\d{4})/i);
    if (yearMatch) copyrightYear = parseInt(yearMatch[1] || yearMatch[2], 10);

    let seoScore = 0;
    if (hasSsl) seoScore += 15;
    if (hasMetaTitle) seoScore += 25;
    if (hasMetaDescription) seoScore += 25;
    if (hasH1) seoScore += 20;
    seoScore += 15;

    const securityScore = hasSsl ? 85 : 30;
    const performanceScore = content.length > 500000 ? 50 : content.length > 200000 ? 65 : 80;
    const mobileScore = 70;

    const currentYear = new Date().getFullYear();
    let designAge = 50;
    if (copyrightYear) {
      const age = currentYear - copyrightYear;
      if (age <= 1) designAge = 90;
      else if (age <= 2) designAge = 75;
      else if (age <= 3) designAge = 55;
      else designAge = 35;
    }

    const overallScore = Math.round(seoScore * 0.3 + securityScore * 0.2 + performanceScore * 0.2 + mobileScore * 0.15 + designAge * 0.15);

    const criticalIssues: string[] = [];
    const improvements: string[] = [];
    const services: string[] = [];

    if (!hasSsl) { criticalIssues.push('No SSL certificate'); services.push('SSL Installation'); }
    if (!hasMetaTitle) { criticalIssues.push('Missing page title'); services.push('SEO Optimization'); }
    if (!hasMetaDescription) { improvements.push('Add meta description'); services.push('SEO Copywriting'); }
    if (copyrightYear && currentYear - copyrightYear > 2) { improvements.push(`Outdated copyright (${copyrightYear})`); services.push('Website Redesign'); }
    if (!hasContactForm) { improvements.push('No contact form'); services.push('Lead Capture Setup'); }
    if (!hasLiveChat) { improvements.push('No live chat'); services.push('Chat Integration'); }
    if (content.length > 500000) { improvements.push('Large page size'); services.push('Performance Optimization'); }

    let conversionPotential: 'low' | 'medium' | 'high' | 'very_high' = 'medium';
    if (overallScore < 40) conversionPotential = 'very_high';
    else if (overallScore < 60) conversionPotential = 'high';
    else if (overallScore >= 80) conversionPotential = 'low';

    await logProgress(supabase, jobId, { level: 'loading', icon: '💾', message: 'Saving health data...' });

    const healthRecord = {
      lead_id: leadId,
      user_id: user.id,
      overall_score: overallScore,
      seo_score: seoScore,
      mobile_score: mobileScore,
      security_score: securityScore,
      performance_score: performanceScore,
      has_meta_title: hasMetaTitle,
      has_meta_description: hasMetaDescription,
      has_h1_tag: hasH1,
      has_ssl: hasSsl,
      copyright_year: copyrightYear,
      detected_cms: detectedCms,
      has_contact_form: hasContactForm,
      has_live_chat: hasLiveChat,
      critical_issues: criticalIssues,
      improvement_opportunities: improvements,
      conversion_potential: conversionPotential,
      recommended_services: [...new Set(services)],
      last_checked_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase.from('website_health_scores').select('id').eq('lead_id', leadId).maybeSingle();
    if (existing) await supabase.from('website_health_scores').update(healthRecord).eq('id', existing.id);
    else await supabase.from('website_health_scores').insert(healthRecord);

    await supabase.from('leads').update({ website_health_checked: true }).eq('id', leadId);

    const usage = rtrvr.getUsageStats();
    const cost = rtrvr.calculateCost();

    await supabase.from('research_jobs').update({ status: 'completed', progress_percentage: 100, result_data: { overallScore, criticalIssues: criticalIssues.length, improvements: improvements.length, conversionPotential }, rtrvr_credits_used: usage.totalBrowserCredits + usage.totalProxyCredits, total_cost_usd: cost.total, completed_at: new Date().toISOString() }).eq('id', jobId);

    await logProgress(supabase, jobId, { level: 'success', icon: '✅', message: `Score: ${overallScore}/100 | ${criticalIssues.length} critical | ${conversionPotential} potential` });

    return new Response(JSON.stringify({ success: true, jobId, health: healthRecord, cost: cost.total, durationMs: Date.now() - startTime }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    if (jobId && supabase!) {
      await supabase.from('research_jobs').update({ status: 'failed', result_data: { error: error instanceof Error ? error.message : 'Unknown' } }).eq('id', jobId);
      await logProgress(supabase!, jobId, { level: 'error', icon: '❌', message: `Failed: ${error instanceof Error ? error.message : 'Unknown'}` });
    }
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown', jobId }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});