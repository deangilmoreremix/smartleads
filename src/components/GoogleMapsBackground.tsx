interface GoogleMapsBackgroundProps {
  variant?: 'default' | 'search-radius' | 'communication-network' | 'activity-map' | 'email-pipeline' | 'email-scheduler' | 'multi-inbox';
}

export default function GoogleMapsBackground({ variant = 'default' }: GoogleMapsBackgroundProps) {
  if (variant === 'search-radius') {
    return <SearchRadiusMap />;
  }

  if (variant === 'communication-network') {
    return <CommunicationNetworkMap />;
  }

  if (variant === 'activity-map') {
    return <ActivityMap />;
  }

  if (variant === 'email-pipeline') {
    return <EmailPipelineMap />;
  }

  if (variant === 'email-scheduler') {
    return <EmailSchedulerMap />;
  }

  if (variant === 'multi-inbox') {
    return <MultiInboxMap />;
  }

  return <DefaultMap />;
}

function DefaultMap() {
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

        <rect width="1920" height="1080" fill="#F5F1E8" />

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

        <g opacity="0.5">
          <path
            d="M 1200 0 Q 1150 150, 1100 300 Q 1050 450, 1000 600 Q 950 750, 900 900 Q 850 1000, 800 1080"
            fill="none"
            stroke="#B8D4E8"
            strokeWidth="100"
            strokeLinecap="round"
          />
          <ellipse cx="400" cy="250" rx="90" ry="60" fill="#B8D4E8" />
          <ellipse cx="1500" cy="550" rx="80" ry="70" fill="#B8D4E8" />
        </g>

        <g filter="url(#shadow)">
          <path
            d="M 0 280 Q 400 270, 800 285 Q 1200 295, 1600 280 L 1920 275"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 0 580 Q 500 575, 1000 585 Q 1500 590, 1920 580"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 0 100 Q 300 200, 600 350 Q 900 500, 1200 700 Q 1500 900, 1920 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 300 0 Q 295 300, 305 600 Q 310 900, 300 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 960 0 Q 955 350, 965 700 Q 970 900, 960 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 1600 0 Q 1595 300, 1605 600 Q 1610 900, 1600 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </g>

        <g filter="url(#shadow)" opacity="0.8">
          <line x1="0" y1="150" x2="1920" y2="155" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="0" y1="430" x2="1920" y2="425" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="0" y1="730" x2="1920" y2="735" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="0" y1="900" x2="1920" y2="895" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />

          <line x1="150" y1="0" x2="155" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="520" y1="0" x2="525" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="750" y1="0" x2="755" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="1190" y1="0" x2="1195" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="1420" y1="0" x2="1425" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />
          <line x1="1770" y1="0" x2="1775" y2="1080" stroke="#FFE699" strokeWidth="7" strokeLinecap="round" />

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

function SearchRadiusMap() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="targetZone" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="#FFA500" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#FFD666" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="searchPulse" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFD666" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#FFD666" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <rect width="1920" height="1080" fill="#F5F1E8" />

        <g opacity="0.6">
          <rect x="120" y="100" width="160" height="120" fill="#E8E4DC" rx="2">
            <animate attributeName="opacity" values="0.6;0.8;0.6" dur="4s" repeatCount="indefinite"/>
          </rect>
          <rect x="340" y="110" width="140" height="110" fill="#E8E4DC" rx="2"/>
          <rect x="530" y="90" width="180" height="140" fill="#E8E4DC" rx="2">
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="5s" repeatCount="indefinite"/>
          </rect>
          <rect x="780" y="120" width="130" height="120" fill="#E8E4DC" rx="2"/>
          <rect x="970" y="105" width="170" height="135" fill="#E8E4DC" rx="2">
            <animate attributeName="opacity" values="0.6;0.85;0.6" dur="4.5s" repeatCount="indefinite"/>
          </rect>
          <rect x="1200" y="115" width="150" height="125" fill="#E8E4DC" rx="2"/>
          <rect x="1410" y="95" width="160" height="145" fill="#E8E4DC" rx="2"/>
          <rect x="1630" y="110" width="180" height="130" fill="#E8E4DC" rx="2">
            <animate attributeName="opacity" values="0.6;0.8;0.6" dur="3.8s" repeatCount="indefinite"/>
          </rect>
        </g>

        <ellipse cx="600" cy="400" rx="280" ry="200" fill="url(#targetZone)">
          <animate attributeName="rx" values="280;320;280" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="200;230;200" dur="3s" repeatCount="indefinite"/>
        </ellipse>

        <ellipse cx="1400" cy="650" rx="250" ry="180" fill="url(#targetZone)">
          <animate attributeName="rx" values="250;290;250" dur="3.5s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="180;210;180" dur="3.5s" repeatCount="indefinite"/>
        </ellipse>

        <circle cx="600" cy="400" r="150" fill="none" stroke="#FF6B35" strokeWidth="2" opacity="0.4">
          <animate attributeName="r" values="50;250;50" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite"/>
        </circle>

        <circle cx="1400" cy="650" r="150" fill="none" stroke="#FF6B35" strokeWidth="2" opacity="0.4">
          <animate attributeName="r" values="50;230;50" dur="3.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6" dur="3.5s" repeatCount="indefinite"/>
        </circle>

        <g filter="url(#glow)">
          <path
            d="M 0 280 Q 400 270, 800 285 Q 1200 295, 1600 280 L 1920 275"
            fill="none"
            stroke="#FFD666"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 0 580 Q 500 575, 1000 585 Q 1500 590, 1920 580"
            fill="none"
            stroke="#FFD666"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 300 0 Q 295 300, 305 600 Q 310 900, 300 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 960 0 Q 955 350, 965 700 Q 970 900, 960 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 1600 0 Q 1595 300, 1605 600 Q 1610 900, 1600 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </g>

        <g opacity="0.7">
          <line x1="0" y1="150" x2="1920" y2="155" stroke="#FFE699" strokeWidth="6" strokeLinecap="round" />
          <line x1="0" y1="430" x2="1920" y2="425" stroke="#FFE699" strokeWidth="6" strokeLinecap="round" />
          <line x1="0" y1="730" x2="1920" y2="735" stroke="#FFE699" strokeWidth="6" strokeLinecap="round" />
        </g>

        <g filter="url(#glow)">
          <path d="M 600 395 L 600 380 L 590 390 L 610 390 Z" fill="#FF6B35">
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.15;1"
              dur="2s"
              repeatCount="indefinite"
              additive="sum"/>
          </path>
          <circle cx="600" cy="400" r="8" fill="#FF6B35" opacity="0.8"/>

          <path d="M 450 275 L 450 260 L 440 270 L 460 270 Z" fill="#FFA500">
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.1;1"
              dur="2.2s"
              repeatCount="indefinite"
              additive="sum"/>
          </path>
          <circle cx="450" cy="280" r="7" fill="#FFA500" opacity="0.8"/>

          <path d="M 750 410 L 750 395 L 740 405 L 760 405 Z" fill="#FFA500">
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.12;1"
              dur="1.9s"
              repeatCount="indefinite"
              additive="sum"/>
          </path>
          <circle cx="750" cy="415" r="7" fill="#FFA500" opacity="0.8"/>

          <path d="M 1400 645 L 1400 630 L 1390 640 L 1410 640 Z" fill="#FF6B35">
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.15;1"
              dur="2.5s"
              repeatCount="indefinite"
              additive="sum"/>
          </path>
          <circle cx="1400" cy="650" r="8" fill="#FF6B35" opacity="0.8"/>

          <path d="M 1250 560 L 1250 545 L 1240 555 L 1260 555 Z" fill="#FFA500">
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.1;1"
              dur="2.1s"
              repeatCount="indefinite"
              additive="sum"/>
          </path>
          <circle cx="1250" cy="565" r="7" fill="#FFA500" opacity="0.8"/>

          <path d="M 1550 720 L 1550 705 L 1540 715 L 1560 715 Z" fill="#FFA500">
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.13;1"
              dur="2.3s"
              repeatCount="indefinite"
              additive="sum"/>
          </path>
          <circle cx="1550" cy="725" r="7" fill="#FFA500" opacity="0.8"/>
        </g>

        <g fill="#FFD666" opacity="0.9">
          <circle cx="300" cy="280" r="6" />
          <circle cx="960" cy="280" r="6" />
          <circle cx="1600" cy="280" r="6" />
          <circle cx="300" cy="580" r="6" />
          <circle cx="960" cy="580" r="6" />
          <circle cx="1600" cy="580" r="6" />
        </g>
      </svg>
    </div>
  );
}

