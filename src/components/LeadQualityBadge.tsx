import { Star, TrendingUp, Globe, Mail, Users, Share2 } from 'lucide-react';

interface QualityFactors {
  rating_points: number;
  review_points: number;
  website_points: number;
  email_points: number;
  social_points: number;
  employee_points: number;
}

interface Props {
  score: number;
  factors?: QualityFactors;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LeadQualityBadge({ score, factors, showDetails = false, size = 'md' }: Props) {
  const getGrade = (score: number): string => {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    if (score >= 20) return 'D';
    return 'F';
  };

  const getColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (score >= 20) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const grade = getGrade(score);
  const colorClass = getColor(score);
  const progressColor = getProgressColor(score);

  if (!showDetails) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${colorClass} ${sizeClasses[size]}`}>
        <span>{grade}</span>
        <span className="text-opacity-70">({score})</span>
      </span>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} font-bold text-xl`}>
            {grade}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">Quality Score</div>
            <div className="text-sm text-gray-500">{score} / 100 points</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {factors && (
        <div className="space-y-2">
          <FactorRow
            icon={<Star className="w-4 h-4" />}
            label="Rating"
            points={factors.rating_points}
            maxPoints={25}
          />
          <FactorRow
            icon={<TrendingUp className="w-4 h-4" />}
            label="Reviews"
            points={factors.review_points}
            maxPoints={20}
          />
          <FactorRow
            icon={<Globe className="w-4 h-4" />}
            label="Website"
            points={factors.website_points}
            maxPoints={15}
          />
          <FactorRow
            icon={<Mail className="w-4 h-4" />}
            label="Real Email"
            points={factors.email_points}
            maxPoints={20}
          />
          <FactorRow
            icon={<Share2 className="w-4 h-4" />}
            label="Social Profiles"
            points={factors.social_points}
            maxPoints={10}
          />
          <FactorRow
            icon={<Users className="w-4 h-4" />}
            label="Employee Count"
            points={factors.employee_points}
            maxPoints={10}
          />
        </div>
      )}
    </div>
  );
}

function FactorRow({
  icon,
  label,
  points,
  maxPoints,
}: {
  icon: React.ReactNode;
  label: string;
  points: number;
  maxPoints: number;
}) {
  const percentage = (points / maxPoints) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium text-gray-900">
            {points}/{maxPoints}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
