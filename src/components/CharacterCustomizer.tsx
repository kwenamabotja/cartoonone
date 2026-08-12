import React, { useState, useEffect } from 'react';
import { CartoonProject, Character, CharacterStyle } from '../types';
import { CartoonAvatar } from './CartoonAvatars';
import {
  User,
  Users,
  Volume2,
  Sparkles,
  Mic,
  ArrowLeftRight,
  Copy,
  Check,
  Trash2,
  Plus,
  Radio,
  Sliders,
  AudioWaveform,
  Upload,
  Image,
  Camera,
  X,
} from 'lucide-react';
import { speakDialogueLine, getAvailableVoices, CARTOON_VOICE_PRESETS } from '../utils/audioSynthesizer';
import { MicrophoneVoiceRecorder } from './MicrophoneVoiceRecorder';

interface CharacterCustomizerProps {
  project: CartoonProject;
  onUpdateCharacter: (charId: string, updated: Partial<Character>) => void;
  onAddCharacter?: () => void;
  onDeleteCharacter?: (charId: string) => void;
  onSetCastCount?: (count: number) => void;
}

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({
  project,
  onUpdateCharacter,
  onAddCharacter,
  onDeleteCharacter,
  onSetCastCount,
}) => {
  const [quickVoiceTake, setQuickVoiceTake] = useState<string | undefined>(undefined);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testingCharId, setTestingCharId] = useState<string | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setBrowserVoices(voices);
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const realPeopleStyles: { id: CharacterStyle; label: string }[] = [
    { id: 'presenter_female', label: '👩‍💼 Sarah (Tech Host)' },
    { id: 'presenter_male', label: '👨‍💼 Alex (Cyber Lead)' },
    { id: 'instructor', label: '🎓 Prof. Marcus (Instructor)' },
    { id: 'engineer', label: '👨‍💻 Dev Dave (Sr Engineer)' },
    { id: 'student', label: '👩‍🎓 Student Maya' },
    { id: 'custom_photo', label: '📸 Upload Custom Face Photo' },
  ];

  const cartoonStyles: { id: CharacterStyle; label: string }[] = [
    { id: 'bluey', label: '🐶 Bluey (Blue Heeler Dog)' },
    { id: 'sponge_pop', label: '🧽 Sponge Pop (Sea Sponge)' },
    { id: 'star_pat', label: '⭐ Star Pat (Pink Starfish)' },
    { id: 'squid_ward', label: '🦑 Squid Octo (Turquoise Octo)' },
    { id: 'loud_house', label: '👦 Loud Lincoln (Loud Kid)' },
    { id: 'loud_sister', label: '👧 Loud Sister (Loud Girl)' },
    { id: 'blue_monster', label: '🍪 Cookie Blue Monster' },
    { id: 'pink_panther', label: '🐆 Pink Panther (Cool Feline)' },
    { id: 'dog', label: '🐶 Byte the Dog' },
    { id: 'cat', label: '🐱 Whiskers the Cat' },
    { id: 'bunny', label: '🐰 Hop Bunny' },
    { id: 'duck', label: '🦆 Quack Duck' },
    { id: 'superhero', label: '🦸 Cape Hero' },
    { id: 'anime_hero', label: '⚡ Anime Spiky Hero' },
    { id: 'robot', label: '🤖 Chip the Robot' },
    { id: 'wizard', label: '🧙 Pixel the Wizard' },
    { id: 'dragon', label: '🐉 Codey the Dragon' },
    { id: 'astronaut', label: '👩‍🚀 Ada Astronaut' },
    { id: 'alien', label: '👽 Spocky Alien' },
  ];

  const handlePhotoUpload = (charId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onUpdateCharacter(charId, {
          customAvatarUrl: result,
          style: 'custom_photo',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const voicePresets = CARTOON_VOICE_PRESETS;

  const handleTestVoice = (char: Character) => {
    setTestingCharId(char.id);
    speakDialogueLine(
      `Hello! I am ${char.name}. My voice is assigned for the entire show!`,
      char.voicePitch,
      char.voiceRate,
      char.style,
      () => setTestingCharId(null),
      char.customVoiceUrl,
      char.preferredVoiceName
    );
    setTimeout(() => {
      setTestingCharId((prev) => (prev === char.id ? null : prev));
    }, 3800);
  };

  const charA = project.characters[0];
  const charB = project.characters[1];

  const handleSwapVoices = () => {
    if (!charA || !charB) return;
    const voiceA = charA.customVoiceUrl;
    const voiceB = charB.customVoiceUrl;
    onUpdateCharacter(charA.id, { customVoiceUrl: voiceB });
    onUpdateCharacter(charB.id, { customVoiceUrl: voiceA });
  };

  const handleCopyVoice = (fromChar: Character, toChar: Character) => {
    if (!fromChar.customVoiceUrl) return;
    onUpdateCharacter(toChar.id, { customVoiceUrl: fromChar.customVoiceUrl });
  };

  const handleAssignQuickTakeToCharacter = (charId: string) => {
    if (!quickVoiceTake) return;
    onUpdateCharacter(charId, { customVoiceUrl: quickVoiceTake });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-black tracking-tight text-yellow-400 flex items-center gap-2">
            <User className="w-5 h-5 text-yellow-400" />
            Character Duo & Voice Studio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Add characters, record 1 custom voice per character (used show-wide), or choose from browser AI voices!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onAddCharacter && (
            <button
              type="button"
              onClick={onAddCharacter}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add New Character
            </button>
          )}

          {charA && charB && (
            <button
              type="button"
              onClick={handleSwapVoices}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all active:scale-95"
              title="Swap assigned microphone recordings between Character 1 and Character 2"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-yellow-400" />
              Swap Mic Voices
            </button>
          )}
        </div>
      </div>

      {/* FEATURED CARTOON CAST SIZE SELECTOR */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
              Featured Cartoon Cast Size
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Select how many cartoon characters are featured on stage & in AI scripts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => onSetCastCount?.(1)}
            className={`px-3 py-2.5 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
              project.characters.length === 1
                ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-lg shadow-yellow-950 scale-[1.02]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xs sm:text-sm">👤 Solo (1)</span>
            <span className="text-[10px] font-semibold opacity-85">1 Solo Presenter</span>
          </button>

          <button
            type="button"
            onClick={() => onSetCastCount?.(2)}
            className={`px-3 py-2.5 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
              project.characters.length === 2
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-950 scale-[1.02]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xs sm:text-sm">👥 Duo (2)</span>
            <span className="text-[10px] font-semibold opacity-85">Classic Duo Show</span>
          </button>

          <button
            type="button"
            onClick={() => onSetCastCount?.(3)}
            className={`px-3 py-2.5 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
              project.characters.length === 3
                ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-950 scale-[1.02]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xs sm:text-sm">👨‍👩‍👧 Trio (3)</span>
            <span className="text-[10px] font-semibold opacity-85">3 Cast Ensemble</span>
          </button>

          <button
            type="button"
            onClick={() => onSetCastCount?.(4)}
            className={`px-3 py-2.5 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
              project.characters.length === 4
                ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-950 scale-[1.02]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xs sm:text-sm">👨‍👩‍👧‍👦 Squad (4)</span>
            <span className="text-[10px] font-semibold opacity-85">4 Cast Group Panel</span>
          </button>
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 border border-purple-500/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-purple-300 uppercase tracking-wider">
            <Mic className="w-4 h-4 text-red-400 animate-pulse" />
            Quick Voice Recorder Studio
          </div>
          <span className="text-[11px] text-purple-200/70 font-medium">
            Record a master voice sample and assign to any character in 1 click
          </span>
        </div>

        <MicrophoneVoiceRecorder
          label="Record Master Voice Sample"
          existingAudioUrl={quickVoiceTake}
          pitch={1.0}
          onAudioSave={(url) => setQuickVoiceTake(url)}
        />

        {quickVoiceTake && (
          <div className="bg-slate-900/90 border border-purple-500/40 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Voice Sample Recorded! Select character to assign show-wide:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {project.characters.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleAssignQuickTakeToCharacter(c.id)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Assign to {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PHOTO CAST BANNER */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center justify-center sm:justify-start gap-1.5">
            <Camera className="w-4 h-4 text-yellow-400" />
            📸 Real Person Photo Cast Option
          </h4>
          <p className="text-[11px] text-slate-300">
            Upload pictures of yourself, colleagues, or students to use as animated presenters or cartoon actors on stage!
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {project.characters.map((c) => (
            <label
              key={c.id}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-yellow-400" />
              Upload {c.name}'s Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(c.id, e)}
                className="hidden"
              />
            </label>
          ))}
        </div>
      </div>

      {/* CHARACTER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {project.characters.map((char, idx) => {
          const otherChar = project.characters.find((c) => c.id !== char.id);

          return (
            <div
              key={char.id}
              className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-800 flex flex-col items-center space-y-4 relative"
            >
              {/* Voice Assignment Status Badge & Delete Button */}
              <div className="w-full flex items-center justify-between text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                    Character #{idx + 1}
                  </span>
                  {char.customVoiceUrl ? (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> Show-Wide Mic Voice
                    </span>
                  ) : char.preferredVoiceName ? (
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <AudioWaveform className="w-3 h-3 text-blue-400" /> Browser Voice: {char.preferredVoiceName.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Synth Pitch ({char.voicePitch}x)
                    </span>
                  )}
                </div>

                {onDeleteCharacter && project.characters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteCharacter(char.id)}
                    className="p-1 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg"
                    title="Delete Character"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Live Preview Avatar & Test Button */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 w-full flex justify-center relative shadow-inner">
                <CartoonAvatar
                  style={char.style}
                  name={char.name}
                  color={char.color}
                  clothingStyle={char.clothingStyle}
                  emotion="happy"
                  isSpeaking={testingCharId === char.id}
                  size={120}
                  customAvatarUrl={char.customAvatarUrl}
                />
                <button
                  type="button"
                  onClick={() => handleTestVoice(char)}
                  className="absolute right-3 bottom-3 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                  title="Test Character Voice"
                >
                  <Volume2 className="w-4 h-4" />
                  Test Voice
                </button>
              </div>

              <div className="w-full space-y-3.5 text-xs">
                {/* Character Name & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Character Name</label>
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => onUpdateCharacter(char.id, { name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Cast Model / Persona</label>
                    <select
                      value={char.style}
                      onChange={(e) =>
                        onUpdateCharacter(char.id, { style: e.target.value as CharacterStyle })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500"
                    >
                      <optgroup label="🎭 Real People & Live Studio Cast">
                        {realPeopleStyles.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🎨 Cartoon Cast">
                        {cartoonStyles.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* REAL PERSON PHOTO UPLOAD SECTION */}
                <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-yellow-400" />
                      📸 Real Person Photo Cast
                    </span>
                    {char.customAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateCharacter(char.id, { customAvatarUrl: undefined })}
                        className="text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> Remove Photo
                      </button>
                    )}
                  </div>

                  {char.customAvatarUrl ? (
                    <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <img
                        src={char.customAvatarUrl}
                        alt="Custom Face"
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-200 text-xs truncate">Custom Photo Active</p>
                        <label className="text-[11px] text-yellow-400 font-bold hover:underline cursor-pointer">
                          Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(char.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-800 border border-dashed border-amber-500/50 rounded-xl cursor-pointer text-slate-300 hover:text-white transition-all">
                      <Upload className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-xs">Upload Photo of Presenter / Person</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(char.id, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Theme Color & Clothing Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Theme Color</label>
                    <div className="flex gap-2">
                      {['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#ef4444', '#0284c7'].map(
                        (hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => onUpdateCharacter(char.id, { color: hex })}
                            className={`w-6 h-6 rounded-full border-2 ${
                              char.color === hex ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Outfit & Clothing</label>
                    <select
                      value={char.clothingStyle || 'default'}
                      onChange={(e) =>
                        onUpdateCharacter(char.id, {
                          clothingStyle: e.target.value as any,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-purple-500 text-xs"
                    >
                      <option value="default">✨ Default Outfit</option>
                      <option value="formal">👔 Executive Suit / Formal</option>
                      <option value="tech">💻 Cyber Tech Hoodie</option>
                      <option value="labcoat">🥼 Science / Lab Coat</option>
                      <option value="hero">🦸 Hero Cape & Emblem</option>
                      <option value="casual">👕 Casual Sweater</option>
                    </select>
                  </div>
                </div>

                {/* VOICE SELECTION METHOD #1: REAL PERSON & NATURAL BROWSER VOICE SELECTOR */}
                <div className="bg-slate-900/90 border border-blue-500/30 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5 text-xs text-blue-300">
                      <AudioWaveform className="w-3.5 h-3.5 text-blue-400" />
                      🎙️ Real Person & Natural Speech Voice Selector
                    </label>
                    {char.preferredVoiceName && (
                      <button
                        type="button"
                        onClick={() => onUpdateCharacter(char.id, { preferredVoiceName: undefined })}
                        className="text-[10px] text-red-400 hover:text-red-300 underline font-semibold"
                      >
                        Reset Voice
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Select a natural human voice installed in your system for authentic presenter & host episodes:
                  </p>

                  <select
                    value={char.preferredVoiceName || ''}
                    onChange={(e) =>
                      onUpdateCharacter(char.id, {
                        preferredVoiceName: e.target.value || undefined,
                      })
                    }
                    className="w-full bg-slate-950 border border-blue-500/40 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-blue-400"
                  >
                    <option value="">-- Choose Natural Human Voice (Auto-Matched) --</option>
                    {browserVoices.map((v, i) => {
                      const isNatural =
                        v.name.includes('Natural') ||
                        v.name.includes('Google') ||
                        v.name.includes('Online') ||
                        v.name.includes('Samantha') ||
                        v.name.includes('Daniel') ||
                        v.name.includes('Victoria') ||
                        v.name.includes('Alex') ||
                        v.name.includes('Karen') ||
                        v.name.includes('Serena');
                      return (
                        <option key={`${v.name}-${i}`} value={v.name}>
                          {isNatural ? '🎙️ [Natural] ' : ''}
                          {v.name} ({v.lang})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* VOICE SELECTION METHOD #2: REAL PERSON & CARTOON VOICE PRESETS */}
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2">
                  <label className="block font-bold text-slate-300 flex items-center gap-1.5 text-yellow-300 text-xs">
                    <Sliders className="w-3.5 h-3.5" />
                    🎭 Voice Persona Presets (Real Persons & Cartoons)
                  </label>
                  <select
                    value={char.voicePreset || 'default'}
                    onChange={(e) => {
                      const presetKey = e.target.value;
                      const selectedPreset = voicePresets.find((vp) => vp.id === presetKey);
                      if (selectedPreset) {
                        onUpdateCharacter(char.id, {
                          voicePreset: presetKey,
                          voicePitch: selectedPreset.pitch,
                          voiceRate: selectedPreset.rate,
                        });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-yellow-400 font-medium"
                  >
                    {Array.from(new Set(voicePresets.map((vp) => vp.category))).map((catName) => (
                      <optgroup key={catName} label={catName}>
                        {voicePresets
                          .filter((vp) => vp.category === catName)
                          .map((vp) => (
                            <option key={vp.id} value={vp.id}>
                              {vp.label} (Pitch: {vp.pitch}x)
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>

                  {/* Pitch Slider */}
                  <div className="pt-1">
                    <div className="flex justify-between font-bold text-slate-400 text-[11px] mb-1">
                      <span>Fine Voice Pitch</span>
                      <span className="text-yellow-400 font-mono">{char.voicePitch.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={char.voicePitch}
                      onChange={(e) =>
                        onUpdateCharacter(char.id, { voicePitch: parseFloat(e.target.value) })
                      }
                      className="w-full accent-yellow-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* VOICE SELECTION METHOD #3: DEDICATED MICROPHONE VOICE RECORDING */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl space-y-2">
                    <MicrophoneVoiceRecorder
                      label={`Record Custom Show-Wide Voice for ${char.name}`}
                      existingAudioUrl={char.customVoiceUrl}
                      pitch={char.voicePitch}
                      onAudioSave={(customVoiceUrl) =>
                        onUpdateCharacter(char.id, { customVoiceUrl })
                      }
                    />
                    <p className="text-[10px] text-emerald-300/80 italic font-medium">
                      💡 Recording a voice here will automatically be used for every scene where {char.name} speaks in the entire show!
                    </p>
                  </div>

                  {/* Copy voice to another character */}
                  {char.customVoiceUrl && otherChar && (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">Share voice recording:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyVoice(char, otherChar)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Voice to {otherChar.name}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