function CommunicationNetworkMap() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0"/>
            <stop offset="50%" stopColor="#60A5FA" stopOpacity="1"/>
            <stop offset="100%" stopColor="#FFD666" stopOpacity="0"/>
          </linearGradient>
          <filter id="emailGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="#F5F1E8" />

        <g opacity="0.65">
          <rect x="140" y="120" width="150" height="110" fill="#E0E7F0" rx="2"/>
          <rect x="360" y="130" width="130" height="100" fill="#E0E7F0" rx="2"/>
          <rect x="550" y="110" width="170" height="130" fill="#E0E7F0" rx="2"/>
          <rect x="800" y="140" width="120" height="110" fill="#E0E7F0" rx="2"/>
          <rect x="990" y="125" width="160" height="125" fill="#E0E7F0" rx="2"/>
          <rect x="1220" y="135" width="140" height="115" fill="#E0E7F0" rx="2"/>
          <rect x="1430" y="115" width="150" height="135" fill="#E0E7F0" rx="2"/>
          <rect x="1650" y="130" width="170" height="120" fill="#E0E7F0" rx="2"/>
        </g>

        <g stroke="#60A5FA" strokeWidth="2" opacity="0.4" fill="none">
          <line x1="215" y1="175" x2="425" y2="180">
            <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="2s" repeatCount="indefinite"/>
          </line>
          <line x1="425" y1="180" x2="635" y2="175">
            <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="2.2s" repeatCount="indefinite"/>
          </line>
          <line x1="635" y1="175" x2="860" y2="195">
            <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="2.5s" repeatCount="indefinite"/>
          </line>
          <line x1="860" y1="195" x2="1070" y2="187">
            <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="2.3s" repeatCount="indefinite"/>
          </line>
          <line x1="1070" y1="187" x2="1290" y2="192">
            <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="2.1s" repeatCount="indefinite"/>
          </line>
          <line x1="1290" y1="192" x2="1505" y2="182">
            <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="2.4s" repeatCount="indefinite"/>
          </line>
          <line x1="1505" y1="182" x2="1735" y2="190">
            <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="2.6s" repeatCount="indefinite"/>
          </line>

          <path d="M 215 175 Q 540 350, 860 195">
            <animate attributeName="stroke-dasharray" values="0,800;800,0" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M 860 195 Q 1200 380, 1505 182">
            <animate attributeName="stroke-dasharray" values="0,800;800,0" dur="3.2s" repeatCount="indefinite"/>
          </path>
        </g>

        <g filter="url(#emailGlow)">
          <circle cx="215" cy="175" r="10" fill="#60A5FA" opacity="0.7">
            <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="425" cy="180" r="10" fill="#60A5FA" opacity="0.7">
            <animate attributeName="r" values="10;14;10" dur="2.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="635" cy="175" r="10" fill="#60A5FA" opacity="0.7">
            <animate attributeName="r" values="10;14;10" dur="2.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="860" cy="195" r="10" fill="#60A5FA" opacity="0.7">
            <animate attributeName="r" values="10;14;10" dur="2.1s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1070" cy="187" r="10" fill="#60A5FA" opacity="0.7">
            <animate attributeName="r" values="10;14;10" dur="2.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1290" cy="192" r="10" fill="#60A5FA" opacity="0.7">
            <animate attributeName="r" values="10;14;10" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1505" cy="182" r="10" fill="#60A5FA" opacity="0.7">
            <animate attributeName="r" values="10;14;10" dur="2.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1735" cy="190" r="10" fill="#60A5FA" opacity="0.7">
            <animate attributeName="r" values="10;14;10" dur="2.6s" repeatCount="indefinite"/>
          </circle>
        </g>

        <g filter="url(#emailGlow)" opacity="0.9">
          <g transform="translate(425, 180)">
            <rect x="-8" y="-6" width="16" height="12" rx="1" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="1.5"/>
            <path d="M -8 -6 L 0 0 L 8 -6" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="425,180; 530,178; 635,175" dur="2s" repeatCount="indefinite"/>
          </g>

          <g transform="translate(860, 195)">
            <rect x="-8" y="-6" width="16" height="12" rx="1" fill="#FFFFFF" stroke="#FFD666" strokeWidth="1.5"/>
            <path d="M -8 -6 L 0 0 L 8 -6" fill="none" stroke="#FFD666" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="860,195; 965,191; 1070,187" dur="2.3s" repeatCount="indefinite"/>
          </g>

          <g transform="translate(1290, 192)">
            <rect x="-8" y="-6" width="16" height="12" rx="1" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="1.5"/>
            <path d="M -8 -6 L 0 0 L 8 -6" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="1290,192; 1397,187; 1505,182" dur="2.4s" repeatCount="indefinite"/>
          </g>
        </g>

        <g opacity="0.8">
          <path
            d="M 0 280 Q 400 270, 800 285 Q 1200 295, 1600 280 L 1920 275"
            fill="none"
            stroke="#B8D4E8"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 0 580 Q 500 575, 1000 585 Q 1500 590, 1920 580"
            fill="none"
            stroke="#B8D4E8"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 300 0 Q 295 300, 305 600 Q 310 900, 300 1080"
            fill="none"
            stroke="#B8D4E8"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 960 0 Q 955 350, 965 700 Q 970 900, 960 1080"
            fill="none"
            stroke="#B8D4E8"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>

        <g opacity="0.6">
          <line x1="0" y1="150" x2="1920" y2="155" stroke="#D0E0F0" strokeWidth="5" strokeLinecap="round" />
          <line x1="0" y1="430" x2="1920" y2="425" stroke="#D0E0F0" strokeWidth="5" strokeLinecap="round" />
        </g>

        <g fill="#60A5FA" opacity="0.8">
          <circle cx="300" cy="280" r="5" />
          <circle cx="960" cy="280" r="5" />
          <circle cx="1600" cy="280" r="5" />
          <circle cx="300" cy="580" r="5" />
          <circle cx="960" cy="580" r="5" />
          <circle cx="1600" cy="580" r="5" />
        </g>
      </svg>
    </div>
  );
}

