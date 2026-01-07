import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, Sparkles, FileText, Eye, Store, Wand2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import AIPromptBuilder from '../components/AIPromptBuilder';
import AIQualityAnalyzer from '../components/AIQualityAnalyzer';
import AIWritingAssistant from '../components/AIWritingAssistant';
import AITemplateMarketplace from '../components/AITemplateMarketplace';
import AIPreviewGenerator from '../components/AIPreviewGenerator';
import { extractVariables } from '../lib/ai-utils';
import type { Database } from '../types/database';

type GmailAccount = Database['public']['Tables']['gmail_accounts']['Row'];

type TabType = 'builder' | 'preview' | 'assistant' | 'marketplace' | 'analytics';

export default function CreateTemplatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('builder');
  const [emailType, setEmailType] = useState<'manual' | 'ai'>('ai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    pitch: '',
    subject: '',
    body: '',
    aiPrompt: '',
    tone: 'professional',
    emailGoal: 'cold_outreach',
    industry: '',
    targetAudience: 'owner',
    personalizationLevel: 'medium'
  });

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      const { data } = await supabase
        .from('gmail_accounts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true);

      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (emailType === 'manual' && (!formData.subject.trim() || !formData.body.trim())) {
      toast.error('Please fill in subject and body for manual templates');
      return;
    }

    if (emailType === 'ai' && !formData.aiPrompt.trim()) {
      toast.error('Please enter an AI prompt');
      return;
    }

    setIsSubmitting(true);

    try {
      let variables: string[] = [];

      if (emailType === 'ai') {
        variables = extractVariables(formData.aiPrompt);
        if (formData.pitch) {
          variables = [...new Set([...variables, ...extractVariables(formData.pitch)])];
        }
      } else {
        variables = [
          ...extractVariables(formData.subject),
          ...extractVariables(formData.body)
        ];
        if (formData.pitch) {
          variables = [...new Set([...variables, ...extractVariables(formData.pitch)])];
        }
      }

      const templateData: any = {
        user_id: user!.id,
        name: formData.name,
        template_type: emailType,
        pitch: formData.pitch || null,
        tone: formData.tone,
        email_goal: formData.emailGoal,
        industry: formData.industry || null,
        target_audience: formData.targetAudience,
        personalization_level: formData.personalizationLevel,
        variables: variables
      };

      if (emailType === 'manual') {
        templateData.subject = formData.subject;
        templateData.body = formData.body;
      } else {
        templateData.ai_prompt = formData.aiPrompt;
        templateData.subject = '';
        templateData.body = '';
      }

      const { error } = await supabase
        .from('email_templates')
        .insert(templateData);

      if (error) throw error;

      toast.success('Template created successfully');
      navigate('/dashboard/templates');
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error(error.message || 'Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarketplaceTemplateUse = (template: any) => {
    setFormData({
      ...formData,
      name: template.name,
      aiPrompt: template.prompt_text,
      tone: template.tone,
      emailGoal: template.category,
      industry: template.industry || '',
      personalizationLevel: 'high'
    });
    setEmailType('ai');
    setActiveTab('builder');
  };

  const tabs = [
    { id: 'builder' as TabType, label: 'AI Builder', icon: Sparkles, desc: 'Build your AI prompt' },
    { id: 'preview' as TabType, label: 'Preview', icon: Eye, desc: 'Test AI generation' },
    { id: 'assistant' as TabType, label: 'Writing Assistant', icon: Wand2, desc: 'AI writing tools' },
    { id: 'marketplace' as TabType, label: 'Marketplace', icon: Store, desc: 'Browse templates' },
    { id: 'analytics' as TabType, label: 'Quality Check', icon: BarChart3, desc: 'Analyze quality' }
  ];

  return (
    <div className="min-h-screen bg-amber-50/30">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 border-b border-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard/templates')}
            className="flex items-center space-x-2 text-amber-50 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Templates</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Create AI-Powered Template</h1>
              <p className="text-amber-50">Build intelligent email templates with advanced AI customization</p>
            </div>
            <div className="hidden md:block">
              <div className="flex gap-2">
                <button
                  onClick={() => setEmailType('ai')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    emailType === 'ai'
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  AI Template
                </button>
                <button
                  onClick={() => setEmailType('manual')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    emailType === 'manual'
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Manual Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {emailType === 'ai' && (
        <div className="bg-white border-b border-amber-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600 bg-amber-50'
                      : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-amber-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {emailType === 'manual' ? (
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
                    placeholder="Enter template name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
                    placeholder="Enter email subject"
                    required={emailType === 'manual'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 font-mono text-sm"
                    placeholder="Write your email body..."
                    required={emailType === 'manual'}
                  />
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'builder' && (
                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-8">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Template Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
                        placeholder="Enter template name"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Your Pitch (Optional)
                      </label>
                      <textarea
                        value={formData.pitch}
                        onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
                        placeholder="Define your value proposition that AI can reference"
                      />
                    </div>

                    <AIPromptBuilder
                      value={formData.aiPrompt}
                      onChange={(value) => setFormData({ ...formData, aiPrompt: value })}
                      onToneChange={(tone) => setFormData({ ...formData, tone })}
                      onGoalChange={(goal) => setFormData({ ...formData, emailGoal: goal })}
                      onIndustryChange={(industry) => setFormData({ ...formData, industry })}
                      onAudienceChange={(audience) => setFormData({ ...formData, targetAudience: audience })}
                    />
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-8">
                    <AIPreviewGenerator
                      prompt={formData.aiPrompt}
                      tone={formData.tone}
                      goal={formData.emailGoal}
                      industry={formData.industry}
                    />
                  </div>
                )}

                {activeTab === 'assistant' && (
                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-8">
                    <AIWritingAssistant
                      tone={formData.tone}
                      goal={formData.emailGoal}
                      industry={formData.industry}
                      onInsert={(content) => {
                        setFormData({
                          ...formData,
                          aiPrompt: formData.aiPrompt + '\n\n' + content
                        });
                      }}
                    />
                  </div>
                )}

                {activeTab === 'marketplace' && (
                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-8">
                    <AITemplateMarketplace onUseTemplate={handleMarketplaceTemplateUse} />
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-8">
                    <AIQualityAnalyzer
                      prompt={formData.aiPrompt}
                      tone={formData.tone}
                      goal={formData.emailGoal}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 sticky top-6">
              <h3 className="font-semibold text-stone-800 mb-4">Template Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Template Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEmailType('ai')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        emailType === 'ai'
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                          : 'bg-amber-50 text-stone-700 hover:bg-amber-100'
                      }`}
                    >
                      AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailType('manual')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        emailType === 'manual'
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                          : 'bg-amber-50 text-stone-700 hover:bg-amber-100'
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {emailType === 'ai' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Tone
                      </label>
                      <div className="px-3 py-2 bg-amber-50 rounded-lg text-sm capitalize text-stone-700">
                        {formData.tone}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Goal
                      </label>
                      <div className="px-3 py-2 bg-amber-50 rounded-lg text-sm capitalize text-stone-700">
                        {formData.emailGoal.replace('_', ' ')}
                      </div>
                    </div>

                    {formData.industry && (
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Industry
                        </label>
                        <div className="px-3 py-2 bg-amber-50 rounded-lg text-sm text-stone-700">
                          {formData.industry}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Personalization Level
                      </label>
                      <select
                        value={formData.personalizationLevel}
                        onChange={(e) => setFormData({ ...formData, personalizationLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-amber-200">
                  <h4 className="text-sm font-medium text-stone-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    {emailType === 'ai' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveTab('preview')}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Preview AI Emails
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('analytics')}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-amber-50 text-orange-700 rounded-lg hover:bg-amber-100 transition-colors text-sm"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Check Quality
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-amber-200 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/templates')}
                  className="w-full px-4 py-3 bg-amber-50 text-stone-700 rounded-lg font-medium hover:bg-amber-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Create Template
                    </>
                  )}
                </button>
              </div>
            </div>

            {emailType === 'ai' && formData.aiPrompt && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-stone-800 mb-2">Next Steps</h4>
                <ul className="space-y-2 text-sm text-stone-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">1.</span>
                    <span>Preview your AI-generated emails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">2.</span>
                    <span>Check quality score and suggestions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">3.</span>
                    <span>Fine-tune your prompt if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">4.</span>
                    <span>Save and use in campaigns</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
