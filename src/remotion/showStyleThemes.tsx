import React from 'react';

export type ShowStyleType = 'cartoon_network' | 'spongebob' | 'bluey' | 'educational_classic';

export interface ShowStyleTheme {
  id: ShowStyleType;
  name: string;
  fontFamily: string;
  bgGradient: string;
  colorGradingFilter?: string;
  hasTitleCardAtFrame0: boolean;
  frameBorderClass?: string;
  cameraEasing: string;
}

export const showStyleThemes: Record<ShowStyleType, ShowStyleTheme> = {
  cartoon_network: {
    id: 'cartoon_network',
    name: 'Cartoon Network Slapstick',
    fontFamily: 'Impact, sans-serif',
    bgGradient: 'from-yellow-950 via-slate-900 to-black',
    colorGradingFilter: 'contrast(1.1) saturate(1.25)',
    hasTitleCardAtFrame0: true,
    frameBorderClass: 'border-4 border-black shadow-2xl',
    cameraEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Elastic spring
  },
  spongebob: {
    id: 'spongebob',
    name: 'SpongeBob Comedic',
    fontFamily: 'Comic Sans MS, cursive, sans-serif',
    bgGradient: 'from-sky-900 via-blue-900 to-cyan-950',
    colorGradingFilter: 'saturate(1.3) brightness(1.05)',
    hasTitleCardAtFrame0: true,
    frameBorderClass: 'border-8 border-yellow-400/90 rounded-2xl shadow-2xl',
    cameraEasing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Punchy bounce
  },
  bluey: {
    id: 'bluey',
    name: 'Bluey Storybook Warmth',
    fontFamily: 'Trebuchet MS, sans-serif',
    bgGradient: 'from-sky-200 via-indigo-100 to-amber-50',
    colorGradingFilter: 'sepia(0.08) contrast(1.02) saturate(1.12)',
    hasTitleCardAtFrame0: true,
    frameBorderClass: 'border-8 border-blue-200/90 rounded-3xl shadow-xl',
    cameraEasing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Smooth ease
  },
  educational_classic: {
    id: 'educational_classic',
    name: 'Educational Classic',
    fontFamily: 'system-ui, sans-serif',
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-900',
    colorGradingFilter: 'none',
    hasTitleCardAtFrame0: false,
    frameBorderClass: 'border-2 border-indigo-500/50 rounded-xl',
    cameraEasing: 'ease-in-out',
  },
};

/**
 * SpongeBob Hawaiian Flower Component for Title Cards & Overlays
 */
export const HawaiianFlower: React.FC<{ size?: number; color?: string; className?: string }> = ({
  size = 60,
  color = '#facc15',
  className = '',
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <g fill={color} stroke="#000" strokeWidth="3">
      <circle cx="50" cy="20" r="18" />
      <circle cx="80" cy="40" r="18" />
      <circle cx="70" cy="75" r="18" />
      <circle cx="30" cy="75" r="18" />
      <circle cx="20" cy="40" r="18" />
      <circle cx="50" cy="50" r="15" fill="#f97316" stroke="#000" strokeWidth="3" />
    </g>
  </svg>
);

/**
 * Cartoon Network Action Speed Lines Overlay
 */
export const ActionSpeedLines: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-20">
    <svg width="100%" height="100%" viewBox="0 0 800 450" preserveAspectRatio="none">
      <g stroke="#ffffff" strokeWidth="2" opacity="0.8">
        {[...Array(24)].map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x1 = 400 + Math.cos(angle) * 120;
          const y1 = 225 + Math.sin(angle) * 80;
          const x2 = 400 + Math.cos(angle) * 500;
          const y2 = 225 + Math.sin(angle) * 350;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray="12 6" />;
        })}
      </g>
    </svg>
  </div>
);

/**
 * SpongeBob "Gross-Up" Close Up Frame Overlay
 * Renders a hyper-detailed retro comedic frame border with vignette, grain, and bubbles
 */
