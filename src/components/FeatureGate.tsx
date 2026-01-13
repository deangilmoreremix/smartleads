import { ReactNode } from 'react';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureGateProps {
  feature: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  children: ReactNode;
}

export default function FeatureGate({
  feature,
  fallback,
  showUpgrade = false,
  children,
}: FeatureGateProps) {
  const { loading, hasAccess } = useFeatureAccess(feature);

  if (loading) {
    return <>{fallback || null}</>;
  }

  if (!hasAccess) {
    if (showUpgrade) {
      return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
          <p className="text-slate-400 mb-6">
            Upgrade your plan to unlock this feature and get access to advanced capabilities.
          </p>
          <Link
            to="/dashboard/plans"
            className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition"
          >
            View Plans
          </Link>
        </div>
      );
    }
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}
