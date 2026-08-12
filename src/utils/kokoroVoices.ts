// Maps this app's existing cartoon voice presets (see CARTOON_VOICE_PRESETS in
// audioSynthesizer.ts) to real Kokoro-82M neural TTS voices, so every preset gets
// an actual free, locally-generated spoken voice instead of the OS's robotic
// speechSynthesis voice.
//
// Kokoro ships ~28 base voices (realistic adult male/female, US + UK English).
// It has no "cartoon" voices, so for squeaky/deep/silly presets we pick the
// closest-sounding base voice and then nudge pitch/speed on top (see
// kokoroTTS.ts) to recreate the cartoon character without costing anything.

export interface KokoroVoiceMapping {
  kokoroVoice: string; // a valid Kokoro voice id, e.g. "af_heart"
  speed: number; // native Kokoro speaking-speed multiplier (0.5 - 1.6 is sane)
  pitchShift: number; // extra playback pitch multiplier applied after generation
}

const DEFAULT_MAPPING: KokoroVoiceMapping = {
  kokoroVoice: 'af_heart',
  speed: 1.0,
  pitchShift: 1.0,
};

// preset id (from CARTOON_VOICE_PRESETS) -> Kokoro voice + tuning
export const VOICE_PRESET_TO_KOKORO: Record<string, KokoroVoiceMapping> = {
  // Real people / studio presenters — use the closest natural Kokoro voice as-is
  real_sarah: { kokoroVoice: 'af_heart', speed: 1.0, pitchShift: 1.0 },
  real_alex: { kokoroVoice: 'am_michael', speed: 1.0, pitchShift: 1.0 },
  real_marcus: { kokoroVoice: 'bm_george', speed: 0.95, pitchShift: 0.97 },
  real_dave: { kokoroVoice: 'am_puck', speed: 1.02, pitchShift: 1.0 },
  real_maya: { kokoroVoice: 'af_bella', speed: 1.05, pitchShift: 1.03 },
  real_anchor: { kokoroVoice: 'bf_emma', speed: 1.0, pitchShift: 1.0 },
  real_podcaster: { kokoroVoice: 'am_fenrir', speed: 1.0, pitchShift: 1.0 },

  // SpongeBob & Bikini Bottom pals
  spongebob: { kokoroVoice: 'af_bella', speed: 1.2, pitchShift: 1.35 },
  patrick: { kokoroVoice: 'am_fenrir', speed: 0.8, pitchShift: 0.7 },
  squidward: { kokoroVoice: 'bm_george', speed: 0.95, pitchShift: 0.85 },
  mrkrabs: { kokoroVoice: 'am_michael', speed: 1.05, pitchShift: 0.8 },
  plankton: { kokoroVoice: 'am_puck', speed: 1.25, pitchShift: 1.45 },
  sandy: { kokoroVoice: 'af_nova', speed: 1.1, pitchShift: 1.15 },
  gary: { kokoroVoice: 'af_sky', speed: 0.85, pitchShift: 1.25 },
  mrpuff: { kokoroVoice: 'bf_isabella', speed: 0.9, pitchShift: 1.05 },
  dutchman: { kokoroVoice: 'bm_lewis', speed: 1.0, pitchShift: 0.65 },
  larry: { kokoroVoice: 'am_fenrir', speed: 1.1, pitchShift: 0.85 },

  // Slapstick & Looney legends
  bugs: { kokoroVoice: 'am_puck', speed: 1.25, pitchShift: 1.1 },
  daffy: { kokoroVoice: 'am_eric', speed: 1.2, pitchShift: 1.25 },
  porky: { kokoroVoice: 'am_echo', speed: 0.85, pitchShift: 1.05 },
  tweety: { kokoroVoice: 'af_sky', speed: 1.05, pitchShift: 1.5 },
  sylvester: { kokoroVoice: 'am_onyx', speed: 1.05, pitchShift: 0.9 },
  droopy: { kokoroVoice: 'bm_daniel', speed: 0.65, pitchShift: 0.6 },
  roadrunner: { kokoroVoice: 'af_alloy', speed: 1.4, pitchShift: 1.4 },
  taz: { kokoroVoice: 'am_liam', speed: 1.4, pitchShift: 0.75 },

  // Anime & superhero
  anime_hero: { kokoroVoice: 'am_puck', speed: 1.25, pitchShift: 1.25 },
  chibi_cat: { kokoroVoice: 'af_sky', speed: 1.1, pitchShift: 1.5 },
  dragon_master: { kokoroVoice: 'bm_lewis', speed: 0.85, pitchShift: 0.65 },
  justice_hero: { kokoroVoice: 'bm_george', speed: 1.0, pitchShift: 0.9 },
  ninja_whisper: { kokoroVoice: 'am_onyx', speed: 1.15, pitchShift: 0.95 },
  mecha_pilot: { kokoroVoice: 'am_eric', speed: 1.15, pitchShift: 1.15 },

  // Classic & fantasy
  default: { kokoroVoice: 'af_heart', speed: 1.0, pitchShift: 1.0 },
  squeaky: { kokoroVoice: 'af_sky', speed: 1.15, pitchShift: 1.5 },
  deep: { kokoroVoice: 'bm_lewis', speed: 0.85, pitchShift: 0.65 },
  hero: { kokoroVoice: 'am_puck', speed: 1.1, pitchShift: 1.15 },
  bunny: { kokoroVoice: 'af_alloy', speed: 1.0, pitchShift: 1.4 },
  alien: { kokoroVoice: 'am_onyx', speed: 1.2, pitchShift: 0.75 },
  robot: { kokoroVoice: 'am_echo', speed: 1.0, pitchShift: 1.05 },
  goblin: { kokoroVoice: 'am_liam', speed: 1.1, pitchShift: 0.7 },
  calm: { kokoroVoice: 'af_heart', speed: 0.95, pitchShift: 1.0 },
};

