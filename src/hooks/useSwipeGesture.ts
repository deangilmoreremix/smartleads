import { useRef, useEffect, TouchEvent } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipeGesture(handlers: SwipeHandlers, threshold: number = 50) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      } else if (deltaX < -threshold && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      }
    } else {
      if (deltaY > threshold && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      } else if (deltaY < -threshold && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      }
    }

    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
