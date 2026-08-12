import { SoundEffectType } from '../types';
import { getAudioContext } from './audioSynthesizer';

export type DSPTrackName = 'dialogue' | 'ambient' | 'foley' | 'music';

export interface DSPTrackConfig {
  volume: number; // 0 to 1
  muted: boolean;
}

export interface DSPState {
  isDialogueActive: boolean;
  duckingAmount: number; // e.g., 0.25 (-12dB) during speech
  reverbWetLevel: number; // 0 (dry) to 1 (full wet)
  reverbPreset: 'studio' | 'room' | 'hall' | 'none';
  masterVolume: number;
  tracks: Record<DSPTrackName, DSPTrackConfig>;
}

class AudioDSPMixer {
  private ctx: AudioContext | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private convolverWetGain: GainNode | null = null;
  private convolverDryGain: GainNode | null = null;

  // Track Gain Nodes
  private trackGains: Record<DSPTrackName, GainNode | null> = {
    dialogue: null,
    ambient: null,
    foley: null,
    music: null,
  };

  // Music Ducking Node
  private musicDuckingGain: GainNode | null = null;

  // Active Ambient / Music Oscillators / Buffers
  private ambientSourceNode: AudioNode | null = null;
  private musicInterval: any = null;
  private isMusicPlaying = false;

  private state: DSPState = {
    isDialogueActive: false,
    duckingAmount: 0.25, // Duck music to 25% when dialogue plays
    reverbWetLevel: 0.15,
    reverbPreset: 'studio',
    masterVolume: 0.9,
    tracks: {
      dialogue: { volume: 1.0, muted: false },
      ambient: { volume: 0.35, muted: false },
      foley: { volume: 0.8, muted: false },
      music: { volume: 0.45, muted: false },
    },
  };

  private isInitialized = false;

  public init() {
    if (this.isInitialized && this.ctx) return;

    try {
      const { ctx, destinationNode } = getAudioContext();
      this.ctx = ctx;

      // 1. Master Compression Node (Broadcast TV Mastering)
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-18, this.ctx.currentTime); // -18 dB
      this.masterCompressor.knee.setValueAtTime(12, this.ctx.currentTime); // Soft knee
      this.masterCompressor.ratio.setValueAtTime(4, this.ctx.currentTime); // 4:1 broadcast ratio
      this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime); // Fast 3ms attack
      this.masterCompressor.release.setValueAtTime(0.25, this.ctx.currentTime); // 250ms release

      // 2. Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.state.masterVolume, this.ctx.currentTime);

      // Connect Master Gain -> Master Compressor -> Speakers & Recording Stream
      this.masterGain.connect(this.masterCompressor);
      this.masterCompressor.connect(this.ctx.destination);
      this.masterCompressor.connect(destinationNode);

      // 3. Room Impulse Response Convolver Node (Reverb)
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createImpulseResponseBuffer(this.ctx, 1.2, 2.0); // 1.2s decay

      this.convolverWetGain = this.ctx.createGain();
      this.convolverDryGain = this.ctx.createGain();

      this.convolverWetGain.gain.setValueAtTime(this.state.reverbWetLevel, this.ctx.currentTime);
      this.convolverDryGain.gain.setValueAtTime(1 - this.state.reverbWetLevel, this.ctx.currentTime);

      // Convolver Routing
      this.convolver.connect(this.convolverWetGain);
      this.convolverWetGain.connect(this.masterGain);
      this.convolverDryGain.connect(this.masterGain);

      // 4. Create Track Gain Nodes
      (['dialogue', 'ambient', 'foley', 'music'] as DSPTrackName[]).forEach((track) => {
        const gainNode = this.ctx!.createGain();
        const conf = this.state.tracks[track];
        gainNode.gain.setValueAtTime(conf.muted ? 0 : conf.volume, this.ctx!.currentTime);
        this.trackGains[track] = gainNode;
      });

      // Special Ducking Gain Node on Music Track
      this.musicDuckingGain = this.ctx.createGain();
      this.musicDuckingGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // Routing Tracks:
      // Dialogue -> Dry Gain & Convolver Reverb
      this.trackGains.dialogue?.connect(this.convolverDryGain);
      this.trackGains.dialogue?.connect(this.convolver!);

      // Ambient -> Dry Gain
      this.trackGains.ambient?.connect(this.convolverDryGain);

      // Foley -> Dry Gain & Subtle Reverb
      this.trackGains.foley?.connect(this.convolverDryGain);
      this.trackGains.foley?.connect(this.convolver!);

      // Music -> Music Ducking Gain -> Dry Gain
      this.trackGains.music?.connect(this.musicDuckingGain);
      this.musicDuckingGain.connect(this.convolverDryGain);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio DSP initialization warning:', e);
    }
  }

  // Synthesize Synthetic Studio/Room Impulse Response
  private createImpulseResponseBuffer(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(2, length, sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      // Exponential decay white noise
      const volume = Math.pow(1 - n, decay);
      leftChannel[i] = (Math.random() * 2 - 1) * volume;
      rightChannel[i] = (Math.random() * 2 - 1) * volume;
    }

    return buffer;
  }

  // Automatic Music Ducking Controller
  public setDialogueActive(active: boolean) {
    this.init();
    if (!this.ctx || !this.musicDuckingGain) return;

    this.state.isDialogueActive = active;
    const now = this.ctx.currentTime;
    const targetGain = active ? this.state.duckingAmount : 1.0;

    // Smooth gain ramp over 150ms for television broadcast ducking transition
    this.musicDuckingGain.gain.cancelScheduledValues(now);
    this.musicDuckingGain.gain.setValueAtTime(this.musicDuckingGain.gain.value, now);
    this.musicDuckingGain.gain.linearRampToValueAtTime(targetGain, now + 0.15);
  }

  // Set Track Volume
  public setTrackVolume(track: DSPTrackName, volume: number) {
    this.init();
    this.state.tracks[track].volume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.trackGains[track]) {
      const now = this.ctx.currentTime;
      const conf = this.state.tracks[track];
      const gainVal = conf.muted ? 0 : conf.volume;
      this.trackGains[track]!.gain.cancelScheduledValues(now);
      this.trackGains[track]!.gain.setValueAtTime(gainVal, now);
    }
  }

  // Toggle Track Mute
  public setTrackMuted(track: DSPTrackName, muted: boolean) {
    this.init();
    this.state.tracks[track].muted = muted;
    this.setTrackVolume(track, this.state.tracks[track].volume);
  }

  // Set Reverb Wet Mix
  public setReverbLevel(level: number) {
    this.init();
    this.state.reverbWetLevel = Math.max(0, Math.min(1, level));
    if (this.ctx && this.convolverWetGain && this.convolverDryGain) {
      const now = this.ctx.currentTime;
      this.convolverWetGain.gain.setValueAtTime(this.state.reverbWetLevel, now);
      this.convolverDryGain.gain.setValueAtTime(1 - this.state.reverbWetLevel, now);
    }
  }

  // Get Output Node for Dialogue Track Routing
  public getDialogueInputNode(): GainNode | null {
    this.init();
    return this.trackGains.dialogue;
  }

  // Get Output Node for Foley Track Routing
  public getFoleyInputNode(): GainNode | null {
    this.init();
    return this.trackGains.foley;
  }

  // Get Output Node for Music Track Routing
  public getMusicInputNode(): GainNode | null {
    this.init();
    return this.trackGains.music;
  }

  // Get Current DSP State
  public getState(): DSPState {
    return { ...this.state };
  }
}

export const dspMixer = new AudioDSPMixer();
