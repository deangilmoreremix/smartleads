import type { RunConfig, ValidationWarning } from './runConfig';

export function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, (_, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce((sorted: Record<string, unknown>, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {});
    }
    return value;
  });
}

export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis) {
    const crypto = globalThis.crypto as typeof import('crypto');
    if (crypto.createHash) {
      return crypto.createHash('sha256').update(message).digest('hex');
    }
  }

  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function normalizeStringArray(arr: string[] | null | undefined): string[] {
  if (!arr) return [];
  return [...new Set(
    arr
      .map(s => s.trim())
      .filter(s => s.length > 0)
  )];
}

export function enforceCompliance(config: RunConfig): { config: RunConfig; warnings: ValidationWarning[] } {
  const warnings: ValidationWarning[] = [];
  const safeConfig = structuredClone(config);

  if (safeConfig.reviews.includeReviewerDetails && !safeConfig.compliance.reviewerDetailsLegalBasisConfirmed) {
    safeConfig.reviews.includeReviewerDetails = false;
    warnings.push({
      field: 'reviews.includeReviewerDetails',
      message: 'Reviewer details disabled: legal basis not confirmed. Set compliance.reviewerDetailsLegalBasisConfirmed to true to enable.',
      autoFixed: true
    });
  }

  if (safeConfig.enrichment.enableDecisionMakerEnrichment && !safeConfig.compliance.decisionMakerEnrichmentLegalBasisConfirmed) {
    safeConfig.enrichment.enableDecisionMakerEnrichment = false;
    warnings.push({
      field: 'enrichment.enableDecisionMakerEnrichment',
      message: 'Decision-maker enrichment disabled: legal basis not confirmed. Set compliance.decisionMakerEnrichmentLegalBasisConfirmed to true to enable.',
      autoFixed: true
    });
  }

  if (safeConfig.output.exportView === 'reviews' && safeConfig.reviews.includeReviews === 0) {
    safeConfig.reviews.includeReviews = 10;
    warnings.push({
      field: 'reviews.includeReviews',
      message: 'Reviews export view selected but includeReviews was 0. Auto-set to 10.',
      autoFixed: true
    });
  }

  if (safeConfig.output.exportView === 'leads' && !safeConfig.contacts.discoverContactsFromWebsite) {
    safeConfig.contacts.discoverContactsFromWebsite = true;
    warnings.push({
      field: 'contacts.discoverContactsFromWebsite',
      message: 'Leads export view selected but contact discovery was disabled. Auto-enabled.',
      autoFixed: true
    });
  }

  safeConfig.search.searchTerms = normalizeStringArray(safeConfig.search.searchTerms);
  safeConfig.search.categories = normalizeStringArray(safeConfig.search.categories);
  safeConfig.search.excludeKeywords = normalizeStringArray(safeConfig.search.excludeKeywords);

  if (safeConfig.contacts.scanPages) {
    safeConfig.contacts.scanPages = normalizeStringArray(safeConfig.contacts.scanPages);
  }

  if (safeConfig.enrichment.enrichmentTargets) {
    safeConfig.enrichment.enrichmentTargets = normalizeStringArray(safeConfig.enrichment.enrichmentTargets);
  }

  return { config: safeConfig, warnings };
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

export function estimateCost(config: RunConfig): { credits: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let total = 0;

  const placesBase = config.search.maxPlaces * 0.01;
  breakdown.places = placesBase;
  total += placesBase;

  if (config.reviews.includeReviews > 0) {
    const reviewCost = config.search.maxPlaces * config.reviews.includeReviews * 0.001;
    breakdown.reviews = reviewCost;
    total += reviewCost;
  }

  if (config.contacts.discoverContactsFromWebsite) {
    const contactCost = config.search.maxPlaces * 0.02;
    breakdown.contacts = contactCost;
    total += contactCost;
  }

  if (config.enrichment.enableDecisionMakerEnrichment) {
    const enrichCost = config.search.maxPlaces * 0.05;
    breakdown.enrichment = enrichCost;
    total += enrichCost;
  }

  if (config.images.includeImages !== 'off') {
    const imageCost = config.search.maxPlaces * config.images.maxImagesPerPlace * 0.001;
    breakdown.images = imageCost;
    total += imageCost;
  }

  return { credits: Math.ceil(total), breakdown };
}

export function getGeoSummary(config: RunConfig): string {
  const { geo } = config;

  switch (geo.geoMode) {
    case 'city':
      return geo.city || 'No city specified';
    case 'latlng_radius':
      if (geo.lat !== null && geo.lng !== null && geo.radiusKm !== null) {
        return `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)} (${geo.radiusKm}km radius)`;
      }
      return 'Coordinates not specified';
    case 'polygon':
    case 'multipolygon':
      return geo.geojson ? 'Custom polygon area' : 'No polygon defined';
    case 'mapsUrl':
      return geo.mapsUrl ? 'Google Maps URL' : 'No URL specified';
    case 'placeUrls':
      return geo.placeUrls?.length ? `${geo.placeUrls.length} place URL(s)` : 'No place URLs';
    case 'placeIds':
      return geo.placeIds?.length ? `${geo.placeIds.length} place ID(s)` : 'No place IDs';
    default:
      return 'Unknown location mode';
  }
}

export function getConfigSummary(config: RunConfig): string[] {
  const summary: string[] = [];

  summary.push(`Search: ${config.search.searchTerms.join(', ') || 'No terms'}`);
  summary.push(`Location: ${getGeoSummary(config)}`);
  summary.push(`Max places: ${config.search.maxPlaces}`);

  if (config.reviews.includeReviews > 0) {
    summary.push(`Reviews: ${config.reviews.includeReviews} per place (${config.reviews.reviewStrategy})`);
  }

  if (config.contacts.discoverContactsFromWebsite) {
    summary.push(`Contact discovery: ON (${config.contacts.emailStrictness})`);
  }

  if (config.enrichment.enableDecisionMakerEnrichment) {
    summary.push(`Decision-maker enrichment: ON`);
  }

  summary.push(`Export: ${config.output.exportView} (${config.output.exportFormat})`);

  return summary;
}
