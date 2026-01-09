import { useState, useEffect } from 'react';
import {
  Target, TrendingUp, Briefcase, DollarSign, Users, Zap,
  Filter, RefreshCw, ExternalLink, CheckCircle, Clock,
  AlertTriangle, BarChart3, ArrowUpRight, Building
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface IntentSignal {
  id: string;
  lead_id: string | null;
  campaign_id: string | null;
  signal_type: string;
  signal_strength: string;
  title: string;
  description: string;
  source_url: string;
  source_platform: string;
  company_name: string;
  relevance_score: number;
  matched_keywords: string[];
  detected_at: string;
  is_actionable: boolean;
  action_taken: boolean;
  leads?: { business_name: string; email: string };
}

interface SignalStats {
  total: number;
  critical: number;
  high: number;
  actionable: number;
  byType: Record<string, number>;
}

export default function IntentSignalsDashboard() {
  const [signals, setSignals] = useState<IntentSignal[]>([]);
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    strength: string;
    type: string;
    actionable: boolean | null;
  }>({
    strength: 'all',
    type: 'all',
    actionable: null,
  });

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('intent_signals')
        .select(`
          *,
          leads (business_name, email)
        `)
        .order('detected_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setSignals(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Failed to load signals:', error);
      toast.error('Failed to load signals');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(signalData: IntentSignal[]) {
    const byType: Record<string, number> = {};
    let critical = 0;
    let high = 0;
    let actionable = 0;

    for (const signal of signalData) {
      byType[signal.signal_type] = (byType[signal.signal_type] || 0) + 1;
      if (signal.signal_strength === 'critical') critical++;
      if (signal.signal_strength === 'high') high++;
      if (signal.is_actionable && !signal.action_taken) actionable++;
    }

    setStats({
      total: signalData.length,
      critical,
      high,
      actionable,
      byType,
    });
  }

  async function markActionTaken(signalId: string) {
    try {
      await supabase
        .from('intent_signals')
        .update({ action_taken: true, action_notes: 'Marked as acted upon' })
        .eq('id', signalId);

      setSignals(prev =>
        prev.map(s => (s.id === signalId ? { ...s, action_taken: true } : s))
      );
      toast.success('Signal marked as acted upon');
    } catch (error) {
      toast.error('Failed to update signal');
    }
  }

  function getSignalIcon(type: string) {
    switch (type) {
      case 'job_posting':
      case 'hiring_surge':
        return <Briefcase className="w-5 h-5" />;
      case 'funding_announcement':
        return <DollarSign className="w-5 h-5" />;
      case 'expansion_news':
        return <TrendingUp className="w-5 h-5" />;
      case 'leadership_change':
        return <Users className="w-5 h-5" />;
      case 'acquisition':
        return <Building className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  }

  function getStrengthBadge(strength: string) {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[strength] || styles.medium}`}>
        {strength}
      </span>
    );
  }

  const filteredSignals = signals.filter(signal => {
    if (filter.strength !== 'all' && signal.signal_strength !== filter.strength) return false;
    if (filter.type !== 'all' && signal.signal_type !== filter.type) return false;
    if (filter.actionable === true && (!signal.is_actionable || signal.action_taken)) return false;
    if (filter.actionable === false && signal.is_actionable && !signal.action_taken) return false;
    return true;
  });

  const signalTypes = [...new Set(signals.map(s => s.signal_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intent Signals</h1>
          <p className="text-gray-600">Buying signals detected across your leads</p>
        </div>
        <button
          onClick={loadSignals}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Signals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Critical Priority</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.critical}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.high}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <ArrowUpRight className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Actionable</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.actionable}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && Object.keys(stats.byType).length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Signals by Type</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg"
              >
                {getSignalIcon(type)}
                <span className="text-sm text-gray-600 capitalize">{type.replace(/_/g, ' ')}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter.strength}
              onChange={e => setFilter(prev => ({ ...prev, strength: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Strengths</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filter.type}
              onChange={e => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {signalTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFilter(prev => ({ ...prev, actionable: prev.actionable === true ? null : true }))}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filter.actionable === true
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Actionable Only
            </button>
          </div>
        </div>

        {filteredSignals.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Signals Found</h3>
            <p className="text-gray-500">
              {signals.length > 0
                ? 'Try adjusting your filters'
                : 'Run intent signal detection on your leads to discover buying signals'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSignals.map(signal => (
              <div key={signal.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${
                      signal.signal_strength === 'critical' ? 'bg-red-100 text-red-600' :
                      signal.signal_strength === 'high' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getSignalIcon(signal.signal_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900">{signal.title}</h4>
                        {getStrengthBadge(signal.signal_strength)}
                        {signal.action_taken && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                            Acted
                          </span>
                        )}
                      </div>
                      {signal.description && (
                        <p className="text-sm text-gray-600 mb-2">{signal.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {signal.company_name || signal.leads?.business_name || 'Unknown'}
                        </span>
                        <span className="capitalize">{signal.signal_type.replace(/_/g, ' ')}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(signal.detected_at).toLocaleDateString()}
                        </span>
                        {signal.matched_keywords.length > 0 && (
                          <span>Keywords: {signal.matched_keywords.slice(0, 3).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{signal.relevance_score}</div>
                      <div className="text-xs text-gray-500">relevance</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {signal.source_url && (
                        <a
                          href={signal.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View source"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {signal.is_actionable && !signal.action_taken && (
                        <button
                          onClick={() => markActionTaken(signal.id)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Mark as acted upon"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
