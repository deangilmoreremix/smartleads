import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

export default function ROICalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(500);
  const [conversionRate, setConversionRate] = useState(3);
  const [avgDealValue, setAvgDealValue] = useState(5000);

  const deals = Math.round((leadsPerMonth * conversionRate) / 100);
  const monthlyRevenue = deals * avgDealValue;
  const annualRevenue = monthlyRevenue * 12;
  const roi = Math.round(((monthlyRevenue - 99) / 99) * 100);

  return (
    <div className="bg-white border-2 border-[#FFD666] rounded-2xl p-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-[#FFD666] rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-gray-900" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">ROI Calculator</h3>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Leads per Month</label>
            <span className="text-lg font-bold text-[#FFD666]">{leadsPerMonth}</span>
          </div>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={leadsPerMonth}
            onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FFD666]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Conversion Rate</label>
            <span className="text-lg font-bold text-[#FFD666]">{conversionRate}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={conversionRate}
            onChange={(e) => setConversionRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FFD666]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Average Deal Value</label>
            <span className="text-lg font-bold text-[#FFD666]">${avgDealValue.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={avgDealValue}
            onChange={(e) => setAvgDealValue(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FFD666]"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#FFD666]/20 to-[#FFD666]/10 rounded-xl p-6 border border-[#FFD666]">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">New Deals/Month</div>
            <div className="text-3xl font-bold text-gray-900">{deals}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Monthly Revenue</div>
            <div className="text-3xl font-bold text-green-600">${monthlyRevenue.toLocaleString()}</div>
          </div>
        </div>
        <div className="pt-4 border-t border-[#FFD666]/30">
          <div className="text-sm text-gray-600 mb-1">Annual Revenue Potential</div>
          <div className="text-4xl font-bold text-gray-900 mb-2">${annualRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-700">
            ROI: <span className="font-bold text-[#FFD666]">{roi.toLocaleString()}%</span> return on $99/month investment
          </div>
        </div>
      </div>
    </div>
  );
}
