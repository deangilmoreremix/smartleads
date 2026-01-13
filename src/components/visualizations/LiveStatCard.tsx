import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LiveStatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  updateInterval?: number;
  variance?: number;
  icon?: React.ReactNode;
}

export function LiveStatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  trend = 'neutral',
  trendValue,
  updateInterval = 3000,
  variance = 0.05,
  icon,
}: LiveStatCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      const change = value * variance * (Math.random() * 2 - 1);
      const newValue = Math.round(value + change);
      setDisplayValue(newValue);

      setTimeout(() => setIsUpdating(false), 300);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [value, variance, updateInterval]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>

        <div className={`text-3xl font-bold text-gray-900 transition-all duration-300 ${isUpdating ? 'scale-110 text-blue-600' : ''}`}>
          {prefix}{displayValue.toLocaleString()}{suffix}
        </div>

        {trendValue && (
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}

        {isUpdating && (
          <div className="absolute top-0 right-0">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
}