function ActivityMap() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="dayNightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE5B4" stopOpacity="0.6">
              <animate attributeName="stop-color"
                values="#FFE5B4;#2A2A4A;#FFE5B4"
                dur="10s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" stopColor="#FFD666" stopOpacity="0.4">
              <animate attributeName="stop-color"
                values="#FFD666;#1A1A3A;#FFD666"
                dur="10s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="#F5F1E8" stopOpacity="1"/>
          </linearGradient>
          <filter id="windowGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#dayNightGradient)" />

        <g opacity="0.75">
          <g>
            <rect x="120" y="90" width="170" height="130" fill="#D8D4CC" rx="2"/>
            <g filter="url(#windowGlow)">
              <rect x="135" y="105" width="18" height="18" fill="#FFA500" opacity="0.7">
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite"/>
              </rect>
              <rect x="158" y="105" width="18" height="18" fill="#FFA500" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite"/>
              </rect>
              <rect x="135" y="128" width="18" height="18" fill="#FFA500" opacity="0.6">
                <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3.2s" repeatCount="indefinite"/>
              </rect>
            </g>
          </g>

          <g>
            <rect x="360" y="110" width="140" height="110" fill="#D8D4CC" rx="2"/>
            <g filter="url(#windowGlow)">
              <rect x="375" y="125" width="16" height="16" fill="#FFD666" opacity="0.75">
                <animate attributeName="opacity" values="0.5;0.95;0.5" dur="2.8s" repeatCount="indefinite"/>
              </rect>
              <rect x="396" y="125" width="16" height="16" fill="#FFD666" opacity="0.85">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.3s" repeatCount="indefinite"/>
              </rect>
            </g>
          </g>

          <g>
            <rect x="570" y="100" width="160" height="125" fill="#D8D4CC" rx="2"/>
            <g filter="url(#windowGlow)">
              <rect x="585" y="115" width="17" height="17" fill="#FFA500" opacity="0.7">
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.6s" repeatCount="indefinite"/>
              </rect>
              <rect x="607" y="115" width="17" height="17" fill="#FFA500" opacity="0.9">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.9s" repeatCount="indefinite"/>
              </rect>
              <rect x="585" y="137" width="17" height="17" fill="#FFD666" opacity="0.6">
                <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3.1s" repeatCount="indefinite"/>
              </rect>
            </g>
          </g>

          <g>
            <rect x="810" y="130" width="135" height="105" fill="#D8D4CC" rx="2"/>
            <g filter="url(#windowGlow)">
              <rect x="825" y="145" width="15" height="15" fill="#10B981" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/>
              </rect>
              <circle cx="833" cy="153" r="6" fill="#10B981" opacity="0.9">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
              </circle>
            </g>
          </g>

          <g>
            <rect x="1010" y="115" width="155" height="120" fill="#D8D4CC" rx="2"/>
            <g filter="url(#windowGlow)">
              <rect x="1025" y="130" width="16" height="16" fill="#FFA500" opacity="0.8">
                <animate attributeName="opacity" values="0.4;0.95;0.4" dur="2.7s" repeatCount="indefinite"/>
              </rect>
              <rect x="1046" y="130" width="16" height="16" fill="#FFD666" opacity="0.7">
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite"/>
              </rect>
            </g>
          </g>

          <g>
            <rect x="1240" y="125" width="145" height="115" fill="#D8D4CC" rx="2"/>
            <g filter="url(#windowGlow)">
              <rect x="1255" y="140" width="17" height="17" fill="#FFA500" opacity="0.75">
                <animate attributeName="opacity" values="0.35;0.9;0.35" dur="2.5s" repeatCount="indefinite"/>
              </rect>
            </g>
          </g>

          <g>
            <rect x="1460" y="105" width="150" height="130" fill="#D8D4CC" rx="2"/>
            <g filter="url(#windowGlow)">
              <rect x="1475" y="120" width="18" height="18" fill="#FFD666" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite"/>
              </rect>
              <rect x="1498" y="120" width="18" height="18" fill="#FFA500" opacity="0.9">
                <animate attributeName="opacity" values="0.5;0.95;0.5" dur="2.2s" repeatCount="indefinite"/>
              </rect>
            </g>
          </g>

          <g>
            <rect x="1680" y="120" width="165" height="118" fill="#D8D4CC" rx="2"/>
            <g filter="url(#windowGlow)">
              <rect x="1695" y="135" width="16" height="16" fill="#FFA500" opacity="0.85">
                <animate attributeName="opacity" values="0.45;0.95;0.45" dur="2.6s" repeatCount="indefinite"/>
              </rect>
            </g>
          </g>
        </g>

        <g>
          <path
            d="M 0 280 Q 400 270, 800 285 Q 1200 295, 1600 280 L 1920 275"
            fill="none"
            stroke="#FFD666"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx="400" cy="273" r="4" fill="#10B981">
            <animateMotion path="M 0 0 Q 200 7.5, 400 10 Q 600 7.5, 800 5 L 1120 5" dur="6s" repeatCount="indefinite"/>
          </circle>

          <path
            d="M 0 580 Q 500 575, 1000 585 Q 1500 590, 1920 580"
            fill="none"
            stroke="#FFD666"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx="500" cy="576" r="4" fill="#10B981">
            <animateMotion path="M 0 0 Q 250 2.5, 500 5 Q 750 7.5, 1000 5 L 1420 0" dur="7s" repeatCount="indefinite"/>
          </circle>

          <path
            d="M 300 0 Q 295 300, 305 600 Q 310 900, 300 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx="298" cy="150" r="4" fill="#10B981">
            <animateMotion path="M 0 0 Q -2.5 150, 2.5 300 Q 5 450, 0 600 Q -5 750, 0 930" dur="8s" repeatCount="indefinite"/>
          </circle>

          <path
            d="M 960 0 Q 955 350, 965 700 Q 970 900, 960 1080"
            fill="none"
            stroke="#FFD666"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx="958" cy="200" r="4" fill="#10B981">
            <animateMotion path="M 0 0 Q -2.5 175, 2.5 350 Q 5 525, 0 880" dur="8.5s" repeatCount="indefinite"/>
          </circle>
        </g>

        <g opacity="0.7">
          <line x1="0" y1="150" x2="1920" y2="155" stroke="#FFE699" strokeWidth="6" strokeLinecap="round" />
          <line x1="0" y1="430" x2="1920" y2="425" stroke="#FFE699" strokeWidth="6" strokeLinecap="round" />
        </g>

        <g filter="url(#windowGlow)">
          <circle cx="300" cy="280" r="6" fill="#10B981" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="960" cy="280" r="6" fill="#10B981" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1600" cy="280" r="6" fill="#10B981" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.1s" repeatCount="indefinite"/>
          </circle>
          <circle cx="300" cy="580" r="6" fill="#10B981" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="960" cy="580" r="6" fill="#10B981" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1600" cy="580" r="6" fill="#10B981" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    </div>
  );
}

