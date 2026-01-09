const RTRVR_BASE_URL = 'https://api.rtrvr.ai';

export interface RtrvrScrapeOptions {
  onlyTextContent?: boolean;
  waitForSelector?: string;
  timeout?: number;
  proxyMode?: 'default' | 'none';
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

export interface RtrvrUsageStats {
  totalScrapes: number;
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

  resetUsageStats(): void {
    this.usageStats = {
      totalScrapes: 0,
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
