export type GeoMode = 'city' | 'latlng_radius' | 'polygon' | 'multipolygon' | 'mapsUrl' | 'placeUrls' | 'placeIds';

export type GridDensity = 'low' | 'med' | 'high';

export type DetailPack = 'simple' | 'standard' | 'deep';

export type ReviewCount = 0 | 2 | 10 | 50 | 100 | 200 | 500 | 1000;

export type ReviewStrategy = 'recent' | 'helpful' | 'balanced' | 'recentHelpfulMix';

export type ImageMode = 'off' | 'urlsOnly' | 'fullMetadata';

export type EmailStrictness = 'personalOnly' | 'personalPlusNamedRole' | 'allEmails';

export type EnrichmentStrictness = 'confidentOnly' | 'bestGuess';

export type ExportFormat = 'json' | 'csv' | 'xlsx';

export type ExportView = 'places' | 'reviews' | 'leads' | 'map' | 'competitor' | 'marketAnalysis' | 'partnershipShortlist';

export type DedupeStrategy = 'placeId' | 'domain' | 'phone' | 'smart';

export type SortMode = 'googleDefault' | 'highestRating' | 'mostReviewsThenHighestRating';

export type RunMode = 'manual' | 'scheduled';

export type LogsLevel = 'basic' | 'verbose' | 'debug';

