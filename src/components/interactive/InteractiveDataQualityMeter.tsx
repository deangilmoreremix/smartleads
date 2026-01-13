import { useState } from 'react';
import { Mail, Filter, TrendingUp } from 'lucide-react';

interface EmailData {
  email: string;
  type: 'generic' | 'personal';
  quality: number;
}

const sampleEmails: EmailData[] = [
  { email: 'info@business.com', type: 'generic', quality: 20 },
  { email: 'contact@company.com', type: 'generic', quality: 15 },
  { email: 'support@store.com', type: 'generic', quality: 18 },
  { email: 'admin@shop.com', type: 'generic', quality: 22 },
  { email: 'sales@firm.com', type: 'generic', quality: 25 },
  { email: 'john.smith@business.com', type: 'personal', quality: 85 },
  { email: 'sarah.jones@company.com', type: 'personal', quality: 92 },
  { email: 'mike.wilson@store.com', type: 'personal', quality: 88 },
  { email: 'emma.brown@shop.com', type: 'personal', quality: 90 },
  { email: 'david.lee@firm.com', type: 'personal', quality: 87 },
  { email: 'hello@website.com', type: 'generic', quality: 12 },
  { email: 'inquiries@place.com', type: 'generic', quality: 19 },
  { email: 'service@location.com', type: 'generic', quality: 21 },
  { email: 'anna.garcia@website.com', type: 'personal', quality: 89 },
  { email: 'robert.martinez@place.com', type: 'personal', quality: 91 }
];

export default function InteractiveDataQualityMeter() {
  const [qualityThreshold, setQualityThreshold] = useState(50);

  const filteredEmails = sampleEmails.filter(email => email.quality >= qualityThreshold);
  const validLeads = filteredEmails.length;
  const totalEmails = sampleEmails.length;
  const percentage = Math.round((validLeads / totalEmails) * 100);

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBg = (quality: number) => {
    if (quality >= 80) return 'bg-green-50 border-green-300';
    if (quality >= 50) return 'bg-yellow-50 border-yellow-300';
    return 'bg-red-50 border-red-300';
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-6 h-6 text-white" />
          <h3 className="text-2xl font-bold text-white">
            Interactive Data Quality Meter
          </h3>
        </div>
        <p className="text-emerald-50 mt-2">
          Drag the slider to filter leads by email quality score
        </p>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-900">
              Quality Threshold
            </label>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-[#FFD666]">
                {qualityThreshold}
              </span>
              <span className="text-gray-500">/100</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={qualityThreshold}
              onChange={(e) => setQualityThreshold(Number(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right,
                  #ef4444 0%,
                  #ef4444 33%,
                  #eab308 33%,
                  #eab308 66%,
                  #22c55e 66%,
                  #22c55e 100%)`
              }}
            />
            <div
              className="absolute top-0 h-4 bg-white/60 rounded-lg pointer-events-none"
              style={{
                left: `${qualityThreshold}%`,
                right: 0
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className="text-red-600 font-semibold">Low (0-33)</span>
            <span className="text-yellow-600 font-semibold">Medium (34-66)</span>
            <span className="text-green-600 font-semibold">High (67-100)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center transform hover:scale-105 transition">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {validLeads}
            </div>
            <div className="text-sm text-gray-600">Valid Leads</div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center transform hover:scale-105 transition">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {percentage}%
            </div>
            <div className="text-sm text-gray-600">Pass Rate</div>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center transform hover:scale-105 transition">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {totalEmails - validLeads}
            </div>
            <div className="text-sm text-gray-600">Filtered Out</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>Low Quality Emails</span>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {sampleEmails.filter(e => e.quality < qualityThreshold).length}
              </span>
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sampleEmails
                .filter(email => email.quality < qualityThreshold)
                .map((email, index) => (
                  <div
                    key={index}
                    className={`
                      ${getQualityBg(email.quality)} border rounded-lg p-3
                      transition-all duration-300 opacity-40
                      ${email.quality < qualityThreshold ? 'animate-fade-out' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-600 line-through">
                          {email.email}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${getQualityColor(email.quality)}`}>
                        {email.quality}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>High Quality Emails</span>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {filteredEmails.length}
              </span>
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredEmails.map((email, index) => (
                <div
                  key={index}
                  className={`
                    ${getQualityBg(email.quality)} border-2 rounded-lg p-3
                    transition-all duration-300 transform hover:scale-102
                    animate-fade-in shadow-sm hover:shadow-md
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className={`w-4 h-4 ${email.type === 'personal' ? 'text-[#FFD666]' : 'text-gray-400'}`} />
                      <span className="text-sm font-mono text-gray-900 font-semibold">
                        {email.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold ${getQualityColor(email.quality)}`}>
                        {email.quality}
                      </span>
                      {email.type === 'personal' && (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-[#FFD666] to-[#FFC233] rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-2">
                Quality Filtering Results
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                By setting your quality threshold to <span className="font-bold">{qualityThreshold}</span>,
                you're filtering out <span className="font-bold">{totalEmails - validLeads}</span> low-quality emails
                and keeping <span className="font-bold">{validLeads}</span> high-quality leads.
                This means you'll spend less time on dead ends and more time closing deals.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0.4;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-fade-out {
          animation: fade-out 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
