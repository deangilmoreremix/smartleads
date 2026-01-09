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

    const response = await this.client.responses.create({
      model: MODEL,
      input: [
        {
          role: 'system',
          content: `You are a data extraction specialist. Extract business listings from Google Maps search results.
Return a JSON array of businesses found on the page. Each business should have:
- business_name (required): The name of the business
- google_maps_url (required): The Google Maps URL for this business
- category: The business type/category
- rating: Numeric rating (1-5)
- review_count: Number of reviews
- address_preview: Short address snippet

Only extract real businesses visible in the content. Do not hallucinate or make up data.`
        },
        {
          role: 'user',
          content: contentToAnalyze.slice(0, 50000)
        }
      ],
      reasoning: { effort: 'medium' },
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'business_listings',
          schema: {
            type: 'object',
            properties: {
              listings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    business_name: { type: 'string' },
                    google_maps_url: { type: 'string' },
                    category: { type: 'string' },
                    rating: { type: 'number' },
                    review_count: { type: 'number' },
                    address_preview: { type: 'string' }
                  },
                  required: ['business_name', 'google_maps_url']
                }
              }
            },
            required: ['listings']
          }
        }
      }
    });

    const usage = this.trackUsage(response);

    try {
      const textContent = response.output?.find((o: { type: string }) => o.type === 'message')?.content?.[0];
      const parsed = JSON.parse(textContent?.text || '{"listings":[]}');
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

    const response = await this.client.responses.create({
      model: MODEL,
      input: [
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

Only extract information actually present in the content. Do not hallucinate.`
        },
        {
          role: 'user',
          content: contentToAnalyze.slice(0, 50000)
        }
      ],
      reasoning: { effort: 'low' },
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'business_details',
          schema: {
            type: 'object',
            properties: {
              phone: { type: 'string' },
              website: { type: 'string' },
              full_address: { type: 'string' },
              coordinates: {
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' }
                }
              },
              hours: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    day: { type: 'string' },
                    open: { type: 'string' },
                    close: { type: 'string' }
                  }
                }
              },
              amenities: { type: 'array', items: { type: 'string' } },
              price_level: { type: 'string' },
              reviews_preview: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    author: { type: 'string' },
                    rating: { type: 'number' },
                    text: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    });

    const usage = this.trackUsage(response);

    try {
      const textContent = response.output?.find((o: { type: string }) => o.type === 'message')?.content?.[0];
      const parsed = JSON.parse(textContent?.text || '{}');
      return { details: parsed, usage };
    } catch {
      return { details: {}, usage };
    }
  }

  async extractContactInfo(
    websiteContent: string,
    businessContext: { name: string; address?: string; category?: string }
  ): Promise<{ contacts: ContactInfo; usage: ExtractionUsage }> {
    const response = await this.client.responses.create({
      model: MODEL,
      input: [
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

Only extract real information. Validate email formats. Skip newsletter signup forms.`
        },
        {
          role: 'user',
          content: websiteContent.slice(0, 40000)
        }
      ],
      reasoning: { effort: 'medium' },
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'contact_info',
          schema: {
            type: 'object',
            properties: {
              emails: { type: 'array', items: { type: 'string' } },
              phones: { type: 'array', items: { type: 'string' } },
              social_profiles: {
                type: 'object',
                properties: {
                  facebook: { type: 'string' },
                  instagram: { type: 'string' },
                  linkedin: { type: 'string' },
                  twitter: { type: 'string' },
                  tiktok: { type: 'string' },
                  youtube: { type: 'string' }
                }
              },
              business_description: { type: 'string' },
              services: { type: 'array', items: { type: 'string' } },
              team_members: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    role: { type: 'string' },
                    email: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    });

    const usage = this.trackUsage(response);

    try {
      const textContent = response.output?.find((o: { type: string }) => o.type === 'message')?.content?.[0];
      const parsed = JSON.parse(textContent?.text || '{}');
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

  async classifyEmail(
    email: string,
    businessName: string,
    website?: string
  ): Promise<{ type: 'personal' | 'generic' | 'unknown'; confidence: number; usage: ExtractionUsage }> {
    const response = await this.client.responses.create({
      model: MODEL,
      input: [
        {
          role: 'system',
          content: 'Classify the email type and confidence. Return JSON with type (personal/generic/unknown) and confidence (0-1).'
        },
        {
          role: 'user',
          content: `Email: ${email}\nBusiness: ${businessName}${website ? `\nWebsite: ${website}` : ''}`
        }
      ],
      reasoning: { effort: 'none' },
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'email_classification',
          schema: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['personal', 'generic', 'unknown'] },
              confidence: { type: 'number' }
            },
            required: ['type', 'confidence']
          }
        }
      }
    });

    const usage = this.trackUsage(response);

    try {
      const textContent = response.output?.find((o: { type: string }) => o.type === 'message')?.content?.[0];
      const parsed = JSON.parse(textContent?.text || '{}');
      return {
        type: parsed.type || 'unknown',
        confidence: parsed.confidence || 0.5,
        usage
      };
    } catch {
      return { type: 'unknown', confidence: 0.5, usage };
    }
  }

  private trackUsage(response: { usage?: { input_tokens?: number; output_tokens?: number } }): ExtractionUsage {
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
