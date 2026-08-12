import { VisemeCue } from '../types';

/**
 * textToVisemes.ts
 *
 * Generates a VisemeCue[] timeline from a raw dialogue string, so the
 * frame-accurate VisemeMouth renderer (src/remotion/CharacterScene.tsx)
 * always has real mouth-shape timing to play back instead of a generic
 * open/close toggle.
 *
 * This is a lightweight heuristic grapheme-to-viseme mapper, not a true
 * phoneme engine (no dictionary lookups, no IPA). It's tuned to be
 * "good enough to read as talking" at 2D-cutout-cartoon scale, and to
 * approximately match the existing 65ms/char pacing used elsewhere in
 * the app (see RemotionExportModal.tsx) so viseme timing lines up with
 * scene duration estimates.
 *
 * If/when real TTS timing data becomes available (word-level timestamps
 * from a neural voice API), prefer that over this estimator — swap the
 * caller to build VisemeCue[] from the real timestamps instead.
 */

const MS_PER_CHAR = 65; // matches existing pacing heuristic elsewhere in the app
const MIN_CUE_MS = 60; // don't emit cues faster than this; mouths can't read at higher hz
const WORD_GAP_MS = 40; // brief 'rest' between words

type Viseme = VisemeCue['viseme'];

// Ordered grapheme -> viseme rules. Longer/more specific patterns first.
// M = closed lips (m, b, p), F = teeth-on-lip (f, v), vowels map to their
// mouth-shape family, everything else falls back to a neutral open shape.
const GRAPHEME_RULES: Array<{ pattern: RegExp; viseme: Viseme }> = [
  { pattern: /^(mb|mp)/i, viseme: 'M' },
  { pattern: /^(ph|ff|fr|fl)/i, viseme: 'F' },
  { pattern: /^(oo|ou|ow)/i, viseme: 'U' },
  { pattern: /^(ee|ea|ie|ei|ey)/i, viseme: 'I' },
  { pattern: /^(oa|oe|au|aw)/i, viseme: 'O' },
  { pattern: /^(ai|ay|ay)/i, viseme: 'A' },
  { pattern: /^[m]/i, viseme: 'M' },
  { pattern: /^[bp]/i, viseme: 'M' },
  { pattern: /^[fv]/i, viseme: 'F' },
  { pattern: /^[aá]/i, viseme: 'A' },
  { pattern: /^[eé]/i, viseme: 'E' },
  { pattern: /^[ií]/i, viseme: 'I' },
  { pattern: /^[oó]/i, viseme: 'O' },
  { pattern: /^[uú]/i, viseme: 'U' },
];

/** Classify a single grapheme chunk (1-2 letters) into a viseme shape. */
function classifyChunk(chunk: string): Viseme | null {
  for (const rule of GRAPHEME_RULES) {
    if (rule.pattern.test(chunk)) return rule.viseme;
  }
  return null;
}

/** Break one word into a rough sequence of viseme-bearing chunks. */
function wordToVisemeSequence(word: string): Viseme[] {
  const clean = word.replace(/[^a-zA-Z']/g, '');
  if (!clean) return [];

  const sequence: Viseme[] = [];
  let i = 0;
  while (i < clean.length) {
    const twoChar = clean.slice(i, i + 2);
    const oneChar = clean.slice(i, i + 1);
    const twoMatch = classifyChunk(twoChar);
    if (twoMatch) {
      sequence.push(twoMatch);
      i += 2;
      continue;
    }
    const oneMatch = classifyChunk(oneChar);
    if (oneMatch) {
      sequence.push(oneMatch);
      i += 1;
      continue;
    }
    // Consonant with no specific mapping: skip it silently rather than
    // emitting a cue — consonants without a distinct mouth shape just
    // ride on the surrounding vowel's viseme in this simplified model.
    i += 1;
  }

  // Collapse consecutive duplicate visemes (e.g. long vowels) into one cue.
  return sequence.filter((v, idx) => idx === 0 || v !== sequence[idx - 1]);
}

/**
 * Generate a VisemeCue[] timeline for a dialogue line.
 *
 * @param dialogue    The spoken line.
 * @param startMs     Offset to shift the whole timeline by (default 0),
 *                     useful if this line starts partway into a scene.
 */
export function generateVisemesForDialogue(dialogue: string, startMs = 0): VisemeCue[] {
  const trimmed = (dialogue || '').trim();
  if (!trimmed) {
    return [{ timeOffsetMs: startMs, viseme: 'rest' }];
  }

  const words = trimmed.split(/\s+/);
  const cues: VisemeCue[] = [];
  let cursor = startMs;

  for (const word of words) {
    const wordDurationMs = Math.max(MIN_CUE_MS, word.length * MS_PER_CHAR);
    const sequence = wordToVisemeSequence(word);

    if (sequence.length === 0) {
      // No vowel/labial detected (e.g. punctuation-only token) — treat as
      // a brief rest rather than skipping the timing slot entirely.
      cues.push({ timeOffsetMs: Math.round(cursor), viseme: 'rest' });
      cursor += wordDurationMs;
      continue;
    }

    const perCueMs = Math.max(MIN_CUE_MS, wordDurationMs / sequence.length);
    sequence.forEach((viseme) => {
      cues.push({ timeOffsetMs: Math.round(cursor), viseme });
      cursor += perCueMs;
    });

    // Brief rest between words so consecutive words don't blur into one
    // continuous mouth shape.
    cues.push({ timeOffsetMs: Math.round(cursor), viseme: 'rest' });
    cursor += WORD_GAP_MS;
  }

  // Always end resting.
  if (cues[cues.length - 1]?.viseme !== 'rest') {
    cues.push({ timeOffsetMs: Math.round(cursor), viseme: 'rest' });
  }

  return cues;
}

/** Total estimated duration (ms) of a generated viseme timeline, handy for
 * sanity-checking against the app's existing scene-duration estimates. */
export function estimateVisemeTimelineDurationMs(cues: VisemeCue[]): number {
  if (cues.length === 0) return 0;
  return cues[cues.length - 1].timeOffsetMs;
}
