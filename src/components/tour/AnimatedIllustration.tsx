import { useEffect, useState } from 'react';

type IllustrationType =
  | 'campaign-create'
  | 'autopilot'
  | 'email-send'
  | 'leads-scrape'
  | 'analytics'
  | 'template-edit'
  | 'account-connect'
  | 'filter-search'
  | 'schedule'
  | 'default';

interface AnimatedIllustrationProps {
  type: IllustrationType;
  className?: string;
}

export default function AnimatedIllustration({ type, className = '' }: AnimatedIllustrationProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const illustrations: Record<IllustrationType, JSX.Element> = {
    'campaign-create': <CampaignCreateAnimation frame={frame} />,
    'autopilot': <AutopilotAnimation frame={frame} />,
    'email-send': <EmailSendAnimation frame={frame} />,
    'leads-scrape': <LeadsScrapeAnimation frame={frame} />,
    'analytics': <AnalyticsAnimation frame={frame} />,
    'template-edit': <TemplateEditAnimation frame={frame} />,
    'account-connect': <AccountConnectAnimation frame={frame} />,
    'filter-search': <FilterSearchAnimation frame={frame} />,
    'schedule': <ScheduleAnimation frame={frame} />,
    'default': <DefaultAnimation frame={frame} />
  };

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      {illustrations[type]}
    </div>
  );
}

function CampaignCreateAnimation({ frame }: { frame: number }) {
  const cursorX = 20 + Math.sin(frame * 0.1) * 5;
  const cursorY = 30 + (frame % 50) * 0.8;
  const typing = frame % 50 < 40;
  const textWidth = Math.min((frame % 50) * 3, 80);

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="10" y="10" width="100" height="60" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <rect x="15" y="15" width="90" height="8" rx="2" fill="#f3f4f6" />
      <rect x="15" y="15" width={textWidth} height="8" rx="2" fill="#fbbf24" className="transition-all" />
      <rect x="15" y="28" width="90" height="6" rx="1" fill="#f3f4f6" />
      <rect x="15" y="38" width="90" height="6" rx="1" fill="#f3f4f6" />
      <rect x="15" y="48" width="40" height="6" rx="1" fill="#f3f4f6" />
      <rect x="70" y="55" width="35" height="10" rx="2" fill="#f97316" />
      <text x="87.5" y="62" fontSize="5" fill="white" textAnchor="middle" fontWeight="bold">Create</text>
      {typing && (
        <g transform={`translate(${cursorX}, ${cursorY})`}>
          <path d="M0 0 L8 5 L3 6 L5 12 L3 12 L1 6 L-2 8 Z" fill="#1f2937" />
        </g>
      )}
      <circle cx="100" cy="20" r="8" fill="#22c55e" opacity={frame % 20 > 10 ? 1 : 0.5} className="transition-opacity" />
      <path d="M96 20 L99 23 L104 17" stroke="white" strokeWidth="1.5" fill="none" opacity={frame % 20 > 10 ? 1 : 0.5} />
    </svg>
  );
}

function AutopilotAnimation({ frame }: { frame: number }) {
  const rotation = frame * 3.6;
  const pulse = Math.sin(frame * 0.15) * 0.2 + 0.8;

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <circle cx="60" cy="40" r="25" fill="#fef3c7" />
      <circle cx="60" cy="40" r="20" fill="#fbbf24" opacity={pulse} />
      <g transform={`translate(60, 40) rotate(${rotation})`}>
        <circle cx="0" cy="-12" r="4" fill="#f97316" />
        <circle cx="10" cy="6" r="4" fill="#f97316" />
        <circle cx="-10" cy="6" r="4" fill="#f97316" />
      </g>
      <circle cx="60" cy="40" r="6" fill="#1f2937" />
      <path d="M57 40 L60 37 L63 40 L60 43 Z" fill="white" />
      <g opacity="0.6">
        <path d="M20 25 Q40 20 50 30" stroke="#9ca3af" strokeWidth="1" fill="none" strokeDasharray="2,2" />
        <path d="M70 50 Q80 60 100 55" stroke="#9ca3af" strokeWidth="1" fill="none" strokeDasharray="2,2" />
      </g>
      <rect x="10" y="60" width="20" height="4" rx="1" fill="#e5e7eb" />
      <rect x="10" y="60" width={10 + (frame % 30) * 0.33} height="4" rx="1" fill="#22c55e" />
      <rect x="90" y="60" width="20" height="4" rx="1" fill="#e5e7eb" />
      <rect x="90" y="60" width={5 + (frame % 40) * 0.375} height="4" rx="1" fill="#3b82f6" />
    </svg>
  );
}

