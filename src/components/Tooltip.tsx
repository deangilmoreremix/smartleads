import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

interface TooltipProps {
  content: ReactNode;
  children?: ReactNode;
  position?: TooltipPosition;
  showIcon?: boolean;
  className?: string;
  maxWidth?: number;
}

export default function Tooltip({
  content,
  children,
  position = 'auto',
  showIcon = false,
  className = '',
  maxWidth = 280
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState<Exclude<TooltipPosition, 'auto'>>('top');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 12;
    const tooltipHeight = 100;
    const tooltipWidth = Math.min(maxWidth, viewportWidth - 24);

    let finalPosition = position;
    if (position === 'auto') {
      const spaceAbove = trigger.top;
      const spaceBelow = viewportHeight - trigger.bottom;
      const spaceLeft = trigger.left;
      const spaceRight = viewportWidth - trigger.right;

      if (spaceBelow >= tooltipHeight + padding) {
        finalPosition = 'bottom';
      } else if (spaceAbove >= tooltipHeight + padding) {
        finalPosition = 'top';
      } else if (spaceRight >= tooltipWidth + padding) {
        finalPosition = 'right';
      } else {
        finalPosition = 'left';
      }
    }

    setActualPosition(finalPosition as Exclude<TooltipPosition, 'auto'>);

    let x = 0;
    let y = 0;

    switch (finalPosition) {
      case 'top':
        x = trigger.left + trigger.width / 2;
        y = trigger.top - padding;
        break;
      case 'bottom':
        x = trigger.left + trigger.width / 2;
        y = trigger.bottom + padding;
        break;
      case 'left':
        x = trigger.left - padding;
        y = trigger.top + trigger.height / 2;
        break;
      case 'right':
        x = trigger.right + padding;
        y = trigger.top + trigger.height / 2;
        break;
    }

    x = Math.max(12, Math.min(x, viewportWidth - 12));
    y = Math.max(12, Math.min(y, viewportHeight - 12));

    setCoords({ x, y });
  }, [isVisible, position, maxWidth]);

  const getTransformStyle = () => {
    switch (actualPosition) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0, -50%)';
    }
  };

  const getArrowStyle = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} -bottom-1 left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} -top-1 left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseClasses} -right-1 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} -left-1 top-1/2 -translate-y-1/2`;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-flex items-center cursor-help ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
      >
        {children}
        {showIcon && (
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 ml-1 flex-shrink-0" />
        )}
      </div>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: coords.x,
            top: coords.y,
            transform: getTransformStyle(),
            maxWidth
          }}
        >
          <div className="relative bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
            {content}
            <div className={getArrowStyle()} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
