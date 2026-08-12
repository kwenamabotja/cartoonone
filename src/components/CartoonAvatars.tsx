import React from 'react';
import { CharacterStyle, ExpressionType, ActionEffectType, ClothingStyle } from '../types';

interface CartoonAvatarProps {
  style: CharacterStyle;
  name: string;
  color?: string;
  clothingStyle?: ClothingStyle;
  emotion?: ExpressionType;
  isSpeaking?: boolean;
  isListener?: boolean;
  actionEffect?: ActionEffectType;
  size?: number;
  customAvatarUrl?: string;
}

// Helper for Clothing Style Overlays
const renderClothingOverlay = (clothingStyle: ClothingStyle | undefined, baseColor: string) => {
  if (!clothingStyle || clothingStyle === 'default') return null;

  if (clothingStyle === 'formal') {
    return (
      <g id="clothing-formal">
        <path d="M36 185 L 58 135 Q 100 125 142 135 L 164 185 Z" fill="#0f172a" />
        <polygon points="100,165 82,135 118,135" fill="#ffffff" />
        <polygon points="100,135 104,142 100,172 96,142" fill="#ef4444" />
      </g>
    );
  }

  if (clothingStyle === 'tech') {
    return (
      <g id="clothing-tech">
        <path d="M35 185 L 56 132 Q 100 122 144 132 L 165 185 Z" fill="#1e293b" />
        <path d="M82 135 Q 100 152 118 135" stroke="#38bdf8" strokeWidth="3" fill="none" />
        <text x="100" y="162" fill="#38bdf8" fontSize="10" fontWeight="900" textAnchor="middle">&lt;/&gt;</text>
      </g>
    );
  }

  if (clothingStyle === 'labcoat') {
    return (
      <g id="clothing-labcoat">
        <path d="M32 185 L 56 130 Q 100 120 144 130 L 168 185 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <polygon points="100,165 84,130 116,130" fill="#0284c7" />
        <line x1="100" y1="130" x2="100" y2="185" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="114" y="152" width="16" height="18" rx="3" fill="#e2e8f0" />
        <line x1="118" y1="146" x2="118" y2="154" stroke="#3b82f6" strokeWidth="2.5" />
        <line x1="124" y1="144" x2="124" y2="154" stroke="#eab308" strokeWidth="2.5" />
      </g>
    );
  }

  if (clothingStyle === 'hero') {
    return (
      <g id="clothing-hero">
        <path d="M25 135 Q 15 185 30 195 Q 100 205 170 195 Q 185 185 175 135 Z" fill="#dc2626" />
        <path d="M38 185 L 60 135 Q 100 125 140 135 L 162 185 Z" fill="#1e1b4b" />
        <polygon points="100,145 110,152 106,164 94,164 90,152" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
      </g>
    );
  }

  if (clothingStyle === 'casual') {
    return (
      <g id="clothing-casual">
        <path d="M35 185 L 58 135 Q 100 125 142 135 L 165 185 Z" fill={baseColor} />
        <path d="M80 135 L 100 152 L 120 135" stroke="#ffffff" strokeWidth="3" fill="none" />
      </g>
    );
  }

  return null;
};

