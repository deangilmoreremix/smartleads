import { useEffect, useState } from 'react';

interface PerformanceGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color?: 'green' | 'blue' | 'yellow' | 'purple';
}

export default function PerformanceGauge({
  label,
  value,
  max,
  unit,
  color = 'green'
}: PerformanceGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const endTime = startTime + duration;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      setAnimatedValue(value * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const percentage = (animatedValue / max) * 100;
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  const colorMap = {
    green: { main: '#10B981', light: '#D1FAE5', stroke: '#059669' },
    blue: { main: '#3B82F6', light: '#DBEAFE', stroke: '#2563EB' },
    yellow: { main: '#FFD666', light: '#FEF3C7', stroke: '#FFC233' },
    purple: { main: '#A855F7', light: '#F3E8FF', stroke: '#9333EA' }
  };

  const colors = colorMap[color];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={colors.light}
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={colors.main}
              strokeWidth="12"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 6px ${colors.main}40)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(animatedValue)}
            </div>
            <div className="text-xs text-gray-600">{unit}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 mb-1">{label}</div>
          <div className="text-sm text-gray-600">
            {Math.round(percentage)}% of target
          </div>
        </div>

        <div className="w-full mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: colors.main
            }}
          />
        </div>
      </div>
    </div>
  );
}
