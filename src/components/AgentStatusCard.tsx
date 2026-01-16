import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, XCircle, Bot, Sparkles, Zap } from 'lucide-react';

interface AgentStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface AgentStatusCardProps {
  jobType: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  steps: AgentStep[];
  resultData?: {
    leadsFound?: number;
    emailsGenerated?: number;
    emailsSent?: number;
  };
}

export default function AgentStatusCard({
  jobType,
  status,
  steps,
  resultData = {}
}: AgentStatusCardProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [particleCount, setParticleCount] = useState(0);

  const isComplete = status === 'completed';
  const isFailed = status === 'failed';
  const isRunning = status === 'running' || status === 'initializing';

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setPulseIntensity(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  useEffect(() => {
    if (isComplete) {
      const interval = setInterval(() => {
        setParticleCount(prev => prev + 1);
      }, 200);
      const timeout = setTimeout(() => clearInterval(interval), 3000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isComplete]);

  const getJobTypeLabel = () => {
    switch (jobType) {
      case 'lead_scraping':
        return 'Lead Scraping';
      case 'email_generation':
        return 'Email Generation';
      case 'email_sending':
        return 'Email Sending';
      case 'contact_enrichment':
        return 'Contact Enrichment';
      default:
        return 'AI Agent';
    }
  };

  const getStatusIcon = () => {
    if (isComplete) {
      return <Bot className="w-12 h-12 text-white" />;
    }
    if (isFailed) {
      return <XCircle className="w-12 h-12 text-white" />;
    }
    return <Loader2 className="w-12 h-12 text-white animate-spin" />;
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50"></div>

      {isRunning && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-20 -left-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl"
              style={{
                transform: `scale(${1 + Math.sin(pulseIntensity * 0.1) * 0.3})`,
                opacity: 0.5 + Math.sin(pulseIntensity * 0.1) * 0.3
              }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl"
              style={{
                transform: `scale(${1 + Math.cos(pulseIntensity * 0.1) * 0.3})`,
                opacity: 0.5 + Math.cos(pulseIntensity * 0.1) * 0.3
              }}
            />
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-gradient-x"></div>
        </>
      )}

      {isComplete && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: Math.min(particleCount, 15) }).map((_, i) => (
            <Sparkles
              key={i}
              className="absolute w-4 h-4 text-amber-400 animate-float-up"
              style={{
                left: `${10 + (i * 23) % 80}%`,
                animationDelay: `${i * 0.15}s`,
                opacity: 0.8
              }}
            />
          ))}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400"></div>
        </div>
      )}

      <div className="relative p-8">
        <div className="flex flex-col items-center mb-6">
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
            isComplete
              ? 'bg-gradient-to-br from-emerald-400 to-green-500'
              : isFailed
              ? 'bg-gradient-to-br from-red-500 to-red-600'
              : 'bg-gradient-to-br from-amber-400 to-orange-500'
          }`}>
            {isRunning && (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-ping opacity-30"></div>
                <div className="absolute -inset-2 rounded-full border-2 border-amber-400/30 animate-spin-slow"></div>
                <div className="absolute -inset-4 rounded-full border border-orange-400/20 animate-reverse-spin"></div>
              </>
            )}
            {isComplete && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 animate-pulse-glow"></div>
            )}
            <div className="relative z-10">
              {getStatusIcon()}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">
            {isComplete && 'Agent Completed!'}
            {isFailed && 'Agent Failed'}
            {isRunning && 'AI Agent Working...'}
          </h2>

          <div className="flex items-center space-x-2 text-stone-500">
            <Zap className="w-4 h-4" />
            <span className="text-sm">{getJobTypeLabel()}</span>
          </div>
        </div>

        {isRunning && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Processing your request</p>
                <p className="text-xs text-amber-700">This may take a few minutes...</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-500 ${
                step.status === 'completed'
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200'
                  : step.status === 'in_progress'
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
                  : step.status === 'failed'
                  ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
                  : 'bg-stone-50 border border-stone-200'
              }`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {step.status === 'in_progress' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-100/50 to-orange-100/50 animate-pulse"></div>
              )}

              <div className="relative z-10 flex items-center space-x-3 w-full">
                {step.status === 'completed' && (
                  <div className="relative">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                  </div>
                )}
                {step.status === 'in_progress' && (
                  <div className="relative">
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                    <div className="absolute -inset-1 bg-orange-400/20 rounded-full animate-pulse"></div>
                  </div>
                )}
                {step.status === 'failed' && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 bg-white" />
                )}

                <span className={`text-sm font-medium flex-1 ${
                  step.status === 'completed' ? 'text-emerald-900' :
                  step.status === 'in_progress' ? 'text-amber-900' :
                  step.status === 'failed' ? 'text-red-900' :
                  'text-stone-400'
                }`}>
                  {step.label}
                </span>

                {step.status === 'completed' && (
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
          ))}
        </div>

        {isComplete && Object.keys(resultData).length > 0 && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h3 className="text-sm font-semibold text-stone-700 mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Results</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {resultData.leadsFound !== undefined && (
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center border border-amber-200">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {resultData.leadsFound}
                    </div>
                    <div className="text-xs text-amber-700 mt-1 font-medium">Leads Found</div>
                  </div>
                </div>
              )}
              {resultData.emailsGenerated !== undefined && (
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center border border-amber-200">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {resultData.emailsGenerated}
                    </div>
                    <div className="text-xs text-orange-700 mt-1 font-medium">Emails Generated</div>
                  </div>
                </div>
              )}
              {resultData.emailsSent !== undefined && (
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-emerald-200 col-span-2">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {resultData.emailsSent}
                    </div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">Emails Sent Successfully</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float-up {
          0% {
            transform: translateY(100%) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-200%) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.6);
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 2s ease infinite;
        }

        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-reverse-spin {
          animation: reverse-spin 12s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
