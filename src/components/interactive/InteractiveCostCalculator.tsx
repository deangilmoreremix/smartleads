import { useState, useEffect } from 'react';
import { DollarSign, Clock, TrendingUp, Zap, Share2 } from 'lucide-react';

export default function InteractiveCostCalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(500);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);

  const [displayedTimeSaved, setDisplayedTimeSaved] = useState(0);
  const [displayedCostSaved, setDisplayedCostSaved] = useState(0);
  const [displayedROI, setDisplayedROI] = useState(0);

  const monthlyHours = hoursPerWeek * 4.33;
  const timeSavedPerMonth = monthlyHours * 0.85;
  const costSavedAnnually = timeSavedPerMonth * hourlyRate * 12;
  const platformCost = 997;
  const roi = ((costSavedAnnually - platformCost) / platformCost) * 100;

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setDisplayedTimeSaved(Math.floor(timeSavedPerMonth * progress));
      setDisplayedCostSaved(Math.floor(costSavedAnnually * progress));
      setDisplayedROI(Math.floor(roi * progress));

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayedTimeSaved(Math.floor(timeSavedPerMonth));
        setDisplayedCostSaved(Math.floor(costSavedAnnually));
        setDisplayedROI(Math.floor(roi));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [leadsPerMonth, hourlyRate, hoursPerWeek, timeSavedPerMonth, costSavedAnnually, roi]);

  const getROIColor = () => {
    if (displayedROI >= 1000) return 'text-green-600';
    if (displayedROI >= 500) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getROIBgColor = () => {
    if (displayedROI >= 1000) return 'bg-green-50 border-green-200';
    if (displayedROI >= 500) return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-white" />
          <h3 className="text-2xl font-bold text-white">
            ROI Calculator
          </h3>
        </div>
        <p className="text-green-50 mt-2">
          See how much time and money you'll save with automation
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-900">
                Leads per Month
              </label>
              <span className="text-2xl font-bold text-[#FFD666]">
                {leadsPerMonth.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={leadsPerMonth}
              onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FFD666 0%, #FFD666 ${(leadsPerMonth / 10000) * 100}%, #E5E7EB ${(leadsPerMonth / 10000) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>5,000</span>
              <span>10,000</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-900">
                Your Hourly Rate
              </label>
              <span className="text-2xl font-bold text-[#FFD666]">
                ${hourlyRate}
              </span>
            </div>
            <input
              type="range"
              min="25"
              max="500"
              step="25"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FFD666 0%, #FFD666 ${((hourlyRate - 25) / 475) * 100}%, #E5E7EB ${((hourlyRate - 25) / 475) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$25</span>
              <span>$250</span>
              <span>$500</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-900">
                Hours on Manual Outreach (per week)
              </label>
              <span className="text-2xl font-bold text-[#FFD666]">
                {hoursPerWeek}h
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FFD666 0%, #FFD666 ${(hoursPerWeek / 40) * 100}%, #E5E7EB ${(hoursPerWeek / 40) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0h</span>
              <span>20h</span>
              <span>40h</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Time Saved</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {displayedTimeSaved}h
            </div>
            <div className="text-xs text-gray-600">per month</div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Cost Saved</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              ${displayedCostSaved.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">per year</div>
          </div>

          <div className={`${getROIBgColor()} border-2 rounded-xl p-6 transform hover:scale-105 transition-transform`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className={`w-5 h-5 ${getROIColor()}`} />
              <span className="text-sm font-medium text-gray-700">ROI</span>
            </div>
            <div className={`text-3xl font-bold ${getROIColor()} mb-1`}>
              {displayedROI}%
            </div>
            <div className="text-xs text-gray-600">return on investment</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#FFD666] to-[#FFC233] rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Zap className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-2">
                Your Potential Savings
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                By automating your lead generation and outreach, you could save{' '}
                <span className="font-bold">{Math.floor(timeSavedPerMonth)} hours per month</span> and{' '}
                <span className="font-bold">${Math.floor(costSavedAnnually).toLocaleString()} per year</span>.
                That's a <span className="font-bold">{Math.floor(roi)}% ROI</span> in year one alone!
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Platform Cost:</span> $997/year
          </div>
          <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-4 py-2 rounded-lg transition">
            <Share2 className="w-4 h-4" />
            <span>Share Results</span>
          </button>
        </div>
      </div>
    </div>
  );
}
