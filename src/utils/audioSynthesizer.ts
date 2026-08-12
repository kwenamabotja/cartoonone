import { SoundEffectType } from '../types';
import { dspMixer } from './audioDSP';

let audioCtx: AudioContext | null = null;
let mediaDestinationNode: MediaStreamAudioDestinationNode | null = null;
let musicInterval: any = null;
let isMusicPlaying = false;

// Initialize or get master Audio Context & Recording Destination Node
export function getAudioContext(): {
  ctx: AudioContext;
  destinationNode: MediaStreamAudioDestinationNode;
} {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    mediaDestinationNode = audioCtx.createMediaStreamDestination();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return { ctx: audioCtx, destinationNode: mediaDestinationNode! };
}

// Connect sound node through Web Audio DSP Mixer or directly to destinations
function connectToDestinations(node: AudioNode, gainValue = 1, trackName: 'dialogue' | 'ambient' | 'foley' | 'music' = 'foley') {
  const { ctx, destinationNode } = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = gainValue;
  node.connect(gain);

  try {
    dspMixer.init();
    let foleyNode: GainNode | null = null;
    if (trackName === 'dialogue') foleyNode = dspMixer.getDialogueInputNode();
    else if (trackName === 'music') foleyNode = dspMixer.getMusicInputNode();
    else foleyNode = dspMixer.getFoleyInputNode();

    if (foleyNode) {
      gain.connect(foleyNode);
      return gain;
    }
  } catch (e) {
    // Fallback direct connection
  }

  gain.connect(ctx.destination);
  gain.connect(destinationNode);
  return gain;
}

// Sound Effects Generator using Web Audio API
export function playSoundEffect(type: SoundEffectType) {
  if (type === 'none') return;
  try {
    const { ctx } = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      connectToDestinations(gain);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'robot_beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      connectToDestinations(gain);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'magic') {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.05;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        connectToDestinations(gain);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } else if (type === 'tada') {
      const chord = [261.63, 329.63, 392.0, 523.25];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.setValueAtTime(freq * 1.25, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        connectToDestinations(gain);
        osc.start(now);
        osc.stop(now + 0.45);
      });
    } else if (type === 'bounce') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.18);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      connectToDestinations(gain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'success') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        osc.connect(gain);
        connectToDestinations(gain);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } else if (type === 'giggle') {
      [0, 0.08, 0.16, 0.24].forEach((t, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + (i % 2) * 200, now + t);
        gain.gain.setValueAtTime(0.15, now + t);
        gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.06);
        osc.connect(gain);
        connectToDestinations(gain);
        osc.start(now + t);
        osc.stop(now + t + 0.06);
      });
    } else if (type === 'whistle') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      connectToDestinations(gain);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'applause') {
      // Sitcom audience applause noise burst
      for (let i = 0; i < 8; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300 + Math.random() * 500, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        connectToDestinations(gain);
        osc.start(t);
        osc.stop(t + 0.12);
      }
    } else if (type === 'laugh_track') {
      // Sitcom laugh track pitch pulses
      [0, 0.07, 0.14, 0.22, 0.31, 0.4].forEach((t, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450 + (i % 3) * 120, now + t);
        gain.gain.setValueAtTime(0.18, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.08);
        osc.connect(gain);
        connectToDestinations(gain);
        osc.start(now + t);
        osc.stop(now + t + 0.08);
      });
    } else if (type === 'dramatic_sting') {
      // Dramatic TV Stinger chord
      [130.81, 164.81, 196.00, 246.94].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        connectToDestinations(gain);
        osc.start(now);
        osc.stop(now + 0.8);
      });
    } else if (type === 'fanfare') {
      // News TV Broadcast Fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.6 : 0.12));
        osc.connect(gain);
        connectToDestinations(gain);
        osc.start(t);
        osc.stop(t + (idx === 3 ? 0.6 : 0.12));
      });
    } else if (type === 'boing') {
      // Classic Cartoon Boing Spring
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      connectToDestinations(gain);
      osc.start(now);
      osc.stop(now + 0.38);
    }
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

let isDucked = false;
let currentBgVolume = 0.2;

export function setAudioDucking(ducking: boolean) {
  isDucked = ducking;
}

