import type { RunConfig, ValidationWarning } from './runConfig';
import { enforceCompliance, stableStringify, sha256 } from './runUtils';

export interface RtrvrRunPayload {
  prompt: string;
  schema: Record<string, unknown>;
  safeConfig: RunConfig;
  warnings: ValidationWarning[];
  configHash: string;
}

export interface PlaceSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required: string[];
}

export interface ReviewSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required: string[];
}

export interface ContactSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required: string[];
}

export interface OutputSchema {
  type: 'object';
  properties: {
    places: { type: 'array'; items: PlaceSchema };
    reviews?: { type: 'array'; items: ReviewSchema };
    contacts?: { type: 'array'; items: ContactSchema };
    diagnostics: {
      type: 'object';
      properties: Record<string, unknown>;
    };
  };
  required: string[];
}

function buildGeoInstructions(config: RunConfig): string {
  const { geo } = config;
  const lines: string[] = [];

  switch (geo.geoMode) {
    case 'city':
      if (geo.city) {
        lines.push(`Search in city: "${geo.city}"`);
      }
      if (geo.locations?.length) {
        const cities = geo.locations.filter(l => l.city).map(l => l.city);
        if (cities.length) {
          lines.push(`Also search in cities: ${cities.join(', ')}`);
        }
      }
      break;

    case 'latlng_radius':
      if (geo.lat !== null && geo.lng !== null && geo.radiusKm !== null) {
        lines.push(`Search within ${geo.radiusKm}km radius of coordinates (${geo.lat}, ${geo.lng})`);
      }
      if (geo.locations?.length) {
        geo.locations.forEach(loc => {
          if (loc.lat !== undefined && loc.lng !== undefined && loc.radiusKm !== undefined) {
            lines.push(`Also search: ${loc.radiusKm}km radius of (${loc.lat}, ${loc.lng})`);
          }
        });
      }
      break;

    case 'polygon':
    case 'multipolygon':
      lines.push(`Search within the provided GeoJSON ${geo.geoMode} boundary`);
      lines.push(`GeoJSON: ${JSON.stringify(geo.geojson)}`);
      break;

    case 'mapsUrl':
      if (geo.mapsUrl) {
        lines.push(`Extract places from Google Maps URL: ${geo.mapsUrl}`);
      }
      if (geo.locations?.length) {
        geo.locations.filter(l => l.mapsUrl).forEach(loc => {
          lines.push(`Also extract from: ${loc.mapsUrl}`);
        });
      }
      break;

    case 'placeUrls':
      if (geo.placeUrls?.length) {
        lines.push(`Extract details for these specific place URLs:`);
        geo.placeUrls.forEach(url => lines.push(`  - ${url}`));
      }
      break;

    case 'placeIds':
      if (geo.placeIds?.length) {
        lines.push(`Extract details for these Google Place IDs:`);
        geo.placeIds.forEach(id => lines.push(`  - ${id}`));
      }
      break;
  }

  if (geo.gridDensity !== 'med') {
    lines.push(`Grid density for area coverage: ${geo.gridDensity}`);
  }

  return lines.join('\n');
}

function buildSearchInstructions(config: RunConfig): string {
  const { search } = config;
  const lines: string[] = [];

  lines.push(`Search queries: ${search.searchTerms.map(t => `"${t}"`).join(', ')}`);

  if (search.categories.length) {
    lines.push(`Filter to categories: ${search.categories.join(', ')}`);
  }

  if (search.excludeKeywords.length) {
    lines.push(`Exclude results containing: ${search.excludeKeywords.join(', ')}`);
  }

  if (search.language) {
    lines.push(`Prefer results in language: ${search.language}`);
  }

  lines.push(`Sort results by: ${search.sortMode}`);
  lines.push(`Maximum places to return: ${search.maxPlaces}`);

  return lines.join('\n');
}

