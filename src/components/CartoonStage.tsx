import React, { useState, useEffect } from 'react';
import { CartoonProject, RoleplayScene, ActionEffectType, SceneTransitionType } from '../types';
import { CartoonAvatar } from './CartoonAvatars';
import { Code, Sparkles, Volume2, Film, GripHorizontal, Move, Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward, Monitor, Music, Disc, X, Eye, EyeOff, FileText, Image, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playThemeSongIntro, playSoundEffect, ThemeSongLyric, THEME_SONG_PRESETS } from '../utils/audioSynthesizer';

interface CartoonStageProps {
  project: CartoonProject;
  currentScene: RoleplayScene;
  currentSceneIndex: number;
  totalScenes: number;
  isSpeaking: boolean;
  isPlaying: boolean;
  onNextScene?: () => void;
  onPrevScene?: () => void;
  onTogglePlay?: () => void;
  onUpdateScene?: (index: number, updatedFields: Partial<RoleplayScene>) => void;
  onSetCastCount?: (count: number) => void;
  stageRef?: React.RefObject<HTMLDivElement | null>;
}

const getTransitionVariants = (transitionType?: SceneTransitionType) => {
  switch (transitionType) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.4, ease: 'easeInOut' },
      };
    case 'slide':
      return {
        initial: { x: '100%', opacity: 0 },
        animate: { x: '0%', opacity: 1 },
        exit: { x: '-100%', opacity: 0 },
        transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
      };
    case 'zoom':
      return {
        initial: { scale: 0.65, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.35, opacity: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
      };
    case 'wipe':
      return {
        initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0.8 },
        animate: { clipPath: 'inset(0 0% 0 0)', opacity: 1 },
        exit: { clipPath: 'inset(0 0 0 100%)', opacity: 0.8 },
        transition: { duration: 0.45, ease: 'easeInOut' },
      };
    case 'bounce':
      return {
        initial: { y: 80, scale: 0.8, opacity: 0 },
        animate: { y: 0, scale: 1, opacity: 1 },
        exit: { y: -80, scale: 0.8, opacity: 0 },
        transition: { type: 'spring', stiffness: 280, damping: 20 },
      };
    case 'none':
    default:
      return {
        initial: { opacity: 1, x: 0, y: 0, scale: 1, clipPath: 'inset(0 0% 0 0)' },
        animate: { opacity: 1, x: 0, y: 0, scale: 1, clipPath: 'inset(0 0% 0 0)' },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      };
  }
};