// Play Procedural Web Audio Vocal Speech Synthesizer (for video recording & speech audio stream)
export function playWebAudioVocalSpeech(
  text: string,
  characterStyle: string,
  pitch: number,
  durationMs: number
) {
  try {
    const { ctx } = getAudioContext();
    const now = ctx.currentTime;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const totalWords = Math.max(1, words.length);
    const wordDuration = Math.min(0.4, (durationMs / 1000) / totalWords);

    let baseFreq = 260;
    let waveType: OscillatorType = 'sine';

    if (characterStyle === 'robot') {
      baseFreq = 480 * pitch;
      waveType = 'square';
    } else if (characterStyle === 'dog') {
      baseFreq = 220 * pitch;
      waveType = 'triangle';
    } else if (characterStyle === 'wizard') {
      baseFreq = 180 * pitch;
      waveType = 'sine';
    } else if (characterStyle === 'dragon') {
      baseFreq = 140 * pitch;
      waveType = 'sawtooth';
    } else if (characterStyle === 'cat') {
      baseFreq = 420 * pitch;
      waveType = 'sine';
    } else if (characterStyle === 'astronaut') {
      baseFreq = 320 * pitch;
      waveType = 'sine';
    } else if (characterStyle === 'alien') {
      baseFreq = 580 * pitch;
      waveType = 'sine';
    } else if (characterStyle === 'presenter_female' || characterStyle === 'student') {
      baseFreq = 290 * pitch;
      waveType = 'sine';
    } else if (characterStyle === 'presenter_male' || characterStyle === 'instructor' || characterStyle === 'engineer') {
      baseFreq = 165 * pitch;
      waveType = 'triangle';
    } else {
      baseFreq = 240 * pitch;
      waveType = 'sine';
    }

    words.forEach((word, wIdx) => {
      const wordStartTime = now + wIdx * wordDuration;
      const syllables = Math.max(1, Math.ceil(word.length / 3));
      const sylDuration = Math.max(0.08, wordDuration / syllables);

      for (let s = 0; s < syllables; s++) {
        const time = wordStartTime + s * sylDuration;
        const osc = ctx.createOscillator();
        const formantFilter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // Vocal Formant Filter (simulates human/cartoon vocal tract)
        formantFilter.type = 'bandpass';
        const isQuestion = text.endsWith('?');
        const pitchIntonation = (wIdx / totalWords) * (isQuestion ? 80 : -30);
        const pitchVar = Math.sin(wIdx + s) * 35 + pitchIntonation;
        const currentFreq = Math.max(100, baseFreq + pitchVar);

        osc.type = waveType;
        osc.frequency.setValueAtTime(currentFreq, time);

        formantFilter.frequency.setValueAtTime(currentFreq * 2.2, time);
        formantFilter.Q.setValueAtTime(3.0, time);

        const startTime = Math.max(now, time);
        const peakTime = startTime + Math.max(0.01, sylDuration * 0.2);
        const endTime = startTime + Math.max(0.05, sylDuration * 0.9);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.35, peakTime);
        gain.gain.linearRampToValueAtTime(0.0001, endTime);

        osc.connect(formantFilter);
        formantFilter.connect(gain);
        connectToDestinations(gain, 1.2);

        osc.start(startTime);
        osc.stop(endTime + 0.02);
      }
    });
  } catch (err) {
    console.warn('Speech synth audio error:', err);
  }
}

// Play Procedural Cartoon Character Voice Bleeps (for video recording & fun audio)
export function playCartoonSpeechBleeps(
  characterStyle: string,
  pitch: number,
  durationMs: number,
  onWord?: () => void
) {
  playWebAudioVocalSpeech('', characterStyle, pitch, durationMs);
}

