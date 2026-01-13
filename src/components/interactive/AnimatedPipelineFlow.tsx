import { useState, useEffect } from 'react';
import { MapPin, Mail, Sparkles, Send, MessageCircle, Play, Pause } from 'lucide-react';

interface Lead {
  id: number;
  stage: number;
  x: number;
}

const stages = [
  { id: 1, name: 'Google Maps', icon: MapPin, color: 'blue' },
  { id: 2, name: 'Email Finding', icon: Mail, color: 'purple' },
  { id: 3, name: 'AI Writing', icon: Sparkles, color: 'yellow' },
  { id: 4, name: 'Sending', icon: Send, color: 'green' },
  { id: 5, name: 'Response', icon: MessageCircle, color: 'orange' }
];

export default function AnimatedPipelineFlow() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stageCounts, setStageCounts] = useState([0, 0, 0, 0, 0]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [nextLeadId, setNextLeadId] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const addLeadInterval = setInterval(() => {
      setNextLeadId(prev => {
        const newId = prev + 1;
        setLeads(prevLeads => [...prevLeads, { id: newId, stage: 0, x: 0 }]);
        return newId;
      });
    }, 800);

    const moveLeadsInterval = setInterval(() => {
      setLeads(prevLeads => {
        const updatedLeads = prevLeads.map(lead => {
          if (lead.stage < 5) {
            return { ...lead, stage: lead.stage + 1, x: (lead.stage + 1) * 20 };
          }
          return lead;
        }).filter(lead => lead.stage <= 5);

        const newCounts = [0, 0, 0, 0, 0];
        updatedLeads.forEach(lead => {
          if (lead.stage > 0 && lead.stage <= 5) {
            newCounts[lead.stage - 1]++;
          }
        });
        setStageCounts(newCounts);

        return updatedLeads;
      });

      setTotalProcessed(prev => prev + 1);
    }, 1200);

    return () => {
      clearInterval(addLeadInterval);
      clearInterval(moveLeadsInterval);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!isPlaying) {
      setLeads([]);
      setStageCounts([0, 0, 0, 0, 0]);
      setTotalProcessed(0);
      setNextLeadId(0);
    }
    setIsPlaying(!isPlaying);
  };

  const getStageColor = (colorName: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      yellow: 'bg-[#FFD666]',
      green: 'bg-green-500',
      orange: 'bg-orange-500'
    };
    return colors[colorName] || 'bg-gray-500';
  };

  const getStageColorBorder = (colorName: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-500',
      purple: 'border-purple-500',
      yellow: 'border-[#FFD666]',
      green: 'border-green-500',
      orange: 'border-orange-500'
    };
    return colors[colorName] || 'border-gray-500';
  };

  const getStageColorBg = (colorName: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50',
      purple: 'bg-purple-50',
      yellow: 'bg-yellow-50',
      green: 'bg-green-50',
      orange: 'bg-orange-50'
    };
    return colors[colorName] || 'bg-gray-50';
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-white" />
              <h3 className="text-2xl font-bold text-white">
                Automated Pipeline Flow
              </h3>
            </div>
            <p className="text-purple-50 mt-2">
              Watch leads flow through your automated system in real-time
            </p>
          </div>
          <button
            onClick={togglePlay}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105
              ${isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-white text-purple-600 hover:shadow-lg'
              }
            `}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Flow</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 flex items-center justify-center space-x-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = stageCounts[index] > 0;

            return (
              <div key={stage.id} className="flex items-center">
                <div
                  className={`
                    relative ${getStageColorBg(stage.color)} ${getStageColorBorder(stage.color)}
                    border-2 rounded-xl p-6 min-w-[140px] transition-all duration-300
                    ${isActive ? 'shadow-lg scale-105' : 'shadow'}
                  `}
                >
                  <div className="text-center">
                    <div className={`
                      w-12 h-12 ${getStageColor(stage.color)} rounded-full
                      flex items-center justify-center mx-auto mb-2
                      ${isActive ? 'animate-pulse' : ''}
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      {stage.name}
                    </div>
                    <div className={`
                      text-2xl font-bold transition-all duration-300
                      ${isActive ? 'text-gray-900 scale-110' : 'text-gray-400'}
                    `}>
                      {stageCounts[index]}
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                  )}
                </div>

                {index < stages.length - 1 && (
                  <div className="relative w-16 h-1 bg-gray-200 mx-2">
                    <div
                      className={`
                        absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500
                        transition-all duration-500
                        ${isActive ? 'w-full' : 'w-0'}
                      `}
                    />
                    {isPlaying && (
                      <div className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#FFD666] rounded-full animate-ping" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 min-h-[200px] overflow-hidden">
          <div className="text-sm text-gray-600 font-semibold mb-4">
            Live Activity Visualization
          </div>

          <div className="relative h-32">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="absolute transition-all duration-1000 ease-in-out"
                style={{
                  left: `${lead.x}%`,
                  top: `${(lead.id % 4) * 25}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className={`
                  w-8 h-8 ${getStageColor(stages[Math.min(lead.stage - 1, 4)]?.color || 'blue')}
                  rounded-full flex items-center justify-center shadow-lg
                  ${isPlaying ? 'animate-bounce' : ''}
                `}>
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {!isPlaying && leads.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 italic">Click "Start Flow" to see automation in action</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {leads.length}
            </div>
            <div className="text-sm text-gray-600">Active Leads</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalProcessed}
            </div>
            <div className="text-sm text-gray-600">Total Processed</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stageCounts[4]}
            </div>
            <div className="text-sm text-gray-600">Responses</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {isPlaying ? '100%' : '0%'}
            </div>
            <div className="text-sm text-gray-600">Automated</div>
          </div>
        </div>
      </div>
    </div>
  );
}
