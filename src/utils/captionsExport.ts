import { CartoonProject, RoleplayScene } from '../types';

/**
 * captionsExport.ts
 *
 * Generates standard .srt (SubRip) and .vtt (WebVTT) caption files from a
 * project's scene dialogue + timing, so episodes ship with real, downloadable
 * captions instead of relying on burned-in on-screen text or YouTube's
 * (frequently inaccurate) auto-captions.
 *
 * This is an accessibility requirement for broadcast delivery, and it helps
 * YouTube reach/SEO — captions are indexed and searchable, and let viewers
 * watch sound-off.
 *
 * Duration math intentionally mirrors the estimate used elsewhere in the
 * export pipeline (RemotionExportModal.tsx): prefer a scene's real measured
 * durationSeconds (set for recorded mic audio, see MicrophoneVoiceRecorder)
 * and fall back to the same dialogue-length heuristic otherwise, so caption
 * timing always matches exported video timing.
 */

const FALLBACK_MS_PER_CHAR = 65;
const FALLBACK_MIN_SCENE_MS = 2500;

function estimateSceneDurationMs(scene: RoleplayScene): number {
  if (scene.durationSeconds) return scene.durationSeconds * 1000;
  return Math.max(FALLBACK_MIN_SCENE_MS, scene.dialogue.length * FALLBACK_MS_PER_CHAR + (scene.timingHoldMs || 600));
}

interface CaptionCue {
  startMs: number;
  endMs: number;
  text: string;
}

/** Build the cue list (start/end/text) shared by both SRT and VTT output. */
function buildCaptionCues(project: CartoonProject): CaptionCue[] {
  const cues: CaptionCue[] = [];
  let cursorMs = 0;

  for (const scene of project.scenes) {
    const durationMs = estimateSceneDurationMs(scene);

    // Theme-song / music-only scenes have no spoken line to caption.
    if (!scene.isMusicOnly && scene.dialogue && scene.dialogue.trim()) {
      const speaker = project.characters.find((c) => c.id === scene.speakerId);
      // Broadcast closed-caption convention: prefix the speaker's name when
      // there's more than one character in the cast, so viewers watching
      // without audio can still tell who's talking.
      const text =
        project.characters.length > 1 && speaker
          ? `${speaker.name.toUpperCase()}: ${scene.dialogue.trim()}`
          : scene.dialogue.trim();

      // Leave a small pad at the very start/end of the spoken window so the
      // cue doesn't flash exactly on the cut.
      const padMs = 150;
      cues.push({
        startMs: cursorMs + padMs,
        endMs: cursorMs + durationMs - padMs,
        text,
      });
    }

    cursorMs += durationMs;
  }

  return cues.filter((c) => c.endMs > c.startMs);
}

function formatSrtTimestamp(ms: number): string {
  const clamped = Math.max(0, Math.round(ms));
  const hours = Math.floor(clamped / 3600000);
  const minutes = Math.floor((clamped % 3600000) / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  const millis = clamped % 1000;
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

function formatVttTimestamp(ms: number): string {
  // Same as SRT but with a '.' millisecond separator instead of ','.
  return formatSrtTimestamp(ms).replace(',', '.');
}

/** Generate a standard SubRip (.srt) caption file as a string. */
export function generateSRT(project: CartoonProject): string {
  const cues = buildCaptionCues(project);
  return cues
    .map((cue, idx) => {
      return `${idx + 1}\n${formatSrtTimestamp(cue.startMs)} --> ${formatSrtTimestamp(cue.endMs)}\n${cue.text}\n`;
    })
    .join('\n');
}

/** Generate a standard WebVTT (.vtt) caption file as a string. */
export function generateVTT(project: CartoonProject): string {
  const cues = buildCaptionCues(project);
  const body = cues
    .map((cue, idx) => {
      return `${idx + 1}\n${formatVttTimestamp(cue.startMs)} --> ${formatVttTimestamp(cue.endMs)}\n${cue.text}\n`;
    })
    .join('\n');
  return `WEBVTT\n\n${body}`;
}

/** Trigger a browser download of generated caption text as a file. */
export function downloadCaptionFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
