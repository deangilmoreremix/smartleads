import { useState } from 'react';

interface HeatMapCell {
  day: string;
  hour: number;
  value: number;
}

interface HeatMapProps {
  data: HeatMapCell[];
  title?: string;
}

export function HeatMap({ data, title }: HeatMapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatMapCell | null>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const maxValue = Math.max(...data.map((d) => d.value));

  const getColorIntensity = (value: number) => {
    const intensity = (value / maxValue) * 100;
    if (intensity > 75) return 'bg-blue-600';
    if (intensity > 50) return 'bg-blue-500';
    if (intensity > 25) return 'bg-blue-400';
    return 'bg-blue-200';
  };

  const getCellData = (day: string, hour: number) => {
    return data.find((d) => d.day === day && d.hour === hour);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <div className="relative">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-2">
            <div className="h-6" />
            {days.map((day) => (
              <div key={day} className="h-6 flex items-center justify-end text-xs text-gray-600 pr-2">
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1">
            <div className="flex gap-1 mb-1">
              {hours.map((hour) => (
                <div key={hour} className="flex-1 text-xs text-gray-600 text-center">
                  {hour % 4 === 0 ? hour : ''}
                </div>
              ))}
            </div>

            {days.map((day) => (
              <div key={day} className="flex gap-1 mb-1">
                {hours.map((hour) => {
                  const cellData = getCellData(day, hour);
                  const value = cellData?.value || 0;

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`flex-1 h-6 rounded transition-all duration-200 cursor-pointer ${
                        getColorIntensity(value)
                      } ${hoveredCell === cellData ? 'scale-125 shadow-lg' : 'hover:scale-110'}`}
                      onMouseEnter={() => setHoveredCell(cellData || null)}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {hoveredCell && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 text-white text-sm py-2 px-3 rounded shadow-lg z-10">
            <div className="font-semibold">{hoveredCell.day} at {hoveredCell.hour}:00</div>
            <div>{hoveredCell.value} emails sent</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-blue-200 rounded" />
          <div className="w-4 h-4 bg-blue-400 rounded" />
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <div className="w-4 h-4 bg-blue-600 rounded" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
