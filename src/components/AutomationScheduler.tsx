import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Save,
  Trash2,
  Plus,
  Settings,
  Zap,
  Mail,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  campaign_id: string | null;
  schedule_type: 'daily' | 'weekly' | 'custom' | 'one_time';
  send_windows: Array<{ start: string; end: string }>;
  timezone: string;
  business_days_only: boolean;
  max_emails_per_run: number;
  max_emails_per_day: number;
  min_interval_minutes: number;
  actions: string[];
  min_leads_threshold: number;
  auto_scrape_when_low: boolean;
  scrape_count_on_low: number;
  is_active: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
  total_runs: number;
  total_emails_sent: number;
}

interface AutomationSchedulerProps {
  campaignId?: string;
  onScheduleChange?: () => void;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
];

const ACTIONS = [
  { value: 'scrape_leads', label: 'Scrape New Leads', icon: Users },
  { value: 'generate_emails', label: 'Generate Emails', icon: Zap },
  { value: 'send_emails', label: 'Send Emails', icon: Mail },
  { value: 'process_sequences', label: 'Process Sequences', icon: RefreshCw },
];

export default function AutomationScheduler({ campaignId, onScheduleChange }: AutomationSchedulerProps) {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Partial<Schedule> | null>(null);

  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [user, campaignId]);

  async function loadSchedules() {
    try {
      let query = supabase.from('automation_schedules').select('*').order('created_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }

  async function saveSchedule(schedule: Partial<Schedule>) {
    if (!user) return;
    setSaving(true);

    try {
      const scheduleData = {
        ...schedule,
        user_id: user.id,
        campaign_id: campaignId || schedule.campaign_id || null,
      };

      if (schedule.id) {
        const { error } = await supabase
          .from('automation_schedules')
          .update(scheduleData)
          .eq('id', schedule.id);
        if (error) throw error;
        toast.success('Schedule updated');
      } else {
        const { error } = await supabase.from('automation_schedules').insert(scheduleData);
        if (error) throw error;
        toast.success('Schedule created');
      }

      setEditingSchedule(null);
      loadSchedules();
      onScheduleChange?.();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSchedule(id: string) {
    try {
      const { error } = await supabase.from('automation_schedules').delete().eq('id', id);
      if (error) throw error;
      toast.success('Schedule deleted');
      loadSchedules();
      onScheduleChange?.();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  }

  async function toggleSchedule(id: string, currentState: boolean) {
    try {
      const { error } = await supabase
        .from('automation_schedules')
        .update({ is_active: !currentState })
        .eq('id', id);
      if (error) throw error;
      toast.success(currentState ? 'Schedule paused' : 'Schedule activated');
      loadSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast.error('Failed to toggle schedule');
    }
  }

  async function triggerManualRun(scheduleId: string) {
    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-autopilot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            campaignId: schedule.campaign_id,
            userId: user?.id,
            runType: 'full_cycle',
            forceRun: true,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success(`Automation complete: ${result.totalEmailsGenerated} generated, ${result.totalEmailsSent} sent`);
        loadSchedules();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error triggering manual run:', error);
      toast.error('Failed to trigger automation');
    }
  }

  function createNewSchedule() {
    setEditingSchedule({
      name: 'New Schedule',
      schedule_type: 'daily',
      send_windows: [{ start: '09:00', end: '17:00' }],
      timezone: 'America/New_York',
      business_days_only: true,
      max_emails_per_run: 50,
      max_emails_per_day: 100,
      min_interval_minutes: 5,
      actions: ['generate_emails', 'send_emails'],
      min_leads_threshold: 10,
      auto_scrape_when_low: true,
      scrape_count_on_low: 50,
      is_active: true,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Automation Schedules</h2>
          <p className="text-sm text-gray-500 mt-1">Configure when and how your campaigns run automatically</p>
        </div>
        <button
          onClick={createNewSchedule}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {editingSchedule && (
        <ScheduleEditor
          schedule={editingSchedule}
          onChange={setEditingSchedule}
          onSave={() => saveSchedule(editingSchedule)}
          onCancel={() => setEditingSchedule(null)}
          saving={saving}
        />
      )}

      {schedules.length === 0 && !editingSchedule ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-medium mb-2">No schedules configured</h3>
          <p className="text-gray-500 text-sm mb-4">Create a schedule to automate your outreach</p>
          <button
            onClick={createNewSchedule}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            <Plus className="w-4 h-4" />
            Create Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white rounded-xl border ${
                schedule.is_active ? 'border-green-200' : 'border-gray-200'
              } overflow-hidden`}
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === schedule.id ? null : schedule.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      schedule.is_active ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <Calendar
                      className={`w-5 h-5 ${schedule.is_active ? 'text-green-600' : 'text-gray-400'}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{schedule.name}</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          schedule.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {schedule.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {schedule.send_windows[0]?.start} - {schedule.send_windows[0]?.end}
                      </span>
                      <span>{schedule.schedule_type}</span>
                      <span>{schedule.total_runs} runs</span>
                      <span>{schedule.total_emails_sent} emails sent</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerManualRun(schedule.id);
                    }}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Run now"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSchedule(schedule.id, schedule.is_active);
                    }}
                    className={`p-2 rounded-lg transition ${
                      schedule.is_active
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={schedule.is_active ? 'Pause' : 'Activate'}
                  >
                    {schedule.is_active ? <Pause className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  </button>
                  {expandedId === schedule.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === schedule.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-500 block">Timezone</span>
                      <span className="text-sm font-medium">{schedule.timezone}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Max per run</span>
                      <span className="text-sm font-medium">{schedule.max_emails_per_run} emails</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Max per day</span>
                      <span className="text-sm font-medium">{schedule.max_emails_per_day} emails</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Interval</span>
                      <span className="text-sm font-medium">{schedule.min_interval_minutes}s between</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">Actions:</span>
                    {schedule.actions.map((action) => {
                      const actionInfo = ACTIONS.find((a) => a.value === action);
                      return (
                        <span
                          key={action}
                          className="px-2 py-1 bg-white rounded text-xs text-gray-600 border"
                        >
                          {actionInfo?.label || action}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSchedule(schedule)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-lg transition"
                    >
                      <Settings className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this schedule?')) {
                          deleteSchedule(schedule.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleEditor({
  schedule,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  schedule: Partial<Schedule>;
  onChange: (s: Partial<Schedule>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-amber-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {schedule.id ? 'Edit Schedule' : 'New Schedule'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name</label>
          <input
            type="text"
            value={schedule.name || ''}
            onChange={(e) => onChange({ ...schedule, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
          <select
            value={schedule.schedule_type || 'daily'}
            onChange={(e) => onChange({ ...schedule, schedule_type: e.target.value as Schedule['schedule_type'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
            <option value="one_time">One Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send Window Start</label>
          <input
            type="time"
            value={schedule.send_windows?.[0]?.start || '09:00'}
            onChange={(e) =>
              onChange({
                ...schedule,
                send_windows: [{ start: e.target.value, end: schedule.send_windows?.[0]?.end || '17:00' }],
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send Window End</label>
          <input
            type="time"
            value={schedule.send_windows?.[0]?.end || '17:00'}
            onChange={(e) =>
              onChange({
                ...schedule,
                send_windows: [{ start: schedule.send_windows?.[0]?.start || '09:00', end: e.target.value }],
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            value={schedule.timezone || 'America/New_York'}
            onChange={(e) => onChange({ ...schedule, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Emails Per Run</label>
          <input
            type="number"
            value={schedule.max_emails_per_run || 50}
            onChange={(e) => onChange({ ...schedule, max_emails_per_run: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Emails Per Day</label>
          <input
            type="number"
            value={schedule.max_emails_per_day || 100}
            onChange={(e) => onChange({ ...schedule, max_emails_per_day: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interval Between Emails (seconds)</label>
          <input
            type="number"
            value={schedule.min_interval_minutes || 5}
            onChange={(e) => onChange({ ...schedule, min_interval_minutes: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Actions to Perform</label>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.value}
              onClick={() => {
                const currentActions = schedule.actions || [];
                const newActions = currentActions.includes(action.value)
                  ? currentActions.filter((a) => a !== action.value)
                  : [...currentActions, action.value];
                onChange({ ...schedule, actions: newActions });
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                schedule.actions?.includes(action.value)
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={schedule.business_days_only ?? true}
            onChange={(e) => onChange({ ...schedule, business_days_only: e.target.checked })}
            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">Business days only</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={schedule.auto_scrape_when_low ?? true}
            onChange={(e) => onChange({ ...schedule, auto_scrape_when_low: e.target.checked })}
            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">Auto-scrape when leads low</span>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {schedule.id ? 'Update' : 'Create'} Schedule
        </button>
      </div>
    </div>
  );
}
