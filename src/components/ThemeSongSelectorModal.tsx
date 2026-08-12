import React, { useState } from 'react';
import { Music, Disc, Sparkles, Play, Check, X, PlusCircle, Volume2, Star } from 'lucide-react';
import { THEME_SONG_PRESETS, ThemeSongConfig, playThemeSongIntro } from '../utils/audioSynthesizer';
import { CartoonProject, RoleplayScene } from '../types';

interface ThemeSongSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CartoonProject;
  onUpdateProject: (updatedProject: CartoonProject) => void;
}

export const ThemeSongSelectorModal: React.FC<ThemeSongSelectorModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>('sunshine_parade');
  const [filterType, setFilterType] = useState<'all' | 'intros' | 'outros' | 'real_studio' | 'instrumental' | 'vocal'>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(0);
  const [canceller, setCanceller] = useState<{ cancel: () => void } | null>(null);

  if (!isOpen) return null;

  const filteredThemes = Object.entries(THEME_SONG_PRESETS).filter(([_, config]) => {
    if (filterType === 'intros') return config.categoryType === 'intro';
    if (filterType === 'outros') return config.categoryType === 'outro';
    if (filterType === 'real_studio') return config.isRealStudio;
    if (filterType === 'instrumental') return config.isInstrumental && !config.isRealStudio;
    if (filterType === 'vocal') return !config.isInstrumental;
    return true;
  });

  const handlePlayPreview = (key: string) => {
    if (canceller) canceller.cancel();
    setSelectedThemeKey(key);
    setIsPlaying(true);
    setActiveLyricIndex(0);

    const char1 = project.characters[0]?.name || 'Teacher';
    const char2 = project.characters[1]?.name || 'Student';

    const handle = playThemeSongIntro(
      key,
      char1,
      char2,
      (idx) => setActiveLyricIndex(idx),
      () => {
        setIsPlaying(false);
        setCanceller(null);
      }
    );
    setCanceller(handle);
  };

  const handleStopPreview = () => {
    if (canceller) canceller.cancel();
    setIsPlaying(false);
    setCanceller(null);
  };

  const handleApplyTheme = (themeKey: string, position: 'intro' | 'outro') => {
    const config = THEME_SONG_PRESETS[themeKey] || THEME_SONG_PRESETS.lets_code_together;
    const char1 = project.characters[0]?.id || 'char-1';
    const char2 = project.characters[1]?.id || 'char-2';

    // Create a music-only theme song scene
    const newThemeScene: RoleplayScene = {
      id: `theme-sc-${Date.now()}`,
      speakerId: char1,
      listenerId: char2,
      dialogue: position === 'intro' ? "Welcome to the show! 💻 🌟" : "Thanks for watching! See you next episode! 🎬 ✨",
      speakerEmotion: 'happy',
      listenerEmotion: 'celebrating',
      background: project.scenes[0]?.background || 'tv_studio',
      soundEffect: 'tada',
      actionEffect: 'bounce',
      isThemeSong: true,
      isMusicOnly: true,
      themeSongKey: themeKey,
      codeSnippet: `// 🎵 EPISODE ${position.toUpperCase()} THEME MUSIC
function ${position}Music() {
  console.log("PLAYING: ${config.title.replace(/"/g, '')}");
  return "${position === 'intro' ? 'WELCOME TO THE SHOW!' : 'THANKS FOR WATCHING! LIKE & SUBSCRIBE!'}";
}`,
      codeHighlight: config.title,
    };

    let updatedScenes: RoleplayScene[] = [];
    if (position === 'intro') {
      const nonIntroThemeScenes = project.scenes.filter((s) => !s.isThemeSong || s.id.includes('outro'));
      updatedScenes = [newThemeScene, ...nonIntroThemeScenes];
    } else {
      const nonOutroThemeScenes = project.scenes.filter((s) => !s.isThemeSong || !s.id.includes('outro'));
      updatedScenes = [...nonOutroThemeScenes, newThemeScene];
    }

    onUpdateProject({
      ...project,
      scenes: updatedScenes,
    });

    handleStopPreview();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-yellow-400/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-400 text-slate-950 rounded-2xl shadow-lg animate-bounce">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-yellow-300 tracking-wide flex items-center gap-2">
                🎵 CHOOSE EPISODE THEME SONG / MELODY
              </h2>
              <p className="text-xs font-semibold text-slate-300">
                Select a catchy pure instrumental melody or sing-along anthem to start your cartoon episode!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopPreview();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              filterType === 'all'
                ? 'bg-yellow-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌈 All Themes ({Object.keys(THEME_SONG_PRESETS).length})
          </button>

          <button
            onClick={() => setFilterType('intros')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
              filterType === 'intros'
                ? 'bg-emerald-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
            }`}
          >
            ☀️ Intro Themes
          </button>

          <button
            onClick={() => setFilterType('outros')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
              filterType === 'outros'
                ? 'bg-purple-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
            }`}
          >
            🎬 Outro Themes
          </button>

          <button
            onClick={() => setFilterType('real_studio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
              filterType === 'real_studio'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            🎙️ Real Studio Shows
          </button>

          <button
            onClick={() => setFilterType('instrumental')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
              filterType === 'instrumental'
                ? 'bg-cyan-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎷 Pure Melodies
          </button>

          <button
            onClick={() => setFilterType('vocal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
              filterType === 'vocal'
                ? 'bg-pink-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎤 Sing-Along Anthems
          </button>
        </div>

        {/* List of Theme Songs / Melodies */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-1">
          {filteredThemes.map(([key, config]) => {
            const isSelected = selectedThemeKey === key;
            const isCurrentlyPlaying = isPlaying && isSelected;

            return (
              <div
                key={key}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-950/60 border-yellow-400 shadow-lg shadow-purple-950'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-base text-yellow-300">{config.title}</span>
                    {config.isRealStudio && (
                      <span className="bg-amber-400/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        🎙️ REAL STUDIO SHOW
                      </span>
                    )}
                    {config.isInstrumental && !config.isRealStudio && (
                      <span className="bg-cyan-400/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        🎷 PURE MELODY (NO VOICE)
                      </span>
                    )}
                    {!config.isInstrumental && (
                      <span className="bg-pink-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        🎤 SING-ALONG ANTHEM
                      </span>
                    )}
                    {key === 'lets_code_together' && (
                      <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" /> FLAGSHIP ANTHEM
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-300 leading-relaxed italic">
                    "{config.lyrics[0]?.callout} ... {config.lyrics[0]?.response}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
                  {/* Play Preview Button */}
                  <button
                    onClick={() => {
                      if (isCurrentlyPlaying) {
                        handleStopPreview();
                      } else {
                        handlePlayPreview(key);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      isCurrentlyPlaying
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-yellow-400 text-slate-950 hover:bg-yellow-300'
                    }`}
                  >
                    {isCurrentlyPlaying ? (
                      <>
                        <Disc className="w-4 h-4 animate-spin" /> Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950" /> Preview
                      </>
                    )}
                  </button>

                  {/* Set as Intro Button */}
                  <button
                    onClick={() => handleApplyTheme(key, 'intro')}
                    className="px-2.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1 transition-all shadow-md active:scale-95"
                    title="Insert as Scene 1 Intro music"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Set as Intro
                  </button>

                  {/* Set as Outro Button */}
                  <button
                    onClick={() => handleApplyTheme(key, 'outro')}
                    className="px-2.5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-black rounded-xl flex items-center gap-1 transition-all shadow-md active:scale-95"
                    title="Append as Final Outro music scene"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    Set as Outro
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5 text-yellow-300">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Tip: Setting a theme song as Scene 1 makes every episode feel like a real TV show!
          </span>
          <button
            onClick={() => {
              handleStopPreview();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-extrabold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
