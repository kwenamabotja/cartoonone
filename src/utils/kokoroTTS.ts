// Free, local, high-quality neural text-to-speech.
//
// Uses Kokoro-82M (Apache-2.0, open weights) running 100% in the browser via
// kokoro-js / transformers.js (WebGPU if available, otherwise WASM on CPU).
// There is no API key and no per-request cost: the ~85MB model is downloaded
// once from Hugging Face's public CDN, cached by the browser, and every line
// of dialogue after that is generated locally for free.
//
// This produces a real decoded audio buffer (unlike window.speechSynthesis),
// which means it can be routed through the Web Audio graph and correctly
// captured by MediaRecorder during video export — fixing both voice quality
// AND export audio sync at the same time.

import type { KokoroTTS as KokoroTTSType } from 'kokoro-js';

export type HQVoiceStatus =
  | 'idle'
  | 'unsupported'
  | 'loading'
  | 'ready'
  | 'error';

interface HQVoiceState {
  status: HQVoiceStatus;
  progress: number; // 0-100, only meaningful while status === 'loading'
  message: string;
}

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

let ttsInstance: KokoroTTSType | null = null;
let loadPromise: Promise<KokoroTTSType> | null = null;

let state: HQVoiceState = { status: 'idle', progress: 0, message: '' };
const listeners = new Set<(s: HQVoiceState) => void>();

// Whether the user has opted in to HD voices (persisted — this triggers a
// one-time download, so we don't do it silently on first app load).
const ENABLED_KEY = 'cartoon_hq_voices_enabled';
export function isHQVoicesEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}
export function setHQVoicesEnabled(enabled: boolean) {
  try {
    localStorage.setItem(ENABLED_KEY, String(enabled));
  } catch {
    // ignore
  }
  if (enabled) {
    // Kick off the (free) download in the background right away.
    void ensureLoaded();
  }
}

export function subscribeHQVoiceStatus(cb: (s: HQVoiceState) => void): () => void {
  listeners.add(cb);
  cb(state);
  return () => listeners.delete(cb);
}

function setState(next: Partial<HQVoiceState>) {
  state = { ...state, ...next };
  listeners.forEach((cb) => cb(state));
}

function browserSupportsHQVoices(): boolean {
  if (typeof window === 'undefined') return false;
  // Kokoro-js needs WebAssembly (universal) or WebGPU (faster). WASM alone is
  // enough to run it, so we only hard-fail if WebAssembly itself is missing.
  return typeof WebAssembly !== 'undefined';
}

async function ensureLoaded(): Promise<KokoroTTSType> {
  if (ttsInstance) return ttsInstance;
  if (loadPromise) return loadPromise;

  if (!browserSupportsHQVoices()) {
    setState({ status: 'unsupported', message: 'This browser cannot run local AI voices.' });
    throw new Error('HQ voices unsupported in this browser');
  }

  setState({ status: 'loading', progress: 0, message: 'Preparing HD voice engine…' });

  loadPromise = (async () => {
    const { KokoroTTS } = await import('kokoro-js');

    const useWebGPU = typeof navigator !== 'undefined' && !!(navigator as any).gpu;

    const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: useWebGPU ? 'fp32' : 'q8',
      device: useWebGPU ? 'webgpu' : 'wasm',
      progress_callback: (p: any) => {
        if (p && typeof p.progress === 'number') {
          setState({
            status: 'loading',
            progress: Math.round(p.progress),
            message: `Downloading free HD voice model… ${Math.round(p.progress)}% (one-time, ~85MB)`,
          });
        }
      },
    });

    ttsInstance = tts;
    setState({ status: 'ready', progress: 100, message: 'HD voices ready.' });
    return tts;
  })().catch((err) => {
    loadPromise = null;
    setState({ status: 'error', message: err?.message || 'Failed to load HD voice engine.' });
    throw err;
  });

  return loadPromise;
}

// Simple in-memory + sessionStorage-free cache: same line + voice + speed ->
// same generated clip, so re-previewing a line (or re-recording after an
// edit) doesn't regenerate audio that's already been made.
const audioCache = new Map<string, string>(); // key -> blob: URL

function cacheKey(text: string, voice: string, speed: number) {
  return `${voice}::${speed.toFixed(2)}::${text}`;
}

/**
 * Generate real spoken audio for a line of dialogue, entirely for free and
 * locally in the browser. Returns a blob: URL playable via <audio> or
 * decodeable via the Web Audio API (see playCustomAudio in audioSynthesizer.ts).
 *
 * Throws if HQ voices are disabled, unsupported, or generation fails — callers
 * should catch and fall back to window.speechSynthesis.
 */
export async function generateHQDialogueAudio(
  text: string,
  kokoroVoice: string,
  speed: number
): Promise<string> {
  if (!isHQVoicesEnabled()) {
    throw new Error('HQ voices not enabled');
  }
  const key = cacheKey(text, kokoroVoice, speed);
  const cached = audioCache.get(key);
  if (cached) return cached;

  const tts = await ensureLoaded();
  const clampedSpeed = Math.max(0.5, Math.min(1.6, speed));
  const audio = await tts.generate(text, { voice: kokoroVoice as any, speed: clampedSpeed });
  const blobUrl = URL.createObjectURL(audio.toBlob());
  audioCache.set(key, blobUrl);
  return blobUrl;
}

/**
 * Pre-generate audio for every line in a set of scenes ahead of time (e.g.
 * before starting a recording/export), so playback during capture is instant
 * and perfectly in sync instead of stalling on first-use model loading.
 * Safe to call even if HQ voices are disabled — it's then a no-op.
 */
export async function preloadHQDialogueAudio(
  lines: Array<{ text: string; kokoroVoice: string; speed: number }>,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  if (!isHQVoicesEnabled() || lines.length === 0) return;
  let done = 0;
  for (const line of lines) {
    try {
      await generateHQDialogueAudio(line.text, line.kokoroVoice, line.speed);
    } catch {
      // If HQ generation fails partway, stop preloading — normal per-line
      // fallback to speechSynthesis will still kick in during playback.
      break;
    }
    done += 1;
    onProgress?.(done, lines.length);
  }
}

export function getHQVoiceStatus(): HQVoiceState {
  return state;
}
