import { ReactNode } from 'react';
import { useParallax } from '../../hooks/useScrollAnimation';

interface ParallaxContainerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxContainer({
  children,
  speed = 0.5,
  className = '',
}: ParallaxContainerProps) {
  const { ref, offset } = useParallax(speed);

  return (
    <div
      ref={ref as any}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
