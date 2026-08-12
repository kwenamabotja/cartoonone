import React from 'react';
import { CartoonProject, Character, RoleplayScene, ExpressionType, SoundEffectType, BackgroundTheme, ActionEffectType, SceneTransitionType } from '../types';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, Sparkles, MessageSquare, Code, Volume2, Smile, Mic, Radio, Upload, Image, Eye, EyeOff, Film } from 'lucide-react';
import { MicrophoneVoiceRecorder } from './MicrophoneVoiceRecorder';
import { speakDialogueLine } from '../utils/audioSynthesizer';

interface SceneEditorProps {
  project: CartoonProject;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateScene: (sceneIndex: number, updatedScene: Partial<RoleplayScene>) => void;
  onAddScene: () => void;
  onDeleteScene: (sceneIndex: number) => void;
  onReorderScene: (fromIndex: number, toIndex: number) => void;
  onUpdateCharacter?: (charId: string, updated: Partial<Character>) => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateScene,
  onAddScene,
  onDeleteScene,
  onReorderScene,
  onUpdateCharacter,
}) => {
  const activeScene = project.scenes[activeSceneIndex] || project.scenes[0];

  if (!activeScene) return null;

  const charA = project.characters[0];
  const charB = project.characters[1];
  const activeSpeaker =
    project.characters.find((c) => c.id === activeScene.speakerId) || charA;

  const emotions: ExpressionType[] = [
    'happy',
    'thinking',
    'explaining',
    'surprised',
    'confused',
    'laughing',
    'celebrating',
    'angry',
    'wink',
    'sad',
  ];

  const soundEffects: SoundEffectType[] = [
    'none',
    'pop',
    'robot_beep',
    'magic',
    'tada',
    'bounce',
    'success',
    'giggle',
    'whistle',
  ];

  const actionEffects: { id: ActionEffectType; label: string; icon: string }[] = [
    { id: 'none', label: 'Idle Pose', icon: '🧍' },
    { id: 'point', label: 'Point Gesture', icon: '👉' },
    { id: 'wave', label: 'Wave Hello', icon: '👋' },
    { id: 'thumbsup', label: 'Thumbs Up', icon: '👍' },
    { id: 'sit', label: 'Sit Down', icon: '🪑' },
    { id: 'turn', label: 'Turn Around', icon: '🔄' },
    { id: 'walk', label: 'Walk Stroll', icon: '🚶' },
    { id: 'run', label: 'Run Fast', icon: '🏃' },
    { id: 'jump', label: 'High Jump', icon: '🦘' },
    { id: 'fly', label: 'Fly & Soar', icon: '🛸' },
    { id: 'dance', label: 'Cartoon Dance', icon: '💃' },
    { id: 'flip', label: '360 Flip', icon: '🌀' },
    { id: 'bounce', label: 'Spring Bounce', icon: '✨' },
    { id: 'shake', label: 'Funny Jitter', icon: '🫨' },
    { id: 'float', label: 'Hover Float', icon: '🎈' },
    { id: 'zoom', label: 'Zoom In', icon: '🔍' },
    { id: 'spin', label: 'Spin Whirl', icon: '💫' },
  ];

  const sceneTransitions: { id: SceneTransitionType; label: string; icon: string; desc: string }[] = [
    { id: 'none', label: 'Cut (None)', icon: '✂️', desc: 'Instant cut' },
    { id: 'fade', label: 'Fade Dissolve', icon: '✨', desc: 'Smooth opacity' },
    { id: 'slide', label: 'Slide Pan', icon: '↔️', desc: 'Horizontal slide' },
    { id: 'zoom', label: 'Zoom Punch', icon: '🔍', desc: 'Scale zoom in/out' },
    { id: 'wipe', label: 'Wipe Clean', icon: '🧹', desc: 'Horizontal curtain' },
    { id: 'bounce', label: 'Pop Bounce', icon: '💥', desc: 'Spring bounce enter' },
  ];

  const realPersonThemes: { id: BackgroundTheme; label: string; icon: string }[] = [
    { id: 'tv_studio', label: 'TV Broadcast Studio', icon: '📺' },
    { id: 'tech_conference', label: 'Tech Summit Stage', icon: '⚡' },
    { id: 'podcast_booth', label: 'Podcast Booth', icon: '🎙️' },
    { id: 'modern_office', label: 'Executive Office', icon: '🌆' },
    { id: 'server_room', label: 'Cyber Data Center', icon: '🗄️' },
    { id: 'lecture_hall', label: 'Lecture Auditorium', icon: '🎓' },
  ];

  const cartoonThemes: { id: BackgroundTheme; label: string; icon: string }[] = [
    { id: 'tech_lab', label: 'Tech & Code Lab', icon: '💻' },
    { id: 'cyber_grid', label: 'Cyber Matrix', icon: '🤖' },
    { id: 'classroom', label: 'Classroom', icon: '🏫' },
    { id: 'space', label: 'Deep Space', icon: '🪐' },
    { id: 'magic_lab', label: 'Magic Lab', icon: '🔮' },
    { id: 'bakery', label: 'Bakery Shop', icon: '🧁' },
    { id: 'jungle', label: 'Jungle Safari', icon: '🌴' },
    { id: 'beach', label: 'Beach Island', icon: '🏖️' },
    { id: 'underwater', label: 'Underwater', icon: '🐙' },
    { id: 'candy_land', label: 'Candy Land', icon: '🍭' },
    { id: 'castle', label: 'Royal Castle', icon: '🏰' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-6">
      {/* Scene Timeline Horizontal Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Storyboard Scenes ({project.scenes.length})
          </h3>
          <button
            onClick={onAddScene}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Scene
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-600">
          {project.scenes.map((scene, idx) => {
            const speakerChar = project.characters.find((c) => c.id === scene.speakerId) || project.characters[0];
            const speakerName = speakerChar?.name || 'Character';
            const speakerColor = speakerChar?.color || '#3b82f6';
            const isActive = idx === activeSceneIndex;

            return (
              <button
                key={scene.id || idx}
                onClick={() => onSelectScene(idx)}
                className={`flex-shrink-0 w-36 p-2.5 rounded-xl border text-left transition-all relative ${
                  isActive
                    ? 'bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/50 shadow-lg'
                    : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="font-extrabold text-slate-400">#{idx + 1}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white truncate max-w-[80px]"
                    style={{ backgroundColor: speakerColor }}
                  >
                    {speakerName}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 italic font-medium">
                  "{scene.dialogue}"
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Scene Detailed Editor Form */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-slate-200">
            Editing Scene #{activeSceneIndex + 1}
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReorderScene(activeSceneIndex, activeSceneIndex - 1)}
              disabled={activeSceneIndex === 0}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300"
              title="Move Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReorderScene(activeSceneIndex, activeSceneIndex + 1)}
              disabled={activeSceneIndex === project.scenes.length - 1}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300"
              title="Move Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteScene(activeSceneIndex)}
              disabled={project.scenes.length <= 1}
              className="p-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800 disabled:opacity-30 rounded-lg text-red-300"
              title="Delete Scene"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speaker & Listener Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Speaker Character</label>
            <select
              value={activeScene.speakerId}
              onChange={(e) => {
                const newSpeakerId = e.target.value;
                let newListenerId = activeScene.listenerId;
                if (newListenerId === newSpeakerId) {
                  const other = project.characters.find((c) => c.id !== newSpeakerId);
                  if (other) newListenerId = other.id;
                }
                onUpdateScene(activeSceneIndex, { speakerId: newSpeakerId, listenerId: newListenerId });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-yellow-400"
            >
              {project.characters.map((char) => (
                <option key={char.id} value={char.id}>
                  🗣️ {char.name} ({char.role || char.style})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Listener Character</label>
            <select
              value={activeScene.listenerId}
              onChange={(e) => {
                onUpdateScene(activeSceneIndex, { listenerId: e.target.value });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-yellow-400"
            >
              {project.characters.length === 1 ? (
                <option value={project.characters[0].id}>👥 Stage Audience / Camera</option>
              ) : (
                project.characters
                  .filter((c) => c.id !== activeScene.speakerId)
                  .map((char) => (
                    <option key={char.id} value={char.id}>
                      👂 {char.name} ({char.role || char.style})
                    </option>
                  ))
              )}
            </select>
          </div>
        </div>

          {/* Background Theme */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-purple-300">Scene Background Theme</label>
              <button
                type="button"
                onClick={() => {
                  const currentBg = activeScene.background;
                  project.scenes.forEach((_, idx) => {
                    onUpdateScene(idx, { background: currentBg });
                  });
                }}
                className="text-[10px] font-extrabold text-yellow-300 hover:text-yellow-200 bg-purple-900/60 border border-purple-500/40 px-2 py-0.5 rounded-md transition-all active:scale-95"
                title="Apply this selected background theme to every scene in the cartoon episode"
              >
                ✨ Apply to ALL Scenes
              </button>
            </div>
            <select
              value={activeScene.background}
              onChange={(e) => {
                const newBg = e.target.value as BackgroundTheme;
                onUpdateScene(activeSceneIndex, { background: newBg });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
            >
              <option value="classroom">🎓 Cartoon Classroom</option>
              <option value="space">🪐 Outer Space Rocket</option>
              <option value="bakery">🧁 Bakery & Kitchen</option>
              <option value="magic_lab">🔮 Wizard Magic Academy</option>
              <option value="tech_lab">💻 Tech & Code Lab</option>
              <option value="cyber_grid">🤖 Cyber Hologram Lab</option>
              <option value="jungle">🌴 Treasure Island Jungle</option>
              <option value="beach">🏖️ Sunny Beach Island</option>
              <option value="underwater">🐙 Underwater Ocean Realm</option>
              <option value="candy_land">🍭 Candy Land Kingdom</option>
              <option value="castle">🏰 Royal Castle Kingdom</option>
              <option value="greenscreen">🟩 Studio Green Screen / Chroma Key</option>
            </select>
          </div>

          {/* Green Screen & Custom Upload Media Section */}
          <div className="bg-slate-900/90 border border-emerald-500/40 p-3.5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Upload className="w-4 h-4 text-emerald-400" />
                Green Screen & Custom Asset Upload
              </span>
              {activeScene.customBackgroundUrl ? (
                <span className="text-emerald-400 text-[10px] font-black bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  ✓ Custom Asset Active
                </span>
              ) : (
                <span className="text-slate-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded-full">
                  Image or Video
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 leading-normal">
              Upload a custom green screen image, video backdrop, or show asset that forms part of this cartoon scene!
            </p>

            {activeScene.customBackgroundUrl ? (
              <div className="space-y-2.5">
                <div className="relative rounded-xl overflow-hidden border border-emerald-500/50 bg-slate-950 p-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {activeScene.customBackgroundUrl.startsWith('data:video') || activeScene.customBackgroundUrl.endsWith('.mp4') ? (
                      <video src={activeScene.customBackgroundUrl} className="w-12 h-12 object-cover rounded-lg border border-emerald-500/50" />
                    ) : (
                      <img src={activeScene.customBackgroundUrl} alt="Uploaded custom background" className="w-12 h-12 object-cover rounded-lg border border-emerald-500/50" />
                    )}
                    <div className="text-xs truncate">
                      <div className="font-bold text-white">Custom Presentation Screen</div>
                      <div className="text-[10px] text-emerald-400">Attached to Scene #{activeSceneIndex + 1}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateScene(activeSceneIndex, { customBackgroundUrl: undefined })}
                    className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>

                {/* Presentation Screen Grab Display Size selector */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <label className="block text-[11px] font-bold text-emerald-300 flex items-center justify-between">
                    <span>📺 Presentation Screen Grab Size on Stage:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Cartoons stay visible around it</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'small', label: 'Small', desc: 'Compact' },
                      { id: 'medium', label: 'Medium', desc: '50% Monitor' },
                      { id: 'large', label: 'Large', desc: '75% Screen' },
                      { id: 'full', label: 'Full', desc: 'Backdrop' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => onUpdateScene(activeSceneIndex, { screenGrabSize: sz.id as any })}
                        className={`py-1.5 px-1.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border ${
                          (activeScene.screenGrabSize || 'medium') === sz.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md scale-102'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span>{sz.label}</span>
                        <span className="text-[9px] font-normal opacity-80">{sz.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 rounded-xl text-xs font-black text-emerald-300 cursor-pointer transition-all active:scale-95 shadow-md">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Green Screen / Custom Media</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        if (result) {
                          onUpdateScene(activeSceneIndex, {
                            customBackgroundUrl: result,
                            background: 'greenscreen',
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

        {/* Dialogue Line Text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-400">
              Dialogue Script Line (Read in {activeSpeaker?.name || 'Character'}'s Voice)
            </label>
            <button
              type="button"
              onClick={() => {
                if (activeSpeaker) {
                  speakDialogueLine(
                    activeScene.dialogue,
                    activeSpeaker.voicePitch,
                    activeSpeaker.voiceRate,
                    activeSpeaker.style,
                    undefined,
                    activeScene.audioUrl || activeSpeaker.customVoiceUrl,
                    activeSpeaker.preferredVoiceName,
                    activeSpeaker.voicePreset
                  );
                }
              }}
              className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-yellow-500/50 transition-all active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
              Test Read Line
            </button>
          </div>
          <textarea
            value={activeScene.dialogue}
            onChange={(e) => onUpdateScene(activeSceneIndex, { dialogue: e.target.value })}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 font-medium"
            placeholder="Type what character says..."
          />
        </div>

        {/* Voice & Script Audio Control */}
        <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-yellow-400" />
              Voice Recording for Scene #{activeSceneIndex + 1} ({activeSpeaker?.name || 'Speaker'})
            </span>
            {activeScene.audioUrl ? (
              <span className="text-emerald-400 text-[11px] font-bold bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                ✓ Recorded Audio Line Active
              </span>
            ) : (
              <span className="text-purple-300 text-[11px] bg-purple-950/80 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                ✨ Using AI Voice Engine to Read Script
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Record yourself reading <strong className="text-white">"{activeScene.dialogue || 'Script Line'}"</strong> or let the AI cartoon voice read it automatically!
          </p>

          <MicrophoneVoiceRecorder
            label={`Record Voice Line for Scene #${activeSceneIndex + 1}`}
            existingAudioUrl={activeScene.audioUrl}
            pitch={activeSpeaker?.voicePitch ?? 1.0}
            onAudioSave={(audioUrl) => onUpdateScene(activeSceneIndex, { audioUrl })}
          />

          {/* Quick Scene Step Navigation for Recording All Scenes */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">
              Scene {activeSceneIndex + 1} of {project.scenes.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeSceneIndex === 0}
                onClick={() => onSelectScene(activeSceneIndex - 1)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold border border-slate-700"
              >
                ◀ Record Prev Scene
              </button>
              <button
                type="button"
                disabled={activeSceneIndex === project.scenes.length - 1}
                onClick={() => onSelectScene(activeSceneIndex + 1)}
                className="px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold border border-purple-400/30"
              >
                Record Next Scene ▶
              </button>
            </div>
          </div>
        </div>

        {/* Scene Background Theme Selector */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-purple-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
              <span>🌆 Background Stage Theme (Scene #{activeSceneIndex + 1})</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const currentTheme = activeScene.background;
                project.scenes.forEach((_, idx) => {
                  onUpdateScene(idx, { background: currentTheme });
                });
              }}
              className="text-[11px] text-yellow-300 hover:text-yellow-200 font-bold bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 px-2.5 py-1 rounded-lg transition-all active:scale-95"
            >
              ✨ Set Theme for All Scenes
            </button>
          </div>

          {/* REAL PERSONS & LIVE STUDIO BACKDROPS */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
              🎥 Realistic Studio & Live-Action Stage Themes:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {realPersonThemes.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { background: bg.id })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    activeScene.background === bg.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-base">{bg.icon}</span>
                  <span className="truncate">{bg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CARTOON BACKDROPS */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">
              🎨 Cartoon Stage Themes:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cartoonThemes.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onUpdateScene(activeSceneIndex, { background: bg.id })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    activeScene.background === bg.id
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold shadow-md shadow-purple-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-base">{bg.icon}</span>
                  <span className="truncate">{bg.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emotions & Effects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Speaker Emotion</label>
            <select
              value={activeScene.speakerEmotion}
              onChange={(e) =>
                onUpdateScene(activeSceneIndex, {
                  speakerEmotion: e.target.value as ExpressionType,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white capitalize"
            >
              {emotions.map((em) => (
                <option key={em} value={em}>
                  {em}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Listener Emotion</label>
            <select
              value={activeScene.listenerEmotion}
              onChange={(e) =>
                onUpdateScene(activeSceneIndex, {
                  listenerEmotion: e.target.value as ExpressionType,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white capitalize"
            >
              {emotions.map((em) => (
                <option key={em} value={em}>
                  {em}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Sound Effect</label>
            <select
              value={activeScene.soundEffect || 'none'}
              onChange={(e) =>
                onUpdateScene(activeSceneIndex, {
                  soundEffect: e.target.value as SoundEffectType,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white capitalize"
            >
              {soundEffects.map((sfx) => (
                <option key={sfx} value={sfx}>
                  🔊 {sfx}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cartoon Character Movement & Action Selector */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-yellow-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Cartoon Character Action & Movement (Scene #{activeSceneIndex + 1})</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Character walk, run, jump, fly, dance or stunts</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {actionEffects.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { actionEffect: act.id })}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                  (activeScene.actionEffect || 'none') === act.id
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-md scale-102 font-black'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{act.icon}</span>
                <span className="text-[10px] mt-0.5 truncate font-extrabold">{act.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scene Transition Selector */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-indigo-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Scene Transition Animation (Scene #{activeSceneIndex + 1})</span>
            </label>
            <button
              type="button"
              onClick={() => {
                const currentTransition = activeScene.sceneTransition || 'fade';
                project.scenes.forEach((_, idx) => {
                  onUpdateScene(idx, { sceneTransition: currentTransition });
                });
              }}
              className="text-[10px] font-extrabold text-yellow-300 hover:text-yellow-200 bg-indigo-950/80 border border-indigo-500/40 px-2.5 py-1 rounded-lg transition-all active:scale-95"
              title="Apply this scene transition to all scenes in the cartoon episode"
            >
              ✨ Apply Transition to ALL Scenes
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Choose how the stage visually transitions (Fade, Slide, Zoom, Wipe, Bounce) when switching to this scene during playback!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {sceneTransitions.map((trans) => (
              <button
                key={trans.id}
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { sceneTransition: trans.id })}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border cursor-pointer ${
                  (activeScene.sceneTransition || 'fade') === trans.id
                    ? 'bg-indigo-500 text-white border-indigo-300 shadow-md scale-102 font-black'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{trans.icon}</span>
                <span className="text-[10px] mt-0.5 truncate font-extrabold">{trans.label}</span>
                <span className="text-[9px] opacity-75 font-normal truncate">{trans.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Concept / Fact / Code Overlay Box (Optional) */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Yellow Script Pattern / Code Box Overlay at Top of Scene
            </label>
            {activeScene.codeSnippet ? (
              <button
                type="button"
                onClick={() => onUpdateScene(activeSceneIndex, { codeSnippet: '', codeHighlight: '' })}
                className="text-[10px] font-extrabold text-red-300 hover:text-red-200 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all active:scale-95"
                title="Clear Yellow Script Box for this scene"
              >
                <Trash2 className="w-3 h-3" />
                Clear Box
              </button>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-400">
            This yellow key takeaway box appears at the top center of the scene. Clear it or edit the text below to change or hide it!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={activeScene.codeSnippet || ''}
              onChange={(e) => onUpdateScene(activeSceneIndex, { codeSnippet: e.target.value })}
              placeholder="e.g. Rayleigh Scattering: Blue light bounces!"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono"
            />
            <input
              type="text"
              value={activeScene.codeHighlight || ''}
              onChange={(e) => onUpdateScene(activeSceneIndex, { codeHighlight: e.target.value })}
              placeholder="Highlight term (e.g. Rayleigh Scattering)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-yellow-300 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
