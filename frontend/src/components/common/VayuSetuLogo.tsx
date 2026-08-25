import React from 'react';

interface VayuSetuLogoProps {
  variant?: 'full' | 'horizontal' | 'mark' | 'compact';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const VayuSetuLogo: React.FC<VayuSetuLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  // Dimension sizing helpers
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { markSize: 28, textClass: 'text-sm', tagClass: 'text-[7px]' };
      case 'md':
        return { markSize: 38, textClass: 'text-lg', tagClass: 'text-[9px]' };
      case 'lg':
        return { markSize: 54, textClass: 'text-2xl', tagClass: 'text-[11px]' };
      case 'xl':
        return { markSize: 84, textClass: 'text-4xl', tagClass: 'text-xs' };
      default:
        return { markSize: 38, textClass: 'text-lg', tagClass: 'text-[9px]' };
    }
  };

  const { markSize, textClass, tagClass } = getDimensions();

  // The authentic VayuSetu Icon Mark matching the reference image:
  // - Deep Navy suspension bridge (Setu) spanning the base
  // - Dynamic climbing jet aircraft in deep navy
  // - Sweeping sky-blue/cyan atmospheric orbital arc forming the circular halo
  const LogoMark = (
    <svg
      viewBox="0 0 200 200"
      width={markSize}
      height={markSize}
      className="shrink-0 overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sky-blue to Cerulean gradient for the orbital flight contrail */}
        <linearGradient id="contrailGradient" x1="20" y1="120" x2="160" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.4" />
          <stop offset="35%" stopColor="#38BDF8" />
          <stop offset="80%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Outer Circular Glow Halo */}
        <linearGradient id="orbitalRing" x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#0284C7" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0A2540" stopOpacity="0.0" />
        </linearGradient>

        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0A2540" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* 1. Circular Outer Orbit Path (Sky Horizon) */}
      <circle
        cx="100"
        cy="92"
        r="68"
        stroke="url(#orbitalRing)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="320 80"
        transform="rotate(-25 100 92)"
      />

      {/* 2. Sweeping Dynamic Flight Jet Contrail Wave */}
      <path
        d="M 32 125 C 40 100, 65 72, 105 60 C 135 50, 158 54, 160 55 C 145 60, 125 64, 105 76 C 70 96, 48 122, 38 126 Z"
        fill="url(#contrailGradient)"
      />

      {/* Thin upper aerodynamic accent sweep */}
      <path
        d="M 48 100 C 65 65, 105 45, 150 48"
        stroke="#38BDF8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* 3. Soaring Jet Aircraft Silhouette (Ascending to Upper Right) */}
      <g transform="translate(150, 52) rotate(35) scale(0.95)" filter="url(#logoShadow)">
        <path
          d="M 0 -18 
             C 1.5 -18, 3.5 -12, 3.5 -5 
             L 17 4 
             L 17 7 
             L 3.5 4 
             L 3.5 12 
             L 8 16 
             L 8 18 
             L 0 16 
             L -8 18 
             L -8 16 
             L -3.5 12 
             L -3.5 4 
             L -17 7 
             L -17 4 
             L -3.5 -5 
             C -3.5 -12, -1.5 -18, 0 -18 Z"
          fill="#0A2540"
        />
      </g>

      {/* 4. The Iconic Suspension Bridge (Setu) Base in Deep Navy */}
      <g filter="url(#logoShadow)">
        {/* Left Bridge Tower */}
        <path
          d="M 68 105 L 75 105 L 75 138 L 68 138 Z"
          fill="#0A2540"
        />
        <polygon points="66,105 77,105 71.5,96" fill="#0A2540" />

        {/* Right Bridge Tower */}
        <path
          d="M 125 105 L 132 105 L 132 138 L 125 138 Z"
          fill="#0A2540"
        />
        <polygon points="123,105 134,105 128.5,96" fill="#0A2540" />

        {/* Bridge Suspension Main Cables */}
        {/* Left Span Cable */}
        <path
          d="M 22 134 Q 48 122 68 106"
          stroke="#0A2540"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Center Span Sag Cable */}
        <path
          d="M 75 106 Q 100 130 125 106"
          stroke="#0A2540"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Right Span Cable */}
        <path
          d="M 132 106 Q 152 122 178 134"
          stroke="#0A2540"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Vertical Suspension Wire Hangers */}
        {/* Left Span Hangers */}
        <line x1="38" y1="130" x2="38" y2="136" stroke="#0A2540" strokeWidth="1.6" />
        <line x1="50" y1="123" x2="50" y2="136" stroke="#0A2540" strokeWidth="1.6" />
        <line x1="60" y1="114" x2="60" y2="136" stroke="#0A2540" strokeWidth="1.6" />

        {/* Center Span Hangers */}
        <line x1="83" y1="114" x2="83" y2="136" stroke="#0A2540" strokeWidth="1.6" />
        <line x1="91" y1="121" x2="91" y2="136" stroke="#0A2540" strokeWidth="1.6" />
        <line x1="100" y1="124" x2="100" y2="136" stroke="#0A2540" strokeWidth="1.6" />
        <line x1="109" y1="121" x2="109" y2="136" stroke="#0A2540" strokeWidth="1.6" />
        <line x1="117" y1="114" x2="117" y2="136" stroke="#0A2540" strokeWidth="1.6" />

        {/* Right Span Hangers */}
        <line x1="140" y1="114" x2="140" y2="136" stroke="#0A2540" strokeWidth="1.6" />
        <line x1="150" y1="123" x2="150" y2="136" stroke="#0A2540" strokeWidth="1.6" />
        <line x1="162" y1="130" x2="162" y2="136" stroke="#0A2540" strokeWidth="1.6" />

        {/* Bridge Solid Deck & Dual Arches (Setu Foundation) */}
        <path
          d="M 20 134 
             C 45 134, 60 136, 71 138 
             L 71 150 
             L 78 150 
             L 78 138 
             C 88 131, 112 131, 122 138 
             L 122 150 
             L 129 150 
             L 129 138 
             C 140 136, 155 134, 180 134 
             C 165 142, 140 148, 129 138 
             C 118 147, 82 147, 71 138 
             C 60 148, 35 142, 20 134 Z"
          fill="#0A2540"
        />
      </g>
    </svg>
  );

  // Variant: Mark only
  if (variant === 'mark') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoMark}</div>;
  }

  // Variant: Compact (For sticky navbar brand)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        {LogoMark}
        <div className="flex flex-col">
          <div className="flex items-center font-heading font-black tracking-wider leading-none">
            <span className="text-[#0A2540] text-base sm:text-lg">VAYU</span>
            <span className="text-[#0284C7] text-base sm:text-lg">SETU</span>
          </div>
          <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">
            AIRFARE INTELLIGENCE
          </span>
        </div>
      </div>
    );
  }

  // Variant: Full (Stacked with prominent Tagline as in reference image)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <div className="mb-2 transition-transform duration-300 hover:scale-105">
          {LogoMark}
        </div>
        <div className="flex items-center font-heading font-black tracking-wider leading-none mt-1">
          <span className={`text-[#0A2540] ${textClass}`}>VAYU</span>
          <span className={`text-[#0284C7] ${textClass}`}>SETU</span>
        </div>
        {showTagline && (
          <div className="flex items-center gap-2 mt-2">
            <span className="w-5 sm:w-8 h-[1.5px] bg-[#0A2540]/40 rounded-full" />
            <span className={`font-bold tracking-widest text-[#0A2540] uppercase ${tagClass}`}>
              CONNECTING SKIES, BRIDGING PRICES
            </span>
            <span className="w-5 sm:w-8 h-[1.5px] bg-[#0A2540]/40 rounded-full" />
          </div>
        )}
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {LogoMark}
      <div className="flex flex-col">
        <div className="flex items-center font-heading font-black tracking-wider leading-none">
          <span className={`text-[#0A2540] ${textClass}`}>VAYU</span>
          <span className={`text-[#0284C7] ${textClass}`}>SETU</span>
        </div>
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-[1px] bg-[#0A2540]/30" />
            <span className={`font-semibold tracking-wider text-[#64748B] uppercase ${tagClass}`}>
              CONNECTING SKIES, BRIDGING PRICES
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
