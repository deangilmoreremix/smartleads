import { createClient } from 'npm:@supabase/supabase-js@2';
import { logProgress } from '../_shared/progress-logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ApifySettings {
  searchStringsArray?: string[];
  locationQuery?: string;
  maxCrawledPlacesPerSearch?: number;
  language?: string;
  searchMatching?: 'all' | 'only_includes' | 'only_exact';
  placeMinimumStars?: '' | 'two' | 'twoAndHalf' | 'three' | 'threeAndHalf' | 'four' | 'fourAndHalf';
  website?: 'allPlaces' | 'withWebsite' | 'withoutWebsite';
  skipClosedPlaces?: boolean;
  scrapePlaceDetailPage?: boolean;
  scrapeTableReservationProvider?: boolean;
  includeWebResults?: boolean;
  scrapeDirectories?: boolean;
  maxQuestions?: number;
  scrapeContacts?: boolean;
  scrapeSocialMediaProfiles?: {
    facebooks?: boolean;
    instagrams?: boolean;
    youtubes?: boolean;
    tiktoks?: boolean;
    twitters?: boolean;
  };
  maximumLeadsEnrichmentRecords?: number;
  leadsEnrichmentDepartments?: string[];
  maxReviews?: number;
  reviewsStartDate?: string;
  reviewsSort?: 'newest' | 'mostRelevant' | 'highestRanking' | 'lowestRanking';
  reviewsFilterString?: string;
  reviewsOrigin?: 'all' | 'google';
  scrapeReviewsPersonalData?: boolean;
  maxImages?: number;
  scrapeImageAuthors?: boolean;
  countryCode?: string;
  city?: string;
  state?: string;
  county?: string;
  postalCode?: string;
  customGeolocation?: any;
  startUrls?: Array<{ url: string }>;
  placeIds?: string[];
  categoryFilterWords?: string[];
  allPlacesNoSearchAction?: '' | 'all_places_no_search_ocr' | 'all_places_no_search_mouse';
}

interface ScrapeRequest {
  campaignId: string;
  niche: string;
  location: string;
  apifySettings?: ApifySettings;
}

interface ApifyPlace {
  title?: string;
  totalScore?: number;
  reviewsCount?: number;
  phone?: string;
  website?: string;
  url?: string;
  address?: string;
  categoryName?: string;
  location?: { lat: number; lng: number };
  openingHours?: any[];
  imageCategories?: any;
  reviewsDistribution?: any;
  popularTimes?: any;
  peopleAlsoSearch?: any[];
  imageUrls?: string[];
  images?: Array<{
    url: string;
    thumbnail?: string;
    author?: string;
    category?: string;
  }>;
  reviews?: Array<{
    name?: string;
    photoUrl?: string;
    stars?: number;
    text?: string;
    publishAt?: string;
    likesCount?: number;
    reviewUrl?: string;
    responseFromOwnerText?: string;
    responseFromOwnerDate?: string;
  }>;
  questionsAndAnswers?: Array<{
    question: string;
    answer?: string;
  }>;
  webResults?: any[];
  directoryPlaces?: any[];
  contacts?: {
    emails?: string[];
    phones?: string[];
    socialProfiles?: {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      tiktok?: string;
      twitter?: string;
    };
  };
  enrichedSocialProfiles?: {
    facebook?: any;
    instagram?: any;
    youtube?: any;
    tiktok?: any;
    twitter?: any;
  };
  leads?: Array<{
    fullName?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    department?: string;
    seniority?: string;
  }>;
  industry?: string;
  employeeCount?: number;
  [key: string]: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let supabaseClient: any;
  let jobId: string | undefined;

