import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Folder,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Users,
  Mail,
  GripVertical,
  MoreVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCampaignGroups,
  createCampaignGroup,
  updateCampaignGroup,
  deleteCampaignGroup,
  assignCampaignToGroup,
  getUngroupedCampaigns,
  GROUP_COLORS,
  type CampaignGroup,
  type CampaignInGroup,
} from '../services/campaign-groups';

interface Props {
  onSelectGroup?: (groupId: string | null) => void;
}

export default function CampaignGroupsManager({ onSelectGroup }: Props) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CampaignGroup[]>([]);
  const [ungrouped, setUngrouped] = useState<CampaignInGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: GROUP_COLORS[0],
    globalDailyLimit: 100,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      const [groupsData, ungroupedData] = await Promise.all([
        getCampaignGroups(user!.id),
        getUngroupedCampaigns(user!.id),
      ]);
      setGroups(groupsData);
      setUngrouped(ungroupedData);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    try {
      if (editingId) {
        await updateCampaignGroup(editingId, {
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
          global_daily_limit: formData.globalDailyLimit,
        });
        toast.success('Group updated');
      } else {
        await createCampaignGroup(
          user!.id,
          formData.name,
          formData.description,
          formData.color,
          1,
          formData.globalDailyLimit
        );
        toast.success('Group created');
      }

      resetForm();
      loadData();
    } catch (error) {
      toast.error('Failed to save group');
    }
  }

  async function handleDelete(groupId: string) {
    if (!confirm('Delete this group? Campaigns will be ungrouped.')) return;

    try {
      await deleteCampaignGroup(groupId);
      toast.success('Group deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  }

  async function handleAssign(campaignId: string, groupId: string | null) {
    try {
      await assignCampaignToGroup(campaignId, groupId);
      toast.success(groupId ? 'Campaign added to group' : 'Campaign removed from group');
      loadData();
    } catch (error) {
      toast.error('Failed to update campaign');
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      color: GROUP_COLORS[0],
      globalDailyLimit: 100,
    });
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(group: CampaignGroup) {
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color,
      globalDailyLimit: group.global_daily_limit,
    });
    setEditingId(group.id);
    setShowForm(true);
  }

  if (loading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />;
  }

  const totalCampaigns = groups.reduce((sum, g) => sum + (g.campaigns?.length || 0), 0) + ungrouped.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">Campaign Groups</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            {totalCampaigns} campaigns
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Group name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Email Limit
              </label>
              <input
                type="number"
                value={formData.globalDailyLimit}
                onChange={(e) => setFormData({ ...formData, globalDailyLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-lg border-2 transition ${
                    formData.color === color ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition"
            >
              {editingId ? 'Update' : 'Create'} Group
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <div
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: group.color }}
                />
                <div>
                  <h4 className="font-medium text-gray-900">{group.name}</h4>
                  {group.description && (
                    <p className="text-xs text-gray-500">{group.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {group.campaigns?.length || 0}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  {group.global_daily_limit}/day
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(group);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(group.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedId === group.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>

            {expandedId === group.id && (
              <div className="border-t border-gray-100 p-3 bg-gray-50">
                {group.campaigns && group.campaigns.length > 0 ? (
                  <div className="space-y-2">
                    {group.campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-300" />
                          <span className="text-sm font-medium text-gray-700">
                            {campaign.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              campaign.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAssign(campaign.id, null)}
                          className="text-xs text-gray-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No campaigns in this group
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {ungrouped.length > 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Ungrouped Campaigns ({ungrouped.length})
            </h4>
            <div className="space-y-2">
              {ungrouped.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between bg-white p-2 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{campaign.name}</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAssign(campaign.id, e.target.value);
                    }}
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="" disabled>Add to group...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
