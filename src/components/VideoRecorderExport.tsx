import React, { useState, useRef, useEffect } from 'react';
import { CartoonProject } from '../types';
import { getCharacterSvgDataUrl } from '../utils/svgCharacterRenderer';
import {
  getAudioContext,
  playSoundEffect,
  speakDialogueLine,
  startBackgroundMusic,
  stopBackgroundMusic,
  setAudioDucking,
} from '../utils/audioSynthesizer';
import {
  Video,
  Download,
  Play,
  Square,
  CheckCircle,
  Youtube,
  ExternalLink,
  UploadCloud,
  Maximize2,
  Film,
  Sparkles,
} from 'lucide-react';

interface VideoRecorderExportProps {
  project: CartoonProject;
  onRecordStart: () => void;
  onRecordSceneChange: (index: number, isSpeaking: boolean) => void;
  onRecordEnd: () => void;
}

export const VideoRecorderExport: React.FC<VideoRecorderExportProps> = ({
  project,
  onRecordStart,
  onRecordSceneChange,
  onRecordEnd,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0); // 0 to 100
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingStatusText, setRecordingStatusText] = useState('');
  const [activeMimeType, setActiveMimeType] = useState('video/webm');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const isCapturingRef = useRef<boolean>(false);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const renderTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (renderTimerRef.current) {
        clearInterval(renderTimerRef.current);
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
    };
  }, []);

  // Helper to get or preload images for canvas rendering
  const getCachedImage = (url: string): HTMLImageElement | null => {
    if (!url) return null;
    if (imageCacheRef.current.has(url)) {
      const img = imageCacheRef.current.get(url)!;
      return img.complete ? img : null;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    imageCacheRef.current.set(url, img);
    return null;
  };

  // High-fidelity HD 1280x720 Canvas Renderer for smooth 30fps video stream
  const drawHDStageToCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentSceneIndex: number,
    isSpeaking: boolean
  ) => {
    const scene = project.scenes[currentSceneIndex] || project.scenes[0];
    if (!scene) return;

    const speaker = project.characters.find((c) => c.id === scene.speakerId) || project.characters[0];

    // 1. Draw Environment / Background
    const bgGradients: Record<string, [string, string]> = {
      tv_studio: ['#020617', '#1e1b4b'],
      tech_conference: ['#172554', '#020617'],
      podcast_booth: ['#451a03', '#0c0a09'],
      modern_office: ['#0f172a', '#1e1b4b'],
      server_room: ['#020617', '#064e3b'],
      lecture_hall: ['#0f172a', '#1e1b4b'],
      bakery: ['#fef3c7', '#fde68a'],
      space: ['#0f172a', '#2e1065'],
      magic_lab: ['#3b0764', '#1e1b4b'],
      cyber_grid: ['#042f2e', '#0f172a'],
      tech_lab: ['#0f172a', '#083344'],
      classroom: ['#d1fae5', '#a7f3d0'],
      jungle: ['#065f46', '#14532d'],
      beach: ['#7dd3fc', '#fde68a'],
      underwater: ['#083344', '#1e1b4b'],
      candy_land: ['#fbcfe8', '#fda4af'],
      castle: ['#451a03', '#1e1b4b'],
      greenscreen: ['#00FF00', '#00FF00'],
    };

    // Draw custom background image if set
    let customImgDrawn = false;
    if (scene.customBackgroundUrl) {
      const customImg = getCachedImage(scene.customBackgroundUrl);
      if (customImg) {
        ctx.drawImage(customImg, 0, 0, width, height);
        customImgDrawn = true;
      }
    }

    if (!customImgDrawn) {
      const colors = bgGradients[scene.background] || bgGradients.tv_studio;
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Stage Floor Reflection / Spotlight Grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 40, width * 0.45, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Top Banner Overlay
    ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
    ctx.beginPath();
    ctx.roundRect(24, 20, width - 48, 54, 14);
    ctx.fill();

    ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`🎬 ${project.title}`, 44, 54);

    ctx.fillStyle = '#facc15';
    ctx.font = 'black 14px sans-serif';
    ctx.fillText(`SCENE ${currentSceneIndex + 1} / ${project.scenes.length}`, width - 190, 54);

    // 3. Featured Characters
    const activeChars =
      project.characters.length > 0
        ? project.characters
        : [
            { id: 'c1', name: 'Character 1', style: 'dog' },
            { id: 'c2', name: 'Character 2', style: 'robot' },
          ];

    const charEmojis: Record<string, string> = {
      dog: '🐶',
      robot: '🤖',
      cat: '🐱',
      wizard: '🧙‍♂️',
      astronaut: '👩‍🚀',
      alien: '👽',
      dragon: '🐉',
      presenter_female: '👩‍💼',
      presenter_male: '👨‍💼',
      instructor: '🎓',
      engineer: '👨‍💻',
      student: '👩‍🎓',
      custom_photo: '📸',
    };

    const numChars = activeChars.length;
    let speakingCharPosX = width / 2 - 200;

    const nowMs = Date.now();

    activeChars.forEach((char, idx) => {
      let posX = 140;
      if (numChars === 1) {
        posX = width / 2 - 40;
      } else if (numChars === 2) {
        posX = idx === 0 ? 140 : width - 220;
      } else if (numChars === 3) {
        posX = idx === 0 ? 120 : idx === 1 ? width / 2 - 40 : width - 200;
      } else {
        posX = 90 + idx * ((width - 260) / (numChars - 1));
      }

      const isSpeakingThisChar = scene.speakerId ? scene.speakerId === char.id : idx === 0;

      if (isSpeakingThisChar) {
        speakingCharPosX = Math.max(40, Math.min(width - 460, posX - 160));
      }

      // Animated Bounce for active speaker
      const bounceOffset = isSpeakingThisChar && isSpeaking ? Math.sin(nowMs / 120) * 14 : 0;
      const posY = height - 130 + bounceOffset;

      // Glow Ring around speaking character
      if (isSpeakingThisChar) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.beginPath();
        ctx.arc(posX + 45, posY - 40, 75, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Character Avatar / High-Definition Vector SVG
      let avatarDrawn = false;
      if (char.customAvatarUrl) {
        const avatarImg = getCachedImage(char.customAvatarUrl);
        if (avatarImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(posX + 45, posY - 45, 55, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, posX - 10, posY - 100, 110, 110);
          ctx.restore();
          avatarDrawn = true;
        }
      }

      if (!avatarDrawn) {
        const svgUrl = getCharacterSvgDataUrl(
          char.style || 'dog',
          char.color || '#3b82f6',
          scene.speakerEmotion || 'happy',
          isSpeakingThisChar && isSpeaking
        );
        const svgImg = getCachedImage(svgUrl);
        if (svgImg) {
          ctx.drawImage(svgImg, posX - 30, posY - 135, 150, 150);
          avatarDrawn = true;
        } else {
          ctx.font = isSpeakingThisChar ? '105px sans-serif' : '85px sans-serif';
          const charEmoji = charEmojis[char?.style] || '🐶';
          ctx.fillText(charEmoji, posX, posY);
        }
      }

      // Character Name Badge
      ctx.fillStyle = isSpeakingThisChar ? '#facc15' : 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(char?.name || `Char ${idx + 1}`, posX - 10, height - 75);
    });

    // 4. Speech Bubble
    const speakingCharX = speakingCharPosX;
    const speakingCharY = height - 350;

    // Speech Box Background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(speakingCharX, speakingCharY, 440, 130, 22);
    ctx.fill();
    ctx.stroke();

    // Pointer Tail
    ctx.beginPath();
    ctx.moveTo(speakingCharX + 80, speakingCharY + 130);
    ctx.lineTo(speakingCharX + 100, speakingCharY + 155);
    ctx.lineTo(speakingCharX + 130, speakingCharY + 130);
    ctx.fill();
    ctx.stroke();

    // Speaker Name Tag inside Speech Bubble
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`🗣️ ${speaker?.name || 'Presenter'}:`, speakingCharX + 22, speakingCharY + 32);

    // Wrap & Draw Dialogue Text
    ctx.fillStyle = '#0f172a';
    ctx.font = '600 17px sans-serif';

    const words = scene.dialogue.split(' ');
    let line = '';
    let lineY = speakingCharY + 62;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 390 && n > 0) {
        ctx.fillText(line, speakingCharX + 22, lineY);
        line = words[n] + ' ';
        lineY += 26;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, speakingCharX + 22, lineY);

    // 5. Key Takeaway / Code Snippet Card
    if (scene.codeSnippet) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 160, 95, 320, 95, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('✨ Key Takeaway Card:', width / 2 - 140, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(scene.codeSnippet, width / 2 - 140, 152);
    }

    // 6. Subtitle Bar
    if (project.showSubtitles) {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
      ctx.beginPath();
      ctx.roundRect(40, height - 60, width - 80, 48, 12);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(`${speaker.name}: "${scene.dialogue}"`, 60, height - 30);
    }

    // 7. TV Network Watermark Bug & Rating
    if (project.showTvOverlayBug !== false) {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(width - 240, 20, 215, 36, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`📺 ${project.tvChannelName || 'KIDS NETWORK'}`, width - 228, 42);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'black 11px sans-serif';
      ctx.fillText(project.tvRating || 'TV-Y7', width - 62, 42);
    }

    // 8. TV Lower Third Broadcast Banner
    if (project.showTvLowerThird) {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, height - 120, width - 80, 48, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(50, height - 112, 110, 32, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'black 12px sans-serif';
      ctx.fillText('TV BROADCAST', 60, height - 91);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${project.title} • ${project.tvEpisodeNumber || 'Season 1, Ep. 01'}`, 175, height - 91);
    }

    // 9. Audio Equalizer Wave Graphic (Bottom Right)
    if (isSpeaking) {
      ctx.fillStyle = '#facc15';
      for (let b = 0; b < 6; b++) {
        const barHeight = Math.abs(Math.sin((nowMs / 100) + b)) * 25 + 8;
        ctx.fillRect(width - 80 + b * 8, height - 130 - barHeight, 5, barHeight);
      }
    }
  };

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'video/webm';
  };

  const handleStartRecording = async () => {
    try {
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
      setRecordedVideoUrl(null);
      setRecordedBlob(null);
      setIsRecording(true);
      setRecordingProgress(0);
      recordedChunksRef.current = [];
      isCapturingRef.current = true;
      onRecordStart();

      // Web Audio Stream
      const { destinationNode, ctx: audioCtx } = getAudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const audioTracks = destinationNode.stream.getAudioTracks();

      // High Performance HD 1280x720 Canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1280;
      tempCanvas.height = 720;
      const ctx = tempCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context creation failed');
      }

      const canvasStream = tempCanvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks,
      ]);

      let currentActiveSceneIndex = 0;
      let currentActiveSpeakingState = false;
      let isHtml2CanvasBusy = false;

      // High performance 30 FPS canvas rendering loop
      renderTimerRef.current = setInterval(() => {
        if (isCapturingRef.current && ctx) {
          drawHDStageToCanvas(
            ctx,
            tempCanvas.width,
            tempCanvas.height,
            currentActiveSceneIndex,
            currentActiveSpeakingState
          );
        }
      }, 33);

      const selectedMime = getSupportedMimeType();
      setActiveMimeType(selectedMime);

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        isCapturingRef.current = false;
        setAudioDucking(false);
        if (renderTimerRef.current) {
          clearInterval(renderTimerRef.current);
          renderTimerRef.current = null;
        }

        const blob = new Blob(recordedChunksRef.current, { type: selectedMime });
        if (blob.size === 0) {
          alert('Recording completed but video file was empty. Please try recording again.');
          setIsRecording(false);
          stopBackgroundMusic();
          onRecordEnd();
          return;
        }

        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedBlob(blob);
        setIsRecording(false);
        stopBackgroundMusic();
        onRecordEnd();
      };

      mediaRecorder.start(100);

      // Start Background Music
      startBackgroundMusic(project.bgMusicTrack, project.bgMusicVolume);

      // Sequentially play through cartoon scenes
      const totalScenes = project.scenes.length;
      for (let i = 0; i < totalScenes; i++) {
        if (!isCapturingRef.current) break;

        currentActiveSceneIndex = i;
        currentActiveSpeakingState = true;
        setAudioDucking(true);
        const scene = project.scenes[i];

        setRecordingProgress(Math.round(((i + 1) / totalScenes) * 100));
        setRecordingStatusText(`Recording Scene ${i + 1} of ${totalScenes}...`);

        onRecordSceneChange(i, true);

        // Play Sound Effect if any
        if (scene.soundEffect && scene.soundEffect !== 'none') {
          playSoundEffect(scene.soundEffect);
        }

        // Speaker details
        const speaker =
          project.characters.find((c) => c.id === scene.speakerId) || project.characters[0];

        // Speak Dialogue Line
        await new Promise<void>((resolve) => {
          let hasResolved = false;
          const safeResolve = () => {
            if (!hasResolved) {
              hasResolved = true;
              resolve();
            }
          };

          const customAudio = scene.audioUrl;

          speakDialogueLine(
            scene.dialogue,
            speaker?.voicePitch ?? 1.0,
            speaker?.voiceRate ?? 1.0,
            speaker?.style ?? 'dog',
            () => safeResolve(),
            customAudio,
            speaker?.preferredVoiceName
          );

          // Safety fallback timer if speech synthesis or audio hangs
          const safetyTimeout = customAudio ? 12000 : Math.max(4000, scene.dialogue.length * 90 + 2000);
          setTimeout(() => safeResolve(), safetyTimeout);
        });

        currentActiveSpeakingState = false;
        setAudioDucking(false);
        onRecordSceneChange(i, false);

        // Short pause between scenes for snappy cartoon timing
        await new Promise((r) => setTimeout(r, 600));
      }

      // Finish recording after last scene
      setRecordingStatusText('Finalizing HD cartoon video encoding...');
      setTimeout(() => {
        isCapturingRef.current = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, 1000);
    } catch (err) {
      console.error('Video recording failed:', err);
      isCapturingRef.current = false;
      if (renderTimerRef.current) {
        clearInterval(renderTimerRef.current);
      }
      setIsRecording(false);
      onRecordEnd();
      alert('Could not start video recorder: ' + (err as Error).message);
    }
  };

  const handleStopRecording = () => {
    isCapturingRef.current = false;
    if (renderTimerRef.current) {
      clearInterval(renderTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopBackgroundMusic();
    onRecordEnd();
  };

  const handleDownloadVideo = (ext: 'webm' | 'mp4' = 'webm') => {
    if (!recordedVideoUrl && !recordedBlob) {
      alert('No recorded video available to download.');
      return;
    }

    const downloadUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : recordedVideoUrl!;
    const cleanTitle = project.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Cartoon_Video';
    const filename = `${cleanTitle}_Episode.${ext}`;

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      if (recordedBlob) {
        URL.revokeObjectURL(downloadUrl);
      }
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
              HD Video Recording & Export Engine
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Render and record full cartoon episode with synced audio & animations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-cartoon-fullscreen'))}
            className="px-3 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Expand stage to full screen"
          >
            <Maximize2 className="w-4 h-4 text-yellow-300" />
            <span>Expand Screen</span>
          </button>

          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              Render & Record Entire Video
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl text-xs font-bold border border-red-500/50 flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-red-400" />
              Stop Recording
            </button>
          )}
        </div>
      </div>

      {/* Recording Progress Overlay */}
      {isRecording && (
        <div className="bg-slate-950 p-4 rounded-xl border border-red-500/30 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-red-400 font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              {recordingStatusText}
            </span>
            <span className="font-mono text-slate-400 font-bold">{recordingProgress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
              style={{ width: `${recordingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Exported Video Player & Download Actions */}
      {recordedVideoUrl && !isRecording && (
        <div className="bg-slate-950/90 p-4 rounded-xl border border-emerald-500/40 space-y-3 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              HD Video Rendered & Saved Successfully!
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              Format: {activeMimeType.includes('mp4') ? 'MP4' : 'WebM'} HD (1280x720)
            </span>
          </div>

          <video
            src={recordedVideoUrl}
            controls
            autoPlay
            className="w-full aspect-video rounded-xl bg-black border border-slate-800 shadow-inner"
          />

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => handleDownloadVideo('webm')}
              className="flex-1 min-w-[160px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black text-white text-center flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Video (.WebM)</span>
            </button>

            <button
              onClick={() => handleDownloadVideo('mp4')}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white text-center flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download (.MP4)</span>
            </button>

            <a
              href="https://studio.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black text-white text-center flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              title="Open YouTube Studio to upload video"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Post to YouTube</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            <a
              href={
                project.youtubeChannelUrl
                  ? project.youtubeChannelUrl.startsWith('http')
                    ? project.youtubeChannelUrl
                    : `https://${project.youtubeChannelUrl}`
                  : 'https://www.youtube.com'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-red-400 text-center flex items-center justify-center gap-1.5 cursor-pointer"
              title="Visit your YouTube channel"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>My Channel</span>
              <ExternalLink className="w-3 h-3 opacity-70 text-slate-400" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
