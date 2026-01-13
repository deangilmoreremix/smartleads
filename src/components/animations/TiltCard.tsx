import { ReactNode } from 'react';
import { use3DTilt } from '../../hooks/use3DTilt';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.05,
  glare = true,
}: TiltCardProps) {
  const { ref, tiltStyle, glareStyle } = use3DTilt({ maxTilt, scale, glare });

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        ...tiltStyle,
      }}
    >
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={glareStyle}
        />
      )}
      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </div>
  );
}
