import React, { useState, useEffect } from 'react';
import { CartoonProject, CharacterStyle, BackgroundTheme, TopicCategory } from '../types';
import { Sparkles, Wand2, AlertCircle, Loader2, X, Volume2, Sliders, AudioWaveform, Users, User } from 'lucide-react';
import { MicrophoneVoiceRecorder } from './MicrophoneVoiceRecorder';
import { speakDialogueLine, CARTOON_VOICE_PRESETS } from '../utils/audioSynthesizer';
import { generateVisemesForDialogue } from '../utils/textToVisemes';

interface ScriptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScriptGenerated: (projectData: Partial<CartoonProject>) => void;
}

interface ModalCharacter {
  name: string;
  style: CharacterStyle;
  role: string;
  color: string;
  voicePreset: string;
  voicePitch: number;
  voiceRate: number;
  browserVoice: string;
  customVoiceUrl?: string;
}

export const ScriptGeneratorModal: React.FC<ScriptGeneratorModalProps> = ({
  isOpen,
  onClose,
  onScriptGenerated,
}) => {
  const [category, setCategory] = useState<TopicCategory>('Science & Nature');
  const [topic, setTopic] = useState('Why is the Sky Blue?');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [targetAge, setTargetAge] = useState<'5-8' | '9-12' | '13-17' | 'Adults & Pros'>('5-8');

  // Cast Size State: 1 (Solo), 2 (Duo), 3 (Trio), 4 (Squad)
  const [castCount, setCastCount] = useState<number>(2);
  const [activeCharTab, setActiveCharTab] = useState<number>(0);

  // Cast Members Configurations
  const [castMembers, setCastMembers] = useState<ModalCharacter[]>([
    {
      name: 'Ada',
      style: 'astronaut',
      role: 'Lead Presenter',
      color: '#0284c7',
      voicePreset: 'hero',
      voicePitch: 1.2,
      voiceRate: 1.0,
      browserVoice: '',
    },
    {
      name: 'Spocky',
      style: 'alien',
      role: 'Co-Host Buddy',
      color: '#10b981',
      voicePreset: 'alien',
      voicePitch: 0.85,
      voiceRate: 1.05,
      browserVoice: '',
    },
    {
      name: 'Barnaby',
      style: 'wizard',
      role: 'Expert Specialist',
      color: '#8b5cf6',
      voicePreset: 'guru',
      voicePitch: 1.0,
      voiceRate: 0.95,
      browserVoice: '',
    },
    {
      name: 'Pixel',
      style: 'robot',
      role: 'Tech Assistant',
      color: '#3b82f6',
      voicePreset: 'robot',
      voicePitch: 1.4,
      voiceRate: 1.1,
      browserVoice: '',
    },
  ]);

  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [setting, setSetting] = useState<BackgroundTheme>('classroom');
  const [sceneCount, setSceneCount] = useState(6);
  const [showStyle, setShowStyle] = useState<'cartoon_network' | 'spongebob' | 'bluey' | 'educational_classic'>('cartoon_network');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setBrowserVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isOpen) return null;

  const voicePresets = CARTOON_VOICE_PRESETS;

  const updateCastMember = (index: number, updated: Partial<ModalCharacter>) => {
    setCastMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...updated } : m))
    );
  };

  const applyCastPreset = (count: number, members: Partial<ModalCharacter>[]) => {
    setCastCount(count);
    setCastMembers((prev) => {
      const next = [...prev];
      members.forEach((m, i) => {
        if (next[i]) {
          next[i] = { ...next[i], ...m };
        } else {
          next[i] = {
            name: m.name || `Character ${i + 1}`,
            style: m.style || 'robot',
            role: m.role || `Co-Host ${i + 1}`,
            color: m.color || '#3b82f6',
            voicePreset: m.voicePreset || 'hero',
            voicePitch: m.voicePitch || 1.0,
            voiceRate: m.voiceRate || 1.0,
            browserVoice: m.browserVoice || '',
            customVoiceUrl: m.customVoiceUrl,
          };
        }
      });
      return next;
    });
    if (activeCharTab >= count) {
      setActiveCharTab(0);
    }
  };

  const categoriesList: { id: TopicCategory; icon: string; examples: string[] }[] = [
    {
      id: 'Cybersecurity & IT',
      icon: '🛡️',
      examples: [
        'How Phishing Attacks Work',
        'Password Hygiene & MFA Best Practices',
        'What is a Firewall & VPN?',
        'Zero Trust Security Architecture',
        'Ransomware & Malware Defense',
        'Ethical Hacking & Penetration Testing',
        'Data Encryption & SSL/TLS',
      ],
    },
    {
      id: 'Adult Tech & AI',
      icon: '⚡',
      examples: [
        'Generative AI & LLMs Explained',
        'Cloud Computing (AWS vs Azure vs GCP)',
        'Microservices vs Monoliths',
        'Docker Containers & Kubernetes',
        'DevOps & CI/CD Automated Pipelines',
        'System Architecture & High Availability',
      ],
    },
    {
      id: 'Professional & Business',
      icon: '💼',
      examples: [
        'Tech Salary & Promotion Negotiations',
        'Mastering System Design & Coding Interviews',
        'Agile & Scrum Team Workflows',
        'Personal Finance & Investing Essentials',
        'Effective Workplace Communication & Leadership',
      ],
    },
    {
      id: 'Science & Nature',
      icon: '🧪',
      examples: [
        'Why is the Sky Blue?',
        'How Photosynthesis Works',
        'Why Do Bees Make Honey?',
        'Volcanoes & Lava',
        'The Water Cycle',
        'How Birds Fly',
      ],
    },
    {
      id: 'Math & Numbers',
      icon: '📐',
      examples: [
        'What are Fractions?',
        'Multiplication Tricks',
        'Shapes & Geometry',
        'Positive & Negative Numbers',
        'Measuring Area & Perimeter',
      ],
    },
    {
      id: 'Space & Planets',
      icon: '🚀',
      examples: [
        'Journey to Mars',
        'How Black Holes Work',
        'Phases of the Moon',
        'The Solar System Planets',
        'Shooting Stars & Comets',
      ],
    },
    {
      id: 'Coding & Tech',
      icon: '💻',
      examples: [
        'What is a Variable?',
        'Repeat Loops in Scratch',
        'If-Else Decisions',
        'How Robots Think',
        'What is an Algorithm?',
      ],
    },
    {
      id: 'History & World',
      icon: '🏛️',
      examples: [
        'How Pyramids Were Built',
        'The Ancient Olympic Games',
        'Dinosaurs of the Jurassic Era',
        'Inventing the Lightbulb',
      ],
    },
    {
      id: 'Life Skills & Values',
      icon: '💡',
      examples: [
        'How Saving Money Works',
        'The Power of Kindness',
        'Why Sleep is Important',
        'Healthy Food & Nutrition',
        'Handling Strong Emotions',
      ],
    },
    {
      id: 'Custom Topic',
      icon: '✏️',
      examples: ['Type ANY custom topic below!'],
    },
  ];

  const currentCategoryObj = categoriesList.find((c) => c.id === category) || categoriesList[0];

  const handleCategoryChange = (cat: TopicCategory) => {
    setCategory(cat);
    const catObj = categoriesList.find((c) => c.id === cat);
    if (catObj && catObj.examples.length > 0 && cat !== 'Custom Topic') {
      setTopic(catObj.examples[0]);
    }

    if (cat === 'Cybersecurity & IT' || cat === 'Adult Tech & AI' || cat === 'Professional & Business') {
      setTargetAge('Adults & Pros');
      setSetting('cyber_grid');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    const finalTopic = category === 'Custom Topic' ? customTopicInput.trim() || topic : topic;
    const activeCast = castMembers.slice(0, castCount);

    try {
      const res = await fetch('/api/gemini/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          category,
          targetAge,
          characters: activeCast.map((cm) => ({
            name: cm.name,
            style: cm.style,
            role: cm.role,
          })),
          setting,
          sceneCount,
          showStyle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate cartoon script');
      }

      const data = await res.json();

      const createdChars = activeCast.map((cm, idx) => ({
        id: 'char-' + Date.now() + '-' + (idx + 1),
        name: cm.name,
        role: cm.role || (idx === 0 ? 'Lead Presenter' : `Co-Host ${idx + 1}`),
        style: cm.style,
        color: cm.color || (cm.style === 'dog' ? '#f59e0b' : cm.style === 'wizard' ? '#8b5cf6' : cm.style === 'astronaut' ? '#0284c7' : cm.style === 'alien' ? '#10b981' : cm.style === 'robot' ? '#3b82f6' : '#ec4899'),
        voicePitch: cm.voicePitch,
        voiceRate: cm.voiceRate,
        preferredVoiceName: cm.browserVoice || undefined,
        customVoiceUrl: cm.customVoiceUrl,
        voicePreset: cm.voicePreset,
      }));

      const mainDialogueScenes = data.scenes.map((s: any, idx: number) => {
        // Match speaker by name or fallback index
        const speakerMatch = createdChars.find((c) =>
          s.speaker?.toLowerCase().trim().includes(c.name.toLowerCase().trim()) ||
          c.name.toLowerCase().trim().includes(s.speaker?.toLowerCase().trim() || '')
        ) || createdChars[idx % createdChars.length];

        const otherChars = createdChars.filter((c) => c.id !== speakerMatch.id);
        const listenerMatch = otherChars.length > 0 ? otherChars[idx % otherChars.length] : speakerMatch;

        return {
          id: 'scene-' + (idx + 1) + '-' + Date.now(),
          speakerId: speakerMatch.id,
          listenerId: listenerMatch.id,
          dialogue: s.dialogue,
          speakerEmotion: s.speakerEmotion || 'happy',
          listenerEmotion: s.listenerEmotion || 'thinking',
          cameraAngle: s.cameraAngle || 'MEDIUM_TWO_SHOT',
          microAction: s.microAction || '',
          handGesture: s.handGesture || 'none',
          sceneTransition: s.sceneTransition || 'fade',
          timingHoldMs: s.timingHoldMs || 600,
          visemeCues: (s.visemeCues && s.visemeCues.length > 0) ? s.visemeCues : generateVisemesForDialogue(s.dialogue),
          actNumber: s.actNumber || (idx < Math.ceil(data.scenes.length * 0.25) ? 1 : idx < Math.ceil(data.scenes.length * 0.75) ? 2 : 3),
          actName: s.actName || (s.actNumber === 1 ? 'Act 1: Cold Open & Setup' : s.actNumber === 3 ? 'Act 3: Resolution & Outro' : 'Act 2: Escalation & Hijinks'),
          codeSnippet: s.codeSnippet || '',
          codeHighlight: s.codeHighlight || '',
          background: setting,
          soundEffect: s.soundEffect || 'pop',
          actionEffect: s.actionEffect || 'none',
        };
      });

      // Clean short topic for intro display
      const displayTopicName = (data.title || finalTopic)
        .split('—')[0]
        .split('(')[0]
        .replace(/^Episode\s+\d+:?/i, '')
        .trim();
      const shortCleanTopic = displayTopicName.length > 30 ? displayTopicName.slice(0, 28) + '...' : displayTopicName;

      const leadChar = createdChars[0];
      const secondChar = createdChars[1] || leadChar;

      // Intro Theme Song Scene at start of show
      const themeIntroScene = {
        id: 'scene-intro-theme-' + Date.now(),
        speakerId: leadChar.id,
        listenerId: secondChar.id,
        dialogue: `Welcome to the show! Let's learn about ${shortCleanTopic || 'coding'}! 🚀 ✨`,
        speakerEmotion: 'celebrating' as const,
        listenerEmotion: 'happy' as const,
        background: setting,
        soundEffect: 'tada' as const,
        actionEffect: 'bounce' as const,
        isThemeSong: true,
        isMusicOnly: true,
        themeSongKey: 'lets_code_together',
      };

      // Outro Theme Song Finale & Subscribe CTA Scene at end of show
      const themeOutroScene = {
        id: 'scene-outro-theme-' + Date.now(),
        speakerId: secondChar.id,
        listenerId: leadChar.id,
        dialogue: `Thanks for watching! Don't forget to Like, Share & Subscribe for more cartoon adventures! 🔔 🎉`,
        speakerEmotion: 'celebrating' as const,
        listenerEmotion: 'happy' as const,
        background: setting,
        soundEffect: 'success' as const,
        actionEffect: 'dance' as const,
        isThemeSong: true,
        isMusicOnly: true,
        themeSongKey: 'lets_code_together',
      };

      const scenes = [themeIntroScene, ...mainDialogueScenes, themeOutroScene];
      const charNames = createdChars.map((c) => c.name).join(' & ');

      onScriptGenerated({
        title: data.title || `${charNames}'s ${finalTopic} Cartoon!`,
        topic: finalTopic,
        category,
        targetAge,
        characters: createdChars,
        scenes,
        bgMusicTrack: setting === 'magic_lab' ? 'magic_mystery' : 'playful',
        youtubeMetadata: {
          youtubeTitle: data.youtubeTitle || `${data.title} - Educational Cartoon for Kids`,
          youtubeDescription: data.youtubeDescription || `Learn about ${finalTopic} with ${charNames}!`,
          tags: data.tags || ['#KidsEducation', '#LearnWithCartoons', '#STEM'],
        },
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with Gemini AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const styleOptions: { id: CharacterStyle; label: string }[] = [
    { id: 'astronaut', label: '👩‍🚀 Ada Astronaut' },
    { id: 'alien', label: '👽 Spocky Alien' },
    { id: 'wizard', label: '🧙 Pixel Wizard' },
    { id: 'dragon', label: '🐉 Codey Dragon' },
    { id: 'dog', label: '🐶 Byte the Dog' },
    { id: 'robot', label: '🤖 Chip the Robot' },
    { id: 'cat', label: '🐱 Whiskers the Cat' },
    { id: 'presenter_female', label: '👩‍💼 Sarah (Tech Host)' },
    { id: 'presenter_male', label: '👨‍💼 Alex (Cyber Lead)' },
    { id: 'instructor', label: '🎓 Marcus (Instructor)' },
    { id: 'engineer', label: '👨‍💻 Dave (Sr Engineer)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 shrink-0 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse text-yellow-300" />
          </div>
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              AI Educational Cartoon Studio
            </h2>
            <p className="text-xs text-slate-400">
              Select cast size (1-4 members) and generate fun multi-character roleplay scripts with Gemini!
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 text-sm overflow-y-auto pr-1 flex-1">
          {/* STEP 1: CAST SIZE SELECTOR */}
          <div className="bg-slate-950 p-4 rounded-xl border-2 border-yellow-400/60 space-y-3 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="block text-xs font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-yellow-400" />
                1. Select Cast Size & Ensemble Count
              </label>
              <span className="text-[11px] text-amber-300 font-extrabold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/50">
                Mandatory First Step
              </span>
            </div>

            {/* Cast Count Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => applyCastPreset(1, [
                  { name: 'Sarah', style: 'presenter_female', role: 'Host' },
                ])}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  castCount === 1
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black scale-105 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="text-sm font-extrabold">👤 Solo (1)</div>
                <div className="text-[10px] opacity-80">1 Solo Presenter</div>
              </button>

              <button
                type="button"
                onClick={() => applyCastPreset(2, [
                  { name: 'Ada', style: 'astronaut', role: 'Lead Host' },
                  { name: 'Spocky', style: 'alien', role: 'Co-Host Buddy' },
                ])}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  castCount === 2
                    ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black scale-105 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="text-sm font-extrabold">👥 Duo (2)</div>
                <div className="text-[10px] opacity-80">2 Co-Host Cast</div>
              </button>

              <button
                type="button"
                onClick={() => applyCastPreset(3, [
                  { name: 'Ada', style: 'astronaut', role: 'Lead Host' },
                  { name: 'Spocky', style: 'alien', role: 'Co-Host' },
                  { name: 'Barnaby', style: 'wizard', role: 'Expert Guru' },
                ])}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  castCount === 3
                    ? 'bg-purple-400 text-slate-950 border-purple-300 font-black scale-105 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="text-sm font-extrabold">👨‍👩‍👧 Trio (3)</div>
                <div className="text-[10px] opacity-80">3 Member Ensemble</div>
              </button>

              <button
                type="button"
                onClick={() => applyCastPreset(4, [
                  { name: 'Ada', style: 'astronaut', role: 'Lead Host' },
                  { name: 'Spocky', style: 'alien', role: 'Co-Host' },
                  { name: 'Byte', style: 'dog', role: 'Coding Dog' },
                  { name: 'Chip', style: 'robot', role: 'AI Robot' },
                ])}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  castCount === 4
                    ? 'bg-pink-400 text-slate-950 border-pink-300 font-black scale-105 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="text-sm font-extrabold">👨‍👩‍👧‍👦 Squad (4)</div>
                <div className="text-[10px] opacity-80">4 Member Full Cast</div>
              </button>
            </div>

            {/* Quick Presets for Selected Cast Count */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Quick Cast Presets for {castCount} Member{castCount > 1 ? 's' : ''}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {castCount === 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(1, [{ name: 'Sarah', style: 'presenter_female' }])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-amber-300"
                    >
                      👩‍💼 Sarah (Host)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(1, [{ name: 'Ada', style: 'astronaut' }])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-cyan-300"
                    >
                      👩‍🚀 Ada (Astronaut)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(1, [{ name: 'Byte', style: 'dog' }])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-yellow-300"
                    >
                      🐶 Byte (Dog)
                    </button>
                  </>
                )}

                {castCount === 2 && (
                  <>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(2, [
                        { name: 'Sarah', style: 'presenter_female' },
                        { name: 'Alex', style: 'presenter_male' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-amber-300"
                    >
                      👩‍💼 Sarah & 👨‍💼 Alex
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(2, [
                        { name: 'Ada', style: 'astronaut' },
                        { name: 'Spocky', style: 'alien' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-cyan-300"
                    >
                      👩‍🚀 Ada & 👽 Spocky
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(2, [
                        { name: 'Byte', style: 'dog' },
                        { name: 'Chip', style: 'robot' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-yellow-300"
                    >
                      🐶 Byte & 🤖 Chip
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(2, [
                        { name: 'Pixel', style: 'wizard' },
                        { name: 'Codey', style: 'dragon' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-purple-300"
                    >
                      🧙 Pixel & 🐉 Codey
                    </button>
                  </>
                )}

                {castCount === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(3, [
                        { name: 'Sarah', style: 'presenter_female' },
                        { name: 'Alex', style: 'presenter_male' },
                        { name: 'Marcus', style: 'instructor' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-amber-300"
                    >
                      👩‍💼 Sarah, 👨‍💼 Alex & 🎓 Marcus
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(3, [
                        { name: 'Ada', style: 'astronaut' },
                        { name: 'Spocky', style: 'alien' },
                        { name: 'Barnaby', style: 'wizard' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-cyan-300"
                    >
                      👩‍🚀 Ada, 👽 Spocky & 🧙 Barnaby
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(3, [
                        { name: 'Byte', style: 'dog' },
                        { name: 'Chip', style: 'robot' },
                        { name: 'Pixel', style: 'wizard' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-yellow-300"
                    >
                      🐶 Byte, 🤖 Chip & 🧙 Pixel
                    </button>
                  </>
                )}

                {castCount === 4 && (
                  <>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(4, [
                        { name: 'Sarah', style: 'presenter_female' },
                        { name: 'Alex', style: 'presenter_male' },
                        { name: 'Marcus', style: 'instructor' },
                        { name: 'Dave', style: 'engineer' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-amber-300"
                    >
                      👩‍💼 Sarah, 👨‍💼 Alex, 🎓 Marcus & 👨‍💻 Dave
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(4, [
                        { name: 'Ada', style: 'astronaut' },
                        { name: 'Spocky', style: 'alien' },
                        { name: 'Byte', style: 'dog' },
                        { name: 'Chip', style: 'robot' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-cyan-300"
                    >
                      👩‍🚀 Ada, 👽 Spocky, 🐶 Byte & 🤖 Chip
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCastPreset(4, [
                        { name: 'Pixel', style: 'wizard' },
                        { name: 'Codey', style: 'dragon' },
                        { name: 'Whiskers', style: 'cat' },
                        { name: 'Chip', style: 'robot' },
                      ])}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-purple-300"
                    >
                      🧙 Pixel, 🐉 Codey, 🐱 Whiskers & 🤖 Chip
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: CONFIGURE CAST MEMBERS (NAME, STYLE, VOICE) */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-400" />
              2. Customize Each Cast Member ({castCount} Selected)
            </label>

            {/* Tabs for active character */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {Array.from({ length: castCount }).map((_, idx) => {
                const char = castMembers[idx];
                const isActive = activeCharTab === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveCharTab(idx)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <span>Member #{idx + 1}:</span>
                    <span>{char?.name || `Char ${idx + 1}`}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Character Config Form */}
            {(() => {
              const char = castMembers[activeCharTab] || castMembers[0];
              if (!char) return null;
              return (
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Character Name
                      </label>
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => updateCastMember(activeCharTab, { name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                        placeholder="e.g. Ada, Alex, Byte..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Avatar / Costume Persona
                      </label>
                      <select
                        value={char.style}
                        onChange={(e) => updateCastMember(activeCharTab, { style: e.target.value as CharacterStyle })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                      >
                        {styleOptions.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Voice Options */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-yellow-300 flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        Voice & Microphone Settings for {char.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          speakDialogueLine(
                            `Hello! I am ${char.name}. This is my cartoon voice for the show!`,
                            char.voicePitch,
                            char.voiceRate,
                            char.style,
                            undefined,
                            char.customVoiceUrl,
                            char.browserVoice
                          )
                        }
                        className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 hover:bg-yellow-500/30"
                      >
                        <Volume2 className="w-3 h-3" /> Test Voice
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-yellow-400" /> Cartoon Voice Preset
                        </label>
                        <select
                          value={char.voicePreset}
                          onChange={(e) => {
                            const selected = voicePresets.find((vp) => vp.id === e.target.value);
                            if (selected) {
                              updateCastMember(activeCharTab, {
                                voicePreset: selected.id,
                                voicePitch: selected.pitch,
                                voiceRate: selected.rate,
                              });
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                          {Array.from(new Set(voicePresets.map((vp) => vp.category))).map((catName) => (
                            <optgroup key={catName} label={catName}>
                              {voicePresets
                                .filter((vp) => vp.category === catName)
                                .map((vp) => (
                                  <option key={vp.id} value={vp.id}>
                                    {vp.label}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {browserVoices.length > 0 && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                            <AudioWaveform className="w-3 h-3 text-blue-400" /> System AI Voice
                          </label>
                          <select
                            value={char.browserVoice}
                            onChange={(e) => updateCastMember(activeCharTab, { browserVoice: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                          >
                            <option value="">-- Pitch Presets --</option>
                            {browserVoices.map((v, i) => (
                              <option key={`${v.name}-${i}`} value={v.name}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Microphone Recording */}
                    <div>
                      <MicrophoneVoiceRecorder
                        label={`Record Custom Voice for ${char.name}`}
                        existingAudioUrl={char.customVoiceUrl}
                        pitch={char.voicePitch}
                        onAudioSave={(url) => updateCastMember(activeCharTab, { customVoiceUrl: url })}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* STEP 3: SUBJECT CATEGORY */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="block text-xs font-black uppercase tracking-wider text-purple-300 mb-2">
              3. Select Subject Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryChange(c.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    category === c.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <span>{c.icon}</span>
                  {c.id}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: SPECIFIC EPISODE TOPIC */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-yellow-400">
              4. Specific Episode Topic
            </label>

            {category !== 'Custom Topic' ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {currentCategoryObj.examples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setTopic(ex)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        topic === ex
                          ? 'bg-yellow-400/20 text-yellow-200 border-yellow-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Or type custom topic:</span>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. How Dinosaurs Lived..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium"
                  />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  placeholder="Type ANY topic! (e.g., Photosynthesis, Black Holes, Earning Money, Guitar Basics)..."
                  className="w-full bg-slate-900 border border-purple-500/60 rounded-lg p-3 text-sm text-white font-bold placeholder:text-slate-500"
                />
              </div>
            )}
          </div>

          {/* STEP 5: TARGET AGE & SETTING */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-purple-300">
              5. Target Age & Environment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Target Age Group
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAge('5-8')}
                    className={`py-2 px-2.5 rounded-xl border font-semibold text-xs text-center ${
                      targetAge === '5-8'
                        ? 'bg-pink-600/30 border-pink-500 text-pink-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🐣 Kids (5-8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAge('9-12')}
                    className={`py-2 px-2.5 rounded-xl border font-semibold text-xs text-center ${
                      targetAge === '9-12'
                        ? 'bg-pink-600/30 border-pink-500 text-pink-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🚀 Youth (9-12)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAge('13-17')}
                    className={`py-2 px-2.5 rounded-xl border font-semibold text-xs text-center ${
                      targetAge === '13-17'
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🎓 Teens (13-17)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAge('Adults & Pros')}
                    className={`py-2 px-2.5 rounded-xl border font-semibold text-xs text-center ${
                      targetAge === 'Adults & Pros'
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    💼 Adults & Pros
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Cartoon Setting / Environment
                </label>
                <select
                  value={setting}
                  onChange={(e) => setSetting(e.target.value as BackgroundTheme)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500 text-xs"
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
                </select>
              </div>
            </div>
          </div>

          {/* STEP 6: SHOW ANIMATION PROFILE & EPISODE LENGTH */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-yellow-300">
              6. Show Animation Profile & Multi-Act Length
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Animation Style Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStyle('cartoon_network')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      showStyle === 'cartoon_network'
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-200 font-bold shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1">
                      <span>⚡</span> Cartoon Network
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">Slapstick, whip-pans, exaggerated gags & high camera frequency</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStyle('spongebob')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      showStyle === 'spongebob'
                        ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200 font-bold shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1">
                      <span>🍍</span> SpongeBob Comedic
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">High SFX density, extreme reaction holds & title-card stings</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStyle('bluey')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      showStyle === 'bluey'
                        ? 'bg-blue-400/20 border-blue-400 text-blue-200 font-bold shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1">
                      <span>🐶</span> Bluey Storybook
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">Warm emotional pacing, acoustic cues & smooth camera holds</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStyle('educational_classic')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      showStyle === 'educational_classic'
                        ? 'bg-purple-400/20 border-purple-400 text-purple-200 font-bold shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1">
                      <span>🎓</span> Educational Classic
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">Structured 3-Act teaching, clear takeaways & balanced framing</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Episode Length (3-Act Scenes):</span>
                  <span className="text-yellow-300 font-mono font-extrabold">{sceneCount} Animated Scenes</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 6, 8, 10, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSceneCount(num)}
                      className={`py-2 rounded-xl border font-black text-xs text-center transition-all ${
                        sceneCount === num
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-lg scale-105'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {num} Scenes
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Writing Script for {castCount} Cast Member{castCount > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Script for {castCount} Character{castCount > 1 ? 's' : ''} ✨
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