function EmailSendAnimation({ frame }: { frame: number }) {
  const envelopeY = 40 - Math.abs(Math.sin(frame * 0.1)) * 8;
  const sendProgress = (frame % 60) / 60;
  const sent = sendProgress > 0.5;

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="15" y="20" width="40" height="45" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <rect x="20" y="30" width="30" height="3" rx="1" fill="#f3f4f6" />
      <rect x="20" y="36" width="25" height="3" rx="1" fill="#f3f4f6" />
      <rect x="20" y="42" width="28" height="3" rx="1" fill="#f3f4f6" />
      <rect x="20" y="48" width="20" height="3" rx="1" fill="#f3f4f6" />
      <g transform={`translate(${sent ? 85 : 70}, ${envelopeY})`} opacity={sent ? 0.5 : 1}>
        <rect x="-15" y="-10" width="30" height="20" rx="2" fill="#fbbf24" />
        <path d="M-15 -10 L0 2 L15 -10" stroke="#f97316" strokeWidth="1.5" fill="none" />
        <path d="M-15 10 L-5 2" stroke="#f97316" strokeWidth="1" fill="none" />
        <path d="M15 10 L5 2" stroke="#f97316" strokeWidth="1" fill="none" />
      </g>
      {sent && (
        <g transform="translate(95, 35)">
          <circle r="10" fill="#22c55e" />
          <path d="M-4 0 L-1 3 L5 -3" stroke="white" strokeWidth="2" fill="none" />
        </g>
      )}
      <path
        d="M55 40 Q70 35 85 40"
        stroke="#9ca3af"
        strokeWidth="1"
        fill="none"
        strokeDasharray="3,3"
        strokeDashoffset={-frame}
      />
    </svg>
  );
}

function LeadsScrapeAnimation({ frame }: { frame: number }) {
  const scanY = 15 + (frame % 50) * 1;
  const dots = [
    { x: 30, y: 25, delay: 0 },
    { x: 60, y: 35, delay: 10 },
    { x: 45, y: 50, delay: 20 },
    { x: 75, y: 45, delay: 30 },
    { x: 90, y: 30, delay: 40 }
  ];

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="10" y="10" width="100" height="60" rx="4" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" />
      <rect x="10" y={scanY} width="100" height="2" fill="#22c55e" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1s" repeatCount="indefinite" />
      </rect>
      {dots.map((dot, i) => {
        const visible = (frame + dot.delay) % 50 > 25;
        return (
          <g key={i} opacity={visible ? 1 : 0} className="transition-opacity duration-300">
            <circle cx={dot.x} cy={dot.y} r="8" fill="white" stroke="#22c55e" strokeWidth="1" />
            <circle cx={dot.x} cy={dot.y - 2} r="2" fill="#6b7280" />
            <rect x={dot.x - 4} y={dot.y + 2} width="8" height="3" rx="1" fill="#6b7280" />
          </g>
        );
      })}
      <g transform="translate(95, 65)">
        <rect x="-12" y="-8" width="24" height="16" rx="2" fill="#fbbf24" />
        <text x="0" y="3" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">
          {Math.min(5, Math.floor(frame / 10))}
        </text>
      </g>
    </svg>
  );
}

function AnalyticsAnimation({ frame }: { frame: number }) {
  const bars = [
    { height: 30 + Math.sin(frame * 0.1) * 5 },
    { height: 45 + Math.sin(frame * 0.1 + 1) * 8 },
    { height: 35 + Math.sin(frame * 0.1 + 2) * 6 },
    { height: 50 + Math.sin(frame * 0.1 + 3) * 10 }
  ];

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <line x1="20" y1="65" x2="100" y2="65" stroke="#e5e7eb" strokeWidth="1" />
      <line x1="20" y1="15" x2="20" y2="65" stroke="#e5e7eb" strokeWidth="1" />
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={30 + i * 20}
          y={65 - bar.height}
          width="12"
          height={bar.height}
          rx="2"
          fill={i === 3 ? '#f97316' : '#fbbf24'}
          className="transition-all"
        />
      ))}
      <path
        d="M30 50 Q50 35 70 40 Q90 45 100 25"
        stroke="#22c55e"
        strokeWidth="2"
        fill="none"
      />
      <circle cx={30 + (frame % 70)} cy={50 - (frame % 70) * 0.3} r="3" fill="#22c55e" />
      <g transform="translate(85, 20)">
        <text fontSize="8" fill="#22c55e" fontWeight="bold">+24%</text>
      </g>
    </svg>
  );
}

function TemplateEditAnimation({ frame }: { frame: number }) {
  const cursorBlink = frame % 20 > 10;
  const textLines = [
    { width: 70, y: 22 },
    { width: 50, y: 32 },
    { width: 65, y: 42 },
    { width: 40, y: 52 }
  ];

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="10" y="10" width="100" height="60" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      {textLines.map((line, i) => (
        <rect key={i} x="20" y={line.y} width={line.width} height="4" rx="1" fill="#e5e7eb" />
      ))}
      <rect x="20" y="32" width="30" height="4" rx="1" fill="#fbbf24" />
      <text x="23" y="35" fontSize="3" fill="#92400e">{'{{name}}'}</text>
      {cursorBlink && (
        <rect x={20 + (frame % 50) * 1.2} y="42" width="1" height="6" fill="#1f2937" />
      )}
      <g transform="translate(95, 15)">
        <circle r="8" fill="#f97316" />
        <path d="M-3 0 L0 -3 L3 0 L0 3 Z" fill="white" />
      </g>
    </svg>
  );
}

