import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import OpenAI from 'npm:openai@4';

const RTRVR_BASE_URL = 'https://api.rtrvr.ai';
const MODEL = 'gpt-4o';

interface RtrvrScrapeOptions {
  onlyTextContent?: boolean;
  waitForSelector?: string;
  timeout?: number;
  proxyMode?: 'default' | 'none';
}

interface RtrvrScrapeResult {
  content: string;
  accessibilityTree?: Record<string, unknown>;
  url: string;
  usage: {
    browserCredits: number;
    proxyCredits: number;
  };
  trajectoryId: string;
}

interface RtrvrUsageStats {
  totalScrapes: number;
  totalAgentTasks: number;
  totalBrowserCredits: number;
  totalProxyCredits: number;
  trajectoryIds: string[];
}

class RtrvrClient {
  private apiKey: string;
  private usageStats: RtrvrUsageStats;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.usageStats = {
      totalScrapes: 0,
      totalAgentTasks: 0,
      totalBrowserCredits: 0,
      totalProxyCredits: 0,
      trajectoryIds: [],
    };
  }

  async scrape(url: string, options: RtrvrScrapeOptions = {}): Promise<RtrvrScrapeResult> {
    const {
      onlyTextContent = false,
      waitForSelector,
      timeout = 30000,
      proxyMode = 'default',
    } = options;

    const requestBody: Record<string, unknown> = {
      urls: [url],
      onlyTextContent,
      proxyMode,
    };

    if (waitForSelector) {
      requestBody.waitForSelector = waitForSelector;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${RTRVR_BASE_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          throw new Error('RATE_LIMIT: rtrvr.ai rate limit exceeded');
        }
        if (response.status === 401) {
          throw new Error('AUTH_ERROR: Invalid rtrvr.ai API key');
        }
        throw new Error(`SCRAPE_ERROR: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const pageData = Array.isArray(data.results) ? data.results[0] : data;

      const result: RtrvrScrapeResult = {
        content: pageData?.content || pageData?.text || data.content || data.text || '',
        accessibilityTree: pageData?.accessibilityTree || pageData?.tree || data.accessibilityTree || data.tree,
        url: pageData?.url || data.url || url,
        usage: {
          browserCredits: data.usage?.browserCredits || pageData?.usage?.browserCredits || 0,
          proxyCredits: data.usage?.proxyCredits || pageData?.usage?.proxyCredits || 0,
        },
        trajectoryId: data.trajectoryId || pageData?.trajectoryId || crypto.randomUUID(),
      };

      this.usageStats.totalScrapes++;
      this.usageStats.totalBrowserCredits += result.usage.browserCredits;
      this.usageStats.totalProxyCredits += result.usage.proxyCredits;
      this.usageStats.trajectoryIds.push(result.trajectoryId);

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`TIMEOUT: Request to ${url} timed out after ${timeout}ms`);
        }
        throw error;
      }
      throw new Error(`UNKNOWN_ERROR: ${String(error)}`);
    }
  }

  async scrapeBatch(
    urls: string[],
    options: RtrvrScrapeOptions = {},
    concurrency: number = 5
  ): Promise<Map<string, RtrvrScrapeResult | Error>> {
    const results = new Map<string, RtrvrScrapeResult | Error>();

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map(async (url) => {
        try {
          const result = await this.scrape(url, options);
          return { url, result };
        } catch (error) {
          return { url, error: error instanceof Error ? error : new Error(String(error)) };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const { url, result, error } of batchResults) {
        if (error) {
          results.set(url, error as Error);
        } else if (result) {
          results.set(url, result);
        }
      }
    }

    return results;
  }

  getUsageStats(): RtrvrUsageStats {
    return { ...this.usageStats };
  }

  calculateCost(usage?: RtrvrUsageStats): { browserCost: number; proxyCost: number; total: number } {
    const stats = usage || this.usageStats;
    const browserCostPerCredit = 0.001;
    const proxyCostPerCredit = 0.0005;

    const browserCost = stats.totalBrowserCredits * browserCostPerCredit;
    const proxyCost = stats.totalProxyCredits * proxyCostPerCredit;

    return {
      browserCost,
      proxyCost,
      total: browserCost + proxyCost,
    };
  }
}

interface BusinessListing {
  business_name: string;
  google_maps_url: string;
  category?: string;
  rating?: number;
  review_count?: number;
  address_preview?: string;
}

interface BusinessDetails {
  phone?: string;
  website?: string;
  full_address?: string;
  coordinates?: { lat: number; lng: number };
  hours?: Array<{ day: string; open: string; close: string }>;
  amenities?: string[];
  price_level?: string;
  reviews_preview?: Array<{ author: string; rating: number; text: string }>;
}

interface ContactInfo {
  emails: string[];
  phones: string[];
  social_profiles: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  business_description?: string;
  services?: string[];
  team_members?: Array<{ name: string; role: string; email?: string }>;
}

interface ExtractionUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

class GPT5Extractor {
  private client: OpenAI;
  private totalUsage: ExtractionUsage;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }

  async extractBusinessListings(
    pageContent: string,
    accessibilityTree?: Record<string, unknown>
  ): Promise<{ listings: BusinessListing[]; usage: ExtractionUsage }> {
    const contentToAnalyze = accessibilityTree
      ? `Page Content:\n${pageContent}\n\nAccessibility Tree:\n${JSON.stringify(accessibilityTree, null, 2)}`
      : pageContent;

    const response = await this.client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a data extraction specialist. Extract business listings from Google Maps search results.
Return a JSON object with a "listings" array of businesses found on the page. Each business should have:
- business_name (required): The name of the business
- google_maps_url (required): The Google Maps URL for this business
- category: The business type/category
- rating: Numeric rating (1-5)
- review_count: Number of reviews
- address_preview: Short address snippet

Only extract real businesses visible in the content. Do not hallucinate or make up data.
Respond ONLY with valid JSON.`
        },
        {
          role: 'user',
          content: contentToAnalyze.slice(0, 50000)
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const usage = this.trackUsage(response);

    try {
      const parsed = JSON.parse(response.choices[0]?.message?.content || '{"listings":[]}');
      return { listings: parsed.listings || [], usage };
    } catch {
      return { listings: [], usage };
    }
  }

  async extractBusinessDetails(
    pageContent: string,
    businessName: string,
    accessibilityTree?: Record<string, unknown>
  ): Promise<{ details: BusinessDetails; usage: ExtractionUsage }> {
    const contentToAnalyze = accessibilityTree
      ? `Business: ${businessName}\n\nPage Content:\n${pageContent}\n\nAccessibility Tree:\n${JSON.stringify(accessibilityTree, null, 2)}`
      : `Business: ${businessName}\n\nPage Content:\n${pageContent}`;

    const response = await this.client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a data extraction specialist. Extract detailed business information from a Google Maps business page.
Focus on extracting:
- phone: Business phone number (normalize to standard format)
- website: Official website URL
- full_address: Complete street address
- coordinates: Latitude and longitude if available
- hours: Business hours by day
- amenities: Features/services offered
- price_level: Price range indicator
- reviews_preview: Top 3 most helpful reviews

Only extract information actually present in the content. Do not hallucinate.
Respond ONLY with valid JSON.`
        },
        {
          role: 'user',
          content: contentToAnalyze.slice(0, 50000)
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const usage = this.trackUsage(response);

    try {
      const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
      return { details: parsed, usage };
    } catch {
      return { details: {}, usage };
    }
  }

  async extractContactInfo(
    websiteContent: string,
    businessContext: { name: string; address?: string; category?: string }
  ): Promise<{ contacts: ContactInfo; usage: ExtractionUsage }> {
    const response = await this.client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a contact information extraction specialist. Extract contact details from a business website.
Business context: ${businessContext.name}${businessContext.category ? ` (${businessContext.category})` : ''}${businessContext.address ? ` at ${businessContext.address}` : ''}

Extract:
- emails: Business email addresses (prioritize contact@ or info@ over personal emails, validate format)
- phones: Phone numbers found (normalize format)
- social_profiles: Social media URLs (facebook, instagram, linkedin, twitter, tiktok, youtube)
- business_description: 2-3 sentence summary of what the business does
- services: List of services/products offered
- team_members: Key team members with roles and emails if available

Only extract real information. Validate email formats. Skip newsletter signup forms.
Respond ONLY with valid JSON.`
        },
        {
          role: 'user',
          content: websiteContent.slice(0, 40000)
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const usage = this.trackUsage(response);

    try {
      const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
      return {
        contacts: {
          emails: parsed.emails || [],
          phones: parsed.phones || [],
          social_profiles: parsed.social_profiles || {},
          business_description: parsed.business_description,
          services: parsed.services || [],
          team_members: parsed.team_members || []
        },
        usage
      };
    } catch {
      return {
        contacts: { emails: [], phones: [], social_profiles: {} },
        usage
      };
    }
  }

  private trackUsage(response: { usage?: { prompt_tokens?: number; completion_tokens?: number } | null }): ExtractionUsage {
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    this.totalUsage.inputTokens += inputTokens;
    this.totalUsage.outputTokens += outputTokens;
    this.totalUsage.totalTokens += inputTokens + outputTokens;

    return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens };
  }

  getTotalUsage(): ExtractionUsage {
    return { ...this.totalUsage };
  }

  calculateCost(): number {
    const inputCostPer1k = 0.0025;
    const outputCostPer1k = 0.01;

    return (
      (this.totalUsage.inputTokens / 1000) * inputCostPer1k +
      (this.totalUsage.outputTokens / 1000) * outputCostPer1k
    );
  }
}