export interface GeoJSON {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface MultiLocation {
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  mapsUrl?: string;
}

export interface GeoConfig {
  geoMode: GeoMode;
  city: string | null;
  lat: number | null;
  lng: number | null;
  radiusKm: number | null;
  geojson: GeoJSON | null;
  mapsUrl: string | null;
  placeUrls: string[] | null;
  placeIds: string[] | null;
  locations: MultiLocation[] | null;
  gridDensity: GridDensity;
}

export interface SearchConfig {
  searchTerms: string[];
  categories: string[];
  excludeKeywords: string[];
  language: string | null;
  sortMode: SortMode;
  maxPlaces: number;
}

export interface ExtractionConfig {
  detailPack: DetailPack;
  includeCoordinates: boolean;
  includeOpeningHours: boolean;
  includePriceBracket: boolean;
  includeMenuUrl: boolean;
  includeReservationLinks: boolean;
  includeOrderLinks: boolean;
  includeAmenities: boolean;
  includePopularTimes: boolean;
  includeQandA: boolean;
  includeOwnerUpdates: boolean;
  includePeopleAlsoSearch: boolean;
  includeClosedStatus: boolean;
}

export interface ReviewsConfig {
  includeReviews: ReviewCount;
  reviewStrategy: ReviewStrategy;
  includeOwnerResponses: boolean;
  includeReviewImages: boolean;
  includeReviewDetailedRatings: boolean;
  includeReviewTags: boolean;
  includeReviewerDetails: boolean;
}

export interface ImagesConfig {
  includeImages: ImageMode;
  maxImagesPerPlace: number;
}

export interface SocialsEnabled {
  facebook: boolean;
  instagram: boolean;
  youtube: boolean;
  tiktok: boolean;
  twitter: boolean;
  linkedin: boolean;
  pinterest: boolean;
}

export interface ContactsConfig {
  discoverContactsFromWebsite: boolean;
  scanPages: string[];
  extractCompanyEmails: boolean;
  extractPhonesFromWebsite: boolean;
  extractSocialProfiles: boolean;
  socialsEnabled: SocialsEnabled;
  emailStrictness: EmailStrictness;
  genericEmailBlocklist: string[];
}

export interface EnrichmentFields {
  fullName: boolean;
  jobTitle: boolean;
  linkedin: boolean;
  workEmail: boolean;
  mobile: boolean;
  companySize: boolean;
}

export interface EnrichmentConfig {
  enableDecisionMakerEnrichment: boolean;
  enrichmentTargets: string[];
  enrichmentFields: EnrichmentFields;
  enrichmentStrictness: EnrichmentStrictness;
}

export interface QualityFiltersConfig {
  minRating: number | null;
  minReviews: number | null;
  mustHaveWebsite: boolean;
  mustHavePhone: boolean;
  excludeTemporarilyClosed: boolean;
  excludePermanentlyClosed: boolean;
  excludeChains: boolean;
}

export interface OutputConfig {
  exportFormat: ExportFormat;
  exportView: ExportView;
  fieldPicker: string[] | null;
  dedupeStrategy: DedupeStrategy;
}

export interface ScheduleConfig {
  type: 'once' | 'daily' | 'weekly' | 'monthly';
  timezone: string;
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
}

export interface ChangeDetectionConfig {
  enabled: boolean;
  alerts: boolean;
}

export interface AutomationConfig {
  runMode: RunMode;
  schedule: ScheduleConfig | null;
  webhooks: WebhookConfig[];
  maxConcurrency: number;
  delayRangeMs: { min: number; max: number };
  retries: number;
  timeoutMs: number;
  logsLevel: LogsLevel;
  saveScreenshots: boolean;
  changeDetection: ChangeDetectionConfig;
}

export interface ComplianceConfig {
  decisionMakerEnrichmentLegalBasisConfirmed: boolean;
  reviewerDetailsLegalBasisConfirmed: boolean;
}

export interface RunConfig {
  geo: GeoConfig;
  search: SearchConfig;
  extraction: ExtractionConfig;
  reviews: ReviewsConfig;
  images: ImagesConfig;
  contacts: ContactsConfig;
  enrichment: EnrichmentConfig;
  qualityFilters: QualityFiltersConfig;
  output: OutputConfig;
  automation: AutomationConfig;
  compliance: ComplianceConfig;
}

export interface ValidationWarning {
  field: string;
  message: string;
  autoFixed: boolean;
}

export interface ValidationResult {
  success: boolean;
  config: RunConfig | null;
  errors: string[];
  warnings: ValidationWarning[];
}

const VALID_GEO_MODES: GeoMode[] = ['city', 'latlng_radius', 'polygon', 'multipolygon', 'mapsUrl', 'placeUrls', 'placeIds'];
const VALID_GRID_DENSITIES: GridDensity[] = ['low', 'med', 'high'];
const VALID_DETAIL_PACKS: DetailPack[] = ['simple', 'standard', 'deep'];
const VALID_REVIEW_COUNTS: ReviewCount[] = [0, 2, 10, 50, 100, 200, 500, 1000];
const VALID_REVIEW_STRATEGIES: ReviewStrategy[] = ['recent', 'helpful', 'balanced', 'recentHelpfulMix'];
const VALID_IMAGE_MODES: ImageMode[] = ['off', 'urlsOnly', 'fullMetadata'];
const VALID_EMAIL_STRICTNESS: EmailStrictness[] = ['personalOnly', 'personalPlusNamedRole', 'allEmails'];
const VALID_ENRICHMENT_STRICTNESS: EnrichmentStrictness[] = ['confidentOnly', 'bestGuess'];
const VALID_EXPORT_FORMATS: ExportFormat[] = ['json', 'csv', 'xlsx'];
const VALID_EXPORT_VIEWS: ExportView[] = ['places', 'reviews', 'leads', 'map', 'competitor', 'marketAnalysis', 'partnershipShortlist'];
const VALID_DEDUPE_STRATEGIES: DedupeStrategy[] = ['placeId', 'domain', 'phone', 'smart'];
const VALID_SORT_MODES: SortMode[] = ['googleDefault', 'highestRating', 'mostReviewsThenHighestRating'];
const VALID_RUN_MODES: RunMode[] = ['manual', 'scheduled'];
const VALID_LOGS_LEVELS: LogsLevel[] = ['basic', 'verbose', 'debug'];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function getDefaultGeoConfig(): GeoConfig {
  return {
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
    gridDensity: 'med'
  };
}

function getDefaultSearchConfig(): SearchConfig {
  return {
    searchTerms: [],
    categories: [],
    excludeKeywords: [],
    language: null,
    sortMode: 'googleDefault',
    maxPlaces: 100
  };
}

function getDefaultExtractionConfig(): ExtractionConfig {
  return {
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
  };
}

function getDefaultReviewsConfig(): ReviewsConfig {
  return {
    includeReviews: 0,
    reviewStrategy: 'recent',
    includeOwnerResponses: false,
    includeReviewImages: false,
    includeReviewDetailedRatings: false,
    includeReviewTags: false,
    includeReviewerDetails: false
  };
}

function getDefaultImagesConfig(): ImagesConfig {
  return {
    includeImages: 'off',
    maxImagesPerPlace: 5
  };
}

function getDefaultContactsConfig(): ContactsConfig {
  return {
    discoverContactsFromWebsite: false,
    scanPages: ['/', '/contact', '/about'],
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
    emailStrictness: 'personalPlusNamedRole',
    genericEmailBlocklist: ['info@', 'support@', 'contact@', 'hello@', 'admin@', 'noreply@', 'no-reply@']
  };
}

function getDefaultEnrichmentConfig(): EnrichmentConfig {
  return {
    enableDecisionMakerEnrichment: false,
    enrichmentTargets: ['Owner', 'CEO', 'Founder', 'Manager', 'Director'],
    enrichmentFields: {
      fullName: true,
      jobTitle: true,
      linkedin: true,
      workEmail: false,
      mobile: false,
      companySize: false
    },
    enrichmentStrictness: 'confidentOnly'
  };
}

function getDefaultQualityFiltersConfig(): QualityFiltersConfig {
  return {
    minRating: null,
    minReviews: null,
    mustHaveWebsite: false,
    mustHavePhone: false,
    excludeTemporarilyClosed: false,
    excludePermanentlyClosed: true,
    excludeChains: false
  };
}

function getDefaultOutputConfig(): OutputConfig {
  return {
    exportFormat: 'json',
    exportView: 'places',
    fieldPicker: null,
    dedupeStrategy: 'placeId'
  };
}

function getDefaultAutomationConfig(): AutomationConfig {
  return {
    runMode: 'manual',
    schedule: null,
    webhooks: [],
    maxConcurrency: 5,
    delayRangeMs: { min: 1000, max: 3000 },
    retries: 3,
    timeoutMs: 300000,
    logsLevel: 'basic',
    saveScreenshots: false,
    changeDetection: {
      enabled: false,
      alerts: false
    }
  };
}

function getDefaultComplianceConfig(): ComplianceConfig {
  return {
    decisionMakerEnrichmentLegalBasisConfirmed: false,
    reviewerDetailsLegalBasisConfirmed: false
  };
}

export function getDefaultRunConfig(): RunConfig {
  return {
    geo: getDefaultGeoConfig(),
    search: getDefaultSearchConfig(),
    extraction: getDefaultExtractionConfig(),
    reviews: getDefaultReviewsConfig(),
    images: getDefaultImagesConfig(),
    contacts: getDefaultContactsConfig(),
    enrichment: getDefaultEnrichmentConfig(),
    qualityFilters: getDefaultQualityFiltersConfig(),
    output: getDefaultOutputConfig(),
    automation: getDefaultAutomationConfig(),
    compliance: getDefaultComplianceConfig()
  };
}

function validateGeoConfig(input: unknown, errors: string[]): GeoConfig {
  const defaults = getDefaultGeoConfig();
  if (!isObject(input)) return defaults;

  const geoMode = VALID_GEO_MODES.includes(input.geoMode as GeoMode)
    ? (input.geoMode as GeoMode)
    : defaults.geoMode;

  return {
    geoMode,
    city: isString(input.city) ? input.city : defaults.city,
    lat: isNumber(input.lat) ? input.lat : defaults.lat,
    lng: isNumber(input.lng) ? input.lng : defaults.lng,
    radiusKm: isNumber(input.radiusKm) ? input.radiusKm : defaults.radiusKm,
    geojson: isObject(input.geojson) ? (input.geojson as GeoJSON) : defaults.geojson,
    mapsUrl: isString(input.mapsUrl) ? input.mapsUrl : defaults.mapsUrl,
    placeUrls: isStringArray(input.placeUrls) ? input.placeUrls : defaults.placeUrls,
    placeIds: isStringArray(input.placeIds) ? input.placeIds : defaults.placeIds,
    locations: Array.isArray(input.locations) ? (input.locations as MultiLocation[]) : defaults.locations,
    gridDensity: VALID_GRID_DENSITIES.includes(input.gridDensity as GridDensity)
      ? (input.gridDensity as GridDensity)
      : defaults.gridDensity
  };
}

function validateSearchConfig(input: unknown, errors: string[]): SearchConfig {
  const defaults = getDefaultSearchConfig();
  if (!isObject(input)) return defaults;

  const maxPlaces = isNumber(input.maxPlaces) && input.maxPlaces > 0 && input.maxPlaces <= 10000
    ? Math.round(input.maxPlaces)
    : defaults.maxPlaces;

  return {
    searchTerms: isStringArray(input.searchTerms) ? input.searchTerms : defaults.searchTerms,
    categories: isStringArray(input.categories) ? input.categories : defaults.categories,
    excludeKeywords: isStringArray(input.excludeKeywords) ? input.excludeKeywords : defaults.excludeKeywords,
    language: isString(input.language) ? input.language : defaults.language,
    sortMode: VALID_SORT_MODES.includes(input.sortMode as SortMode)
      ? (input.sortMode as SortMode)
      : defaults.sortMode,
    maxPlaces
  };
}

function validateExtractionConfig(input: unknown, errors: string[]): ExtractionConfig {
  const defaults = getDefaultExtractionConfig();
  if (!isObject(input)) return defaults;

  return {
    detailPack: VALID_DETAIL_PACKS.includes(input.detailPack as DetailPack)
      ? (input.detailPack as DetailPack)
      : defaults.detailPack,
    includeCoordinates: isBoolean(input.includeCoordinates) ? input.includeCoordinates : defaults.includeCoordinates,
    includeOpeningHours: isBoolean(input.includeOpeningHours) ? input.includeOpeningHours : defaults.includeOpeningHours,
    includePriceBracket: isBoolean(input.includePriceBracket) ? input.includePriceBracket : defaults.includePriceBracket,
    includeMenuUrl: isBoolean(input.includeMenuUrl) ? input.includeMenuUrl : defaults.includeMenuUrl,
    includeReservationLinks: isBoolean(input.includeReservationLinks) ? input.includeReservationLinks : defaults.includeReservationLinks,
    includeOrderLinks: isBoolean(input.includeOrderLinks) ? input.includeOrderLinks : defaults.includeOrderLinks,
    includeAmenities: isBoolean(input.includeAmenities) ? input.includeAmenities : defaults.includeAmenities,
    includePopularTimes: isBoolean(input.includePopularTimes) ? input.includePopularTimes : defaults.includePopularTimes,
    includeQandA: isBoolean(input.includeQandA) ? input.includeQandA : defaults.includeQandA,
    includeOwnerUpdates: isBoolean(input.includeOwnerUpdates) ? input.includeOwnerUpdates : defaults.includeOwnerUpdates,
    includePeopleAlsoSearch: isBoolean(input.includePeopleAlsoSearch) ? input.includePeopleAlsoSearch : defaults.includePeopleAlsoSearch,
    includeClosedStatus: isBoolean(input.includeClosedStatus) ? input.includeClosedStatus : defaults.includeClosedStatus
  };
}

function validateReviewsConfig(input: unknown, errors: string[]): ReviewsConfig {
  const defaults = getDefaultReviewsConfig();
  if (!isObject(input)) return defaults;

  const includeReviews = VALID_REVIEW_COUNTS.includes(input.includeReviews as ReviewCount)
    ? (input.includeReviews as ReviewCount)
    : defaults.includeReviews;

  return {
    includeReviews,
    reviewStrategy: VALID_REVIEW_STRATEGIES.includes(input.reviewStrategy as ReviewStrategy)
      ? (input.reviewStrategy as ReviewStrategy)
      : defaults.reviewStrategy,
    includeOwnerResponses: isBoolean(input.includeOwnerResponses) ? input.includeOwnerResponses : defaults.includeOwnerResponses,
    includeReviewImages: isBoolean(input.includeReviewImages) ? input.includeReviewImages : defaults.includeReviewImages,
    includeReviewDetailedRatings: isBoolean(input.includeReviewDetailedRatings) ? input.includeReviewDetailedRatings : defaults.includeReviewDetailedRatings,
    includeReviewTags: isBoolean(input.includeReviewTags) ? input.includeReviewTags : defaults.includeReviewTags,
    includeReviewerDetails: isBoolean(input.includeReviewerDetails) ? input.includeReviewerDetails : defaults.includeReviewerDetails
  };
}

function validateImagesConfig(input: unknown, errors: string[]): ImagesConfig {
  const defaults = getDefaultImagesConfig();
  if (!isObject(input)) return defaults;

  const maxImagesPerPlace = isNumber(input.maxImagesPerPlace) && input.maxImagesPerPlace >= 0 && input.maxImagesPerPlace <= 100
    ? Math.round(input.maxImagesPerPlace)
    : defaults.maxImagesPerPlace;

  return {
    includeImages: VALID_IMAGE_MODES.includes(input.includeImages as ImageMode)
      ? (input.includeImages as ImageMode)
      : defaults.includeImages,
    maxImagesPerPlace
  };
}

function validateSocialsEnabled(input: unknown): SocialsEnabled {
  const defaults = getDefaultContactsConfig().socialsEnabled;
  if (!isObject(input)) return defaults;

  return {
    facebook: isBoolean(input.facebook) ? input.facebook : defaults.facebook,
    instagram: isBoolean(input.instagram) ? input.instagram : defaults.instagram,
    youtube: isBoolean(input.youtube) ? input.youtube : defaults.youtube,
    tiktok: isBoolean(input.tiktok) ? input.tiktok : defaults.tiktok,
    twitter: isBoolean(input.twitter) ? input.twitter : defaults.twitter,
    linkedin: isBoolean(input.linkedin) ? input.linkedin : defaults.linkedin,
    pinterest: isBoolean(input.pinterest) ? input.pinterest : defaults.pinterest
  };
}

function validateContactsConfig(input: unknown, errors: string[]): ContactsConfig {
  const defaults = getDefaultContactsConfig();
  if (!isObject(input)) return defaults;

  return {
    discoverContactsFromWebsite: isBoolean(input.discoverContactsFromWebsite) ? input.discoverContactsFromWebsite : defaults.discoverContactsFromWebsite,
    scanPages: isStringArray(input.scanPages) ? input.scanPages : defaults.scanPages,
    extractCompanyEmails: isBoolean(input.extractCompanyEmails) ? input.extractCompanyEmails : defaults.extractCompanyEmails,
    extractPhonesFromWebsite: isBoolean(input.extractPhonesFromWebsite) ? input.extractPhonesFromWebsite : defaults.extractPhonesFromWebsite,
    extractSocialProfiles: isBoolean(input.extractSocialProfiles) ? input.extractSocialProfiles : defaults.extractSocialProfiles,
    socialsEnabled: validateSocialsEnabled(input.socialsEnabled),
    emailStrictness: VALID_EMAIL_STRICTNESS.includes(input.emailStrictness as EmailStrictness)
      ? (input.emailStrictness as EmailStrictness)
      : defaults.emailStrictness,
    genericEmailBlocklist: isStringArray(input.genericEmailBlocklist) ? input.genericEmailBlocklist : defaults.genericEmailBlocklist
  };
}

function validateEnrichmentFields(input: unknown): EnrichmentFields {
  const defaults = getDefaultEnrichmentConfig().enrichmentFields;
  if (!isObject(input)) return defaults;

  return {
    fullName: isBoolean(input.fullName) ? input.fullName : defaults.fullName,
    jobTitle: isBoolean(input.jobTitle) ? input.jobTitle : defaults.jobTitle,
    linkedin: isBoolean(input.linkedin) ? input.linkedin : defaults.linkedin,
    workEmail: isBoolean(input.workEmail) ? input.workEmail : defaults.workEmail,
    mobile: isBoolean(input.mobile) ? input.mobile : defaults.mobile,
    companySize: isBoolean(input.companySize) ? input.companySize : defaults.companySize
  };
}

function validateEnrichmentConfig(input: unknown, errors: string[]): EnrichmentConfig {
  const defaults = getDefaultEnrichmentConfig();
  if (!isObject(input)) return defaults;

  return {
    enableDecisionMakerEnrichment: isBoolean(input.enableDecisionMakerEnrichment) ? input.enableDecisionMakerEnrichment : defaults.enableDecisionMakerEnrichment,
    enrichmentTargets: isStringArray(input.enrichmentTargets) ? input.enrichmentTargets : defaults.enrichmentTargets,
    enrichmentFields: validateEnrichmentFields(input.enrichmentFields),
    enrichmentStrictness: VALID_ENRICHMENT_STRICTNESS.includes(input.enrichmentStrictness as EnrichmentStrictness)
      ? (input.enrichmentStrictness as EnrichmentStrictness)
      : defaults.enrichmentStrictness
  };
}

function validateQualityFiltersConfig(input: unknown, errors: string[]): QualityFiltersConfig {
  const defaults = getDefaultQualityFiltersConfig();
  if (!isObject(input)) return defaults;

  const minRating = isNumber(input.minRating) && input.minRating >= 0 && input.minRating <= 5
    ? input.minRating
    : defaults.minRating;

  const minReviews = isNumber(input.minReviews) && input.minReviews >= 0
    ? Math.round(input.minReviews)
    : defaults.minReviews;

  return {
    minRating,
    minReviews,
    mustHaveWebsite: isBoolean(input.mustHaveWebsite) ? input.mustHaveWebsite : defaults.mustHaveWebsite,
    mustHavePhone: isBoolean(input.mustHavePhone) ? input.mustHavePhone : defaults.mustHavePhone,
    excludeTemporarilyClosed: isBoolean(input.excludeTemporarilyClosed) ? input.excludeTemporarilyClosed : defaults.excludeTemporarilyClosed,
    excludePermanentlyClosed: isBoolean(input.excludePermanentlyClosed) ? input.excludePermanentlyClosed : defaults.excludePermanentlyClosed,
    excludeChains: isBoolean(input.excludeChains) ? input.excludeChains : defaults.excludeChains
  };
}

function validateOutputConfig(input: unknown, errors: string[]): OutputConfig {
  const defaults = getDefaultOutputConfig();
  if (!isObject(input)) return defaults;

  return {
    exportFormat: VALID_EXPORT_FORMATS.includes(input.exportFormat as ExportFormat)
      ? (input.exportFormat as ExportFormat)
      : defaults.exportFormat,
    exportView: VALID_EXPORT_VIEWS.includes(input.exportView as ExportView)
      ? (input.exportView as ExportView)
      : defaults.exportView,
    fieldPicker: isStringArray(input.fieldPicker) ? input.fieldPicker : defaults.fieldPicker,
    dedupeStrategy: VALID_DEDUPE_STRATEGIES.includes(input.dedupeStrategy as DedupeStrategy)
      ? (input.dedupeStrategy as DedupeStrategy)
      : defaults.dedupeStrategy
  };
}

function validateAutomationConfig(input: unknown, errors: string[]): AutomationConfig {
  const defaults = getDefaultAutomationConfig();
  if (!isObject(input)) return defaults;

  const maxConcurrency = isNumber(input.maxConcurrency) && input.maxConcurrency >= 1 && input.maxConcurrency <= 20
    ? Math.round(input.maxConcurrency)
    : defaults.maxConcurrency;

  const retries = isNumber(input.retries) && input.retries >= 0 && input.retries <= 10
    ? Math.round(input.retries)
    : defaults.retries;

  const timeoutMs = isNumber(input.timeoutMs) && input.timeoutMs >= 10000 && input.timeoutMs <= 600000
    ? Math.round(input.timeoutMs)
    : defaults.timeoutMs;

  let delayRangeMs = defaults.delayRangeMs;
  if (isObject(input.delayRangeMs)) {
    const min = isNumber(input.delayRangeMs.min) ? input.delayRangeMs.min : defaults.delayRangeMs.min;
    const max = isNumber(input.delayRangeMs.max) ? input.delayRangeMs.max : defaults.delayRangeMs.max;
    delayRangeMs = { min: Math.max(0, min), max: Math.max(min, max) };
  }

  let changeDetection = defaults.changeDetection;
  if (isObject(input.changeDetection)) {
    changeDetection = {
      enabled: isBoolean(input.changeDetection.enabled) ? input.changeDetection.enabled : defaults.changeDetection.enabled,
      alerts: isBoolean(input.changeDetection.alerts) ? input.changeDetection.alerts : defaults.changeDetection.alerts
    };
  }

  return {
    runMode: VALID_RUN_MODES.includes(input.runMode as RunMode)
      ? (input.runMode as RunMode)
      : defaults.runMode,
    schedule: isObject(input.schedule) ? (input.schedule as ScheduleConfig) : defaults.schedule,
    webhooks: Array.isArray(input.webhooks) ? (input.webhooks as WebhookConfig[]) : defaults.webhooks,
    maxConcurrency,
    delayRangeMs,
    retries,
    timeoutMs,
    logsLevel: VALID_LOGS_LEVELS.includes(input.logsLevel as LogsLevel)
      ? (input.logsLevel as LogsLevel)
      : defaults.logsLevel,
    saveScreenshots: isBoolean(input.saveScreenshots) ? input.saveScreenshots : defaults.saveScreenshots,
    changeDetection
  };
}

function validateComplianceConfig(input: unknown, errors: string[]): ComplianceConfig {
  const defaults = getDefaultComplianceConfig();
  if (!isObject(input)) return defaults;

  return {
    decisionMakerEnrichmentLegalBasisConfirmed: isBoolean(input.decisionMakerEnrichmentLegalBasisConfirmed)
      ? input.decisionMakerEnrichmentLegalBasisConfirmed
      : defaults.decisionMakerEnrichmentLegalBasisConfirmed,
    reviewerDetailsLegalBasisConfirmed: isBoolean(input.reviewerDetailsLegalBasisConfirmed)
      ? input.reviewerDetailsLegalBasisConfirmed
      : defaults.reviewerDetailsLegalBasisConfirmed
  };
}

export function validateRunConfig(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: ValidationWarning[] = [];

  if (!isObject(input)) {
    return {
      success: false,
      config: null,
      errors: ['Input must be an object'],
      warnings: []
    };
  }

  const config: RunConfig = {
    geo: validateGeoConfig(input.geo, errors),
    search: validateSearchConfig(input.search, errors),
    extraction: validateExtractionConfig(input.extraction, errors),
    reviews: validateReviewsConfig(input.reviews, errors),
    images: validateImagesConfig(input.images, errors),
    contacts: validateContactsConfig(input.contacts, errors),
    enrichment: validateEnrichmentConfig(input.enrichment, errors),
    qualityFilters: validateQualityFiltersConfig(input.qualityFilters, errors),
    output: validateOutputConfig(input.output, errors),
    automation: validateAutomationConfig(input.automation, errors),
    compliance: validateComplianceConfig(input.compliance, errors)
  };

  if (config.search.searchTerms.length === 0 && config.geo.geoMode !== 'placeUrls' && config.geo.geoMode !== 'placeIds') {
    errors.push('At least one search term is required unless using placeUrls or placeIds mode');
  }

  if (config.geo.geoMode === 'city' && !config.geo.city) {
    errors.push('City name is required when geoMode is "city"');
  }

  if (config.geo.geoMode === 'latlng_radius') {
    if (config.geo.lat === null || config.geo.lng === null) {
      errors.push('Latitude and longitude are required when geoMode is "latlng_radius"');
    }
    if (config.geo.radiusKm === null || config.geo.radiusKm <= 0) {
      errors.push('Positive radius is required when geoMode is "latlng_radius"');
    }
  }

  if ((config.geo.geoMode === 'polygon' || config.geo.geoMode === 'multipolygon') && !config.geo.geojson) {
    errors.push('GeoJSON is required when geoMode is "polygon" or "multipolygon"');
  }

  if (config.geo.geoMode === 'mapsUrl' && !config.geo.mapsUrl) {
    errors.push('Maps URL is required when geoMode is "mapsUrl"');
  }

  if (config.geo.geoMode === 'placeUrls' && (!config.geo.placeUrls || config.geo.placeUrls.length === 0)) {
    errors.push('At least one place URL is required when geoMode is "placeUrls"');
  }

  if (config.geo.geoMode === 'placeIds' && (!config.geo.placeIds || config.geo.placeIds.length === 0)) {
    errors.push('At least one place ID is required when geoMode is "placeIds"');
  }

  return {
    success: errors.length === 0,
    config: errors.length === 0 ? config : null,
    errors,
    warnings
  };
}