// Background Music Synthesizer
export function startBackgroundMusic(
  track: 'playful' | 'upbeat' | '8bit_arcade' | 'magic_mystery' | 'none',
  volume = 0.2
) {
  stopBackgroundMusic();
  if (track === 'none') return;

  isMusicPlaying = true;
  const { ctx } = getAudioContext();

  const scales: Record<string, number[]> = {
    playful: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25], // C Major
    upbeat: [293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 554.37, 587.33], // D Major
    '8bit_arcade': [261.63, 311.13, 349.23, 392.0, 466.16, 523.25], // C Minor Pentatonic
    magic_mystery: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0],
  };

  const scale = scales[track] || scales.playful;
  let noteIndex = 0;

  musicInterval = setInterval(() => {
    if (!isMusicPlaying) return;
    try {
      const now = ctx.currentTime;
      const freq = scale[noteIndex % scale.length];
      noteIndex = (noteIndex + Math.floor(Math.random() * 3) + 1) % scale.length;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = track === '8bit_arcade' ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const activeVol = isDucked ? volume * 0.015 : volume * 0.08;
      gain.gain.setValueAtTime(Math.max(0.0001, activeVol), now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      connectToDestinations(gain, 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Music synth error:', e);
    }
  }, track === 'upbeat' ? 240 : 340);
}

export function stopBackgroundMusic() {
  isMusicPlaying = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

// Play Custom Recorded Audio URL (routed through Web Audio destination for video capture)
export function playCustomAudio(
  audioUrl: string,
  pitch = 1.0,
  onEnd?: () => void
): { cancel: () => void } {
  let isCancelled = false;
  let currentSourceNode: AudioBufferSourceNode | null = null;
  let audioEl: HTMLAudioElement | null = null;

  try {
    const { ctx } = getAudioContext();
    fetch(audioUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => ctx.decodeAudioData(buffer))
      .then((decodedData) => {
        if (isCancelled) return;
        const source = ctx.createBufferSource();
        source.buffer = decodedData;
        source.playbackRate.value = Math.max(0.5, Math.min(2.0, pitch));
        connectToDestinations(source, 1.2);
        source.onended = () => {
          if (!isCancelled && onEnd) onEnd();
        };
        currentSourceNode = source;
        source.start(0);
      })
      .catch((err) => {
        console.warn('WebAudio decode failed, fallback to Audio Element:', err);
        if (isCancelled) return;
        audioEl = new Audio(audioUrl);
        audioEl.playbackRate = Math.max(0.5, Math.min(2.0, pitch));
        audioEl.onended = () => {
          if (!isCancelled && onEnd) onEnd();
        };
        audioEl.play().catch(() => {
          if (!isCancelled && onEnd) onEnd();
        });
      });
  } catch (e) {
    console.warn('playCustomAudio error:', e);
    if (onEnd) onEnd();
  }

  return {
    cancel: () => {
      isCancelled = true;
      try {
        if (currentSourceNode) currentSourceNode.stop();
        if (audioEl) {
          audioEl.pause();
          audioEl.currentTime = 0;
        }
      } catch (e) {
        // ignore
      }
    },
  };
}

// Helper to retrieve installed Web Speech API voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
}

export interface VoicePresetOption {
  id: string;
  label: string;
  category: string;
  pitch: number;
  rate: number;
}

export const CARTOON_VOICE_PRESETS: VoicePresetOption[] = [
  // 🎙️ Real People & Studio Presenter Voices
  { id: 'real_sarah', label: '👩‍💼 Sarah - Professional Studio Presenter (Natural Female)', category: '🎙️ Real People & Studio Presenters', pitch: 1.0, rate: 1.0 },
  { id: 'real_alex', label: '👨‍💼 Alex - Tech Lead & Cyber Specialist (Natural Male)', category: '🎙️ Real People & Studio Presenters', pitch: 0.95, rate: 1.0 },
  { id: 'real_marcus', label: '🎓 Prof. Marcus - Academic Instructor (Warm & Authoritative)', category: '🎙️ Real People & Studio Presenters', pitch: 0.9, rate: 0.95 },
  { id: 'real_dave', label: '👨‍💻 Dave - Sr Software Engineer (Clear Tech Voice)', category: '🎙️ Real People & Studio Presenters', pitch: 1.02, rate: 1.02 },
  { id: 'real_maya', label: '👩‍🎓 Maya - Enthusiastic Learner (Friendly & Bright)', category: '🎙️ Real People & Studio Presenters', pitch: 1.1, rate: 1.05 },
  { id: 'real_anchor', label: '📻 Broadcast News Anchor (Polished & Professional)', category: '🎙️ Real People & Studio Presenters', pitch: 0.98, rate: 1.0 },
  { id: 'real_podcaster', label: '🎙️ Studio Podcaster (Warm Conversational Voice)', category: '🎙️ Real People & Studio Presenters', pitch: 1.0, rate: 1.05 },

  // 🧽 Bikini Bottom & SpongeBob Pals
  { id: 'spongebob', label: '🧽 Sponge Spunky Glee', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 1.55, rate: 1.25 },
  { id: 'patrick', label: '⭐️ Goofy Starfish Buddy', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 0.55, rate: 0.8 },
  { id: 'squidward', label: '🦑 Sarcastic Clarinet Master', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 0.8, rate: 0.95 },
  { id: 'mrkrabs', label: '🦀 Nautical Pirate Captain', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 0.7, rate: 1.1 },
  { id: 'plankton', label: '🦠 Tiny Evil Genius', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 1.65, rate: 1.3 },
  { id: 'sandy', label: '🐿️ Texas Karate Scientist', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 1.35, rate: 1.15 },
  { id: 'gary', label: '🐌 Meow Snail Whisper', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 1.45, rate: 0.85 },
  { id: 'mrpuff', label: '⚓️ Boating Instructor Puff', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 1.25, rate: 0.9 },
  { id: 'dutchman', label: '👻 Flying Ghost Spectre', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 0.5, rate: 1.05 },
  { id: 'larry', label: '🦞 Larry Beach Lifeguard', category: '🧽 SpongeBob & Bikini Bottom Pals', pitch: 0.75, rate: 1.15 },

  // 🐰 Slapstick & Looney Legends
  { id: 'bugs', label: '🐰 Wise-Cracking Rabbit', category: '🐰 Slapstick & Looney Legends', pitch: 1.3, rate: 1.3 },
  { id: 'daffy', label: '🦆 Sputtering Quack Duck', category: '🐰 Slapstick & Looney Legends', pitch: 1.45, rate: 1.25 },
  { id: 'porky', label: '🐷 Stuttering Piggy Buddy', category: '🐰 Slapstick & Looney Legends', pitch: 1.15, rate: 0.9 },
  { id: 'tweety', label: '🐥 Sweet Tweety Canary', category: '🐰 Slapstick & Looney Legends', pitch: 1.85, rate: 1.1 },
  { id: 'sylvester', label: '🐱 Crafty Alley Cat', category: '🐰 Slapstick & Looney Legends', pitch: 0.85, rate: 1.1 },
  { id: 'droopy', label: '🐶 Sleepy Droopy Hound', category: '🐰 Slapstick & Looney Legends', pitch: 0.5, rate: 0.7 },
  { id: 'roadrunner', label: '🏃 Speed Runner Beep-Beep', category: '🐰 Slapstick & Looney Legends', pitch: 1.75, rate: 1.4 },
  { id: 'taz', label: '🌪️ Tasmanian Whirling Devil', category: '🐰 Slapstick & Looney Legends', pitch: 0.65, rate: 1.45 },

  // ⚡️ Anime & Superhero Toons
  { id: 'anime_hero', label: '⚡️ High-Voltage Anime Hero', category: '⚡️ Anime & Superhero Toons', pitch: 1.5, rate: 1.3 },
  { id: 'chibi_cat', label: '🐱 Kawaii Chibi Neko', category: '⚡️ Anime & Superhero Toons', pitch: 1.8, rate: 1.15 },
  { id: 'dragon_master', label: '🐉 Ancient Dragon Master', category: '⚡️ Anime & Superhero Toons', pitch: 0.55, rate: 0.85 },
  { id: 'justice_hero', label: '🦸 Bold Justice Defender', category: '⚡️ Anime & Superhero Toons', pitch: 0.85, rate: 1.1 },
  { id: 'ninja_whisper', label: '🥷 Shadow Ninja Assassin', category: '⚡️ Anime & Superhero Toons', pitch: 0.95, rate: 1.25 },
  { id: 'mecha_pilot', label: '🤖 Hot-Headed Mecha Pilot', category: '⚡️ Anime & Superhero Toons', pitch: 1.4, rate: 1.2 },

  // ✨ Classic & Fantasy Cartoons
  { id: 'default', label: '✨ Standard Voice Style', category: '✨ Classic & Fantasy Cartoons', pitch: 1.0, rate: 1.0 },
  { id: 'squeaky', label: '🐿️ Squeaky Chipmunk', category: '✨ Classic & Fantasy Cartoons', pitch: 1.65, rate: 1.25 },
  { id: 'deep', label: '🧙 Deep Wizard / Giant', category: '✨ Classic & Fantasy Cartoons', pitch: 0.6, rate: 0.9 },
  { id: 'hero', label: '🚀 Energetic Kid Hero', category: '✨ Classic & Fantasy Cartoons', pitch: 1.4, rate: 1.1 },
  { id: 'bunny', label: '🐰 Cute Bunny / Fairy', category: '✨ Classic & Fantasy Cartoons', pitch: 1.7, rate: 1.0 },
  { id: 'alien', label: '👽 Space Alien Bleep', category: '✨ Classic & Fantasy Cartoons', pitch: 0.7, rate: 1.35 },
  { id: 'robot', label: '🤖 Cyber Robot Echo', category: '✨ Classic & Fantasy Cartoons', pitch: 1.2, rate: 1.05 },
  { id: 'goblin', label: '🧟 Mischievous Goblin', category: '✨ Classic & Fantasy Cartoons', pitch: 0.65, rate: 1.2 },
  { id: 'calm', label: '🎓 Calm Educator', category: '✨ Classic & Fantasy Cartoons', pitch: 1.0, rate: 1.0 },
];

/**
 * Measure the real playback duration (ms) of a recorded audio clip
 * (base64 data URL or object URL) by loading it into a detached <audio>
 * element and reading its metadata — no playback/sound is produced.
 *
 * Used to replace the dialogue.length * 65ms guess with the actual
 * duration of a real mic recording, so scene timing and exported video
 * stay in sync with what was actually recorded instead of an estimate.
 */
export function measureAudioDurationMs(audioDataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    if (!audioDataUrl) {
      resolve(0);
      return;
    }
    const audio = new Audio();
    let settled = false;
    const finish = (ms: number) => {
      if (settled) return;
      settled = true;
      resolve(ms);
    };

    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        finish(Math.round(audio.duration * 1000));
      } else {
        // Some codecs (notably webm/opus from MediaRecorder) report
        // Infinity for duration until a seek forces a full parse.
        audio.currentTime = 1e10;
        audio.addEventListener(
          'durationchange',
          () => {
            if (isFinite(audio.duration) && audio.duration > 0) {
              finish(Math.round(audio.duration * 1000));
            } else {
              finish(0);
            }
          },
          { once: true }
        );
      }
    });
    audio.addEventListener('error', () => finish(0));
    // Safety timeout so a bad/unsupported file never hangs the caller.
    setTimeout(() => finish(0), 4000);

    audio.src = audioDataUrl;
  });
}

