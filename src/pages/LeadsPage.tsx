import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Mail, Phone, Globe, Star, ExternalLink } from 'lucide-react';
import type { Database } from '../types/database';

type Lead = Database['public']['Tables']['leads']['Row'];

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadLeads();
    }
  }, [user]);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leads</h1>
        <p className="text-slate-400">Browse and manage your prospects</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name or email..."
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="replied">Replied</option>
              <option value="converted">Converted</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-medium mb-2">No leads found</h3>
          <p className="text-slate-400 text-sm">
            {leads.length === 0
              ? 'Create a campaign to start generating leads'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{lead.business_name}</h3>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${lead.email_type === 'personal' ? 'bg-green-500/20 text-green-400' :
                        lead.email_type === 'generic' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'}
                    `}>
                      {lead.email_type}
                    </span>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${lead.status === 'converted' ? 'bg-green-500/20 text-green-400' :
                        lead.status === 'replied' ? 'bg-blue-500/20 text-blue-400' :
                        lead.status === 'contacted' ? 'bg-cyan-500/20 text-cyan-400' :
                        lead.status === 'bounced' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'}
                    `}>
                      {lead.status}
                    </span>
                  </div>
                  {lead.decision_maker_name && (
                    <p className="text-slate-400 text-sm mb-2">Contact: {lead.decision_maker_name}</p>
                  )}
                </div>
                {lead.rating && (
                  <div className="flex items-center space-x-1 bg-slate-700/50 px-3 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-medium text-sm">{lead.rating}</span>
                    <span className="text-slate-400 text-sm">({lead.review_count})</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-sm truncate">{lead.email}</span>
                </a>
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white transition"
                  >
                    <Phone className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{lead.phone}</span>
                  </a>
                )}
                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-slate-300 hover:text-white transition"
                  >
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm truncate">Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {lead.address && (
                <p className="text-slate-400 text-sm mb-4">{lead.address}</p>
              )}

              {lead.notes && (
                <div className="bg-slate-700/50 rounded-lg p-3 mt-4">
                  <p className="text-slate-300 text-sm">{lead.notes}</p>
                </div>
              )}

              <div className="mt-4 flex items-center space-x-3">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition">
                  Send Email
                </button>
                {lead.google_maps_url && (
                  <a
                    href={lead.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-slate-400 text-sm">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>
    </div>
  );
}