// Helper for Hand Gestures
const renderHandGesture = (
  isPointing: boolean,
  isWaving: boolean,
  isThumbsUp: boolean,
  baseColor: string,
  skinColor = '#fbcfe8'
) => {
  if (isPointing) {
    return (
      <g id="gesture-point" className="animate-point-pulse-action">
        <path d="M140 142 L 175 125" stroke={baseColor} strokeWidth="12" strokeLinecap="round" />
        <circle cx="178" cy="123" r="7" fill={skinColor} />
        <path d="M178 123 L 192 118" stroke={skinColor} strokeWidth="4" strokeLinecap="round" />
      </g>
    );
  }

  if (isWaving) {
    return (
      <g id="gesture-wave" className="animate-arm-wave-action">
        <path d="M140 142 Q 162 105 172 80" stroke={baseColor} strokeWidth="12" strokeLinecap="round" fill="none" />
        <circle cx="174" cy="76" r="8" fill={skinColor} />
        <path d="M168 70 L 180 70" stroke={skinColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M168 66 L 180 66" stroke={skinColor} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  }

  if (isThumbsUp) {
    return (
      <g id="gesture-thumbsup">
        <path d="M140 142 L 168 128" stroke={baseColor} strokeWidth="12" strokeLinecap="round" />
        <circle cx="170" cy="126" r="8" fill={skinColor} />
        <path d="M170 126 L 170 110" stroke={skinColor} strokeWidth="5" strokeLinecap="round" />
      </g>
    );
  }

  return null;
};

export const CartoonAvatar: React.FC<CartoonAvatarProps> = ({
  style,
  name,
  color = '#3b82f6',
  clothingStyle,
  emotion = 'happy',
  isSpeaking = false,
  isListener = false,
  actionEffect = 'none',
  size = 180,
  customAvatarUrl,
}) => {
  // Emotion calculations
  const isSurprised = emotion === 'surprised';
  const isConfused = emotion === 'confused';
  const isThinking = emotion === 'thinking';
  const isExplaining = emotion === 'explaining';
  const isCelebrating = emotion === 'celebrating';
  const isLaughing = emotion === 'laughing';
  const isAngry = emotion === 'angry';
  const isWink = emotion === 'wink';
  const isSad = emotion === 'sad';

  // Determine active action mode (either from prop or speaker active mode)
  const isWalking = actionEffect === 'walk';
  const isRunning = actionEffect === 'run';
  const isJumping = actionEffect === 'jump';
  const isFlying = actionEffect === 'fly';
  const isDancing = actionEffect === 'dance';
  const isFlipping = actionEffect === 'flip';
  const isBouncing = actionEffect === 'bounce' || (isSpeaking && actionEffect === 'none');
  const isShaking = actionEffect === 'shake' || isSurprised;
  const isFloating = actionEffect === 'float' || isThinking;
  const isZooming = actionEffect === 'zoom';
  const isSpinning = actionEffect === 'spin';
  const isPointing = actionEffect === 'point';
  const isWaving = actionEffect === 'wave';
  const isThumbsUp = actionEffect === 'thumbsup';
  const isSitting = actionEffect === 'sit';
  const isTurning = actionEffect === 'turn';

  // CSS Animation Style mapping
  let animStyleClass = '';
  if (isWalking) animStyleClass = 'animate-cartoon-walk';
  else if (isRunning) animStyleClass = 'animate-cartoon-run';
  else if (isJumping) animStyleClass = 'animate-cartoon-jump';
  else if (isFlying) animStyleClass = 'animate-cartoon-fly';
  else if (isDancing) animStyleClass = 'animate-cartoon-dance';
  else if (isFlipping) animStyleClass = 'animate-cartoon-flip';
  else if (isBouncing) animStyleClass = 'animate-bounce';
  else if (isShaking) animStyleClass = 'animate-ping duration-300';
  else if (isFloating) animStyleClass = 'animate-pulse';
  else if (isZooming) animStyleClass = 'scale-110 transition-transform';
  else if (isSpinning) animStyleClass = 'rotate-6 transition-transform';

  if (isSitting) animStyleClass += ' translate-y-3 scale-y-[0.88]';
  if (isTurning) animStyleClass += ' -scale-x-100';

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none transition-all ${animStyleClass}`}
      style={{ width: size, height: size + 45 }}
    >
      {/* Floating Reaction / Expression Badge */}
      {(isAngry || isWink || isSad || isThinking || isSurprised || isCelebrating || isPointing || isWaving || isThumbsUp) && (
        <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-yellow-400/80 text-yellow-300 text-xs font-black shadow-lg animate-bounce pointer-events-none z-20 flex items-center gap-1">
          {isAngry && <span>💢 ⚡</span>}
          {isWink && <span>✨ 😉</span>}
          {isSad && <span>💧 😢</span>}
          {isThinking && <span>💡 💭</span>}
          {isSurprised && <span>❗ 😲</span>}
          {isCelebrating && <span>🎉 ⭐</span>}
          {isPointing && <span>👉 Point</span>}
          {isWaving && <span>👋 Hello!</span>}
          {isThumbsUp && <span>👍 Great!</span>}
        </div>
      )}

      {/* Inject Keyframe Styles for Smooth Cartoon Physics */}
      <style>{`
        @keyframes cartoonWalk {
          0% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(-5deg); }
        }
        @keyframes cartoonRun {
          0% { transform: translateY(0px) skewX(-12deg) scaleY(0.94); }
          50% { transform: translateY(-22px) skewX(-4deg) scaleY(1.06); }
          100% { transform: translateY(0px) skewX(-12deg) scaleY(0.94); }
        }
        @keyframes cartoonJump {
          0% { transform: translateY(0px) scale(1, 1); }
          25% { transform: translateY(12px) scale(1.15, 0.82); }
          60% { transform: translateY(-65px) scale(0.88, 1.18); }
          85% { transform: translateY(-10px) scale(1.05, 0.95); }
          100% { transform: translateY(0px) scale(1, 1); }
        }
        @keyframes cartoonFly {
          0% { transform: translateY(-18px) rotate(-4deg); }
          50% { transform: translateY(-42px) rotate(4deg); }
          100% { transform: translateY(-18px) rotate(-4deg); }
        }
        @keyframes cartoonDance {
          0% { transform: translateY(0px) rotate(-10deg) scale(1); }
          25% { transform: translateY(-14px) rotate(0deg) scale(1.08); }
          50% { transform: translateY(0px) rotate(10deg) scale(1); }
          75% { transform: translateY(-14px) rotate(0deg) scale(1.08); }
          100% { transform: translateY(0px) rotate(-10deg) scale(1); }
        }
        @keyframes cartoonFlip {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) translateY(-45px) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes tailWag {
          0% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
          100% { transform: rotate(-20deg); }
        }
        @keyframes wingFlap {
          0% { transform: scaleY(1) rotate(0deg); }
          50% { transform: scaleY(0.55) rotate(-18deg); }
          100% { transform: scaleY(1) rotate(0deg); }
        }
        @keyframes armWaveAction {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pointPulseAction {
          0% { transform: translateX(0px); }
          50% { transform: translateX(8px); }
          100% { transform: translateX(0px); }
        }
        @keyframes lipSyncMouth {
          0% { transform: scaleY(0.25) scaleX(0.85); }
          20% { transform: scaleY(1.4) scaleX(1.15); }
          40% { transform: scaleY(0.35) scaleX(0.88); }
          60% { transform: scaleY(1.5) scaleX(1.2); }
          80% { transform: scaleY(0.55) scaleX(0.92); }
          100% { transform: scaleY(0.25) scaleX(0.85); }
        }
        @keyframes lipFlapTongue {
          0% { transform: translateY(0px) scale(0.85); }
          50% { transform: translateY(-3px) scale(1.2); }
          100% { transform: translateY(0px) scale(0.85); }
        }
        @keyframes lipSyncRealMouth {
          0% { transform: scaleY(0.2) scaleX(0.8); }
          25% { transform: scaleY(1.35) scaleX(1.12); }
          50% { transform: scaleY(0.3) scaleX(0.85); }
          75% { transform: scaleY(1.45) scaleX(1.15); }
          100% { transform: scaleY(0.2) scaleX(0.8); }
        }
        .animate-cartoon-walk { animation: cartoonWalk 0.55s infinite ease-in-out; }
        .animate-cartoon-run { animation: cartoonRun 0.32s infinite linear; }
        .animate-cartoon-jump { animation: cartoonJump 1.1s infinite cubic-bezier(0.28, 0.84, 0.42, 1); }
        .animate-cartoon-fly { animation: cartoonFly 1.8s infinite ease-in-out; }
        .animate-cartoon-dance { animation: cartoonDance 0.7s infinite ease-in-out; }
        .animate-cartoon-flip { animation: cartoonFlip 0.9s infinite ease-in-out; }
        .animate-tail-wag { transform-origin: bottom center; animation: tailWag 0.4s infinite ease-in-out; }
        .animate-wing-flap { transform-origin: top center; animation: wingFlap 0.35s infinite ease-in-out; }
        .animate-arm-wave-action { transform-origin: 145px 130px; animation: armWaveAction 0.45s infinite ease-in-out; }
        .animate-point-pulse-action { animation: pointPulseAction 0.6s infinite ease-in-out; }
        .animate-talking-mouth { transform-box: fill-box; transform-origin: center; animation: lipSyncMouth 0.16s infinite ease-in-out; }
        .animate-talking-lip { transform-box: fill-box; transform-origin: center; animation: lipFlapTongue 0.12s infinite ease-in-out; }
        .animate-talking-real-mouth { transform-box: fill-box; transform-origin: center; animation: lipSyncRealMouth 0.18s infinite ease-in-out; }
      `}</style>

      {/* Ground Shadow Ring for Jump / Fly / Bounce */}
      {(isJumping || isFlying || isBouncing || isRunning) && (
        <div className="absolute bottom-9 w-28 h-4 rounded-full bg-black/25 blur-sm transform scale-x-110 animate-pulse pointer-events-none" />
      )}

      {/* Action Trail FX (Wind Lines for Run, Sparkles for Dance/Fly, Magic Stars) */}
      {isRunning && (
        <div className="absolute bottom-12 -left-6 flex gap-1 pointer-events-none opacity-80 animate-pulse">
          <span className="text-xl">💨</span>
          <span className="text-sm">💨</span>
        </div>
      )}
      {isFlying && (
        <div className="absolute -bottom-2 text-xl animate-bounce pointer-events-none">
          ✨🔥✨
        </div>
      )}
      {isDancing && (
        <div className="absolute -top-6 flex gap-3 text-lg pointer-events-none animate-bounce">
          <span>🎵</span>
          <span>✨</span>
          <span>🎶</span>
        </div>
      )}

      {/* Speaking Glow Halo */}
      {isSpeaking && (
        <div className="absolute top-2 w-36 h-36 rounded-full border-4 border-yellow-400/80 opacity-75 animate-ping pointer-events-none" />
      )}

      {/* SVG Character Model */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-xl"
      >
        <defs>
          <linearGradient id="saucerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="tractorBeam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* CHARACTER 1: DOG (Byte) */}
        {style === 'dog' && (
          <g id="dog-avatar">
            {/* Wagging Tail */}
            <path
              d="M145 135 C 170 120, 185 100, 175 85 C 165 95, 155 115, 140 128 Z"
              fill="#1e293b"
              className="animate-tail-wag"
            />

            {/* Feet / Paws at Bottom */}
            <g fill="#1e293b">
              <ellipse cx="75" cy="180" rx="14" ry="10" />
              <ellipse cx="125" cy="180" rx="14" ry="10" />
              <circle cx="70" cy="182" r="3" fill="#f8fafc" />
              <circle cx="75" cy="183" r="3" fill="#f8fafc" />
              <circle cx="80" cy="182" r="3" fill="#f8fafc" />
              <circle cx="120" cy="182" r="3" fill="#f8fafc" />
              <circle cx="125" cy="183" r="3" fill="#f8fafc" />
              <circle cx="130" cy="182" r="3" fill="#f8fafc" />
            </g>

            {/* Legs */}
            <rect x="68" y="150" width="14" height="32" rx="7" fill={color} />
            <rect x="118" y="150" width="14" height="32" rx="7" fill={color} />

            {/* Body */}
            <ellipse cx="100" cy="140" rx="52" ry="42" fill={color} />
            <ellipse cx="100" cy="145" rx="32" ry="28" fill="#fff" opacity="0.9" />

            {/* Arms / Front Paws & Gestures */}
            {renderHandGesture(isPointing, isWaving, isThumbsUp, color, '#fbcfe8')}
            {!isPointing && !isWaving && !isThumbsUp && (
              <g>
                <path d="M52 135 Q 40 155 58 160 Q 65 150 62 135 Z" fill={color} />
                <path d="M148 135 Q 160 155 142 160 Q 135 150 138 135 Z" fill={color} />
              </g>
            )}

            {/* Collar */}
            <rect x="70" y="112" width="60" height="10" rx="5" fill="#ef4444" />
            <circle cx="100" cy="117" r="5" fill="#f59e0b" />

            {/* Floppy Ears */}
            <path
              d="M45 45 C 20 55, 15 98, 42 108 C 55 88, 50 55, 45 45 Z"
              fill="#1e293b"
            />
            <path
              d="M155 45 C 180 55, 185 98, 158 108 C 145 88, 150 55, 155 45 Z"
              fill="#1e293b"
            />

            {/* Head */}
            <circle cx="100" cy="72" r="46" fill={color} />
            <ellipse cx="100" cy="82" rx="26" ry="18" fill="#f8fafc" />

            {/* Nose */}
            <ellipse cx="100" cy="76" rx="8" ry="6" fill="#0f172a" />

            {/* Eyes */}
            {isAngry ? (
              <g id="dog-angry-eyes">
                <line x1="72" y1="50" x2="88" y2="58" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="112" y1="58" x2="128" y2="50" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                <ellipse cx="82" cy="62" rx="7" ry="5" fill="#0f172a" />
                <ellipse cx="118" cy="62" rx="7" ry="5" fill="#0f172a" />
              </g>
            ) : isWink ? (
              <g id="dog-wink-eyes">
                <circle cx="82" cy="62" r="7" fill="#0f172a" />
                <circle cx="84" cy="60" r="2.5" fill="#fff" />
                <path d="M110 62 Q 118 68 126 62" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
            ) : isSad ? (
              <g id="dog-sad-eyes">
                <line x1="72" y1="54" x2="88" y2="50" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                <line x1="112" y1="50" x2="128" y2="54" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                <circle cx="82" cy="62" r="7" fill="#0f172a" />
                <circle cx="118" cy="62" r="7" fill="#0f172a" />
                <path d="M122 66 Q 126 72 122 74 Q 118 72 122 66 Z" fill="#38bdf8" className="animate-pulse" />
              </g>
            ) : isLaughing || isCelebrating ? (
              <g stroke="#0f172a" strokeWidth="4" strokeLinecap="round">
                <path d="M75 62 Q 85 52 90 62" />
                <path d="M110 62 Q 115 52 125 62" />
              </g>
            ) : isThinking ? (
              <g fill="#0f172a">
                <circle cx="85" cy="60" r="6" />
                <circle cx="115" cy="56" r="6" />
                <path d="M75 50 Q 85 46 92 52" stroke="#0f172a" strokeWidth="3" fill="none" />
              </g>
            ) : isConfused ? (
              <g fill="#0f172a">
                <circle cx="82" cy="60" r="5" />
                <circle cx="118" cy="63" r="8" />
                <path d="M108 48 Q 118 43 125 50" stroke="#0f172a" strokeWidth="3" fill="none" />
              </g>
            ) : (
              <g fill="#0f172a">
                <circle cx="82" cy="62" r="7" />
                <circle cx="118" cy="62" r="7" />
                <circle cx="84" cy="60" r="2.5" fill="#fff" />
                <circle cx="120" cy="60" r="2.5" fill="#fff" />
              </g>
            )}

            {/* Mouth & Cute Dog Tongue */}
            {isSpeaking || isLaughing || isCelebrating ? (
              <g className={isSpeaking ? "animate-talking-mouth" : ""}>
                <path d="M86 82 Q 100 106 114 82 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="3" />
                <path d="M88 82 Q 100 86 112 82" fill="#ffffff" />
                <path d="M94 90 Q 100 106 106 90 Z" fill="#f472b6" className={isSpeaking ? "animate-talking-lip" : ""} />
                <path d="M84 82 Q 100 78 116 82" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
            ) : isAngry ? (
              <path d="M88 88 Q 100 80 112 88" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
            ) : isSad ? (
              <path d="M88 90 Q 100 80 112 90" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
            ) : isSurprised ? (
              <circle cx="100" cy="86" r="8" fill="#0f172a" />
            ) : isConfused ? (
              <path d="M88 88 Q 100 82 112 88" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M88 85 Q 100 95 112 85" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* CHARACTER 2: ROBOT (Chip) */}
        {style === 'robot' && (
          <g id="robot-avatar">
            {/* Antenna with Pulsing Beacon */}
            <line x1="100" y1="32" x2="100" y2="12" stroke="#64748b" strokeWidth="5" />
            <circle cx="100" cy="10" r="8" fill={isSpeaking || isCelebrating ? '#ef4444' : '#10b981'} className="animate-pulse" />

            {/* Feet / Tread Wheels */}
            <g fill="#0f172a">
              <rect x="62" y="174" width="28" height="14" rx="6" />
              <rect x="110" y="174" width="28" height="14" rx="6" />
              <circle cx="70" cy="181" r="3" fill="#64748b" />
              <circle cx="82" cy="181" r="3" fill="#64748b" />
              <circle cx="118" cy="181" r="3" fill="#64748b" />
              <circle cx="130" cy="181" r="3" fill="#64748b" />
            </g>

            {/* Legs */}
            <rect x="70" y="152" width="12" height="24" fill="#64748b" stroke="#0f172a" strokeWidth="3" />
            <rect x="118" y="152" width="12" height="24" fill="#64748b" stroke="#0f172a" strokeWidth="3" />

            {/* Robot Arms with 3-Claw Hands */}
            <g stroke="#0f172a" strokeWidth="4" fill="#64748b">
              {/* Left Arm Waving */}
              <path d="M52 120 L 32 105 L 25 115" strokeLinecap="round" />
              <circle cx="23" cy="117" r="5" fill="#f59e0b" />
              {/* Right Arm */}
              <path d="M148 120 L 168 135 L 175 125" strokeLinecap="round" />
              <circle cx="177" cy="123" r="5" fill="#f59e0b" />
            </g>

            {/* Body */}
            <rect x="52" y="108" width="96" height="52" rx="14" fill="#475569" stroke="#0f172a" strokeWidth="4" />
            {/* Chest Screen with Status LEDs */}
            <rect x="72" y="118" width="56" height="32" rx="8" fill="#0f172a" />
            <circle cx="84" cy="134" r="5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="100" cy="134" r="5" fill="#f59e0b" />
            <circle cx="116" cy="134" r="5" fill="#10b981" />

            {/* Head */}
            <rect x="48" y="32" width="104" height="76" rx="18" fill={color} stroke="#0f172a" strokeWidth="5" />

            {/* Visor Screen */}
            <rect x="60" y="44" width="80" height="42" rx="10" fill="#0f172a" />

            {/* Robot Eyes */}
            {isSurprised ? (
              <g fill="#38bdf8">
                <circle cx="80" cy="65" r="10" />
                <circle cx="120" cy="65" r="10" />
              </g>
            ) : isConfused ? (
              <g stroke="#38bdf8" strokeWidth="4" strokeLinecap="round">
                <line x1="74" y1="58" x2="88" y2="72" />
                <circle cx="120" cy="65" r="7" fill="#38bdf8" />
              </g>
            ) : isLaughing || isCelebrating ? (
              <g stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round">
                <path d="M74 68 Q 82 56 90 68" />
                <path d="M110 68 Q 118 56 126 68" />
              </g>
            ) : (
              <g fill="#38bdf8">
                <rect x="74" y="58" width="14" height="14" rx="3" />
                <rect x="112" y="58" width="14" height="14" rx="3" />
              </g>
            )}

            {/* Mouth LED Matrix */}
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <rect x="74" y="90" width="52" height="12" rx="6" fill="#ef4444" />
                <path d="M78 96 H 122" stroke="#fef08a" strokeWidth="3" strokeDasharray="5 3" className="animate-talking-lip" />
                <rect x="74" y="90" width="52" height="12" rx="6" fill="none" stroke="#0f172a" strokeWidth="2" />
              </g>
            ) : (
              <line x1="80" y1="96" x2="120" y2="96" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* CHARACTER 3: WIZARD (Pixel) */}
        {style === 'wizard' && (
          <g id="wizard-avatar">
            {/* Feet / Pointy Wizard Boots */}
            <g fill="#4c1d95">
              <path d="M62 180 L 80 180 L 84 188 L 56 188 Z" />
              <path d="M120 180 L 138 180 L 144 188 L 116 188 Z" />
            </g>

            {/* Cloak */}
            <path d="M48 118 L 152 118 L 170 182 L 30 182 Z" fill={color} />
            <path d="M100 118 L 100 182" stroke="#f59e0b" strokeWidth="4" />

            {/* Magic Wand in Hand */}
            <g>
              <line x1="145" y1="130" x2="182" y2="90" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
              <polygon points="182,82 186,92 196,92 188,98 191,108 182,102 173,108 176,98 168,92 178,92" fill="#f59e0b" className="animate-pulse" />
              {(isSpeaking || isCelebrating || isDancing) && (
                <circle cx="182" cy="88" r="12" fill="#fef08a" opacity="0.6" className="animate-ping" />
              )}
            </g>

            {/* Head */}
            <circle cx="100" cy="85" r="38" fill="#fed7aa" />

            {/* Flowing Beard */}
            <path d="M65 92 Q 100 158 135 92 Q 100 112 65 92 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

            {/* Wizard Hat with Gold Buckle */}
            <path d="M35 80 L 165 80 Q 100 74 100 80 Z" fill="#7c3aed" />
            <path d="M55 80 L 100 10 L 145 80 Z" fill="#5b21b6" />
            <polygon points="100,20 105,30 115,30 107,36 110,46 100,40 90,46 93,36 85,30 95,30" fill="#f59e0b" />
            <rect x="85" y="72" width="30" height="10" fill="#f59e0b" rx="2" />

            {/* Eyes */}
            <g fill="#0f172a">
              <circle cx="83" cy="80" r="5" />
              <circle cx="117" cy="80" r="5" />
            </g>

            {/* Mouth */}
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <ellipse cx="100" cy="96" rx="10" ry="8" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
                <path d="M92 92 Q 100 96 108 92" fill="#ffffff" />
                <ellipse cx="100" cy="98" rx="6" ry="4" fill="#f472b6" className="animate-talking-lip" />
              </g>
            ) : (
              <path d="M92 96 Q 100 102 108 96" stroke="#0f172a" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 4: DRAGON (Codey) */}
        {style === 'dragon' && (
          <g id="dragon-avatar">
            {/* Flapping Wings */}
            <g className="animate-wing-flap">
              <path d="M42 85 Q 5 40 52 62 Z" fill="#15803d" />
              <path d="M158 85 Q 195 40 148 62 Z" fill="#15803d" />
            </g>

            {/* Spiked Dragon Tail */}
            <path d="M140 148 C 175 155, 185 130, 178 115 C 170 130, 155 138, 138 140 Z" fill={color} className="animate-tail-wag" />
            <polygon points="178,112 188,118 180,126" fill="#f59e0b" />

            {/* Dragon Feet */}
            <g fill="#15803d">
              <ellipse cx="72" cy="180" rx="14" ry="10" />
              <ellipse cx="128" cy="180" rx="14" ry="10" />
            </g>

            {/* Body */}
            <ellipse cx="100" cy="138" rx="52" ry="42" fill={color} />
            <ellipse cx="100" cy="142" rx="32" ry="26" fill="#fef08a" />

            {/* Dragon Claws / Arms */}
            <path d="M52 135 Q 42 150 56 155 Z" fill="#15803d" />
            <path d="M148 135 Q 158 150 144 155 Z" fill="#15803d" />

            {/* Head */}
            <circle cx="100" cy="72" r="44" fill={color} />

            {/* Horns */}
            <path d="M74 38 Q 62 15 68 10 Q 82 20 82 36 Z" fill="#f59e0b" />
            <path d="M126 38 Q 138 15 132 10 Q 118 20 118 36 Z" fill="#f59e0b" />

            {/* Snout & Nostrils */}
            <ellipse cx="100" cy="82" rx="26" ry="18" fill="#86efac" />
            <circle cx="92" cy="78" r="3" fill="#14532d" />
            <circle cx="108" cy="78" r="3" fill="#14532d" />

            {/* Eyes */}
            {isSpeaking ? (
              <g fill="#0f172a">
                <circle cx="82" cy="58" r="7" />
                <circle cx="118" cy="58" r="7" />
                <circle cx="84" cy="56" r="2.5" fill="#fff" />
                <circle cx="120" cy="56" r="2.5" fill="#fff" />
              </g>
            ) : (
              <g fill="#0f172a">
                <circle cx="82" cy="58" r="6" />
                <circle cx="118" cy="58" r="6" />
              </g>
            )}

            {/* Dragon Mouth & Fire Puff */}
            {isSpeaking && (
              <g className="animate-talking-mouth">
                <path d="M88 88 Q 100 114 112 88 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="3" />
                <path d="M91 88 Q 100 94 109 88" fill="#ffffff" />
                <path d="M96 98 Q 100 112 104 98 Z" fill="#f59e0b" className="animate-talking-lip" />
              </g>
            )}
            {(isSpeaking || isCelebrating) && (
              <g className="animate-bounce">
                <path d="M100 96 Q 118 110 100 128 Q 88 110 100 96 Z" fill="#ef4444" />
                <path d="M100 100 Q 110 112 100 120 Q 92 112 100 100 Z" fill="#f59e0b" />
              </g>
            )}
          </g>
        )}

        {/* CHARACTER 5: CAT (Whiskers) */}
        {style === 'cat' && (
          <g id="cat-avatar">
            {/* Curled Fluffy Cat Tail */}
            <path d="M142 145 C 180 150, 185 110, 168 95 C 158 110, 162 135, 138 138 Z" fill={color} className="animate-tail-wag" />

            {/* Cat Feet */}
            <g fill="#f472b6">
              <ellipse cx="72" cy="180" rx="12" ry="8" />
              <ellipse cx="128" cy="180" rx="12" ry="8" />
            </g>

            {/* Ears */}
            <polygon points="52,55 35,10 78,40" fill={color} />
            <polygon points="148,55 165,10 122,40" fill={color} />
            <polygon points="54,50 42,20 74,40" fill="#f472b6" />
            <polygon points="146,50 158,20 126,40" fill="#f472b6" />

            {/* Body */}
            <ellipse cx="100" cy="138" rx="50" ry="40" fill={color} />
            <ellipse cx="100" cy="142" rx="28" ry="24" fill="#fbcfe8" />

            {/* Paws */}
            <circle cx="68" cy="142" r="10" fill={color} />
            <circle cx="132" cy="142" r="10" fill={color} />

            {/* Head */}
            <circle cx="100" cy="72" r="44" fill={color} />

            {/* Whiskers */}
            <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round">
              <line x1="40" y1="72" x2="68" y2="75" />
              <line x1="40" y1="82" x2="68" y2="81" />
              <line x1="160" y1="72" x2="132" y2="75" />
              <line x1="160" y1="82" x2="132" y2="81" />
            </g>

            {/* Cute Cat Eyes */}
            <g fill="#0f172a">
              <ellipse cx="80" cy="65" rx="6" ry="8" />
              <ellipse cx="120" cy="65" rx="6" ry="8" />
              <circle cx="82" cy="62" r="2.5" fill="#fff" />
              <circle cx="122" cy="62" r="2.5" fill="#fff" />
            </g>

            {/* Nose & Mouth */}
            <polygon points="100,75 95,71 105,71" fill="#f472b6" />
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <path d="M88 80 Q 100 98 112 80 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="3" />
                <path d="M92 80 Q 100 84 108 80" fill="#ffffff" />
                <path d="M96 87 Q 100 96 104 87 Z" fill="#f472b6" className="animate-talking-lip" />
                <path d="M86 80 Q 100 76 114 80" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            ) : (
              <path d="M90 81 Q 95 87 100 81 Q 105 87 110 81" stroke="#0f172a" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 6: ASTRONAUT (Ada) */}
        {style === 'astronaut' && (
          <g id="astronaut-avatar">
            {/* Jetpack with Thruster Flame Glow */}
            <rect x="42" y="112" width="16" height="42" rx="6" fill="#94a3b8" />
            <rect x="142" y="112" width="16" height="42" rx="6" fill="#94a3b8" />
            <path d="M44 154 L 50 172 L 56 154 Z" fill="#ef4444" className="animate-bounce" />
            <path d="M144 154 L 150 172 L 156 154 Z" fill="#ef4444" className="animate-bounce" />

            {/* Space Boots */}
            <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3">
              <rect x="62" y="168" width="26" height="16" rx="6" />
              <rect x="112" y="168" width="26" height="16" rx="6" />
            </g>

            {/* Spacesuit Body */}
            <rect x="52" y="112" width="96" height="60" rx="20" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
            <rect x="72" y="128" width="56" height="28" rx="6" fill="#0284c7" />
            <circle cx="86" cy="142" r="4" fill="#ef4444" />
            <circle cx="100" cy="142" r="4" fill="#f59e0b" />
            <circle cx="114" cy="142" r="4" fill="#10b981" />

            {/* Space Helmet Outer */}
            <circle cx="100" cy="68" r="50" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />

            {/* Reflective Blue Visor Glass */}
            <circle cx="100" cy="68" r="40" fill={color} opacity="0.95" />
            <ellipse cx="116" cy="54" rx="16" ry="9" fill="#fff" opacity="0.45" />

            {/* Face inside Visor */}
            <circle cx="86" cy="66" r="5" fill="#fff" />
            <circle cx="114" cy="66" r="5" fill="#fff" />
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <ellipse cx="100" cy="80" rx="9" ry="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <path d="M93 76 Q 100 80 107 76" fill="#ffffff" />
                <ellipse cx="100" cy="82" rx="5" ry="3" fill="#f472b6" className="animate-talking-lip" />
              </g>
            ) : (
              <path d="M92 78 Q 100 84 108 78" stroke="#fff" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 7: ALIEN (Spocky) */}
        {style === 'alien' && (
          <g id="alien-avatar">
            {/* Holographic Tractor Beam Light */}
            <polygon points="60,158 140,158 175,200 25,200" fill="url(#tractorBeam)" />

            {/* Flying Saucer Base with Flashing LED Lights */}
            <ellipse cx="100" cy="155" rx="68" ry="22" fill="#94a3b8" stroke="#475569" strokeWidth="4" />
            <ellipse cx="100" cy="150" rx="42" ry="12" fill="url(#saucerGlow)" />
            <circle cx="48" cy="158" r="4" fill="#ef4444" className="animate-ping" />
            <circle cx="72" cy="162" r="4" fill="#f59e0b" />
            <circle cx="100" cy="164" r="5" fill="#10b981" className="animate-pulse" />
            <circle cx="128" cy="162" r="4" fill="#f59e0b" />
            <circle cx="152" cy="158" r="4" fill="#ef4444" className="animate-ping" />

            {/* Head */}
            <path d="M48 108 Q 28 35 100 25 Q 172 35 152 108 Z" fill={color} />

            {/* Wiggling Antennae */}
            <line x1="78" y1="30" x2="62" y2="10" stroke={color} strokeWidth="5" />
            <circle cx="58" cy="8" r="7" fill="#f59e0b" className="animate-pulse" />
            <line x1="122" y1="30" x2="138" y2="10" stroke={color} strokeWidth="5" />
            <circle cx="142" cy="8" r="7" fill="#f59e0b" className="animate-pulse" />

            {/* 3 Alien Eyes */}
            <circle cx="70" cy="62" r="9" fill="#fff" />
            <circle cx="100" cy="56" r="11" fill="#fff" />
            <circle cx="130" cy="62" r="9" fill="#fff" />
            <circle cx="70" cy="62" r="4" fill="#0f172a" />
            <circle cx="100" cy="56" r="5" fill="#0f172a" />
            <circle cx="130" cy="62" r="4" fill="#0f172a" />

            {/* Mouth */}
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <ellipse cx="100" cy="82" rx="11" ry="8" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                <ellipse cx="100" cy="84" rx="7" ry="5" fill="#ef4444" className="animate-talking-lip" />
              </g>
            ) : (
              <path d="M88 82 Q 100 90 112 82" stroke="#0f172a" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 8: FEMALE TECH PRESENTATION HOST (Sarah) */}
        {style === 'presenter_female' && !customAvatarUrl && (
          <g id="presenter-female-avatar">
            {/* Studio Lighting Background Glow Ring */}
            <circle cx="100" cy="100" r="85" fill={color} opacity="0.15" />

            {/* Hair Back */}
            <path d="M40 70 Q 25 150 55 180 Q 100 190 145 180 Q 175 150 160 70 Z" fill="#331f19" />

            {/* Shoulders & Business Blazer / Clothing Overlay */}
            {clothingStyle && clothingStyle !== 'default' ? (
              renderClothingOverlay(clothingStyle, '#0284c7')
            ) : (
              <g>
                <path d="M35 185 L 60 135 Q 100 125 140 135 L 165 185 Z" fill="#0284c7" />
                <polygon points="100,165 80,135 120,135" fill="#f8fafc" />
                <rect x="92" y="152" width="16" height="24" rx="3" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                <text x="100" y="167" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle">HOST</text>
              </g>
            )}

            {/* Hand Gestures */}
            {renderHandGesture(isPointing, isWaving, isThumbsUp, '#0284c7', '#fbcfe8')}

            {/* Neck & Face */}
            <rect x="88" y="115" width="24" height="24" rx="6" fill="#fbcfe8" />
            <ellipse cx="100" cy="80" rx="38" ry="46" fill="#fbcfe8" />

            {/* Hair Front Styling */}
            <path d="M60 65 Q 100 30 140 65 Q 120 40 100 42 Q 80 40 60 65 Z" fill="#451a03" />

            {/* Studio Broadcast Headset & Microphone */}
            <path d="M58 80 Q 52 40 100 38 Q 148 40 142 80" stroke="#475569" strokeWidth="5" fill="none" />
            <rect x="52" y="72" width="12" height="22" rx="5" fill="#0f172a" />
            <rect x="136" y="72" width="12" height="22" rx="5" fill="#0f172a" />
            <path d="M58 84 Q 75 105 92 98" stroke="#0f172a" strokeWidth="3.5" fill="none" />
            <circle cx="94" cy="98" r="5" fill="#ef4444" className={isSpeaking ? "animate-ping" : ""} />

            {/* Expressive Eyebrows */}
            {isAngry ? (
              <g stroke="#451a03" strokeWidth="3.5" strokeLinecap="round">
                <line x1="72" y1="62" x2="88" y2="68" />
                <line x1="112" y1="68" x2="128" y2="62" />
              </g>
            ) : isSad ? (
              <g stroke="#451a03" strokeWidth="3" strokeLinecap="round">
                <line x1="72" y1="68" x2="88" y2="62" />
                <line x1="112" y1="62" x2="128" y2="68" />
              </g>
            ) : isSurprised ? (
              <g stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M72 58 Q 80 48 88 58" />
                <path d="M112 58 Q 120 48 128 58" />
              </g>
            ) : (
              <g stroke="#451a03" strokeWidth="2.5" fill="none">
                <path d="M72 64 Q 80 60 88 64" />
                <path d="M112 64 Q 120 60 128 64" />
              </g>
            )}

            {/* Expressive Eyes */}
            {isWink ? (
              <g id="wink-eyes-female">
                <ellipse cx="80" cy="74" rx="6" ry="7" fill="#0f172a" />
                <circle cx="82" cy="72" r="2.5" fill="#fff" />
                <path d="M114 74 Q 120 80 126 74" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
            ) : isSurprised ? (
              <g fill="#0f172a">
                <ellipse cx="80" cy="74" rx="8" ry="9" fill="#fff" stroke="#0f172a" strokeWidth="2" />
                <ellipse cx="120" cy="74" rx="8" ry="9" fill="#fff" stroke="#0f172a" strokeWidth="2" />
                <circle cx="80" cy="74" r="4" />
                <circle cx="120" cy="74" r="4" />
              </g>
            ) : isLaughing || isCelebrating ? (
              <g stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round">
                <path d="M74 76 Q 80 68 86 76" />
                <path d="M114 76 Q 120 68 126 76" />
              </g>
            ) : (
              <g fill="#0f172a">
                <ellipse cx="80" cy="74" rx="6" ry="7" />
                <ellipse cx="120" cy="74" rx="6" ry="7" />
                <circle cx="82" cy="72" r="2.5" fill="#fff" />
                <circle cx="122" cy="72" r="2.5" fill="#fff" />
              </g>
            )}

            {/* Mouth */}
            {isSpeaking ? (
              <g className="animate-talking-real-mouth">
                <path d="M84 90 Q 100 114 116 90 Z" fill="#be123c" stroke="#451a03" strokeWidth="2" />
                <path d="M88 90 Q 100 95 112 90" fill="#ffffff" />
                <ellipse cx="100" cy="99" rx="6" ry="4" fill="#f472b6" className="animate-talking-lip" />
                <path d="M82 90 Q 100 86 118 90" stroke="#9f1239" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            ) : isAngry ? (
              <path d="M88 96 Q 100 88 112 96" stroke="#be123c" strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : isSad ? (
              <path d="M88 98 Q 100 90 112 98" stroke="#be123c" strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M88 92 Q 100 98 112 92" stroke="#be123c" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 9: MALE CYBER & TECH SPECIALIST (Alex) */}
        {style === 'presenter_male' && !customAvatarUrl && (
          <g id="presenter-male-avatar">
            <circle cx="100" cy="100" r="85" fill="#10b981" opacity="0.15" />

            {clothingStyle && clothingStyle !== 'default' ? (
              renderClothingOverlay(clothingStyle, '#1e293b')
            ) : (
              <g>
                <path d="M30 185 L 55 135 Q 100 125 145 135 L 170 185 Z" fill="#1e293b" />
                <polygon points="100,168 80,135 120,135" fill="#10b981" />
                <rect x="91" y="152" width="18" height="24" rx="3" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
                <text x="100" y="167" fontSize="6.5" fontWeight="black" fill="#0f172a" textAnchor="middle">CYBER</text>
              </g>
            )}

            {renderHandGesture(isPointing, isWaving, isThumbsUp, '#1e293b', '#f2d6b3')}

            <rect x="88" y="115" width="24" height="24" rx="6" fill="#fde047" opacity="0.3" />
            <ellipse cx="100" cy="80" rx="38" ry="46" fill="#f2d6b3" />

            <path d="M60 62 Q 100 32 140 62 Q 120 48 100 48 Q 80 48 60 62 Z" fill="#1e1b18" />

            <rect x="68" y="66" width="26" height="18" rx="4" fill="none" stroke="#0284c7" strokeWidth="3" />
            <rect x="106" y="66" width="26" height="18" rx="4" fill="none" stroke="#0284c7" strokeWidth="3" />
            <line x1="94" y1="74" x2="106" y2="74" stroke="#0284c7" strokeWidth="3" />

            {/* Expressive Eyes inside glasses */}
            {isWink ? (
              <g id="male-wink">
                <circle cx="81" cy="75" r="4" fill="#0f172a" />
                <path d="M113 75 Q 119 80 125 75" stroke="#0f172a" strokeWidth="3" fill="none" />
              </g>
            ) : (
              <g fill="#0f172a">
                <circle cx="81" cy="75" r="4" />
                <circle cx="119" cy="75" r="4" />
              </g>
            )}

            <path d="M136 82 Q 120 102 98 98" stroke="#10b981" strokeWidth="3" fill="none" />
            <circle cx="96" cy="98" r="4.5" fill="#10b981" className={isSpeaking ? "animate-pulse" : ""} />

            {/* Mouth */}
            {isSpeaking ? (
              <g className="animate-talking-real-mouth">
                <path d="M86 90 Q 100 110 114 90 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                <path d="M90 90 Q 100 94 110 90" fill="#ffffff" />
                <ellipse cx="100" cy="97" rx="5" ry="3" fill="#ef4444" className="animate-talking-lip" />
                <path d="M84 90 Q 100 86 116 90" stroke="#7f1d1d" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            ) : isAngry || isSad ? (
              <path d="M90 96 Q 100 90 110 96" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M90 92 Q 100 97 110 92" stroke="#0f172a" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 10: PROFESSOR / INSTRUCTOR (Marcus) */}
        {style === 'instructor' && !customAvatarUrl && (
          <g id="instructor-avatar">
            <circle cx="100" cy="100" r="85" fill="#8b5cf6" opacity="0.15" />

            {clothingStyle && clothingStyle !== 'default' ? (
              renderClothingOverlay(clothingStyle, '#4c1d95')
            ) : (
              <g>
                <path d="M30 185 L 58 135 Q 100 125 142 135 L 170 185 Z" fill="#4c1d95" />
                <polygon points="100,165 85,135 115,135" fill="#f8fafc" />
                <polygon points="100,175 96,138 104,138" fill="#ef4444" />
              </g>
            )}

            {renderHandGesture(isPointing, isWaving, isThumbsUp, '#4c1d95', '#fed7aa')}

            <rect x="88" y="115" width="24" height="24" rx="6" fill="#fed7aa" />
            <ellipse cx="100" cy="80" rx="38" ry="46" fill="#fed7aa" />

            <path d="M60 65 Q 100 35 140 65 Q 125 45 100 48 Q 75 45 60 65 Z" fill="#94a3b8" />
            <path d="M72 102 Q 100 128 128 102 Q 100 118 72 102 Z" fill="#94a3b8" />

            <circle cx="80" cy="74" r="12" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx="120" cy="74" r="12" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="92" y1="74" x2="108" y2="74" stroke="#f59e0b" strokeWidth="2.5" />

            <circle cx="80" cy="74" r="3.5" fill="#0f172a" />
            <circle cx="120" cy="74" r="3.5" fill="#0f172a" />

            {isSpeaking ? (
              <g className="animate-talking-real-mouth">
                <path d="M86 94 Q 100 114 114 94 Z" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2" />
                <path d="M90 94 Q 100 98 110 94" fill="#ffffff" />
                <ellipse cx="100" cy="100" rx="5" ry="3" fill="#f472b6" className="animate-talking-lip" />
                <path d="M84 94 Q 100 90 116 94" stroke="#450a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            ) : (
              <path d="M90 95 Q 100 100 110 95" stroke="#7f1d1d" strokeWidth="2.5" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 11: SENIOR ENGINEER (Dave) */}
        {style === 'engineer' && !customAvatarUrl && (
          <g id="engineer-avatar">
            <circle cx="100" cy="100" r="85" fill="#ec4899" opacity="0.15" />

            {clothingStyle && clothingStyle !== 'default' ? (
              renderClothingOverlay(clothingStyle, '#831843')
            ) : (
              <path d="M30 185 L 55 135 Q 100 125 145 135 L 170 185 Z" fill="#831843" />
            )}

            {renderHandGesture(isPointing, isWaving, isThumbsUp, '#831843', '#f3d2b2')}

            <ellipse cx="100" cy="80" rx="38" ry="46" fill="#f3d2b2" />

            <path d="M52 80 Q 50 32 100 30 Q 150 32 148 80" stroke="#f59e0b" strokeWidth="6" fill="none" />
            <rect x="46" y="68" width="14" height="28" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            <rect x="140" y="68" width="14" height="28" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />

            <path d="M60 60 Q 100 38 140 60 L 152 64 L 140 68 Z" fill="#0f172a" />

            <circle cx="80" cy="74" r="4.5" fill="#0f172a" />
            <circle cx="120" cy="74" r="4.5" fill="#0f172a" />

            {isSpeaking ? (
              <g className="animate-talking-real-mouth">
                <path d="M86 90 Q 100 108 114 90 Z" fill="#0f172a" stroke="#831843" strokeWidth="2" />
                <path d="M90 90 Q 100 94 110 90" fill="#ffffff" />
                <ellipse cx="100" cy="96" rx="5" ry="3" fill="#ef4444" className="animate-talking-lip" />
                <path d="M84 90 Q 100 86 116 90" stroke="#831843" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            ) : (
              <path d="M88 92 Q 100 98 112 92" stroke="#0f172a" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 12: STUDENT / DEVELOPER (Maya) */}
        {style === 'student' && !customAvatarUrl && (
          <g id="student-avatar">
            <circle cx="100" cy="100" r="85" fill="#06b6d4" opacity="0.15" />

            {clothingStyle && clothingStyle !== 'default' ? (
              renderClothingOverlay(clothingStyle, '#0891b2')
            ) : (
              <path d="M32 185 L 58 135 Q 100 125 142 135 L 168 185 Z" fill="#0891b2" />
            )}

            {renderHandGesture(isPointing, isWaving, isThumbsUp, '#0891b2', '#fce7f3')}

            <rect x="88" y="115" width="24" height="24" rx="6" fill="#fce7f3" />
            <ellipse cx="100" cy="80" rx="38" ry="46" fill="#fce7f3" />

            <path d="M58 70 Q 30 140 60 170 Q 100 180 140 170 Q 170 140 142 70 Z" fill="#0f172a" />
            <path d="M62 62 Q 100 38 138 62 Q 118 42 100 44 Q 82 42 62 62 Z" fill="#0f172a" />

            <ellipse cx="80" cy="74" rx="5.5" ry="6.5" fill="#0891b2" />
            <ellipse cx="120" cy="74" rx="5.5" ry="6.5" fill="#0891b2" />
            <circle cx="82" cy="72" r="2" fill="#fff" />
            <circle cx="122" cy="72" r="2" fill="#fff" />

            {isSpeaking ? (
              <g className="animate-talking-real-mouth">
                <path d="M84 90 Q 100 110 116 90 Z" fill="#db2777" stroke="#0f172a" strokeWidth="2" />
                <path d="M88 90 Q 100 94 112 90" fill="#ffffff" />
                <ellipse cx="100" cy="97" rx="6" ry="4" fill="#fbcfe8" className="animate-talking-lip" />
                <path d="M82 90 Q 100 86 118 90" stroke="#be123c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            ) : (
              <path d="M88 92 Q 100 98 112 92" stroke="#db2777" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 13: BLUEY (Blue Heeler Dog) */}
        {style === 'bluey' && (
          <g id="bluey-avatar">
            <path
              d="M145 130 C 170 115, 185 95, 175 80 C 165 90, 155 110, 140 123 Z"
              fill="#1e3a8a"
              className="animate-tail-wag"
            />
            <g fill="#1e3a8a">
              <rect x="68" y="170" width="22" height="18" rx="8" />
              <rect x="110" y="170" width="22" height="18" rx="8" />
            </g>
            <rect x="52" y="105" width="96" height="70" rx="16" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="4" />
            <ellipse cx="100" cy="142" rx="28" ry="22" fill="#fef08a" />
            {renderHandGesture(isPointing, isWaving, isThumbsUp, '#3b82f6', '#fef08a')}
            {!isPointing && !isWaving && !isThumbsUp && (
              <g fill="#3b82f6" stroke="#1e3a8a" strokeWidth="3">
                <rect x="36" y="118" width="18" height="38" rx="9" />
                <rect x="146" y="118" width="18" height="38" rx="9" />
              </g>
            )}
            <path d="M48 48 L 28 10 L 72 32 Z" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="3" />
            <path d="M52 46 L 38 22 L 66 36 Z" fill="#fef08a" />
            <path d="M152 48 L 172 10 L 128 32 Z" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="3" />
            <path d="M148 46 L 162 22 L 134 36 Z" fill="#fef08a" />
            <rect x="46" y="28" width="108" height="85" rx="22" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="4" />
            <path d="M46 38 Q 78 30 92 68 Q 62 88 46 62 Z" fill="#1e3a8a" />
            <rect x="68" y="66" width="64" height="40" rx="18" fill="#fef08a" stroke="#1e3a8a" strokeWidth="2.5" />
            <ellipse cx="100" cy="74" rx="10" ry="7" fill="#0f172a" />
            <g fill="#0f172a">
              <circle cx="78" cy="54" r="8" />
              <circle cx="122" cy="54" r="8" />
              <circle cx="80" cy="52" r="3" fill="#ffffff" />
              <circle cx="124" cy="52" r="3" fill="#ffffff" />
            </g>
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <path d="M84 88 Q 100 108 116 88 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="2.5" />
                <path d="M88 88 Q 100 92 112 88" fill="#ffffff" />
                <ellipse cx="100" cy="97" rx="6" ry="4" fill="#f472b6" className="animate-talking-lip" />
              </g>
            ) : (
              <path d="M88 88 Q 100 96 112 88" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* CHARACTER 14: SPONGE POP (Sea Sponge) */}
        {style === 'sponge_pop' && (
          <g id="sponge-pop-avatar">
            <g stroke="#0f172a" strokeWidth="3">
              <line x1="78" y1="168" x2="78" y2="185" />
              <line x1="122" y1="168" x2="122" y2="185" />
              <ellipse cx="74" cy="186" rx="10" ry="6" fill="#0f172a" />
              <ellipse cx="126" cy="186" rx="10" ry="6" fill="#0f172a" />
            </g>
            <rect x="52" y="132" width="96" height="38" fill="#78350f" stroke="#0f172a" strokeWidth="4" />
            <rect x="52" y="132" width="96" height="12" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            <polygon points="100,132 105,145 100,158 95,145" fill="#dc2626" />
            <line x1="60" y1="148" x2="72" y2="148" stroke="#0f172a" strokeWidth="3" />
            <line x1="128" y1="148" x2="140" y2="148" stroke="#0f172a" strokeWidth="3" />
            <rect x="48" y="24" width="104" height="110" rx="12" fill="#facc15" stroke="#0f172a" strokeWidth="4" />
            <circle cx="58" cy="36" r="6" fill="#eab308" opacity="0.6" />
            <circle cx="140" cy="40" r="8" fill="#eab308" opacity="0.6" />
            <circle cx="56" cy="115" r="7" fill="#eab308" opacity="0.6" />
            <circle cx="142" cy="118" r="6" fill="#eab308" opacity="0.6" />
            <g>
              <circle cx="76" cy="62" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
              <circle cx="124" cy="62" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
              <circle cx="78" cy="62" r="9" fill="#0284c7" />
              <circle cx="122" cy="62" r="9" fill="#0284c7" />
              <circle cx="78" cy="62" r="4" fill="#0f172a" />
              <circle cx="122" cy="62" r="4" fill="#0f172a" />
              <circle cx="80" cy="60" r="2" fill="#ffffff" />
              <circle cx="124" cy="60" r="2" fill="#ffffff" />
              <line x1="76" y1="42" x2="76" y2="36" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="68" y1="45" x2="64" y2="40" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="84" y1="45" x2="88" y2="40" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="124" y1="42" x2="124" y2="36" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="116" y1="45" x2="112" y2="40" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="132" y1="45" x2="136" y2="40" stroke="#0f172a" strokeWidth="2.5" />
            </g>
            <path d="M100 62 Q 112 70 100 78" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="62" cy="85" r="6" fill="#ef4444" opacity="0.5" />
            <circle cx="138" cy="85" r="6" fill="#ef4444" opacity="0.5" />
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <path d="M72 88 Q 100 118 128 88 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="3" />
                <rect x="91" y="88" width="8" height="10" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                <rect x="101" y="88" width="8" height="10" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                <ellipse cx="100" cy="106" rx="8" ry="5" fill="#f472b6" className="animate-talking-lip" />
              </g>
            ) : (
              <g>
                <path d="M68 88 Q 100 106 132 88" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <rect x="92" y="90" width="7" height="9" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                <rect x="101" y="90" width="7" height="9" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
              </g>
            )}
          </g>
        )}

        {/* CHARACTER 15: STAR PAT (Pink Starfish) */}
        {style === 'star_pat' && (
          <g id="star-pat-avatar">
            <path d="M52 142 L 148 142 L 160 185 L 40 185 Z" fill="#84cc16" stroke="#0f172a" strokeWidth="4" />
            <circle cx="70" cy="162" r="5" fill="#c084fc" />
            <circle cx="130" cy="165" r="6" fill="#c084fc" />
            <path
              d="M100 12 L 132 68 L 180 115 L 135 142 L 148 185 L 100 162 L 52 185 L 65 142 L 20 115 L 68 68 Z"
              fill="#f472b6"
              stroke="#0f172a"
              strokeWidth="4"
            />
            <g fill="#0f172a">
              <circle cx="85" cy="72" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="115" cy="72" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="86" cy="72" r="4" fill="#0f172a" />
              <circle cx="114" cy="72" r="4" fill="#0f172a" />
            </g>
            <path d="M76 58 Q 85 54 92 58" stroke="#0f172a" strokeWidth="3" fill="none" />
            <path d="M108 58 Q 115 54 124 58" stroke="#0f172a" strokeWidth="3" fill="none" />
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <ellipse cx="100" cy="98" rx="14" ry="12" fill="#be123c" stroke="#0f172a" strokeWidth="2.5" />
                <ellipse cx="100" cy="102" rx="8" ry="5" fill="#f472b6" className="animate-talking-lip" />
              </g>
            ) : (
              <path d="M85 92 Q 100 108 115 92" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* CHARACTER 16: SQUID WARD (Turquoise Octo) */}
        {style === 'squid_ward' && (
          <g id="squid-ward-avatar">
            <path d="M48 135 L 152 135 L 165 185 L 35 185 Z" fill="#78350f" stroke="#0f172a" strokeWidth="4" />
            <path d="M82 135 L 100 152 L 118 135" stroke="#ffffff" strokeWidth="3" fill="none" />
            <ellipse cx="100" cy="75" rx="48" ry="55" fill="#2dd4bf" stroke="#0d9488" strokeWidth="4" />
            <g>
              <ellipse cx="78" cy="62" rx="14" ry="16" fill="#fef08a" stroke="#0f172a" strokeWidth="3" />
              <ellipse cx="122" cy="62" rx="14" ry="16" fill="#fef08a" stroke="#0f172a" strokeWidth="3" />
              <rect x="76" y="60" width="4" height="6" fill="#9f1239" />
              <rect x="120" y="60" width="4" height="6" fill="#9f1239" />
              <path d="M64 52 Q 78 64 92 52 Z" fill="#2dd4bf" stroke="#0f172a" strokeWidth="2" />
              <path d="M108 52 Q 122 64 136 52 Z" fill="#2dd4bf" stroke="#0f172a" strokeWidth="2" />
            </g>
            <path d="M90 70 Q 100 120 110 112 Q 100 115 90 70 Z" fill="#0d9488" stroke="#0f172a" strokeWidth="3" />
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <ellipse cx="100" cy="118" rx="12" ry="8" fill="#0f172a" />
                <ellipse cx="100" cy="120" rx="6" ry="4" fill="#ef4444" className="animate-talking-lip" />
              </g>
            ) : (
              <path d="M85 116 Q 100 110 115 116" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* CHARACTER 17: LOUD HOUSE (Lincoln Loud) */}
        {style === 'loud_house' && (
          <g id="loud-house-avatar">
            <rect x="68" y="165" width="64" height="22" fill="#1d4ed8" stroke="#0f172a" strokeWidth="3" />
            <path d="M42 125 L 158 125 L 165 168 L 35 168 Z" fill="#f97316" stroke="#0f172a" strokeWidth="4" />
            <polygon points="100,125 85,138 115,138" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            <circle cx="100" cy="145" r="2" fill="#0f172a" />
            <circle cx="100" cy="72" r="38" fill="#fed7aa" stroke="#0f172a" strokeWidth="4" />
            <path
              d="M58 55 Q 50 20 80 25 Q 95 10 115 20 Q 135 15 142 45 Q 150 65 138 68 Q 115 35 58 55 Z"
              fill="#f8fafc"
              stroke="#0f172a"
              strokeWidth="4"
            />
            <g fill="#0f172a">
              <circle cx="72" cy="78" r="1.5" />
              <circle cx="76" cy="81" r="1.5" />
              <circle cx="70" cy="83" r="1.5" />
              <circle cx="128" cy="78" r="1.5" />
              <circle cx="124" cy="81" r="1.5" />
              <circle cx="130" cy="83" r="1.5" />
            </g>
            <g fill="#0f172a">
              <circle cx="82" cy="66" r="7" />
              <circle cx="118" cy="66" r="7" />
              <circle cx="84" cy="64" r="2.5" fill="#ffffff" />
              <circle cx="120" cy="64" r="2.5" fill="#ffffff" />
            </g>
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <path d="M82 84 Q 100 106 118 84 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="2.5" />
                <rect x="96" y="84" width="8" height="6" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
              </g>
            ) : (
              <g>
                <path d="M82 85 Q 100 96 118 85" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <rect x="97" y="86" width="6" height="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
              </g>
            )}
          </g>
        )}

        {/* CHARACTER 18: LOUD SISTER (Loud Girl) */}
        {style === 'loud_sister' && (
          <g id="loud-sister-avatar">
            <path d="M40 128 L 160 128 L 168 185 L 32 185 Z" fill="#06b6d4" stroke="#0f172a" strokeWidth="4" />
            <path d="M42 68 Q 30 15 100 12 Q 170 15 158 68 Z" fill="#fde047" stroke="#0f172a" strokeWidth="4" />
            <rect x="70" y="24" width="28" height="18" rx="5" fill="#0f172a" />
            <rect x="102" y="24" width="28" height="18" rx="5" fill="#0f172a" />
            <line x1="98" y1="30" x2="102" y2="30" stroke="#0f172a" strokeWidth="3" />
            <ellipse cx="100" cy="72" rx="34" ry="38" fill="#fed7aa" stroke="#0f172a" strokeWidth="4" />
            <g fill="#0f172a">
              <circle cx="82" cy="68" r="6" />
              <circle cx="118" cy="68" r="6" />
              <line x1="76" y1="60" x2="72" y2="54" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="82" y1="58" x2="82" y2="52" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="124" y1="60" x2="128" y2="54" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="118" y1="58" x2="118" y2="52" stroke="#0f172a" strokeWidth="2.5" />
            </g>
            {isSpeaking ? (
              <g className="animate-talking-mouth">
                <path d="M84 88 Q 100 108 116 88 Z" fill="#ec4899" stroke="#0f172a" strokeWidth="2" />
                <path d="M88 88 Q 100 92 112 88" fill="#ffffff" />
              </g>
            ) : (
              <path d="M86 88 Q 100 96 114 88" stroke="#ec4899" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* CHARACTER 19: BLUE MONSTER (Cookie Blue) */}
        {style === 'blue_monster' && (
          <g id="blue-monster-avatar">
            <ellipse cx="100" cy="120" rx="65" ry="60" fill="#2563eb" stroke="#1d4ed8" strokeWidth="5" />
            <g>
              <circle cx="76" cy="48" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
              <circle cx="124" cy="48" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
              <circle cx="72" cy="44" r="7" fill="#0f172a" />
              <circle cx="128" cy="52" r="7" fill="#0f172a" />
            </g>
            <path d="M52 82 Q 100 135 148 82 Z" fill="#0f172a" />
            <g className="animate-bounce">
              <circle cx="145" cy="115" r="12" fill="#d97706" stroke="#78350f" strokeWidth="2" />
              <circle cx="140" cy="112" r="2" fill="#451a03" />
              <circle cx="148" cy="118" r="2" fill="#451a03" />
              <circle cx="144" cy="120" r="1.5" fill="#451a03" />
            </g>
            {isSpeaking && (
              <ellipse cx="100" cy="112" rx="18" ry="12" fill="#ef4444" className="animate-talking-lip" />
            )}
          </g>
        )}

        {/* CHARACTER 20: PINK PANTHER (Cool Feline) */}
        {style === 'pink_panther' && (
          <g id="pink-panther-avatar">
            <ellipse cx="100" cy="148" rx="36" ry="42" fill="#f472b6" stroke="#be123c" strokeWidth="3" />
            <path d="M52 35 C 30 20, 40 60, 62 55 Z" fill="#f472b6" stroke="#be123c" strokeWidth="3" />
            <path d="M148 35 C 170 20, 160 60, 138 55 Z" fill="#f472b6" stroke="#be123c" strokeWidth="3" />
            <ellipse cx="100" cy="70" rx="38" ry="42" fill="#f472b6" stroke="#be123c" strokeWidth="3" />
            <ellipse cx="100" cy="82" rx="24" ry="16" fill="#fbcfe8" />
            <polygon points="100,75 92,82 108,82" fill="#be123c" />
            <g>
              <ellipse cx="78" cy="62" rx="10" ry="8" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
              <ellipse cx="122" cy="62" rx="10" ry="8" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
              <circle cx="80" cy="62" r="3" fill="#0f172a" />
              <circle cx="120" cy="62" r="3" fill="#0f172a" />
            </g>
            {isSpeaking ? (
              <ellipse cx="100" cy="92" rx="10" ry="6" fill="#be123c" className="animate-talking-mouth" />
            ) : (
              <path d="M88 90 Q 100 96 112 90" stroke="#0f172a" strokeWidth="3" fill="none" />
            )}
          </g>
        )}

        {/* CHARACTER 21: BUNNY (Hop Bunny) */}
        {style === 'bunny' && (
          <g id="bunny-avatar">
            <path d="M72 55 C 50 -10, 85 -10, 88 55 Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="3.5" />
            <path d="M74 48 C 60 5, 80 5, 84 48 Z" fill="#f472b6" />
            <path d="M128 55 C 115 -10, 150 -10, 128 55 Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="3.5" />
            <path d="M126 48 C 120 5, 140 5, 126 48 Z" fill="#f472b6" />
            <ellipse cx="100" cy="142" rx="46" ry="40" fill="#e2e8f0" stroke="#0f172a" strokeWidth="4" />
            <ellipse cx="100" cy="145" rx="28" ry="24" fill="#ffffff" />
            <circle cx="100" cy="80" r="42" fill="#e2e8f0" stroke="#0f172a" strokeWidth="4" />
            <ellipse cx="100" cy="90" rx="22" ry="14" fill="#ffffff" />
            <ellipse cx="100" cy="84" rx="6" ry="4" fill="#f472b6" />
            <g fill="#0f172a">
              <circle cx="82" cy="72" r="6" />
              <circle cx="118" cy="72" r="6" />
              <line x1="65" y1="88" x2="45" y2="85" stroke="#0f172a" strokeWidth="2" />
              <line x1="65" y1="92" x2="45" y2="95" stroke="#0f172a" strokeWidth="2" />
              <line x1="135" y1="88" x2="155" y2="85" stroke="#0f172a" strokeWidth="2" />
              <line x1="135" y1="92" x2="155" y2="95" stroke="#0f172a" strokeWidth="2" />
            </g>
            <rect x="96" y="94" width="8" height="8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        )}

        {/* CHARACTER 22: DUCK (Quack Duck) */}
        {style === 'duck' && (
          <g id="duck-avatar">
            <ellipse cx="100" cy="140" rx="52" ry="42" fill="#facc15" stroke="#0f172a" strokeWidth="4" />
            <circle cx="100" cy="75" r="42" fill="#facc15" stroke="#0f172a" strokeWidth="4" />
            <ellipse cx="100" cy="85" rx="26" ry="16" fill="#f97316" stroke="#0f172a" strokeWidth="3" />
            <line x1="82" y1="85" x2="118" y2="85" stroke="#0f172a" strokeWidth="2.5" />
            <g fill="#0f172a">
              <circle cx="82" cy="65" r="7" />
              <circle cx="118" cy="65" r="7" />
              <circle cx="84" cy="63" r="2.5" fill="#ffffff" />
              <circle cx="120" cy="63" r="2.5" fill="#ffffff" />
            </g>
          </g>
        )}

        {/* CHARACTER 23: SUPERHERO (Cape Hero) */}
        {style === 'superhero' && (
          <g id="superhero-avatar">
            <path d="M25 105 Q 15 185 30 195 Q 100 205 170 195 Q 185 185 175 105 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="4" />
            <path d="M48 118 L 152 118 L 165 185 L 35 185 Z" fill="#1d4ed8" stroke="#0f172a" strokeWidth="4" />
            <polygon points="100,132 115,142 110,160 90,160 85,142" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
            <circle cx="100" cy="72" r="38" fill="#fed7aa" stroke="#0f172a" strokeWidth="4" />
            <path d="M64 62 Q 100 52 136 62 Q 120 78 100 78 Q 80 78 64 62 Z" fill="#0f172a" />
            <circle cx="82" cy="68" r="4" fill="#ffffff" />
            <circle cx="118" cy="68" r="4" fill="#ffffff" />
          </g>
        )}

        {/* CHARACTER 24: ANIME HERO (Spiky Anime) */}
        {(style === 'anime_hero') && (
          <g id="anime-hero-avatar">
            <path
              d="M35 75 Q 15 35 55 42 Q 65 10 95 20 Q 115 5 135 25 Q 165 15 160 65 Q 180 85 155 95 Q 135 45 35 75 Z"
              fill="#f97316"
              stroke="#0f172a"
              strokeWidth="4"
            />
            <rect x="58" y="52" width="84" height="14" fill="#dc2626" stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="100,112 62,65 138,65" fill="#fed7aa" stroke="#0f172a" strokeWidth="3" />
            <g>
              <polygon points="72,70 90,70 85,82 74,82" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />
              <polygon points="110,70 128,70 126,82 115,82" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* CUSTOM UPLOADED REAL PERSON PHOTO AVATAR FRAME (When customAvatarUrl exists or style === 'custom_photo') */}
        {(customAvatarUrl || style === 'custom_photo') && (
          <g id="custom-photo-avatar">
            {/* Glowing Live Studio Frame Background */}
            <circle cx="100" cy="100" r="88" fill="none" stroke={color} strokeWidth="6" opacity="0.8" className={isSpeaking ? "animate-pulse" : ""} />
            <circle cx="100" cy="100" r="80" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />

            {customAvatarUrl ? (
              <foreignObject x="24" y="24" width="152" height="152" className="rounded-full overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/60 relative group">
                  <img
                    src={customAvatarUrl}
                    alt={name}
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute top-1 right-1 bg-red-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </div>
                  {/* Animated Lips Overlay when Photo Avatar is speaking */}
                  {isSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-6 bg-red-600/90 border-2 border-white rounded-full flex items-center justify-center shadow-lg animate-ping">
                        <div className="w-6 h-2 bg-pink-300 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>
              </foreignObject>
            ) : (
              <g>
                <circle cx="100" cy="80" r="30" fill="#334155" />
                <path d="M50 160 Q 100 110 150 160 Z" fill="#334155" />
                <text x="100" y="175" fontSize="11" fontWeight="extrabold" fill="#f59e0b" textAnchor="middle">📸 Real Person</text>
                {isSpeaking && (
                  <g className="animate-talking-real-mouth">
                    <path d="M84 130 Q 100 148 116 130 Z" fill="#be123c" stroke="#ffffff" strokeWidth="2" />
                    <ellipse cx="100" cy="138" rx="6" ry="4" fill="#f472b6" className="animate-talking-lip" />
                  </g>
                )}
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Name Badge */}
      <div
        className="mt-1 px-3.5 py-1 rounded-full text-xs sm:text-sm font-black text-white shadow-md border border-white/40 flex items-center gap-1.5"
        style={{ backgroundColor: color }}
      >
        <span>{name}</span>
        {isSpeaking && <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping" />}
      </div>
    </div>
  );
};