interface RtrvrSettings {
  maxCrawledPlacesPerSearch?: number;
  language?: string;
  searchMatching?: 'all' | 'only_includes' | 'only_exact';
  placeMinimumStars?: string;
  website?: 'allPlaces' | 'withWebsite' | 'withoutWebsite';
  skipClosedPlaces?: boolean;
  scrapePlaceDetailPage?: boolean;
  scrapeContacts?: boolean;
  scrapeSocialMediaProfiles?: {
    facebooks?: boolean;
    instagrams?: boolean;
    youtubes?: boolean;
    tiktoks?: boolean;
    twitters?: boolean;
  };
  maximumLeadsEnrichmentRecords?: number;
  maxReviews?: number;
  reviewsSort?: string;
  maxImages?: number;
  maxQuestions?: number;
  countryCode?: string;
  state?: string;
  county?: string;
  postalCode?: string;
}

interface ScrapeRequest {
  campaignId: string;
  niche: string;
  location: string;
  rtrvrSettings?: Partial<RtrvrSettings>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const defaultSettings: RtrvrSettings = {
  maxCrawledPlacesPerSearch: 50,
  language: 'en',
  searchMatching: 'all',
  placeMinimumStars: '',
  website: 'allPlaces',
  skipClosedPlaces: false,
  scrapePlaceDetailPage: false,
  scrapeContacts: false,
  scrapeSocialMediaProfiles: {
    facebooks: false,
    instagrams: false,
    youtubes: false,
    tiktoks: false,
    twitters: false,
  },
  maximumLeadsEnrichmentRecords: 0,
  maxReviews: 0,
  reviewsSort: 'newest',
  maxImages: 0,
  maxQuestions: 0,
};

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

function buildGoogleMapsSearchUrl(niche: string, location: string): string {
  const query = encodeURIComponent(`${niche} in ${location}`);
  return `https://www.google.com/maps/search/${query}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();
  let supabase: SupabaseClient;
  let jobId: string | undefined;
  let userId: string | undefined;

  try {
    supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const body = await req.json();
    const { campaignId, niche, location, rtrvrSettings: customSettings, userId: requestUserId }: ScrapeRequest & { userId?: string } = body;

    if (token === serviceRoleKey && requestUserId) {
      userId = requestUserId;
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        throw new Error('Unauthorized');
      }
      userId = user.id;
    }

    if (!campaignId || !niche || !location) {
      throw new Error('Missing required fields: campaignId, niche, location');
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found or access denied');
    }

    const settings: RtrvrSettings = {
      ...defaultSettings,
      ...(campaign.rtrvr_settings || {}),
      ...customSettings,
    };

    const rtrvrApiKey = Deno.env.get('RTRVR_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!rtrvrApiKey) {
      throw new Error('RTRVR_API_KEY not configured');
    }
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured for AI extraction');
    }

    const rtrvr = new RtrvrClient(rtrvrApiKey);
    const extractor = new GPT5Extractor(openaiApiKey);

    jobId = crypto.randomUUID();
    await supabase.from('agent_jobs').insert({
      id: jobId,
      campaign_id: campaignId,
      user_id: userId,
      job_type: 'lead_scraping',
      status: 'initializing',
      progress_percentage: 0,
      total_steps: 6,
      completed_steps: 0,
      result_data: {
        campaign_name: campaign.name,
        niche,
        location,
        provider: 'rtrvr',
      },
    });

    await logProgress(supabase, jobId, {
      level: 'info',
      icon: '🚀',
      message: 'Initializing rtrvr.ai scraping agent with GPT-4o extraction',
    });

    await supabase
      .from('campaigns')
      .update({ scraping_status: 'in_progress' })
      .eq('id', campaignId);

    await supabase.from('agent_jobs').update({
      status: 'running',
      progress_percentage: 10,
      completed_steps: 1,
    }).eq('id', jobId);

    await logProgress(supabase, jobId, {
      level: 'loading',
      icon: '🗺️',
      message: `Scraping Google Maps for "${niche}" in "${location}"`,
    });

    const searchUrl = buildGoogleMapsSearchUrl(niche, location);
    const searchResult = await rtrvr.scrape(searchUrl, {
      onlyTextContent: false,
      timeout: 60000,
    });

    await supabase.from('agent_jobs').update({
      progress_percentage: 25,
      completed_steps: 2,
    }).eq('id', jobId);

    await logProgress(supabase, jobId, {
      level: 'success',
      icon: '📄',
      message: 'Retrieved Google Maps search results',
      metadata: { pageLength: searchResult.content.length },
    });

    await logProgress(supabase, jobId, {
      level: 'loading',
      icon: '🤖',
      message: 'GPT-4o analyzing search results to extract business listings...',
    });

    const { listings } = await extractor.extractBusinessListings(
      searchResult.content,
      searchResult.accessibilityTree
    );

    const businessListings = listings.slice(0, settings.maxCrawledPlacesPerSearch || 50);

    await logProgress(supabase, jobId, {
      level: 'success',
      icon: '📊',
      message: `Extracted ${businessListings.length} businesses using GPT-4o`,
    });

    await supabase.from('agent_jobs').update({
      progress_percentage: 40,
      completed_steps: 3,
    }).eq('id', jobId);

    const leads: Array<{
      listing: BusinessListing;
      details?: BusinessDetails;
      contacts?: ContactInfo;
    }> = [];

    if (settings.scrapePlaceDetailPage && businessListings.length > 0) {
      await logProgress(supabase, jobId, {
        level: 'loading',
        icon: '🔍',
        message: `Scraping detailed pages for ${businessListings.length} businesses...`,
      });

      const batchSize = 5;
      let processedCount = 0;

      for (let i = 0; i < businessListings.length; i += batchSize) {
        const batch = businessListings.slice(i, i + batchSize);
        const urls = batch.map(b => b.google_maps_url).filter(Boolean);

        if (urls.length === 0) continue;

        const detailResults = await rtrvr.scrapeBatch(urls, {
          onlyTextContent: false,
          timeout: 45000,
        });

        for (const listing of batch) {
          const leadData: typeof leads[number] = { listing };

          const detailResult = detailResults.get(listing.google_maps_url);
          if (detailResult && !(detailResult instanceof Error)) {
            const { details } = await extractor.extractBusinessDetails(
              detailResult.content,
              listing.business_name,
              detailResult.accessibilityTree
            );
            leadData.details = details;
          }

          leads.push(leadData);
          processedCount++;
        }

        const detailProgress = 40 + Math.round((processedCount / businessListings.length) * 25);
        await supabase.from('agent_jobs').update({
          progress_percentage: detailProgress,
        }).eq('id', jobId);
      }

      await logProgress(supabase, jobId, {
        level: 'success',
        icon: '✅',
        message: `Extracted details for ${processedCount} businesses`,
      });
    } else {
      for (const listing of businessListings) {
        leads.push({ listing });
      }
    }

    await supabase.from('agent_jobs').update({
      progress_percentage: 65,
      completed_steps: 4,
    }).eq('id', jobId);

    if (settings.scrapeContacts && extractor) {
      await logProgress(supabase, jobId, {
        level: 'loading',
        icon: '🌐',
        message: 'Enriching leads with website contact information...',
      });

      let enrichedCount = 0;

      for (const lead of leads) {
        const website = lead.details?.website || lead.listing.google_maps_url;
        if (!website || website.includes('google.com/maps')) continue;

        try {
          const websiteResult = await rtrvr.scrape(website, {
            onlyTextContent: true,
            timeout: 30000,
          });

          const { contacts } = await extractor.extractContactInfo(websiteResult.content, {
            name: lead.listing.business_name,
            address: lead.details?.full_address || lead.listing.address_preview,
            category: lead.listing.category,
          });

          lead.contacts = contacts;
          enrichedCount++;

          if (enrichedCount % 5 === 0) {
            const enrichProgress = 65 + Math.round((enrichedCount / leads.length) * 20);
            await supabase.from('agent_jobs').update({
              progress_percentage: enrichProgress,
            }).eq('id', jobId);
          }
        } catch (error) {
          console.error(`Failed to enrich ${lead.listing.business_name}:`, error);
        }
      }

      await logProgress(supabase, jobId, {
        level: 'success',
        icon: '📧',
        message: `Enriched ${enrichedCount} leads with contact info`,
      });
    }

    await supabase.from('agent_jobs').update({
      progress_percentage: 85,
      completed_steps: 5,
    }).eq('id', jobId);

    await logProgress(supabase, jobId, {
      level: 'loading',
      icon: '💾',
      message: 'Saving leads to database...',
    });

    const leadsToInsert = leads.map(lead => {
      const primaryEmail = determineBestEmail(lead);
      const emailType = primaryEmail.includes('@') && !primaryEmail.includes('info@') && !primaryEmail.includes('contact@')
        ? 'personal'
        : primaryEmail.includes('@') ? 'generic' : 'unknown';

      return {
        campaign_id: campaignId,
        user_id: userId,
        business_name: lead.listing.business_name,
        email: primaryEmail || `contact@${generateDomainFromName(lead.listing.business_name)}`,
        phone: lead.details?.phone || null,
        address: lead.details?.full_address || lead.listing.address_preview || null,
        website: lead.details?.website || null,
        rating: lead.listing.rating || null,
        review_count: lead.listing.review_count || 0,
        email_type: emailType,
        google_maps_url: lead.listing.google_maps_url,
        status: 'new',
        extraction_source: 'rtrvr',
        extraction_confidence: 0.95,
        scraped_data: {
          category: lead.listing.category,
          hours: lead.details?.hours,
          amenities: lead.details?.amenities,
          price_level: lead.details?.price_level,
          reviews_preview: lead.details?.reviews_preview,
          description: lead.contacts?.business_description,
          services: lead.contacts?.services,
        },
        social_profiles: lead.contacts?.social_profiles || {},
        opening_hours: lead.details?.hours || [],
      };
    });

    const { data: insertedLeads, error: insertError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select('id');

    if (insertError) {
      throw new Error(`Failed to insert leads: ${insertError.message}`);
    }

    const shouldExtractContacts = (settings.maximumLeadsEnrichmentRecords || 0) > 0;
    if (shouldExtractContacts && leads.some(l => l.contacts?.team_members?.length)) {
      const contactsToInsert = leads.flatMap((lead, idx) => {
        const leadId = insertedLeads?.[idx]?.id;
        if (!leadId || !lead.contacts?.team_members) return [];

        return lead.contacts.team_members.map(member => ({
          lead_id: leadId,
          user_id: userId,
          campaign_id: campaignId,
          full_name: member.name,
          job_title: member.role,
          email: member.email || null,
        }));
      });

      if (contactsToInsert.length > 0) {
        await supabase.from('lead_contacts').insert(contactsToInsert);
      }
    }

    const socialProfiles = settings.scrapeSocialMediaProfiles || {};
    const shouldExtractSocial = socialProfiles.facebooks || socialProfiles.instagrams || socialProfiles.youtubes || socialProfiles.tiktoks || socialProfiles.twitters;
    if (shouldExtractSocial && leads.some(l => l.contacts?.social_profiles)) {
      const socialsToInsert = leads.flatMap((lead, idx) => {
        const leadId = insertedLeads?.[idx]?.id;
        if (!leadId || !lead.contacts?.social_profiles) return [];

        const profiles = lead.contacts.social_profiles;
        const entries: Array<{ lead_id: string; user_id: string; platform: string; profile_url: string }> = [];

        for (const [platform, url] of Object.entries(profiles)) {
          if (url && typeof url === 'string') {
            entries.push({
              lead_id: leadId,
              user_id: userId,
              platform,
              profile_url: url,
            });
          }
        }

        return entries;
      });

      if (socialsToInsert.length > 0) {
        await supabase.from('lead_social_profiles').insert(socialsToInsert);
      }
    }

    const rtrvrUsage = rtrvr.getUsageStats();
    const rtrvrCost = rtrvr.calculateCost();
    const openaiUsage = extractor.getTotalUsage();
    const openaiCost = extractor.calculateCost();

    await supabase.from('rtrvr_usage_logs').insert({
      user_id: userId,
      campaign_id: campaignId,
      agent_job_id: jobId,
      trajectory_id: rtrvrUsage.trajectoryIds[0] || null,
      scrape_count: rtrvrUsage.totalScrapes,
      total_pages_scraped: rtrvrUsage.totalScrapes,
      browser_credits_used: rtrvrUsage.totalBrowserCredits,
      proxy_credits_used: rtrvrUsage.totalProxyCredits,
      rtrvr_cost_usd: rtrvrCost.total,
      openai_input_tokens: openaiUsage.inputTokens,
      openai_output_tokens: openaiUsage.outputTokens,
      openai_cost_usd: openaiCost,
      total_cost_usd: rtrvrCost.total + openaiCost,
      request_duration_ms: Date.now() - startTime,
      scrape_type: 'google_maps',
      metadata: {
        niche,
        location,
        settings,
        leadsFound: leadsToInsert.length,
      },
    });

    await supabase
      .from('campaigns')
      .update({
        scraping_status: 'completed',
        total_leads: (campaign.total_leads || 0) + leadsToInsert.length,
      })
      .eq('id', campaignId);

    await supabase.from('agent_jobs').update({
      status: 'completed',
      progress_percentage: 100,
      completed_steps: 6,
      result_data: {
        campaign_name: campaign.name,
        niche,
        location,
        provider: 'rtrvr',
        leadsFound: leadsToInsert.length,
        enrichedCount: leads.filter(l => l.contacts).length,
        rtrvrCreditsUsed: rtrvrUsage.totalBrowserCredits + rtrvrUsage.totalProxyCredits,
        openaiTokensUsed: openaiUsage.totalTokens,
        totalCostUsd: rtrvrCost.total + openaiCost,
        durationMs: Date.now() - startTime,
      },
    }).eq('id', jobId);

    await logProgress(supabase, jobId, {
      level: 'success',
      icon: '🎉',
      message: `Successfully scraped ${leadsToInsert.length} leads! Cost: $${(rtrvrCost.total + openaiCost).toFixed(4)}`,
      metadata: {
        leadsFound: leadsToInsert.length,
        enrichedCount: leads.filter(l => l.contacts).length,
        totalCost: rtrvrCost.total + openaiCost,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        leadsFound: leadsToInsert.length,
        enrichedCount: leads.filter(l => l.contacts).length,
        usage: {
          rtrvr: rtrvrUsage,
          openai: openaiUsage,
        },
        costs: {
          rtrvr: rtrvrCost.total,
          openai: openaiCost,
          total: rtrvrCost.total + openaiCost,
        },
        durationMs: Date.now() - startTime,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Scrape error:', error);

    if (jobId && supabase!) {
      await supabase.from('agent_jobs').update({
        status: 'failed',
        result_data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }).eq('id', jobId);

      await logProgress(supabase!, jobId, {
        level: 'error',
        icon: '❌',
        message: `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        jobId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function determineBestEmail(lead: { listing: BusinessListing; details?: BusinessDetails; contacts?: ContactInfo }): string {
  if (lead.contacts?.emails && lead.contacts.emails.length > 0) {
    const emails = lead.contacts.emails;
    const businessEmail = emails.find(e =>
      e.includes('info@') || e.includes('contact@') || e.includes('hello@')
    );
    if (businessEmail) return businessEmail;

    const nonGeneric = emails.find(e =>
      !e.includes('noreply') && !e.includes('newsletter') && !e.includes('unsubscribe')
    );
    if (nonGeneric) return nonGeneric;

    return emails[0];
  }

  if (lead.contacts?.team_members) {
    const memberWithEmail = lead.contacts.team_members.find(m => m.email);
    if (memberWithEmail?.email) return memberWithEmail.email;
  }

  return '';
}

function generateDomainFromName(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 20) + '.com';
}