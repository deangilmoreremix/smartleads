import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  content: ReactNode;
  className?: string;
}

export default function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 280;
    const padding = 8;

    let x = trigger.left + trigger.width / 2;
    const y = trigger.bottom + padding;

    if (x + tooltipWidth / 2 > viewportWidth - 12) {
      x = viewportWidth - tooltipWidth / 2 - 12;
    }
    if (x - tooltipWidth / 2 < 12) {
      x = tooltipWidth / 2 + 12;
    }

    setCoords({ x, y });
  }, [isVisible]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`inline-flex items-center justify-center p-0.5 rounded-full hover:bg-gray-100 transition ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="More information"
      >
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </button>

      {isVisible && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: coords.x,
            top: coords.y,
            transform: 'translate(-50%, 0)',
            maxWidth: 280
          }}
        >
          <div className="relative bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 transform rotate-45" />
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
