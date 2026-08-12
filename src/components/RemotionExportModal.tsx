import React, { useState, useEffect, useRef } from 'react';
import { CartoonProject } from '../types';
import {
  Film,
  Video,
  Download,
  Play,
  Pause,
  Square,
  CheckCircle,
  Copy,
  Check,
  Tv,
  Layers,
  Sparkles,
  X,
  Clock,
  Youtube,
  ShieldCheck,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { generateBroadcastChapterMetadata, BroadcastMetadata } from '../utils/chapterMetadata';
import { BroadcastSafeAreas } from '../remotion/BroadcastSafeAreas';
import { playSoundEffect } from '../utils/audioSynthesizer';

interface RemotionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CartoonProject;
}

export const RemotionExportModal: React.FC<RemotionExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '4K'>('1080p');
  const [showSafeAreas, setShowSafeAreas] = useState(true);
  const [tvRating, setTvRating] = useState<'TV-Y7' | 'TV-G' | 'TV-14'>('TV-Y7');
  const [activeTab, setActiveTab] = useState<'preview' | 'chapters' | 'specs'>('preview');

  // Playback & Export State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0); // 0 to 100
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [copiedChapters, setCopiedChapters] = useState(false);
  const [copiedDescription, setCopiedDescription] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const metadata: BroadcastMetadata = generateBroadcastChapterMetadata(project);
  const totalDurationMs = project.scenes.reduce((acc, sc) => {
    return acc + (sc.durationSeconds ? sc.durationSeconds * 1000 : Math.max(2500, sc.dialogue.length * 65 + (sc.timingHoldMs || 600)));
  }, 0);
  const totalFrames = Math.max(96, Math.round((totalDurationMs / 1000) * 24)); // 24 fps

  const targetWidth = resolution === '4K' ? 3840 : 1920;
  const targetHeight = resolution === '4K' ? 2160 : 1080;

  useEffect(() => {
    return () => {
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
      if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
    };
  }, [exportedVideoUrl]);

  // Canvas Frame Renderer for 24fps Remotion Preview
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw scene frame onto 24fps Remotion Canvas
    const renderCanvasFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      const showStyle = project.showStyle || 'cartoon_network';

      // 1. Background Stage Theme
      if (showStyle === 'spongebob') {
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#0c4a6e');
        bgGrad.addColorStop(0.5, '#0369a1');
        bgGrad.addColorStop(1, '#082f49');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (showStyle === 'bluey') {
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#e0f2fe');
        bgGrad.addColorStop(0.5, '#e0e7ff');
        bgGrad.addColorStop(1, '#fef3c7');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Spotlight Glow
      const glowGrad = ctx.createRadialGradient(w / 2, h / 3, 10, w / 2, h / 3, w / 2);
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Determine scene from frame using frame-accurate durationSeconds
      const currentMs = (currentFrame / 24) * 1000;
      let activeSceneIndex = 0;
      let accumMs = 0;

      for (let i = 0; i < project.scenes.length; i++) {
        const sc = project.scenes[i];
        const duration = sc.durationSeconds ? sc.durationSeconds * 1000 : Math.max(2500, sc.dialogue.length * 65 + (sc.timingHoldMs || 600));
        if (currentMs >= accumMs && currentMs < accumMs + duration) {
          activeSceneIndex = i;
          break;
        }
        accumMs += duration;
      }

      const activeScene = project.scenes[activeSceneIndex] || project.scenes[0];
      const speaker = project.characters.find((c) => c.id === activeScene.speakerId) || project.characters[0];

      // Draw Studio Floor Circle
      ctx.save();
      ctx.strokeStyle = showStyle === 'bluey' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(w / 2, h - h * 0.18, w * 0.35, h * 0.08, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw Speaker Name & Dialogue Box (Title-Safe Area)
      ctx.save();
      if (showStyle === 'spongebob') {
        ctx.fillStyle = 'rgba(254, 243, 199, 0.95)';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 6;
      } else if (showStyle === 'bluey') {
        ctx.fillStyle = 'rgba(224, 242, 254, 0.95)';
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 6;
      } else {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
      }

      const boxW = w * 0.75;
      const boxH = h * 0.2;
      const boxX = (w - boxW) / 2;
      const boxY = h - boxH - h * 0.1;

      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 20);
      ctx.fill();
      ctx.stroke();

      // Dialogue Header & Text
      ctx.fillStyle = showStyle === 'spongebob' ? '#78350f' : showStyle === 'bluey' ? '#1e40af' : '#f59e0b';
      ctx.font = `bold ${Math.round(h * 0.028)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`🎬 ${speaker.name.toUpperCase()} • ${showStyle.toUpperCase()} STYLE`, w / 2, boxY + boxH * 0.32);

      ctx.fillStyle = showStyle === 'spongebob' || showStyle === 'bluey' ? '#0f172a' : '#ffffff';
      ctx.font = `bold ${Math.round(h * 0.038)}px sans-serif`;
      ctx.fillText(`"${activeScene.dialogue}"`, w / 2, boxY + boxH * 0.72);
      ctx.restore();

      // SpongeBob Gold Frame Accent
      if (showStyle === 'spongebob') {
        ctx.save();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 16;
        ctx.strokeRect(0, 0, w, h);
        ctx.restore();
      } else if (showStyle === 'bluey') {
        ctx.save();
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 16;
        ctx.strokeRect(0, 0, w, h);
        ctx.restore();
      }
    };

    renderCanvasFrame();
  }, [isOpen, currentFrame, project, resolution]);

  // Handle Play / Pause 24fps Loop
  useEffect(() => {
    if (isPlaying) {
      renderTimerRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev >= totalFrames ? 0 : prev + 1));
      }, 1000 / 24);
    } else {
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    }
    return () => {
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    };
  }, [isPlaying, totalFrames]);

  // High-Speed Broadcast 24fps Video Exporter
  const startBroadcastRender = () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    setRenderProgress(0);
    setIsPlaying(false);
    setCurrentFrame(0);

    const canvas = canvasRef.current;
    const stream = canvas.captureStream(24);
    recordedChunksRef.current = [];

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: resolution === '4K' ? 12000000 : 5000000, // 12 Mbps for 4K
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setExportedVideoUrl(url);
        setIsRendering(false);
        setRenderProgress(100);
        playSoundEffect('tada');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);

      // Render frames sequentially
      let frameCounter = 0;
      const exportInterval = setInterval(() => {
        frameCounter++;
        setCurrentFrame(frameCounter);
        setRenderProgress(Math.round((frameCounter / totalFrames) * 100));

        if (frameCounter >= totalFrames) {
          clearInterval(exportInterval);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 1000 / 24);
    } catch (err) {
      console.error('Export failed:', err);
      setIsRendering(false);
    }
  };

  const copyToClipboard = (text: string, type: 'chapters' | 'desc') => {
    navigator.clipboard.writeText(text);
    if (type === 'chapters') {
      setCopiedChapters(true);
      setTimeout(() => setCopiedChapters(false), 2000);
    } else {
      setCopiedDescription(true);
      setTimeout(() => setCopiedDescription(false), 2000);
    }
    playSoundEffect('pop');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-950 border-2 border-slate-800 w-full max-w-4xl rounded-3xl p-6 shadow-2xl text-white space-y-5 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl">
              <Film className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>🎬 Remotion Broadcast Export Engine</span>
                <span className="bg-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  24 FPS Master
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Broadcast TV compliance, safe-area grid overlays, and automated YouTube chapter metadata
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Resolution Selector Toggle */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-black">
              <button
                onClick={() => setResolution('1080p')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  resolution === '1080p'
                    ? 'bg-yellow-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1080p Full HD
              </button>
              <button
                onClick={() => setResolution('4K')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  resolution === '4K'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                4K Ultra HD
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODE NAVIGATION TABS */}
        <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-black">
          <div className="flex items-center gap-2">
            {[
              { id: 'preview', label: 'Remotion 24fps Canvas Player', icon: Video },
              { id: 'chapters', label: 'YouTube Chapter Metadata', icon: Youtube },
              { id: 'specs', label: 'Broadcast Compliance Specs', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-yellow-400 text-slate-950 shadow scale-102'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Safe Area Overlay Toggle */}
          <button
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              showSafeAreas
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Safe Areas: {showSafeAreas ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* TAB 1: REMOTION 24FPS CANVAS PREVIEW PLAYER */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {/* CANVAS PLAYER CONTAINER */}
            <div className="relative w-full aspect-video rounded-2xl border-4 border-slate-800 overflow-hidden bg-slate-950 shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={targetWidth}
                height={targetHeight}
                className="w-full h-full object-contain"
              />

              {/* Broadcast Safe Areas Overlay Layer */}
              <BroadcastSafeAreas
                showSafeAreas={showSafeAreas}
                resolutionLabel={`${resolution === '4K' ? '3840x2160 4K' : '1920x1080 FHD'} @ 24fps`}
                tvRating={tvRating}
                networkBugText={project.title.toUpperCase()}
              />

              {/* RENDER PROGRESS OVERLAY */}
              {isRendering && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center space-y-4 z-50 p-6 text-center">
                  <Film className="w-12 h-12 text-yellow-400 animate-spin" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Rendering Broadcast Video Master...</h3>
                    <p className="text-xs text-slate-400">
                      Encoding frame {currentFrame} / {totalFrames} @ 24fps ({resolution})
                    </p>
                  </div>
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-150"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm font-black text-yellow-400">{renderProgress}% Complete</span>
                </div>
              )}
            </div>

            {/* PLAYER CONTROLS & TIMELINE */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isRendering}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play 24fps'}</span>
                </button>

                <div className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  FRAME: <span className="text-yellow-400 font-bold">{currentFrame}</span> / {totalFrames} (24 fps)
                </div>
              </div>

              {/* EXPORT ACTION BUTTON */}
              <div className="flex items-center gap-2">
                {exportedVideoUrl ? (
                  <a
                    href={exportedVideoUrl}
                    download={`${project.title.replace(/\s+/g, '_')}_Remotion_${resolution}_24fps.webm`}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Master Video ({resolution})</span>
                  </a>
                ) : (
                  <button
                    onClick={startBroadcastRender}
                    disabled={isRendering}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
                  >
                    <Video className="w-4 h-4" />
                    <span>Render & Export Remotion {resolution} (24fps)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: YOUTUBE CHAPTER METADATA */}
        {activeTab === 'chapters' && (
          <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-yellow-300 flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>Automated YouTube Chapter Timestamps</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Generated from script scene dialogue lengths and timing hold beats
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(metadata.formattedChaptersText, 'chapters')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copiedChapters ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedChapters ? 'Copied Timestamps!' : 'Copy Chapter List'}</span>
              </button>
            </div>

            {/* Formatted Timestamps Block */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5 overflow-x-auto max-h-48">
              {metadata.chapters.map((ch, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-yellow-400 font-bold shrink-0">{ch.formattedTimestamp}</span>
                  <span className="text-slate-200">{ch.title}</span>
                </div>
              ))}
            </div>

            {/* Description Copy Block */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Complete YouTube Video Description & SEO Hashtags:</span>
                <button
                  onClick={() => copyToClipboard(metadata.youtubeDescription, 'desc')}
                  className="px-3 py-1 bg-yellow-400 text-slate-950 hover:bg-yellow-300 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  {copiedDescription ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDescription ? 'Copied Description!' : 'Copy Full Description'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={metadata.youtubeDescription}
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: BROADCAST COMPLIANCE SPECS */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>TV Network Video Specifications</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Frame Rate:</span>
                  <span className="font-mono font-bold text-yellow-400">24.00 fps (Film Standard)</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Aspect Ratio:</span>
                  <span className="font-mono font-bold text-white">16:9 Widescreen</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Full HD Master:</span>
                  <span className="font-mono font-bold text-emerald-400">1920x1080 Progressive</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-400">4K Ultra HD Master:</span>
                  <span className="font-mono font-bold text-amber-400">3840x2160 Ultra HD</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-yellow-300 flex items-center gap-2">
                <Tv className="w-4 h-4 text-yellow-400" />
                <span>Safe Areas & Content Rating</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Action-Safe Margin:</span>
                  <span className="font-mono font-bold text-cyan-400">90% Inner Margin (5% Border)</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Title-Safe Margin:</span>
                  <span className="font-mono font-bold text-yellow-400">80% Inner Margin (10% Border)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-400">TV Content Rating:</span>
                  <select
                    value={tvRating}
                    onChange={(e) => setTvRating(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-yellow-400 font-bold focus:outline-none"
                  >
                    <option value="TV-Y7">TV-Y7 (Children 7+)</option>
                    <option value="TV-G">TV-G (General Audience)</option>
                    <option value="TV-14">TV-14 (Parents Strongly Cautioned)</option>
                  </select>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