function EmailPipelineMap() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="conveyorBelt" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8E4DC"/>
            <stop offset="50%" stopColor="#D8D4CC"/>
            <stop offset="100%" stopColor="#E8E4DC"/>
          </linearGradient>
          <linearGradient id="emailProgress" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9CA3AF"/>
            <stop offset="33%" stopColor="#FFD666"/>
            <stop offset="66%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#10B981"/>
          </linearGradient>
          <filter id="processingGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="#F5F1E8" />

        <rect x="0" y="400" width="1920" height="280" fill="url(#conveyorBelt)" opacity="0.3"/>
        <rect x="0" y="420" width="1920" height="8" fill="#B8B4AC" opacity="0.4">
          <animate attributeName="x" values="0;-40;0" dur="2s" repeatCount="indefinite"/>
        </rect>
        <rect x="0" y="652" width="1920" height="8" fill="#B8B4AC" opacity="0.4">
          <animate attributeName="x" values="0;-40;0" dur="2s" repeatCount="indefinite"/>
        </rect>

        <g filter="url(#processingGlow)">
          <g opacity="0.9">
            <rect x="200" y="480" rx="12" ry="12" width="120" height="120" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="3"/>
            <text x="260" y="535" fontSize="14" fontWeight="bold" fill="#6B7280" textAnchor="middle">Scraping</text>
            <circle cx="260" cy="555" r="12" fill="#9CA3AF">
              <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </g>

          <g opacity="0.9">
            <rect x="550" y="480" rx="12" ry="12" width="120" height="120" fill="#FFFFFF" stroke="#FFD666" strokeWidth="3"/>
            <text x="610" y="535" fontSize="14" fontWeight="bold" fill="#D97706" textAnchor="middle">Enriching</text>
            <circle cx="610" cy="555" r="12" fill="#FFD666">
              <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </g>

          <g opacity="0.9">
            <rect x="900" y="480" rx="12" ry="12" width="140" height="120" fill="#FFFFFF" stroke="#FFA500" strokeWidth="3"/>
            <text x="970" y="535" fontSize="14" fontWeight="bold" fill="#EA580C" textAnchor="middle">Personalizing</text>
            <circle cx="970" cy="555" r="12" fill="#FFA500">
              <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </g>

          <g opacity="0.9">
            <rect x="1280" y="480" rx="12" ry="12" width="120" height="120" fill="#FFFFFF" stroke="#10B981" strokeWidth="3"/>
            <text x="1340" y="535" fontSize="14" fontWeight="bold" fill="#059669" textAnchor="middle">Sending</text>
            <circle cx="1340" cy="555" r="12" fill="#10B981">
              <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </g>
        </g>

        <g>
          <g>
            <rect x="100" y="520" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M 100 520 L 115 530 L 130 520" fill="none" stroke="#9CA3AF" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 450,0" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;1;0" dur="3s" repeatCount="indefinite"/>
          </g>

          <g>
            <rect x="100" y="520" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#FFD666" strokeWidth="1.5"/>
            <path d="M 100 520 L 115 530 L 130 520" fill="none" stroke="#FFD666" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 800,0" dur="6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;1;1;1;0" dur="6s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1"/>
          </g>

          <g>
            <rect x="100" y="560" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#FFA500" strokeWidth="1.5"/>
            <path d="M 100 560 L 115 570 L 130 560" fill="none" stroke="#FFA500" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 1150,0" dur="9s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0;1;1;1;0" dur="9s" repeatCount="indefinite" keyTimes="0;0.3;0.5;0.7;0.9;1"/>
          </g>

          <g>
            <rect x="100" y="560" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#10B981" strokeWidth="2"/>
            <path d="M 100 560 L 115 570 L 130 560" fill="none" stroke="#10B981" strokeWidth="2"/>
            <circle cx="120" cy="565" r="3" fill="#10B981"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 1500,0" dur="12s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0;0;1;1;1" dur="12s" repeatCount="indefinite" keyTimes="0;0.4;0.6;0.75;0.9;1"/>
          </g>

          <g>
            <rect x="150" y="530" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M 150 530 L 165 540 L 180 530" fill="none" stroke="#9CA3AF" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 450,0" dur="3s" begin="0.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;1;0" dur="3s" begin="0.5s" repeatCount="indefinite"/>
          </g>

          <g>
            <rect x="150" y="530" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#FFD666" strokeWidth="1.5"/>
            <path d="M 150 530 L 165 540 L 180 530" fill="none" stroke="#FFD666" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 800,0" dur="6s" begin="0.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;1;1;1;0" dur="6s" begin="0.5s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1"/>
          </g>

          <g>
            <rect x="150" y="570" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#FFA500" strokeWidth="1.5"/>
            <path d="M 150 570 L 165 580 L 180 570" fill="none" stroke="#FFA500" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 1150,0" dur="9s" begin="0.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0;1;1;1;0" dur="9s" begin="0.5s" repeatCount="indefinite" keyTimes="0;0.3;0.5;0.7;0.9;1"/>
          </g>

          <g>
            <rect x="200" y="545" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M 200 545 L 215 555 L 230 545" fill="none" stroke="#9CA3AF" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 450,0" dur="3s" begin="1s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;1;0" dur="3s" begin="1s" repeatCount="indefinite"/>
          </g>
        </g>

        <g opacity="0.4">
          <text x="1600" y="460" fontSize="24" fontWeight="bold" fill="#059669">500+ per day</text>
          <path d="M 1550 470 L 1570 470 L 1565 465 M 1570 470 L 1565 475" stroke="#059669" strokeWidth="2" fill="none"/>
        </g>

        <g opacity="0.7">
          <circle cx="260" cy="540" r="25" fill="none" stroke="#FFD666" strokeWidth="2">
            <animate attributeName="r" values="25;40;25" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="610" cy="540" r="25" fill="none" stroke="#FFA500" strokeWidth="2">
            <animate attributeName="r" values="25;40;25" dur="2s" begin="0.3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" begin="0.3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="970" cy="540" r="25" fill="none" stroke="#10B981" strokeWidth="2">
            <animate attributeName="r" values="25;40;25" dur="2s" begin="0.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" begin="0.6s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    </div>
  );
}

