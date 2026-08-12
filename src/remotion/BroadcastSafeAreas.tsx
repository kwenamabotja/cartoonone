import React from 'react';

export interface BroadcastSafeAreasProps {
  showSafeAreas?: boolean;
  resolutionLabel?: string; // '1080p Full HD' | '4K Ultra HD'
  tvRating?: string; // 'TV-Y7' | 'TV-G' | 'TV-14'
  networkBugText?: string;
}

/**
 * BroadcastSafeAreas: TV Network Compliant Overlays.
 * Action-Safe Area (90% of screen / 5% margin)
 * Title-Safe Area (80% of screen / 10% margin)
 * 16:9 Center Crosshairs, Frame Guides, and Network Rating Badges.
 */
export const BroadcastSafeAreas: React.FC<BroadcastSafeAreasProps> = ({
  showSafeAreas = true,
  resolutionLabel = '1080p Full HD (24fps)',
  tvRating = 'TV-Y7',
  networkBugText = 'CARTOON STUDIO PRO',
}) => {
  if (!showSafeAreas) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden font-mono text-[11px] select-none">
      {/* 1. ACTION SAFE AREA (90% - 5% INSET) */}
      <div className="absolute top-[5%] bottom-[5%] left-[5%] right-[5%] border border-cyan-400/50 border-dashed rounded-xs flex flex-col justify-between p-2">
        <div className="flex items-center justify-between text-cyan-400/80 font-bold text-[10px]">
          <span>ACTION SAFE (90%)</span>
          <span>ACTION SAFE (90%)</span>
        </div>
        <div className="flex items-center justify-between text-cyan-400/80 font-bold text-[10px]">
          <span>ACTION SAFE (90%)</span>
          <span>ACTION SAFE (90%)</span>
        </div>
      </div>

      {/* 2. TITLE SAFE AREA (80% - 10% INSET) */}
      <div className="absolute top-[10%] bottom-[10%] left-[10%] right-[10%] border-2 border-yellow-400/70 border-dotted rounded-xs flex flex-col justify-between p-2">
        <div className="flex items-center justify-between text-yellow-300/90 font-black text-[10px] bg-slate-950/70 px-2 py-0.5 rounded border border-yellow-400/40">
          <span>TITLE SAFE (80%)</span>
          <span>BROADCAST 16:9 GUIDES</span>
        </div>

        {/* CENTER CROSSHAIRS */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center opacity-60">
          <div className="w-full h-0.5 bg-yellow-400/80 absolute" />
          <div className="h-full w-0.5 bg-yellow-400/80 absolute" />
          <div className="w-4 h-4 rounded-full border border-yellow-400 absolute" />
        </div>

        <div className="flex items-center justify-between text-yellow-300/90 font-black text-[10px] bg-slate-950/70 px-2 py-0.5 rounded border border-yellow-400/40">
          <span>SAFE GRAPHICS MARGIN</span>
          <span>{resolutionLabel}</span>
        </div>
      </div>

      {/* 3. TV NETWORK BUG (TOP RIGHT) & TV RATING BADGE (TOP LEFT) */}
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <div className="bg-white text-slate-950 font-black text-xs px-2.5 py-1 rounded border-2 border-slate-900 shadow-lg tracking-wider">
          {tvRating}
        </div>
        <div className="bg-slate-950/80 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-sans font-bold">
          E/I Educational
        </div>
      </div>

      <div className="absolute top-4 right-6 flex items-center gap-2">
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-lg border border-yellow-200 flex items-center gap-1.5 uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span>{networkBugText}</span>
        </div>
      </div>
    </div>
  );
};