function buildExtractionInstructions(config: RunConfig): string {
  const { extraction } = config;
  const lines: string[] = [];

  lines.push(`Extraction detail level: ${extraction.detailPack}`);

  const fields: string[] = ['name', 'category', 'placeId', 'address', 'website', 'phone', 'rating', 'reviewsCount'];

  if (extraction.includeCoordinates) fields.push('coordinates (lat/lng)', 'plusCode');
  if (extraction.includeOpeningHours) fields.push('opening hours');
  if (extraction.includePriceBracket) fields.push('price bracket');
  if (extraction.includeMenuUrl) fields.push('menu URL');
  if (extraction.includeReservationLinks) fields.push('reservation links');
  if (extraction.includeOrderLinks) fields.push('order links');
  if (extraction.includeAmenities) fields.push('amenities/additionalInfo');
  if (extraction.includePopularTimes) fields.push('popular times');
  if (extraction.includeQandA) fields.push('Q&A');
  if (extraction.includeOwnerUpdates) fields.push('owner updates');
  if (extraction.includePeopleAlsoSearch) fields.push('people also search');
  if (extraction.includeClosedStatus) fields.push('closed status (temporarily/permanently)');

  lines.push(`Extract these fields for each place: ${fields.join(', ')}`);

  return lines.join('\n');
}

function buildReviewInstructions(config: RunConfig): string {
  const { reviews } = config;

  if (reviews.includeReviews === 0) {
    return 'Do not extract reviews.';
  }

  const lines: string[] = [];

  lines.push(`Extract up to ${reviews.includeReviews} reviews per place`);
  lines.push(`Review selection strategy: ${reviews.reviewStrategy}`);

  const reviewFields: string[] = ['text', 'rating', 'date', 'reviewerName'];

  if (reviews.includeOwnerResponses) reviewFields.push('owner response');
  if (reviews.includeReviewImages) reviewFields.push('review images');
  if (reviews.includeReviewDetailedRatings) reviewFields.push('detailed ratings (service, food, atmosphere, etc.)');
  if (reviews.includeReviewTags) reviewFields.push('review tags/topics');
  if (reviews.includeReviewerDetails) reviewFields.push('reviewer profile details');

  lines.push(`For each review, extract: ${reviewFields.join(', ')}`);

  return lines.join('\n');
}

function buildImageInstructions(config: RunConfig): string {
  const { images } = config;

  if (images.includeImages === 'off') {
    return 'Do not extract images.';
  }

  const lines: string[] = [];

  if (images.includeImages === 'urlsOnly') {
    lines.push(`Extract image URLs only (up to ${images.maxImagesPerPlace} per place)`);
  } else {
    lines.push(`Extract full image metadata (up to ${images.maxImagesPerPlace} per place)`);
    lines.push('Include: URL, dimensions, upload date, contributor info if available');
  }

  return lines.join('\n');
}

function buildContactInstructions(config: RunConfig): string {
  const { contacts } = config;

  if (!contacts.discoverContactsFromWebsite) {
    return 'Do not scan websites for additional contact information.';
  }

  const lines: string[] = [];

  lines.push('CONTACT DISCOVERY ENABLED');
  lines.push(`Scan these website pages: ${contacts.scanPages.join(', ')}`);

  if (contacts.extractCompanyEmails) {
    lines.push('Extract all email addresses found');

    switch (contacts.emailStrictness) {
      case 'personalOnly':
        lines.push('PRIORITY: Only return personal emails (firstname@, firstname.lastname@, etc.)');
        lines.push('Exclude generic emails entirely');
        break;
      case 'personalPlusNamedRole':
        lines.push('PRIORITY: Prefer personal emails, also include named role emails (john.smith@, marketing@jane.com)');
        lines.push('Deprioritize but include generic role emails');
        break;
      case 'allEmails':
        lines.push('Return all emails found');
        break;
    }

    if (contacts.genericEmailBlocklist.length) {
      lines.push(`Block these email prefixes: ${contacts.genericEmailBlocklist.join(', ')}`);
    }
  }

  if (contacts.extractPhonesFromWebsite) {
    lines.push('Extract additional phone numbers from website');
  }

  if (contacts.extractSocialProfiles) {
    const enabledSocials = Object.entries(contacts.socialsEnabled)
      .filter(([, enabled]) => enabled)
      .map(([platform]) => platform);

    if (enabledSocials.length) {
      lines.push(`Extract social profiles for: ${enabledSocials.join(', ')}`);
    }
  }

  return lines.join('\n');
}