  try {
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { campaignId, niche, location, apifySettings }: ScrapeRequest = await req.json();

    const { data: campaign } = await supabaseClient
      .from('campaigns')
      .select('name')
      .eq('id', campaignId)
      .single();

    jobId = crypto.randomUUID();
    await supabaseClient.from('agent_jobs').insert({
      id: jobId,
      campaign_id: campaignId,
      user_id: user.id,
      job_type: 'lead_scraping',
      status: 'initializing',
      progress_percentage: 0,
      total_steps: 4,
      completed_steps: 0,
      result_data: {
        campaign_name: campaign?.name || 'Campaign'
      }
    });

    await logProgress(supabaseClient, jobId, {
      level: 'info',
      icon: '🤖',
      message: 'Agent initialized successfully'
    });

    await supabaseClient.from('agent_jobs').update({
      status: 'running',
      progress_percentage: 25,
      completed_steps: 1
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'loading',
      icon: '🔍',
      message: `Starting Google Maps search for ${niche} in ${location}`
    });

    const places = await scrapeGoogleMapsWithApify(niche, location, apifySettings || {}, supabaseClient, jobId);

    if (places.length === 0) {
      throw new Error('No leads found. Please try different search criteria.');
    }

    await logProgress(supabaseClient, jobId, {
      level: 'success',
      icon: '✅',
      message: `Found ${places.length} businesses from Google Maps`
    });

    await supabaseClient.from('agent_jobs').update({
      progress_percentage: 50,
      completed_steps: 2
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'loading',
      icon: '📧',
      message: 'Extracting contact information and enriching data...'
    });

    let totalLeadsInserted = 0;
    let totalContactsInserted = 0;
    let totalSocialProfilesInserted = 0;
    let totalReviewsInserted = 0;
    let totalImagesInserted = 0;

    for (const place of places) {
      const leadData = {
        campaign_id: campaignId,
        user_id: user.id,
        business_name: place.title || 'Unknown Business',
        email: place.contacts?.emails?.[0] || extractEmailFromPlace(place),
        real_email: place.contacts?.emails?.[0] || null,
        phone: place.phone || null,
        address: place.address || null,
        website: place.website || null,
        rating: place.totalScore || null,
        review_count: place.reviewsCount || null,
        email_type: determineEmailType(place.contacts?.emails?.[0] || extractEmailFromPlace(place), place.website),
        google_maps_url: place.url || null,
        industry: place.industry || null,
        employee_count: place.employeeCount || null,
        opening_hours: place.openingHours || [],
        image_categories: place.imageCategories || {},
        reviews_distribution: place.reviewsDistribution || {},
        popular_times: place.popularTimes || {},
        questions_answers: place.questionsAndAnswers || [],
        web_results: place.webResults || [],
        directory_places: place.directoryPlaces || [],
        social_profiles: place.contacts?.socialProfiles || {},
        scraped_data: {
          categoryName: place.categoryName,
          location: place.location,
          peopleAlsoSearch: place.peopleAlsoSearch,
        },
        status: 'new',
      };

      const { data: insertedLead, error: leadError } = await supabaseClient
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (leadError) {
        console.error('Error inserting lead:', leadError);
        continue;
      }

      totalLeadsInserted++;

      if (place.leads && place.leads.length > 0) {
        const contacts = place.leads.map(lead => ({
          lead_id: insertedLead.id,
          user_id: user.id,
          campaign_id: campaignId,
          full_name: lead.fullName,
          job_title: lead.jobTitle,
          email: lead.email,
          phone: lead.phone,
          linkedin_url: lead.linkedinUrl,
          department: lead.department,
          seniority: lead.seniority,
        }));

        const { error: contactsError } = await supabaseClient
          .from('lead_contacts')
          .insert(contacts);

        if (!contactsError) {
          totalContactsInserted += contacts.length;
        }
      }

      if (place.enrichedSocialProfiles) {
        const socialProfiles = [];

        if (place.enrichedSocialProfiles.facebook) {
          socialProfiles.push({
            lead_id: insertedLead.id,
            user_id: user.id,
            platform: 'facebook',
            profile_url: place.enrichedSocialProfiles.facebook.url || place.contacts?.socialProfiles?.facebook,
            profile_name: place.enrichedSocialProfiles.facebook.name,
            followers: place.enrichedSocialProfiles.facebook.followers,
            following: place.enrichedSocialProfiles.facebook.following,
            is_verified: place.enrichedSocialProfiles.facebook.verified,
            description: place.enrichedSocialProfiles.facebook.description,
            profile_picture: place.enrichedSocialProfiles.facebook.picture,
            enriched_data: place.enrichedSocialProfiles.facebook,
          });
        }

        if (place.enrichedSocialProfiles.instagram) {
          socialProfiles.push({
            lead_id: insertedLead.id,
            user_id: user.id,
            platform: 'instagram',
            profile_url: place.enrichedSocialProfiles.instagram.url || place.contacts?.socialProfiles?.instagram,
            profile_name: place.enrichedSocialProfiles.instagram.name,
            followers: place.enrichedSocialProfiles.instagram.followers,
            following: place.enrichedSocialProfiles.instagram.following,
            posts_count: place.enrichedSocialProfiles.instagram.posts,
            is_verified: place.enrichedSocialProfiles.instagram.verified,
            description: place.enrichedSocialProfiles.instagram.description,
            profile_picture: place.enrichedSocialProfiles.instagram.picture,
            enriched_data: place.enrichedSocialProfiles.instagram,
          });
        }

        if (place.enrichedSocialProfiles.youtube) {
          socialProfiles.push({
            lead_id: insertedLead.id,
            user_id: user.id,
            platform: 'youtube',
            profile_url: place.enrichedSocialProfiles.youtube.url || place.contacts?.socialProfiles?.youtube,
            profile_name: place.enrichedSocialProfiles.youtube.name,
            followers: place.enrichedSocialProfiles.youtube.subscribers,
            posts_count: place.enrichedSocialProfiles.youtube.videos,
            is_verified: place.enrichedSocialProfiles.youtube.verified,
            description: place.enrichedSocialProfiles.youtube.description,
            profile_picture: place.enrichedSocialProfiles.youtube.picture,
            enriched_data: place.enrichedSocialProfiles.youtube,
          });
        }

        if (place.enrichedSocialProfiles.tiktok) {
          socialProfiles.push({
            lead_id: insertedLead.id,
            user_id: user.id,
            platform: 'tiktok',
            profile_url: place.enrichedSocialProfiles.tiktok.url || place.contacts?.socialProfiles?.tiktok,
            profile_name: place.enrichedSocialProfiles.tiktok.name,
            followers: place.enrichedSocialProfiles.tiktok.followers,
            following: place.enrichedSocialProfiles.tiktok.following,
            posts_count: place.enrichedSocialProfiles.tiktok.videos,
            is_verified: place.enrichedSocialProfiles.tiktok.verified,
            description: place.enrichedSocialProfiles.tiktok.description,
            profile_picture: place.enrichedSocialProfiles.tiktok.picture,
            enriched_data: place.enrichedSocialProfiles.tiktok,
          });
        }

        if (place.enrichedSocialProfiles.twitter) {
          socialProfiles.push({
            lead_id: insertedLead.id,
            user_id: user.id,
            platform: 'twitter',
            profile_url: place.enrichedSocialProfiles.twitter.url || place.contacts?.socialProfiles?.twitter,
            profile_name: place.enrichedSocialProfiles.twitter.name,
            followers: place.enrichedSocialProfiles.twitter.followers,
            following: place.enrichedSocialProfiles.twitter.following,
            posts_count: place.enrichedSocialProfiles.twitter.tweets,
            is_verified: place.enrichedSocialProfiles.twitter.verified,
            description: place.enrichedSocialProfiles.twitter.description,
            profile_picture: place.enrichedSocialProfiles.twitter.picture,
            enriched_data: place.enrichedSocialProfiles.twitter,
          });
        }

        if (socialProfiles.length > 0) {
          const { error: socialError } = await supabaseClient
            .from('lead_social_profiles')
            .insert(socialProfiles);

          if (!socialError) {
            totalSocialProfilesInserted += socialProfiles.length;
          }
        }
      }

      if (place.reviews && place.reviews.length > 0) {
        const reviews = place.reviews.map(review => ({
          lead_id: insertedLead.id,
          user_id: user.id,
          reviewer_name: review.name,
          reviewer_photo: review.photoUrl,
          rating: review.stars,
          text: review.text,
          publish_date: review.publishAt ? new Date(review.publishAt).toISOString() : null,
          response_text: review.responseFromOwnerText,
          response_date: review.responseFromOwnerDate ? new Date(review.responseFromOwnerDate).toISOString() : null,
          likes: review.likesCount || 0,
          review_url: review.reviewUrl,
        }));

        const { error: reviewsError } = await supabaseClient
          .from('lead_reviews')
          .insert(reviews);

        if (!reviewsError) {
          totalReviewsInserted += reviews.length;
        }
      }

      if (place.images && place.images.length > 0) {
        const images = place.images.map(image => ({
          lead_id: insertedLead.id,
          user_id: user.id,
          image_url: image.url,
          thumbnail_url: image.thumbnail,
          author_name: image.author,
          category: image.category,
        }));

        const { error: imagesError } = await supabaseClient
          .from('lead_images')
          .insert(images);

        if (!imagesError) {
          totalImagesInserted += images.length;
        }
      }
    }

    await logProgress(supabaseClient, jobId, {
      level: 'success',
      icon: '💾',
      message: `Successfully saved ${totalLeadsInserted} leads to database`
    });

    if (totalContactsInserted > 0) {
      await logProgress(supabaseClient, jobId, {
        level: 'info',
        icon: '👥',
        message: `Found ${totalContactsInserted} employee contacts`
      });
    }

    if (totalSocialProfilesInserted > 0) {
      await logProgress(supabaseClient, jobId, {
        level: 'info',
        icon: '🔗',
        message: `Enriched ${totalSocialProfilesInserted} social media profiles`
      });
    }

    await supabaseClient
      .from('campaigns')
      .update({
        total_leads: totalLeadsInserted,
        scraping_status: 'completed',
      })
      .eq('id', campaignId);

    await supabaseClient.from('agent_jobs').update({
      progress_percentage: 75,
      completed_steps: 3
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'loading',
      icon: '🎯',
      message: 'Preparing leads for email outreach...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await supabaseClient
      .from('agent_jobs')
      .update({
        status: 'completed',
        progress_percentage: 100,
        completed_steps: 4,
        result_data: {
          campaign_name: campaign?.name || 'Campaign',
          leadsFound: totalLeadsInserted,
          emailsGenerated: 0,
          emailsSent: 0
        },
      })
      .eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'success',
      icon: '🎉',
      message: `Agent completed successfully! ${totalLeadsInserted} leads ready for outreach`
    });

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        leadsFound: totalLeadsInserted,
        contactsFound: totalContactsInserted,
        socialProfilesFound: totalSocialProfilesInserted,
        reviewsScraped: totalReviewsInserted,
        imagesScraped: totalImagesInserted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Scraping error:', error);

    if (supabaseClient && jobId) {
      await supabaseClient
        .from('agent_jobs')
        .update({
          status: 'failed',
          error_message: error.message || 'Failed to scrape leads'
        })
        .eq('id', jobId);

      await logProgress(supabaseClient, jobId, {
        level: 'error',
        icon: '❌',
        message: `Error: ${error.message || 'Failed to scrape leads'}`
      });
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Failed to scrape leads' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function scrapeGoogleMapsWithApify(
  niche: string,
  location: string,
  settings: ApifySettings,
  supabaseClient: any,
  jobId: string
): Promise<ApifyPlace[]> {
  const apiToken = Deno.env.get('APIFY_API_TOKEN');
  if (!apiToken) {
    throw new Error('APIFY_API_TOKEN is not configured. Please set it in your environment variables.');
  }

  const actorId = 'compass/crawler-google-places';

  const input: ApifySettings = {
    searchStringsArray: settings.searchStringsArray || [niche],
    locationQuery: settings.locationQuery || location,
    maxCrawledPlacesPerSearch: settings.maxCrawledPlacesPerSearch || 50,
    language: settings.language || 'en',
    searchMatching: settings.searchMatching || 'all',
    placeMinimumStars: settings.placeMinimumStars || '',
    website: settings.website || 'allPlaces',
    skipClosedPlaces: settings.skipClosedPlaces || false,
    scrapePlaceDetailPage: settings.scrapePlaceDetailPage || false,
    scrapeTableReservationProvider: settings.scrapeTableReservationProvider || false,
    includeWebResults: settings.includeWebResults || false,
    scrapeDirectories: settings.scrapeDirectories || false,
    maxQuestions: settings.maxQuestions || 0,
    scrapeContacts: settings.scrapeContacts || false,
    scrapeSocialMediaProfiles: settings.scrapeSocialMediaProfiles || {
      facebooks: false,
      instagrams: false,
      youtubes: false,
      tiktoks: false,
      twitters: false,
    },
    maximumLeadsEnrichmentRecords: settings.maximumLeadsEnrichmentRecords || 0,
    leadsEnrichmentDepartments: settings.leadsEnrichmentDepartments || [],
    maxReviews: settings.maxReviews || 0,
    reviewsStartDate: settings.reviewsStartDate,
    reviewsSort: settings.reviewsSort || 'newest',
    reviewsFilterString: settings.reviewsFilterString || '',
    reviewsOrigin: settings.reviewsOrigin || 'all',
    scrapeReviewsPersonalData: settings.scrapeReviewsPersonalData !== false,
    maxImages: settings.maxImages || 0,
    scrapeImageAuthors: settings.scrapeImageAuthors || false,
    countryCode: settings.countryCode,
    city: settings.city,
    state: settings.state,
    county: settings.county,
    postalCode: settings.postalCode,
    customGeolocation: settings.customGeolocation,
    startUrls: settings.startUrls,
    placeIds: settings.placeIds,
    categoryFilterWords: settings.categoryFilterWords || [],
    allPlacesNoSearchAction: settings.allPlacesNoSearchAction || '',
  };

  console.log('Starting Apify actor run with settings:', JSON.stringify(input, null, 2));

  await logProgress(supabaseClient, jobId, {
    level: 'info',
    icon: '🚀',
    message: 'Launching Apify Google Maps crawler...'
  });

  const startResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apiToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    throw new Error(`Failed to start Apify actor: ${startResponse.status} - ${errorText}`);
  }

  const runData = await startResponse.json();
  const runId = runData.data.id;
  const defaultDatasetId = runData.data.defaultDatasetId;

  console.log(`Actor run started with ID: ${runId}`);

  await logProgress(supabaseClient, jobId, {
    level: 'loading',
    icon: '⏳',
    message: 'Crawler is running, searching Google Maps...'
  });

  let status = 'RUNNING';
  let attempts = 0;
  const maxAttempts = 120;

  while (status === 'RUNNING' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const statusResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${apiToken}`);

    if (!statusResponse.ok) {
      throw new Error(`Failed to check run status: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();
    status = statusData.data.status;
    attempts++;

    if (attempts % 4 === 0) {
      await logProgress(supabaseClient, jobId, {
        level: 'info',
        icon: '🔄',
        message: `Still searching... (${attempts * 5} seconds elapsed)`
      });
    }

    console.log(`Run status: ${status} (attempt ${attempts}/${maxAttempts})`);
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Actor run did not succeed. Final status: ${status}`);
  }

  console.log('Fetching results from dataset...');
  const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apiToken}`);

  if (!datasetResponse.ok) {
    throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`);
  }

  const places: ApifyPlace[] = await datasetResponse.json();
  console.log(`Found ${places.length} places from Apify`);

  return places;
}

function extractEmailFromPlace(place: ApifyPlace): string {
  if (place.website) {
    const domain = place.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    return `contact@${domain}`;
  }

  if (place.title) {
    const slug = place.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 30);
    return `info@${slug}.com`;
  }

  return `contact@business.com`;
}

function determineEmailType(email: string, website?: string): 'personal' | 'generic' | 'unknown' {
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const emailDomain = email.split('@')[1]?.toLowerCase();

  if (personalDomains.includes(emailDomain)) {
    return 'personal';
  }

  if (website && emailDomain) {
    const websiteDomain = website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
    if (emailDomain.includes(websiteDomain) || websiteDomain.includes(emailDomain)) {
      return 'generic';
    }
  }

  return 'unknown';
}
