export default function GoogleMapsBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.05" />
          </filter>
        </defs>

        {/* Base background color */}
        <rect width="1920" height="1080" fill="#F5F1E8" />

        {/* Building blocks */}
        <g opacity="0.7">
          <rect x="100" y="80" width="180" height="140" fill="#E8E4DC" rx="2" />
          <rect x="320" y="90" width="150" height="120" fill="#E8E4DC" rx="2" />
          <rect x="510" y="70" width="200" height="160" fill="#E8E4DC" rx="2" />
          <rect x="760" y="100" width="140" height="130" fill="#E8E4DC" rx="2" />
          <rect x="950" y="85" width="190" height="145" fill="#E8E4DC" rx="2" />
          <rect x="1180" y="95" width="160" height="135" fill="#E8E4DC" rx="2" />
          <rect x="1390" y="75" width="170" height="155" fill="#E8E4DC" rx="2" />
          <rect x="1610" y="90" width="200" height="140" fill="#E8E4DC" rx="2" />

          <rect x="80" y="380" width="190" height="150" fill="#E8E4DC" rx="2" />
          <rect x="310" y="390" width="170" height="140" fill="#E8E4DC" rx="2" />
          <rect x="530" y="370" width="180" height="160" fill="#E8E4DC" rx="2" />
          <rect x="760" y="400" width="200" height="130" fill="#E8E4DC" rx="2" />
          <rect x="1010" y="385" width="150" height="145" fill="#E8E4DC" rx="2" />
          <rect x="1210" y="395" width="180" height="135" fill="#E8E4DC" rx="2" />
          <rect x="1440" y="375" width="160" height="155" fill="#E8E4DC" rx="2" />
          <rect x="1650" y="390" width="190" height="140" fill="#E8E4DC" rx="2" />

          <rect x="90" y="680" width="200" height="160" fill="#E8E4DC" rx="2" />
          <rect x="340" y="690" width="160" height="150" fill="#E8E4DC" rx="2" />
          <rect x="550" y="670" width="190" height="170" fill="#E8E4DC" rx="2" />
          <rect x="790" y="700" width="170" height="140" fill="#E8E4DC" rx="2" />
          <rect x="1010" y="685" width="180" height="155" fill="#E8E4DC" rx="2" />
          <rect x="1240" y="695" width="200" height="145" fill="#E8E4DC" rx="2" />
          <rect x="1490" y="675" width="150" height="165" fill="#E8E4DC" rx="2" />
          <rect x="1690" y="690" width="190" height="150" fill="#E8E4DC" rx="2" />
        </g>

        {/* Water bodies */}
        <g opacity="0.5">
          {/* River diagonal */}
          <path
            d="M 1200 0 Q 1150 150, 1100 300 Q 1050 450, 1000 600 Q 950 750, 900 900 Q 850 1000, 800 1080"
            fill="none"
            stroke="#B8D4E8"
            strokeWidth="100"
            strokeLinecap="round"
          />
          {/* Park/pond areas */}
          <ellipse cx="400" cy="250" rx="90" ry="60" fill="#B8D4E8" />
          <ellipse cx="1500" cy="550" rx="80" ry="70" fill="#B8D4E8" />
        </g>

        {/* Major roads - thick yellow */}
        <g filter="url(#shadow)">
          {/* Horizontal major road upper */}
          <path
            d="M 0 280 Q 400 270, 800 285 Q 1200 295, 1600 280 L 1920 275"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Horizontal major road middle */}
          <path
            d="M 0 580 Q 500 575, 1000 585 Q 1500 590, 1920 580"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Diagonal road top-left to bottom-right */}
          <path
            d="M 0 100 Q 300 200, 600 350 Q 900 500, 1200 700 Q 1500 900, 1920 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Vertical road left */}
          <path
            d="M 300 0 Q 295 300, 305 600 Q 310 900, 300 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Vertical road center */}
          <path
            d="M 960 0 Q 955 350, 965 700 Q 970 900, 960 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Vertical road right */}
          <path
            d="M 1600 0 Q 1595 300, 1605 600 Q 1610 900, 1600 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </g>

        {/* Minor roads - thin yellow */}
        <g filter="url(#shadow)" opacity="0.8">
          {/* Horizontal minor roads */}
          <line x1="0" y1="150" x2="1920" y2="155" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="0" y1="430" x2="1920" y2="425" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="0" y1="730" x2="1920" y2="735" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="0" y1="900" x2="1920" y2="895" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />

          {/* Vertical minor roads */}
          <line x1="150" y1="0" x2="155" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="520" y1="0" x2="525" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="750" y1="0" x2="755" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="1190" y1="0" x2="1195" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="1420" y1="0" x2="1425" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="1770" y1="0" x2="1775" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />

          {/* Connecting roads */}
          <path
            d="M 600 0 Q 650 200, 700 400"
            fill="none"
            stroke="#FFE699"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 1300 500 Q 1350 650, 1400 800"
            fill="none"
            stroke="#FFE699"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>

        {/* Road intersections - small circles */}
        <g fill="#FFD666" opacity="0.9">
          <circle cx="300" cy="280" r="8" />
          <circle cx="960" cy="280" r="8" />
          <circle cx="1600" cy="280" r="8" />
          <circle cx="300" cy="580" r="8" />
          <circle cx="960" cy="580" r="8" />
          <circle cx="1600" cy="580" r="8" />
        </g>
      </svg>
    </div>
  );
}
