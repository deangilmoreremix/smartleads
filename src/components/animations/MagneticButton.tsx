import { ReactNode } from 'react';
import { useMagneticEffect } from '../../hooks/useMagneticEffect';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  onClick,
  className = '',
  strength = 0.3,
}: MagneticButtonProps) {
  const { ref, magneticStyle } = useMagneticEffect({ strength });

  return (
    <button
      ref={ref as any}
      onClick={onClick}
      className={`relative ${className}`}
      style={magneticStyle}
    >
      {children}
    </button>
  );
}