function buildEnrichmentInstructions(config: RunConfig): string {
  const { enrichment } = config;

  if (!enrichment.enableDecisionMakerEnrichment) {
    return 'Do not perform decision-maker enrichment.';
  }

  const lines: string[] = [];

  lines.push('DECISION-MAKER ENRICHMENT ENABLED');
  lines.push(`Target roles: ${enrichment.enrichmentTargets.join(', ')}`);

  const fields: string[] = [];
  if (enrichment.enrichmentFields.fullName) fields.push('full name');
  if (enrichment.enrichmentFields.jobTitle) fields.push('job title');
  if (enrichment.enrichmentFields.linkedin) fields.push('LinkedIn profile');
  if (enrichment.enrichmentFields.workEmail) fields.push('work email');
  if (enrichment.enrichmentFields.mobile) fields.push('mobile phone');
  if (enrichment.enrichmentFields.companySize) fields.push('company size');

  lines.push(`Enrich with: ${fields.join(', ')}`);
  lines.push(`Match confidence: ${enrichment.enrichmentStrictness}`);

  return lines.join('\n');
}

function buildQualityFilterInstructions(config: RunConfig): string {
  const { qualityFilters } = config;
  const filters: string[] = [];

  if (qualityFilters.minRating !== null) {
    filters.push(`minimum rating: ${qualityFilters.minRating}`);
  }
  if (qualityFilters.minReviews !== null) {
    filters.push(`minimum reviews: ${qualityFilters.minReviews}`);
  }
  if (qualityFilters.mustHaveWebsite) {
    filters.push('must have website');
  }
  if (qualityFilters.mustHavePhone) {
    filters.push('must have phone');
  }
  if (qualityFilters.excludeTemporarilyClosed) {
    filters.push('exclude temporarily closed');
  }
  if (qualityFilters.excludePermanentlyClosed) {
    filters.push('exclude permanently closed');
  }
  if (qualityFilters.excludeChains) {
    filters.push('exclude chain businesses');
  }

  if (filters.length === 0) {
    return 'No quality filters applied.';
  }

  return `Quality filters: ${filters.join(', ')}`;
}

function buildOutputInstructions(config: RunConfig): string {
  const { output } = config;
  const lines: string[] = [];

  lines.push(`Primary output view: ${output.exportView}`);
  lines.push(`Deduplicate results by: ${output.dedupeStrategy}`);

  if (output.fieldPicker?.length) {
    lines.push(`Only include these fields in output: ${output.fieldPicker.join(', ')}`);
  }

  return lines.join('\n');
}

export function buildRtrvrPrompt(config: RunConfig): string {
  const sections: string[] = [];

  sections.push(`=== RTRVR GOOGLE MAPS EXTRACTION TASK ===`);
  sections.push('');
  sections.push('CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no code fences.');
  sections.push('The output MUST conform exactly to the provided JSON schema.');
  sections.push('');

  sections.push('--- SEARCH PARAMETERS ---');
  sections.push(buildSearchInstructions(config));
  sections.push('');

  sections.push('--- LOCATION ---');
  sections.push(buildGeoInstructions(config));
  sections.push('');

  sections.push('--- EXTRACTION FIELDS ---');
  sections.push(buildExtractionInstructions(config));
  sections.push('');

  sections.push('--- REVIEWS ---');
  sections.push(buildReviewInstructions(config));
  sections.push('');

  sections.push('--- IMAGES ---');
  sections.push(buildImageInstructions(config));
  sections.push('');

  sections.push('--- CONTACT DISCOVERY ---');
  sections.push(buildContactInstructions(config));
  sections.push('');

  sections.push('--- ENRICHMENT ---');
  sections.push(buildEnrichmentInstructions(config));
  sections.push('');

  sections.push('--- QUALITY FILTERS ---');
  sections.push(buildQualityFilterInstructions(config));
  sections.push('');

  sections.push('--- OUTPUT ---');
  sections.push(buildOutputInstructions(config));
  sections.push('');

  sections.push('=== END TASK ===');

  return sections.join('\n');
}

