import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  shape: 'square' | 'circle' | 'triangle';
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

const COLORS = ['#fbbf24', '#f97316', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];

export default function Confetti({
  active,
  duration = 3000,
  particleCount = 100,
  onComplete
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!active || isRunning) return;

    setIsRunning(true);
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < particleCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        speedX: (Math.random() - 0.5) * 8,
        speedY: 2 + Math.random() * 4,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: ['square', 'circle', 'triangle'][Math.floor(Math.random() * 3)] as ConfettiPiece['shape']
      });
    }

    setPieces(newPieces);

    const animationInterval = setInterval(() => {
      setPieces((prev) =>
        prev
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.speedX,
            y: piece.y + piece.speedY,
            rotation: piece.rotation + piece.rotationSpeed,
            speedY: piece.speedY + 0.1
          }))
          .filter((piece) => piece.y < window.innerHeight + 50)
      );
    }, 16);

    const cleanupTimeout = setTimeout(() => {
      clearInterval(animationInterval);
      setPieces([]);
      setIsRunning(false);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(animationInterval);
      clearTimeout(cleanupTimeout);
    };
  }, [active, duration, particleCount, onComplete, isRunning]);

  if (pieces.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            transform: `rotate(${piece.rotation}deg)`,
            transition: 'none'
          }}
        >
          {piece.shape === 'square' && (
            <div
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color
              }}
            />
          )}
          {piece.shape === 'circle' && (
            <div
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: '50%'
              }}
            />
          )}
          {piece.shape === 'triangle' && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${piece.size / 2}px solid transparent`,
                borderRight: `${piece.size / 2}px solid transparent`,
                borderBottom: `${piece.size}px solid ${piece.color}`
              }}
            />
          )}
        </div>
      ))}
    </div>,
    document.body
  );
}
