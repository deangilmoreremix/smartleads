import type { RunConfig } from './runConfig';
import { getDefaultRunConfig } from './runConfig';

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<RunConfig>;
}

export const PRESETS: Preset[] = [
  {
    id: 'high-reply-lead-gen',
    name: 'High-Reply Lead Gen (Notiq Mode)',
    description: 'Quality leads with personal emails, reviews for context, and contact discovery',
    icon: 'Target',
    config: {
      search: {
        searchTerms: [''],
        categories: [],
        excludeKeywords: [],
        language: null,
        sortMode: 'highestRating',
        maxPlaces: 100
      },
      extraction: {
        detailPack: 'standard',
        includeCoordinates: true,
        includeOpeningHours: true,
        includePriceBracket: false,
        includeMenuUrl: false,
        includeReservationLinks: false,
        includeOrderLinks: false,
        includeAmenities: false,
        includePopularTimes: false,
        includeQandA: false,
        includeOwnerUpdates: false,
        includePeopleAlsoSearch: false,
        includeClosedStatus: true
      },
      reviews: {
        includeReviews: 10,
        reviewStrategy: 'recentHelpfulMix',
        includeOwnerResponses: true,
        includeReviewImages: false,
        includeReviewDetailedRatings: false,
        includeReviewTags: true,
        includeReviewerDetails: false
      },
      images: {
        includeImages: 'off',
        maxImagesPerPlace: 0
      },
      contacts: {
        discoverContactsFromWebsite: true,
        scanPages: ['contact', 'about', 'team', 'leadership'],
        extractCompanyEmails: true,
        extractPhonesFromWebsite: true,
        extractSocialProfiles: true,
        socialsEnabled: {
          facebook: true,
          instagram: true,
          youtube: false,
          tiktok: false,
          twitter: true,
          linkedin: true,
          pinterest: false
        },
        emailStrictness: 'personalOnly',
        genericEmailBlocklist: ['info@', 'contact@', 'hello@', 'support@', 'sales@', 'admin@', 'noreply@', 'no-reply@']
      },
      enrichment: {
        enableDecisionMakerEnrichment: false,
        enrichmentTargets: ['Owner', 'Founder', 'Manager'],
        enrichmentFields: {
          fullName: true,
          jobTitle: true,
          linkedin: true,
          workEmail: true,
          mobile: false,
          companySize: false
        },
        enrichmentStrictness: 'confidentOnly'
      },
      qualityFilters: {
        minRating: 3.5,
        minReviews: 5,
        mustHaveWebsite: true,
        mustHavePhone: false,
        excludeTemporarilyClosed: true,
        excludePermanentlyClosed: true,
        excludeChains: false
      },
      output: {
        exportFormat: 'json',
        exportView: 'leads',
        fieldPicker: null,
        dedupeStrategy: 'domain'
      },
      automation: {
        runMode: 'manual',
        schedule: { type: 'none', timezone: 'UTC' },
        webhooks: [],
        maxConcurrency: 5,
        delayRangeMs: { min: 1500, max: 3500 },
        retries: 2,
        timeoutMs: 120000,
        logsLevel: 'basic',
        saveScreenshots: false,
        changeDetection: { enabled: false, alerts: [] }
      }
    }
  },
  {
    id: 'max-coverage',
    name: 'Max Coverage (Thousands of Places)',
    description: 'High volume scraping with minimal details for maximum coverage',
    icon: 'Globe',
    config: {
      search: {
        searchTerms: [''],
        categories: [],
        excludeKeywords: [],
        language: null,
        sortMode: 'googleDefault',
        maxPlaces: 5000
      },
      geo: {
        geoMode: 'city',
        city: null,
        lat: null,
        lng: null,
        radiusKm: null,
        geojson: null,
        mapsUrl: null,
        placeUrls: null,
        placeIds: null,
        locations: null,
        gridDensity: 'high'
      },
      extraction: {
        detailPack: 'simple',
        includeCoordinates: true,
        includeOpeningHours: false,
        includePriceBracket: false,
        includeMenuUrl: false,
        includeReservationLinks: false,
        includeOrderLinks: false,
        includeAmenities: false,
        includePopularTimes: false,
        includeQandA: false,
        includeOwnerUpdates: false,
        includePeopleAlsoSearch: false,
        includeClosedStatus: true
      },
      reviews: {
        includeReviews: 0,
        reviewStrategy: 'recent',
        includeOwnerResponses: false,
        includeReviewImages: false,
        includeReviewDetailedRatings: false,
        includeReviewTags: false,
        includeReviewerDetails: false
      },
      images: {
        includeImages: 'off',
        maxImagesPerPlace: 0
      },
      contacts: {
        discoverContactsFromWebsite: false,
        scanPages: [],
        extractCompanyEmails: false,
        extractPhonesFromWebsite: false,
        extractSocialProfiles: false,
        socialsEnabled: {
          facebook: false,
          instagram: false,
          youtube: false,
          tiktok: false,
          twitter: false,
          linkedin: false,
          pinterest: false
        },
        emailStrictness: 'allEmails',
        genericEmailBlocklist: []
      },
      enrichment: {
        enableDecisionMakerEnrichment: false,
        enrichmentTargets: [],
        enrichmentFields: {
          fullName: false,
          jobTitle: false,
          linkedin: false,
          workEmail: false,
          mobile: false,
          companySize: false
        },
        enrichmentStrictness: 'confidentOnly'
      },
      qualityFilters: {
        minRating: null,
        minReviews: null,
        mustHaveWebsite: false,
        mustHavePhone: false,
        excludeTemporarilyClosed: false,
        excludePermanentlyClosed: true,
        excludeChains: false
      },
      output: {
        exportFormat: 'json',
        exportView: 'places',
        fieldPicker: null,
        dedupeStrategy: 'placeId'
      },
      automation: {
        runMode: 'manual',
        schedule: { type: 'none', timezone: 'UTC' },
        webhooks: [],
        maxConcurrency: 10,
        delayRangeMs: { min: 800, max: 2000 },
        retries: 3,
        timeoutMs: 300000,
        logsLevel: 'basic',
        saveScreenshots: false,
        changeDetection: { enabled: false, alerts: [] }
      }
    }
  },
  {
    id: 'competitor-intelligence',
    name: 'Competitor Intelligence',
    description: 'Deep review analytics, popular times, and change detection for competitor monitoring',
    icon: 'Eye',
    config: {
      search: {
        searchTerms: [''],
        categories: [],
        excludeKeywords: [],
        language: null,
        sortMode: 'mostReviewsThenHighestRating',
        maxPlaces: 50
      },
      extraction: {
        detailPack: 'deep',
        includeCoordinates: true,
        includeOpeningHours: true,
        includePriceBracket: true,
        includeMenuUrl: true,
        includeReservationLinks: true,
        includeOrderLinks: true,
        includeAmenities: true,
        includePopularTimes: true,
        includeQandA: true,
        includeOwnerUpdates: true,
        includePeopleAlsoSearch: true,
        includeClosedStatus: true
      },
      reviews: {
        includeReviews: 200,
        reviewStrategy: 'balanced',
        includeOwnerResponses: true,
        includeReviewImages: true,
        includeReviewDetailedRatings: true,
        includeReviewTags: true,
        includeReviewerDetails: false
      },
      images: {
        includeImages: 'fullMetadata',
        maxImagesPerPlace: 20
      },
      contacts: {
        discoverContactsFromWebsite: true,
        scanPages: ['contact', 'about', 'team', 'leadership', 'pricing'],
        extractCompanyEmails: true,
        extractPhonesFromWebsite: true,
        extractSocialProfiles: true,
        socialsEnabled: {
          facebook: true,
          instagram: true,
          youtube: true,
          tiktok: true,
          twitter: true,
          linkedin: true,
          pinterest: false
        },
        emailStrictness: 'allEmails',
        genericEmailBlocklist: []
      },
      enrichment: {
        enableDecisionMakerEnrichment: false,
        enrichmentTargets: ['Owner', 'Founder', 'CEO', 'Manager'],
        enrichmentFields: {
          fullName: true,
          jobTitle: true,
          linkedin: true,
          workEmail: true,
          mobile: false,
          companySize: true
        },
        enrichmentStrictness: 'bestGuess'
      },
      qualityFilters: {
        minRating: null,
        minReviews: 10,
        mustHaveWebsite: false,
        mustHavePhone: false,
        excludeTemporarilyClosed: false,
        excludePermanentlyClosed: false,
        excludeChains: false
      },
      output: {
        exportFormat: 'json',
        exportView: 'competitor',
        fieldPicker: null,
        dedupeStrategy: 'placeId'
      },
      automation: {
        runMode: 'manual',
        schedule: { type: 'none', timezone: 'UTC' },
        webhooks: [],
        maxConcurrency: 3,
        delayRangeMs: { min: 2000, max: 4000 },
        retries: 2,
        timeoutMs: 180000,
        logsLevel: 'verbose',
        saveScreenshots: false,
        changeDetection: {
          enabled: true,
          alerts: ['ratingChanged', 'reviewCountChanged', 'newOneStarReview', 'hoursChanged', 'closedStatusChanged']
        }
      }
    }
  },
  {
    id: 'market-gap-finder',
    name: 'Market Gap Finder',
    description: 'Analyze amenities, pricing, and Q&A to identify market opportunities',
    icon: 'TrendingUp',
    config: {
      search: {
        searchTerms: [''],
        categories: [],
        excludeKeywords: [],
        language: null,
        sortMode: 'googleDefault',
        maxPlaces: 200
      },
      extraction: {
        detailPack: 'deep',
        includeCoordinates: true,
        includeOpeningHours: true,
        includePriceBracket: true,
        includeMenuUrl: true,
        includeReservationLinks: true,
        includeOrderLinks: true,
        includeAmenities: true,
        includePopularTimes: true,
        includeQandA: true,
        includeOwnerUpdates: false,
        includePeopleAlsoSearch: true,
        includeClosedStatus: true
      },
      reviews: {
        includeReviews: 50,
        reviewStrategy: 'balanced',
        includeOwnerResponses: true,
        includeReviewImages: false,
        includeReviewDetailedRatings: true,
        includeReviewTags: true,
        includeReviewerDetails: false
      },
      images: {
        includeImages: 'urlsOnly',
        maxImagesPerPlace: 5
      },
      contacts: {
        discoverContactsFromWebsite: false,
        scanPages: [],
        extractCompanyEmails: false,
        extractPhonesFromWebsite: false,
        extractSocialProfiles: false,
        socialsEnabled: {
          facebook: false,
          instagram: false,
          youtube: false,
          tiktok: false,
          twitter: false,
          linkedin: false,
          pinterest: false
        },
        emailStrictness: 'allEmails',
        genericEmailBlocklist: []
      },
      enrichment: {
        enableDecisionMakerEnrichment: false,
        enrichmentTargets: [],
        enrichmentFields: {
          fullName: false,
          jobTitle: false,
          linkedin: false,
          workEmail: false,
          mobile: false,
          companySize: false
        },
        enrichmentStrictness: 'confidentOnly'
      },
      qualityFilters: {
        minRating: null,
        minReviews: null,
        mustHaveWebsite: false,
        mustHavePhone: false,
        excludeTemporarilyClosed: false,
        excludePermanentlyClosed: true,
        excludeChains: false
      },
      output: {
        exportFormat: 'json',
        exportView: 'marketAnalysis',
        fieldPicker: null,
        dedupeStrategy: 'placeId'
      },
      automation: {
        runMode: 'manual',
        schedule: { type: 'none', timezone: 'UTC' },
        webhooks: [],
        maxConcurrency: 5,
        delayRangeMs: { min: 1500, max: 3000 },
        retries: 2,
        timeoutMs: 180000,
        logsLevel: 'basic',
        saveScreenshots: false,
        changeDetection: { enabled: false, alerts: [] }
      }
    }
  },
  {
    id: 'partnership-finder',
    name: 'Partnership Finder',
    description: 'Find high-quality partners with full social profiles, images, and deep business details',
    icon: 'Handshake',
    config: {
      search: {
        searchTerms: [''],
        categories: [],
        excludeKeywords: [],
        language: null,
        sortMode: 'highestRating',
        maxPlaces: 100
      },
      extraction: {
        detailPack: 'deep',
        includeCoordinates: true,
        includeOpeningHours: true,
        includePriceBracket: true,
        includeMenuUrl: true,
        includeReservationLinks: true,
        includeOrderLinks: true,
        includeAmenities: true,
        includePopularTimes: true,
        includeQandA: false,
        includeOwnerUpdates: true,
        includePeopleAlsoSearch: true,
        includeClosedStatus: true
      },
      reviews: {
        includeReviews: 100,
        reviewStrategy: 'helpful',
        includeOwnerResponses: true,
        includeReviewImages: true,
        includeReviewDetailedRatings: true,
        includeReviewTags: true,
        includeReviewerDetails: false
      },
      images: {
        includeImages: 'fullMetadata',
        maxImagesPerPlace: 30
      },
      contacts: {
        discoverContactsFromWebsite: true,
        scanPages: ['contact', 'about', 'team', 'leadership', 'partners', 'partnerships'],
        extractCompanyEmails: true,
        extractPhonesFromWebsite: true,
        extractSocialProfiles: true,
        socialsEnabled: {
          facebook: true,
          instagram: true,
          youtube: true,
          tiktok: true,
          twitter: true,
          linkedin: true,
          pinterest: true
        },
        emailStrictness: 'personalPlusNamedRole',
        genericEmailBlocklist: ['info@', 'contact@', 'hello@', 'support@', 'sales@', 'admin@', 'noreply@', 'no-reply@']
      },
      enrichment: {
        enableDecisionMakerEnrichment: false,
        enrichmentTargets: ['Owner', 'Founder', 'CEO', 'Partner', 'Director'],
        enrichmentFields: {
          fullName: true,
          jobTitle: true,
          linkedin: true,
          workEmail: true,
          mobile: false,
          companySize: true
        },
        enrichmentStrictness: 'confidentOnly'
      },
      qualityFilters: {
        minRating: 4.0,
        minReviews: 50,
        mustHaveWebsite: true,
        mustHavePhone: false,
        excludeTemporarilyClosed: true,
        excludePermanentlyClosed: true,
        excludeChains: true
      },
      output: {
        exportFormat: 'json',
        exportView: 'partnershipShortlist',
        fieldPicker: null,
        dedupeStrategy: 'domain'
      },
      automation: {
        runMode: 'manual',
        schedule: { type: 'none', timezone: 'UTC' },
        webhooks: [],
        maxConcurrency: 3,
        delayRangeMs: { min: 2000, max: 4000 },
        retries: 2,
        timeoutMs: 180000,
        logsLevel: 'basic',
        saveScreenshots: false,
        changeDetection: { enabled: false, alerts: [] }
      }
    }
  }
];

export function getPresetById(presetId: string): Preset | undefined {
  return PRESETS.find(p => p.id === presetId);
}

export function applyPreset(presetId: string, currentConfig?: Partial<RunConfig>): RunConfig {
  const preset = getPresetById(presetId);
  const base = getDefaultRunConfig();

  if (!preset) {
    return { ...base, ...currentConfig } as RunConfig;
  }

  return deepMerge(base, preset.config, currentConfig || {}) as RunConfig;
}

function deepMerge<T extends Record<string, unknown>>(...objects: Partial<T>[]): T {
  const result: Record<string, unknown> = {};

  for (const obj of objects) {
    if (!obj) continue;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];

        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          result[key] = deepMerge(
            (result[key] as Record<string, unknown>) || {},
            val as Record<string, unknown>
          );
        } else if (val !== undefined) {
          result[key] = val;
        }
      }
    }
  }

  return result as T;
}
