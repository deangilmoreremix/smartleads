import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, MapPin, Target, Mail, ArrowRight, Wand2 } from 'lucide-react';
import ApifyAdvancedSettings from '../components/ApifyAdvancedSettings';

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

export default function NewCampaignPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'prompt' | 'details'>('prompt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [apifySettings, setApifySettings] = useState<ApifySettings>({
    maxCrawledPlacesPerSearch: 50,
    language: 'en',
    searchMatching: 'all',
    placeMinimumStars: '',
    website: 'allPlaces',
    skipClosedPlaces: false,
    scrapePlaceDetailPage: false,
    scrapeContacts: false,
    scrapeSocialMediaProfiles: {
      facebooks: false,
      instagrams: false,
      youtubes: false,
      tiktoks: false,
      twitters: false,
    },
    maximumLeadsEnrichmentRecords: 0,
    maxReviews: 0,
    reviewsSort: 'newest',
    maxImages: 0,
    maxQuestions: 0,
    categoryFilterWords: [],
  });

  const examplePrompts = [
    'Email restaurant founders in NYC about delivery optimization',
    'Cold outreach to gym owners in London for fitness app',
    'Contact dental clinic CEOs in LA about patient management',
    'Reach real estate agents in Dubai for CRM solution',
    'Connect with auto repair shop owners in Toronto'
  ];

  const handleAIPrompt = () => {
    const prompt = aiPrompt.toLowerCase();

    if (prompt.includes('restaurant') || prompt.includes('food')) {
      setNiche('Restaurants');
    } else if (prompt.includes('gym') || prompt.includes('fitness')) {
      setNiche('Gyms & Fitness Centers');
    } else if (prompt.includes('dental') || prompt.includes('dentist')) {
      setNiche('Dental Clinics');
    } else if (prompt.includes('real estate') || prompt.includes('realtor')) {
      setNiche('Real Estate');
    } else if (prompt.includes('auto') || prompt.includes('car') || prompt.includes('repair')) {
      setNiche('Auto Repair Shops');
    }

    const cities = ['NYC', 'New York', 'London', 'LA', 'Los Angeles', 'Dubai', 'Toronto', 'Chicago', 'San Francisco'];
    for (const city of cities) {
      if (prompt.includes(city.toLowerCase())) {
        setLocation(city === 'NYC' ? 'New York, NY' : city === 'LA' ? 'Los Angeles, CA' : city);
        break;
      }
    }

    setCampaignName(`${niche || 'Business'} Outreach - ${location || 'Location'}`);
    setStep('details');
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert({
          user_id: user!.id,
          name: campaignName,
          niche: niche,
          location: location,
          ai_prompt: aiPrompt || null,
          email_template: emailTemplate || null,
          apify_settings: apifySettings,
          status: 'draft'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/dashboard/campaigns/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Campaign</h1>
        <p className="text-slate-400">Use AI to generate your campaign or create manually</p>
      </div>

      {step === 'prompt' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Campaign Generator</h2>
              <p className="text-slate-400 text-sm">Describe your outreach goal in plain English</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: Email restaurant founders in NYC about delivery optimization software"
                className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-4 py-4 pr-16 focus:outline-none focus:border-blue-500 transition min-h-[120px] resize-none"
              />
              <button
                onClick={handleAIPrompt}
                disabled={!aiPrompt.trim()}
                className="absolute right-3 bottom-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Include your target niche, location, and what you're offering for best results
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Example prompts:</h3>
            <div className="space-y-2">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setAiPrompt(prompt)}
                  className="block w-full text-left text-sm text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 px-4 py-3 rounded-lg border border-slate-600 hover:border-blue-500/50 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 border-t border-slate-600"></div>
            <span className="text-slate-500 text-sm">or</span>
            <div className="flex-1 border-t border-slate-600"></div>
          </div>

          <button
            onClick={() => setStep('details')}
            className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Create Manually
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateCampaign} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Campaign Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                  placeholder="My Outreach Campaign"
                  className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Target Niche
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    required
                    placeholder="e.g., Restaurants, Gyms, Real Estate"
                    className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g., New York, NY"
                    className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Template (Optional)
                </label>
                <textarea
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  placeholder="Hi {firstName},

I noticed {businessName} and wanted to reach out...

Variables: {firstName}, {businessName}, {location}"
                  className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition min-h-[200px] resize-none"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Leave empty to let AI generate personalized emails for each prospect
                </p>
              </div>
            </div>
          </div>

          <ApifyAdvancedSettings
            settings={apifySettings}
            onChange={setApifySettings}
          />

          {aiPrompt && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-400 mb-1">AI Prompt</h3>
                  <p className="text-sm text-slate-300">{aiPrompt}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setStep('prompt')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Creating...' : 'Create Campaign'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