// Speak Dialogue line using Web Speech API with fallback to custom audio or cartoon speech bleeps
export function speakDialogueLine(
  text: string,
  pitch = 1.0,
  rate = 1.0,
  style = 'dog',
  onEnd?: () => void,
  customAudioUrl?: string,
  preferredVoiceName?: string
): { cancel: () => void } {
  if (customAudioUrl) {
    return playCustomAudio(customAudioUrl, pitch, onEnd);
  }

  let isCancelled = false;
  const isRealPersonStyle = [
    'presenter_female',
    'presenter_male',
    'instructor',
    'engineer',
    'student',
    'custom_photo',
  ].includes(style);

  // Use SpeechSynthesis if available
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Clear queued speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = Math.max(0.5, Math.min(2, pitch));
    utterance.rate = Math.max(0.7, Math.min(1.5, rate));

    // Try finding a suitable voice or user's chosen voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      let matchedVoice = null;
      if (preferredVoiceName) {
        matchedVoice = voices.find((v) => v.name === preferredVoiceName);
      }

      if (!matchedVoice && isRealPersonStyle) {
        // Find gender/style-matched natural real voice
        const isFemale = ['presenter_female', 'student'].includes(style);
        if (isFemale) {
          matchedVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Female') ||
                v.name.includes('Samantha') ||
                v.name.includes('Victoria') ||
                v.name.includes('Karen') ||
                v.name.includes('Serena') ||
                v.name.includes('Zira') ||
                v.name.includes('Google US English'))
          );
        } else {
          matchedVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Male') ||
                v.name.includes('Daniel') ||
                v.name.includes('Alex') ||
                v.name.includes('David') ||
                v.name.includes('George') ||
                v.name.includes('Google UK English Male'))
          );
        }
      }

      if (!matchedVoice) {
        matchedVoice =
          voices.find(
            (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
          ) || voices[0];
      }
      if (matchedVoice) utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (!isCancelled && onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (!isCancelled) {
        if (!isRealPersonStyle) {
          const estDuration = Math.max(1500, text.length * 70);
          playCartoonSpeechBleeps(style, pitch, estDuration);
        }
        setTimeout(() => {
          if (!isCancelled && onEnd) onEnd();
        }, Math.max(1500, text.length * 60));
      }
    };

    // Always play voice bleeps / audio tones in Web Audio API so video audio track captures voice speech
    const estDuration = Math.max(1500, text.length * 60);
    playWebAudioVocalSpeech(text, style, pitch, estDuration);

    window.speechSynthesis.speak(utterance);

    return {
      cancel: () => {
        isCancelled = true;
        window.speechSynthesis.cancel();
      },
    };
  } else {
    // Fallback if no Web Speech API
    const estDuration = Math.max(1500, text.length * 70);
    if (!isRealPersonStyle) {
      playCartoonSpeechBleeps(style, pitch, estDuration);
    }
    const timer = setTimeout(() => {
      if (!isCancelled && onEnd) onEnd();
    }, estDuration);

    return {
      cancel: () => {
        isCancelled = true;
        clearTimeout(timer);
      },
    };
  }
}

// -------------------------------------------------------------
// 🎵 SpongeBob & Kids Cartoon Sing-Along Theme Song Synthesizer
// -------------------------------------------------------------

export interface ThemeSongLyric {
  callout: string;
  response: string;
  emoji: string;
  durationMs: number;
}

export interface PureMelodyNote {
  freq: number;
  duration: number;
  type?: OscillatorType;
  chord?: number[];
}