export const CartoonStage: React.FC<CartoonStageProps> = ({
  project,
  currentScene,
  currentSceneIndex,
  totalScenes,
  isSpeaking,
  isPlaying,
  onNextScene,
  onPrevScene,
  onTogglePlay,
  onUpdateScene,
  onSetCastCount,
  stageRef,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScriptHidden, setIsScriptHidden] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  // Dynamic character layout states
  const [charScales, setCharScales] = useState<Record<string, number>>({});
  const [hiddenCharIds, setHiddenCharIds] = useState<Set<string>>(new Set());
  const [charMotionOverrides, setCharMotionOverrides] = useState<Record<string, ActionEffectType | null>>({});

  // Overlay element scales & hidden sets
  const [overlayScales, setOverlayScales] = useState<Record<string, number>>({
    watermark: 1.0,
    tvbug: 1.0,
    concept: 1.0,
    ticker: 1.0,
    subtitles: 1.0,
    subscribe: 1.0,
    bubbles: 1.0,
  });
  const [hiddenOverlayIds, setHiddenOverlayIds] = useState<Set<string>>(new Set());

  const [isGreenScreenHidden, setIsGreenScreenHidden] = useState(false);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [isShortsMode, setIsShortsMode] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  const resetStageLayout = () => {
    setCharScales({});
    setHiddenCharIds(new Set());
    setCharMotionOverrides({});
    setOverlayScales({
      watermark: 1.0,
      tvbug: 1.0,
      concept: 1.0,
      ticker: 1.0,
      subtitles: 1.0,
      subscribe: 1.0,
      bubbles: 1.0,
    });
    setHiddenOverlayIds(new Set());
    setIsScriptHidden(false);
  };

  const unhideAllElements = () => {
    setHiddenCharIds(new Set());
    setHiddenOverlayIds(new Set());
    setIsScriptHidden(false);
  };

  const getCameraTransform = (angle?: string) => {
    switch (angle) {
      case 'CLOSE_UP_EMOTE':
        return 'scale(1.35) translateY(4%)';
      case 'OVER_THE_SHOULDER':
        return 'scale(1.25) translateX(-6%) translateY(2%)';
      case 'QUICK_WHIP_PAN':
        return 'scale(1.2) rotate(-1.5deg)';
      case 'SLOW_PUSH_IN':
        return isPlaying ? 'scale(1.18)' : 'scale(1.08)';
      case 'MEDIUM_TWO_SHOT':
        return 'scale(1.12) translateY(2%)';
      case 'REACTION_SHOT':
        return 'scale(1.3) translateX(8%) translateY(3%)';
      case 'WIDE_ESTABLISHING':
      default:
        return 'scale(1) translateX(0) translateY(0)';
    }
  };

  const triggerReaction = (emoji: string) => {
    const newId = Math.random().toString(36).substring(2, 9);
    // Random position in central stage
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    const y = Math.floor(Math.random() * 40) + 30; // 30% to 70%
    setReactions((prev) => [...prev, { id: newId, emoji, x, y }]);

    // Trigger associated sound effect
    if (emoji === '💥') playSoundEffect('pop');
    else if (emoji === '⭐' || emoji === '🎉') playSoundEffect('tada');
    else if (emoji === '😂') playSoundEffect('giggle');
    else if (emoji === '🔥' || emoji === '💯') playSoundEffect('bounce');
    else if (emoji === '🚀') playSoundEffect('robot_beep');
    else if (emoji === '🔔') playSoundEffect('success');
    else playSoundEffect('magic');

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newId));
    }, 1800);
  };
  const [isPlayingThemeSong, setIsPlayingThemeSong] = useState(false);
  const [activeLyric, setActiveLyric] = useState<ThemeSongLyric | null>(null);
  const [lyricProgress, setLyricProgress] = useState({ index: 0, total: 5 });
  const [themeCanceller, setThemeCanceller] = useState<{ cancel: () => void } | null>(null);

  const startThemeSong = (themeKey = 'lets_code_together') => {
    if (themeCanceller) {
      themeCanceller.cancel();
    }
    setIsPlayingThemeSong(true);
    const char1 = project.characters[0]?.name || 'Sponge';
    const char2 = project.characters[1]?.name || 'Patrick';

    const canceller = playThemeSongIntro(
      themeKey,
      char1,
      char2,
      (idx, total, lyric) => {
        setLyricProgress({ index: idx + 1, total });
        setActiveLyric(lyric);
      },
      () => {
        setIsPlayingThemeSong(false);
        setActiveLyric(null);
        setThemeCanceller(null);
      }
    );
    setThemeCanceller(canceller);
  };

  const stopThemeSong = () => {
    if (themeCanceller) {
      themeCanceller.cancel();
      setThemeCanceller(null);
    }
    setIsPlayingThemeSong(false);
    setActiveLyric(null);
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (document.fullscreenElement) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };
    const handleCustomToggle = () => {
      if (!isExpanded && !document.fullscreenElement) {
        setIsExpanded(true);
        const targetElem = stageRef?.current || document.getElementById('cartoon-canvas-stage');
        if (targetElem && targetElem.requestFullscreen) {
          targetElem.requestFullscreen().catch(() => {});
        }
      } else {
        setIsExpanded(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    const handleTriggerThemeSong = (e: any) => {
      const themeKey = e?.detail?.themeKey || 'spongebob';
      startThemeSong(themeKey);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('toggle-cartoon-fullscreen', handleCustomToggle);
    window.addEventListener('trigger-theme-song', handleTriggerThemeSong);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('toggle-cartoon-fullscreen', handleCustomToggle);
      window.removeEventListener('trigger-theme-song', handleTriggerThemeSong);
      if (themeCanceller) themeCanceller.cancel();
    };
  }, [isExpanded, stageRef, themeCanceller]);

  const toggleFullscreen = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      const targetElem = stageRef?.current || document.getElementById('cartoon-canvas-stage');
      if (targetElem && targetElem.requestFullscreen) {
        targetElem.requestFullscreen().catch(() => {
          // Native fullscreen failed or restricted in iframe; fallback to full-window CSS fixed overlay
        });
      }
    } else {
      setIsExpanded(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };
  // Stable character assignment so both cartoons stay on screen together on their respective sides
  const char1 = project.characters[0] || { id: 'char-1', name: 'Creator', style: 'spongebob', color: '#facc15' };
  let char2 = project.characters[1] || project.characters.find((c) => c.id !== char1.id);
  if (!char2 || char2.id === char1.id) {
    char2 = {
      id: char1.id + '-partner',
      name: char1.name === 'Patrick' ? 'Sponge' : 'Buddy',
      style: char1.style === 'patrick' ? 'spongebob' : 'patrick',
      color: '#f43f5e',
    };
  }

  const leftChar = char1;
  const rightChar = char2;
  const activeCharacters = project.characters.length > 0 ? project.characters : [char1, char2];

  // Determine if speaker is left character or right character
  const isSpeakerLeft = currentScene.speakerId
    ? currentScene.speakerId === leftChar.id || currentScene.speakerId !== rightChar.id
    : true;

  // Extract clean spoken sentence so long full script dumps or prompt headers never clutter the screen
  const getCleanSpokenLine = (scene: typeof currentScene, characters: typeof project.characters) => {
    if (!scene || !scene.dialogue) return '';
    let text = scene.dialogue.trim();

    // If scene is a Theme Song intro or outro, keep it clean and concise
    if (scene.isThemeSong) {
      if (text.length > 55 || text.toLowerCase().includes('characters:') || text.toLowerCase().includes('episode') || text.includes('\n')) {
        return "Welcome to the show! Let's learn together! 🚀 ✨";
      }
      return text;
    }

    // If text contains script metadata markers like "ADA:", "SPOCKY:", "Characters:", "Setting:", "Episode"
    if (text.includes('Characters:') || text.includes('Setting:') || text.toLowerCase().includes('episode') || text.includes('\n')) {
      const speaker = characters.find((c) => c.id === scene.speakerId);
      if (speaker) {
        const lines = text.split('\n');
        const speakerPattern = new RegExp(`${speaker.name}:?\\s*(.*)`, 'i');
        for (const line of lines) {
          const match = line.match(speakerPattern);
          if (match && match[1].trim()) {
            text = match[1].trim();
            break;
          }
        }
      }
      // Strip metadata headers if present
      text = text.replace(/^(characters|setting|episode|title|ada|spocky|creator|buddy):.*/gi, '').trim();
    }

    // If text is still super long (>90 chars), extract only the current single sentence
    if (text.length > 90) {
      const firstSentence = text.split(/(?<=[.!?])\s+/)[0];
      if (firstSentence && firstSentence.length > 5 && firstSentence.length < 90) {
        text = firstSentence;
      } else {
        text = text.slice(0, 85) + '...';
      }
    }

    return text || "Let's learn!";
  };

  const cleanSpokenDialogue = getCleanSpokenLine(currentScene, project.characters);

  // Background Theme Styles
  const getDecorClass = (baseSize: string, expandedSize: string) =>
    `pointer-events-none transition-all duration-300 ${
      isExpanded ? `${expandedSize} opacity-90` : `${baseSize} opacity-70`
    }`;

  const bgStyles: Record<string, { bg: string; decor: React.ReactNode }> = {
    tv_studio: {
      bg: 'from-slate-950 via-indigo-950 to-blue-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Reflective Studio Stage Floor */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-blue-900/40 via-slate-900/80 to-transparent border-t-2 border-cyan-400/60" />
          {/* Studio Overhead Spotlights */}
          <div className="absolute top-0 left-1/6 w-32 h-48 bg-gradient-to-b from-cyan-400/25 to-transparent blur-xl transform -rotate-12" />
          <div className="absolute top-0 right-1/6 w-32 h-48 bg-gradient-to-b from-blue-400/25 to-transparent blur-xl transform rotate-12" />
          {/* On-Air Live Badge */}
          <div className="absolute top-4 right-6 bg-red-600/90 text-white font-black text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-600/40 border border-red-400">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            🔴 ON AIR // LIVE STUDIO 1
          </div>
          {/* Studio Video Wall Banner */}
          <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-4/5 ${isExpanded ? 'h-32 sm:h-40 border-4' : 'h-20 border-2'} bg-slate-900/90 rounded-2xl border-cyan-500/50 flex flex-col items-center justify-center text-cyan-300 font-mono font-black ${isExpanded ? 'text-lg sm:text-2xl' : 'text-xs sm:text-sm'} shadow-2xl backdrop-blur-md`}>
            <span>📺 BROADCAST NETWORK STUDIO</span>
            <span className="text-[10px] sm:text-xs text-yellow-400 font-sans tracking-widest uppercase">HD Live Signal // Channel 4K</span>
          </div>
          <div className={`absolute bottom-6 left-8 ${getDecorClass('text-5xl', 'text-8xl')}`}>🎥</div>
          <div className={`absolute bottom-6 right-8 ${getDecorClass('text-5xl', 'text-8xl')}`}>🎬</div>
        </div>
      ),
    },
    tech_conference: {
      bg: 'from-blue-950 via-slate-950 to-purple-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Stage Platform */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-purple-950 via-slate-900/90 to-transparent border-t-2 border-purple-500/60" />
          {/* Keynote Main LED Backdrop Screen */}
          <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-11/12 ${isExpanded ? 'h-40 sm:h-52 border-4' : 'h-24 border-2'} bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 rounded-2xl border-purple-400/60 flex flex-col items-center justify-center text-white font-black ${isExpanded ? 'text-xl sm:text-3xl' : 'text-sm'} shadow-2xl backdrop-blur-md`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-purple-300">⚡ TECH SUMMIT 2026 KEYNOTE</span>
            <span className="text-[10px] sm:text-xs text-purple-200 font-mono font-medium">MAIN STAGE HALL A</span>
          </div>
          {/* Stage Spotlights Glow */}
          <div className={`absolute bottom-8 left-1/4 ${getDecorClass('text-5xl', 'text-8xl')}`}>🎙️</div>
          <div className={`absolute bottom-8 right-1/4 ${getDecorClass('text-5xl', 'text-8xl')}`}>📢</div>
        </div>
      ),
    },
    podcast_booth: {
      bg: 'from-amber-950 via-slate-900 to-stone-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Acoustic Foam Wall Panels & LED Strip */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-25" />
          <div className="absolute inset-x-0 top-1/2 h-1 bg-amber-500/60 shadow-[0_0_15px_#f59e0b]" />
          {/* Wooden Studio Desk */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-amber-950/90 border-t-4 border-amber-700/80" />
          {/* Studio Mics & Headphones */}
          <div className={`absolute top-6 left-6 text-amber-400 font-mono font-black ${isExpanded ? 'text-sm sm:text-base' : 'text-[10px]'}`}>
            🎙️ ACOUSTIC PODCAST BOOTH // AUDIO 192kHz
          </div>
          <div className={`absolute bottom-10 left-12 ${getDecorClass('text-5xl', 'text-8xl')}`}>🎙️</div>
          <div className={`absolute bottom-10 right-12 ${getDecorClass('text-5xl', 'text-8xl')}`}>🎧</div>
          <div className={`absolute top-1/3 right-10 ${getDecorClass('text-4xl', 'text-7xl')}`}>📻</div>
        </div>
      ),
    },
    modern_office: {
      bg: 'from-slate-900 via-slate-800 to-indigo-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* City Skyline Window Backdrop */}
          <div className="absolute top-6 inset-x-8 h-2/5 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700 p-3 overflow-hidden flex items-end justify-between opacity-80">
            <div className="text-[9px] sm:text-xs text-sky-300 font-mono font-bold">🌆 CITY CENTER BOARDROOM (VIEW)</div>
            <div className="flex gap-1 items-end h-full">
              <div className="w-4 h-16 bg-slate-700/80 rounded-t-sm" />
              <div className="w-6 h-24 bg-slate-600/80 rounded-t-sm" />
              <div className="w-5 h-20 bg-slate-700/80 rounded-t-sm" />
              <div className="w-7 h-28 bg-slate-500/80 rounded-t-sm" />
            </div>
          </div>
          {/* Executive Conference Table */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-slate-800/90 border-t-4 border-indigo-500/50" />
          <div className={`absolute bottom-8 left-10 ${getDecorClass('text-5xl', 'text-8xl')}`}>💼</div>
          <div className={`absolute bottom-8 right-10 ${getDecorClass('text-5xl', 'text-8xl')}`}>📊</div>
        </div>
      ),
    },
    server_room: {
      bg: 'from-slate-950 via-cyan-950 to-emerald-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Data Center Raised Floor */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-slate-900/95 border-t-2 border-emerald-500/60" />
          {/* Server Racks Left & Right */}
          <div className={`absolute top-8 left-4 w-28 sm:w-44 ${isExpanded ? 'h-48 sm:h-64' : 'h-28'} bg-slate-900 rounded-xl border-2 border-cyan-500/40 p-2 flex flex-col justify-between`}>
            <div className="text-[8px] sm:text-[10px] text-cyan-400 font-mono font-bold">RACK-01 // ACTIVE</div>
            <div className="space-y-1">
              <div className="h-2 bg-emerald-500/80 rounded animate-pulse" />
              <div className="h-2 bg-cyan-500/80 rounded" />
              <div className="h-2 bg-blue-500/80 rounded animate-pulse" />
            </div>
          </div>
          <div className={`absolute top-8 right-4 w-28 sm:w-44 ${isExpanded ? 'h-48 sm:h-64' : 'h-28'} bg-slate-900 rounded-xl border-2 border-emerald-500/40 p-2 flex flex-col justify-between`}>
            <div className="text-[8px] sm:text-[10px] text-emerald-400 font-mono font-bold">RACK-02 // ONLINE</div>
            <div className="space-y-1">
              <div className="h-2 bg-emerald-500/80 rounded" />
              <div className="h-2 bg-yellow-500/80 rounded animate-pulse" />
              <div className="h-2 bg-cyan-500/80 rounded animate-pulse" />
            </div>
          </div>
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 ${getDecorClass('text-5xl', 'text-8xl')}`}>🗄️</div>
        </div>
      ),
    },
    lecture_hall: {
      bg: 'from-slate-900 via-indigo-950 to-slate-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Wooden Stage Floor */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-amber-950/80 border-t-4 border-amber-800" />
          {/* Main Auditorium Projection Screen */}
          <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-4/5 ${isExpanded ? 'h-36 sm:h-48 border-4' : 'h-24 border-2'} bg-slate-900/95 rounded-2xl border-indigo-400/60 flex flex-col items-center justify-center text-indigo-200 font-mono font-black ${isExpanded ? 'text-xl sm:text-3xl' : 'text-xs sm:text-sm'} shadow-2xl`}>
            <span>🎓 UNIVERSITY AMPHITHEATER LECTURE</span>
            <span className="text-[10px] sm:text-xs text-yellow-300 font-sans uppercase">DEPARTMENT OF COMPUTER SCIENCE & AI</span>
          </div>
          <div className={`absolute bottom-8 left-10 ${getDecorClass('text-5xl', 'text-8xl')}`}>🏛️</div>
          <div className={`absolute bottom-8 right-10 ${getDecorClass('text-5xl', 'text-8xl')}`}>📚</div>
        </div>
      ),
    },
    bakery: {
      bg: 'from-amber-100 via-orange-100 to-amber-200',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Wooden Kitchen Counter / Floor */}
          <div className="absolute bottom-0 inset-x-0 h-1/4 bg-amber-800/40 border-t-4 border-amber-900/60" />
          {/* Bakery Wallpaper elements */}
          <div className={`absolute top-12 left-8 ${getDecorClass('text-5xl', 'text-8xl sm:text-9xl')} animate-pulse`}>🧁</div>
          <div className={`absolute top-16 right-12 ${getDecorClass('text-6xl', 'text-9xl sm:text-[140px]')}`}>🍪</div>
          <div className={`absolute bottom-6 left-1/4 ${getDecorClass('text-5xl', 'text-8xl')}`}>🍰</div>
          <div className={`absolute bottom-8 right-1/4 ${getDecorClass('text-5xl', 'text-8xl')}`}>🍞</div>
          <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 ${getDecorClass('text-7xl', 'text-[120px]')}`}>🍩</div>
        </div>
      ),
    },
    space: {
      bg: 'from-slate-950 via-indigo-950 to-purple-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Glowing Space Nebula Floor */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-purple-900/50 to-transparent" />
          <div className={`absolute top-10 left-12 ${getDecorClass('text-3xl', 'text-6xl')} animate-pulse`}>⭐</div>
          <div className={`absolute top-16 right-16 ${getDecorClass('text-5xl', 'text-9xl sm:text-[140px]')} animate-bounce`}>🪐</div>
          <div className={`absolute bottom-12 left-12 ${getDecorClass('text-5xl', 'text-9xl')} animate-pulse`}>🚀</div>
          <div className={`absolute top-1/4 left-1/3 ${getDecorClass('text-4xl', 'text-7xl')}`}>✨</div>
          <div className={`absolute bottom-16 right-1/3 ${getDecorClass('text-5xl', 'text-8xl')}`}>🌙</div>
          <div className={`absolute top-8 right-1/3 ${getDecorClass('text-3xl', 'text-6xl')} animate-ping`}>🌟</div>
        </div>
      ),
    },
    magic_lab: {
      bg: 'from-purple-950 via-violet-900 to-indigo-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 inset-x-0 h-1/4 bg-purple-900/60 border-t-2 border-purple-500/40" />
          <div className={`absolute top-10 left-16 ${getDecorClass('text-5xl', 'text-9xl sm:text-[130px]')} animate-pulse`}>🔮</div>
          <div className={`absolute bottom-8 right-12 ${getDecorClass('text-6xl', 'text-9xl sm:text-[140px]')}`}>🧪</div>
          <div className={`absolute top-14 right-1/3 ${getDecorClass('text-4xl', 'text-8xl')} animate-bounce`}>📚</div>
          <div className={`absolute bottom-12 left-1/4 ${getDecorClass('text-5xl', 'text-8xl')}`}>🧙‍♂️</div>
          <div className={`absolute top-1/3 left-12 ${getDecorClass('text-4xl', 'text-7xl')} animate-pulse`}>✨</div>
        </div>
      ),
    },
    cyber_grid: {
      bg: 'from-cyan-950 via-slate-950 to-teal-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(#06b6d4_2px,transparent_2px)] [background-size:24px_24px]">
          {/* Cyber Floor Grid */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-cyan-900/60 via-cyan-950/40 to-transparent border-t border-cyan-400/50" />
          <div className={`absolute top-12 left-8 text-cyan-400 font-mono ${isExpanded ? 'text-lg sm:text-2xl' : 'text-xs sm:text-sm'} font-bold`}>
            01001001 01001110 01010100 01010010 01001111
          </div>
          <div className={`absolute bottom-10 right-8 text-emerald-400 font-mono ${isExpanded ? 'text-lg sm:text-2xl' : 'text-xs sm:text-sm'} font-bold`}>
            WHILE (CARTOON_ACTIVE) &#123; BUILD(); &#125;
          </div>
          <div className={`absolute top-1/3 right-12 ${getDecorClass('text-5xl', 'text-9xl')}`}>🤖</div>
          <div className={`absolute bottom-16 left-12 ${getDecorClass('text-5xl', 'text-8xl')}`}>⚡</div>
        </div>
      ),
    },
    tech_lab: {
      bg: 'from-blue-950 via-slate-900 to-cyan-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(#38bdf8_2px,transparent_2px)] [background-size:24px_24px]">
          <div className="absolute bottom-0 inset-x-0 h-1/4 bg-slate-900/90 border-t-2 border-cyan-500/50" />
          <div className={`absolute top-12 left-10 text-cyan-300 font-mono ${isExpanded ? 'text-base sm:text-xl' : 'text-xs'} font-bold flex items-center gap-2`}>
            <span>💻 TECH & CODE LAB</span>
            <span className="text-yellow-400">STATUS: ONLINE</span>
          </div>
          <div className={`absolute top-1/4 right-10 ${getDecorClass('text-6xl', 'text-9xl sm:text-[130px]')}`}>🖥️</div>
          <div className={`absolute bottom-8 left-16 ${getDecorClass('text-5xl', 'text-8xl')}`}>⚙️</div>
          <div className={`absolute bottom-8 right-1/3 ${getDecorClass('text-5xl', 'text-8xl')}`}>💡</div>
        </div>
      ),
    },
    classroom: {
      bg: 'from-emerald-200 via-teal-100 to-green-200',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Wooden Floor */}
          <div className="absolute bottom-0 inset-x-0 h-1/4 bg-amber-900/40 border-t-4 border-amber-800" />
          {/* Classroom Chalkboard Banner */}
          <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-4/5 ${isExpanded ? 'h-36 sm:h-44 border-8' : 'h-24 border-4'} bg-emerald-900 rounded-2xl border-amber-800 flex items-center justify-center text-yellow-300 font-mono font-black ${isExpanded ? 'text-xl sm:text-3xl' : 'text-sm sm:text-base'} shadow-2xl`}>
            WELCOME TO CARTOON CODE CLASS! 🎓✏️
          </div>
          <div className={`absolute bottom-6 left-8 ${getDecorClass('text-5xl', 'text-8xl')}`}>📚</div>
          <div className={`absolute bottom-6 right-8 ${getDecorClass('text-5xl', 'text-8xl')}`}>📝</div>
        </div>
      ),
    },
    jungle: {
      bg: 'from-emerald-900 via-green-800 to-lime-900',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 inset-x-0 h-1/4 bg-emerald-950/60 border-t-4 border-green-700" />
          <div className={`absolute top-8 left-6 ${getDecorClass('text-7xl', 'text-9xl sm:text-[150px]')}`}>🌴</div>
          <div className={`absolute top-8 right-6 ${getDecorClass('text-7xl', 'text-9xl sm:text-[150px]')}`}>🌴</div>
          <div className={`absolute bottom-6 left-1/3 ${getDecorClass('text-5xl', 'text-8xl')}`}>💎</div>
          <div className={`absolute top-1/3 right-1/4 ${getDecorClass('text-5xl', 'text-8xl')}`}>🦜</div>
        </div>
      ),
    },
    beach: {
      bg: 'from-sky-300 via-amber-100 to-amber-200',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Sandy Shore */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-amber-300/60 border-t-4 border-sky-400" />
          <div className={`absolute top-8 right-12 ${getDecorClass('text-6xl', 'text-9xl sm:text-[140px]')} animate-pulse`}>☀️</div>
          <div className={`absolute bottom-6 left-8 ${getDecorClass('text-6xl', 'text-9xl')}`}>🏖️</div>
          <div className={`absolute bottom-6 right-8 ${getDecorClass('text-6xl', 'text-9xl')}`}>🦀</div>
          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 ${getDecorClass('text-7xl', 'text-[120px]')}`}>🌊</div>
        </div>
      ),
    },
    underwater: {
      bg: 'from-cyan-900 via-blue-900 to-indigo-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-blue-950/70 border-t-2 border-cyan-400/40" />
          <div className={`absolute top-12 left-10 ${getDecorClass('text-6xl', 'text-9xl sm:text-[130px]')} animate-bounce`}>🐠</div>
          <div className={`absolute bottom-8 right-12 ${getDecorClass('text-7xl', 'text-9xl sm:text-[150px]')}`}>🐙</div>
          <div className={`absolute top-16 right-1/3 ${getDecorClass('text-6xl', 'text-9xl')}`}>🐬</div>
          <div className={`absolute bottom-12 left-1/3 ${getDecorClass('text-5xl', 'text-8xl')} animate-pulse`}>🫧</div>
        </div>
      ),
    },
    candy_land: {
      bg: 'from-pink-300 via-purple-200 to-rose-300',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 inset-x-0 h-1/4 bg-pink-400/40 border-t-4 border-pink-500" />
          <div className={`absolute top-10 left-8 ${getDecorClass('text-7xl', 'text-9xl sm:text-[140px]')}`}>🍭</div>
          <div className={`absolute bottom-6 right-10 ${getDecorClass('text-6xl', 'text-9xl sm:text-[130px]')}`}>🍬</div>
          <div className={`absolute top-14 right-1/3 ${getDecorClass('text-7xl', 'text-[120px]')}`}>🍩</div>
          <div className={`absolute bottom-8 left-1/3 ${getDecorClass('text-5xl', 'text-8xl')}`}>🍦</div>
        </div>
      ),
    },
    castle: {
      bg: 'from-amber-950 via-slate-900 to-purple-950',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 inset-x-0 h-1/4 bg-slate-900 border-t-4 border-amber-700/60" />
          <div className={`absolute top-10 left-8 ${getDecorClass('text-7xl', 'text-9xl sm:text-[150px]')}`}>🏰</div>
          <div className={`absolute bottom-6 right-10 ${getDecorClass('text-6xl', 'text-9xl')}`}>🛡️</div>
          <div className={`absolute top-12 right-1/4 ${getDecorClass('text-6xl', 'text-9xl')}`}>👑</div>
        </div>
      ),
    },
    greenscreen: {
      bg: 'from-green-500 via-lime-500 to-emerald-500',
      decor: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#00FF00]">
          {/* Studio Green Screen Grid & Target Crosshairs */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-30" />
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-emerald-300 border border-emerald-400/60 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-2 uppercase tracking-wider shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            🟩 Studio Green Screen Chroma Key Backdrop
          </div>
          <div className="absolute bottom-4 right-4 text-emerald-950/40 font-mono font-black text-xs sm:text-sm">
            CHROMA KEY AREA [1080p READY]
          </div>
        </div>
      ),
    },
  };

  const currentBg = bgStyles[currentScene.background] || bgStyles.bakery;
  const isDarkBg =
    currentScene.background === 'space' ||
    currentScene.background === 'magic_lab' ||
    currentScene.background === 'cyber_grid' ||
    currentScene.background === 'tech_lab' ||
    currentScene.background === 'castle' ||
    currentScene.background === 'underwater' ||
    currentScene.background === 'tv_studio' ||
    currentScene.background === 'tech_conference' ||
    currentScene.background === 'podcast_booth' ||
    currentScene.background === 'modern_office' ||
    currentScene.background === 'server_room' ||
    currentScene.background === 'lecture_hall';

  return (
    <div
      ref={stageRef}
      id="cartoon-canvas-stage"
      className={`relative w-full ${
        isExpanded
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none p-6 sm:p-10 shadow-none'
          : 'aspect-video rounded-2xl border-4 border-slate-800 p-6 shadow-2xl'
      } overflow-hidden bg-gradient-to-b ${currentBg.bg} flex flex-col justify-between select-none transition-all duration-300`}
    >
      {/* Base Theme Background Decor (Always rendered underneath so studio atmosphere stays intact) */}
      {currentBg.decor}

      {/* Custom Uploaded Green Screen / Screen Grab Presentation Display Monitor (Movable & Draggable) */}
      {!isGreenScreenHidden && currentScene.customBackgroundUrl ? (
        (currentScene.screenGrabSize || 'medium') === 'full' ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {currentScene.customBackgroundUrl.startsWith('data:video') || currentScene.customBackgroundUrl.endsWith('.mp4') ? (
              <video
                src={currentScene.customBackgroundUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentScene.customBackgroundUrl}
                alt="Custom Green Screen / Show Background"
                className={`w-full h-full object-cover ${currentScene.isGreenScreenKeyed ? 'filter contrast-125 saturate-150' : ''}`}
              />
            )}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-yellow-300 border border-yellow-400/50 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg pointer-events-auto">
              <Image className="w-3.5 h-3.5 text-yellow-400" />
              <span>📸 Full Custom Backdrop</span>
              <button
                type="button"
                onClick={() => onUpdateScene?.(currentSceneIndex, { screenGrabSize: 'large' })}
                className="ml-1 text-emerald-300 hover:text-emerald-200 bg-slate-900/80 px-2 py-0.5 rounded-full text-[9px] font-black border border-emerald-500/40"
                title="Switch to Movable Window Presentation"
              >
                📺 Switch to Movable Monitor
              </button>
              <button
                type="button"
                onClick={() => setIsGreenScreenHidden(true)}
                className="ml-1.5 p-0.5 bg-black/60 hover:bg-red-900 text-slate-300 hover:text-white rounded transition-colors"
                title="Hide Green Screen Backdrop"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            drag
            dragConstraints={stageRef}
            dragElastic={0.05}
            dragMomentum={false}
            whileTap={{ scale: 1.02 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute top-10 left-[8%] sm:left-[15%] md:left-[22%] z-20 bg-slate-950/95 border-2 border-emerald-400/80 rounded-2xl shadow-2xl p-2 flex flex-col gap-1.5 cursor-grab active:cursor-grabbing backdrop-blur-md touch-none ${
              (currentScene.screenGrabSize || 'medium') === 'small'
                ? 'w-60 sm:w-72'
                : (currentScene.screenGrabSize || 'medium') === 'large'
                ? 'w-[88%] max-w-xl'
                : 'w-80 sm:w-[420px] md:w-[460px]'
            }`}
          >
            {/* Screen Grab Monitor Header Bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-slate-900/90 rounded-lg text-white text-[10px] sm:text-xs font-black">
              <div className="flex items-center gap-1.5 truncate">
                <GripHorizontal className="w-3.5 h-3.5 text-yellow-400 animate-pulse shrink-0" />
                <span className="text-emerald-300 truncate">📺 SCREEN GRAB PRESENTATION</span>
                <span className="bg-slate-800 text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                  <Move className="w-2.5 h-2.5 text-yellow-400" />
                  Drag
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] text-slate-400 font-normal hidden xs:inline">Size:</span>
                {(['small', 'medium', 'large', 'full'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateScene?.(currentSceneIndex, { screenGrabSize: sz });
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-all ${
                      (currentScene.screenGrabSize || 'medium') === sz
                        ? 'bg-emerald-400 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title={`Change Screen Grab to ${sz} size`}
                  >
                    {sz === 'small' ? 'S' : sz === 'medium' ? 'M' : sz === 'large' ? 'L' : 'Full'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGreenScreenHidden(true);
                  }}
                  className="p-1 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded transition-all ml-1 cursor-pointer"
                  title="Hide Green Screen Presentation Monitor"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Media Screen Display Window */}
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-emerald-500/40 shadow-inner">
              {currentScene.customBackgroundUrl.startsWith('data:video') || currentScene.customBackgroundUrl.endsWith('.mp4') ? (
                <video
                  src={currentScene.customBackgroundUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={currentScene.customBackgroundUrl}
                  alt="Screen Grab Presentation"
                  className={`w-full h-full object-cover ${currentScene.isGreenScreenKeyed ? 'filter contrast-125 saturate-150' : ''}`}
                />
              )}
            </div>
          </motion.div>
        )
      ) : null}

      {/* Floating Stage Layers & Element Visibility Menu Trigger */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
          className={`backdrop-blur-md text-[11px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl transition-all active:scale-95 border ${
            isLayersMenuOpen
              ? 'bg-yellow-400 text-slate-950 border-yellow-300 ring-2 ring-yellow-400/50'
              : 'bg-black/75 hover:bg-black/90 text-yellow-300 border-yellow-400/50'
          }`}
          title="Toggle Visibility of Stage Elements (Cartoons, Bubbles, Script, Headers)"
        >
          <Eye className="w-3.5 h-3.5 text-yellow-400" />
          <span>Hide / Show Elements</span>
        </button>

        {(isHeaderHidden || project.showTopHeader === false) && (
          <button
            onClick={() => setIsHeaderHidden(false)}
            className="bg-black/75 hover:bg-black/90 backdrop-blur-md text-yellow-300 border border-yellow-400/50 text-[11px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl transition-all active:scale-95"
            title="Show Episode Title Header Banner"
          >
            <Eye className="w-3.5 h-3.5 text-yellow-400" />
            <span>Show Episode Title</span>
          </button>
        )}
      </div>

      {/* Popover Menu for Toggling Screen Elements Visibility */}
      <AnimatePresence>
        {isLayersMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute top-12 right-3 z-50 bg-slate-950/95 border-2 border-yellow-400/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md w-64 text-white text-xs space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-yellow-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-yellow-400" />
                Stage Element Visibility
              </span>
              <button
                onClick={() => setIsLayersMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1 max-h-80 overflow-y-auto">
              {/* Dynamic Cartoon Cast Members Control List */}
              {activeCharacters.map((char) => {
                const isHidden = hiddenCharIds.has(char.id);
                const scale = charScales[char.id] ?? 1.0;
                return (
                  <div key={char.id} className="bg-slate-900 p-2 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5 truncate">
                        <span>🎭</span>
                        <span className="truncate">{char.name}</span>
                        <span className="text-[10px] text-yellow-300 font-mono">({Math.round(scale * 100)}%)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setHiddenCharIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(char.id)) next.delete(char.id);
                            else next.add(char.id);
                            return next;
                          });
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all border ${
                          !isHidden
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : 'bg-red-950 text-red-300 border-red-800'
                        }`}
                      >
                        {!isHidden ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                        <span>{!isHidden ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                    {/* Size Presets */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold">Size:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCharScales((prev) => ({ ...prev, [char.id]: Math.max(0.4, Number(((prev[char.id] ?? 1.0) - 0.15).toFixed(2))) }))}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-black rounded border border-slate-700 active:scale-95 text-xs"
                        >
                          -
                        </button>
                        {[
                          { label: 'S', val: 0.75 },
                          { label: 'M', val: 1.0 },
                          { label: 'L', val: 1.35 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setCharScales((prev) => ({ ...prev, [char.id]: p.val }))}
                            className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded transition-all ${
                              Math.abs((charScales[char.id] ?? 1.0) - p.val) < 0.08
                                ? 'bg-yellow-400 text-slate-950 font-black scale-105 shadow'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCharScales((prev) => ({ ...prev, [char.id]: Math.min(2.5, Number(((prev[char.id] ?? 1.0) + 0.15).toFixed(2))) }))}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-black rounded border border-slate-700 active:scale-95 text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Speech Bubbles Toggle */}
              <button
                type="button"
                onClick={() => {
                  setHiddenOverlayIds((prev) => {
                    const next = new Set(prev);
                    if (next.has('bubbles')) next.delete('bubbles');
                    else next.add('bubbles');
                    return next;
                  });
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-bold transition-all border ${
                  !hiddenOverlayIds.has('bubbles')
                    ? 'bg-slate-800 text-slate-100 border-slate-700'
                    : 'bg-red-950/60 text-red-300 border-red-800/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>💬</span>
                  <span>Speech Bubbles</span>
                </span>
                {!hiddenOverlayIds.has('bubbles') ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
              </button>

              {/* Yellow Script Box */}
              <button
                type="button"
                onClick={() => setIsScriptHidden(!isScriptHidden)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-bold transition-all border ${
                  !isScriptHidden
                    ? 'bg-slate-800 text-slate-100 border-slate-700'
                    : 'bg-red-950/60 text-red-300 border-red-800/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>📜</span>
                  <span>Script / Takeaway Box</span>
                </span>
                {!isScriptHidden ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
              </button>

              {/* Title Header Banner */}
              <button
                type="button"
                onClick={() => setIsHeaderHidden(!isHeaderHidden)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-bold transition-all border ${
                  !isHeaderHidden
                    ? 'bg-slate-800 text-slate-100 border-slate-700'
                    : 'bg-red-950/60 text-red-300 border-red-800/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🎬</span>
                  <span>Title Banner</span>
                </span>
                {!isHeaderHidden ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
              </button>

              {/* Subtitles Bar */}
              <button
                type="button"
                onClick={() => {
                  setHiddenOverlayIds((prev) => {
                    const next = new Set(prev);
                    if (next.has('subtitles')) next.delete('subtitles');
                    else next.add('subtitles');
                    return next;
                  });
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-bold transition-all border ${
                  !hiddenOverlayIds.has('subtitles')
                    ? 'bg-slate-800 text-slate-100 border-slate-700'
                    : 'bg-red-950/60 text-red-300 border-red-800/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🗣️</span>
                  <span>Subtitles Bar</span>
                </span>
                {!hiddenOverlayIds.has('subtitles') ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
              </button>
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  unhideAllElements();
                  resetStageLayout();
                  setIsHeaderHidden(false);
                }}
                className="w-full py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-center text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                ✨ Show All Elements & Reset Sizes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Banner: Episode Title, Scene Counter, Script Toggle & Fullscreen Toggle */}
      {/* Top Header Banner: Episode Title, Scene Counter, Script Toggle & Fullscreen Toggle (Movable & Draggable) */}
      {!isHeaderHidden && project.showTopHeader !== false && (
        <motion.div
          drag
          dragConstraints={stageRef}
          dragElastic={0.05}
          dragMomentum={false}
          whileTap={{ scale: 1.01 }}
          className="relative z-30 flex items-center justify-between bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white cursor-grab active:cursor-grabbing group shadow-xl touch-none"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-yellow-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 animate-pulse" />
            <Film className="w-5 h-5 text-yellow-400 animate-spin-slow" />
            <span className="font-extrabold text-sm md:text-base tracking-wide truncate max-w-[180px] sm:max-w-[260px] md:max-w-md">
              {project.title}
            </span>
            <span className="bg-yellow-400 text-slate-900 text-xs font-black px-2 py-0.5 rounded-md uppercase hidden sm:inline-block">
              {project.topic}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {currentScene.soundEffect && currentScene.soundEffect !== 'none' && (
              <span className="bg-purple-500/80 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold animate-bounce">
                <Volume2 className="w-3.5 h-3.5" />
                {currentScene.soundEffect}
              </span>
            )}
            {currentScene.sceneTransition && currentScene.sceneTransition !== 'none' && (
              <span className="bg-indigo-600/90 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-bold border border-indigo-300/40 shadow-md">
                <Film className="w-3 h-3 text-indigo-200" />
                <span className="capitalize">{currentScene.sceneTransition}</span>
              </span>
            )}
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
              Scene {currentSceneIndex + 1} / {totalScenes}
            </span>

            {/* TOP HEADER CONTROLS: PLAY/PAUSE, SHORTS MODE, SUBSCRIBE OVERLAY, SOUNDBOARD, FULLSCREEN & THEME SONG BUTTON */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {onTogglePlay && (
                <button
                  onClick={onTogglePlay}
                  className={`text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 border ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-200'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-200 animate-pulse'
                  }`}
                  title={isPlaying ? 'Pause Cartoon Episode' : 'Play Cartoon Episode'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play Episode'}</span>
                </button>
              )}

              <button
                onClick={() => setIsShortsMode(!isShortsMode)}
                className={`text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md active:scale-95 border ${
                  isShortsMode
                    ? 'bg-rose-600 text-white border-rose-300 shadow-rose-950 scale-102 ring-2 ring-rose-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                title="Toggle YouTube Shorts 9:16 Vertical Framing Guide"
              >
                <span>📱</span>
                <span className="hidden md:inline">{isShortsMode ? '9:16 Shorts' : '16:9 Video'}</span>
              </button>

              <button
                onClick={() => {
                  const isHidden = hiddenOverlayIds.has('subscribe');
                  setHiddenOverlayIds((prev) => {
                    const next = new Set(prev);
                    if (isHidden) {
                      next.delete('subscribe');
                      playSoundEffect('success');
                    } else {
                      next.add('subscribe');
                    }
                    return next;
                  });
                }}
                className={`text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md active:scale-95 border ${
                  !hiddenOverlayIds.has('subscribe')
                    ? 'bg-red-600 text-white border-red-400 shadow-red-950 ring-2 ring-red-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Toggle On-Screen Subscribe CTA Banner for YouTube"
              >
                <span>🔔</span>
                <span className="hidden lg:inline">Subscribe CTA</span>
              </button>

              <button
                onClick={() => setIsSoundboardOpen(!isSoundboardOpen)}
                className={`text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md active:scale-95 border ${
                  isSoundboardOpen
                    ? 'bg-yellow-400 text-slate-950 border-yellow-200'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
                title="Toggle Live Creator YouTube Soundboard"
              >
                <span>📢</span>
                <span className="hidden sm:inline">Soundboard</span>
              </button>

              <button
                onClick={() => {
                  const next = !isScriptHidden;
                  setIsScriptHidden(next);
                  if (next) playSoundEffect('pop');
                }}
                className={`text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 border ${
                  isScriptHidden
                    ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400 shadow-emerald-950'
                    : 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-500'
                }`}
                title={isScriptHidden ? 'Script is Hidden for Kids (Clean Animation View)' : 'Hide Episode Script & Code Overlays for Kids'}
              >
                {isScriptHidden ? <EyeOff className="w-3.5 h-3.5 text-yellow-300" /> : <Eye className="w-3.5 h-3.5 text-yellow-300" />}
                <span className="hidden xs:inline">{isScriptHidden ? '🙈 Script Hidden (Kids)' : '📜 Script Visible'}</span>
              </button>

              <button
                onClick={() => startThemeSong('lets_code_together')}
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-amber-950/50 border border-yellow-200/50 active:scale-95 shrink-0"
                title="Play Channel Sing-Along Theme Song Intro"
              >
                <Music className="w-4 h-4 text-slate-950 animate-bounce" />
                <span className="hidden sm:inline">🎵 Theme Song</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-purple-950 border border-purple-400/40 active:scale-95 shrink-0"
                title={isExpanded ? 'Exit Full Screen' : 'Expand to Full Laptop Screen for Recording'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4 text-yellow-300" /> : <Maximize2 className="w-4 h-4 text-yellow-300" />}
                <span>{isExpanded ? 'Exit Fullscreen' : 'Expand Screen'}</span>
              </button>

              <button
                onClick={() => setIsHeaderHidden(true)}
                className="p-1.5 bg-black/30 hover:bg-black/60 text-slate-300 hover:text-white rounded-lg transition-all border border-white/10"
                title="Hide Top Banner Title"
              >
                <X className="w-4 h-4 text-yellow-300" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🧽 SING-ALONG CARTOON THEME SONG INTRO OVERLAY */}
      <AnimatePresence>
        {isPlayingThemeSong && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-lg flex flex-col justify-between p-6 sm:p-10 border-4 border-yellow-400/80 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Animated Bouncing Musical Background Decor */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <div className="absolute top-10 left-10 text-6xl animate-bounce">🎵</div>
              <div className="absolute top-16 right-16 text-7xl animate-pulse">🎶</div>
              <div className="absolute bottom-16 left-16 text-7xl animate-bounce">🍍</div>
              <div className="absolute bottom-10 right-10 text-8xl animate-pulse">🐠</div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] opacity-10">🧽</div>
            </div>

            {/* Top Bar of Theme Overlay */}
            <div className="relative z-10 flex items-center justify-between border-b border-yellow-400/30 pb-3">
              <div className="flex items-center gap-3">
                <Disc className="w-7 h-7 text-yellow-400 animate-spin" />
                <div>
                  <h2 className="text-yellow-300 font-black text-base sm:text-xl tracking-wider flex items-center gap-2">
                    💻 WELCOME TO THE CODING CLASS! 🌟
                  </h2>
                  <p className="text-slate-300 text-xs font-semibold">The cartoon episode starts right after the theme melody!</p>
                </div>
              </div>
              <button
                onClick={stopThemeSong}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <X className="w-4 h-4" />
                Skip Intro
              </button>
            </div>

            {/* Center Welcome Banner Display */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-full max-w-2xl bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-purple-900/90 p-6 sm:p-8 rounded-3xl border-4 border-yellow-400 shadow-2xl space-y-4"
              >
                <div className="inline-block bg-yellow-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md animate-bounce">
                  🎵 INTRO THEME MUSIC
                </div>

                <div className="space-y-2">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-black text-yellow-300 drop-shadow-md leading-tight">
                    Welcome to the Coding Class! 💻 🌟
                  </p>
                  <p className="text-emerald-300 text-sm sm:text-base font-bold">
                    Sit back & enjoy the cartoon episode right after this melody! 🚀
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom Progress Indicator */}
            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-slate-300 border-t border-white/10 pt-3">
              <span className="flex items-center gap-1.5 text-yellow-300 font-extrabold">
                <Music className="w-4 h-4 text-yellow-400" />
                Tune: Upbeat Cartoon Nautical Brass
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: lyricProgress.total }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i + 1 === lyricProgress.index
                        ? 'w-8 bg-yellow-400'
                        : i + 1 < lyricProgress.index
                        ? 'w-2.5 bg-emerald-400'
                        : 'w-2.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING REACTION PARTICLES LAYER */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.3, y: 30 }}
              animate={{ opacity: 1, scale: [1, 1.6, 1.2], y: -60 }}
              exit={{ opacity: 0, scale: 0.2, y: -100 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
              className="absolute text-5xl sm:text-6xl filter drop-shadow-lg select-none"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* YOUTUBE SHORTS 9:16 FRAMING GUIDE OVERLAY */}
      {isShortsMode && (
        <div className="absolute inset-0 pointer-events-none z-25 flex items-center justify-center">
          <div className="h-full aspect-[9/16] border-4 border-dashed border-rose-500/80 bg-rose-950/10 rounded-2xl flex flex-col justify-between p-3">
            <div className="bg-rose-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded shadow self-center tracking-wider">
              📱 YouTube Shorts 9:16 Framing Area
            </div>
            <div className="text-[10px] text-rose-300 font-bold self-center bg-black/60 px-2 py-0.5 rounded">
              Keep characters inside box for Shorts & Reels
            </div>
          </div>
        </div>
      )}

      {/* EXPANDABLE CREATOR YOUTUBE SOUNDBOARD DOCK */}
      <AnimatePresence>
        {isSoundboardOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative z-30 mb-2 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border-2 border-yellow-400/80 shadow-2xl flex flex-col gap-2 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between border-b border-yellow-500/30 pb-1.5">
              <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5 uppercase tracking-wider">
                📢 YouTube Creator Soundboard & Sound FX
              </span>
              <button
                onClick={() => setIsSoundboardOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {[
                { label: 'Boing', icon: '🔊', effect: 'bounce' },
                { label: 'Tada!', icon: '🎺', effect: 'tada' },
                { label: 'Pop!', icon: '🎈', effect: 'pop' },
                { label: 'Robot', icon: '🤖', effect: 'robot_beep' },
                { label: 'Whistle', icon: '😗', effect: 'whistle' },
                { label: 'Giggle', icon: '🤭', effect: 'giggle' },
                { label: 'Success', icon: '🏆', effect: 'success' },
                { label: 'Magic', icon: '✨', effect: 'magic' },
              ].map((snd) => (
                <button
                  key={snd.label}
                  type="button"
                  onClick={() => playSoundEffect(snd.effect as any)}
                  className="bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-yellow-300 p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow"
                >
                  <span className="text-lg">{snd.icon}</span>
                  <span className="text-[10px] font-extrabold mt-0.5 truncate">{snd.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAGE QUICK LAYOUT & CAST SIZE TOOLBAR */}
      <div className="relative z-30 mb-2 flex flex-wrap items-center justify-between gap-2 px-3 bg-slate-950/80 p-2 rounded-2xl border border-slate-800/80 shadow-md">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Move className="w-3 h-3 text-yellow-400 animate-pulse" />
            <span>Movable & Resizable Stage</span>
          </span>

          <button
            type="button"
            onClick={resetStageLayout}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-300 text-[10px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Reset positions and scale sizes of all characters and stage overlays"
          >
            <span>🔄 Reset Layout</span>
          </button>

          <button
            type="button"
            onClick={unhideAllElements}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Show any hidden characters, speech bubbles, or watermark overlays"
          >
            <span>👁️ Unhide All</span>
          </button>
        </div>

        {/* CAST ENSEMBLE SIZE QUICK SELECTOR */}
        {onSetCastCount && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-extrabold text-slate-400 mr-1 hidden sm:inline">Cast Size:</span>
            <button
              type="button"
              onClick={() => onSetCastCount(1)}
              className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                activeCharacters.length === 1
                  ? 'bg-yellow-400 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="1 Solo Presenter"
            >
              👤 Solo (1)
            </button>
            <button
              type="button"
              onClick={() => onSetCastCount(2)}
              className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                activeCharacters.length === 2
                  ? 'bg-cyan-400 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="2 Duo Show"
            >
              👥 Duo (2)
            </button>
            <button
              type="button"
              onClick={() => onSetCastCount(3)}
              className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                activeCharacters.length === 3
                  ? 'bg-pink-500 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="3 Trio Cast Ensemble"
            >
              👨‍👩‍👧 Trio (3)
            </button>
            <button
              type="button"
              onClick={() => onSetCastCount(4)}
              className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                activeCharacters.length === 4
                  ? 'bg-purple-500 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="4 Squad Cast Group"
            >
              👨‍👩‍👧‍👦 Squad (4)
            </button>
          </div>
        )}
      </div>

      {/* QUICK LIVE REACTION FX BAR DOCK */}
      <div className="relative z-30 mb-1 flex items-center justify-center gap-1.5 flex-wrap px-2">
        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider bg-slate-900/80 px-2 py-1 rounded-lg border border-yellow-500/40 shadow">
          ✨ Live FX:
        </span>
        {[
          { emoji: '💥', name: 'BOOM' },
          { emoji: '⭐', name: 'STAR' },
          { emoji: '🎉', name: 'PARTY' },
          { emoji: '😂', name: 'LAUGH' },
          { emoji: '🔥', name: 'FIRE' },
          { emoji: '🚀', name: 'ROCKET' },
          { emoji: '💯', name: '100' },
          { emoji: '🔔', name: 'SUBSCRIBE' },
        ].map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => triggerReaction(item.emoji)}
            className="bg-slate-900/90 hover:bg-yellow-400 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-yellow-300 px-2.5 py-1 rounded-xl text-xs font-black transition-all active:scale-110 shadow-md flex items-center gap-1 cursor-pointer"
            title={`Trigger ${item.name} particle explosion`}
          >
            <span>{item.emoji}</span>
            <span className="text-[9px] font-black hidden sm:inline">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Center Cartoon Roleplay Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSceneIndex}
          {...getTransitionVariants(currentScene.sceneTransition || 'fade')}
          style={{ transform: getCameraTransform(currentScene.cameraAngle) }}
          className="relative z-20 flex-1 flex items-end justify-around px-2 sm:px-6 md:px-10 pb-4 pt-2 transition-transform w-full h-full"
        >
        {/* BIG CENTRAL PLAY OVERLAY WHEN PAUSED */}
        {!isPlaying && onTogglePlay && (
          <div className="absolute inset-0 z-28 flex items-center justify-center bg-black/20 backdrop-blur-[2px] pointer-events-none">
            <button
              type="button"
              onClick={onTogglePlay}
              className="pointer-events-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-2xl shadow-emerald-950/80 border-2 border-emerald-300 flex items-center gap-3 active:scale-95 transition-all hover:scale-105 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-extrabold">Ready To Watch</div>
                <div className="text-sm sm:text-base font-black">▶ Play Cartoon Episode</div>
              </div>
            </button>
          </div>
        )}

        {/* YOUTUBE CHANNEL & EPISODE BUMPER WATERMARK (Movable & Resizable) */}
        {!hiddenOverlayIds.has('watermark') && (
          <motion.div
            drag
            dragConstraints={stageRef}
            dragElastic={0.05}
            dragMomentum={false}
            whileTap={{ scale: 1.02 }}
            style={{ scale: overlayScales['watermark'] ?? 1.0 }}
            className="absolute top-2 left-4 z-25 cursor-grab active:cursor-grabbing touch-none group/watermark"
          >
            <div className="bg-slate-950/85 border border-yellow-400/60 backdrop-blur-md px-3 py-1 rounded-xl shadow-lg flex items-center gap-2 relative">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] sm:text-xs font-black text-yellow-300 uppercase tracking-widest drop-shadow-sm">
                {project.title || 'CARTOON KIDS TV'} • SCENE #{currentSceneIndex + 1}
              </span>

              {/* Size Controls & Hide Handle */}
              <div className="opacity-0 group-hover/watermark:opacity-100 transition-opacity absolute -bottom-6 left-0 bg-slate-900 text-yellow-300 text-[8px] font-black px-2 py-0.5 rounded-full border border-yellow-400/50 flex items-center gap-1 shadow-md z-30">
                <Move className="w-2 h-2" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayScales((prev) => ({
                      ...prev,
                      watermark: Math.max(0.5, Number(((prev.watermark ?? 1.0) - 0.15).toFixed(2))),
                    }));
                  }}
                  className="w-3 h-3 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayScales((prev) => ({
                      ...prev,
                      watermark: Math.min(2.0, Number(((prev.watermark ?? 1.0) + 0.15).toFixed(2))),
                    }));
                  }}
                  className="w-3 h-3 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHiddenOverlayIds((prev) => new Set(prev).add('watermark'));
                  }}
                  className="ml-1 text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TV NETWORK WATERMARK BUG & CONTENT RATING BADGE (Movable & Resizable) */}
        {!hiddenOverlayIds.has('tvbug') && project.showTvOverlayBug !== false && (
          <motion.div
            drag
            dragConstraints={stageRef}
            dragElastic={0.05}
            dragMomentum={false}
            whileTap={{ scale: 1.02 }}
            style={{ scale: overlayScales['tvbug'] ?? 1.0 }}
            className="absolute top-2 right-14 z-30 cursor-grab active:cursor-grabbing touch-none group/tvbug"
          >
            <div className="bg-slate-950/90 border border-amber-400/80 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-2xl flex items-center gap-2 relative">
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <span>📺</span>
                <span>{project.tvChannelName || 'KIDS NETWORK HD'}</span>
              </span>
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                {project.tvRating || 'TV-Y7'}
              </span>

              <div className="opacity-0 group-hover/tvbug:opacity-100 transition-opacity absolute -bottom-6 right-0 bg-slate-900 text-yellow-300 text-[8px] font-black px-2 py-0.5 rounded-full border border-yellow-400/50 flex items-center gap-1 shadow-md z-30">
                <Move className="w-2 h-2" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayScales((prev) => ({
                      ...prev,
                      tvbug: Math.max(0.5, Number(((prev.tvbug ?? 1.0) - 0.15).toFixed(2))),
                    }));
                  }}
                  className="w-3 h-3 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayScales((prev) => ({
                      ...prev,
                      tvbug: Math.min(2.0, Number(((prev.tvbug ?? 1.0) + 0.15).toFixed(2))),
                    }));
                  }}
                  className="w-3 h-3 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHiddenOverlayIds((prev) => new Set(prev).add('tvbug'));
                  }}
                  className="ml-1 text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TV SAFE MARGINS OVERLAY GUIDE */}
        {project.showTvSafeGrid && (
          <div className="absolute inset-0 z-20 pointer-events-none border border-amber-400/30 flex items-center justify-center">
            <div className="w-[90%] h-[90%] border border-dashed border-amber-400/50 rounded flex items-center justify-center relative">
              <span className="absolute top-1 left-2 text-[9px] font-mono text-amber-300 font-bold opacity-75">
                [ACTION SAFE 90%]
              </span>
              <div className="w-[88%] h-[88%] border border-emerald-400/60 rounded flex items-center justify-center relative">
                <span className="absolute top-1 left-2 text-[9px] font-mono text-emerald-300 font-bold opacity-75">
                  [TITLE SAFE 80%]
                </span>
                <div className="w-4 h-4 border-t border-l border-amber-400/60 opacity-60" />
              </div>
            </div>
          </div>
        )}

        {/* TV LOWER THIRD BROADCAST TICKER (Movable & Resizable) */}
        {!hiddenOverlayIds.has('ticker') && project.showTvLowerThird && (
          <motion.div
            drag
            dragConstraints={stageRef}
            dragElastic={0.05}
            dragMomentum={false}
            whileTap={{ scale: 1.01 }}
            style={{ scale: overlayScales['ticker'] ?? 1.0 }}
            className="absolute bottom-14 inset-x-4 z-25 cursor-grab active:cursor-grabbing touch-none group/ticker"
          >
            <div className="bg-slate-950/95 border-2 border-amber-400/90 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-white relative">
              <div className="flex items-center gap-2.5 truncate">
                <div className="bg-gradient-to-r from-red-600 to-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>TV BROADCAST</span>
                </div>
                <div className="truncate">
                  <div className="text-xs font-black text-amber-300 truncate">{project.title}</div>
                  <div className="text-[10px] text-slate-300 font-bold truncate">
                    {project.tvEpisodeNumber || 'Season 1, Ep. 01'} • Airing Now on {project.tvChannelName || 'Kids Network'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="opacity-0 group-hover/ticker:opacity-100 transition-opacity bg-slate-900 text-yellow-300 text-[8px] font-black px-2 py-0.5 rounded-full border border-yellow-400/50 flex items-center gap-1 shadow-md">
                  <Move className="w-2 h-2" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOverlayScales((prev) => ({
                        ...prev,
                        ticker: Math.max(0.5, Number(((prev.ticker ?? 1.0) - 0.15).toFixed(2))),
                      }));
                    }}
                    className="w-3 h-3 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOverlayScales((prev) => ({
                        ...prev,
                        ticker: Math.min(2.0, Number(((prev.ticker ?? 1.0) + 0.15).toFixed(2))),
                      }));
                    }}
                    className="w-3 h-3 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHiddenOverlayIds((prev) => new Set(prev).add('ticker'));
                    }}
                    className="ml-1 text-slate-400 hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-amber-400 font-bold shrink-0 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  <span>1080p Ultra HD</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* YOUTUBE SUBSCRIBE CALL TO ACTION WATERMARK BANNER (Movable & Resizable) */}
        {!hiddenOverlayIds.has('subscribe') && (
          <motion.div
            drag
            dragConstraints={stageRef}
            dragElastic={0.05}
            dragMomentum={false}
            whileTap={{ scale: 1.03 }}
            style={{ scale: overlayScales['subscribe'] ?? 1.0 }}
            className="absolute bottom-3 right-4 z-25 bg-slate-950/90 backdrop-blur-md text-white border border-red-500/80 px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2 select-none group/sub cursor-grab active:cursor-grabbing touch-none relative"
          >
            <div
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 uppercase tracking-wider shadow-md cursor-pointer"
              onClick={() => triggerReaction('🔔')}
            >
              <span>▶</span>
              <span>SUBSCRIBE</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-yellow-300 pr-1">
              <span>🔔</span>
              <span className="hidden sm:inline">1.2M Kids & Coders</span>
            </div>

            <div className="opacity-0 group-hover/sub:opacity-100 transition-opacity absolute -top-6 right-0 bg-slate-900 text-yellow-300 text-[8px] font-black px-2 py-0.5 rounded-full border border-yellow-400/50 flex items-center gap-1 shadow-md z-30">
              <Move className="w-2 h-2" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOverlayScales((prev) => ({
                    ...prev,
                    subscribe: Math.max(0.5, Number(((prev.subscribe ?? 1.0) - 0.15).toFixed(2))),
                  }));
                }}
                className="w-3 h-3 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black"
              >
                -
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOverlayScales((prev) => ({
                    ...prev,
                    subscribe: Math.min(2.0, Number(((prev.subscribe ?? 1.0) + 0.15).toFixed(2))),
                  }));
                }}
                className="w-3 h-3 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black"
              >
                +
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHiddenOverlayIds((prev) => new Set(prev).add('subscribe'));
                }}
                className="ml-1 text-slate-400 hover:text-red-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}

        {/* MIDDLE: Visual Concept & Key Fact Card (Movable & Resizable) */}
        {!hiddenOverlayIds.has('concept') && currentScene.codeSnippet && !currentScene.isThemeSong && !isScriptHidden && (project.showScriptOverlay !== false) && (
          <motion.div
            drag
            dragConstraints={stageRef}
            dragElastic={0.05}
            dragMomentum={false}
            whileTap={{ scale: 1.02 }}
            style={{ scale: overlayScales['concept'] ?? 1.0 }}
            className={`absolute left-1/2 top-10 -translate-x-1/2 z-30 w-full cursor-grab active:cursor-grabbing touch-none ${
              isExpanded
                ? 'max-w-[360px] sm:max-w-[460px] md:max-w-[540px]'
                : 'max-w-[220px] sm:max-w-[260px] md:max-w-[300px]'
            }`}
          >
            <div
              className={`bg-slate-900/95 text-emerald-400 rounded-xl border-2 border-emerald-500/50 shadow-2xl font-sans hover:border-yellow-400/80 transition-colors ${
                isExpanded ? 'p-5 sm:p-6 text-sm sm:text-base md:text-lg' : 'p-3 text-xs sm:text-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5 text-slate-400 font-sans text-[10px]">
                <span className="flex items-center gap-1 font-extrabold text-emerald-400 uppercase tracking-wide truncate">
                  <GripHorizontal className="w-3.5 h-3.5 text-yellow-400 shrink-0 animate-pulse" />
                  Fun Fact & Key Concept 💡
                </span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5 bg-slate-800 px-1 py-0.5 rounded">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOverlayScales((prev) => ({
                          ...prev,
                          concept: Math.max(0.5, Number(((prev.concept ?? 1.0) - 0.15).toFixed(2))),
                        }));
                      }}
                      className="w-3.5 h-3.5 text-yellow-300 font-black text-[9px]"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOverlayScales((prev) => ({
                          ...prev,
                          concept: Math.min(2.0, Number(((prev.concept ?? 1.0) + 0.15).toFixed(2))),
                        }));
                      }}
                      className="w-3.5 h-3.5 text-yellow-300 font-black text-[9px]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHiddenOverlayIds((prev) => new Set(prev).add('concept'));
                    }}
                    className="text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 p-0.5 rounded transition-all cursor-pointer"
                    title="Hide Concept Box"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-mono font-bold text-white leading-relaxed max-h-44 overflow-y-auto">
                {currentScene.codeSnippet.split('\n').map((line, i) => {
                  const isHighlighted =
                    currentScene.codeHighlight && line.includes(currentScene.codeHighlight);
                  return (
                    <div
                      key={i}
                      className={
                        isHighlighted
                          ? 'bg-yellow-400/30 text-yellow-200 px-1 rounded font-black border-l-2 border-yellow-400'
                          : ''
                      }
                    >
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>
          </motion.div>
        )}

        {/* DYNAMIC CHARACTER CAST STAGE LOOP (Handles 1, 2, 3, 4+ Cast Members cleanly) */}
        {activeCharacters.map((char, idx) => {
          if (hiddenCharIds.has(char.id)) return null;

          const isSpeakerThisChar = currentScene.speakerId
            ? currentScene.speakerId === char.id
            : idx === 0;

          const charScale = charScales[char.id] ?? 1.0;
          const motionOverride = charMotionOverrides[char.id] || null;

          return (
            <motion.div
              key={char.id}
              drag
              dragConstraints={stageRef}
              dragElastic={0.05}
              dragMomentum={false}
              whileTap={{ scale: 1.03 }}
              className="flex flex-col items-center cursor-grab active:cursor-grabbing touch-none relative z-20 group"
            >
              {/* Quick Live Cartoon Action Trigger Toolbar */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-yellow-300 text-[9px] font-black px-2 py-1 rounded-full border border-yellow-400/60 flex items-center gap-1 shadow-xl mb-1 z-30">
                <span className="text-[8px] text-yellow-400 font-extrabold uppercase mr-0.5">Action:</span>
                {[
                  { id: 'point', label: '👉 Point' },
                  { id: 'wave', label: '👋 Wave' },
                  { id: 'thumbsup', label: '👍 Thumbs Up' },
                  { id: 'sit', label: '🪑 Sit' },
                  { id: 'turn', label: '🔄 Turn' },
                  { id: 'walk', label: '🚶 Walk' },
                  { id: 'run', label: '🏃 Run' },
                  { id: 'jump', label: '🦘 Jump' },
                  { id: 'fly', label: '🛸 Fly' },
                  { id: 'dance', label: '💃 Dance' },
                  { id: 'flip', label: '🌀 Flip' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCharMotionOverrides((prev) => ({
                        ...prev,
                        [char.id]: prev[char.id] === act.id ? null : (act.id as ActionEffectType),
                      }));
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold cursor-pointer transition-transform ${
                      motionOverride === act.id
                        ? 'bg-yellow-400 text-slate-950 scale-110 shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={`Make ${char.name} ${act.label}`}
                  >
                    {act.label}
                  </button>
                ))}
                {motionOverride && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCharMotionOverrides((prev) => ({ ...prev, [char.id]: null }));
                    }}
                    className="text-red-400 hover:text-red-300 ml-1 font-black cursor-pointer"
                    title="Reset action"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Hover Drag / Size / Hide Badge */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-yellow-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-yellow-400/50 flex items-center gap-1.5 shadow-md mb-1 z-30">
                <Move className="w-2.5 h-2.5 text-yellow-400 shrink-0" />
                <span className="truncate">Drag {char.name}</span>

                {/* Size +/- Buttons */}
                <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCharScales((prev) => ({
                        ...prev,
                        [char.id]: Math.max(0.4, Number(((prev[char.id] ?? 1.0) - 0.15).toFixed(2))),
                      }));
                    }}
                    className="w-4 h-4 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded flex items-center justify-center font-black cursor-pointer text-[10px]"
                    title="Decrease Size"
                  >
                    -
                  </button>
                  <span className="text-[9px] text-white font-mono">{Math.round(charScale * 100)}%</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCharScales((prev) => ({
                        ...prev,
                        [char.id]: Math.min(2.5, Number(((prev[char.id] ?? 1.0) + 0.15).toFixed(2))),
                      }));
                    }}
                    className="w-4 h-4 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded flex items-center justify-center font-black cursor-pointer text-[10px]"
                    title="Increase Size"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHiddenCharIds((prev) => new Set(prev).add(char.id));
                  }}
                  className="ml-1 text-slate-400 hover:text-red-400 cursor-pointer"
                  title={`Hide ${char.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Speech Bubble for Active Speaker */}
              {isSpeakerThisChar && !hiddenOverlayIds.has('bubbles') && !isScriptHidden && (project.showScriptOverlay !== false) && (
                <motion.div
                  drag
                  dragConstraints={stageRef}
                  dragElastic={0.05}
                  dragMomentum={false}
                  whileTap={{ scale: 1.02 }}
                  style={{ scale: overlayScales['bubbles'] ?? 1.0 }}
                  className={`mb-2 bg-white text-slate-900 rounded-2xl shadow-2xl border-4 border-slate-900 relative cursor-grab active:cursor-grabbing touch-none group/bubble ${
                    isExpanded
                      ? 'max-w-[380px] sm:max-w-[480px] md:max-w-[620px] p-5 sm:p-6'
                      : 'max-w-[200px] sm:max-w-[260px] md:max-w-[320px] p-3'
                  }`}
                >
                  <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-yellow-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-yellow-400/50 flex items-center gap-1.5 shadow-md z-10">
                    <Move className="w-2.5 h-2.5" />
                    <span>Drag Bubble</span>

                    <div className="flex items-center gap-0.5 border-l border-slate-700 pl-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOverlayScales((prev) => ({
                            ...prev,
                            bubbles: Math.max(0.5, Number(((prev.bubbles ?? 1.0) - 0.15).toFixed(2))),
                          }));
                        }}
                        className="w-3.5 h-3.5 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black text-[9px]"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOverlayScales((prev) => ({
                            ...prev,
                            bubbles: Math.min(2.0, Number(((prev.bubbles ?? 1.0) + 0.15).toFixed(2))),
                          }));
                        }}
                        className="w-3.5 h-3.5 bg-slate-800 text-yellow-300 rounded flex items-center justify-center font-black text-[9px]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHiddenOverlayIds((prev) => new Set(prev).add('bubbles'));
                      }}
                      className="ml-1 text-slate-400 hover:text-red-400 cursor-pointer"
                      title="Hide Speech Bubbles"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p
                    className={`font-black leading-snug ${
                      isExpanded ? 'text-lg sm:text-2xl md:text-3xl' : 'text-xs sm:text-base md:text-lg'
                    }`}
                  >
                    "{cleanSpokenDialogue}"
                  </p>
                  {/* Triangle Tail */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-slate-900" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
                </motion.div>
              )}

              <CartoonAvatar
                style={char.style}
                name={char.name}
                color={char.color}
                clothingStyle={char.clothingStyle}
                emotion={isSpeakerThisChar ? currentScene.speakerEmotion : currentScene.listenerEmotion}
                isSpeaking={isSpeaking && isSpeakerThisChar}
                isListener={!isSpeakerThisChar}
                actionEffect={
                  motionOverride ||
                  (isSpeakerThisChar ? currentScene.actionEffect || 'none' : 'none')
                }
                size={Math.round((isExpanded ? 340 : (activeCharacters.length > 2 ? 180 : 220)) * charScale)}
                customAvatarUrl={char.customAvatarUrl}
              />
            </motion.div>
          );
        })}
      </motion.div>
      </AnimatePresence>

      {/* Subtitle Bar at Bottom (Movable, Resizable & Hideable) */}
      {!hiddenOverlayIds.has('subtitles') && project.showSubtitles && !isScriptHidden && (project.showScriptOverlay !== false) && (
        <motion.div
          drag
          dragConstraints={stageRef}
          dragElastic={0.05}
          dragMomentum={false}
          whileTap={{ scale: 1.01 }}
          style={{ scale: overlayScales['subtitles'] ?? 1.0 }}
          className={`relative z-30 bg-slate-950/90 text-yellow-300 rounded-xl text-center border border-white/10 font-black shadow-lg cursor-grab active:cursor-grabbing touch-none group/subtitles ${
            isExpanded
              ? 'py-4 px-8 text-lg sm:text-xl md:text-2xl border-2 border-yellow-400/40'
              : 'py-2.5 px-6 text-sm md:text-base'
          }`}
        >
          <div className="opacity-0 group-hover/subtitles:opacity-100 transition-opacity absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-yellow-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-yellow-400/50 flex items-center gap-1.5 shadow-md z-10">
            <Move className="w-2.5 h-2.5" />
            <span>Drag Subtitles</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHiddenOverlayIds((prev) => new Set(prev).add('subtitles'));
              }}
              className="ml-1 text-slate-400 hover:text-red-400 cursor-pointer"
              title="Hide Subtitles Bar"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {(() => {
            const currentSpeakerChar = activeCharacters.find((c) => c.id === currentScene.speakerId) || activeCharacters[0] || char1;
            return (
              <>
                <span className="text-white opacity-85 mr-2" style={{ color: currentSpeakerChar.color }}>
                  {currentSpeakerChar.name}:
                </span>
                {cleanSpokenDialogue}
              </>
            );
          })()}
        </motion.div>
      )}

      {/* Floating Control Bar in Full Laptop Screen Mode */}
      {(isExpanded || (typeof document !== 'undefined' && !!document.fullscreenElement)) && (
        <div className="relative z-30 mt-3 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/20 text-white shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black tracking-wider text-red-400 uppercase flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-yellow-400" />
              Full Laptop Screen View
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScriptHidden(!isScriptHidden)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                isScriptHidden
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {isScriptHidden ? <EyeOff className="w-4 h-4 text-yellow-300" /> : <Eye className="w-4 h-4 text-yellow-300" />}
              <span>{isScriptHidden ? 'Show Script Overlay' : 'Hide Script Overlay'}</span>
            </button>

            {onPrevScene && (
              <button
                onClick={onPrevScene}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-colors"
                title="Previous Scene"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            {onTogglePlay && (
              <button
                onClick={onTogglePlay}
                className={`px-5 py-2 rounded-xl font-black text-xs flex items-center gap-2 text-white shadow-lg transition-all ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Play Episode
                  </>
                )}
              </button>
            )}

            {onNextScene && (
              <button
                onClick={onNextScene}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-colors"
                title="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-yellow-300 flex items-center gap-1.5 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}
    </div>
  );
};
