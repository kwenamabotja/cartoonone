import React, { useState } from 'react';
import { CartoonProject } from '../types';
import { Youtube, Copy, Check, Sparkles, HelpCircle, Tag, FileText, X, ExternalLink, UploadCloud, Link as LinkIcon } from 'lucide-react';

interface YouTubeExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CartoonProject;
  onUpdateMetadata: (metadata: any) => void;
  onUpdateProject?: (updated: Partial<CartoonProject>) => void;
}

export const YouTubeExporterModal: React.FC<YouTubeExporterModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateMetadata,
  onUpdateProject,
}) => {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [channelUrlInput, setChannelUrlInput] = useState(project.youtubeChannelUrl || '');
  const [savedChannelMsg, setSavedChannelMsg] = useState(false);

  if (!isOpen) return null;

  const metadata = project.youtubeMetadata || {
    youtubeTitle: `${project.title} 🤖🐶 Cartoon Coding for Kids!`,
    youtubeDescription: `Learn programming concepts through fun cartoon roleplay!\n\nIn this episode: ${project.title} (${project.topic})\n\n⏱️ Chapters:\n0:00 Cartoon Roleplay Story\n0:30 Code Explanation\n1:00 Recap & Subscribe!\n\n#CodingForKids #LearnToCode #Scratch #KidsCartoons`,
    tags: ['Coding for kids', 'Learn programming', project.topic, 'Kids education cartoon', 'STEM for kids'],
  };

  const handleCopy = (text: string, type: 'title' | 'desc' | 'tags') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else if (type === 'desc') {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    } else if (type === 'tags') {
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    }
  };

  const handleSaveChannelUrl = () => {
    let formatted = channelUrlInput.trim();
    if (formatted && !formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      if (formatted.startsWith('@')) {
        formatted = `https://youtube.com/${formatted}`;
      } else {
        formatted = `https://${formatted}`;
      }
    }
    setChannelUrlInput(formatted);
    if (onUpdateProject) {
      onUpdateProject({ youtubeChannelUrl: formatted });
    }
    setSavedChannelMsg(true);
    setTimeout(() => setSavedChannelMsg(false), 2500);
  };

  const currentChannelUrl = project.youtubeChannelUrl || channelUrlInput || 'https://www.youtube.com';

  const handleOptimizeWithGemini = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/gemini/youtube-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          topic: project.topic,
          targetAge: project.targetAge,
          scenes: project.scenes,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate YouTube metadata');
      const data = await res.json();
      onUpdateMetadata(data);
    } catch (err) {
      console.error(err);
      alert('Failed to optimize with Gemini: ' + (err as Error).message);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-red-500/40 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/40">
              <Youtube className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">YouTube Channel & Upload Kit</h2>
              <p className="text-xs text-slate-400">
                Post videos directly to YouTube Studio and connect your YouTube channel!
              </p>
            </div>
          </div>

          <button
            onClick={handleOptimizeWithGemini}
            disabled={isOptimizing}
            className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            {isOptimizing ? 'Optimizing...' : 'Gemini AI SEO'}
          </button>
        </div>

        {/* PRIMARY DIRECT YOUTUBE ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-purple-950/80 border border-red-500/40 rounded-2xl shadow-inner">
          <a
            href="https://studio.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-900/40 transition-all active:scale-95 group"
          >
            <UploadCloud className="w-4 h-4 text-white group-hover:animate-bounce" />
            <span>Post / Upload to YouTube Studio</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <a
            href={currentChannelUrl.startsWith('http') ? currentChannelUrl : `https://${currentChannelUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/40 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 group"
          >
            <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            <span>Visit My YouTube Channel</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 text-slate-400" />
          </a>
        </div>

        {/* MY YOUTUBE CHANNEL LINK CONFIGURATOR */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-red-400" />
            My YouTube Channel Link / Handle
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={channelUrlInput}
              onChange={(e) => setChannelUrlInput(e.target.value)}
              placeholder="e.g. https://youtube.com/@MyCartoonChannel or @MyChannel"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
            <button
              onClick={handleSaveChannelUrl}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              {savedChannelMsg ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : null}
              {savedChannelMsg ? 'Saved!' : 'Save Link'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Saved channel: <strong className="text-red-400">{currentChannelUrl}</strong>
          </p>
        </div>

        <div className="space-y-4">
          {/* YouTube Video Title */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                1. YouTube Video Title
              </label>
              <button
                onClick={() => handleCopy(metadata.youtubeTitle, 'title')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-1"
              >
                {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTitle ? 'Copied!' : 'Copy Title'}
              </button>
            </div>
            <input
              type="text"
              value={metadata.youtubeTitle}
              onChange={(e) => onUpdateMetadata({ ...metadata, youtubeTitle: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
            />
          </div>

          {/* YouTube Description */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                2. YouTube Video Description & Chapters
              </label>
              <button
                onClick={() => handleCopy(metadata.youtubeDescription, 'desc')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-1"
              >
                {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDesc ? 'Copied!' : 'Copy Description'}
              </button>
            </div>
            <textarea
              value={metadata.youtubeDescription}
              onChange={(e) => onUpdateMetadata({ ...metadata, youtubeDescription: e.target.value })}
              rows={5}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 leading-relaxed"
            />
          </div>

          {/* YouTube Search Tags */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                3. Video Tags & Keywords
              </label>
              <button
                onClick={() => handleCopy(metadata.tags.join(', '), 'tags')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-1"
              >
                {copiedTags ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTags ? 'Copied!' : 'Copy Tags'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              {metadata.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-md border border-slate-700 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* YouTube Upload Tips */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1 text-slate-300">
            <div className="font-bold text-yellow-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              YouTube Upload Checklist for Kids Content:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300 pl-1">
              <li>When uploading to YouTube Studio, set Audience to: <strong>"Yes, it's Made for Kids"</strong>.</li>
              <li>Set Category to: <strong>Education</strong>.</li>
              <li>Copy and paste the title & description above for higher YouTube algorithm ranking!</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
