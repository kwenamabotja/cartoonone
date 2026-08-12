import React, { useState } from 'react';
import { CartoonProject, TvFormat } from '../types';
import {
  Tv,
  Monitor,
  Film,
  Sparkles,
  Maximize2,
  Sliders,
  Radio,
  Cast,
  CheckCircle2,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Eye,
  Info,
  Tv2,
  Shield,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TvBroadcastModalProps {
  project: CartoonProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updatedFields: Partial<CartoonProject>) => void;
  onStartTvPresentation: () => void;
}

export const TvBroadcastModal: React.FC<TvBroadcastModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  onStartTvPresentation,
}) => {
  const [activeTab, setActiveTab] = useState<'format' | 'bug' | 'guide'>('format');

  if (!isOpen) return null;

  const currentFormat: TvFormat = project.tvFormat || '16:9_hd';
  const networkName = project.tvChannelName || 'KIDS NETWORK HD';
  const rating = project.tvRating || 'TV-Y7';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-400/80 rounded-3xl shadow-2xl overflow-hidden text-white my-8"
        >
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-950/80 rounded-2xl border border-amber-300/40 text-amber-400 shadow-lg">
                <Tv className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <span>üì∫ TV Broadcast Studio & Smart TV Presentation</span>
                  <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    1080p Ultra HD
                  </span>
                </h2>
                <p className="text-xs font-bold text-amber-950/90">
                  Configure television aspect ratios, network watermark bugs, and launch Big Screen TV Cinema mode!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-950 hover:bg-slate-950/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('format')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 transition-all ${
                activeTab === 'format'
                  ? 'bg-slate-900 text-amber-400 border-t-2 border-x border-amber-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>TV Formats & Display</span>
            </button>
            <button
              onClick={() => setActiveTab('bug')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 transition-all ${
                activeTab === 'bug'
                  ? 'bg-slate-900 text-amber-400 border-t-2 border-x border-amber-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Network Watermark & Overlays</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 transition-all ${
                activeTab === 'guide'
                  ? 'bg-slate-900 text-amber-400 border-t-2 border-x border-amber-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Cast className="w-4 h-4" />
              <span>How to Play on TV Guide</span>
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {activeTab === 'format' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
                    üì∫ Television Aspect Ratio & Screen Preset
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 16:9 Widescreen */}
                    <button
                      type="button"
                      onClick={() => onUpdateProject({ tvFormat: '16:9_hd' })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                        currentFormat === '16:9_hd'
                          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-full aspect-video bg-slate-900 rounded-lg border border-amber-400/40 mb-3 flex items-center justify-center relative">
                        <span className="text-[10px] font-mono text-amber-300 font-black">16:9 1080p</span>
                        {currentFormat === '16:9_hd' && (
                          <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-white">16:9 Modern Smart TV</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Standard Widescreen Full HD for living room TVs, OLEDs, Monitors & YouTube.
                      </p>
                    </button>

                    {/* 21:9 UltraWide Cinema */}
                    <button
                      type="button"
                      onClick={() => onUpdateProject({ tvFormat: '21:9_cinema' })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                        currentFormat === '21:9_cinema'
                          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-full aspect-video bg-black rounded-lg border border-amber-400/40 mb-3 flex flex-col justify-between py-1 relative">
                        <div className="h-2 bg-slate-900 w-full" />
                        <div className="text-center text-[10px] font-mono text-amber-300 font-black">21:9 CINEMA</div>
                        <div className="h-2 bg-slate-900 w-full" />
                        {currentFormat === '21:9_cinema' && (
                          <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-white">21:9 Cinema UltraWide</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Cinematic theatrical film look with letterbox top and bottom borders.
                      </p>
                    </button>

                    {/* 4:3 Vintage Tube TV */}
                    <button
                      type="button"
                      onClick={() => onUpdateProject({ tvFormat: '4:3_retro' })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                        currentFormat === '4:3_retro'
                          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-full aspect-video bg-black rounded-lg border border-amber-400/40 mb-3 flex justify-between px-3 py-1 relative">
                        <div className="w-3 bg-slate-900 h-full" />
                        <div className="text-center text-[10px] font-mono text-amber-300 font-black my-auto">4:3 TUBE TV</div>
                        <div className="w-3 bg-slate-900 h-full" />
                        {currentFormat === '4:3_retro' && (
                          <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-white">4:3 Saturday Cartoon CRT</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Retro 90s Tube TV style with curved CRT bezel and pillarbox side bars.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Additional TV Production Toggles */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Television Production Extras</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* TV Title Safe Grid */}
                    <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-850">
                      <div>
                        <div className="text-xs font-bold text-white">TV Title Safe Overlay</div>
                        <div className="text-[10px] text-slate-400">Shows 80%/90% TV overscan boundaries</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!project.showTvSafeGrid}
                        onChange={(e) => onUpdateProject({ showTvSafeGrid: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                    </label>

                    {/* TV Intro Title Card */}
                    <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-850">
                      <div>
                        <div className="text-xs font-bold text-white">TV Intro Title Card (3s)</div>
                        <div className="text-[10px] text-slate-400">Plays "Episode Title" title card before scene 1</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={project.showTvIntroCard !== false}
                        onChange={(e) => onUpdateProject({ showTvIntroCard: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                    </label>

                    {/* TV Outro Credits Crawl */}
                    <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-850">
                      <div>
                        <div className="text-xs font-bold text-white">TV Outro Rolling Credits</div>
                        <div className="text-[10px] text-slate-400">Displays scrolling credits card at end of show</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={project.showTvOutroCredits !== false}
                        onChange={(e) => onUpdateProject({ showTvOutroCredits: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                    </label>

                    {/* Episode Number */}
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white">Episode Badge Label</div>
                        <div className="text-[10px] text-slate-400">Season / Episode text</div>
                      </div>
                      <input
                        type="text"
                        value={project.tvEpisodeNumber || 'Season 1, Ep. 01'}
                        onChange={(e) => onUpdateProject({ tvEpisodeNumber: e.target.value })}
                        placeholder="Season 1, Ep. 01"
                        className="bg-slate-950 text-amber-300 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono w-32 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bug' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
                    üì° TV Network Logo Watermark & Content Rating
                  </label>
                  <p className="text-xs text-slate-300 mb-4">
                    Authentic television networks place a subtle channel bug in the top corner and a rating mark when the episode starts.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Channel Network Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">TV Channel Network Name</label>
                      <input
                        type="text"
                        value={networkName}
                        onChange={(e) => onUpdateProject({ tvChannelName: e.target.value })}
                        placeholder="e.g. CARTOON HD, KIDS NETWORK, TECH TV"
                        className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-extrabold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* TV Rating */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">TV Content Rating Badge</label>
                      <select
                        value={rating}
                        onChange={(e) => onUpdateProject({ tvRating: e.target.value as any })}
                        className="w-full bg-slate-950 text-amber-300 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-black focus:outline-none focus:border-amber-400"
                      >
                        <option value="TV-Y7">üì∫ TV-Y7 (Children 7+)</option>
                        <option value="TV-G">üì∫ TV-G (General Audience)</option>
                        <option value="TV-PG">üì∫ TV-PG (Parental Guidance)</option>
                        <option value="ALL AGES">Ì†ΩÌ≥∫ ALL AGES (Universal Kids)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Show Overlay Toggles */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>On-Screen TV Overlays</span>
                  </h4>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-850">
                      <div>
                        <div className="text-xs font-bold text-white">Show Corner Watermark Channel Bug</div>
                        <div className="text-[10px] text-slate-400">Displays "{networkName}" logo bug on stage corner</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={project.showTvOverlayBug !== false}
                        onChange={(e) => onUpdateProject({ showTvOverlayBug: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-850">
                      <div>
                        <div className="text-xs font-bold text-white">Show Lower Third Broadcast Banner</div>
                        <div className="text-[10px] text-slate-400">Displays news ticker banner with show headline</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!project.showTvLowerThird}
                        onChange={(e) => onUpdateProject({ showTvLowerThird: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-4">
                <div className="bg-amber-950/30 border border-amber-400/40 p-4 rounded-2xl flex items-start gap-3">
                  <Tv2 className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-300">How to Watch Your Cartoon on a Physical TV</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Follow these 4 simple methods to play your AI generated cartoon show on any Smart TV or Big Screen:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
                      <span>üîå 1. Direct HDMI Cable</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Connect an HDMI cable from your laptop/computer directly to your TV's HDMI port. Click <strong>"Launch Smart TV Cinema Mode"</strong> for full 1080p output.
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
                      <span>üì° 2. Chromecast / Wireless Cast</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      In Google Chrome, click the 3-dots menu &gt; <strong>Cast</strong> &gt; Select your Smart TV, Android TV, Google TV, or Fire TV stick.
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
                      <span>üçé 3. Apple TV / AirPlay</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      On Mac/iPhone/iPad, open Control Center &gt; click <strong>Screen Mirroring</strong> &gt; pick your Apple TV or AirPlay 2 compatible TV.
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
                      <span>üì• 4. Export MP4 Video to USB</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Use the <strong>Video Recorder & Export</strong> tool to record a 1080p MP4/WebM video file. Save it onto a USB flash drive and plug it into your TV!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Bar */}
          <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Full 1080p TV Broadcast Standards Active</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartTvPresentation();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-slate-950" />
                <span>üöÄ Launch Smart TV Cinema Mode</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
