import { useState, useEffect } from 'react';
import { MapPin, Search, Loader } from 'lucide-react';

interface Pin {
  id: number;
  x: number;
  y: number;
  name: string;
  category: string;
}

export default function InteractiveMapDemo() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [foundCount, setFoundCount] = useState(0);

  const businessNames = [
    'The Coffee House', 'Bella\'s Bistro', 'Tech Solutions Inc', 'Green Garden Spa',
    'Urban Fitness', 'The Book Nook', 'Prime Dental', 'Metro Yoga Studio',
    'Sunset Restaurant', 'Elite Auto Repair', 'Fresh Bakery', 'Design Studio Pro'
  ];

  const categories = ['Restaurant', 'Cafe', 'Fitness', 'Retail', 'Professional Services'];

  const startScanning = () => {
    setIsScanning(true);
    setPins([]);
    setFoundCount(0);

    let count = 0;
    const interval = setInterval(() => {
      if (count < 12) {
        const newPin: Pin = {
          id: count,
          x: Math.random() * 85 + 5,
          y: Math.random() * 85 + 5,
          name: businessNames[count],
          category: categories[Math.floor(Math.random() * categories.length)]
        };
        setPins(prev => [...prev, newPin]);
        setFoundCount(prev => prev + 1);
        count++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 400);
  };

  useEffect(() => {
    startScanning();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Live Lead Discovery</h3>
            <p className="text-sm text-gray-600">Scanning Google Maps...</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#FFD666]">{foundCount}</div>
          <div className="text-xs text-gray-600">Leads Found</div>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl h-80 overflow-hidden border border-gray-200">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            {[...Array(10)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${(i + 1) * 10}%`}
                y1="0"
                x2={`${(i + 1) * 10}%`}
                y2="100%"
                stroke="#000"
                strokeWidth="1"
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${(i + 1) * 12.5}%`}
                x2="100%"
                y2={`${(i + 1) * 12.5}%`}
                stroke="#000"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {pins.map((pin, index) => (
          <div
            key={pin.id}
            className="absolute transform -translate-x-1/2 -translate-y-full animate-bounce"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              animationDelay: `${index * 0.1}s`,
              animationDuration: '1s',
              animationIterationCount: '3'
            }}
          >
            <div className="relative group">
              <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg" fill="currentColor" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm">
                  <div className="font-semibold">{pin.name}</div>
                  <div className="text-xs text-gray-300">{pin.category}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isScanning && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <Loader className="w-12 h-12 text-[#FFD666] animate-spin" />
              <div className="absolute inset-0 bg-[#FFD666] rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={startScanning}
          disabled={isScanning}
          className="px-4 py-2 bg-[#FFD666] text-gray-900 rounded-lg font-semibold hover:bg-[#FFC233] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isScanning ? 'Scanning...' : 'Scan Again'}
        </button>
        <div className="text-sm text-gray-600">
          Click pins to see business details
        </div>
      </div>
    </div>
  );
}
