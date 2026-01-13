import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GlassmorphicCard({
  children,
  className = '',
  blur = 'md',
}: GlassmorphicCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/10 ${blurClasses[blur]}
        border border-white/20
        shadow-xl shadow-black/5
        hover:bg-white/20 hover:shadow-2xl
        transition-all duration-300
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      <div className="relative">{children}</div>
    </div>
  );
}
