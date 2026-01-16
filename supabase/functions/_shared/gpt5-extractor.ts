import OpenAI from 'npm:openai@4';

const MODEL = 'gpt-5.2';

export interface BusinessListing {
  business_name: string;
  google_maps_url: string;
  category?: string;
  rating?: number;
  review_count?: number;
  address_preview?: string;
}

export interface BusinessDetails {
  phone?: string;
  website?: string;
  full_address?: string;
  coordinates?: { lat: number; lng: number };
  hours?: Array<{ day: string; open: string; close: string }>;
  amenities?: string[];
  price_level?: string;
  reviews_preview?: Array<{ author: string; rating: number; text: string }>;
}

export interface ContactInfo {
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

export interface ExtractionUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export class GPT5Extractor {
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

    const systemPrompt = `You are a data extraction specialist. Extract business listings from Google Maps search results.
Return a JSON object with a "listings" array of businesses found on the page. Each business should have:
- business_name (required): The name of the business
- google_maps_url (required): The Google Maps URL for this business
- category: The business type/category
- rating: Numeric rating (1-5)
- review_count: Number of reviews
- address_preview: Short address snippet

Only extract real businesses visible in the content. Do not hallucinate or make up data.
Respond ONLY with valid JSON.`;

    const response = await this.client.responses.create({
      model: MODEL,
      instructions: systemPrompt,
      input: contentToAnalyze.slice(0, 50000),
      reasoning: { effort: 'none' },
      text: { format: { type: 'json_object' } },
    });

    const usage = this.trackResponsesUsage(response);
    const outputText = response.output?.[0]?.content?.[0]?.text || '{"listings":[]}';

    try {
      const parsed = JSON.parse(outputText);
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

    const systemPrompt = `You are a data extraction specialist. Extract detailed business information from a Google Maps business page.
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
Respond ONLY with valid JSON.`;

    const response = await this.client.responses.create({
      model: MODEL,
      instructions: systemPrompt,
      input: contentToAnalyze.slice(0, 50000),
      reasoning: { effort: 'none' },
      text: { format: { type: 'json_object' } },
    });

    const usage = this.trackResponsesUsage(response);
    const outputText = response.output?.[0]?.content?.[0]?.text || '{}';

    try {
      const parsed = JSON.parse(outputText);
      return { details: parsed, usage };
    } catch {
      return { details: {}, usage };
    }
  }

  async extractContactInfo(
    websiteContent: string,
    businessContext: { name: string; address?: string; category?: string }
  ): Promise<{ contacts: ContactInfo; usage: ExtractionUsage }> {
    const systemPrompt = `You are a contact information extraction specialist. Extract contact details from a business website.
Business context: ${businessContext.name}${businessContext.category ? ` (${businessContext.category})` : ''}${businessContext.address ? ` at ${businessContext.address}` : ''}

Extract:
- emails: Business email addresses (prioritize contact@ or info@ over personal emails, validate format)
- phones: Phone numbers found (normalize format)
- social_profiles: Social media URLs (facebook, instagram, linkedin, twitter, tiktok, youtube)
- business_description: 2-3 sentence summary of what the business does
- services: List of services/products offered
- team_members: Key team members with roles and emails if available

Only extract real information. Validate email formats. Skip newsletter signup forms.
Respond ONLY with valid JSON.`;

    const response = await this.client.responses.create({
      model: MODEL,
      instructions: systemPrompt,
      input: websiteContent.slice(0, 40000),
      reasoning: { effort: 'none' },
      text: { format: { type: 'json_object' } },
    });

    const usage = this.trackResponsesUsage(response);
    const outputText = response.output?.[0]?.content?.[0]?.text || '{}';

    try {
      const parsed = JSON.parse(outputText);
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

  private trackResponsesUsage(response: { usage?: { input_tokens?: number; output_tokens?: number } | null }): ExtractionUsage {
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;

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

  resetUsage(): void {
    this.totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
}
