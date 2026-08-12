import { CartoonProject } from '../types';

export interface YouTubeChapter {
  timestampMs: number;
  formattedTimestamp: string; // e.g. "00:00" or "01:15"
  title: string;
  speakerName: string;
}

export interface BroadcastMetadata {
  title: string;
  youtubeTitle: string;
  youtubeDescription: string;
  chapters: YouTubeChapter[];
  formattedChaptersText: string;
  tags: string[];
  totalDurationMs: number;
  formattedTotalDuration: string;
  resolutionSpecs: {
    fhd: string;
    uhd: string;
    fps: number;
  };
}

/**
 * Format milliseconds into MM:SS or HH:MM:SS format
 */
export function formatTimestampMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Estimate scene duration based on dialogue length and timing holds.
 * Standard speech speed is ~15 characters per second (approx 65ms per char) + timingHoldMs.
 */
export function estimateSceneDurationMs(scene: { dialogue: string; timingHoldMs?: number }): number {
  const charLength = scene.dialogue ? scene.dialogue.length : 10;
  const speechMs = Math.max(1800, charLength * 65);
  const holdMs = scene.timingHoldMs || 600;
  return speechMs + holdMs;
}

/**
 * Generate YouTube Chapter Metadata and Broadcast Specs from CartoonProject
 */
export function generateBroadcastChapterMetadata(project: CartoonProject): BroadcastMetadata {
  const chapters: YouTubeChapter[] = [];
  let currentAccumulatedMs = 0;

  project.scenes.forEach((scene, index) => {
    const speaker = project.characters.find((c) => c.id === scene.speakerId);
    const speakerName = speaker?.name || 'Presenter';

    const formattedTs = formatTimestampMs(currentAccumulatedMs);

    // Create readable chapter title
    let chapterTitle = `Scene ${index + 1}: ${speakerName}`;
    if (scene.codeHighlight) {
      chapterTitle += ` - ${scene.codeHighlight}`;
    } else if (scene.dialogue) {
      const truncated = scene.dialogue.length > 35 ? scene.dialogue.slice(0, 32) + '...' : scene.dialogue;
      chapterTitle += ` ("${truncated}")`;
    }

    chapters.push({
      timestampMs: currentAccumulatedMs,
      formattedTimestamp: formattedTs,
      title: chapterTitle,
      speakerName,
    });

    const duration = estimateSceneDurationMs(scene);
    currentAccumulatedMs += duration;
  });

  const totalDurationMs = currentAccumulatedMs;
  const formattedTotalDuration = formatTimestampMs(totalDurationMs);

  // Format chapters for YouTube description copy-paste
  const formattedChaptersText = chapters
    .map((ch) => `${ch.formattedTimestamp} ${ch.title}`)
    .join('\n');

  const youtubeTitle = project.youtubeTitle || `🎬 ${project.title} | Cartoon Studio Pro Broadcast`;
  const defaultDesc = `Welcome to "${project.title}"! An expressive 2D animated episode generated with Cartoon Studio Pro.

📌 CHAPTER TIMESTAMPS:
${formattedChaptersText}

🎯 TOPIC: ${project.topic || 'Educational Cartoon'}
👥 CHARACTERS: ${project.characters.map((c) => c.name).join(', ')}

#CartoonStudio #2DAnimation #Remotion #Broadcast #Animation`;

  const tags = project.tags && project.tags.length > 0
    ? project.tags
    : ['Animation', '2D Cartoon', 'Educational', 'Cartoon Studio Pro', 'Remotion', 'YouTube Kids'];

  return {
    title: project.title,
    youtubeTitle,
    youtubeDescription: project.youtubeDescription || defaultDesc,
    chapters,
    formattedChaptersText,
    tags,
    totalDurationMs,
    formattedTotalDuration,
    resolutionSpecs: {
      fhd: '1920x1080 Full HD @ 24fps (16:9 Broadcast)',
      uhd: '3840x2160 4K Ultra HD @ 24fps (16:9 Master)',
      fps: 24,
    },
  };
}
