import { SoundEffectType } from '../types';
import { getAudioContext } from './audioSynthesizer';

export type DSPTrackName = 'dialogue' | 'ambient' | 'foley' | 'music';

export type LoudnessTargetPreset = 'youtube' | 'broadcast_tv' | 'off';

// Integrated loudness targets in LUFS. YouTube normalizes uploaded audio to
// roughly -14 LUFS integrated; ATSC A/85 (US broadcast TV delivery) targets
// -24 LUFS. Mixing to these up front means the platform won't turn an
// episode up or down inconsistently against other channels/episodes.
export const LOUDNESS_TARGETS: Record<Exclude<LoudnessTargetPreset, 'off'>, number> = {
  youtube: -14,
  broadcast_tv: -24,
};

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
  // Loudness normalization
  loudnessTarget: LoudnessTargetPreset;
  autoNormalizeEnabled: boolean;
  measuredLUFS: number | null; // rolling integrated-loudness estimate, or null before enough audio has played
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

  // Loudness Normalization: makeup gain applied before final compression,
  // driven by a K-weighting-approximation filter chain + analysis tap.
  private loudnessMakeupGain: GainNode | null = null;
  private loudnessFilterStage1: BiquadFilterNode | null = null; // high-shelf (ITU-R BS.1770 stage 1 approximation)
  private loudnessFilterStage2: BiquadFilterNode | null = null; // high-pass (ITU-R BS.1770 stage 2 approximation)
  private loudnessProcessor: ScriptProcessorNode | null = null;
  private loudnessSilentSink: GainNode | null = null; // keeps the processor node pulled without producing audible output
  private loudnessRollingBlocks: number[] = []; // recent block mean-square values, used as a short integration window
  private static readonly LOUDNESS_WINDOW_BLOCKS = 40; // ~3-4s of history at default buffer size

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
    loudnessTarget: 'youtube',
    autoNormalizeEnabled: true,
    measuredLUFS: null,
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

      // 2b. Loudness Makeup Gain — sits between master gain and the final
      // compressor, continuously nudged by the loudness analysis tap below
      // to bring the mix toward the selected LUFS target.
      this.loudnessMakeupGain = this.ctx.createGain();
      this.loudnessMakeupGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // Connect Master Gain -> Loudness Makeup -> Master Compressor -> Speakers & Recording Stream
      this.masterGain.connect(this.loudnessMakeupGain);
      this.loudnessMakeupGain.connect(this.masterCompressor);
      this.masterCompressor.connect(this.ctx.destination);
      this.masterCompressor.connect(destinationNode);

      // 2c. Loudness Analysis Tap — approximates ITU-R BS.1770 K-weighting
      // with a high-shelf + high-pass biquad pair, then measures mean-square
      // energy of the actual mixed output to estimate integrated LUFS.
      // This taps the post-compression signal (what actually gets sent to
      // the listener/export) without feeding back into the audible chain.
      this.loudnessFilterStage1 = this.ctx.createBiquadFilter();
      this.loudnessFilterStage1.type = 'highshelf';
      this.loudnessFilterStage1.frequency.setValueAtTime(1681.97, this.ctx.currentTime);
      this.loudnessFilterStage1.gain.setValueAtTime(3.99881, this.ctx.currentTime);

      this.loudnessFilterStage2 = this.ctx.createBiquadFilter();
      this.loudnessFilterStage2.type = 'highpass';
      this.loudnessFilterStage2.frequency.setValueAtTime(38.13, this.ctx.currentTime);
      this.loudnessFilterStage2.Q.setValueAtTime(0.5, this.ctx.currentTime);

      // ScriptProcessorNode is deprecated but remains the simplest
      // cross-browser way to read raw samples without an external
      // AudioWorklet module/build step.
      this.loudnessProcessor = this.ctx.createScriptProcessor(4096, 2, 2);
      this.loudnessProcessor.onaudioprocess = (event) => this.handleLoudnessAnalysis(event);

      this.loudnessSilentSink = this.ctx.createGain();
      this.loudnessSilentSink.gain.setValueAtTime(0, this.ctx.currentTime);

      this.masterCompressor.connect(this.loudnessFilterStage1);
      this.loudnessFilterStage1.connect(this.loudnessFilterStage2);
      this.loudnessFilterStage2.connect(this.loudnessProcessor);
      this.loudnessProcessor.connect(this.loudnessSilentSink);
      this.loudnessSilentSink.connect(this.ctx.destination);

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

  // Analyze the post-compression mix for integrated loudness (approximate
  // ITU-R BS.1770 method: K-weight, mean-square, LUFS = -0.691 + 10*log10(MS))
  // and slowly nudge the makeup gain toward the selected target. This is an
  // ungated rolling estimate (no silence-gating blocks like a certified
  // meter) — good enough to auto-level a mix consistently, not a substitute
  // for a real loudness meter before final delivery.
  private handleLoudnessAnalysis(event: AudioProcessingEvent) {
    const input = event.inputBuffer;
    const left = input.getChannelData(0);
    const right = input.numberOfChannels > 1 ? input.getChannelData(1) : left;

    let sumSquares = 0;
    for (let i = 0; i < left.length; i++) {
      const sampleAvg = (left[i] + right[i]) / 2;
      sumSquares += sampleAvg * sampleAvg;
    }
    const blockMeanSquare = sumSquares / left.length;

    this.loudnessRollingBlocks.push(blockMeanSquare);
    if (this.loudnessRollingBlocks.length > AudioDSPMixer.LOUDNESS_WINDOW_BLOCKS) {
      this.loudnessRollingBlocks.shift();
    }

    const windowMeanSquare =
      this.loudnessRollingBlocks.reduce((a, b) => a + b, 0) / this.loudnessRollingBlocks.length;

    // Skip near-silence (nothing playing) so the meter/gain doesn't chase noise floor.
    if (windowMeanSquare < 1e-9) {
      return;
    }

    const estimatedLUFS = -0.691 + 10 * Math.log10(windowMeanSquare);
    this.state.measuredLUFS = Math.round(estimatedLUFS * 10) / 10;

    if (!this.ctx || !this.loudnessMakeupGain) return;
    if (!this.state.autoNormalizeEnabled || this.state.loudnessTarget === 'off') return;

    const targetLUFS = LOUDNESS_TARGETS[this.state.loudnessTarget];
    const deltaDb = targetLUFS - estimatedLUFS;
    const currentMakeup = this.loudnessMakeupGain.gain.value;
    let desiredMakeup = currentMakeup * Math.pow(10, deltaDb / 20);

    // Clamp to a sane range (-20dB to +12dB overall makeup) so a bad
    // reading can't runaway the gain to silence or clipping.
    desiredMakeup = Math.max(0.1, Math.min(4.0, desiredMakeup));

    // Slow exponential approach (multi-second time constant) — this is a
    // leveler, not a limiter, so it should never be audible as pumping.
    this.loudnessMakeupGain.gain.setTargetAtTime(desiredMakeup, this.ctx.currentTime, 2.5);
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

  // Set Loudness Normalization Target (YouTube ~-14 LUFS, Broadcast TV ~-24 LUFS, or off)
  public setLoudnessTarget(target: LoudnessTargetPreset) {
    this.init();
    this.state.loudnessTarget = target;
    if (target === 'off' && this.ctx && this.loudnessMakeupGain) {
      // Ease back to unity gain rather than snapping, to avoid a jump.
      this.loudnessMakeupGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 2.5);
    }
  }

  // Toggle whether the makeup gain actively chases the loudness target,
  // independent of which target is selected (lets a user watch the meter
  // without the mix changing under them).
  public setAutoNormalizeEnabled(enabled: boolean) {
    this.init();
    this.state.autoNormalizeEnabled = enabled;
  }

  // Current rolling integrated-loudness estimate in LUFS, or null until
  // enough audio has played to produce a reading.
  public getMeasuredLoudnessLUFS(): number | null {
    return this.state.measuredLUFS;
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
