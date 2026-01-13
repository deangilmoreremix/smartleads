import { useEffect, useState } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface AnimatedProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function AnimatedProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
  color = '#3b82f6',
}: AnimatedProgressRingProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const { ref, isVisible } = useScrollAnimation();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    if (isVisible) {
      const duration = 1500;
      const steps = 60;
      const increment = percentage / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedPercentage(Math.min(currentStep * increment, percentage));
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, percentage]);

  return (
    <div ref={ref as any} className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.05s linear',
          }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-2xl font-bold"
          fill="currentColor"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        >
          {Math.round(animatedPercentage)}%
        </text>
      </svg>
      {label && <p className="mt-2 text-sm text-gray-600">{label}</p>}
    </div>
  );
}
