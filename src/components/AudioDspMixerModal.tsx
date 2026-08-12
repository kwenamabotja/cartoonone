import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sliders, Music, Mic, Radio, Sparkles, X, Activity, ShieldCheck, Zap, Gauge } from 'lucide-react';
import { dspMixer, DSPTrackName, DSPState, LoudnessTargetPreset, LOUDNESS_TARGETS } from '../utils/audioDSP';
import { playSoundEffect } from '../utils/audioSynthesizer';

interface AudioDspMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSpeaking?: boolean;
}

export const AudioDspMixerModal: React.FC<AudioDspMixerModalProps> = ({
  isOpen,
  onClose,
  isSpeaking = false,
}) => {
  const [dspState, setDspState] = useState<DSPState>(dspMixer.getState());

  useEffect(() => {
    if (isOpen) {
      dspMixer.init();
      setDspState(dspMixer.getState());
    }
  }, [isOpen]);

  // Poll the measured-loudness reading while the mixer is open so the LUFS
  // meter reflects what's actually playing, not just a snapshot from open time.
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setDspState(dspMixer.getState());
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Sync dialogue active ducking when speech prop changes
  useEffect(() => {
    dspMixer.setDialogueActive(isSpeaking);
    setDspState(dspMixer.getState());
  }, [isSpeaking]);

  if (!isOpen) return null;

  const handleTrackVolumeChange = (track: DSPTrackName, vol: number) => {
    dspMixer.setTrackVolume(track, vol);
    setDspState(dspMixer.getState());
  };

  const handleTrackMuteToggle = (track: DSPTrackName) => {
    const current = dspState.tracks[track].muted;
    dspMixer.setTrackMuted(track, !current);
    setDspState(dspMixer.getState());
  };

  const handleReverbChange = (val: number) => {
    dspMixer.setReverbLevel(val);
    setDspState(dspMixer.getState());
  };

  const handleLoudnessTargetChange = (target: LoudnessTargetPreset) => {
    dspMixer.setLoudnessTarget(target);
    setDspState(dspMixer.getState());
  };

  const handleAutoNormalizeToggle = () => {
    dspMixer.setAutoNormalizeEnabled(!dspState.autoNormalizeEnabled);
    setDspState(dspMixer.getState());
  };

  const trackInfo: Record<DSPTrackName, { title: string; icon: any; color: string; desc: string }> = {
    dialogue: {
      title: '1. Dialogue & Speech',
      icon: Mic,
      color: 'text-cyan-400',
      desc: 'Voices, TTS speech synthesis & recorded mic tracks',
    },
    ambient: {
      title: '2. Ambient Environment',
      icon: Radio,
      color: 'text-emerald-400',
      desc: 'Room tone, background hums, TV studio atmosphere',
    },
    foley: {
      title: '3. Foley & Sound FX',
      icon: Sparkles,
      color: 'text-amber-400',
      desc: 'Boings, pops, applause, stings & comedy slapstick FX',
    },
    music: {
      title: '4. Musical Score',
      icon: Music,
      color: 'text-purple-400',
      desc: 'Background theme loops (Auto-ducks during speech)',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-950 border-2 border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl text-white space-y-6 relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-400/30 rounded-2xl">
              <Sliders className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>🎛️ Broadcast Web Audio DSP Mixer</span>
                <span className="bg-cyan-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  4-Track DSP
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Broadcast TV audio compression, impulse reverb, and speech music ducking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AUTOMATIC DUCKING & COMPRESSION STATUS BADGE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
              dspState.isDialogueActive || isSpeaking
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
          >
            <Zap className={`w-5 h-5 ${dspState.isDialogueActive || isSpeaking ? 'text-amber-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>AUTOMATIC MUSIC DUCKING:</span>
                <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-amber-400/40">
                  {dspState.isDialogueActive || isSpeaking ? '-12 dB (25% Gain)' : '0 dB (100% Gain)'}
                </span>
              </div>
              <p className="text-[10px] opacity-80">
                {dspState.isDialogueActive || isSpeaking
                  ? 'Speech detected! Music automatically ducked for clarity.'
                  : 'Music track at full volume during non-speech pauses.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <span>TV COMPRESSOR & REVERB:</span>
                <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-cyan-400/40">
                  4:1 Broadcast Ratio
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                DynamicsCompressorNode active at -18dB threshold to eliminate clipping.
              </p>
            </div>
          </div>
        </div>

        {/* 4-TRACK MIXER SLIDERS */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
          {(['dialogue', 'ambient', 'foley', 'music'] as DSPTrackName[]).map((trackKey) => {
            const track = dspState.tracks[trackKey];
            const info = trackInfo[trackKey];
            const Icon = info.icon;

            return (
              <div
                key={trackKey}
                className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 w-48 shrink-0">
                  <div className={`p-2 bg-slate-900 rounded-lg ${info.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">{info.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[130px]">
                      {info.desc}
                    </span>
                  </div>
                </div>

                {/* Volume Slider & Percentage */}
                <div className="flex-1 w-full flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={track.muted ? 0 : track.volume}
                    onChange={(e) => handleTrackVolumeChange(trackKey, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-xs font-mono font-bold text-slate-300 w-10 text-right">
                    {track.muted ? '0%' : `${Math.round(track.volume * 100)}%`}
                  </span>

                  {/* Mute Button */}
                  <button
                    onClick={() => handleTrackMuteToggle(trackKey)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      track.muted
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {track.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ROOM IMPULSE REVERB WET MIX CONTROL */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-200">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Room Impulse Response Convolver Reverb:</span>
            </span>
            <span className="font-mono text-purple-300">{Math.round(dspState.reverbWetLevel * 100)}% Wet</span>
          </div>

          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={dspState.reverbWetLevel}
            onChange={(e) => handleReverbChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
            <span>0% (Dry Broadcast Studio)</span>
            <span>25% (Acoustic Stage)</span>
            <span>50% (Concert Hall Reverb)</span>
          </div>
        </div>

        {/* LOUDNESS NORMALIZATION (YouTube / Broadcast TV Delivery Standards) */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-slate-200">
            <span className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span>Integrated Loudness Normalization:</span>
            </span>
            <span className="font-mono text-[10px] bg-slate-950 px-2 py-1 rounded border border-emerald-400/40 text-emerald-300">
              {dspState.measuredLUFS !== null ? `${dspState.measuredLUFS} LUFS` : 'measuring…'}
              {dspState.loudnessTarget !== 'off' && ` / target ${LOUDNESS_TARGETS[dspState.loudnessTarget]} LUFS`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: 'youtube', label: `YouTube (${LOUDNESS_TARGETS.youtube} LUFS)` },
                { key: 'broadcast_tv', label: `Broadcast TV (${LOUDNESS_TARGETS.broadcast_tv} LUFS)` },
                { key: 'off', label: 'Off (Raw Mix)' },
              ] as { key: LoudnessTargetPreset; label: string }[]
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleLoudnessTargetChange(opt.key)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  dspState.loudnessTarget === opt.key
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}

            <button
              onClick={handleAutoNormalizeToggle}
              disabled={dspState.loudnessTarget === 'off'}
              className={`ml-auto px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                dspState.autoNormalizeEnabled
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Auto-Normalize: {dspState.autoNormalizeEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            Slowly rides the master gain toward the target so an episode isn't quieter or louder
            than others when uploaded — YouTube normalizes playback to ~-14 LUFS anyway, so mixing
            to it directly avoids the platform doing it inconsistently for you. Approximate rolling
            estimate, not a certified broadcast meter.
          </p>
        </div>

        {/* TEST FOLEY SOUND FX BUTTONS */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
            <span>Test Foley FX:</span>
            <button
              onClick={() => playSoundEffect('pop')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-200 cursor-pointer"
            >
              🍿 Pop
            </button>
            <button
              onClick={() => playSoundEffect('applause')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-200 cursor-pointer"
            >
              👏 Applause
            </button>
            <button
              onClick={() => playSoundEffect('dramatic_sting')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-200 cursor-pointer"
            >
              🎷 TV Sting
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl text-xs shadow-lg cursor-pointer"
          >
            Apply DSP Settings
          </button>
        </div>
      </div>
    </div>
  );
};
