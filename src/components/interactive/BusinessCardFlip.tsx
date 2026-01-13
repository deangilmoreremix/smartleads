import { useState } from 'react';
import { Mail, CheckCircle, TrendingUp, Briefcase } from 'lucide-react';

interface BusinessCard {
  id: number;
  businessName: string;
  industry: string;
  genericEmail: string;
  personalEmail: string;
  conversionRate: number;
}

const sampleBusinesses: BusinessCard[] = [
  {
    id: 1,
    businessName: "Joe's Pizza",
    industry: "Restaurant",
    genericEmail: "info@joespizza.com",
    personalEmail: "joe.marino@joespizza.com",
    conversionRate: 3.8
  },
  {
    id: 2,
    businessName: "Elite Fitness",
    industry: "Gym",
    genericEmail: "contact@elitefitness.com",
    personalEmail: "sarah.chen@elitefitness.com",
    conversionRate: 4.2
  },
  {
    id: 3,
    businessName: "Bright Dental",
    industry: "Healthcare",
    genericEmail: "reception@brightdental.com",
    personalEmail: "dr.patel@brightdental.com",
    conversionRate: 5.1
  },
  {
    id: 4,
    businessName: "Urban Realty",
    industry: "Real Estate",
    genericEmail: "info@urbanrealty.com",
    personalEmail: "mike.johnson@urbanrealty.com",
    conversionRate: 3.5
  }
];

export default function BusinessCardFlip() {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const toggleCard = (id: number) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(id)) {
      newFlipped.delete(id);
    } else {
      newFlipped.add(id);
    }
    setFlippedCards(newFlipped);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#FFD666] to-[#FFC233] p-6">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-6 h-6 text-gray-900" />
          <h3 className="text-2xl font-bold text-gray-900">
            Personal vs Generic Email Finder
          </h3>
        </div>
        <p className="text-gray-700 mt-2">
          Click on any card to reveal the personal decision-maker email
        </p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {sampleBusinesses.map((business) => {
            const isFlipped = flippedCards.has(business.id);
            return (
              <div
                key={business.id}
                className="relative h-64 cursor-pointer group"
                onClick={() => toggleCard(business.id)}
              >
                <div
                  className={`
                    absolute w-full h-full transition-all duration-500 transform-style-3d
                    ${isFlipped ? 'rotate-y-180' : ''}
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  <div
                    className="absolute w-full h-full backface-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 shadow-lg"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          {business.industry}
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-4">
                          {business.businessName}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Generic Email</span>
                          </div>
                          <div className="text-sm text-gray-700 font-mono">
                            {business.genericEmail}
                          </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                          <div className="text-xs text-red-600 font-semibold">
                            Low Response Rate
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        Click to flip
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute w-full h-full backface-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 shadow-xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="flex flex-col h-full justify-between relative">
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full animate-bounce">
                        <CheckCircle className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="text-xs text-green-600 uppercase tracking-wide mb-2 font-semibold">
                          {business.industry}
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-4">
                          {business.businessName}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border-2 border-[#FFD666] shadow-md">
                          <div className="flex items-center space-x-2 mb-1">
                            <Mail className="w-4 h-4 text-[#FFD666]" />
                            <span className="text-xs text-gray-700 font-semibold">
                              Personal Email
                            </span>
                          </div>
                          <div className="text-sm text-gray-900 font-mono font-bold">
                            {business.personalEmail}
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-100 to-green-50 border border-green-300 rounded-lg p-2">
                          <div className="flex items-center justify-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-700 font-bold">
                              {business.conversionRate}x Higher Conversion
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">68%</div>
              <div className="text-sm text-gray-700">
                Higher open rate with personal emails
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.2x</div>
              <div className="text-sm text-gray-700">
                Better conversion rate on average
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">89%</div>
              <div className="text-sm text-gray-700">
                Of decision-makers prefer direct contact
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
