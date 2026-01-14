import { useEffect, useState } from 'react';
import { rbacService, FeatureFlag } from '../services/rbac-service';
import {
  Flag,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Percent,
  Shield,
  Users,
  Search,
  Loader2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [filteredFlags, setFilteredFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    flag_name: '',
    description: '',
    enabled: false,
    rollout_percentage: 100,
    required_plan: '' as string | null,
  });

  useEffect(() => {
    loadFlags();
  }, []);

  useEffect(() => {
    filterFlags();
  }, [flags, searchQuery]);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await rbacService.getAllFeatureFlags();
      setFlags(data);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      toast.error('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const filterFlags = () => {
    if (!searchQuery) {
      setFilteredFlags(flags);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredFlags(
      flags.filter(
        (f) =>
          f.flag_name.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query)
      )
    );
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await rbacService.updateFeatureFlag(flag.id, { enabled: !flag.enabled });
      toast.success(`Feature ${flag.enabled ? 'disabled' : 'enabled'}`);
      loadFlags();
    } catch (error) {
      console.error('Error toggling flag:', error);
      toast.error('Failed to toggle feature');
    }
  };

  const handleCreate = async () => {
    if (!formData.flag_name || !formData.description) {
      toast.error('Name and description are required');
      return;
    }

    setSaving(true);
    try {
      await rbacService.createFeatureFlag({
        flag_name: formData.flag_name.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
        enabled: formData.enabled,
        rollout_percentage: formData.rollout_percentage,
        required_plan: formData.required_plan || null,
      });
      toast.success('Feature flag created');
      loadFlags();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating flag:', error);
      toast.error('Failed to create feature flag');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFlag) return;

    setSaving(true);
    try {
      await rbacService.updateFeatureFlag(selectedFlag.id, {
        description: formData.description,
        enabled: formData.enabled,
        rollout_percentage: formData.rollout_percentage,
        required_plan: formData.required_plan || null,
      });
      toast.success('Feature flag updated');
      loadFlags();
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating flag:', error);
      toast.error('Failed to update feature flag');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      flag_name: '',
      description: '',
      enabled: false,
      rollout_percentage: 100,
      required_plan: '',
    });
    setSelectedFlag(null);
  };

  const openEditModal = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    setFormData({
      flag_name: flag.flag_name,
      description: flag.description,
      enabled: flag.enabled,
      rollout_percentage: flag.rollout_percentage,
      required_plan: flag.required_plan || '',
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading feature flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
          <p className="text-slate-400">Control feature rollout and access</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Flag</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Flags</p>
              <p className="text-2xl font-bold text-white">{flags.length}</p>
            </div>
            <Flag className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Enabled</p>
              <p className="text-2xl font-bold text-green-400">
                {flags.filter((f) => f.enabled).length}
              </p>
            </div>
            <ToggleRight className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Plan-Gated</p>
              <p className="text-2xl font-bold text-amber-400">
                {flags.filter((f) => f.required_plan).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search feature flags..."
          className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-600 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid gap-4">
        {filteredFlags.map((flag) => (
          <div
            key={flag.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-white">{flag.flag_name}</h3>
                  <button
                    onClick={() => handleToggle(flag)}
                    className={`p-1 rounded transition ${
                      flag.enabled ? 'text-green-400' : 'text-slate-500'
                    }`}
                  >
                    {flag.enabled ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                </div>
                <p className="text-slate-400 mt-1">{flag.description}</p>
                <div className="flex items-center space-x-4 mt-3">
                  {flag.required_plan && (
                    <span className="flex items-center text-sm text-amber-400">
                      <Shield className="w-4 h-4 mr-1" />
                      {flag.required_plan}+ required
                    </span>
                  )}
                  {flag.rollout_percentage < 100 && (
                    <span className="flex items-center text-sm text-cyan-400">
                      <Percent className="w-4 h-4 mr-1" />
                      {flag.rollout_percentage}% rollout
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    Updated {new Date(flag.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openEditModal(flag)}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {showCreateModal ? 'Create Feature Flag' : 'Edit Feature Flag'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Flag Name
                </label>
                <input
                  type="text"
                  value={formData.flag_name}
                  onChange={(e) => setFormData({ ...formData, flag_name: e.target.value })}
                  disabled={showEditModal}
                  placeholder="e.g., new_dashboard"
                  className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {showCreateModal && (
                  <p className="text-xs text-slate-500 mt-1">
                    Will be converted to snake_case automatically
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this feature do?"
                  rows={3}
                  className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div>
                  <p className="text-white font-medium">Enabled</p>
                  <p className="text-sm text-slate-400">Feature is active for users</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                  className={`p-1 rounded transition ${
                    formData.enabled ? 'text-green-400' : 'text-slate-500'
                  }`}
                >
                  {formData.enabled ? (
                    <ToggleRight className="w-10 h-10" />
                  ) : (
                    <ToggleLeft className="w-10 h-10" />
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rollout Percentage
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.rollout_percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) })
                    }
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-white font-medium w-12 text-right">
                    {formData.rollout_percentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Gradually roll out to a percentage of users
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Required Plan
                </label>
                <select
                  value={formData.required_plan || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, required_plan: e.target.value || null })
                  }
                  className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">No plan requirement</option>
                  <option value="free">Free+</option>
                  <option value="starter">Starter+</option>
                  <option value="professional">Professional+</option>
                  <option value="enterprise">Enterprise only</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreate : handleUpdate}
                disabled={saving}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{showCreateModal ? 'Create' : 'Save Changes'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
