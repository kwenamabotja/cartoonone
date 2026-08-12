import React, { useState, useEffect, useRef } from 'react';
import { CartoonProject, RoleplayScene, CameraAngleType, HandGestureType, SceneTransitionType } from '../types';
import { Camera, Film, Play, Pause, SkipBack, SkipForward, Layers, Eye, Sparkles, Volume2, Clock, MoveHorizontal, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartoonAvatar } from './CartoonAvatars';
import { playSoundEffect } from '../utils/audioSynthesizer';

interface VisualTimelineCanvasProps {
  project: CartoonProject;
  currentSceneIndex: number;
  isPlaying: boolean;
  isSpeaking: boolean;
  onSelectScene: (index: number) => void;
  onUpdateScene: (index: number, updated: Partial<RoleplayScene>) => void;
  onTogglePlay: () => void;
  onNextScene: () => void;
  onPrevScene: () => void;
}

export const VisualTimelineCanvas: React.FC<VisualTimelineCanvasProps> = ({
  project,
  currentSceneIndex,
  isPlaying,
  isSpeaking,
  onSelectScene,
  onUpdateScene,
  onTogglePlay,
  onNextScene,
  onPrevScene,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'timeline' | 'camera' | 'transitions' | 'gestures' | 'parallax'>('timeline');
  const stageContainerRef = useRef<HTMLDivElement>(null);

  const currentScene = project.scenes[currentSceneIndex] || project.scenes[0];

  // Mouse move handler for Parallax Depth tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageContainerRef.current) return;
    const rect = stageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  // Camera transform calculations based on Camera Angle
  const getCameraTransform = (angle?: CameraAngleType) => {
    switch (angle) {
      case 'CLOSE_UP_EMOTE':
        return 'scale(1.45) translateY(5%)';
      case 'OVER_THE_SHOULDER':
        return 'scale(1.3) translateX(-8%) translateY(2%)';
      case 'QUICK_WHIP_PAN':
        return 'scale(1.25) rotate(-2deg)';
      case 'SLOW_PUSH_IN':
        return isPlaying ? 'scale(1.2) translateY(0%)' : 'scale(1.1)';
      case 'MEDIUM_TWO_SHOT':
        return 'scale(1.15) translateY(2%)';
      case 'REACTION_SHOT':
        return 'scale(1.4) translateX(10%) translateY(4%)';
      case 'WIDE_ESTABLISHING':
      default:
        return 'scale(1) translateX(0) translateY(0)';
    }
  };

  const cameraAngleLabels: Record<CameraAngleType, { label: string; icon: string; desc: string }> = {
    WIDE_ESTABLISHING: { label: 'Wide Establishing', icon: '🌆', desc: 'Full stage establishing shot' },
    OVER_THE_SHOULDER: { label: 'Over The Shoulder', icon: '👤', desc: 'Cinematic OTS perspective' },
    CLOSE_UP_EMOTE: { label: 'Close-Up Emote', icon: '🔍', desc: 'Intense facial emotion frame' },
    QUICK_WHIP_PAN: { label: 'Quick Whip Pan', icon: '⚡', desc: 'Fast dynamic motion cut' },
    SLOW_PUSH_IN: { label: 'Slow Push In', icon: '🎯', desc: 'Gradual zoom for emphasis' },
    MEDIUM_TWO_SHOT: { label: 'Medium Two-Shot', icon: '👥', desc: 'Balanced character duo frame' },
    REACTION_SHOT: { label: 'Reaction Shot', icon: '😮', desc: 'Surprise listener reaction close-up' },
  };

  const handGesturesList: { type: HandGestureType; label: string; icon: string }[] = [
    { type: 'pointing_finger', label: 'Point Finger', icon: '👉' },
    { type: 'open_palms', label: 'Open Palms', icon: '👐' },
    { type: 'thumbs_up', label: 'Thumbs Up', icon: '👍' },
    { type: 'hand_on_hip', label: 'Hand on Hip', icon: '🕺' },
    { type: 'scratching_head', label: 'Scratch Head', icon: '🤔' },
    { type: 'facepalm', label: 'Facepalm', icon: '🤦' },
    { type: 'clapping', label: 'Clapping', icon: '👏' },
    { type: 'waving', label: 'Waving', icon: '👋' },
    { type: 'crossing_arms', label: 'Cross Arms', icon: '🙅' },
    { type: 'holding_prop', label: 'Hold Prop', icon: '📦' },
    { type: 'shrugging', label: 'Shrug', icon: '🤷' },
    { type: 'none', label: 'None (Rest)', icon: '🧍' },
  ];

  const sceneTransitionsList: { type: SceneTransitionType; label: string; icon: string; desc: string }[] = [
    { type: 'none', label: 'Cut (None)', icon: '✂️', desc: 'Instant scene cut' },
    { type: 'fade', label: 'Fade Dissolve', icon: '✨', desc: 'Smooth opacity dissolve' },
    { type: 'slide', label: 'Slide Pan', icon: '↔️', desc: 'Horizontal slide transition' },
    { type: 'zoom', label: 'Zoom Punch', icon: '🔍', desc: 'Scale zoom in/out effect' },
    { type: 'wipe', label: 'Wipe Clean', icon: '🧹', desc: 'Horizontal curtain wipe' },
    { type: 'bounce', label: 'Pop Bounce', icon: '💥', desc: 'Spring bounce enter effect' },
  ];

  return (
    <div className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4 text-white">
      {/* Stage Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-yellow-400 animate-spin-slow" />
          <div>
            <h3 className="font-black text-sm text-yellow-300 flex items-center gap-2">
              <span>🎬 Multi-Plane Parallax Stage & Timeline</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                3-Tier Depth
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Real-time camera angles, physical gags, hand gestures & interactive scrubbing
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
          {[
            { id: 'timeline', label: 'Visual Timeline', icon: Clock },
            { id: 'camera', label: 'Camera Directing', icon: Camera },
            { id: 'transitions', label: 'Transitions', icon: Film },
            { id: 'gestures', label: 'Gags & Gestures', icon: Sparkles },
            { id: 'parallax', label: '3D Parallax', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 shadow-md scale-102'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-TIER MULTI-PLANE PARALLAX STAGE CANVAS */}
      <div
        ref={stageContainerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-video rounded-xl border-4 border-slate-800 overflow-hidden bg-slate-950 shadow-2xl flex items-center justify-center transition-all duration-300"
      >
        {/* CAMERA TRANSFORMATION WRAPPER */}
        <motion.div
          animate={{
            transform: getCameraTransform(currentScene?.cameraAngle),
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="relative w-full h-full flex flex-col justify-between p-6 overflow-hidden"
        >
          {/* TIER 1: BACKGROUND PARALLAX LAYER (Factor 0.3x) */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out z-0"
            style={{
              transform: `translate3d(${mousePos.x * -18}px, ${mousePos.y * -18}px, 0px)`,
            }}
          >
            {/* Ambient Background Grid & Stage Lights */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-950 opacity-90" />
            <div className="absolute top-0 left-1/4 w-48 h-64 bg-cyan-500/10 blur-3xl transform -rotate-12" />
            <div className="absolute top-0 right-1/4 w-48 h-64 bg-purple-500/10 blur-3xl transform rotate-12" />

            {/* Parallax Stage Wall Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-20" />
          </div>

          {/* TIER 2: MIDGROUND CHARACTER & DIALOGUE LAYER (Factor 1.0x) */}
          <div
            className="relative z-10 w-full h-full flex items-end justify-around pb-4 transition-transform duration-100 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * -6}px, ${mousePos.y * -6}px, 0px)`,
            }}
          >
            {project.characters.slice(0, 2).map((char, idx) => {
              const isSpeaker = currentScene.speakerId ? currentScene.speakerId === char.id : idx === 0;
              return (
                <div key={char.id} className="flex flex-col items-center relative">
                  {/* Speech Bubble */}
                  {isSpeaker && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mb-3 bg-white text-slate-900 font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-slate-900 text-xs sm:text-sm max-w-xs text-center relative"
                    >
                      "{currentScene.dialogue}"
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900" />
                    </motion.div>
                  )}

                  {/* Character Avatar */}
                  <CartoonAvatar
                    style={char.style}
                    name={char.name}
                    color={char.color}
                    clothingStyle={char.clothingStyle}
                    emotion={isSpeaker ? currentScene.speakerEmotion : currentScene.listenerEmotion}
                    isSpeaking={isSpeaking && isSpeaker}
                    isListener={!isSpeaker}
                    actionEffect={isSpeaker ? currentScene.actionEffect || 'none' : 'none'}
                    size={210}
                    customAvatarUrl={char.customAvatarUrl}
                  />

                  {/* Gesture & Micro Action Badge */}
                  {isSpeaker && (currentScene.handGesture || currentScene.microAction) && (
                    <div className="mt-1 bg-yellow-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow border border-yellow-200 flex items-center gap-1">
                      <span>✨</span>
                      <span>{currentScene.handGesture || currentScene.microAction}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TIER 3: FOREGROUND OVERLAY PARALLAX LAYER (Factor 1.5x) */}
          <div
            className="absolute inset-0 pointer-events-none z-20 transition-transform duration-100 ease-out flex flex-col justify-between p-4"
            style={{
              transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0px)`,
            }}
          >
            {/* Camera Framing Indicator Badge */}
            <div className="self-start bg-slate-950/85 backdrop-blur-md border border-yellow-400/80 px-3 py-1 rounded-xl text-yellow-300 text-xs font-black flex items-center gap-2 shadow-xl">
              <Camera className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              <span>
                ANGLE: {cameraAngleLabels[currentScene.cameraAngle || 'WIDE_ESTABLISHING']?.label}
              </span>
            </div>

            {/* Physical Gag / Micro Action Banner */}
            {currentScene.microAction && (
              <div className="self-center bg-amber-500/90 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-2xl border-2 border-amber-200 animate-bounce">
                🎭 Micro Gag: "{currentScene.microAction}"
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* CONTROLS & TIMELINE TABS CONTENT */}
      {activeTab === 'timeline' && (
        <div className="space-y-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1.5 text-yellow-300 font-black">
              <Clock className="w-4 h-4 text-yellow-400" />
              Interactive Episode Timeline ({project.scenes.length} Scenes)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onPrevScene}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onTogglePlay}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded text-xs flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={onNextScene}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Timeline Track Scrubber */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 overflow-x-auto pb-2">
            {project.scenes.map((scene, index) => {
              const isCurrent = index === currentSceneIndex;
              const speakerChar = project.characters.find((c) => c.id === scene.speakerId);
              return (
                <button
                  key={scene.id || index}
                  onClick={() => onSelectScene(index)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-b from-yellow-500/20 to-amber-500/30 border-yellow-400 text-white ring-2 ring-yellow-400/50 scale-102'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 mb-1">
                    <span>SCENE #{index + 1}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-indigo-400 font-mono text-[9px] bg-indigo-950/80 px-1 py-0.5 rounded border border-indigo-500/30">
                        {scene.sceneTransition || 'fade'}
                      </span>
                      <span className="text-yellow-400 font-mono">
                        {scene.cameraAngle ? scene.cameraAngle.split('_')[0] : 'WIDE'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-white truncate my-1">
                    "{scene.dialogue}"
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="truncate text-emerald-300 font-extrabold">
                      {speakerChar?.name || 'Speaker'}
                    </span>
                    {scene.timingHoldMs && (
                      <span className="text-amber-400 font-mono">{scene.timingHoldMs}ms</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CAMERA DIRECTING TAB */}
      {activeTab === 'camera' && (
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-yellow-400" />
            <span>Select Camera Angle for Scene #{currentSceneIndex + 1}:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {(Object.keys(cameraAngleLabels) as CameraAngleType[]).map((angle) => {
              const info = cameraAngleLabels[angle];
              const isSelected = (currentScene.cameraAngle || 'WIDE_ESTABLISHING') === angle;
              return (
                <button
                  key={angle}
                  onClick={() => {
                    onUpdateScene(currentSceneIndex, { cameraAngle: angle });
                    playSoundEffect('pop');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400 text-slate-950 font-black border-yellow-200 shadow-lg scale-105'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <span className="text-[11px] font-bold leading-tight">{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SCENE TRANSITIONS TAB */}
      {activeTab === 'transitions' && (
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Select Scene Transition Animation for Scene #{currentSceneIndex + 1}:</span>
            </div>
            <button
              onClick={() => {
                const currentTransition = currentScene.sceneTransition || 'fade';
                project.scenes.forEach((_, idx) => {
                  onUpdateScene(idx, { sceneTransition: currentTransition });
                });
                playSoundEffect('pop');
              }}
              className="text-[10px] font-extrabold text-yellow-300 hover:text-yellow-200 bg-indigo-950/80 border border-indigo-500/40 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              ✨ Apply Transition to ALL Scenes
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {sceneTransitionsList.map((trans) => {
              const isSelected = (currentScene.sceneTransition || 'fade') === trans.type;
              return (
                <button
                  key={trans.type}
                  onClick={() => {
                    onUpdateScene(currentSceneIndex, { sceneTransition: trans.type });
                    playSoundEffect('pop');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500 text-white font-black border-indigo-200 shadow-lg scale-105'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl">{trans.icon}</span>
                  <span className="text-[11px] font-bold leading-tight">{trans.label}</span>
                  <span className="text-[9px] opacity-75 font-normal">{trans.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAGS & GESTURES TAB */}
      {activeTab === 'gestures' && (
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Select Hand Gesture & Physical Comedy Gag for Active Speaker:</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {handGesturesList.map((g) => {
              const isSelected = currentScene.handGesture === g.type;
              return (
                <button
                  key={g.type}
                  onClick={() => {
                    onUpdateScene(currentSceneIndex, { handGesture: g.type });
                    playSoundEffect('bounce');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400 text-slate-950 font-black border-yellow-200 shadow scale-105'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{g.icon}</span>
                  <span className="text-[10px] font-bold">{g.label}</span>
                </button>
              );
            })}
          </div>

          {/* Physical Gag Input */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
            <span className="text-xs text-slate-300 font-bold shrink-0">Custom Physical Gag:</span>
            <input
              type="text"
              value={currentScene.microAction || ''}
              onChange={(e) => onUpdateScene(currentSceneIndex, { microAction: e.target.value })}
              placeholder="e.g. dramatic double-take gasp, spills tea cup, adjusts glasses"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>
      )}

      {/* 3D PARALLAX DEPTH TAB */}
      {activeTab === 'parallax' && (
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="font-black text-yellow-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-yellow-400" />
            <span>3-Tier Multi-Plane Parallax Depth Configuration</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Move your cursor over the stage canvas above to see multi-plane depth layering. The background moves at 0.3x speed, the midground character stage moves at 1.0x, and foreground studio overlays move at 1.5x speed for broadcast TV camera feel.
          </p>
        </div>
      )}
    </div>
  );
};
