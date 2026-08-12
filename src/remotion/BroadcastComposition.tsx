import React from 'react';
import { AbsoluteFill, Series, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CartoonProject, RoleplayScene, CameraAngleType } from '../types';
import { LipSyncedCharacter } from './CharacterScene';
import { BroadcastSafeAreas } from './BroadcastSafeAreas';
import {
  showStyleThemes,
  ShowTitleCard,
  SpongeBobGrossUpOverlay,
  ActionSpeedLines,
  ShowStyleType,
} from './showStyleThemes';

export interface BroadcastCompositionProps {
  project?: CartoonProject;
  showSafeAreas?: boolean;
  resolutionLabel?: string;
  tvRating?: string;
}

const defaultProject: CartoonProject = {
  id: 'demo',
  title: 'Episode 1: Broadcast Demo',
  topic: '2D Cartoon Studio Pro',
  category: 'Technology',
  targetAge: '7-12',
  tvFormat: '16:9_hd',
  showStyle: 'cartoon_network',
  bgMusicTrack: 'upbeat',
  bgMusicVolume: 0.3,
  createdAt: new Date().toISOString(),
  showSubtitles: true,
  characters: [
    {
      id: 'char-1',
      name: 'Director Ada',
      role: 'Host',
      style: 'presenter_female',
      color: '#3b82f6',
      voicePitch: 1.0,
      voiceRate: 1.0,
      clothingStyle: 'formal',
    },
    {
      id: 'char-2',
      name: 'Spocky',
      role: 'Co-Host',
      style: 'alien',
      color: '#10b981',
      voicePitch: 1.2,
      voiceRate: 1.1,
      clothingStyle: 'casual',
    },
  ],
  scenes: [
    {
      id: 'scene-1',
      speakerId: 'char-1',
      listenerId: 'char-2',
      dialogue: 'Welcome to Cartoon Studio Pro! Today we are producing broadcast-quality 2D animated episodes!',
      speakerEmotion: 'happy',
      listenerEmotion: 'surprised',
      cameraAngle: 'WIDE_ESTABLISHING',
      handGesture: 'waving',
      microAction: 'smiles and waves to audience',
      background: 'classroom',
      soundEffect: 'tada',
      durationSeconds: 3.5,
    },
    {
      id: 'scene-2',
      speakerId: 'char-2',
      listenerId: 'char-1',
      dialogue: 'That is incredible! We have Remotion Series composition rendering, show style themes, and 24fps lip sync!',
      speakerEmotion: 'shocked_eyes',
      listenerEmotion: 'happy',
      cameraAngle: 'CLOSE_UP_EMOTE',
      handGesture: 'thumbs_up',
      microAction: 'jumps with excited gasp',
      background: 'classroom',
      soundEffect: 'success',
      durationSeconds: 4.0,
    },
  ],
};

/**
 * Individual Scene Item rendered inside a Remotion <Series.Sequence>
 */
