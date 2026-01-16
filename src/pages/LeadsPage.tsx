import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, Filter, Mail, Phone, Globe, Star, ExternalLink,
  Brain, Target, Activity, ChevronRight, X,
  CheckCircle, AlertTriangle, Download, Send
} from 'lucide-react';
import type { Database } from '../types/database';
import EmailVerificationBadge from '../components/EmailVerificationBadge';
import LeadIntelligencePanel from '../components/LeadIntelligencePanel';
import QuickMessageModal from '../components/QuickMessageModal';
import toast from 'react-hot-toast';

type Lead = Database['public']['Tables']['leads']['Row'] & {
  research_completed?: boolean;
  website_health_checked?: boolean;
  intent_score?: number;
};

export default function LeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showIntelligencePanel, setShowIntelligencePanel] = useState(false);
  const [messageModalLead, setMessageModalLead] = useState<Lead | null>(null);

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

  const openIntelligencePanel = (lead: Lead) => {
    setSelectedLead(lead);
    setShowIntelligencePanel(true);
  };

  const closeIntelligencePanel = () => {
    setShowIntelligencePanel(false);
    setSelectedLead(null);
    loadLeads();
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const dataToExport = filteredLeads.length > 0 ? filteredLeads : leads;

      if (dataToExport.length === 0) {
        toast.error('No leads to export');
        return;
      }

      const headers = [
        'Business Name',
        'Email',
        'Phone',
        'Website',
        'Address',
        'Rating',
        'Reviews',
        'Status',
        'Created At'
      ];

      const csvRows = dataToExport.map(lead => [
        `"${(lead.business_name || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.website || '').replace(/"/g, '""')}"`,
        `"${(lead.address || '').replace(/"/g, '""')}"`,
        lead.rating || '',
        lead.reviews || '',
        lead.status || '',
        lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''
      ].join(','));

      const csvContent = [headers.join(','), ...csvRows].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${dataToExport.length} leads to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export leads');
    } finally {
      setExporting(false);
    }
  };

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
        <p className="text-slate-400">Browse and manage your prospects with AI-powered intelligence</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Leads</p>
              <p className="text-2xl font-bold text-white">{leads.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Researched</p>
              <p className="text-2xl font-bold text-white">
                {leads.filter(l => l.research_completed).length}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Brain className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Health Checked</p>
              <p className="text-2xl font-bold text-white">
                {leads.filter(l => l.website_health_checked).length}
              </p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">High Intent</p>
              <p className="text-2xl font-bold text-white">
                {leads.filter(l => (l.intent_score || 0) >= 70).length}
              </p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Target className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
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
          <button
            onClick={exportToCSV}
            disabled={exporting || leads.length === 0}
            className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
        {filteredLeads.length > 0 && filteredLeads.length !== leads.length && (
          <div className="mt-3 text-sm text-slate-400">
            Showing {filteredLeads.length} of {leads.length} leads
            {filterStatus !== 'all' && ` (filtered by: ${filterStatus})`}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <div className={`flex-1 transition-all duration-300 ${showIntelligencePanel ? 'w-1/2' : 'w-full'}`}>
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
                <div
                  key={lead.id}
                  className={`bg-slate-800 border rounded-xl p-6 hover:border-blue-500/50 transition cursor-pointer ${
                    selectedLead?.id === lead.id ? 'border-blue-500' : 'border-slate-700'
                  }`}
                  onClick={() => openIntelligencePanel(lead)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">{lead.business_name}</h3>
                        {lead.verification_status && (
                          <EmailVerificationBadge
                            status={lead.verification_status as 'valid' | 'invalid' | 'risky' | 'pending'}
                            size="sm"
                          />
                        )}
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
                    <div className="flex items-center gap-3">
                      {lead.intent_score !== undefined && lead.intent_score > 0 && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                          lead.intent_score >= 70 ? 'bg-emerald-500/20' :
                          lead.intent_score >= 50 ? 'bg-amber-500/20' : 'bg-slate-700/50'
                        }`}>
                          <Target className={`w-4 h-4 ${
                            lead.intent_score >= 70 ? 'text-emerald-400' :
                            lead.intent_score >= 50 ? 'text-amber-400' : 'text-slate-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            lead.intent_score >= 70 ? 'text-emerald-400' :
                            lead.intent_score >= 50 ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {lead.intent_score}
                          </span>
                        </div>
                      )}
                      {lead.rating && (
                        <div className="flex items-center space-x-1 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-medium text-sm">{lead.rating}</span>
                          <span className="text-slate-400 text-sm">({lead.review_count})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <a
                      href={`mailto:${lead.email}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center space-x-2 text-slate-300 hover:text-white transition"
                    >
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className="text-sm truncate">{lead.email}</span>
                    </a>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={e => e.stopPropagation()}
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
                        onClick={e => e.stopPropagation()}
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

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {lead.research_completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="text-xs text-slate-400">Research</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lead.website_health_checked ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="text-xs text-slate-400">Health</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMessageModalLead(lead);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Message
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openIntelligencePanel(lead);
                        }}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                      >
                        <Brain className="w-4 h-4" />
                        Intelligence
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center text-slate-400 text-sm">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>

        {showIntelligencePanel && selectedLead && (
          <div className="w-1/2 sticky top-4 h-fit">
            <div className="relative">
              <button
                onClick={closeIntelligencePanel}
                className="absolute -left-3 top-4 z-10 p-2 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <LeadIntelligencePanel
                leadId={selectedLead.id}
                businessName={selectedLead.business_name}
                website={selectedLead.website}
                onClose={closeIntelligencePanel}
              />
            </div>
          </div>
        )}
      </div>

      {messageModalLead && (
        <QuickMessageModal
          isOpen={!!messageModalLead}
          onClose={() => setMessageModalLead(null)}
          lead={messageModalLead}
          onMessageSent={() => {
            loadLeads();
            navigate('/dashboard/inbox');
          }}
        />
      )}
    </div>
  );
}
