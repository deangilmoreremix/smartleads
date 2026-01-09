import type { RunConfig, ValidationWarning } from './runConfig';
import { validateRunConfig } from './runConfig';
import { buildRtrvrRun } from './rtrvrPrompt';

export interface Place {
  name: string;
  category: string;
  subCategory?: string | null;
  placeId: string;
  cid?: string | null;
  fid?: string | null;
  address: string;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  website?: string | null;
  phone?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  plusCode?: string | null;
  openingHours?: Record<string, string | null> | null;
  priceBracket?: string | null;
  menuUrl?: string | null;
  reservationLinks?: string[];
  orderLinks?: string[];
  amenities?: string[];
  additionalInfo?: Record<string, unknown> | null;
  popularTimes?: Record<string, Array<{ hour: number; busyness: number }>> | null;
  questionsAndAnswers?: Array<{
    question: string;
    answer?: string | null;
    askedBy?: string | null;
    answeredBy?: string | null;
  }>;
  ownerUpdates?: Array<{
    date: string;
    content: string;
    type?: string | null;
  }>;
  peopleAlsoSearch?: string[];
  isTemporarilyClosed?: boolean;
  isPermanentlyClosed?: boolean;
  images?: string[] | Array<{
    url: string;
    width?: number | null;
    height?: number | null;
    uploadDate?: string | null;
    contributor?: string | null;
  }>;
}

export interface Review {
  placeId: string;
  text?: string | null;
  rating: number;
  date: string;
  reviewerName: string;
  ownerResponse?: {
    text: string;
    date?: string | null;
  } | null;
  images?: string[];
  detailedRatings?: Record<string, number> | null;
  tags?: string[];
  reviewerDetails?: {
    profileUrl?: string | null;
    totalReviews?: number | null;
    level?: string | null;
  } | null;
}

export interface Contact {
  placeId: string;
  emails: Array<{
    email: string;
    type: 'personal' | 'role' | 'generic';
    confidence: number;
    source?: string | null;
  }>;
  phones: Array<{
    number: string;
    type?: string | null;
    source?: string | null;
  }>;
  socialProfiles?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
    pinterest?: string | null;
  };
  decisionMakers?: Array<{
    fullName?: string | null;
    jobTitle?: string | null;
    linkedinUrl?: string | null;
    workEmail?: string | null;
    mobile?: string | null;
    confidence: number;
  }>;
}

export interface RtrvrDiagnostics {
  pagesVisited: number;
  totalResultsFound: number;
  totalPlacesReturned: number;
  durationMs: number;
  errors: string[];
  warnings: string[];
}

export interface RtrvrResult {
  success: boolean;
  places: Place[];
  reviews: Review[];
  contacts: Contact[];
  diagnostics: RtrvrDiagnostics;
  configWarnings: ValidationWarning[];
  configHash: string;
}

export interface RtrvrError {
  success: false;
  error: string;
  durationMs?: number;
}

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '';
    }
  }
  return '';
}

export async function runRtrvr(config: RunConfig): Promise<RtrvrResult | RtrvrError> {
  const validation = validateRunConfig(config);

  if (!validation.success || !validation.config) {
    return {
      success: false,
      error: `Invalid configuration: ${validation.errors.join(', ')}`
    };
  }

  const { prompt, schema, safeConfig, warnings, configHash } = await buildRtrvrRun(validation.config);

  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/.netlify/functions/rtrvr-run`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        schema,
        config: safeConfig
      })
    });

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status} ${response.statusText}`;

      try {
        const errorBody = await response.json();
        if (errorBody.error) {
          errorMessage = errorBody.error;
        }
      } catch {
        // Ignore JSON parse errors
      }

      return {
        success: false,
        error: errorMessage,
        durationMs: 0
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Unknown error from RTRVR',
        durationMs: result.durationMs
      };
    }

    const data = result.data || {};

    return {
      success: true,
      places: Array.isArray(data.places) ? data.places : [],
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      contacts: Array.isArray(data.contacts) ? data.contacts : [],
      diagnostics: result.diagnostics || {
        pagesVisited: 0,
        totalResultsFound: 0,
        totalPlacesReturned: 0,
        durationMs: 0,
        errors: [],
        warnings: []
      },
      configWarnings: warnings,
      configHash
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}

export function isRtrvrError(result: RtrvrResult | RtrvrError): result is RtrvrError {
  return !result.success;
}

export function mergeContactsWithPlaces(places: Place[], contacts: Contact[]): Array<Place & { contactInfo?: Contact }> {
  const contactMap = new Map(contacts.map(c => [c.placeId, c]));

  return places.map(place => ({
    ...place,
    contactInfo: contactMap.get(place.placeId)
  }));
}

export function getLeadsFromResults(places: Place[], contacts: Contact[]): Array<{
  placeName: string;
  placeId: string;
  website: string | null;
  phone: string | null;
  emails: Contact['emails'];
  phones: Contact['phones'];
  socialProfiles: Contact['socialProfiles'];
  decisionMakers: Contact['decisionMakers'];
}> {
  const contactMap = new Map(contacts.map(c => [c.placeId, c]));

  return places
    .filter(place => {
      const contact = contactMap.get(place.placeId);
      return place.website || place.phone ||
        (contact && (contact.emails.length > 0 || contact.phones.length > 0 || contact.decisionMakers?.length));
    })
    .map(place => {
      const contact = contactMap.get(place.placeId);
      return {
        placeName: place.name,
        placeId: place.placeId,
        website: place.website ?? null,
        phone: place.phone ?? null,
        emails: contact?.emails || [],
        phones: contact?.phones || [],
        socialProfiles: contact?.socialProfiles,
        decisionMakers: contact?.decisionMakers
      };
    });
}

export function exportToCSV(places: Place[], filename = 'rtrvr-export.csv'): void {
  if (places.length === 0) return;

  const headers = [
    'name', 'category', 'placeId', 'address', 'city', 'state', 'postalCode',
    'country', 'website', 'phone', 'rating', 'reviewsCount', 'latitude', 'longitude'
  ];

  const rows = places.map(place =>
    headers.map(header => {
      const value = place[header as keyof Place];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