export interface ThemeSongConfig {
  title: string;
  style: string;
  isInstrumental?: boolean;
  isRealStudio?: boolean;
  categoryType?: 'intro' | 'outro' | 'anthem' | 'melody';
  melodyNotes?: PureMelodyNote[];
  lyrics: ThemeSongLyric[];
}

// -------------------------------------------------------------
// 🎶 Real Melody Synthesizer Engine (Web Audio API)
// -------------------------------------------------------------
export function playRealMelodySequence(
  notes: PureMelodyNote[],
  onNoteStep?: (index: number, total: number, note: PureMelodyNote) => void,
  onEnd?: () => void
): { cancel: () => void } {
  let isCancelled = false;
  const timers: any[] = [];

  try {
    const { ctx } = getAudioContext();
    let timeOffset = 0;

    notes.forEach((note, idx) => {
      const startTime = ctx.currentTime + timeOffset;
      const duration = note.duration || 0.25;

      const timer = setTimeout(() => {
        if (!isCancelled && onNoteStep) {
          onNoteStep(idx, notes.length, note);
        }
      }, timeOffset * 1000);
      timers.push(timer);

      if (!isCancelled) {
        // Main Lead Note
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = note.type || 'triangle';
        osc.frequency.setValueAtTime(note.freq, startTime);

        gain.gain.setValueAtTime(0.28, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95);

        osc.connect(gain);
        connectToDestinations(gain, 0.45);

        osc.start(startTime);
        osc.stop(startTime + duration);

        // Harmony Chords
        if (note.chord && note.chord.length > 0) {
          note.chord.forEach((chordFreq) => {
            const chordOsc = ctx.createOscillator();
            const chordGain = ctx.createGain();
            chordOsc.type = 'sine';
            chordOsc.frequency.setValueAtTime(chordFreq, startTime);

            chordGain.gain.setValueAtTime(0.12, startTime);
            chordGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95);

            chordOsc.connect(chordGain);
            connectToDestinations(chordGain, 0.3);

            chordOsc.start(startTime);
            chordOsc.stop(startTime + duration);
          });
        }
      }

      timeOffset += duration;
    });

    const endTimer = setTimeout(() => {
      if (!isCancelled && onEnd) onEnd();
    }, timeOffset * 1000 + 300);
    timers.push(endTimer);
  } catch (err) {
    console.warn('Melody synthesis error:', err);
  }

  return {
    cancel: () => {
      isCancelled = true;
      timers.forEach((t) => clearTimeout(t));
    },
  };
}