function AccountConnectAnimation({ frame }: { frame: number }) {
  const connected = frame % 80 > 40;
  const lineProgress = connected ? 100 : (frame % 40) * 2.5;

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="10" y="25" width="35" height="30" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <circle cx="27" cy="35" r="6" fill="#f3f4f6" />
      <rect x="18" y="45" width="18" height="3" rx="1" fill="#e5e7eb" />
      <rect x="75" y="25" width="35" height="30" rx="4" fill={connected ? '#f0fdf4' : 'white'} stroke={connected ? '#22c55e' : '#e5e7eb'} strokeWidth="1" />
      <circle cx="92" cy="35" r="6" fill={connected ? '#dcfce7' : '#f3f4f6'} />
      <rect x="83" y="45" width="18" height="3" rx="1" fill={connected ? '#86efac' : '#e5e7eb'} />
      <line
        x1="45"
        y1="40"
        x2={45 + lineProgress * 0.3}
        y2="40"
        stroke={connected ? '#22c55e' : '#fbbf24'}
        strokeWidth="2"
        strokeDasharray={connected ? 'none' : '4,2'}
      />
      {connected && (
        <g transform="translate(60, 40)">
          <circle r="8" fill="#22c55e" />
          <path d="M-3 0 L-1 2 L4 -3" stroke="white" strokeWidth="1.5" fill="none" />
        </g>
      )}
    </svg>
  );
}

function FilterSearchAnimation({ frame }: { frame: number }) {
  const searchWidth = 20 + (frame % 40);
  const results = Math.floor(frame / 20) % 4;

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="10" y="10" width="100" height="15" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <circle cx="20" cy="17.5" r="4" stroke="#9ca3af" strokeWidth="1" fill="none" />
      <line x1="23" y1="20" x2="26" y2="23" stroke="#9ca3af" strokeWidth="1" />
      <rect x="30" y="14" width={searchWidth} height="7" rx="1" fill="#fef3c7" />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={i < results ? 1 : 0.3} className="transition-opacity">
          <rect x="10" y={32 + i * 15} width="100" height="12" rx="2" fill="white" stroke={i < results ? '#fbbf24' : '#e5e7eb'} strokeWidth="1" />
          <circle cx="20" cy={38 + i * 15} r="3" fill={i < results ? '#fbbf24' : '#e5e7eb'} />
          <rect x="28" y={36 + i * 15} width="40" height="4" rx="1" fill={i < results ? '#fbbf24' : '#e5e7eb'} />
        </g>
      ))}
    </svg>
  );
}

function ScheduleAnimation({ frame }: { frame: number }) {
  const activeDay = Math.floor(frame / 15) % 7;
  const clockAngle = frame * 6;

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="10" y="10" width="65" height="60" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
        <g key={i}>
          <rect
            x={15 + i * 8}
            y="18"
            width="6"
            height="6"
            rx="1"
            fill={i === activeDay ? '#f97316' : i < 5 ? '#fbbf24' : '#e5e7eb'}
          />
          <text x={18 + i * 8} y="23" fontSize="4" fill={i === activeDay ? 'white' : '#6b7280'} textAnchor="middle">{day}</text>
        </g>
      ))}
      <rect x="15" y="30" width="55" height="35" rx="2" fill="#f9fafb" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="18" y={35 + i * 10} width="49" height="7" rx="1" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
          <rect x="20" y={36 + i * 10} width={20 + i * 8} height="5" rx="1" fill={i === 1 ? '#f97316' : '#fbbf24'} opacity="0.7" />
        </g>
      ))}
      <g transform="translate(95, 40)">
        <circle r="18" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        <circle r="15" fill="#fef3c7" />
        <line x1="0" y1="0" x2="0" y2="-10" stroke="#1f2937" strokeWidth="1.5" transform={`rotate(${clockAngle / 12})`} />
        <line x1="0" y1="0" x2="0" y2="-7" stroke="#f97316" strokeWidth="1" transform={`rotate(${clockAngle})`} />
        <circle r="2" fill="#1f2937" />
      </g>
    </svg>
  );
}

function DefaultAnimation({ frame }: { frame: number }) {
  const pulse = Math.sin(frame * 0.1) * 0.2 + 0.8;

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <circle cx="60" cy="40" r="20" fill="#fef3c7" opacity={pulse} />
      <circle cx="60" cy="40" r="12" fill="#fbbf24" />
      <path d="M55 40 L60 35 L65 40 L60 45 Z" fill="white" />
      <g opacity="0.5">
        <circle cx="30" cy="25" r="8" fill="#e5e7eb" />
        <circle cx="90" cy="55" r="6" fill="#e5e7eb" />
        <circle cx="25" cy="55" r="5" fill="#e5e7eb" />
        <circle cx="95" cy="25" r="7" fill="#e5e7eb" />
      </g>
    </svg>
  );
}
