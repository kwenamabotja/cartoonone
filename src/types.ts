export type CharacterStyle =
  | 'dog'
  | 'robot'
  | 'wizard'
  | 'dragon'
  | 'cat'
  | 'astronaut'
  | 'alien'
  | 'presenter_female'
  | 'presenter_male'
  | 'instructor'
  | 'engineer'
  | 'student'
  | 'custom_photo'
  | 'bluey'
  | 'sponge_pop'
  | 'star_pat'
  | 'squid_ward'
  | 'loud_house'
  | 'loud_sister'
  | 'blue_monster'
  | 'pink_panther'
  | 'bunny'
  | 'duck'
  | 'superhero'
  | 'anime_hero';

export type ClothingStyle =
  | 'default'
  | 'casual'
  | 'formal'
  | 'tech'
  | 'labcoat'
  | 'hero';

export type ExpressionType =
  | 'happy'
  | 'thinking'
  | 'explaining'
  | 'surprised'
  | 'confused'
  | 'laughing'
  | 'celebrating'
  | 'angry'
  | 'wink'
  | 'sad'
  | 'shocked_eyes'
  | 'squash_and_stretch'
  | 'facepalm';

export type BackgroundTheme =
  | 'tv_studio'
  | 'tech_conference'
  | 'podcast_booth'
  | 'modern_office'
  | 'server_room'
  | 'lecture_hall'
  | 'bakery'
  | 'space'
  | 'magic_lab'
  | 'cyber_grid'
  | 'tech_lab'
  | 'classroom'
  | 'jungle'
  | 'beach'
  | 'underwater'
  | 'candy_land'
  | 'castle'
  | 'greenscreen';

export type SoundEffectType =
  | 'pop'
  | 'success'
  | 'magic'
  | 'robot_beep'
  | 'tada'
  | 'whistle'
  | 'giggle'
  | 'bounce'
  | 'applause'
  | 'laugh_track'
  | 'dramatic_sting'
  | 'fanfare'
  | 'boing'
  | 'none';

export type ActionEffectType =
  | 'walk'
  | 'run'
  | 'jump'
  | 'fly'
  | 'dance'
  | 'flip'
  | 'bounce'
  | 'shake'
  | 'float'
  | 'zoom'
  | 'spin'
  | 'point'
  | 'wave'
  | 'thumbsup'
  | 'sit'
  | 'turn'
  | 'none';

export type TopicCategory =
  | 'Cybersecurity & IT'
  | 'Adult Tech & AI'
  | 'Professional & Business'
  | 'Science & Nature'
  | 'Math & Numbers'
  | 'Space & Planets'
  | 'Coding & Tech'
  | 'History & World'
  | 'Life Skills & Values'
  | 'Custom Topic';

export interface Character {
  id: string;
  name: string;
  role: string;
  style: CharacterStyle;
  color: string;
  clothingStyle?: ClothingStyle;
  pose?: string;
  facingDirection?: 'left' | 'right' | 'front';
  voicePitch: number; // 0.5 to 1.8
  voiceRate: number; // 0.8 to 1.3
  preferredVoiceIndex?: number;
  preferredVoiceName?: string;
  voicePreset?: string;
  customVoiceUrl?: string; // Custom microphone voice sample URL
  customAvatarUrl?: string; // Custom uploaded photo or headshot of a real person
}

export type CameraAngleType =
  | 'WIDE_ESTABLISHING'
  | 'OVER_THE_SHOULDER'
  | 'CLOSE_UP_EMOTE'
  | 'QUICK_WHIP_PAN'
  | 'SLOW_PUSH_IN'
  | 'MEDIUM_TWO_SHOT'
  | 'REACTION_SHOT';

export type HandGestureType =
  | 'pointing_finger'
  | 'open_palms'
  | 'thumbs_up'
  | 'hand_on_hip'
  | 'scratching_head'
  | 'facepalm'
  | 'clapping'
  | 'waving'
  | 'crossing_arms'
  | 'holding_prop'
  | 'shrugging'
  | 'none';

export type SceneTransitionType =
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'wipe'
  | 'bounce';

export interface VisemeCue {
  timeOffsetMs: number;
  viseme: 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'F' | 'rest';
}

export interface RoleplayScene {
  id: string;
  speakerId: string; // character ID
  listenerId: string; // character ID
  dialogue: string;
  speakerEmotion: ExpressionType;
  listenerEmotion: ExpressionType;
  cameraAngle?: CameraAngleType;
  microAction?: string; // Physical comedy gag or secondary body language
  handGesture?: HandGestureType;
  timingHoldMs?: number; // Timing beat / pause before or after line
  visemeCues?: VisemeCue[]; // Phoneme viseme sequence
  codeSnippet?: string; // or concept snippet
  codeHighlight?: string; // or concept highlight
  background: BackgroundTheme;
  soundEffect?: SoundEffectType;
  actionEffect?: ActionEffectType;
  sceneTransition?: SceneTransitionType;
  durationSeconds?: number;
  audioUrl?: string; // Custom recorded microphone audio for this scene
  customBackgroundUrl?: string; // Uploaded custom image or green screen video Data URL for this scene
  isGreenScreenKeyed?: boolean; // If true, applies green screen chroma key filter effect
  screenGrabSize?: 'small' | 'medium' | 'large' | 'full'; // Size mode for green screen presentation monitor
  isThemeSong?: boolean; // Whether this scene is the channel theme song intro
  isMusicOnly?: boolean; // If true, plays pure music/melody without speech synthesis
  themeSongKey?: string; // Preset key for theme song / melody
}

export interface YouTubeMetadata {
  youtubeTitle: string;
  youtubeDescription: string;
  tags: string[];
  thumbnailIdeas?: string[];
}

export type TvFormat = '16:9_hd' | '21:9_cinema' | '4:3_retro';

export interface CartoonProject {
  id: string;
  title: string;
  topic: string;
  category?: TopicCategory | string;
  targetAge: '5-8' | '9-12' | '13-17' | 'Adults & Pros' | string;
  characters: Character[];
  scenes: RoleplayScene[];
  bgMusicTrack: 'playful' | 'upbeat' | '8bit_arcade' | 'magic_mystery' | 'none';
  bgMusicVolume: number;
  showSubtitles: boolean;
  showScriptOverlay?: boolean; // Whether speech bubbles & code boxes are visible on cartoon stage
  showTopHeader?: boolean; // Whether episode title header banner is visible at top of cartoon stage
  youtubeMetadata?: YouTubeMetadata;
  youtubeChannelUrl?: string;
  // Television Broadcast & Display Standards
  tvFormat?: TvFormat;
  tvChannelName?: string;
  tvRating?: 'TV-Y7' | 'TV-G' | 'TV-PG' | 'ALL AGES';
  showTvSafeGrid?: boolean;
  showTvOverlayBug?: boolean;
  showTvLowerThird?: boolean;
  tvEpisodeNumber?: string;
  showTvIntroCard?: boolean;
  showTvOutroCredits?: boolean;
  showStyle?: 'cartoon_network' | 'spongebob' | 'bluey' | 'educational_classic';
  youtubeTitle?: string;
  youtubeDescription?: string;
  tags?: string[];
  createdAt: string;
}

