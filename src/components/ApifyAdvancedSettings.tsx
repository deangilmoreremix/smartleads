import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ApifySettings {
  maxCrawledPlacesPerSearch?: number;
  language?: string;
  searchMatching?: 'all' | 'only_includes' | 'only_exact';
  placeMinimumStars?: '' | 'two' | 'twoAndHalf' | 'three' | 'threeAndHalf' | 'four' | 'fourAndHalf';
  website?: 'allPlaces' | 'withWebsite' | 'withoutWebsite';
  skipClosedPlaces?: boolean;
  scrapePlaceDetailPage?: boolean;
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
  reviewsSort?: 'newest' | 'mostRelevant' | 'highestRanking' | 'lowestRanking';
  maxImages?: number;
  maxQuestions?: number;
  categoryFilterWords?: string[];
  countryCode?: string;
  city?: string;
  state?: string;
  county?: string;
  postalCode?: string;
}

interface Props {
  settings: ApifySettings;
  onChange: (settings: ApifySettings) => void;
}

export default function ApifyAdvancedSettings({ settings, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const updateSettings = (updates: Partial<ApifySettings>) => {
    onChange({ ...settings, ...updates });
  };

  const updateSocialProfiles = (platform: string, enabled: boolean) => {
    onChange({
      ...settings,
      scrapeSocialMediaProfiles: {
        ...settings.scrapeSocialMediaProfiles,
        [`${platform}s`]: enabled,
      },
    });
  };

  return (
    <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-amber-50/50 transition"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-stone-800">Advanced Scraping Options</h3>
            <p className="text-sm text-stone-500">Configure filters, enrichment, and data collection</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-stone-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-stone-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-6 pt-0 space-y-6">
          <div className="border-t border-amber-200 pt-6">
            <h4 className="text-sm font-semibold text-stone-700 mb-4">Basic Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Max Results Per Search
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={settings.maxCrawledPlacesPerSearch || 50}
                  onChange={(e) => updateSettings({ maxCrawledPlacesPerSearch: parseInt(e.target.value) })}
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={settings.placeMinimumStars || ''}
                  onChange={(e) => updateSettings({ placeMinimumStars: e.target.value as any })}
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Any Rating</option>
                  <option value="two">2+ Stars</option>
                  <option value="twoAndHalf">2.5+ Stars</option>
                  <option value="three">3+ Stars</option>
                  <option value="threeAndHalf">3.5+ Stars</option>
                  <option value="four">4+ Stars</option>
                  <option value="fourAndHalf">4.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Website Filter
                </label>
                <select
                  value={settings.website || 'allPlaces'}
                  onChange={(e) => updateSettings({ website: e.target.value as any })}
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="allPlaces">All Places</option>
                  <option value="withWebsite">With Website Only</option>
                  <option value="withoutWebsite">Without Website</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Search Matching
                </label>
                <select
                  value={settings.searchMatching || 'all'}
                  onChange={(e) => updateSettings({ searchMatching: e.target.value as any })}
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="all">All Results</option>
                  <option value="only_includes">Name Includes Search Term</option>
                  <option value="only_exact">Exact Name Match</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-3 text-sm text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.skipClosedPlaces || false}
                  onChange={(e) => updateSettings({ skipClosedPlaces: e.target.checked })}
                  className="w-4 h-4 rounded border-amber-300 bg-amber-50/50 text-orange-500 focus:ring-2 focus:ring-orange-200"
                />
                <span>Skip Closed Places</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-3 text-sm text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.scrapePlaceDetailPage || false}
                  onChange={(e) => updateSettings({ scrapePlaceDetailPage: e.target.checked })}
                  className="w-4 h-4 rounded border-amber-300 bg-amber-50/50 text-orange-500 focus:ring-2 focus:ring-orange-200"
                />
                <span>Scrape Detailed Place Info (opening hours, popular times, etc.)</span>
              </label>
              <p className="text-xs text-stone-500 ml-7 mt-1">Required for reviews, images, and Q&A extraction</p>
            </div>
          </div>

          <div className="border-t border-amber-200 pt-6">
            <h4 className="text-sm font-semibold text-stone-700 mb-4">Contact Enrichment ($$)</h4>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-3 text-sm text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.scrapeContacts || false}
                    onChange={(e) => updateSettings({ scrapeContacts: e.target.checked })}
                    className="w-4 h-4 rounded border-amber-300 bg-amber-50/50 text-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  <span className="font-medium">Extract Real Emails from Websites</span>
                </label>
                <p className="text-xs text-stone-500 ml-7 mt-1">$2 per 1,000 places with websites</p>
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Social Media Profile Enrichment
                </label>
                <div className="space-y-2 ml-4">
                  {['facebook', 'instagram', 'youtube', 'tiktok', 'twitter'].map((platform) => (
                    <label key={platform} className="flex items-center space-x-3 text-sm text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.scrapeSocialMediaProfiles?.[`${platform}s` as keyof typeof settings.scrapeSocialMediaProfiles] || false}
                        onChange={(e) => updateSocialProfiles(platform, e.target.checked)}
                        className="w-4 h-4 rounded border-amber-300 bg-amber-50/50 text-orange-500 focus:ring-2 focus:ring-orange-200"
                      />
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-stone-500 ml-4 mt-2">
                  Automatically enabled if "Extract Real Emails" is checked. Charged per profile found.
                </p>
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Employee Leads Per Place
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.maximumLeadsEnrichmentRecords || 0}
                  onChange={(e) => updateSettings({ maximumLeadsEnrichmentRecords: parseInt(e.target.value) })}
                  placeholder="0 = disabled"
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <p className="text-xs text-stone-500 mt-1">
                  Extract employee names, job titles, emails, LinkedIn profiles. Charged per lead found.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-200 pt-6">
            <h4 className="text-sm font-semibold text-stone-700 mb-4">Additional Data Collection</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Max Reviews
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={settings.maxReviews || 0}
                  onChange={(e) => updateSettings({ maxReviews: parseInt(e.target.value) })}
                  placeholder="0 = none"
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Max Images
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={settings.maxImages || 0}
                  onChange={(e) => updateSettings({ maxImages: parseInt(e.target.value) })}
                  placeholder="0 = none"
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Max Questions
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={settings.maxQuestions || 0}
                  onChange={(e) => updateSettings({ maxQuestions: parseInt(e.target.value) })}
                  placeholder="0 = none"
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {(settings.maxReviews || 0) > 0 && (
              <div className="mt-4">
                <label className="block text-sm text-stone-600 mb-2">
                  Review Sort Order
                </label>
                <select
                  value={settings.reviewsSort || 'newest'}
                  onChange={(e) => updateSettings({ reviewsSort: e.target.value as any })}
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="newest">Newest First</option>
                  <option value="mostRelevant">Most Relevant</option>
                  <option value="highestRanking">Highest Rating</option>
                  <option value="lowestRanking">Lowest Rating</option>
                </select>
              </div>
            )}
          </div>

          <div className="border-t border-amber-200 pt-6">
            <h4 className="text-sm font-semibold text-stone-700 mb-4">Location Refinement</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Country Code
                </label>
                <input
                  type="text"
                  value={settings.countryCode || ''}
                  onChange={(e) => updateSettings({ countryCode: e.target.value })}
                  placeholder="e.g., US, GB, CA"
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={settings.state || ''}
                  onChange={(e) => updateSettings({ state: e.target.value })}
                  placeholder="e.g., California, Texas"
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  County
                </label>
                <input
                  type="text"
                  value={settings.county || ''}
                  onChange={(e) => updateSettings({ county: e.target.value })}
                  placeholder="e.g., Los Angeles County"
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={settings.postalCode || ''}
                  onChange={(e) => updateSettings({ postalCode: e.target.value })}
                  placeholder="e.g., 90210"
                  className="w-full bg-amber-50/50 text-stone-800 border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              These settings override the main location field for more precise targeting
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-stone-700">
              <strong>Cost Note:</strong> Advanced features like contact enrichment, social profiles, and employee leads
              incur additional charges based on Apify pricing. Basic scraping (~$0.20 per 1,000 results) is included in all plans.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