export const THEME_SONG_PRESETS: Record<string, ThemeSongConfig> = {
  // --- 🎙️ REAL STUDIO INTRO THEMES ---
  studio_news_intro: {
    title: '🎙️ Live Studio Broadcast Intro (Grand Brass & Drums)',
    style: 'studio_news_intro',
    isInstrumental: true,
    isRealStudio: true,
    categoryType: 'intro',
    melodyNotes: [
      { freq: 261.63, duration: 0.18, chord: [130.81] },
      { freq: 329.63, duration: 0.18, chord: [164.81] },
      { freq: 392.00, duration: 0.18, chord: [196.00] },
      { freq: 523.25, duration: 0.4, chord: [261.63, 329.63, 392.00] },
      { freq: 587.33, duration: 0.18 },
      { freq: 659.25, duration: 0.18 },
      { freq: 783.99, duration: 0.6, chord: [261.63, 392.00, 523.25] },
      { freq: 659.25, duration: 0.2 },
      { freq: 783.99, duration: 0.2 },
      { freq: 1046.5, duration: 0.8, chord: [261.63, 329.63, 392.00, 523.25] },
    ],
    lyrics: [
      { callout: '🎙️ [Live Broadcast Trumpet Fanfare]', response: '📺 LIVE STUDIO BROADCAST INTRO 🔴', emoji: '🎙️', durationMs: 2500 },
      { callout: '📡 [Drums & Brass Studio Chimes]', response: '✨ Welcome to Tonight\'s Episode! 🚀', emoji: '📡', durationMs: 2500 },
    ],
  },
  podcast_theme_intro: {
    title: '🎧 Modern Tech Podcast Intro (Smooth Chords & Beats)',
    style: 'podcast_theme_intro',
    isInstrumental: true,
    isRealStudio: true,
    categoryType: 'intro',
    melodyNotes: [
      { freq: 329.63, duration: 0.25, type: 'triangle', chord: [164.81] },
      { freq: 392.00, duration: 0.25, type: 'triangle' },
      { freq: 493.88, duration: 0.25, type: 'triangle', chord: [246.94] },
      { freq: 587.33, duration: 0.45, type: 'sine', chord: [293.66, 392.00] },
      { freq: 523.25, duration: 0.25, type: 'sine' },
      { freq: 493.88, duration: 0.25, type: 'sine' },
      { freq: 392.00, duration: 0.7, type: 'triangle', chord: [196.00, 246.94, 293.66] },
    ],
    lyrics: [
      { callout: '🎧 [Acoustic Studio Beat Start]', response: '🎙️ Welcome to the Tech Podcast Show! ☕', emoji: '🎧', durationMs: 2400 },
      { callout: '☕ [Smooth Lounge Piano Chords]', response: '✨ Let\'s Dive Into the Episode! 💡', emoji: '☕', durationMs: 2400 },
    ],
  },
  keynote_epic_intro: {
    title: '⚡ Tech Keynote Fanfare Intro (Cinematic Rising Synth)',
    style: 'keynote_epic_intro',
    isInstrumental: true,
    isRealStudio: true,
    categoryType: 'intro',
    melodyNotes: [
      { freq: 220.00, duration: 0.2, type: 'sawtooth', chord: [110.00] },
      { freq: 277.18, duration: 0.2, type: 'sawtooth' },
      { freq: 329.63, duration: 0.2, type: 'sawtooth', chord: [164.81] },
      { freq: 440.00, duration: 0.4, type: 'sawtooth', chord: [220.00, 277.18] },
      { freq: 554.37, duration: 0.2, type: 'sine' },
      { freq: 659.25, duration: 0.2, type: 'sine' },
      { freq: 880.00, duration: 0.8, type: 'sawtooth', chord: [220.00, 329.63, 440.00, 554.37] },
    ],
    lyrics: [
      { callout: '⚡ [Cinematic Rising Synth Fanfare]', response: '🚀 KEYNOTE INTRO: TECH SUMMIT 2026 ⚡', emoji: '⚡', durationMs: 2500 },
      { callout: '📢 [Sub-Bass Impact & Stage Lights]', response: '✨ Live Presentation Begins Now! 💡', emoji: '📢', durationMs: 2500 },
    ],
  },

  // --- 🎬 REAL STUDIO OUTRO THEMES ---
  show_credits_outro: {
    title: '🎬 Live Studio Show Outro & Credits (Jazz & Brass Sign-Off)',
    style: 'show_credits_outro',
    isInstrumental: true,
    isRealStudio: true,
    categoryType: 'outro',
    melodyNotes: [
      { freq: 523.25, duration: 0.22, chord: [261.63, 329.63] },
      { freq: 493.88, duration: 0.22, chord: [246.94] },
      { freq: 440.00, duration: 0.22, chord: [220.00] },
      { freq: 392.00, duration: 0.45, chord: [196.00, 261.63] },
      { freq: 349.23, duration: 0.22 },
      { freq: 329.63, duration: 0.22 },
      { freq: 261.63, duration: 0.8, chord: [130.81, 196.00, 261.63, 329.63] },
    ],
    lyrics: [
      { callout: '🎬 [Polished Brass Outro & Credits]', response: '📺 THANKS FOR WATCHING! LIKE & SUBSCRIBE! 🌟', emoji: '🎬', durationMs: 2500 },
      { callout: '🎉 [Final Studio Cymbal Roll]', response: '✨ SEE YOU IN THE NEXT EPISODE! 👋', emoji: '👋', durationMs: 2500 },
    ],
  },
  epic_curtain_outro: {
    title: '🌟 Grand Finale Outro (Uplifting Victory Fanfare)',
    style: 'epic_curtain_outro',
    isInstrumental: true,
    isRealStudio: true,
    categoryType: 'outro',
    melodyNotes: [
      { freq: 392.00, duration: 0.2, chord: [196.00] },
      { freq: 523.25, duration: 0.2, chord: [261.63] },
      { freq: 659.25, duration: 0.2, chord: [329.63] },
      { freq: 783.99, duration: 0.5, chord: [261.63, 392.00, 523.25] },
      { freq: 880.00, duration: 0.25 },
      { freq: 1046.5, duration: 0.9, chord: [261.63, 329.63, 392.00, 523.25, 659.25] },
    ],
    lyrics: [
      { callout: '🌟 [Uplifting Victory Chimes]', response: '🎉 EPISODE FINALE // GREAT JOB TODAY! 🏆', emoji: '🌟', durationMs: 2500 },
      { callout: '🚀 [Grand Finale Applause]', response: '✨ KEEP CREATING & LEARNING! 💻', emoji: '🏆', durationMs: 2500 },
    ],
  },
  chill_tech_outro: {
    title: '☕ Cyber Tech Talk Outro (Lounge Chords & Synth Sign-Off)',
    style: 'chill_tech_outro',
    isInstrumental: true,
    isRealStudio: true,
    categoryType: 'outro',
    melodyNotes: [
      { freq: 440.00, duration: 0.28, type: 'sine', chord: [220.00] },
      { freq: 392.00, duration: 0.28, type: 'sine' },
      { freq: 329.63, duration: 0.28, type: 'sine', chord: [164.81] },
      { freq: 293.66, duration: 0.45, type: 'triangle' },
      { freq: 261.63, duration: 0.8, type: 'sine', chord: [130.81, 164.81, 196.00, 261.63] },
    ],
    lyrics: [
      { callout: '☕ [Smooth Cyber Lounge Chords]', response: '🎧 Episode Wrap & Sign-Off ☕', emoji: '☕', durationMs: 2400 },
      { callout: '💡 [Fading Ambient Synth Beats]', response: '✨ Until Next Time, Stay Curious! 🚀', emoji: '💡', durationMs: 2400 },
    ],
  },

  // --- 🎺 PURE INSTRUMENTAL CARTOON MELODIES ---
  sunshine_parade: {
    title: '🎺 Happy Sunshine Parade (Upbeat Brass Melody)',
    style: 'sunshine_parade',
    isInstrumental: true,
    categoryType: 'intro',
    melodyNotes: [
      { freq: 261.63, duration: 0.22, chord: [130.81] },
      { freq: 329.63, duration: 0.22, chord: [164.81] },
      { freq: 392.00, duration: 0.22, chord: [196.00] },
      { freq: 523.25, duration: 0.45, chord: [261.63, 329.63, 392.00] },
      { freq: 493.88, duration: 0.22 },
      { freq: 523.25, duration: 0.22 },
      { freq: 587.33, duration: 0.35 },
      { freq: 659.25, duration: 0.55, chord: [329.63, 392.00, 523.25] },
      { freq: 587.33, duration: 0.22 },
      { freq: 523.25, duration: 0.22 },
      { freq: 392.00, duration: 0.35 },
      { freq: 523.25, duration: 0.7, chord: [261.63, 329.63, 392.00, 523.25] },
    ],
    lyrics: [
      { callout: '🎵 [Joyful Brass Parade Intro Note]', response: '🎺 Instrumental Sunshine Tune 🎶', emoji: '🎺', durationMs: 2500 },
      { callout: '🎶 [Upbeat Horns & Accordion]', response: '✨ Let\'s Code Together Theme Jingle! 🎉', emoji: '🎷', durationMs: 2500 },
    ],
  },
  retro_arcade: {
    title: '🎮 Retro 8-Bit Pixel Jam (Arcade Chiptune)',
    style: 'retro_arcade',
    isInstrumental: true,
    categoryType: 'intro',
    melodyNotes: [
      { freq: 523.25, duration: 0.16, type: 'square' },
      { freq: 659.25, duration: 0.16, type: 'square' },
      { freq: 783.99, duration: 0.16, type: 'square' },
      { freq: 1046.5, duration: 0.32, type: 'square', chord: [261.63] },
      { freq: 880.00, duration: 0.16, type: 'square' },
      { freq: 783.99, duration: 0.16, type: 'square' },
      { freq: 659.25, duration: 0.16, type: 'square' },
      { freq: 587.33, duration: 0.16, type: 'square' },
      { freq: 659.25, duration: 0.16, type: 'square' },
      { freq: 783.99, duration: 0.32, type: 'square' },
      { freq: 1046.5, duration: 0.65, type: 'square', chord: [523.25, 659.25, 783.99] },
    ],
    lyrics: [
      { callout: '👾 [8-Bit Chiptune Synth Start]', response: '🎮 Level 1 Code Start Melody! 🚀', emoji: '👾', durationMs: 2200 },
      { callout: '⚡ [Arcade Victory Arpeggio]', response: '🕹️ Ready to Play Cartoon Episode! ✨', emoji: '⚡', durationMs: 2200 },
    ],
  },
  tropical_island: {
    title: '🌊 Tropical Island Breeze (Ukulele & Nautical Melody)',
    style: 'tropical_island',
    isInstrumental: true,
    categoryType: 'intro',
    melodyNotes: [
      { freq: 392.00, duration: 0.28, type: 'sine', chord: [196.00] },
      { freq: 523.25, duration: 0.28, type: 'sine', chord: [261.63] },
      { freq: 659.25, duration: 0.38, type: 'sine', chord: [329.63] },
      { freq: 587.33, duration: 0.28, type: 'sine' },
      { freq: 523.25, duration: 0.28, type: 'sine' },
      { freq: 493.88, duration: 0.28, type: 'sine' },
      { freq: 440.00, duration: 0.28, type: 'sine' },
      { freq: 392.00, duration: 0.45, type: 'sine', chord: [196.00, 261.63] },
      { freq: 523.25, duration: 0.7, type: 'sine', chord: [261.63, 329.63, 392.00] },
    ],
    lyrics: [
      { callout: '🍍 [Nautical Ukulele Strum]', response: '🌊 Under the Sea Ocean Tune 🐠', emoji: '🍍', durationMs: 2400 },
      { callout: '🌴 [Tropical Beach Accordion]', response: '🏖️ Welcome to the Island Show! ✨', emoji: '🏝️', durationMs: 2400 },
    ],
  },
  funky_duck: {
    title: '🎷 Funky Duck Wobble (Playful Bounce Melody)',
    style: 'funky_duck',
    isInstrumental: true,
    categoryType: 'outro',
    melodyNotes: [
      { freq: 220.00, duration: 0.2, type: 'sawtooth' },
      { freq: 293.66, duration: 0.2, type: 'sawtooth' },
      { freq: 329.63, duration: 0.2, type: 'sawtooth' },
      { freq: 440.00, duration: 0.35, type: 'triangle', chord: [220.00] },
      { freq: 392.00, duration: 0.2, type: 'triangle' },
      { freq: 329.63, duration: 0.2, type: 'triangle' },
      { freq: 293.66, duration: 0.2, type: 'triangle' },
      { freq: 440.00, duration: 0.65, type: 'sawtooth', chord: [220.00, 277.18, 329.63] },
    ],
    lyrics: [
      { callout: '🦆 [Funky Bass Wobble]', response: '🎷 Funky Cartoon Groove Beat 🎶', emoji: '🦆', durationMs: 2200 },
    ],
  },
  magic_castle: {
    title: '🔮 Magic Castle Waltz (Enchanted Bell Melody)',
    style: 'magic_castle',
    isInstrumental: true,
    categoryType: 'outro',
    melodyNotes: [
      { freq: 523.25, duration: 0.3, type: 'sine' },
      { freq: 659.25, duration: 0.3, type: 'sine' },
      { freq: 783.99, duration: 0.3, type: 'sine' },
      { freq: 987.77, duration: 0.4, type: 'sine', chord: [493.88] },
      { freq: 1046.5, duration: 0.7, type: 'sine', chord: [523.25, 659.25] },
    ],
    lyrics: [
      { callout: '🧙‍♂️ [Enchanted Bell Chime]', response: '✨ Wizard Magic Academy Theme 🔮', emoji: '🔮', durationMs: 2200 },
    ],
  },

  // --- 🎤 SING-ALONG ANTHEMS ---
  lets_code_together: {
    title: "🌟 Let's Code Together! (Channel Flagship Anthem)",
    style: 'lets_code_together',
    categoryType: 'intro',
    melodyNotes: [
      { freq: 261.63, duration: 0.25, chord: [130.81] },
      { freq: 329.63, duration: 0.25, chord: [164.81] },
      { freq: 392.00, duration: 0.25, chord: [196.00] },
      { freq: 523.25, duration: 0.5, chord: [261.63, 329.63] },
      { freq: 587.33, duration: 0.25 },
      { freq: 659.25, duration: 0.25, chord: [329.63] },
      { freq: 783.99, duration: 0.6, chord: [261.63, 392.00, 523.25] },
      { freq: 659.25, duration: 0.25 },
      { freq: 587.33, duration: 0.25 },
      { freq: 523.25, duration: 0.7, chord: [261.63, 329.63, 392.00, 523.25] },
    ],
    lyrics: [
      { callout: 'OOOOOH! WHO IS READY TO LEARN AND PLAY TODAY?', response: "WE ARE! LET'S CODE TOGETHERRRR! 💻 🌟", emoji: '🎉', durationMs: 3200 },
      { callout: 'GRAB YOUR KEYBOARDS AND SING ALONG!', response: "1... 2... 3... LET'S CODE TOGETHERRRR! 🚀 🎶", emoji: '🎤', durationMs: 3200 },
      { callout: 'SMART & FUN & CARTOON FRIENDS FOREVER!', response: 'WELCOME TO THE CARTOON CODE SHOW! 📺 ✨', emoji: '📺', durationMs: 3400 },
    ],
  },
  spongebob: {
    title: '🧽 SpongeBob Nautical Sing-Along',
    style: 'spongebob',
    melodyNotes: [
      { freq: 392.00, duration: 0.2, type: 'sine', chord: [196.00] },
      { freq: 523.25, duration: 0.2, type: 'sine', chord: [261.63] },
      { freq: 659.25, duration: 0.3, type: 'sine', chord: [329.63] },
      { freq: 587.33, duration: 0.2, type: 'sine' },
      { freq: 523.25, duration: 0.2, type: 'sine' },
      { freq: 493.88, duration: 0.2, type: 'sine' },
      { freq: 440.00, duration: 0.2, type: 'sine' },
      { freq: 392.00, duration: 0.4, type: 'sine', chord: [196.00, 261.63] },
      { freq: 523.25, duration: 0.7, type: 'sine', chord: [261.63, 329.63, 392.00] },
    ],
    lyrics: [
      { callout: 'OOOOOH! ARE YOU READY KIDS?', response: 'AYE AYE CAPTAIN! 🌊', emoji: '🏴‍☠️', durationMs: 3000 },
      { callout: "I CAN'T HEAR YOU!!", response: 'AYE AYE CAPTAIN!! 🎉', emoji: '🗣️', durationMs: 2600 },
      { callout: 'WHO LIVES IN A CODE LAB AND LEARNS EVERY DAY?', response: 'CARTOON CODE FRIENDS! 🍍', emoji: '🧽', durationMs: 3400 },
      { callout: 'SPONGY & FUNNY & SMART AS CAN BE!', response: "LET'S CODE TOGETHER UNDER THE SEA! 🐠 🌊", emoji: '🌊', durationMs: 3400 },
      { callout: 'READY? 3... 2... 1...', response: "IT'S SHOW TIME!! 🚀", emoji: '✨', durationMs: 2800 },
    ],
  },
  medley: {
    title: '🎪 Ultimate Cartoon Medley (Combination)',
    style: 'medley',
    melodyNotes: [
      { freq: 523.25, duration: 0.2, type: 'square' },
      { freq: 659.25, duration: 0.2, type: 'triangle' },
      { freq: 783.99, duration: 0.25, type: 'sine', chord: [261.63] },
      { freq: 880.00, duration: 0.25, type: 'triangle' },
      { freq: 1046.5, duration: 0.65, type: 'sine', chord: [523.25, 659.25, 783.99] },
    ],
    lyrics: [
      { callout: 'OOOOOH! ARE YOU READY KIDS?', response: 'AYE AYE CAPTAIN! 🌊', emoji: '🏴‍☠️', durationMs: 2800 },
      { callout: 'WHO IS READY TO LEARN AND PLAY TODAY?', response: "LET'S CODE TOGETHERRRR! 💻 🌟", emoji: '🎤', durationMs: 3200 },
      { callout: '3... 2... 1... BLASTOFF INTO ADVENTURE!', response: "IT'S SHOW TIME ON THE CARTOON SHOW! 🚀 💥", emoji: '✨', durationMs: 3200 },
    ],
  },
};