// Character "style" (visual style) -> Kokoro voice, used when no voicePreset was chosen
export const STYLE_TO_KOKORO: Record<string, KokoroVoiceMapping> = {
  presenter_female: { kokoroVoice: 'af_heart', speed: 1.0, pitchShift: 1.0 },
  presenter_male: { kokoroVoice: 'am_michael', speed: 1.0, pitchShift: 1.0 },
  instructor: { kokoroVoice: 'bm_george', speed: 0.95, pitchShift: 0.98 },
  engineer: { kokoroVoice: 'am_puck', speed: 1.0, pitchShift: 1.0 },
  student: { kokoroVoice: 'af_bella', speed: 1.05, pitchShift: 1.03 },
  custom_photo: { kokoroVoice: 'af_heart', speed: 1.0, pitchShift: 1.0 },
  robot: { kokoroVoice: 'am_echo', speed: 1.0, pitchShift: 1.05 },
  dragon: { kokoroVoice: 'bm_lewis', speed: 0.85, pitchShift: 0.65 },
  wizard: { kokoroVoice: 'bm_lewis', speed: 0.9, pitchShift: 0.75 },
  cat: { kokoroVoice: 'af_sky', speed: 1.1, pitchShift: 1.2 },
  astronaut: { kokoroVoice: 'am_michael', speed: 1.0, pitchShift: 1.0 },
  alien: { kokoroVoice: 'am_onyx', speed: 1.2, pitchShift: 0.75 },
};

/**
 * Resolve the best Kokoro voice mapping for a character, preferring an explicit
 * voicePreset id, then falling back to the visual style, then a sane default.
 */
export function resolveKokoroVoice(
  voicePresetId?: string,
  style?: string
): KokoroVoiceMapping {
  if (voicePresetId && VOICE_PRESET_TO_KOKORO[voicePresetId]) {
    return VOICE_PRESET_TO_KOKORO[voicePresetId];
  }
  if (style && STYLE_TO_KOKORO[style]) {
    return STYLE_TO_KOKORO[style];
  }
  return DEFAULT_MAPPING;
}
