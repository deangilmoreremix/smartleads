import { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Target, Users, Building2, ChevronDown, ChevronUp } from 'lucide-react';

interface AIPromptBuilderProps {
  value: string;
  onChange: (value: string) => void;
  onToneChange?: (tone: string) => void;
  onGoalChange?: (goal: string) => void;
  onIndustryChange?: (industry: string) => void;
  onAudienceChange?: (audience: string) => void;
}

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Formal and business-oriented' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', desc: 'Relaxed and conversational' },
  { value: 'persuasive', label: 'Persuasive', desc: 'Compelling and convincing' },
  { value: 'authoritative', label: 'Authoritative', desc: 'Expert and confident' },
  { value: 'empathetic', label: 'Empathetic', desc: 'Understanding and supportive' },
  { value: 'urgent', label: 'Urgent', desc: 'Time-sensitive and action-driven' },
  { value: 'consultative', label: 'Consultative', desc: 'Advisory and helpful' }
];

const EMAIL_GOALS = [
  { value: 'cold_outreach', label: 'Cold Outreach', icon: '🎯', desc: 'Initial contact with prospects' },
  { value: 'follow_up', label: 'Follow-Up', icon: '🔄', desc: 'Re-engage previous contacts' },
  { value: 'meeting_request', label: 'Meeting Request', icon: '📅', desc: 'Schedule a meeting or call' },
  { value: 'value_proposition', label: 'Value Proposition', icon: '💎', desc: 'Present your offering' },
  { value: 're_engagement', label: 'Re-engagement', icon: '🔥', desc: 'Win back inactive contacts' },
  { value: 'introduction', label: 'Introduction', icon: '👋', desc: 'Introduce yourself or service' }
];

const INDUSTRIES = [
  'Restaurants', 'Real Estate', 'Healthcare', 'Legal Services', 'Automotive',
  'Retail', 'Technology', 'Financial Services', 'Construction', 'Education',
  'Hospitality', 'Manufacturing', 'Marketing & Advertising', 'E-commerce',
  'SaaS', 'Consulting', 'Fitness & Wellness', 'Home Services', 'Insurance',
  'Entertainment', 'Transportation', 'Professional Services', 'Non-Profit'
];

const TARGET_AUDIENCES = [
  { value: 'owner', label: 'Business Owner' },
  { value: 'ceo', label: 'CEO/Executive' },
  { value: 'manager', label: 'Manager' },
  { value: 'marketing', label: 'Marketing Director' },
  { value: 'sales', label: 'Sales Director' },
  { value: 'it', label: 'IT Director' },
  { value: 'hr', label: 'HR Director' },
  { value: 'finance', label: 'Finance Director' },
  { value: 'operations', label: 'Operations Manager' }
];

const PROMPT_MODES = [
  { value: 'simple', label: 'Simple', desc: 'Guided builder for beginners' },
  { value: 'standard', label: 'Standard', desc: 'Balanced control and guidance' },
  { value: 'advanced', label: 'Advanced', desc: 'Full control for power users' }
];

