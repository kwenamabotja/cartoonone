import React from 'react';
import { AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export type VisemeType = 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'F' | 'rest';
export type CharacterExpressionType =
  | 'neutral'
  | 'happy'
  | 'surprised'
  | 'angry'
  | 'thinking'
  | 'explaining'
  | 'confused'
  | 'laughing'
  | 'celebrating'
  | 'wink'
  | 'sad'
  | 'shocked_eyes'
  | 'squash_and_stretch'
  | 'facepalm';

export interface VisemeTimestamp {
  timeOffsetMs: number;
  viseme: VisemeType;
}

export interface CharacterSceneProps {
  characterName?: string;
  expression?: CharacterExpressionType | string;
  cameraAngle?: string;
  handGesture?: string;
  isSpeaker?: boolean;
  visemes?: VisemeTimestamp[];
  audioUrl?: string;
  backgroundColor?: string;
  characterColor?: string;
  titleText?: string;
}

/**
 * Calculates head angle, tilt, scale, and translation offset based on cameraAngle & expression state machine.
 */
export const getHeadAngleTransform = (
  cameraAngle: string = 'MEDIUM_TWO_SHOT',
  expression: string = 'happy',
  isSpeaker: boolean = true
) => {
  let rotate = 0;
  let translateX = 0;
  let translateY = 0;
  let scaleX = 1;
  let scaleY = 1;

  // 1. Camera Angle Head Direction
  switch (cameraAngle) {
    case 'CLOSE_UP_EMOTE':
      rotate = isSpeaker ? -4 : 4;
      scaleX = 1.06;
      scaleY = 1.06;
      break;
    case 'OVER_THE_SHOULDER':
      rotate = isSpeaker ? -8 : 8;
      translateX = isSpeaker ? 5 : -5;
      break;
    case 'QUICK_WHIP_PAN':
      rotate = isSpeaker ? 7 : -7;
      translateX = isSpeaker ? -6 : 6;
      break;
    case 'REACTION_SHOT':
      rotate = isSpeaker ? -12 : 12;
      translateY = -8;
      break;
    case 'SLOW_PUSH_IN':
      rotate = -2;
      break;
    case 'MEDIUM_TWO_SHOT':
    case 'WIDE_ESTABLISHING':
    default:
      rotate = 0;
      break;
  }

  // 2. Emotion State Machine Head Dynamics
  if (expression === 'shocked_eyes' || expression === 'surprised') {
    rotate += isSpeaker ? -6 : 6;
    translateY -= 6;
    scaleY = 1.15; // stretch
    scaleX = 0.92;
  } else if (expression === 'squash_and_stretch') {
    scaleY = 0.85; // squash
    scaleX = 1.18;
  } else if (expression === 'thinking' || expression === 'confused') {
    rotate += isSpeaker ? -10 : 10;
    translateY += 3;
  } else if (expression === 'facepalm') {
    rotate += 14;
    translateY += 8;
  } else if (expression === 'angry') {
    rotate += 4;
    translateY += 3;
  } else if (expression === 'celebrating' || expression === 'laughing') {
    rotate += isSpeaker ? -5 : 5;
    translateY -= 4;
  }

  return { rotate, translateX, translateY, scaleX, scaleY };
};

/**
 * VisemeMouth: Renders frame-accurate mouth shapes corresponding to phoneme visemes.
 */
export const VisemeMouth: React.FC<{ viseme: VisemeType }> = ({ viseme }) => {
  switch (viseme) {
    case 'A':
      return (
        <g id="viseme-A">
          <ellipse cx="50" cy="62" rx="14" ry="18" fill="#1e293b" />
          <path d="M 40 50 Q 50 48 60 50 Q 50 78 40 50 Z" fill="#ef4444" opacity="0.8" />
          <rect x="42" y="48" width="16" height="4" rx="2" fill="#ffffff" />
        </g>
      );
    case 'E':
      return (
        <g id="viseme-E">
          <rect x="32" y="55" width="36" height="12" rx="6" fill="#1e293b" />
          <rect x="36" y="56" width="28" height="3" rx="1.5" fill="#ffffff" />
          <path d="M 42 63 Q 50 67 58 63" stroke="#f472b6" strokeWidth="3" fill="none" />
        </g>
      );
    case 'I':
      return (
        <g id="viseme-I">
          <rect x="34" y="57" width="32" height="9" rx="4.5" fill="#1e293b" />
          <rect x="38" y="58" width="24" height="2" rx="1" fill="#ffffff" />
        </g>
      );
    case 'O':
      return (
        <g id="viseme-O">
          <circle cx="50" cy="60" r="14" fill="#1e293b" />
          <circle cx="50" cy="62" r="8" fill="#dc2626" opacity="0.7" />
          <path d="M 42 50 Q 50 48 58 50" stroke="#ffffff" strokeWidth="2" fill="none" />
        </g>
      );
    case 'U':
      return (
        <g id="viseme-U">
          <circle cx="50" cy="60" r="9" fill="#1e293b" />
          <circle cx="50" cy="61" r="5" fill="#ef4444" opacity="0.8" />
        </g>
      );
    case 'M':
      return (
        <g id="viseme-M">
          <line x1="32" y1="60" x2="68" y2="60" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
          <line x1="36" y1="60" x2="64" y2="60" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'F':
      return (
        <g id="viseme-F">
          <path d="M 34 56 L 66 56 L 60 64 L 40 64 Z" fill="#1e293b" />
          <rect x="36" y="56" width="28" height="3" fill="#ffffff" rx="1" />
        </g>
      );
    case 'rest':
    default:
      return (
        <g id="viseme-rest">
          <path d="M 36 60 Q 50 64 64 60" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      );
  }
};

/**
 * LipSyncedCharacter: Expressive 2D character with automatic eye-blinking,
 * expression eyebrow posture controls, and frame-synchronized lip syncing.
 */
export const LipSyncedCharacter: React.FC<{
  visemes?: VisemeTimestamp[];
  expression?: CharacterExpressionType | string;
  cameraAngle?: string;
  handGesture?: string;
  isSpeaker?: boolean;
  color?: string;
  name?: string;
}> = ({
  visemes = [],
  expression = 'neutral',
  cameraAngle = 'MEDIUM_TWO_SHOT',
  handGesture = 'none',
  isSpeaker = true,
  color = '#f59e0b',
  name = 'Host',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Frame-accurate time calculation in milliseconds
  const currentMs = (frame / fps) * 1000;

  // 2. Map current ms to active viseme shape
  const activeViseme = visemes.reduce<VisemeType>((acc, entry) => {
    if (currentMs >= entry.timeOffsetMs) return entry.viseme;
    return acc;
  }, 'rest');

  // 3. Realistic eye-blinking every 90 frames (~3 seconds)
  const blinkCycleFrames = 90;
  const cycleFrame = frame % blinkCycleFrames;
  
  // Blink duration is ~6 frames
  const eyeScaleY = interpolate(
    cycleFrame,
    [0, 82, 85, 88, 90],
    [1, 1, 0.08, 1, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 4. Expression & Camera Angle Head State Machine
  const headTransform = getHeadAngleTransform(cameraAngle, expression as string, isSpeaker);

  // Eyebrow posture parameters
  const getEyebrowTransform = (expr: string) => {
    switch (expr) {
      case 'happy':
      case 'celebrating':
        return { leftOffsetY: -4, rightOffsetY: -4, leftRotate: -8, rightRotate: 8 };
      case 'surprised':
      case 'shocked_eyes':
        return { leftOffsetY: -12, rightOffsetY: -12, leftRotate: -4, rightRotate: 4 };
      case 'angry':
        return { leftOffsetY: 6, rightOffsetY: 6, leftRotate: 20, rightRotate: -20 };
      case 'thinking':
      case 'confused':
        return { leftOffsetY: -8, rightOffsetY: 2, leftRotate: -12, rightRotate: 4 };
      case 'sad':
        return { leftOffsetY: 4, rightOffsetY: 4, leftRotate: -10, rightRotate: 10 };
      default:
        return { leftOffsetY: 0, rightOffsetY: 0, leftRotate: 0, rightRotate: 0 };
    }
  };

  const eyebrow = getEyebrowTransform(expression as string);

  return (
    <div className="relative flex flex-col items-center justify-center w-80 h-80 drop-shadow-2xl">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="headGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Character Body / Shoulders */}
        <path
          d="M 18 96 L 32 72 Q 50 68 68 72 L 82 96 Z"
          fill={color}
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinejoin="round"
          filter="url(#shadow)"
        />
        {/* Collar / Tie Accent */}
        <polygon points="50,86 42,72 58,72" fill="#ffffff" />
        <polygon points="50,72 52,76 50,92 48,76" fill="#ef4444" />

        {/* HEAD GROUP WITH EXPRESSION & CAMERA ANGLE TRANSFORM STATE MACHINE */}
        <g
          id="head-group"
          transform={`translate(${headTransform.translateX}, ${headTransform.translateY}) rotate(${headTransform.rotate}, 50, 46) scale(${headTransform.scaleX}, ${headTransform.scaleY})`}
        >
          {/* Head Base */}
          <circle cx="50" cy="46" r="32" fill="#fed7aa" stroke="#0f172a" strokeWidth="3" filter="url(#shadow)" />
          <circle cx="50" cy="46" r="32" fill="url(#headGlow)" />

          {/* Cheeks / Blush */}
          <ellipse cx="32" cy="52" rx="5" ry="3" fill="#f472b6" opacity={expression === 'happy' || expression === 'celebrating' ? 0.7 : 0.4} />
          <ellipse cx="68" cy="52" rx="5" ry="3" fill="#f472b6" opacity={expression === 'happy' || expression === 'celebrating' ? 0.7 : 0.4} />

          {/* Expressive Eyebrows */}
          <g id="eyebrows" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none">
            {/* Left Eyebrow */}
            <path
              d="M 30 32 Q 37 28 44 32"
              transform={`translate(0, ${eyebrow.leftOffsetY}) rotate(${eyebrow.leftRotate}, 37, 30)`}
            />
            {/* Right Eyebrow */}
            <path
              d="M 56 32 Q 63 28 70 32"
              transform={`translate(0, ${eyebrow.rightOffsetY}) rotate(${eyebrow.rightRotate}, 63, 30)`}
            />
          </g>

          {/* Eyes with Remotion Frame-Accurate Blinking or Shocked Eyes */}
          <g id="eyes" filter="url(#shadow)">
            {expression === 'shocked_eyes' ? (
              // Extreme Shocked Eyes
              <>
                <circle cx="36" cy="42" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                <circle cx="36" cy="42" r="2.5" fill="#0f172a" />
                <circle cx="64" cy="42" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                <circle cx="64" cy="42" r="2.5" fill="#0f172a" />
              </>
            ) : (
              // Standard Eye Blinking
              <>
                <g transform={`translate(36, 42) scale(1, ${eyeScaleY}) translate(-36, -42)`}>
                  <circle cx="36" cy="42" r="6" fill="#0f172a" />
                  <circle cx="38" cy="40" r="2.2" fill="#ffffff" />
                </g>
                <g transform={`translate(64, 42) scale(1, ${eyeScaleY}) translate(-64, -42)`}>
                  <circle cx="64" cy="42" r="6" fill="#0f172a" />
                  <circle cx="66" cy="40" r="2.2" fill="#ffffff" />
                </g>
              </>
            )}
          </g>

          {/* Frame-Accurate Viseme Lip Sync Mouth */}
          <g id="lip-sync-mouth">
            <VisemeMouth viseme={activeViseme} />
          </g>

          {/* Facepalm Hand Overlay */}
          {(expression === 'facepalm' || handGesture === 'facepalm') && (
            <g id="facepalm-hand" fill="#fed7aa" stroke="#0f172a" strokeWidth="2">
              <path d="M 38 28 C 38 18, 48 18, 52 28 L 54 48 C 50 52, 40 52, 38 42 Z" />
              <path d="M 44 26 C 44 16, 54 16, 58 26 L 60 46" />
            </g>
          )}
        </g>
      </svg>

      {/* Name Tag */}
      <div className="mt-2 px-3 py-1 bg-slate-900/90 text-yellow-400 font-extrabold text-xs rounded-full border border-yellow-400/50 shadow-lg tracking-wider uppercase">
        {name}
      </div>
    </div>
  );
};

/**
 * CharacterScene: Complete Remotion Video Composition.
 * Layer-based compositing (Background -> Stage/Props -> Character -> Overlays -> Audio).
 */
export const CharacterScene: React.FC<CharacterSceneProps> = ({
  characterName = 'Host Alex',
  expression = 'happy',
  visemes = [
    { timeOffsetMs: 0, viseme: 'rest' },
    { timeOffsetMs: 200, viseme: 'A' },
    { timeOffsetMs: 500, viseme: 'E' },
    { timeOffsetMs: 800, viseme: 'I' },
    { timeOffsetMs: 1200, viseme: 'O' },
    { timeOffsetMs: 1600, viseme: 'U' },
    { timeOffsetMs: 2000, viseme: 'M' },
    { timeOffsetMs: 2400, viseme: 'F' },
    { timeOffsetMs: 2800, viseme: 'rest' },
  ],
  audioUrl,
  backgroundColor = '#0f172a',
  characterColor = '#3b82f6',
  titleText = 'Expressive Remotion Studio',
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor }} className="font-sans select-none overflow-hidden text-white">
      {/* LAYER 1: Background Canvas & Atmospheric Lighting */}
      <AbsoluteFill className="flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
      </AbsoluteFill>

      {/* LAYER 2: Stage & Studio Spotlight Props */}
      <AbsoluteFill className="flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full border border-cyan-500/20 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center relative shadow-2xl">
          {/* Decorative Studio Floor Ring */}
          <div className="absolute bottom-12 w-80 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/30 blur-xs transform rotate-X-60" />
        </div>
      </AbsoluteFill>

      {/* LAYER 3: Lip-Synced Character */}
      <AbsoluteFill className="flex items-center justify-center">
        <LipSyncedCharacter
          visemes={visemes}
          expression={expression}
          color={characterColor}
          name={characterName}
        />
      </AbsoluteFill>

      {/* LAYER 4: UI Overlays & Title */}
      <AbsoluteFill className="p-8 flex flex-col justify-between pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-xl font-black tracking-wider uppercase text-cyan-400 drop-shadow-md">
              {titleText}
            </h1>
          </div>
          <div className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
            FRAME: {frame}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>SPEAKER: <span className="text-yellow-400 font-bold">{characterName}</span></div>
          <div>EXPRESSION: <span className="text-cyan-300 font-bold uppercase">{expression}</span></div>
        </div>
      </AbsoluteFill>

      {/* LAYER 5: Synchronized Audio */}
      {audioUrl && <Audio src={audioUrl} />}
    </AbsoluteFill>
  );
};

export default CharacterScene;
