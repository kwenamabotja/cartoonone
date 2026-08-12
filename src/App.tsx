import React, { useState, useEffect, useRef } from 'react';
import { CartoonProject, RoleplayScene, Character } from './types';
import { PRESET_CARTOONS } from './data/presets';
import { CartoonStage } from './components/CartoonStage';
import { VisualTimelineCanvas } from './components/VisualTimelineCanvas';
import { SceneEditor } from './components/SceneEditor';
import { ScriptGeneratorModal } from './components/ScriptGeneratorModal';
import { VideoRecorderExport } from './components/VideoRecorderExport';
import { YouTubeExporterModal } from './components/YouTubeExporterModal';
import { CharacterCustomizer } from './components/CharacterCustomizer';
import { ThemeSongSelectorModal } from './components/ThemeSongSelectorModal';
import { TvBroadcastModal } from './components/TvBroadcastModal';
import { AudioDspMixerModal } from './components/AudioDspMixerModal';
import { RemotionExportModal } from './components/RemotionExportModal';
import { speakDialogueLine, playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playThemeSongIntro } from './utils/audioSynthesizer';
import {
  Sparkles,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Film,
  Youtube,
  Wand2,
  Tv,
  Users,
  Code2,
  Download,
  Volume2,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  Maximize2,
  Music,
  Eye,
  EyeOff,
  FileText,
  Sliders,
} from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<CartoonProject>(() => {
    const saved = localStorage.getItem('cartoon_code_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Error loading saved project:', e);
      }
    }
    return PRESET_CARTOONS[0];
  });

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenes' | 'characters' | 'youtube'>('scenes');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [isThemeSongModalOpen, setIsThemeSongModalOpen] = useState(false);
  const [isTvModalOpen, setIsTvModalOpen] = useState(false);
  const [isDspModalOpen, setIsDspModalOpen] = useState(false);
  const [isRemotionModalOpen, setIsRemotionModalOpen] = useState(false);
  const [isScriptPanelHidden, setIsScriptPanelHidden] = useState(false);

  const speechCancelRef = useRef<(() => void) | null>(null);
  const isPlayingRef = useRef(false);

  // Save project state to localStorage
  useEffect(() => {
    localStorage.setItem('cartoon_code_project', JSON.stringify(project));
  }, [project]);

  // Handle Playback Loop
  const playCurrentScene = async (index: number) => {
    // START OF SHOW: If starting at scene 0 and scene 0 is not marked as theme song, play Theme Song Intro first
    if (index === 0 && !project.scenes[0]?.isThemeSong && isPlayingRef.current) {
      setIsSpeaking(true);
      playSoundEffect('tada');
      await new Promise<void>((resolve) => {
        speechCancelRef.current?.();
        let hasResolved = false;
        const safeResolve = () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve();
          }
        };

        const themeKey = project.scenes[0]?.themeSongKey || 'lets_code_together';
        const handle = playThemeSongIntro(
          themeKey,
          project.characters[0]?.name || 'Creator',
          project.characters[1]?.name || 'Buddy',
          undefined,
          () => safeResolve()
        );

        speechCancelRef.current = handle.cancel;
        setTimeout(() => safeResolve(), 7000);
      });
      setIsSpeaking(false);
      if (!isPlayingRef.current) return;
    }

    if (index >= project.scenes.length) {
      // END OF SHOW: Play Outro Theme Song Finale & Subscribe Celebration
      if (isPlayingRef.current) {
        setIsSpeaking(true);
        playSoundEffect('tada');

        const themeKey = project.scenes[0]?.themeSongKey || 'spongebob';
        await new Promise<void>((resolve) => {
          speechCancelRef.current?.();
          let hasResolved = false;
          const safeResolve = () => {
            if (!hasResolved) {
              hasResolved = true;
              resolve();
            }
          };

          const handle = playThemeSongIntro(
            themeKey,
            project.characters[0]?.name || 'Creator',
            project.characters[1]?.name || 'Buddy',
            undefined,
            () => safeResolve()
          );

          speechCancelRef.current = handle.cancel;
          setTimeout(() => safeResolve(), 7000);
        });

        setIsSpeaking(false);
      }

      setIsPlaying(false);
      isPlayingRef.current = false;
      stopBackgroundMusic();
      return;
    }

    setActiveSceneIndex(index);
    const scene = project.scenes[index];
    if (!scene) return;

    setIsSpeaking(true);

    // Play Sound Effect
    if (scene.soundEffect && scene.soundEffect !== 'none') {
      playSoundEffect(scene.soundEffect);
    }

    const speaker =
      project.characters.find((c) => c.id === scene.speakerId) || project.characters[0];

    // Play Music / Theme Song Scene vs Dialogue Speech
    if (scene.isMusicOnly || scene.isThemeSong || scene.themeSongKey) {
      await new Promise<void>((resolve) => {
        speechCancelRef.current?.();
        let hasResolved = false;
        const safeResolve = () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve();
          }
        };

        const themeKey = scene.themeSongKey || 'lets_code_together';
        const handle = playThemeSongIntro(
          themeKey,
          project.characters[0]?.name || 'Teacher',
          project.characters[1]?.name || 'Student',
          undefined,
          () => safeResolve()
        );

        speechCancelRef.current = handle.cancel;

        // Safety fallback timer for theme music scene
        setTimeout(() => safeResolve(), 8000);
      });
    } else {
      // Speak Dialogue
      await new Promise<void>((resolve) => {
        speechCancelRef.current?.();
        let hasResolved = false;
        const safeResolve = () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve();
          }
        };

        const customAudio = scene.audioUrl;

        const speech = speakDialogueLine(
          scene.dialogue,
          speaker?.voicePitch ?? 1.0,
          speaker?.voiceRate ?? 1.0,
          speaker?.style ?? 'dog',
          () => safeResolve(),
          customAudio,
          speaker?.preferredVoiceName
        );
        speechCancelRef.current = speech.cancel;

        // Safety fallback timer if speech synthesis or custom audio fails/hangs
        const safetyTimeout = customAudio ? 12000 : Math.max(4000, scene.dialogue.length * 90 + 2000);
        setTimeout(() => safeResolve(), safetyTimeout);
      });
    }

    setIsSpeaking(false);

    // If still in playing mode, move to next scene
    if (isPlayingRef.current) {
      await new Promise((r) => setTimeout(r, 600));
      if (isPlayingRef.current) {
        playCurrentScene(index + 1);
      }
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setIsSpeaking(false);
      speechCancelRef.current?.();
      stopBackgroundMusic();
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      startBackgroundMusic(project.bgMusicTrack, project.bgMusicVolume);
      playCurrentScene(activeSceneIndex);
    }
  };

  const handleNextScene = () => {
    speechCancelRef.current?.();
    setIsSpeaking(false);
    const nextIdx = (activeSceneIndex + 1) % project.scenes.length;
    setActiveSceneIndex(nextIdx);
    if (isPlaying) {
      playCurrentScene(nextIdx);
    }
  };

  const handlePrevScene = () => {
    speechCancelRef.current?.();
    setIsSpeaking(false);
    const prevIdx = (activeSceneIndex - 1 + project.scenes.length) % project.scenes.length;
    setActiveSceneIndex(prevIdx);
    if (isPlaying) {
      playCurrentScene(prevIdx);
    }
  };

  // Scene Editors
  const handleUpdateScene = (sceneIndex: number, updatedScene: Partial<RoleplayScene>) => {
    const updatedScenes = [...project.scenes];
    updatedScenes[sceneIndex] = { ...updatedScenes[sceneIndex], ...updatedScene };
    setProject({ ...project, scenes: updatedScenes });
  };

  const handleAddScene = () => {
    const newScene: RoleplayScene = {
      id: 'scene-' + Date.now(),
      speakerId: project.characters[0].id,
      listenerId: project.characters[1].id,
      dialogue: 'Woof! Let us learn another cool coding trick!',
      speakerEmotion: 'happy',
      listenerEmotion: 'thinking',
      background: project.scenes[activeSceneIndex]?.background || 'bakery',
      soundEffect: 'pop',
      actionEffect: 'none',
    };
    setProject({ ...project, scenes: [...project.scenes, newScene] });
    setActiveSceneIndex(project.scenes.length);
  };

  const handleDeleteScene = (sceneIndex: number) => {
    if (project.scenes.length <= 1) return;
    const updated = project.scenes.filter((_, idx) => idx !== sceneIndex);
    setProject({ ...project, scenes: updated });
    setActiveSceneIndex(Math.max(0, sceneIndex - 1));
  };

  const handleReorderScene = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= project.scenes.length) return;
    const updated = [...project.scenes];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setProject({ ...project, scenes: updated });
    setActiveSceneIndex(toIndex);
  };

  const handleUpdateCharacter = (charId: string, updated: Partial<Character>) => {
    const updatedChars = project.characters.map((c) =>
      c.id === charId ? { ...c, ...updated } : c
    );
    setProject({ ...project, characters: updatedChars });
  };

  const handleAddCharacter = () => {
    const stylesList: Character['style'][] = ['dragon', 'wizard', 'astronaut', 'alien', 'cat', 'robot', 'dog', 'presenter_female', 'presenter_male'];
    const chosenStyle = stylesList[project.characters.length % stylesList.length];
    const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#ef4444', '#0284c7', '#a855f7'];
    const chosenColor = colors[project.characters.length % colors.length];

    const newChar: Character = {
      id: 'char-' + Date.now(),
      name: `Character ${project.characters.length + 1}`,
      role: 'Co-Host',
      style: chosenStyle,
      color: chosenColor,
      voicePitch: 1.1,
      voiceRate: 1.0,
    };

    setProject({ ...project, characters: [...project.characters, newChar] });
  };

  const handleSetCastCount = (targetCount: number) => {
    if (targetCount <= 0) return;
    const currentCount = project.characters.length;
    if (targetCount === currentCount) return;

    if (targetCount < currentCount) {
      const remainingChars = project.characters.slice(0, targetCount);
      const remainingIds = new Set(remainingChars.map((c) => c.id));

      const updatedScenes = project.scenes.map((sc) => {
        let newSpeaker = sc.speakerId;
        let newListener = sc.listenerId;
        if (!remainingIds.has(newSpeaker)) newSpeaker = remainingChars[0].id;
        if (!remainingIds.has(newListener)) newListener = remainingChars[1]?.id || remainingChars[0].id;
        return { ...sc, speakerId: newSpeaker, listenerId: newListener };
      });

      setProject({ ...project, characters: remainingChars, scenes: updatedScenes });
    } else {
      const stylesList: Character['style'][] = ['dragon', 'wizard', 'astronaut', 'alien', 'cat', 'robot', 'dog', 'presenter_female', 'presenter_male'];
      const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#ef4444', '#0284c7', '#a855f7'];
      const roles = ['Host / Presenter', 'Co-Host / Buddy', 'Guest Specialist', 'Cartoon Critic'];

      const newChars = [...project.characters];
      for (let i = currentCount; i < targetCount; i++) {
        const chosenStyle = stylesList[i % stylesList.length];
        const chosenColor = colors[i % colors.length];
        const chosenRole = roles[i % roles.length];
        newChars.push({
          id: 'char-' + Date.now() + '-' + i,
          name: `Character ${i + 1}`,
          role: chosenRole,
          style: chosenStyle,
          color: chosenColor,
          voicePitch: Number((1.0 + (i % 3) * 0.15).toFixed(2)),
          voiceRate: 1.0,
        });
      }

      setProject({ ...project, characters: newChars });
    }
  };

  const handleDeleteCharacter = (charId: string) => {
    if (project.characters.length <= 1) return;
    const updatedChars = project.characters.filter((c) => c.id !== charId);
    const updatedScenes = project.scenes.map((sc) => {
      let newSpeaker = sc.speakerId;
      let newListener = sc.listenerId;
      if (newSpeaker === charId) newSpeaker = updatedChars[0].id;
      if (newListener === charId) newListener = updatedChars[1]?.id || updatedChars[0].id;
      return { ...sc, speakerId: newSpeaker, listenerId: newListener };
    });
    setProject({ ...project, characters: updatedChars, scenes: updatedScenes });
  };

  const currentScene = project.scenes[activeSceneIndex] || project.scenes[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white pb-12">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Title Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-950">
            <Tv className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
              Cartoon Studio 🎬
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Edu & Tech Studio
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Create roleplay cartoons on ANY topic (Cybersecurity, Cloud, AI, Science, Math, Coding & more) & export for YouTube!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Preset Cartoon Picker */}
          <select
            onChange={(e) => {
              const preset = PRESET_CARTOONS.find((p) => p.id === e.target.value);
              if (preset) {
                setProject(preset);
                setActiveSceneIndex(0);
                setIsPlaying(false);
              }
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">📚 Load Preset Episode...</option>
            {PRESET_CARTOONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* AI Script Generator Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Wand2 className="w-4 h-4 text-yellow-300" />
            AI Script Generator
          </button>

          {/* TV Broadcast Studio Button */}
          <button
            onClick={() => setIsTvModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 rounded-xl text-xs font-black text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Configure Television Broadcast 1080p standards & Launch TV Cinema Mode"
          >
            <Tv className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>📺 Play on TV Studio</span>
          </button>

          {/* Theme Song Sing-Along Selector Button */}
          <button
            onClick={() => setIsThemeSongModalOpen(true)}
            className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 rounded-xl text-xs font-black text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition-all hover:scale-105 active:scale-95"
            title="Choose Theme Song / Medley & Set Scene 1"
          >
            <Music className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>🎵 Theme Songs & Medleys</span>
          </button>

          {/* Expand Screen Button */}
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-cartoon-fullscreen'))}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 border border-purple-400/50 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-lg shadow-purple-950 transition-all hover:scale-105 active:scale-95"
            title="Expand stage to fit entire laptop screen for recording"
          >
            <Maximize2 className="w-4 h-4 text-yellow-300" />
            <span>Expand Screen</span>
          </button>

          {/* YouTube Upload / Post Button */}
          <a
            href="https://studio.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-lg shadow-red-950 transition-all hover:scale-105 active:scale-95"
            title="Open YouTube Studio to post video"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Post to YouTube</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          {/* My YouTube Channel Link Button */}
          <a
            href={
              project.youtubeChannelUrl
                ? project.youtubeChannelUrl.startsWith('http')
                  ? project.youtubeChannelUrl
                  : `https://${project.youtubeChannelUrl}`
                : 'https://www.youtube.com'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-red-400 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            title="Visit your YouTube channel"
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>My Channel</span>
            <ExternalLink className="w-3 h-3 opacity-70 text-slate-400" />
          </a>

          {/* YouTube Upload Kit Modal Button */}
          <button
            onClick={() => setIsYoutubeModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-red-500/50 rounded-xl text-xs font-extrabold text-slate-200 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <Youtube className="w-4 h-4 text-red-400" />
            YouTube Kit & Setup
          </button>
        </div>
      </header>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CARTOON STAGE & VIDEO PLAYER (Collapses to full width when script editor panel is hidden) */}
          <div className={`${isScriptPanelHidden ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-4 transition-all duration-300`}>
            {/* CARTOON STAGE */}
            <CartoonStage
              project={project}
              currentScene={currentScene}
              currentSceneIndex={activeSceneIndex}
              totalScenes={project.scenes.length}
              isSpeaking={isSpeaking}
              isPlaying={isPlaying}
              onNextScene={handleNextScene}
              onPrevScene={handlePrevScene}
              onTogglePlay={togglePlayback}
              onUpdateScene={handleUpdateScene}
            />

            {/* INTERACTIVE VISUAL TIMELINE & PARALLAX STAGE CONTROLLER */}
            <VisualTimelineCanvas
              project={project}
              currentSceneIndex={activeSceneIndex}
              isPlaying={isPlaying}
              isSpeaking={isSpeaking}
              onSelectScene={(idx) => setActiveSceneIndex(idx)}
              onUpdateScene={handleUpdateScene}
              onTogglePlay={togglePlayback}
              onNextScene={handleNextScene}
              onPrevScene={handlePrevScene}
            />

            {/* STAGE CONTROLLER BAR */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevScene}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200"
                  title="Previous Scene"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlayback}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 text-white shadow-lg transition-all ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" /> Pause Playback
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" /> Play Cartoon Episode
                    </>
                  )}
                </button>

                <button
                  onClick={handleNextScene}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200"
                  title="Next Scene"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* HIDE / SHOW SCRIPT PANEL TOGGLE */}
                <button
                  onClick={() => setIsScriptPanelHidden(!isScriptPanelHidden)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 border ${
                    isScriptPanelHidden
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title={isScriptPanelHidden ? 'Show Script & Studio Editor Panel' : 'Hide Script Editor Panel to view full screen video'}
                >
                  {isScriptPanelHidden ? <Eye className="w-4 h-4 text-yellow-300" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                  <span>{isScriptPanelHidden ? 'Show Script Panel' : 'Hide Script Panel'}</span>
                </button>

                <button
                  onClick={() => setIsThemeSongModalOpen(true)}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 rounded-xl text-xs font-black text-slate-950 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  title="Choose Theme Songs & Medleys for Episode"
                >
                  <Music className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>🎵 Theme Songs</span>
                </button>

                <button
                  onClick={() => setIsDspModalOpen(true)}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-md active:scale-95"
                  title="Configure 4-track Web Audio DSP Mixer, compressor & reverb"
                >
                  <Sliders className="w-4 h-4 text-cyan-300" />
                  <span>🎛️ Audio DSP</span>
                </button>

                <button
                  onClick={() => setIsRemotionModalOpen(true)}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 rounded-xl text-xs font-black text-slate-950 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  title="Export Remotion 1080p/4K Video @ 24fps with TV Safe Areas & YouTube Chapters"
                >
                  <Film className="w-4 h-4 text-slate-950" />
                  <span>🎬 Remotion 4K Export</span>
                </button>

                <button
                  onClick={() => window.dispatchEvent(new Event('toggle-cartoon-fullscreen'))}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-md active:scale-95"
                  title="Expand stage to fit entire laptop screen for recording"
                >
                  <Maximize2 className="w-4 h-4 text-yellow-300" />
                  <span>Expand Screen</span>
                </button>
              </div>

              {/* Sound Effect Quick Test */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Test SFX:</span>
                <button
                  onClick={() => playSoundEffect('magic')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg text-xs font-semibold"
                >
                  ✨ Magic
                </button>
                <button
                  onClick={() => playSoundEffect('tada')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-lg text-xs font-semibold"
                >
                  🎉 Tada
                </button>
              </div>
            </div>

            {/* VIDEO EXPORT RENDERER CONTROLLER */}
            <VideoRecorderExport
              project={project}
              onRecordStart={() => setIsPlaying(true)}
              onRecordSceneChange={(idx, speaking) => {
                setActiveSceneIndex(idx);
                setIsSpeaking(speaking);
              }}
              onRecordEnd={() => {
                setIsPlaying(false);
                setIsSpeaking(false);
              }}
            />
          </div>

          {/* RIGHT 5 COLS: STUDIO EDITING TABS (Can be hidden/shown) */}
          {!isScriptPanelHidden && (
            <div className="lg:col-span-5 space-y-4 animate-in fade-in zoom-in duration-200">
              {/* SUB TAB SELECTOR */}
              <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex gap-1 shadow-lg">
              <button
                onClick={() => setActiveTab('scenes')}
                className={`flex-1 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'scenes'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Scenes
              </button>
              <button
                onClick={() => setActiveTab('characters')}
                className={`flex-1 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'characters'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Cast & Photo Upload 📸
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                className={`flex-1 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'youtube'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                YouTube Details
              </button>
            </div>

            {/* TAB CONTENT: SCENES EDITOR */}
            {activeTab === 'scenes' && (
              <SceneEditor
                project={project}
                activeSceneIndex={activeSceneIndex}
                onSelectScene={(idx) => setActiveSceneIndex(idx)}
                onUpdateScene={handleUpdateScene}
                onAddScene={handleAddScene}
                onDeleteScene={handleDeleteScene}
                onReorderScene={handleReorderScene}
                onUpdateCharacter={handleUpdateCharacter}
              />
            )}

            {/* TAB CONTENT: CHARACTER CUSTOMIZER */}
            {activeTab === 'characters' && (
              <CharacterCustomizer
                project={project}
                onUpdateCharacter={handleUpdateCharacter}
                onAddCharacter={handleAddCharacter}
                onDeleteCharacter={handleDeleteCharacter}
                onSetCastCount={handleSetCastCount}
              />
            )}

            {/* TAB CONTENT: YOUTUBE DETAILS */}
            {activeTab === 'youtube' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    YouTube Episode Info
                  </h3>
                  <button
                    onClick={() => setIsYoutubeModalOpen(true)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white"
                  >
                    Open Full Export Kit
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Episode Title</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => setProject({ ...project, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Educational Topic</label>
                    <input
                      type="text"
                      value={project.topic}
                      onChange={(e) => setProject({ ...project, topic: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-yellow-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Background Music Track</label>
                    <select
                      value={project.bgMusicTrack}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          bgMusicTrack: e.target.value as any,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white capitalize"
                    >
                      <option value="playful font-medium">🎵 Playful Cartoon C-Major</option>
                      <option value="upbeat">⚡ Upbeat D-Major</option>
                      <option value="8bit_arcade">🕹️ 8-Bit Retro Arcade</option>
                      <option value="magic_mystery">🔮 Magical Mystery</option>
                      <option value="none">🔇 No Music</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      <ScriptGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onScriptGenerated={(newProjData) => {
          setProject({
            ...project,
            ...newProjData,
          });
          setActiveSceneIndex(0);
        }}
      />

      <YouTubeExporterModal
        isOpen={isYoutubeModalOpen}
        onClose={() => setIsYoutubeModalOpen(false)}
        project={project}
        onUpdateMetadata={(meta) =>
          setProject({
            ...project,
            youtubeMetadata: meta,
          })
        }
        onUpdateProject={(updated) =>
          setProject({
            ...project,
            ...updated,
          })
        }
      />

      <ThemeSongSelectorModal
        isOpen={isThemeSongModalOpen}
        onClose={() => setIsThemeSongModalOpen(false)}
        project={project}
        onUpdateProject={(updated) => setProject(updated)}
      />

      <TvBroadcastModal
        isOpen={isTvModalOpen}
        onClose={() => setIsTvModalOpen(false)}
        project={project}
        onUpdateProject={(updated) =>
          setProject({
            ...project,
            ...updated,
          })
        }
        onStartTvPresentation={() => {
          window.dispatchEvent(new Event('toggle-cartoon-fullscreen'));
          setIsPlaying(true);
          playCurrentScene(0);
        }}
      />

      <AudioDspMixerModal
        isOpen={isDspModalOpen}
        onClose={() => setIsDspModalOpen(false)}
        isSpeaking={isSpeaking}
      />

      <RemotionExportModal
        isOpen={isRemotionModalOpen}
        onClose={() => setIsRemotionModalOpen(false)}
        project={project}
      />
    </div>
  );
}