function buildPlaceSchemaProperties(config: RunConfig): Record<string, unknown> {
  const props: Record<string, unknown> = {
    name: { type: 'string' },
    category: { type: 'string' },
    subCategory: { type: ['string', 'null'] },
    placeId: { type: 'string' },
    cid: { type: ['string', 'null'] },
    fid: { type: ['string', 'null'] },
    address: { type: 'string' },
    street: { type: ['string', 'null'] },
    city: { type: ['string', 'null'] },
    state: { type: ['string', 'null'] },
    postalCode: { type: ['string', 'null'] },
    country: { type: ['string', 'null'] },
    website: { type: ['string', 'null'] },
    phone: { type: ['string', 'null'] },
    rating: { type: ['number', 'null'] },
    reviewsCount: { type: ['integer', 'null'] }
  };

  const { extraction } = config;

  if (extraction.includeCoordinates) {
    props.latitude = { type: ['number', 'null'] };
    props.longitude = { type: ['number', 'null'] };
    props.plusCode = { type: ['string', 'null'] };
  }

  if (extraction.includeOpeningHours) {
    props.openingHours = {
      type: ['object', 'null'],
      properties: {
        monday: { type: ['string', 'null'] },
        tuesday: { type: ['string', 'null'] },
        wednesday: { type: ['string', 'null'] },
        thursday: { type: ['string', 'null'] },
        friday: { type: ['string', 'null'] },
        saturday: { type: ['string', 'null'] },
        sunday: { type: ['string', 'null'] }
      }
    };
  }

  if (extraction.includePriceBracket) {
    props.priceBracket = { type: ['string', 'null'], enum: ['$', '$$', '$$$', '$$$$', null] };
  }

  if (extraction.includeMenuUrl) {
    props.menuUrl = { type: ['string', 'null'] };
  }

  if (extraction.includeReservationLinks) {
    props.reservationLinks = { type: 'array', items: { type: 'string' } };
  }

  if (extraction.includeOrderLinks) {
    props.orderLinks = { type: 'array', items: { type: 'string' } };
  }

  if (extraction.includeAmenities) {
    props.amenities = { type: 'array', items: { type: 'string' } };
    props.additionalInfo = { type: ['object', 'null'] };
  }

  if (extraction.includePopularTimes) {
    props.popularTimes = {
      type: ['object', 'null'],
      additionalProperties: {
        type: 'array',
        items: { type: 'object', properties: { hour: { type: 'integer' }, busyness: { type: 'integer' } } }
      }
    };
  }

  if (extraction.includeQandA) {
    props.questionsAndAnswers = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: ['string', 'null'] },
          askedBy: { type: ['string', 'null'] },
          answeredBy: { type: ['string', 'null'] }
        }
      }
    };
  }

  if (extraction.includeOwnerUpdates) {
    props.ownerUpdates = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          content: { type: 'string' },
          type: { type: ['string', 'null'] }
        }
      }
    };
  }

  if (extraction.includePeopleAlsoSearch) {
    props.peopleAlsoSearch = { type: 'array', items: { type: 'string' } };
  }

  if (extraction.includeClosedStatus) {
    props.isTemporarilyClosed = { type: 'boolean' };
    props.isPermanentlyClosed = { type: 'boolean' };
  }

  if (config.images.includeImages !== 'off') {
    if (config.images.includeImages === 'urlsOnly') {
      props.images = { type: 'array', items: { type: 'string' } };
    } else {
      props.images = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            width: { type: ['integer', 'null'] },
            height: { type: ['integer', 'null'] },
            uploadDate: { type: ['string', 'null'] },
            contributor: { type: ['string', 'null'] }
          }
        }
      };
    }
  }

  return props;
}

