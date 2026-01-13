import { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface InteractiveChartProps {
  data: DataPoint[];
  type?: 'bar' | 'line';
  height?: number;
}

export function InteractiveChart({
  data,
  type = 'bar',
  height = 200,
}: InteractiveChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6">
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-around gap-2">
          {data.map((item, index) => {
            const heightPercentage = (item.value / maxValue) * 100;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <div className="absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg z-10 animate-in fade-in slide-in-from-bottom-2">
                    {item.value.toLocaleString()}
                  </div>
                )}

                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isHovered ? 'opacity-100 scale-105' : 'opacity-80'
                  }`}
                  style={{
                    height: `${heightPercentage}%`,
                    backgroundColor: item.color || '#3b82f6',
                    transformOrigin: 'bottom',
                  }}
                />

                <span className="text-xs text-gray-600 text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