function EmailSchedulerMap() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="clockGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFD666" stopOpacity="0.4"/>
            <stop offset="50%" stopColor="#FFD666" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#FFD666" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="dayNight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.3">
              <animate attributeName="stopColor" values="#1E3A8A;#FFA500;#1E3A8A" dur="20s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.2">
              <animate attributeName="stopColor" values="#60A5FA;#FFD666;#60A5FA" dur="20s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="#F5F1E8" stopOpacity="0"/>
          </linearGradient>
          <filter id="emailLaunchGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="#F5F1E8" />
        <rect width="1920" height="1080" fill="url(#dayNight)" />

        <circle cx="960" cy="540" r="280" fill="url(#clockGlow)"/>

        <circle cx="960" cy="540" r="220" fill="none" stroke="#E8E4DC" strokeWidth="8"/>
        <circle cx="960" cy="540" r="200" fill="none" stroke="#D8D4CC" strokeWidth="4"/>

        <g stroke="#B8B4AC" strokeWidth="2">
          <line x1="960" y1="360" x2="960" y2="380"/>
          <line x1="1140" y1="540" x2="1120" y2="540"/>
          <line x1="960" y1="720" x2="960" y2="700"/>
          <line x1="780" y1="540" x2="800" y2="540"/>
        </g>

        <g stroke="#D8D4CC" strokeWidth="1.5">
          <line x1="1056" y1="383" x2="1046" y2="398"/>
          <line x1="1117" y1="463" x2="1102" y2="473"/>
          <line x1="1117" y1="617" x2="1102" y2="607"/>
          <line x1="1056" y1="697" x2="1046" y2="682"/>
          <line x1="864" y1="697" x2="874" y2="682"/>
          <line x1="803" y1="617" x2="818" y2="607"/>
          <line x1="803" y1="463" x2="818" y2="473"/>
          <line x1="864" y1="383" x2="874" y2="398"/>
        </g>

        <g filter="url(#emailLaunchGlow)">
          <line x1="960" y1="540" x2="960" y2="420" stroke="#FFA500" strokeWidth="6" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate"
              values="0 960 540; 360 960 540" dur="10s" repeatCount="indefinite"/>
          </line>
          <line x1="960" y1="540" x2="1040" y2="540" stroke="#FFD666" strokeWidth="4" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate"
              values="0 960 540; 360 960 540" dur="120s" repeatCount="indefinite"/>
          </line>
        </g>

        <circle cx="960" cy="540" r="15" fill="#FFD666" stroke="#FFA500" strokeWidth="2"/>

        <g filter="url(#emailLaunchGlow)">
          <g opacity="0.9">
            <rect x="945" y="370" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="2"/>
            <path d="M 945 370 L 960 380 L 975 370" fill="none" stroke="#60A5FA" strokeWidth="2"/>
            <text x="960" y="360" fontSize="12" fill="#6B7280" textAnchor="middle">9am</text>
          </g>

          <g opacity="0.9">
            <rect x="1105" y="525" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#10B981" strokeWidth="2"/>
            <path d="M 1105 525 L 1120 535 L 1135 525" fill="none" stroke="#10B981" strokeWidth="2"/>
            <text x="1140" y="540" fontSize="12" fill="#6B7280" textAnchor="start">2pm</text>
          </g>

          <g opacity="0.9">
            <rect x="945" y="700" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#FFA500" strokeWidth="2"/>
            <path d="M 945 700 L 960 710 L 975 700" fill="none" stroke="#FFA500" strokeWidth="2"/>
            <text x="960" y="735" fontSize="12" fill="#6B7280" textAnchor="middle">6pm</text>
          </g>

          <g opacity="0.9">
            <rect x="775" y="525" width="30" height="20" rx="2" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2"/>
            <path d="M 775 525 L 790 535 L 805 525" fill="none" stroke="#8B5CF6" strokeWidth="2"/>
            <text x="765" y="540" fontSize="12" fill="#6B7280" textAnchor="end">11pm</text>
          </g>
        </g>

        <g>
          <path d="M 960 370 Q 1200 300 1400 400" stroke="#60A5FA" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite"/>
          </path>
          <circle cx="1400" cy="400" r="6" fill="#60A5FA">
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
          </circle>
        </g>

        <g>
          <path d="M 1120 540 Q 1300 500 1450 600" stroke="#10B981" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" begin="0.5s" repeatCount="indefinite"/>
          </path>
          <circle cx="1450" cy="600" r="6" fill="#10B981">
            <animate attributeName="r" values="6;10;6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
          </circle>
        </g>

        <g>
          <path d="M 960 710 Q 700 750 500 680" stroke="#FFA500" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" begin="1s" repeatCount="indefinite"/>
          </path>
          <circle cx="500" cy="680" r="6" fill="#FFA500">
            <animate attributeName="r" values="6;10;6" dur="2s" begin="1s" repeatCount="indefinite"/>
          </circle>
        </g>

        <g>
          <path d="M 790 540 Q 600 450 450 500" stroke="#8B5CF6" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" begin="1.5s" repeatCount="indefinite"/>
          </path>
          <circle cx="450" cy="500" r="6" fill="#8B5CF6">
            <animate attributeName="r" values="6;10;6" dur="2s" begin="1.5s" repeatCount="indefinite"/>
          </circle>
        </g>

        <g opacity="0.6">
          <circle cx="1400" cy="300" r="40" fill="#FFA500" opacity="0.8">
            <animate attributeName="cy" values="300;320;300" dur="4s" repeatCount="indefinite"/>
          </circle>
          <path d="M 1400 300 L 1410 285 L 1420 295 L 1430 280 L 1440 290 L 1450 275" stroke="#FFA500" strokeWidth="2" fill="none" opacity="0.6">
            <animateTransform attributeName="transform" type="translate" values="0,-20; 0,0" dur="4s" repeatCount="indefinite"/>
          </path>
        </g>

        <g opacity="0.6">
          <circle cx="500" cy="780" r="35" fill="#1E3A8A" opacity="0.6">
            <animate attributeName="cy" values="780;800;780" dur="5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="490" cy="770" r="4" fill="#FFFFFF"/>
          <circle cx="510" cy="770" r="4" fill="#FFFFFF"/>
          <path d="M 485 790 Q 500 795 515 790" stroke="#FFFFFF" strokeWidth="2" fill="none"/>
        </g>

        <g opacity="0.4">
          <text x="960" y="880" fontSize="20" fontWeight="bold" fill="#6B7280" textAnchor="middle">24/7 Automated Scheduling</text>
        </g>
      </svg>
    </div>
  );
}

