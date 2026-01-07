import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  Zap,
  Settings,
  Mail,
  Users,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MapPin,
  Search,
} from 'lucide-react';

interface AutopilotSettingsProps {
  campaignId: string;
  onSettingsChange?: () => void;
}

interface SearchQuery {
  query: string;
  location: string;
}

interface AutopilotConfig {
  id?: string;
  campaign_id: string;
  is_enabled: boolean;
  daily_email_limit: number;
  min_lead_threshold: number;
  scrape_batch_size: number;
  send_interval_minutes: number;
  rotate_gmail_accounts: boolean;
  pause_on_reply: boolean;
  search_queries: SearchQuery[];
}

export function AutopilotSettings({ campaignId, onSettingsChange }: AutopilotSettingsProps) {
  const [settings, setSettings] = useState<AutopilotConfig>({
    campaign_id: campaignId,
    is_enabled: false,
    daily_email_limit: 50,
    min_lead_threshold: 20,
    scrape_batch_size: 25,
    send_interval_minutes: 5,
    rotate_gmail_accounts: true,
    pause_on_reply: true,
    search_queries: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newQuery, setNewQuery] = useState({ query: '', location: '' });
  const [gmailAccountCount, setGmailAccountCount] = useState(0);

  useEffect(() => {
    loadSettings();
    loadGmailAccounts();
  }, [campaignId]);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('campaign_autopilot_settings')
        .select('*')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          ...data,
          search_queries: data.search_queries || [],
        });
      }
    } catch (error) {
      console.error('Error loading autopilot settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadGmailAccounts() {
    try {
      const { count } = await supabase
        .from('gmail_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setGmailAccountCount(count || 0);
    } catch (error) {
      console.error('Error loading Gmail accounts:', error);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('campaign_autopilot_settings')
        .upsert({
          ...settings,
          campaign_id: campaignId,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Autopilot settings saved');
      onSettingsChange?.();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function toggleAutopilot() {
    if (!settings.is_enabled && settings.search_queries.length === 0) {
      toast.error('Add at least one search query before enabling autopilot');
      return;
    }

    if (!settings.is_enabled && gmailAccountCount === 0) {
      toast.error('Connect at least one Gmail account before enabling autopilot');
      return;
    }

    const newEnabled = !settings.is_enabled;
    setSettings((prev) => ({ ...prev, is_enabled: newEnabled }));

    try {
      const { error } = await supabase
        .from('campaign_autopilot_settings')
        .upsert({
          ...settings,
          is_enabled: newEnabled,
          campaign_id: campaignId,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success(newEnabled ? 'Autopilot enabled' : 'Autopilot paused');
      onSettingsChange?.();
    } catch (error) {
      console.error('Error toggling autopilot:', error);
      setSettings((prev) => ({ ...prev, is_enabled: !newEnabled }));
      toast.error('Failed to toggle autopilot');
    }
  }

  function addSearchQuery() {
    if (!newQuery.query.trim() || !newQuery.location.trim()) {
      toast.error('Enter both search query and location');
      return;
    }

    setSettings((prev) => ({
      ...prev,
      search_queries: [
        ...prev.search_queries,
        { query: newQuery.query.trim(), location: newQuery.location.trim() },
      ],
    }));
    setNewQuery({ query: '', location: '' });
  }

  function removeSearchQuery(index: number) {
    setSettings((prev) => ({
      ...prev,
      search_queries: prev.search_queries.filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Autopilot Mode</h3>
              <p className="text-sm text-white/80">24/7 automated outreach</p>
            </div>
          </div>
          <button
            onClick={toggleAutopilot}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              settings.is_enabled
                ? 'bg-white text-orange-600 hover:bg-yellow-50'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {settings.is_enabled ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Enable
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {settings.is_enabled && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Autopilot is active</p>
              <p className="text-sm text-green-600">
                Your campaign is running automatically 24/7
              </p>
            </div>
          </div>
        )}

        {gmailAccountCount === 0 && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">No Gmail accounts connected</p>
              <p className="text-sm text-yellow-600">
                Connect at least one Gmail account to send emails
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <Search className="w-4 h-4" />
            <span>Search Queries for Lead Scraping</span>
          </div>

          <div className="space-y-2">
            {settings.search_queries.map((query, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{query.query}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{query.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeSearchQuery(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g., plumbers, restaurants, dentists"
                  value={newQuery.query}
                  onChange={(e) =>
                    setNewQuery((prev) => ({ ...prev, query: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g., Austin TX, Los Angeles CA"
                  value={newQuery.location}
                  onChange={(e) =>
                    setNewQuery((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400"
                />
              </div>
              <button
                onClick={addSearchQuery}
                className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <Mail className="w-4 h-4" />
              <span>Email Settings</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Daily Email Limit
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={settings.daily_email_limit}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    daily_email_limit: parseInt(e.target.value) || 50,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum emails to send per day (1-500)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Send Interval (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.send_interval_minutes}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    send_interval_minutes: parseInt(e.target.value) || 5,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Delay between sending emails (1-60 min)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <Users className="w-4 h-4" />
              <span>Lead Settings</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Minimum Lead Threshold
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                value={settings.min_lead_threshold}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    min_lead_threshold: parseInt(e.target.value) || 20,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-scrape when leads fall below this
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Scrape Batch Size
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={settings.scrape_batch_size}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    scrape_batch_size: parseInt(e.target.value) || 25,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leads to scrape per batch (5-100)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <Settings className="w-4 h-4" />
            <span>Advanced Options</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.rotate_gmail_accounts}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    rotate_gmail_accounts: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
              />
              <div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    Rotate Gmail Accounts
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribute sends across {gmailAccountCount} connected accounts
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={settings.pause_on_reply}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    pause_on_reply: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    Pause on Reply
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Stop sequence when lead responds
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
