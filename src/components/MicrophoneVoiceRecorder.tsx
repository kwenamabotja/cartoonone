import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Volume2, Check, Radio, Sparkles, AlertCircle } from 'lucide-react';
import { playCustomAudio } from '../utils/audioSynthesizer';

interface MicrophoneVoiceRecorderProps {
  label?: string;
  existingAudioUrl?: string;
  pitch?: number;
  onAudioSave: (audioDataUrl: string | undefined) => void;
}

export const MicrophoneVoiceRecorder: React.FC<MicrophoneVoiceRecorderProps> = ({
  label = 'Voice Recording',
  existingAudioUrl,
  pitch = 1.0,
  onAudioSave,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(existingAudioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlaybackCancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setAudioUrl(existingAudioUrl);
  }, [existingAudioUrl]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      audioPlaybackCancelRef.current?.();
    };
  }, []);

  const handleStartRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported mimeType
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop()); // release mic track
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioUrl(base64data);
          onAudioSave(base64data);
        };
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      setMicError('Could not access microphone. Please allow microphone permission in your browser.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePlayRecording = () => {
    if (!audioUrl) return;
    setIsPlaying(true);

    audioPlaybackCancelRef.current?.();
    const playback = playCustomAudio(audioUrl, pitch, () => {
      setIsPlaying(false);
    });
    audioPlaybackCancelRef.current = playback.cancel;
  };

  const handleDeleteRecording = () => {
    audioPlaybackCancelRef.current?.();
    setAudioUrl(undefined);
    onAudioSave(undefined);
    setIsPlaying(false);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Mic className="w-3.5 h-3.5 text-red-400" />
          {label}
        </span>
        {audioUrl && (
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
            <Check className="w-3 h-3" /> Custom Voice Recorded
          </span>
        )}
      </div>

      {micError && (
        <div className="bg-red-950/60 border border-red-500/40 p-2 rounded-lg text-red-300 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={handleStartRecording}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            {audioUrl ? 'Re-record Mic' : 'Record Mic Voice'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStopRecording}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold text-white flex items-center gap-1.5 animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            Stop Recording ({recordingTime}s)
          </button>
        )}

        {audioUrl && !isRecording && (
          <>
            <button
              type="button"
              onClick={handlePlayRecording}
              disabled={isPlaying}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isPlaying ? 'Playing...' : 'Play Custom Voice'}
            </button>

            <button
              type="button"
              onClick={handleDeleteRecording}
              className="p-1.5 bg-slate-800 hover:bg-red-900/60 hover:text-red-300 text-slate-400 rounded-lg transition-colors"
              title="Delete Recording (Revert to AI Synth)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-[11px] text-red-400 font-bold bg-red-950/40 p-2 rounded-lg border border-red-500/30">
          <Radio className="w-3.5 h-3.5 animate-ping text-red-500" />
          <span>Recording live microphone input... Speak into your mic!</span>
        </div>
      )}
    </div>
  );
};
