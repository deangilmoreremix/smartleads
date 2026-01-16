import { useEffect, useState } from 'react';
import { Database, Mail, Users, Zap, ArrowRight } from 'lucide-react';

interface DataFlowAnimationProps {
  isActive: boolean;
  currentStep?: 'scraping' | 'enriching' | 'generating' | 'sending' | 'complete';
}

interface DataParticle {
  id: number;
  progress: number;
  type: 'lead' | 'email' | 'data';
}

export default function DataFlowAnimation({
  isActive,
  currentStep = 'scraping'
}: DataFlowAnimationProps) {
  const [particles, setParticles] = useState<DataParticle[]>([]);
  const [particleId, setParticleId] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const interval = setInterval(() => {
      const types: DataParticle['type'][] = ['lead', 'email', 'data'];
      const newParticle: DataParticle = {
        id: particleId,
        progress: 0,
        type: types[Math.floor(Math.random() * types.length)]
      };

      setParticleId(prev => prev + 1);
      setParticles(prev => [...prev.slice(-10), newParticle]);
    }, 400);

    return () => clearInterval(interval);
  }, [isActive, particleId]);

  useEffect(() => {
    if (!isActive || particles.length === 0) return;

    const animationInterval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + 2 }))
          .filter(p => p.progress <= 100)
      );
    }, 30);

    return () => clearInterval(animationInterval);
  }, [isActive, particles.length]);

  const getStepStatus = (step: string) => {
    const steps = ['scraping', 'enriching', 'generating', 'sending', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getParticleColor = (type: DataParticle['type']) => {
    switch (type) {
      case 'lead':
        return 'bg-cyan-400';
      case 'email':
        return 'bg-amber-400';
      case 'data':
        return 'bg-emerald-400';
    }
  };

  const stages = [
    { id: 'scraping', icon: Database, label: 'Scrape' },
    { id: 'enriching', icon: Users, label: 'Enrich' },
    { id: 'generating', icon: Zap, label: 'Generate' },
    { id: 'sending', icon: Mail, label: 'Send' }
  ];

  return (
    <div className="relative p-6 bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl border border-gray-800">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800 -translate-y-1/2 z-0">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{
              width: `${
                currentStep === 'complete' ? 100 :
                currentStep === 'sending' ? 75 :
                currentStep === 'generating' ? 50 :
                currentStep === 'enriching' ? 25 : 0
              }%`
            }}
          />
        </div>

        {particles.map(particle => (
          <div
            key={particle.id}
            className={`absolute top-1/2 w-2 h-2 rounded-full ${getParticleColor(particle.type)} shadow-lg z-10 transition-opacity`}
            style={{
              left: `${particle.progress}%`,
              transform: 'translate(-50%, -50%)',
              opacity: particle.progress > 90 ? (100 - particle.progress) / 10 : 1,
              boxShadow: `0 0 10px currentColor`
            }}
          />
        ))}

        {stages.map((stage, index) => {
          const status = getStepStatus(stage.id);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  status === 'active'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/50'
                    : status === 'completed'
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                    : 'bg-gray-800 border-2 border-gray-700'
                }`}
              >
                {status === 'active' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-30"></div>
                    <div className="absolute -inset-1 rounded-full border-2 border-amber-400/30 animate-spin-slow"></div>
                  </>
                )}
                <Icon className={`w-5 h-5 ${
                  status === 'pending' ? 'text-gray-500' : 'text-white'
                }`} />
              </div>
              <span className={`mt-2 text-xs font-medium ${
                status === 'active' ? 'text-amber-400' :
                status === 'completed' ? 'text-emerald-400' :
                'text-gray-500'
              }`}>
                {stage.label}
              </span>

              {index < stages.length - 1 && (
                <ArrowRight className={`absolute top-4 -right-8 w-4 h-4 ${
                  getStepStatus(stages[index + 1].id) !== 'pending'
                    ? 'text-amber-400'
                    : 'text-gray-600'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <span className="text-gray-400">Leads</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span className="text-gray-400">Emails</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-gray-400">Data</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
