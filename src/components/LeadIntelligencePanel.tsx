import { useState, useEffect } from 'react';
import {
  Search, Brain, Globe, TrendingUp, Users, Zap, Shield,
  AlertTriangle, CheckCircle, Clock, DollarSign, Building,
  Mail, Phone, MapPin, ExternalLink, Briefcase, Target,
  BarChart3, Lightbulb, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface LeadResearch {
  id: string;
  main_services: Array<{ name: string; description?: string }>;
  unique_value_proposition: string | null;
  team_members: Array<{ name: string; role: string; email?: string }>;
  company_size_estimate: string | null;
  founding_year: number | null;
  tech_stack: string[];
  identified_pain_points: string[];
  conversation_starters: string[];
  decision_makers: Array<{ name: string; role: string; email?: string; linkedin?: string }>;
  research_depth: string;
  pages_analyzed: number;
  last_researched_at: string;
}

interface WebsiteHealth {
  id: string;
  overall_score: number;
  seo_score: number;
  security_score: number;
  performance_score: number;
  mobile_score: number;
  has_ssl: boolean;
  has_meta_title: boolean;
  has_meta_description: boolean;
  detected_cms: string | null;
  has_contact_form: boolean;
  has_live_chat: boolean;
  copyright_year: number | null;
  critical_issues: string[];
  improvement_opportunities: string[];
  conversion_potential: string;
  recommended_services: string[];
  last_checked_at: string;
}

interface IntentSignal {
  id: string;
  signal_type: string;
  signal_strength: string;
  title: string;
  description: string;
  source_url: string;
  relevance_score: number;
  matched_keywords: string[];
  detected_at: string;
  is_actionable: boolean;
}

interface Props {
  leadId: string;
  businessName: string;
  website: string | null;
  onClose?: () => void;
}

export default function LeadIntelligencePanel({ leadId, businessName, website, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'research' | 'health' | 'signals'>('research');
  const [research, setResearch] = useState<LeadResearch | null>(null);
  const [health, setHealth] = useState<WebsiteHealth | null>(null);
  const [signals, setSignals] = useState<IntentSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    services: true,
    team: false,
    painPoints: false,
    starters: true,
  });

  useEffect(() => {
    loadIntelligenceData();
  }, [leadId]);

  async function loadIntelligenceData() {
    setLoading(true);
    try {
      const [researchRes, healthRes, signalsRes] = await Promise.all([
        supabase.from('lead_research').select('*').eq('lead_id', leadId).maybeSingle(),
        supabase.from('website_health_scores').select('*').eq('lead_id', leadId).maybeSingle(),
        supabase.from('intent_signals').select('*').eq('lead_id', leadId).order('detected_at', { ascending: false }).limit(20),
      ]);

      if (researchRes.data) setResearch(researchRes.data);
      if (healthRes.data) setHealth(healthRes.data);
      if (signalsRes.data) setSignals(signalsRes.data);
    } catch (error) {
      console.error('Failed to load intelligence data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function runDeepResearch(depth: 'basic' | 'standard' | 'deep') {
    if (!website) {
      toast.error('Lead has no website to research');
      return;
    }

    setRunningJob('research');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deep-research-lead`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leadId, depth }),
        }
      );

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success(`Research complete! Cost: $${result.cost?.toFixed(4) || '0.00'}`);
      await loadIntelligenceData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Research failed');
    } finally {
      setRunningJob(null);
    }
  }

  async function runWebsiteHealthCheck() {
    if (!website) {
      toast.error('Lead has no website to analyze');
      return;
    }

    setRunningJob('health');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-website-health`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leadId }),
        }
      );

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success(`Health check complete! Score: ${result.health?.overall_score}/100`);
      await loadIntelligenceData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Health check failed');
    } finally {
      setRunningJob(null);
    }
  }

  async function runIntentSignalDetection() {
    setRunningJob('signals');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-intent-signals`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leadId }),
        }
      );

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success(`Found ${result.signals?.length || 0} buying signals!`);
      await loadIntelligenceData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signal detection failed');
    } finally {
      setRunningJob(null);
    }
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  }

  function getScoreBg(score: number): string {
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-red-100';
  }

  function getSignalIcon(type: string) {
    switch (type) {
      case 'job_posting':
      case 'hiring_surge':
        return <Briefcase className="w-4 h-4" />;
      case 'funding_announcement':
        return <DollarSign className="w-4 h-4" />;
      case 'expansion_news':
        return <TrendingUp className="w-4 h-4" />;
      case 'leadership_change':
        return <Users className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  }

  function getStrengthColor(strength: string): string {
    switch (strength) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading intelligence data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{businessName}</h2>
              <p className="text-sm text-slate-300">Lead Intelligence</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <span className="sr-only">Close</span>
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'research', label: 'Deep Research', icon: Search },
            { id: 'health', label: 'Website Health', icon: Globe },
            { id: 'signals', label: 'Intent Signals', icon: Target },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'research' && (
          <div className="space-y-6">
            {!research ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Research Data Yet</h3>
                <p className="text-gray-500 mb-6">Run deep research to discover insights about this business</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => runDeepResearch('basic')}
                    disabled={runningJob !== null}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => runDeepResearch('standard')}
                    disabled={runningJob !== null}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {runningJob === 'research' ? 'Researching...' : 'Standard'}
                  </button>
                  <button
                    onClick={() => runDeepResearch('deep')}
                    disabled={runningJob !== null}
                    className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
                  >
                    Deep
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {research.research_depth} research
                    </span>
                    <span className="text-sm text-gray-500">
                      {research.pages_analyzed} pages analyzed
                    </span>
                  </div>
                  <button
                    onClick={() => runDeepResearch('deep')}
                    disabled={runningJob !== null}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${runningJob === 'research' ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {research.unique_value_proposition && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Unique Value Proposition</h4>
                    <p className="text-sm text-blue-800">{research.unique_value_proposition}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  {research.company_size_estimate && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Building className="w-4 h-4" />
                        <span className="text-xs">Size</span>
                      </div>
                      <p className="font-medium text-gray-900 capitalize">{research.company_size_estimate}</p>
                    </div>
                  )}
                  {research.founding_year && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Founded</span>
                      </div>
                      <p className="font-medium text-gray-900">{research.founding_year}</p>
                    </div>
                  )}
                  {research.tech_stack.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs">Tech Stack</span>
                      </div>
                      <p className="font-medium text-gray-900">{research.tech_stack.length} technologies</p>
                    </div>
                  )}
                </div>

                {research.main_services.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('services')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-900">Services ({research.main_services.length})</span>
                      {expandedSections.services ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>
                    {expandedSections.services && (
                      <div className="p-4 space-y-3">
                        {research.main_services.map((service, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900">{service.name}</h5>
                            {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {research.decision_makers.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('team')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-900">Decision Makers ({research.decision_makers.length})</span>
                      {expandedSections.team ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>
                    {expandedSections.team && (
                      <div className="p-4 space-y-3">
                        {research.decision_makers.map((dm, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h5 className="font-medium text-gray-900">{dm.name}</h5>
                              <p className="text-sm text-gray-600">{dm.role}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {dm.email && (
                                <a href={`mailto:${dm.email}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                  <Mail className="w-4 h-4" />
                                </a>
                              )}
                              {dm.linkedin && (
                                <a href={dm.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {research.conversation_starters.length > 0 && (
                  <div className="border border-emerald-200 rounded-lg overflow-hidden bg-emerald-50/50">
                    <button
                      onClick={() => toggleSection('starters')}
                      className="w-full flex items-center justify-between p-4 bg-emerald-100/50 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-900">Conversation Starters</span>
                      </div>
                      {expandedSections.starters ? <ChevronUp className="w-5 h-5 text-emerald-600" /> : <ChevronDown className="w-5 h-5 text-emerald-600" />}
                    </button>
                    {expandedSections.starters && (
                      <div className="p-4 space-y-2">
                        {research.conversation_starters.map((starter, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              {i + 1}
                            </span>
                            <p className="text-sm text-gray-700">{starter}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {research.identified_pain_points.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('painPoints')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-900">Identified Pain Points ({research.identified_pain_points.length})</span>
                      {expandedSections.painPoints ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>
                    {expandedSections.painPoints && (
                      <div className="p-4 space-y-2">
                        {research.identified_pain_points.map((point, i) => (
                          <div key={i} className="flex items-start gap-2 p-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{point}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            {!health ? (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Data Yet</h3>
                <p className="text-gray-500 mb-6">Analyze the website to discover SEO issues and opportunities</p>
                <button
                  onClick={runWebsiteHealthCheck}
                  disabled={runningJob !== null || !website}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {runningJob === 'health' ? 'Analyzing...' : 'Run Health Check'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className={`text-center p-6 rounded-xl ${getScoreBg(health.overall_score)}`}>
                    <div className={`text-4xl font-bold ${getScoreColor(health.overall_score)}`}>
                      {health.overall_score}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Overall Score</div>
                  </div>
                  <button
                    onClick={runWebsiteHealthCheck}
                    disabled={runningJob !== null}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${runningJob === 'health' ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'SEO', score: health.seo_score },
                    { label: 'Security', score: health.security_score },
                    { label: 'Performance', score: health.performance_score },
                    { label: 'Mobile', score: health.mobile_score },
                  ].map(item => (
                    <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Checks</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'SSL Certificate', value: health.has_ssl },
                        { label: 'Meta Title', value: health.has_meta_title },
                        { label: 'Meta Description', value: health.has_meta_description },
                        { label: 'Contact Form', value: health.has_contact_form },
                        { label: 'Live Chat', value: health.has_live_chat },
                      ].map(check => (
                        <div key={check.label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{check.label}</span>
                          {check.value ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Details</h4>
                    <div className="space-y-2 text-sm">
                      {health.detected_cms && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">CMS</span>
                          <span className="font-medium">{health.detected_cms}</span>
                        </div>
                      )}
                      {health.copyright_year && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Copyright Year</span>
                          <span className="font-medium">{health.copyright_year}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversion Potential</span>
                        <span className={`font-medium capitalize ${
                          health.conversion_potential === 'very_high' ? 'text-emerald-600' :
                          health.conversion_potential === 'high' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {health.conversion_potential.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {health.critical_issues.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Critical Issues ({health.critical_issues.length})
                    </h4>
                    <ul className="space-y-2">
                      {health.critical_issues.map((issue, i) => (
                        <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                          <span className="text-red-400">-</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {health.recommended_services.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">Recommended Services to Pitch</h4>
                    <div className="flex flex-wrap gap-2">
                      {health.recommended_services.map((service, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Buying Signals</h3>
              <button
                onClick={runIntentSignalDetection}
                disabled={runningJob !== null}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {runningJob === 'signals' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Detect Signals
                  </>
                )}
              </button>
            </div>

            {signals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Signals Detected</h3>
                <p className="text-gray-500">Run signal detection to find buying signals for this lead</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.map(signal => (
                  <div
                    key={signal.id}
                    className={`p-4 rounded-lg border ${getStrengthColor(signal.signal_strength)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          {getSignalIcon(signal.signal_type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{signal.title}</h4>
                          {signal.description && (
                            <p className="text-sm text-gray-600 mt-1">{signal.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500 capitalize">
                              {signal.signal_type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(signal.detected_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{signal.relevance_score}</div>
                        <div className="text-xs text-gray-500">relevance</div>
                      </div>
                    </div>
                    {signal.source_url && (
                      <a
                        href={signal.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 mt-3 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
