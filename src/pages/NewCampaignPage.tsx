import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import {
  Sparkles,
  MapPin,
  Target,
  Mail,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Check,
  ListOrdered
} from 'lucide-react';
import RtrvrScrapingSettings, { RtrvrSettings } from '../components/RtrvrScrapingSettings';
import { VisualSequenceBuilder, type SequenceStep } from '../components/messaging';
import toast from 'react-hot-toast';

type CampaignStep = 'prompt' | 'details' | 'sequence';

export default function NewCampaignPage() {
  const { user } = useAuth();
  const { state, activeTour, startTour, markMilestone } = useOnboarding();
  const navigate = useNavigate();
  const [step, setStep] = useState<CampaignStep>('prompt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([]);
  const [rtrvrSettings, setRtrvrSettings] = useState<RtrvrSettings>({
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

  const steps: { key: CampaignStep; label: string; icon: typeof Target }[] = [
    { key: 'prompt', label: 'AI Prompt', icon: Sparkles },
    { key: 'details', label: 'Details', icon: Target },
    { key: 'sequence', label: 'Sequence', icon: ListOrdered },
  ];

  useEffect(() => {
    if (!state.campaign_tour_completed && state.dashboard_tour_completed && !activeTour) {
      const timer = setTimeout(() => {
        startTour('campaign');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.campaign_tour_completed, state.dashboard_tour_completed, activeTour, startTour]);

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

  const handleCreateCampaign = async () => {
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
          rtrvr_settings: rtrvrSettings,
          status: 'draft'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setCreatedCampaignId(data.id);

      if (!state.first_campaign_created) {
        markMilestone('first_campaign_created');
      }

      setStep('sequence');
      toast.success('Campaign created! Now set up your email sequence.');
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipSequence = () => {
    if (createdCampaignId) {
      navigate(`/dashboard/campaigns/${createdCampaignId}`);
    }
  };

  const handleSequenceCreated = () => {
    toast.success('Email sequence saved!');
    if (createdCampaignId) {
      navigate(`/dashboard/campaigns/${createdCampaignId}`);
    }
  };

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === step);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto bg-amber-50/30 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Create New Campaign</h1>
        <p className="text-stone-500">Use AI to generate your campaign or create manually</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => {
            const currentIndex = getCurrentStepIndex();
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const StepIcon = s.icon;

            return (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      isCurrent ? 'text-amber-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 ${
                      index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === 'prompt' && (
        <div className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">AI Campaign Generator</h2>
              <p className="text-stone-500 text-sm">Describe your outreach goal in plain English</p>
            </div>
          </div>

          <div className="mb-6" data-tour="ai-prompt">
            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: Email restaurant founders in NYC about delivery optimization software"
                className="w-full bg-amber-50/50 text-stone-800 placeholder-stone-400 border border-amber-200 rounded-lg px-4 py-4 pr-16 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition min-h-[120px] resize-none"
              />
              <button
                onClick={handleAIPrompt}
                disabled={!aiPrompt.trim()}
                className="absolute right-3 bottom-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-2 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Include your target niche, location, and what you're offering for best results
            </p>
          </div>

          <div className="mb-6" data-tour="example-prompts">
            <h3 className="text-sm font-medium text-stone-700 mb-3">Example prompts:</h3>
            <div className="space-y-2">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setAiPrompt(prompt)}
                  className="block w-full text-left text-sm text-stone-600 hover:text-stone-800 bg-amber-50 hover:bg-amber-100 px-4 py-3 rounded-lg border border-amber-200 hover:border-orange-300 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 border-t border-amber-200"></div>
            <span className="text-stone-400 text-sm">or</span>
            <div className="flex-1 border-t border-amber-200"></div>
          </div>

          <button
            onClick={() => setStep('details')}
            className="mt-6 w-full bg-stone-100 hover:bg-stone-200 text-stone-700 px-6 py-3 rounded-lg font-medium transition border border-stone-200"
          >
            Create Manually
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm" data-tour="campaign-details">
            <h2 className="text-xl font-bold text-stone-800 mb-6">Campaign Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                  placeholder="My Outreach Campaign"
                  className="w-full bg-amber-50/50 text-stone-800 placeholder-stone-400 border border-amber-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2 text-stone-500" />
                    Target Niche
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    required
                    placeholder="e.g., Restaurants, Gyms, Real Estate"
                    className="w-full bg-amber-50/50 text-stone-800 placeholder-stone-400 border border-amber-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2 text-stone-500" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g., New York, NY"
                    className="w-full bg-amber-50/50 text-stone-800 placeholder-stone-400 border border-amber-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>
              </div>

              <div data-tour="email-template">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2 text-stone-500" />
                  Email Template (Optional)
                </label>
                <textarea
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  placeholder="Hi {firstName},

I noticed {businessName} and wanted to reach out...

Variables: {firstName}, {businessName}, {location}"
                  className="w-full bg-amber-50/50 text-stone-800 placeholder-stone-400 border border-amber-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition min-h-[200px] resize-none"
                />
                <p className="mt-2 text-xs text-stone-500">
                  Leave empty to let AI generate personalized emails for each prospect
                </p>
              </div>
            </div>
          </div>

          <div data-tour="scraping-settings">
            <RtrvrScrapingSettings
              settings={rtrvrSettings}
              onChange={setRtrvrSettings}
            />
          </div>

          {aiPrompt && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-700 mb-1">AI Prompt</h3>
                  <p className="text-sm text-stone-600">{aiPrompt}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setStep('prompt')}
              className="flex items-center space-x-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition border border-stone-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleCreateCampaign}
              disabled={loading || !campaignName || !niche || !location}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Creating...' : 'Continue to Email Sequence'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {step === 'sequence' && createdCampaignId && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Campaign Created!</h3>
                <p className="text-sm text-green-600">Now set up your email sequence for automated follow-ups</p>
              </div>
            </div>
          </div>

          <VisualSequenceBuilder
            campaignId={createdCampaignId}
            onSequenceCreated={handleSequenceCreated}
            onSequenceChange={setSequenceSteps}
          />

          <div className="flex items-center justify-between">
            <button
              onClick={handleSkipSequence}
              className="px-6 py-3 text-stone-600 hover:text-stone-800 transition"
            >
              Skip for now
            </button>
            <p className="text-sm text-stone-500">
              You can always set up your sequence later from the campaign page
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
