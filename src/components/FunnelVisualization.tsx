import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  CheckCircle,
  Mail,
  Eye,
  MessageSquare,
  Calendar,
  Trophy,
  TrendingDown,
  Download,
  RefreshCw,
} from 'lucide-react';
import { getFunnelData, calculateFunnelStages, exportFunnelToCSV, type FunnelData } from '../services/analytics-funnel';
import toast from 'react-hot-toast';

interface Props {
  campaignId?: string;
  title?: string;
}

export default function FunnelVisualization({ campaignId, title = 'Conversion Funnel' }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, campaignId, dateRange]);

  async function loadData() {
    setLoading(true);
    try {
      let startDate: Date | undefined;
      const now = new Date();

      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      const funnelData = await getFunnelData(user!.id, campaignId, startDate);
      setData(funnelData);
    } catch (error) {
      console.error('Error loading funnel data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!data) return;
    const csv = exportFunnelToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funnel-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stages = data ? calculateFunnelStages(data) : [];

  const stageIcons = [
    <Users className="w-4 h-4" />,
    <CheckCircle className="w-4 h-4" />,
    <Mail className="w-4 h-4" />,
    <Eye className="w-4 h-4" />,
    <MessageSquare className="w-4 h-4" />,
    <Calendar className="w-4 h-4" />,
    <Trophy className="w-4 h-4" />,
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={loadData}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {stages.every((s) => s.value === 0) ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No funnel data available</p>
            <p className="text-xs text-gray-400 mt-1">
              Data will appear as leads progress through your pipeline
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div key={stage.name} className="relative">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stageIcons[index]}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {stage.value.toLocaleString()}
                        </span>
                        {index > 0 && stage.dropoff > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-red-500">
                            <TrendingDown className="w-3 h-3" />
                            {stage.dropoff}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stage.percentage}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {index < stages.length - 1 && (
                  <div className="absolute left-4 top-10 w-0.5 h-3 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        )}

        {data && stages.some((s) => s.value > 0) && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.emailsSent > 0
                    ? ((data.emailsOpened / data.emailsSent) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500">Open Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.emailsSent > 0
                    ? ((data.emailsReplied / data.emailsSent) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500">Reply Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.leadsScraped > 0
                    ? ((data.dealsConverted / data.leadsScraped) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500">Conversion Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