// Play cheerful musical brass chime notes using Web Audio API
export function playThemeSongChime() {
  try {
    const { ctx } = getAudioContext();
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(gain);
      connectToDestinations(gain, 0.4);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {
    console.error(e);
  }
}

export function playThemeSongIntro(
  themeKey = 'lets_code_together',
  _char1Name = 'Sponge',
  _char2Name = 'Pat',
  onLyricUpdate?: (index: number, total: number, lyric: ThemeSongLyric) => void,
  onEnd?: () => void
): { cancel: () => void } {
  let isCancelled = false;
  let melodyHandle: { cancel: () => void } | null = null;

  const config = THEME_SONG_PRESETS[themeKey] || THEME_SONG_PRESETS.lets_code_together;
  const lyrics = config.lyrics;
  const notesToPlay = config.melodyNotes || THEME_SONG_PRESETS.sunshine_parade.melodyNotes!;

  // Start upbeat background music loop
  startBackgroundMusic('upbeat', 0.35);

  // Play initial fanfare chime
  playThemeSongChime();

  // Play Pure Real Musical Melody (NO cartoon speech TTS reading over music)
  melodyHandle = playRealMelodySequence(
    notesToPlay,
    (idx, total) => {
      if (!isCancelled) {
        playSoundEffect('pop');
        playThemeSongChime();
        if (onLyricUpdate) {
          const lyr = lyrics[idx % lyrics.length] || lyrics[0];
          onLyricUpdate(idx, total, lyr);
        }
      }
    },
    () => {
      if (!isCancelled) {
        playSoundEffect('tada');
        setTimeout(() => {
          if (!isCancelled) {
            stopBackgroundMusic();
            if (onEnd) onEnd();
          }
        }, 600);
      }
    }
  );

  return {
    cancel: () => {
      isCancelled = true;
      if (melodyHandle) melodyHandle.cancel();
      stopBackgroundMusic();
    },
  };
}

