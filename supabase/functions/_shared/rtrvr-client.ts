const RTRVR_BASE_URL = 'https://api.rtrvr.ai';

export interface RtrvrScrapeOptions {
  onlyTextContent?: boolean;
  waitForSelector?: string;
  timeout?: number;
  proxyMode?: 'default' | 'none';
}

export interface RtrvrAgentOptions {
  timeout?: number;
  maxSteps?: number;
  proxyMode?: 'default' | 'none';
  returnScreenshots?: boolean;
}

export interface RtrvrScrapeResult {
  content: string;
  accessibilityTree?: Record<string, unknown>;
  url: string;
  usage: {
    browserCredits: number;
    proxyCredits: number;
  };
  trajectoryId: string;
}

export interface RtrvrAgentStep {
  action: string;
  url: string;
  content?: string;
  screenshot?: string;
  timestamp: string;
}

export interface RtrvrAgentResult {
  success: boolean;
  finalUrl: string;
  steps: RtrvrAgentStep[];
  extractedData: Record<string, unknown>;
  content: string;
  usage: {
    browserCredits: number;
    proxyCredits: number;
    totalSteps: number;
  };
  trajectoryId: string;
}

export interface RtrvrUsageStats {
  totalScrapes: number;
  totalAgentTasks: number;
  totalBrowserCredits: number;
  totalProxyCredits: number;
  trajectoryIds: string[];
}

export class RtrvrClient {
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
      url,
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

