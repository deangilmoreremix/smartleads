import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Globe, Users, DollarSign, Zap } from 'lucide-react';

export interface RtrvrSettings {
  maxLeads: number;
  enableWebsiteEnrichment: boolean;
  enableSocialExtraction: boolean;
  enableAiExtraction: boolean;
  scrapingThoroughness: 'quick' | 'standard' | 'deep';
  extractContacts: boolean;
  extractReviews: boolean;
  maxReviews: number;
}

interface Props {
  settings: RtrvrSettings;
  onChange: (settings: RtrvrSettings) => void;
}

const defaultSettings: RtrvrSettings = {
  maxLeads: 50,
  enableWebsiteEnrichment: true,
  enableSocialExtraction: true,
  enableAiExtraction: true,
  scrapingThoroughness: 'standard',
  extractContacts: true,
  extractReviews: false,
  maxReviews: 5,
};

function estimateCost(settings: RtrvrSettings): { rtrvr: number; openai: number; total: number } {
  const basePerPage = 0.001;
  const enrichmentPerPage = 0.0005;
  const openaiPerLead = 0.002;

  let rtrvrCost = settings.maxLeads * basePerPage;

  if (settings.scrapingThoroughness !== 'quick') {
    rtrvrCost += settings.maxLeads * basePerPage;
  }

  if (settings.enableWebsiteEnrichment) {
    rtrvrCost += settings.maxLeads * enrichmentPerPage * 0.7;
  }

  let openaiCost = 0;
  if (settings.enableAiExtraction) {
    openaiCost = settings.maxLeads * openaiPerLead;
    if (settings.enableWebsiteEnrichment) {
      openaiCost += settings.maxLeads * openaiPerLead * 0.5;
    }
  }

  return {
    rtrvr: rtrvrCost,
    openai: openaiCost,
    total: rtrvrCost + openaiCost,
  };
}

export default function RtrvrScrapingSettings({ settings = defaultSettings, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const mergedSettings = { ...defaultSettings, ...settings };

  const updateSettings = (updates: Partial<RtrvrSettings>) => {
    onChange({ ...mergedSettings, ...updates });
  };

  const costs = estimateCost(mergedSettings);

  return (
    <div className="bg-white border border-teal-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-teal-50/50 transition"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-stone-800">AI-Powered Scraping Settings</h3>
            <p className="text-sm text-stone-500">rtrvr.ai + GPT-5.2 intelligent extraction</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-stone-500">Est. Cost</p>
            <p className="text-sm font-semibold text-teal-600">${costs.total.toFixed(2)}</p>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 pt-0 space-y-6">
          <div className="border-t border-teal-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-stone-700">Leads to Scrape</h4>
              <span className="text-lg font-bold text-teal-600">{mergedSettings.maxLeads}</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={mergedSettings.maxLeads}
              onChange={(e) => updateSettings({ maxLeads: parseInt(e.target.value) })}
              className="w-full h-2 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-stone-500 mt-1">
              <span>10</span>
              <span>100</span>
              <span>200</span>
            </div>
          </div>

          <div className="border-t border-teal-200 pt-6">
            <h4 className="text-sm font-semibold text-stone-700 mb-4">Scraping Thoroughness</h4>
            <div className="grid grid-cols-3 gap-3">
              {(['quick', 'standard', 'deep'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateSettings({ scrapingThoroughness: level })}
                  className={`p-4 rounded-xl border-2 transition ${
                    mergedSettings.scrapingThoroughness === level
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-stone-200 bg-white hover:border-teal-300'
                  }`}
                >
                  <div className="text-center">
                    <Zap className={`w-5 h-5 mx-auto mb-2 ${
                      mergedSettings.scrapingThoroughness === level ? 'text-teal-500' : 'text-stone-400'
                    }`} />
                    <p className={`text-sm font-medium capitalize ${
                      mergedSettings.scrapingThoroughness === level ? 'text-teal-700' : 'text-stone-600'
                    }`}>
                      {level}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {level === 'quick' && 'Basic info only'}
                      {level === 'standard' && 'Full details'}
                      {level === 'deep' && 'Max enrichment'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-teal-200 pt-6">
            <h4 className="text-sm font-semibold text-stone-700 mb-4">AI & Enrichment Features</h4>
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={mergedSettings.enableAiExtraction}
                  onChange={(e) => updateSettings({ enableAiExtraction: e.target.checked })}
                  className="w-5 h-5 mt-0.5 rounded border-teal-300 bg-teal-50/50 text-teal-500 focus:ring-2 focus:ring-teal-200"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-teal-500" />
                    <span className="text-sm font-medium text-stone-700 group-hover:text-teal-600">GPT-5.2 Intelligent Extraction</span>
                    <span className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">Recommended</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Uses AI to understand page structure and extract accurate business data. Handles layout variations automatically.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={mergedSettings.enableWebsiteEnrichment}
                  onChange={(e) => updateSettings({ enableWebsiteEnrichment: e.target.checked })}
                  className="w-5 h-5 mt-0.5 rounded border-teal-300 bg-teal-50/50 text-teal-500 focus:ring-2 focus:ring-teal-200"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-medium text-stone-700 group-hover:text-teal-600">Website Contact Enrichment</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Visits business websites to find real email addresses, phone numbers, and team member contacts.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={mergedSettings.enableSocialExtraction}
                  onChange={(e) => updateSettings({ enableSocialExtraction: e.target.checked })}
                  className="w-5 h-5 mt-0.5 rounded border-teal-300 bg-teal-50/50 text-teal-500 focus:ring-2 focus:ring-teal-200"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-stone-700 group-hover:text-teal-600">Social Media Profile Extraction</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Extracts Facebook, Instagram, LinkedIn, Twitter, TikTok, and YouTube profiles from websites.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={mergedSettings.extractContacts}
                  onChange={(e) => updateSettings({ extractContacts: e.target.checked })}
                  className="w-5 h-5 mt-0.5 rounded border-teal-300 bg-teal-50/50 text-teal-500 focus:ring-2 focus:ring-teal-200"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-stone-700 group-hover:text-teal-600">Extract Team Members & Decision Makers</span>
                  <p className="text-xs text-stone-500 mt-1">
                    Identifies key personnel from About/Team pages with their roles and contact info.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-teal-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-stone-700">Review Extraction</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergedSettings.extractReviews}
                  onChange={(e) => updateSettings({ extractReviews: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>
            {mergedSettings.extractReviews && (
              <div className="bg-teal-50/50 rounded-lg p-4">
                <label className="block text-sm text-stone-600 mb-2">Reviews per business</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={mergedSettings.maxReviews}
                  onChange={(e) => updateSettings({ maxReviews: parseInt(e.target.value) || 5 })}
                  className="w-full bg-white text-stone-800 border border-teal-200 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-5">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-teal-600 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-stone-700 mb-2">Estimated Cost Breakdown</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">rtrvr.ai scraping:</span>
                    <span className="font-medium text-stone-700">${costs.rtrvr.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">GPT-5.2 extraction:</span>
                    <span className="font-medium text-stone-700">${costs.openai.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-teal-200 mt-2">
                    <span className="font-semibold text-stone-700">Total estimated:</span>
                    <span className="font-bold text-teal-600">${costs.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    ~${(costs.total / mergedSettings.maxLeads).toFixed(4)} per lead
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