export const SpongeBobGrossUpOverlay: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
    {/* Textured Gold Frame Border */}
    <div className="absolute inset-0 border-[16px] border-amber-600/90 rounded-xl shadow-inner" />
    {/* Heavy Vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(120,53,15,0.7)_100%)]" />
    {/* Stipple Dot Texture */}
    <div className="absolute inset-0 bg-[radial-gradient(#fef08a_1px,transparent_1px)] [background-size:12px_12px] opacity-25" />
    <div className="absolute top-4 left-6 flex gap-2">
      <HawaiianFlower size={42} color="#38bdf8" />
      <HawaiianFlower size={32} color="#f472b6" />
    </div>
    <div className="absolute bottom-4 right-6 flex gap-2">
      <HawaiianFlower size={42} color="#facc15" />
    </div>
  </div>
);

/**
 * Render Retro Show Title Card for Frame 0 Intro Sequence
 */
export const ShowTitleCard: React.FC<{
  showStyle: ShowStyleType;
  title: string;
  topic: string;
}> = ({ showStyle, title, topic }) => {
  if (showStyle === 'spongebob') {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-500 to-blue-700 flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden font-serif z-40">
        {/* Bamboo/Wood Frame Border */}
        <div className="absolute inset-4 border-[12px] border-amber-800 rounded-3xl bg-amber-950/20 backdrop-blur-xs flex flex-col items-center justify-center p-6 shadow-2xl">
          <HawaiianFlower size={70} color="#facc15" className="absolute top-4 left-6 animate-spin duration-1000" />
          <HawaiianFlower size={60} color="#f472b6" className="absolute top-4 right-6" />
          <HawaiianFlower size={65} color="#38bdf8" className="absolute bottom-4 left-6" />
          <HawaiianFlower size={70} color="#a855f7" className="absolute bottom-4 right-6" />

          {/* Title Header Banner */}
          <div className="bg-amber-100 text-amber-950 px-8 py-3 rounded-2xl border-4 border-amber-900 shadow-2xl transform -rotate-1 mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-amber-800 mb-1">
              🍍 SPONGEBOB COMEDIC PRESENTATION
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
              {title}
            </h1>
          </div>

          <div className="bg-sky-950/80 border-2 border-sky-300 text-sky-200 px-6 py-2 rounded-xl text-sm font-bold tracking-wide">
            TOPIC: {topic}
          </div>
        </div>
      </div>
    );
  }

  if (showStyle === 'bluey') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-indigo-100 to-amber-100 flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden z-40">
        <div className="absolute inset-6 bg-white/80 rounded-3xl border-4 border-blue-300 shadow-2xl flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center text-3xl mb-3 shadow-inner">
            🐶
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">
            BLUEY STORYBOOK EPISODE
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 mb-3 tracking-tight">
            {title}
          </h1>
          <div className="bg-amber-100 text-amber-900 font-bold px-4 py-1.5 rounded-full text-xs border border-amber-300">
            {topic}
          </div>
        </div>
      </div>
    );
  }

  // Cartoon Network / Default
  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden z-40">
      {/* Checkerboard Accents */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-repeat-x bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] [background-size:20px_20px] bg-yellow-400" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-repeat-x bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] [background-size:20px_20px] bg-yellow-400" />

      <div className="bg-black border-4 border-yellow-400 p-8 rounded-2xl shadow-2xl max-w-2xl transform rotate-1">
        <div className="bg-yellow-400 text-black font-black text-xs px-3 py-1 rounded inline-block uppercase tracking-widest mb-3">
          ⚡ CARTOON NETWORK SPECIAL
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider mb-2">
          {title}
        </h1>
        <p className="text-cyan-400 font-bold text-sm tracking-wide">
          SPECIAL TOPIC: {topic}
        </p>
      </div>
    </div>
  );
};
