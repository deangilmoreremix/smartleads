import { ReactNode } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  className = '',
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation();

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0) scale(1)';

    switch (direction) {
      case 'up':
        return 'translate(0, 60px) scale(1)';
      case 'down':
        return 'translate(0, -60px) scale(1)';
      case 'left':
        return 'translate(60px, 0) scale(1)';
      case 'right':
        return 'translate(-60px, 0) scale(1)';
      case 'scale':
        return 'translate(0, 0) scale(0.8)';
      default:
        return 'translate(0, 0) scale(1)';
    }
  };

  return (
    <div
      ref={ref as any}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