const SceneSequenceItem: React.FC<{
  scene: RoleplayScene;
  sceneIndex: number;
  durationInFrames: number;
  project: CartoonProject;
  showStyle: ShowStyleType;
}> = ({ scene, durationInFrames, project, showStyle }) => {
  const frame = useCurrentFrame(); // 0 to durationInFrames-1 for this scene sequence
  const { fps } = useVideoConfig();

  const theme = showStyleThemes[showStyle] || showStyleThemes.cartoon_network;

  // Camera scale & transform interpolation inside this scene
  const getCameraTransformStyles = (angle?: CameraAngleType) => {
    switch (angle) {
      case 'CLOSE_UP_EMOTE':
        return { scale: 1.4, translateY: 5, translateX: 0 };
      case 'OVER_THE_SHOULDER':
        return { scale: 1.25, translateY: 2, translateX: -6 };
      case 'QUICK_WHIP_PAN':
        return { scale: 1.2, translateY: 0, translateX: 8 };
      case 'SLOW_PUSH_IN': {
        const pushScale = interpolate(frame, [0, durationInFrames], [1.05, 1.24], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return { scale: pushScale, translateY: 0, translateX: 0 };
      }
      case 'MEDIUM_TWO_SHOT':
        return { scale: 1.12, translateY: 2, translateX: 0 };
      case 'REACTION_SHOT':
        return { scale: 1.35, translateY: 4, translateX: 8 };
      case 'WIDE_ESTABLISHING':
      default:
        return { scale: 1.0, translateY: 0, translateX: 0 };
    }
  };

  const camTarget = getCameraTransformStyles(scene.cameraAngle);

  // Smooth Spring motion for camera moves
  const springScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
    from: 1.0,
    to: camTarget.scale,
  });

  const speakerChar = project.characters.find((c) => c.id === scene.speakerId) || project.characters[0];
  const listenerChar = project.characters.find((c) => c.id !== scene.speakerId) || project.characters[1] || speakerChar;

  const remotionVisemes = (scene.visemeCues || [
    { timeOffsetMs: 0, viseme: 'rest' },
    { timeOffsetMs: 150, viseme: 'A' },
    { timeOffsetMs: 400, viseme: 'E' },
    { timeOffsetMs: 700, viseme: 'O' },
    { timeOffsetMs: 1100, viseme: 'rest' },
  ]) as any[];

  const isCloseUp = scene.cameraAngle === 'CLOSE_UP_EMOTE' || scene.cameraAngle === 'REACTION_SHOT';
  const isActionScene = (scene.actionEffect && scene.actionEffect !== 'none') || scene.cameraAngle === 'QUICK_WHIP_PAN';

  return (
    <AbsoluteFill className={`bg-slate-950 font-sans select-none overflow-hidden text-white ${theme.frameBorderClass || ''}`} style={{ filter: theme.colorGradingFilter }}>
      {/* LAYER 1: Parallax Background Stage */}
      <AbsoluteFill className={`flex items-center justify-center bg-gradient-to-br ${theme.bgGradient}`}>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-20" />
      </AbsoluteFill>

      {/* LAYER 2: Camera Animated Stage Stage */}
      <AbsoluteFill
        style={{
          transform: `scale(${springScale}) translate3d(${camTarget.translateX}%, ${camTarget.translateY}%, 0)`,
        }}
        className="flex items-end justify-around px-16 pb-12 transition-transform"
      >
        {/* Speaker Character */}
        <div className="flex flex-col items-center relative">
          <LipSyncedCharacter
            visemes={remotionVisemes}
            expression={scene.speakerEmotion as any}
            cameraAngle={scene.cameraAngle}
            handGesture={scene.handGesture}
            isSpeaker={true}
            color={speakerChar.color}
            name={speakerChar.name}
          />
        </div>

        {/* Listener Character (if 2 characters exist) */}
        {project.characters.length > 1 && (
          <div className="flex flex-col items-center relative opacity-90">
            <LipSyncedCharacter
              visemes={[{ timeOffsetMs: 0, viseme: 'rest' }]}
              expression={scene.listenerEmotion as any}
              cameraAngle={scene.cameraAngle}
              handGesture={scene.handGesture}
              isSpeaker={false}
              color={listenerChar.color}
              name={listenerChar.name}
            />
          </div>
        )}
      </AbsoluteFill>

      {/* SHOW STYLE OVERLAYS */}
      {showStyle === 'spongebob' && isCloseUp && <SpongeBobGrossUpOverlay />}
      {showStyle === 'cartoon_network' && isActionScene && <ActionSpeedLines />}

      {/* LAYER 3: Dialogue Lower-Third Subtitle Card */}
      <AbsoluteFill className="p-8 flex flex-col justify-end pointer-events-none z-30">
        <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-3xl mx-auto w-full text-center space-y-1 ${
          showStyle === 'spongebob'
            ? 'bg-amber-100/95 border-4 border-amber-800 text-amber-950 font-serif'
            : showStyle === 'bluey'
            ? 'bg-sky-100/95 border-4 border-blue-300 text-slate-800'
            : 'bg-slate-950/90 border-2 border-yellow-400/80 text-white'
        }`}>
          <div className={`text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
            showStyle === 'spongebob' ? 'text-amber-900' : showStyle === 'bluey' ? 'text-blue-600' : 'text-yellow-400'
          }`}>
            <span>🎬 {speakerChar.name}</span>
            {scene.microAction && (
              <span className="opacity-80 font-normal">({scene.microAction})</span>
            )}
          </div>
          <p className="text-base sm:text-lg font-bold leading-snug">
            "{scene.dialogue}"
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Remotion Broadcast Composition:
 * Full multi-scene episode sequence built with <Series> running at 24fps.
 * Uses frame-accurate scene timing (`fps * scene.durationSeconds`).
 */
export const BroadcastComposition: React.FC<BroadcastCompositionProps> = ({
  project = defaultProject,
  showSafeAreas = false,
  resolutionLabel = '1080p Full HD @ 24fps',
  tvRating = 'TV-Y7',
}) => {
  const { fps } = useVideoConfig(); // 24 fps
  const showStyle: ShowStyleType = project.showStyle || 'cartoon_network';
  const theme = showStyleThemes[showStyle] || showStyleThemes.cartoon_network;

  const titleCardFrames = theme.hasTitleCardAtFrame0 ? Math.round(fps * 3) : 0;

  return (
    <AbsoluteFill className="bg-slate-950 font-sans select-none overflow-hidden text-white">
      <Series>
        {/* Frame 0 Retro Title Card Sequence */}
        {theme.hasTitleCardAtFrame0 && (
          <Series.Sequence durationInFrames={titleCardFrames}>
            <ShowTitleCard showStyle={showStyle} title={project.title} topic={project.topic} />
          </Series.Sequence>
        )}

        {/* Dynamic Mapping over Scenes using frame-accurate timing (fps * scene.durationSeconds) */}
        {project.scenes.map((scene, index) => {
          const durationSeconds = scene.durationSeconds || Math.max(2.5, (scene.dialogue.length * 0.065) + ((scene.timingHoldMs || 600) / 1000));
          const durationInFrames = Math.max(24, Math.round(fps * durationSeconds));

          return (
            <Series.Sequence key={scene.id || index} durationInFrames={durationInFrames}>
              <SceneSequenceItem
                scene={scene}
                sceneIndex={index}
                durationInFrames={durationInFrames}
                project={project}
                showStyle={showStyle}
              />
            </Series.Sequence>
          );
        })}
      </Series>

      {/* LAYER 4: TV Safe Areas Overlay */}
      <BroadcastSafeAreas
        showSafeAreas={showSafeAreas}
        resolutionLabel={resolutionLabel}
        tvRating={tvRating}
        networkBugText={project.title.toUpperCase()}
      />
    </AbsoluteFill>
  );
};
