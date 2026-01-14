import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  History,
  Search,
  Filter,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Shield,
  UserPlus,
  UserMinus,
  Settings,
  CreditCard,
  Flag,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  user_id: string | null;
  target_user_id: string | null;
  action: string;
  resource: string;
  old_value: Record<string, unknown>;
  new_value: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: { email: string; full_name: string | null };
  target_user?: { email: string; full_name: string | null };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterResource, setFilterResource] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  useEffect(() => {
    loadLogs();
  }, [page, filterAction, filterResource]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }
      if (filterResource !== 'all') {
        query = query.eq('resource', filterResource);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logsWithUsers = await Promise.all(
        (data || []).map(async (log) => {
          const [userResult, targetResult] = await Promise.all([
            log.user_id
              ? supabase
                  .from('profiles')
                  .select('email, full_name')
                  .eq('id', log.user_id)
                  .maybeSingle()
              : { data: null },
            log.target_user_id
              ? supabase
                  .from('profiles')
                  .select('email, full_name')
                  .eq('id', log.target_user_id)
                  .maybeSingle()
              : { data: null },
          ]);

          return {
            ...log,
            user: userResult.data || undefined,
            target_user: targetResult.data || undefined,
          };
        })
      );

      setLogs(logsWithUsers);
      setHasMore((data?.length || 0) === pageSize);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.resource.toLowerCase().includes(query) ||
      log.user?.email.toLowerCase().includes(query) ||
      log.target_user?.email.toLowerCase().includes(query)
    );
  });

  const getActionIcon = (action: string) => {
    if (action.includes('grant_admin') || action.includes('grant_role'))
      return <UserPlus className="w-4 h-4 text-green-400" />;
    if (action.includes('revoke'))
      return <UserMinus className="w-4 h-4 text-red-400" />;
    if (action.includes('update') || action.includes('adjust'))
      return <Settings className="w-4 h-4 text-blue-400" />;
    if (action.includes('subscription') || action.includes('credit'))
      return <CreditCard className="w-4 h-4 text-amber-400" />;
    if (action.includes('feature') || action.includes('flag'))
      return <Flag className="w-4 h-4 text-cyan-400" />;
    return <History className="w-4 h-4 text-slate-400" />;
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Resource', 'User', 'Target User', 'Old Value', 'New Value'].join(','),
      ...filteredLogs.map((log) =>
        [
          log.created_at,
          log.action,
          log.resource,
          log.user?.email || '',
          log.target_user?.email || '',
          JSON.stringify(log.old_value),
          JSON.stringify(log.new_value),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Audit logs exported');
  };

  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueResources = [...new Set(logs.map((l) => l.resource))];

  if (loading && page === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400">Track all administrative actions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setPage(0);
              loadLogs();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, resource, or user..."
            className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-600 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => {
            setFilterAction(e.target.value);
            setPage(0);
          }}
          className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>
              {formatAction(action)}
            </option>
          ))}
        </select>
        <select
          value={filterResource}
          onChange={(e) => {
            setFilterResource(e.target.value);
            setPage(0);
          }}
          className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Resources</option>
          {uniqueResources.map((resource) => (
            <option key={resource} value={resource}>
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-700">
          {filteredLogs.map((log) => (
            <div key={log.id} className="hover:bg-slate-700/30 transition">
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {formatAction(log.action)}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                          {log.resource}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                        {log.user && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {log.user.full_name || log.user.email}
                          </span>
                        )}
                        {log.target_user && (
                          <span className="flex items-center text-amber-400">
                            <Shield className="w-3 h-3 mr-1" />
                            {log.target_user.full_name || log.target_user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                    {expandedLog === log.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedLog === log.id && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(log.old_value || {}).length > 0 && (
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-xs font-medium text-slate-400 mb-2">Previous Value</p>
                        <pre className="text-sm text-red-400 whitespace-pre-wrap overflow-auto max-h-40">
                          {JSON.stringify(log.old_value, null, 2)}
                        </pre>
                      </div>
                    )}
                    {Object.keys(log.new_value || {}).length > 0 && (
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-xs font-medium text-slate-400 mb-2">New Value</p>
                        <pre className="text-sm text-green-400 whitespace-pre-wrap overflow-auto max-h-40">
                          {JSON.stringify(log.new_value, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  {(log.ip_address || log.user_agent) && (
                    <div className="text-xs text-slate-500">
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      {log.user_agent && (
                        <span className="ml-4 truncate">UA: {log.user_agent}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
        >
          Previous
        </button>
        <span className="text-slate-400">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={!hasMore}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
