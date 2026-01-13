import { ReactNode, useState } from 'react';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
  });

  return (
    <div
      {...swipeHandlers}
      onTouchStart={(e) => {
        setIsDragging(true);
        swipeHandlers.onTouchStart(e);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        const startX = (e.currentTarget as any).touchStartX || 0;
        setOffset(touch.clientX - startX);
        swipeHandlers.onTouchMove(e);
      }}
      onTouchEnd={(e) => {
        setIsDragging(false);
        setOffset(0);
        swipeHandlers.onTouchEnd(e);
      }}
      className={`
        ${className}
        transition-transform
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      style={{
        transform: `translateX(${offset}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {children}
    </div>
  );
}
