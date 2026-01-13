import { useRef, useState, useEffect } from 'react';

interface TiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glare?: boolean;
}

export function use3DTilt(options: TiltOptions = {}) {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.05,
    speed = 400,
    glare = true,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const tiltX = percentY * maxTilt;
      const tiltY = -percentX * maxTilt;

      setTiltStyle({
        transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`,
        transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
      });

      if (glare) {
        const glareX = (percentX + 1) * 50;
        const glareY = (percentY + 1) * 50;
        setGlareStyle({
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          transition: `background ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
        });
      }
    };

    const handleMouseLeave = () => {
      setTiltStyle({
        transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
        transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
      });
      setGlareStyle({
        background: 'transparent',
        transition: `background ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt, perspective, scale, speed, glare]);

  return { ref, tiltStyle, glareStyle };
}