export default function AIPromptBuilder({
  value,
  onChange,
  onToneChange,
  onGoalChange,
  onIndustryChange,
  onAudienceChange
}: AIPromptBuilderProps) {
  const [mode, setMode] = useState<'simple' | 'standard' | 'advanced'>('standard');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedGoal, setSelectedGoal] = useState('cold_outreach');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('owner');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [emailLength, setEmailLength] = useState('medium');
  const [personalizationLevel, setPersonalizationLevel] = useState('medium');

  useEffect(() => {
    if (mode === 'simple') {
      generateSimplePrompt();
    }
  }, [selectedTone, selectedGoal, selectedIndustry, selectedAudience, customInstructions, emailLength, personalizationLevel, mode]);

  const generateSimplePrompt = () => {
    if (mode !== 'simple') return;

    const prompt = `Write a ${selectedTone} email for ${selectedGoal.replace('_', ' ')}${selectedIndustry ? ` targeting the ${selectedIndustry} industry` : ''}. The email should be directed at a ${TARGET_AUDIENCES.find(a => a.value === selectedAudience)?.label}.

Key requirements:
- Keep it concise and engaging (${emailLength === 'short' ? '50-100 words' : emailLength === 'medium' ? '100-200 words' : '200+ words'})
- Use personalization tokens like {{business_name}}, {{decision_maker_name}}, {{location}}
- Personalization level: ${personalizationLevel}
- Include a clear call-to-action
${customInstructions ? `\nAdditional requirements:\n${customInstructions}` : ''}
- Make it sound natural, not salesy`;

    onChange(prompt);
  };

  const handleToneChange = (tone: string) => {
    setSelectedTone(tone);
    onToneChange?.(tone);
  };

  const handleGoalChange = (goal: string) => {
    setSelectedGoal(goal);
    onGoalChange?.(goal);
  };

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry);
    onIndustryChange?.(industry);
  };

  const handleAudienceChange = (audience: string) => {
    setSelectedAudience(audience);
    onAudienceChange?.(audience);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-stone-800 mb-1">AI Prompt Builder</h3>
            <p className="text-sm text-stone-600">
              Configure how AI should generate personalized emails for each lead. The more specific you are, the better the results.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Builder Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PROMPT_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value as typeof mode)}
              className={`p-3 rounded-lg border-2 transition-all ${
                mode === m.value
                  ? 'border-orange-400 bg-amber-50'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="font-medium text-sm text-stone-800">{m.label}</div>
              <div className="text-xs text-stone-500 mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            <Target className="w-4 h-4 inline mr-1 text-stone-500" />
            Email Goal
          </label>
          <select
            value={selectedGoal}
            onChange={(e) => handleGoalChange(e.target.value)}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-amber-50/50"
          >
            {EMAIL_GOALS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.icon} {goal.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-500 mt-1">
            {EMAIL_GOALS.find(g => g.value === selectedGoal)?.desc}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            <Lightbulb className="w-4 h-4 inline mr-1 text-stone-500" />
            Tone
          </label>
          <select
            value={selectedTone}
            onChange={(e) => handleToneChange(e.target.value)}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-amber-50/50"
          >
            {TONES.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-500 mt-1">
            {TONES.find(t => t.value === selectedTone)?.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-1 text-stone-500" />
            Industry (Optional)
          </label>
          <select
            value={selectedIndustry}
            onChange={(e) => handleIndustryChange(e.target.value)}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-amber-50/50"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            <Users className="w-4 h-4 inline mr-1 text-stone-500" />
            Target Audience
          </label>
          <select
            value={selectedAudience}
            onChange={(e) => handleAudienceChange(e.target.value)}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-amber-50/50"
          >
            {TARGET_AUDIENCES.map((audience) => (
              <option key={audience.value} value={audience.value}>
                {audience.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mode !== 'simple' && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            AI Prompt Instructions
          </label>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe how AI should write your emails. Example: Write a friendly email introducing our digital marketing services. Mention specific benefits based on the business's Google reviews and emphasize how we've helped similar businesses increase their online presence..."
            rows={mode === 'advanced' ? 8 : 6}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-amber-50/50 resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-stone-500">
              Use variables like {'{{business_name}}'} {'{{location}}'} {'{{rating}}'}.
            </p>
            <p className="text-xs text-stone-500">
              {value.length} characters
            </p>
          </div>
        </div>
      )}

      {mode === 'advanced' && (
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Custom Instructions
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Additional instructions for AI behavior, style guidelines, or specific requirements..."
                  rows={3}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Email Length Preference
                </label>
                <select
                  value={emailLength}
                  onChange={(e) => setEmailLength(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-white"
                >
                  <option value="short">Short (50-100 words)</option>
                  <option value="medium">Medium (100-200 words)</option>
                  <option value="long">Long (200+ words)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Personalization Level
                </label>
                <select
                  value={personalizationLevel}
                  onChange={(e) => setPersonalizationLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-white"
                >
                  <option value="low">Low - Generic with basic personalization</option>
                  <option value="medium">Medium - Balanced personalization</option>
                  <option value="high">High - Maximum personalization</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-stone-700 mb-2">Available Variables</h4>
        <div className="flex flex-wrap gap-2">
          {['business_name', 'decision_maker_name', 'location', 'rating', 'review_count', 'website', 'phone'].map((variable) => (
            <code key={variable} className="px-2 py-1 bg-white border border-amber-200 rounded text-xs text-orange-600">
              {'{{'}{variable}{'}}'}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