function buildReviewSchemaProperties(config: RunConfig): Record<string, unknown> {
  const props: Record<string, unknown> = {
    placeId: { type: 'string' },
    text: { type: ['string', 'null'] },
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    date: { type: 'string' },
    reviewerName: { type: 'string' }
  };

  const { reviews } = config;

  if (reviews.includeOwnerResponses) {
    props.ownerResponse = {
      type: ['object', 'null'],
      properties: {
        text: { type: 'string' },
        date: { type: ['string', 'null'] }
      }
    };
  }

  if (reviews.includeReviewImages) {
    props.images = { type: 'array', items: { type: 'string' } };
  }

  if (reviews.includeReviewDetailedRatings) {
    props.detailedRatings = {
      type: ['object', 'null'],
      additionalProperties: { type: 'integer', minimum: 1, maximum: 5 }
    };
  }

  if (reviews.includeReviewTags) {
    props.tags = { type: 'array', items: { type: 'string' } };
  }

  if (reviews.includeReviewerDetails) {
    props.reviewerDetails = {
      type: ['object', 'null'],
      properties: {
        profileUrl: { type: ['string', 'null'] },
        totalReviews: { type: ['integer', 'null'] },
        level: { type: ['string', 'null'] }
      }
    };
  }

  return props;
}

function buildContactSchemaProperties(config: RunConfig): Record<string, unknown> {
  const props: Record<string, unknown> = {
    placeId: { type: 'string' },
    emails: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          type: { type: 'string', enum: ['personal', 'role', 'generic'] },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          source: { type: ['string', 'null'] }
        }
      }
    },
    phones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          number: { type: 'string' },
          type: { type: ['string', 'null'] },
          source: { type: ['string', 'null'] }
        }
      }
    }
  };

  if (config.contacts.extractSocialProfiles) {
    props.socialProfiles = {
      type: 'object',
      properties: {
        facebook: { type: ['string', 'null'] },
        instagram: { type: ['string', 'null'] },
        twitter: { type: ['string', 'null'] },
        linkedin: { type: ['string', 'null'] },
        youtube: { type: ['string', 'null'] },
        tiktok: { type: ['string', 'null'] },
        pinterest: { type: ['string', 'null'] }
      }
    };
  }

  if (config.enrichment.enableDecisionMakerEnrichment) {
    props.decisionMakers = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fullName: { type: ['string', 'null'] },
          jobTitle: { type: ['string', 'null'] },
          linkedinUrl: { type: ['string', 'null'] },
          workEmail: { type: ['string', 'null'] },
          mobile: { type: ['string', 'null'] },
          confidence: { type: 'number', minimum: 0, maximum: 1 }
        }
      }
    };
  }

  return props;
}

export function buildOutputSchema(config: RunConfig): OutputSchema {
  const placeProps = buildPlaceSchemaProperties(config);
  const placeRequired = ['name', 'placeId', 'address'];

  const schema: OutputSchema = {
    type: 'object',
    properties: {
      places: {
        type: 'array',
        items: {
          type: 'object',
          properties: placeProps,
          required: placeRequired
        }
      },
      diagnostics: {
        type: 'object',
        properties: {
          pagesVisited: { type: 'integer' },
          totalResultsFound: { type: 'integer' },
          totalPlacesReturned: { type: 'integer' },
          durationMs: { type: 'integer' },
          errors: { type: 'array', items: { type: 'string' } },
          warnings: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    required: ['places', 'diagnostics']
  };

  if (config.reviews.includeReviews > 0) {
    const reviewProps = buildReviewSchemaProperties(config);
    schema.properties.reviews = {
      type: 'array',
      items: {
        type: 'object',
        properties: reviewProps,
        required: ['placeId', 'rating', 'date', 'reviewerName']
      }
    };
    schema.required.push('reviews');
  }

  if (config.contacts.discoverContactsFromWebsite) {
    const contactProps = buildContactSchemaProperties(config);
    schema.properties.contacts = {
      type: 'array',
      items: {
        type: 'object',
        properties: contactProps,
        required: ['placeId']
      }
    };
    schema.required.push('contacts');
  }

  return schema;
}

export async function buildRtrvrRun(config: RunConfig): Promise<RtrvrRunPayload> {
  const { config: safeConfig, warnings } = enforceCompliance(config);
  const prompt = buildRtrvrPrompt(safeConfig);
  const schema = buildOutputSchema(safeConfig);
  const configHash = await sha256(stableStringify(safeConfig));

  return {
    prompt,
    schema,
    safeConfig,
    warnings,
    configHash
  };
}