      const result: RtrvrScrapeResult = {
        content: data.content || data.text || '',
        accessibilityTree: data.accessibilityTree || data.tree,
        url: data.url || url,
        usage: {
          browserCredits: data.usage?.browserCredits || 0,
          proxyCredits: data.usage?.proxyCredits || 0,
        },
        trajectoryId: data.trajectoryId || crypto.randomUUID(),
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

  async agent(task: string, startUrl: string, options: RtrvrAgentOptions = {}): Promise<RtrvrAgentResult> {
    const {
      timeout = 120000,
      maxSteps = 10,
      proxyMode = 'default',
      returnScreenshots = false,
    } = options;

    const requestBody: Record<string, unknown> = {
      task,
      url: startUrl,
      maxSteps,
      proxyMode,
      returnScreenshots,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${RTRVR_BASE_URL}/agent`, {
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
          throw new Error('RATE_LIMIT: rtrvr.ai agent rate limit exceeded');
        }
        if (response.status === 401) {
          throw new Error('AUTH_ERROR: Invalid rtrvr.ai API key');
        }
        throw new Error(`AGENT_ERROR: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      const result: RtrvrAgentResult = {
        success: data.success ?? true,
        finalUrl: data.finalUrl || data.url || startUrl,
        steps: (data.steps || []).map((step: Record<string, unknown>) => ({
          action: step.action || 'unknown',
          url: step.url || '',
          content: step.content,
          screenshot: step.screenshot,
          timestamp: step.timestamp || new Date().toISOString(),
        })),
        extractedData: data.extractedData || data.data || {},
        content: data.content || data.text || '',
        usage: {
          browserCredits: data.usage?.browserCredits || 0,
          proxyCredits: data.usage?.proxyCredits || 0,
          totalSteps: data.steps?.length || 0,
        },
        trajectoryId: data.trajectoryId || crypto.randomUUID(),
      };

      this.usageStats.totalAgentTasks++;
      this.usageStats.totalBrowserCredits += result.usage.browserCredits;
      this.usageStats.totalProxyCredits += result.usage.proxyCredits;
      this.usageStats.trajectoryIds.push(result.trajectoryId);

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`TIMEOUT: Agent task timed out after ${timeout}ms`);
        }
        throw error;
      }
      throw new Error(`UNKNOWN_ERROR: ${String(error)}`);
    }
  }

  async researchWebsite(website: string, depth: 'basic' | 'standard' | 'deep' = 'standard'): Promise<{
    homepage: RtrvrScrapeResult;
    additionalPages: Map<string, RtrvrScrapeResult | Error>;
    agentResearch?: RtrvrAgentResult;
  }> {
    const homepage = await this.scrape(website, { onlyTextContent: false, timeout: 45000 });

    const additionalPages = new Map<string, RtrvrScrapeResult | Error>();

    const pagesToScrape: string[] = [];
    const baseUrl = new URL(website).origin;

    if (depth === 'standard' || depth === 'deep') {
      pagesToScrape.push(
        `${baseUrl}/about`,
        `${baseUrl}/about-us`,
        `${baseUrl}/services`,
        `${baseUrl}/contact`,
      );
    }

    if (depth === 'deep') {
      pagesToScrape.push(
        `${baseUrl}/team`,
        `${baseUrl}/our-team`,
        `${baseUrl}/pricing`,
        `${baseUrl}/blog`,
        `${baseUrl}/case-studies`,
        `${baseUrl}/testimonials`,
      );
    }

    if (pagesToScrape.length > 0) {
      const results = await this.scrapeBatch(pagesToScrape, { onlyTextContent: true, timeout: 30000 }, 3);
      results.forEach((value, key) => additionalPages.set(key, value));
    }

    let agentResearch: RtrvrAgentResult | undefined;
    if (depth === 'deep') {
      try {
        agentResearch = await this.agent(
          `Navigate through the website and find: 1) Team/leadership page with names and roles, 2) Services or products offered with descriptions, 3) Contact information including emails, 4) Any recent news or blog posts, 5) Company information like founding year and size. Extract all this data in a structured format.`,
          website,
          { maxSteps: 8, timeout: 90000 }
        );
      } catch (error) {
        console.error('Agent research failed:', error);
      }
    }

    return { homepage, additionalPages, agentResearch };
  }

  async findIntentSignals(companyName: string, website?: string): Promise<RtrvrAgentResult> {
    const searchQuery = encodeURIComponent(`"${companyName}" hiring OR funding OR expansion OR acquisition`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbs=qdr:m`;

    return this.agent(
      `Search for recent news about "${companyName}". Look for: 1) Job postings or hiring announcements, 2) Funding news, 3) Expansion or growth announcements, 4) Leadership changes, 5) Product launches. Extract the title, source, date, and summary for each finding.`,
      searchUrl,
      { maxSteps: 6, timeout: 60000 }
    );
  }

  async analyzeWebsiteHealth(url: string): Promise<{
    scrapeResult: RtrvrScrapeResult;
    healthData: {
      hasSsl: boolean;
      hasMetaTitle: boolean;
      hasMetaDescription: boolean;
      hasH1: boolean;
      copyrightYear: number | null;
      hasSitemap: boolean;
      hasRobotsTxt: boolean;
      detectedCms: string | null;
      hasContactForm: boolean;
      hasLiveChat: boolean;
      socialLinks: string[];
      estimatedPageSize: number;
    };
  }> {
    const scrapeResult = await this.scrape(url, { onlyTextContent: false, timeout: 45000 });
    const content = scrapeResult.content.toLowerCase();

    const hasSsl = url.startsWith('https://');
    const hasMetaTitle = content.includes('<title') || content.includes('meta title');
    const hasMetaDescription = content.includes('meta name="description"') || content.includes('meta description');
    const hasH1 = content.includes('<h1') || content.includes('heading level 1');

    let copyrightYear: number | null = null;
    const yearMatch = content.match(/©\s*(\d{4})|copyright\s*(\d{4})/i);
    if (yearMatch) {
      copyrightYear = parseInt(yearMatch[1] || yearMatch[2], 10);
    }

    const detectedCms = detectCMS(content);
    const hasContactForm = content.includes('contact form') || content.includes('form') && content.includes('submit');
    const hasLiveChat = content.includes('chat') && (content.includes('live') || content.includes('support') || content.includes('intercom') || content.includes('drift') || content.includes('zendesk'));

    const socialLinks: string[] = [];
    if (content.includes('facebook.com')) socialLinks.push('facebook');
    if (content.includes('twitter.com') || content.includes('x.com')) socialLinks.push('twitter');
    if (content.includes('linkedin.com')) socialLinks.push('linkedin');
    if (content.includes('instagram.com')) socialLinks.push('instagram');
    if (content.includes('youtube.com')) socialLinks.push('youtube');

    return {
      scrapeResult,
      healthData: {
        hasSsl,
        hasMetaTitle,
        hasMetaDescription,
        hasH1,
        copyrightYear,
        hasSitemap: false,
        hasRobotsTxt: false,
        detectedCms,
        hasContactForm,
        hasLiveChat,
        socialLinks,
        estimatedPageSize: content.length,
      },
    };
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

  async scrapeYelp(businessType: string, location: string, maxResults: number = 20): Promise<RtrvrAgentResult> {
    const query = encodeURIComponent(businessType);
    const loc = encodeURIComponent(location);
    const yelpUrl = `https://www.yelp.com/search?find_desc=${query}&find_loc=${loc}`;

    return this.agent(
      `Search Yelp for "${businessType}" in "${location}". Extract up to ${maxResults} businesses with: business name, address, phone, website, rating, review count, and categories. Navigate through pages if needed to get more results.`,
      yelpUrl,
      { maxSteps: 8, timeout: 90000 }
    );
  }

  async scrapeLinkedInCompany(companyUrl: string): Promise<RtrvrAgentResult> {
    return this.agent(
      `Extract company information including: company name, description, industry, company size, headquarters location, founded year, specialties, and key employees if visible. Also look for recent posts or updates.`,
      companyUrl,
      { maxSteps: 5, timeout: 60000 }
    );
  }

  async findDecisionMakers(companyName: string, website?: string): Promise<RtrvrAgentResult> {
    const searchQuery = encodeURIComponent(`"${companyName}" site:linkedin.com/in CEO OR founder OR owner OR director`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

    return this.agent(
      `Find decision makers at "${companyName}". Look for executives, founders, owners, or directors. Extract their names, titles, and LinkedIn profile URLs if available.`,
      searchUrl,
      { maxSteps: 6, timeout: 60000 }
    );
  }

  async monitorReviews(googleMapsUrl: string): Promise<RtrvrAgentResult> {
    return this.agent(
      `Navigate to the reviews section and extract the 10 most recent reviews including: reviewer name, rating, date, review text, and whether the business responded. Also note the overall rating and total review count.`,
      googleMapsUrl,
      { maxSteps: 5, timeout: 60000 }
    );
  }

  getUsageStats(): RtrvrUsageStats {
    return { ...this.usageStats };
  }

  resetUsageStats(): void {
    this.usageStats = {
      totalScrapes: 0,
      totalAgentTasks: 0,
      totalBrowserCredits: 0,
      totalProxyCredits: 0,
      trajectoryIds: [],
    };
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

function detectCMS(content: string): string | null {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('wp-content') || lowerContent.includes('wordpress')) return 'WordPress';
  if (lowerContent.includes('shopify')) return 'Shopify';
  if (lowerContent.includes('squarespace')) return 'Squarespace';
  if (lowerContent.includes('wix.com')) return 'Wix';
  if (lowerContent.includes('webflow')) return 'Webflow';
  if (lowerContent.includes('drupal')) return 'Drupal';
  if (lowerContent.includes('joomla')) return 'Joomla';
  if (lowerContent.includes('ghost')) return 'Ghost';
  if (lowerContent.includes('hubspot')) return 'HubSpot';
  if (lowerContent.includes('weebly')) return 'Weebly';

  return null;
}
