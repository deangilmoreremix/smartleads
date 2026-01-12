import { useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface ComparisonSliderProps {
  beforeLabel: string;
  afterLabel: string;
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
}

export default function ComparisonSlider({
  beforeLabel,
  afterLabel,
  beforeContent,
  afterContent
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const container = e.currentTarget.getBoundingClientRect();
    const position = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percentage = ((position - container.left) / container.width) * 100;

    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <div
      className="relative w-full aspect-[16/10] bg-gray-900 rounded-2xl overflow-hidden cursor-col-resize select-none"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e);
      }}
      onMouseMove={handleMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e);
      }}
      onTouchMove={handleMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      <div className="absolute inset-0 flex">
        <div className="w-1/2 flex items-center justify-center p-8">
          {beforeContent}
        </div>
        <div className="w-1/2 flex items-center justify-center p-8">
          {afterContent}
        </div>
      </div>

      <div
        className="absolute top-0 bottom-0 left-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center">
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {beforeLabel}
          </div>
        </div>
      </div>

      <div
        className="absolute top-0 bottom-0 right-0 overflow-hidden"
        style={{ width: `${100 - sliderPosition}%` }}
      >
        <div className="absolute inset-0 bg-green-900/20 backdrop-blur-sm flex items-center justify-center">
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {afterLabel}
          </div>
        </div>
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
          <MoveHorizontal className="w-6 h-6 text-gray-900" />
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-900 shadow-lg">
        Drag to compare
      </div>
    </div>
  );
}
