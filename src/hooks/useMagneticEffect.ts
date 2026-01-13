import { useRef, useState, useEffect } from 'react';

interface MagneticOptions {
  strength?: number;
  speed?: number;
}

export function useMagneticEffect(options: MagneticOptions = {}) {
  const { strength = 0.3, speed = 300 } = options;
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      const magneticRange = rect.width * 2;

      if (distance < magneticRange) {
        const pullX = distanceX * strength;
        const pullY = distanceY * strength;
        setPosition({ x: pullX, y: pullY });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    element.addEventListener('mouseenter', () => {
      document.addEventListener('mousemove', handleMouseMove);
    });

    element.addEventListener('mouseleave', () => {
      document.removeEventListener('mousemove', handleMouseMove);
      handleMouseLeave();
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [strength]);

  const magneticStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: `transform ${speed}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
  };

  return { ref, magneticStyle };
}
