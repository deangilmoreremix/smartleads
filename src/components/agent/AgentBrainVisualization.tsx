import { useEffect, useState, useRef } from 'react';
import { Brain, Cpu, Zap } from 'lucide-react';

interface AgentBrainVisualizationProps {
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

interface Neuron {
  id: number;
  x: number;
  y: number;
  active: boolean;
  pulseDelay: number;
}

interface Connection {
  from: number;
  to: number;
  active: boolean;
}

export default function AgentBrainVisualization({
  isActive,
  intensity = 'medium'
}: AgentBrainVisualizationProps) {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeNeurons, setActiveNeurons] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const neuronCount = intensity === 'high' ? 20 : intensity === 'medium' ? 15 : 10;
    const newNeurons: Neuron[] = [];

    for (let i = 0; i < neuronCount; i++) {
      const angle = (i / neuronCount) * Math.PI * 2;
      const radius = 35 + Math.random() * 25;
      newNeurons.push({
        id: i,
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        active: false,
        pulseDelay: Math.random() * 2
      });
    }

    for (let i = 0; i < 5; i++) {
      newNeurons.push({
        id: neuronCount + i,
        x: 40 + Math.random() * 20,
        y: 40 + Math.random() * 20,
        active: false,
        pulseDelay: Math.random() * 2
      });
    }

    const newConnections: Connection[] = [];
    newNeurons.forEach((neuron, i) => {
      const connectionCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * newNeurons.length);
        if (targetIndex !== i) {
          newConnections.push({
            from: i,
            to: targetIndex,
            active: false
          });
        }
      }
    });

    setNeurons(newNeurons);
    setConnections(newConnections);
  }, [intensity]);

  useEffect(() => {
    if (!isActive) {
      setActiveNeurons(new Set());
      return;
    }

    const interval = setInterval(() => {
      const newActive = new Set<number>();
      const activationCount = intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3;

      for (let i = 0; i < activationCount; i++) {
        newActive.add(Math.floor(Math.random() * neurons.length));
      }

      setActiveNeurons(newActive);
    }, 300);

    return () => clearInterval(interval);
  }, [isActive, neurons.length, intensity]);

  const getConnectionOpacity = (conn: Connection) => {
    if (!isActive) return 0.1;
    if (activeNeurons.has(conn.from) || activeNeurons.has(conn.to)) return 0.8;
    return 0.15;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[200px] mx-auto"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_70%)]"></div>

        {isActive && (
          <div className="absolute inset-0 animate-pulse-slow">
            <div className="absolute inset-4 rounded-full border border-amber-500/20"></div>
            <div className="absolute inset-8 rounded-full border border-orange-500/15"></div>
            <div className="absolute inset-12 rounded-full border border-amber-500/10"></div>
          </div>
        )}

        <svg className="absolute inset-0 w-full h-full">
          {connections.map((conn, i) => {
            const fromNeuron = neurons[conn.from];
            const toNeuron = neurons[conn.to];
            if (!fromNeuron || !toNeuron) return null;

            return (
              <line
                key={i}
                x1={`${fromNeuron.x}%`}
                y1={`${fromNeuron.y}%`}
                x2={`${toNeuron.x}%`}
                y2={`${toNeuron.y}%`}
                stroke={activeNeurons.has(conn.from) || activeNeurons.has(conn.to)
                  ? 'rgb(251, 191, 36)'
                  : 'rgb(107, 114, 128)'}
                strokeWidth={activeNeurons.has(conn.from) && activeNeurons.has(conn.to) ? 2 : 1}
                opacity={getConnectionOpacity(conn)}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {neurons.map((neuron) => (
          <div
            key={neuron.id}
            className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              activeNeurons.has(neuron.id)
                ? 'bg-amber-400 shadow-lg shadow-amber-500/50 scale-125'
                : 'bg-gray-600'
            }`}
            style={{
              left: `${neuron.x}%`,
              top: `${neuron.y}%`
            }}
          >
            {activeNeurons.has(neuron.id) && (
              <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-50"></div>
            )}
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
            <Brain className={`w-10 h-10 ${isActive ? 'text-amber-400' : 'text-gray-600'} transition-colors duration-300`} />
            {isActive && (
              <>
                <Zap className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-bounce" />
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl"></div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-gray-800 text-gray-500 border border-gray-700'
        }`}>
          <Cpu className="w-3 h-3" />
          <span>{isActive ? 'Processing' : 'Idle'}</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.98); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
