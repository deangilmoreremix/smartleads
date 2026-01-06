import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Filter, Play, Pause, MoreVertical } from 'lucide-react';
import type { Database } from '../types/database';

type Campaign = Database['public']['Tables']['campaigns']['Row'];

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaigns</h1>
          <p className="text-slate-400">Manage your outreach campaigns</p>
        </div>
        <Link
          to="/dashboard/campaigns/new"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>New Campaign</span>
        </Link>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900/50 text-white border border-slate-600 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-medium mb-2">No campaigns found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {campaigns.length === 0
              ? 'Create your first campaign to start generating leads'
              : 'Try adjusting your search or filter criteria'}
          </p>
          {campaigns.length === 0 && (
            <Link
              to="/dashboard/campaigns/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Campaign</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCampaigns.map((campaign) => {
            const openRate = campaign.emails_sent > 0
              ? ((campaign.emails_opened / campaign.emails_sent) * 100).toFixed(1)
              : '0';
            const replyRate = campaign.emails_sent > 0
              ? ((campaign.emails_replied / campaign.emails_sent) * 100).toFixed(1)
              : '0';

            return (
              <div key={campaign.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link to={`/dashboard/campaigns/${campaign.id}`}>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                          {campaign.name}
                        </h3>
                      </Link>
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                          campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'}
                      `}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="font-medium">{campaign.niche}</span>
                      <span>•</span>
                      <span>{campaign.location}</span>
                      <span>•</span>
                      <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-white transition">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">{campaign.total_leads}</div>
                    <div className="text-slate-400 text-sm">Leads</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">{campaign.emails_sent}</div>
                    <div className="text-slate-400 text-sm">Sent</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">{openRate}%</div>
                    <div className="text-slate-400 text-sm">Open Rate</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">{replyRate}%</div>
                    <div className="text-slate-400 text-sm">Reply Rate</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center space-x-3">
                  <Link
                    to={`/dashboard/campaigns/${campaign.id}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-center transition"
                  >
                    View Details
                  </Link>
                  {campaign.status === 'active' && (
                    <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition">
                      <Pause className="w-5 h-5" />
                    </button>
                  )}
                  {campaign.status === 'paused' && (
                    <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition">
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