function MultiInboxMap() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFD666" stopOpacity="0.6"/>
            <stop offset="50%" stopColor="#FFD666" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#FFD666" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="dataStream" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0"/>
            <stop offset="50%" stopColor="#60A5FA" stopOpacity="1"/>
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0"/>
          </linearGradient>
          <filter id="inboxGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="#F5F1E8" />

        <circle cx="960" cy="540" r="350" fill="url(#hubGlow)"/>

        <g filter="url(#inboxGlow)">
          <circle cx="960" cy="540" r="80" fill="#FFD666" opacity="0.9"/>
          <circle cx="960" cy="540" r="70" fill="#FFFFFF" stroke="#FFA500" strokeWidth="4"/>
          <text x="960" y="535" fontSize="16" fontWeight="bold" fill="#D97706" textAnchor="middle">Campaign</text>
          <text x="960" y="555" fontSize="12" fill="#92400E" textAnchor="middle">Hub</text>
          <circle cx="960" cy="540" r="90" fill="none" stroke="#FFD666" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="90;110;90" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/>
          </circle>
        </g>

        <g filter="url(#inboxGlow)">
          <g>
            <circle cx="600" cy="280" r="65" fill="#FFFFFF" stroke="#10B981" strokeWidth="4"/>
            <rect x="580" y="265" width="40" height="30" rx="3" fill="#10B981" opacity="0.2"/>
            <path d="M 580 265 L 600 280 L 620 265" fill="none" stroke="#10B981" strokeWidth="2"/>
            <text x="600" y="305" fontSize="12" fontWeight="bold" fill="#059669" textAnchor="middle">Inbox 1</text>
            <circle cx="615" cy="270" r="8" fill="#10B981">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
            </circle>
            <text x="615" y="273" fontSize="8" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">42</text>
          </g>

          <g>
            <circle cx="1320" cy="280" r="65" fill="#FFFFFF" stroke="#10B981" strokeWidth="4"/>
            <rect x="1300" y="265" width="40" height="30" rx="3" fill="#10B981" opacity="0.2"/>
            <path d="M 1300 265 L 1320 280 L 1340 265" fill="none" stroke="#10B981" strokeWidth="2"/>
            <text x="1320" y="305" fontSize="12" fontWeight="bold" fill="#059669" textAnchor="middle">Inbox 2</text>
            <circle cx="1335" cy="270" r="8" fill="#10B981">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite"/>
            </circle>
            <text x="1335" y="273" fontSize="8" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">38</text>
          </g>

          <g>
            <circle cx="1320" cy="800" r="65" fill="#FFFFFF" stroke="#10B981" strokeWidth="4"/>
            <rect x="1300" y="785" width="40" height="30" rx="3" fill="#10B981" opacity="0.2"/>
            <path d="M 1300 785 L 1320 800 L 1340 785" fill="none" stroke="#10B981" strokeWidth="2"/>
            <text x="1320" y="825" fontSize="12" fontWeight="bold" fill="#059669" textAnchor="middle">Inbox 3</text>
            <circle cx="1335" cy="790" r="8" fill="#10B981">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite"/>
            </circle>
            <text x="1335" y="793" fontSize="8" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">45</text>
          </g>

          <g>
            <circle cx="600" cy="800" r="65" fill="#FFFFFF" stroke="#10B981" strokeWidth="4"/>
            <rect x="580" y="785" width="40" height="30" rx="3" fill="#10B981" opacity="0.2"/>
            <path d="M 580 785 L 600 800 L 620 785" fill="none" stroke="#10B981" strokeWidth="2"/>
            <text x="600" y="825" fontSize="12" fontWeight="bold" fill="#059669" textAnchor="middle">Inbox 4</text>
            <circle cx="615" cy="790" r="8" fill="#10B981">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.6s" repeatCount="indefinite"/>
            </circle>
            <text x="615" y="793" fontSize="8" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">50</text>
          </g>

          <g>
            <circle cx="400" cy="540" r="65" fill="#FFFFFF" stroke="#10B981" strokeWidth="4"/>
            <rect x="380" y="525" width="40" height="30" rx="3" fill="#10B981" opacity="0.2"/>
            <path d="M 380 525 L 400 540 L 420 525" fill="none" stroke="#10B981" strokeWidth="2"/>
            <text x="400" y="565" fontSize="12" fontWeight="bold" fill="#059669" textAnchor="middle">Inbox 5</text>
            <circle cx="415" cy="530" r="8" fill="#10B981">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.8s" repeatCount="indefinite"/>
            </circle>
            <text x="415" y="533" fontSize="8" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">35</text>
          </g>
        </g>

        <g stroke="#60A5FA" strokeWidth="3" opacity="0.6" fill="none">
          <line x1="880" y1="520" x2="665" y2="310">
            <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="2s" repeatCount="indefinite"/>
          </line>
          <line x1="1040" y1="520" x2="1255" y2="310">
            <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="2.1s" repeatCount="indefinite"/>
          </line>
          <line x1="1040" y1="560" x2="1255" y2="770">
            <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="2.2s" repeatCount="indefinite"/>
          </line>
          <line x1="880" y1="560" x2="665" y2="770">
            <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="2.3s" repeatCount="indefinite"/>
          </line>
          <line x1="880" y1="540" x2="465" y2="540">
            <animate attributeName="stroke-dasharray" values="0,450;450,0" dur="2.4s" repeatCount="indefinite"/>
          </line>
        </g>

        <g>
          <g opacity="0.8">
            <rect x="750" y="510" width="24" height="16" rx="2" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="1.5"/>
            <path d="M 750 510 L 762 520 L 774 510" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; -150,-200" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/>
          </g>

          <g opacity="0.8">
            <rect x="1050" y="515" width="24" height="16" rx="2" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.5"/>
            <path d="M 1050 515 L 1062 525 L 1074 515" fill="none" stroke="#10B981" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 200,-200" dur="2.1s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur="2.1s" repeatCount="indefinite"/>
          </g>

          <g opacity="0.8">
            <rect x="1050" y="555" width="24" height="16" rx="2" fill="#FFFFFF" stroke="#FFA500" strokeWidth="1.5"/>
            <path d="M 1050 555 L 1062 565 L 1074 555" fill="none" stroke="#FFA500" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 200,200" dur="2.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur="2.2s" repeatCount="indefinite"/>
          </g>

          <g opacity="0.8">
            <rect x="750" y="550" width="24" height="16" rx="2" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="1.5"/>
            <path d="M 750 550 L 762 560 L 774 550" fill="none" stroke="#8B5CF6" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; -150,200" dur="2.3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur="2.3s" repeatCount="indefinite"/>
          </g>

          <g opacity="0.8">
            <rect x="850" y="535" width="24" height="16" rx="2" fill="#FFFFFF" stroke="#EC4899" strokeWidth="1.5"/>
            <path d="M 850 535 L 862 545 L 874 535" fill="none" stroke="#EC4899" strokeWidth="1.5"/>
            <animateTransform attributeName="transform" type="translate"
              values="0,0; -400,0" dur="2.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite"/>
          </g>
        </g>

        <g opacity="0.5">
          <rect x="550" y="230" width="100" height="6" rx="3" fill="#E5E7EB"/>
          <rect x="550" y="230" width="75" height="6" rx="3" fill="#10B981">
            <animate attributeName="width" values="0;75;0" dur="3s" repeatCount="indefinite"/>
          </rect>
          <text x="600" y="250" fontSize="10" fill="#6B7280" textAnchor="middle">Health: Good</text>

          <rect x="1270" y="230" width="100" height="6" rx="3" fill="#E5E7EB"/>
          <rect x="1270" y="230" width="80" height="6" rx="3" fill="#10B981">
            <animate attributeName="width" values="0;80;0" dur="3.2s" repeatCount="indefinite"/>
          </rect>
          <text x="1320" y="250" fontSize="10" fill="#6B7280" textAnchor="middle">Health: Good</text>

          <rect x="1270" y="750" width="100" height="6" rx="3" fill="#E5E7EB"/>
          <rect x="1270" y="750" width="70" height="6" rx="3" fill="#10B981">
            <animate attributeName="width" values="0;70;0" dur="3.4s" repeatCount="indefinite"/>
          </rect>
          <text x="1320" y="770" fontSize="10" fill="#6B7280" textAnchor="middle">Health: Good</text>

          <rect x="550" y="750" width="100" height="6" rx="3" fill="#E5E7EB"/>
          <rect x="550" y="750" width="85" height="6" rx="3" fill="#10B981">
            <animate attributeName="width" values="0;85;0" dur="3.6s" repeatCount="indefinite"/>
          </rect>
          <text x="600" y="770" fontSize="10" fill="#6B7280" textAnchor="middle">Health: Good</text>

          <rect x="350" y="490" width="100" height="6" rx="3" fill="#E5E7EB"/>
          <rect x="350" y="490" width="90" height="6" rx="3" fill="#10B981">
            <animate attributeName="width" values="0;90;0" dur="3.8s" repeatCount="indefinite"/>
          </rect>
          <text x="400" y="510" fontSize="10" fill="#6B7280" textAnchor="middle">Health: Excellent</text>
        </g>

        <g opacity="0.4">
          <text x="960" y="900" fontSize="20" fontWeight="bold" fill="#6B7280" textAnchor="middle">Load Balanced Distribution</text>
        </g>
      </svg>
    </div>
  );
}
