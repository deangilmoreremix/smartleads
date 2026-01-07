import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Filter, Play, Pause, MoreVertical, Users, Mail, Eye, MessageSquare } from 'lucide-react';
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
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
            <p className="text-gray-600">Manage your outreach campaigns</p>
          </div>
          <Link
            to="/dashboard/campaigns/new"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>New Campaign</span>
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 text-gray-900 border border-gray-200 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition appearance-none cursor-pointer"
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
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">No campaigns found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {campaigns.length === 0
                ? 'Create your first campaign to start generating leads'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {campaigns.length === 0 && (
              <Link
                to="/dashboard/campaigns/new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition"
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
                <div key={campaign.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-200 transition group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link to={`/dashboard/campaigns/${campaign.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition">
                            {campaign.name}
                          </h3>
                        </Link>
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                            campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'}
                        `}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{campaign.niche}</span>
                        <span>•</span>
                        <span>{campaign.location}</span>
                        <span>•</span>
                        <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-amber-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{campaign.total_leads}</div>
                      <div className="text-gray-500 text-sm">Leads</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{campaign.emails_sent}</div>
                      <div className="text-gray-500 text-sm">Sent</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{openRate}%</div>
                      <div className="text-gray-500 text-sm">Open Rate</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-orange-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{replyRate}%</div>
                      <div className="text-gray-500 text-sm">Reply Rate</div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center space-x-3">
                    <Link
                      to={`/dashboard/campaigns/${campaign.id}`}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:shadow-lg hover:shadow-orange-500/30 text-white px-4 py-2.5 rounded-xl font-semibold text-center transition"
                    >
                      View Details
                    </Link>
                    {campaign.status === 'active' && (
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition">
                        <Pause className="w-5 h-5" />
                      </button>
                    )}
                    {campaign.status === 'paused' && (
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition">
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
    </div>
  );
}
