import { useEffect, useState } from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { checkStorageQuota, formatBytes, type StorageQuota } from '../lib/storage';

export default function StorageQuotaDisplay() {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuota();
  }, []);

  const loadQuota = async () => {
    try {
      const quotaData = await checkStorageQuota();
      setQuota(quotaData);
    } catch (error) {
      console.error('Failed to load storage quota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-2 bg-slate-700 rounded mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!quota) return null;

  const getStatusColor = () => {
    if (quota.percentage >= 90) return 'red';
    if (quota.percentage >= 75) return 'yellow';
    return 'blue';
  };

  const statusColor = getStatusColor();
  const colorClasses = {
    red: {
      bg: 'bg-red-600',
      text: 'text-red-400',
      border: 'border-red-500/30',
      bgLight: 'bg-red-500/10',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      bgLight: 'bg-yellow-500/10',
    },
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      bgLight: 'bg-blue-500/10',
    },
  };

  const colors = colorClasses[statusColor];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-white">Storage Usage</h3>
        </div>
        {quota.percentage >= 90 && (
          <div className="flex items-center gap-1 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Almost Full</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${colors.bg} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(quota.percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">
            {formatBytes(quota.used)} used
          </span>
          <span className="text-slate-400">
            {formatBytes(quota.limit)} total
          </span>
        </div>

        <div className={`p-3 rounded-lg border ${colors.border} ${colors.bgLight}`}>
          <p className={`text-sm font-medium ${colors.text}`}>
            {quota.percentage.toFixed(1)}% of storage used
          </p>
          {quota.percentage >= 90 && (
            <p className="text-xs text-slate-400 mt-1">
              Consider upgrading your plan or removing unused files to free up space.
            </p>
          )}
          {quota.percentage >= 75 && quota.percentage < 90 && (
            <p className="text-xs text-slate-400 mt-1">
              You're using most of your storage. Upgrade soon to avoid interruptions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
