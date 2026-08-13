"""
AI Cartoon Episode Generator
=============================
Generates a short animated-style episode end-to-end using the Gemini API:

    1. Character sheet         -> one reference image of the whole cast, generated once,
                                   then reused as a visual reference for every scene so
                                   characters look consistent episode to episode
    2. Script generation      -> Gemini text model (gemini-2.5-flash or gemini-2.5-pro)
    3. Scene breakdown        -> parses the script into structured scenes
    4. Scene motion             -> "video" renderer: Gemini video model (Veo) generates a real,
                                    animated ~5-8s clip per scene, seeded with the reference
                                    sheet image so characters stay consistent
                                    "images" renderer: Gemini image model generates a still
                                    frame per scene instead (faster/cheaper, no motion)
    5. Voice/dialogue          -> "video" renderer: spoken dialogue is generated as part of
                                    the video clip itself (Veo supports audio+lip sync)
                                    "images" renderer: separate Gemini TTS pass per scene
    6. Video assembly          -> moviepy stitches clips/images (+ audio, + captions in the
                                    "images" renderer) into a final .mp4, with a per-scene
                                    fallback to a still image if a video clip fails to generate

This script can also generate a full SEASON in one run (a batch of episodes
that all share the same character reference sheet) — see generate_season().

Run this in Google AI Studio's "Build" / code execution environment, or locally.
Only needs your Gemini API key (the same key you'd use in AI Studio).

------------------------------------------------------------------------------
IMPORTANT — ORIGINALITY / COPYRIGHT NOTE
------------------------------------------------------------------------------
This generator is set up to create ORIGINAL characters and stories in a
generic "flat-color, bold-outline, family-comedy cartoon" genre — the broad
visual/tonal genre that shows like The Loud House, SpongeBob, and Blue's
Clues belong to. It intentionally does NOT prompt the model to reproduce
those shows' actual characters, character designs, logos, or specific
copyrighted visuals. If you publish this content on YouTube/TV, keep your
STYLE_GUIDE and character prompts generic/original (see the CONFIG section)
so you're not generating someone else's IP.
------------------------------------------------------------------------------

Install deps:
    pip install google-genai moviepy pillow

Set your key:
    export GEMINI_API_KEY="your-key-here"

------------------------------------------------------------------------------
COST / SPEED NOTE — the "video" renderer (default) is real generative video.
It is significantly slower (each scene clip takes ~30s-3min to generate and
polls asynchronously) and more expensive per second than image generation.
For quick iteration on a script/story before committing to full video,
generate with --renderer images first, then switch to --renderer video for
your final pass.
------------------------------------------------------------------------------
"""

import os
import re
import json
import time
import textwrap
from dataclasses import dataclass, field
from typing import List, Optional

from google import genai
from google.genai import types

# ==============================================================================
# CONFIG — edit these for your show
# ==============================================================================

API_KEY = os.environ.get("GEMINI_API_KEY", "")

TEXT_MODEL = "gemini-2.5-flash"          # script writing / reasoning
IMAGE_MODEL = "gemini-2.5-flash-image"   # scene artwork / reference sheet / video seed frames
TTS_MODEL = "gemini-2.5-flash-preview-tts"  # voice lines (used in "images" renderer, and as
                                             # a fallback if a video clip comes back with no audio)
VIDEO_MODEL = "veo-3.0-fast-generate-001"   # per-scene video generation ("video" renderer)
# Higher quality / higher cost alternative: "veo-3.0-generate-001"
# Model names for video gen change more often than text/image models — if you get a
# "model not found" error, check the current list in Google AI Studio and swap it in here.

MAX_CLIP_SECONDS = 8   # current Veo per-clip cap; long scenes get trimmed to this in the prompt

OUTPUT_DIR = "output"

# Describe your ORIGINAL show here. Keep character names/designs your own.
SHOW_BIBLE = {
    "title": "Static Street",
    "logline": "A chaotic but loving family of five navigates absurd everyday "
               "mishaps in a wacky suburban neighborhood.",
    "characters": [
        {"name": "Rusty", "role": "11-year-old scheming middle child, big glasses, spiky orange hair"},
        {"name": "Pip", "role": "Rusty's fast-talking little sister, obsessed with inventions"},
        {"name": "Mom Dana", "role": "endlessly patient mom with a booming laugh"},
        {"name": "Dad Lou", "role": "clumsy dad who overexplains everything"},
        {"name": "Baxter", "role": "the family dog who thinks he runs the house"},
    ],
    # Keep this GENRE-level, not a copy of any specific show's exact look.
    "style_guide": (
        "2D flat-color animated sitcom style, bold thick black outlines, "
        "exaggerated facial expressions, simple rounded character shapes, "
        "bright saturated color palette, flat cel-shaded lighting, "
        "clean vector-style background art, comedic wide-eyed poses"
    ),
    "tone": "fast-paced, goofy, heartwarming, slapstick humor for kids/family audience",
}

NUM_SCENES = 6           # scenes per episode
VIDEO_SIZE = (1280, 720) # 16:9, good for YouTube/TV
SECONDS_PER_IMAGE_PAD = 1.0  # extra seconds after dialogue audio ends, per scene


# ==============================================================================
# DATA MODEL
# ==============================================================================

@dataclass
class Scene:
    number: int
    setting: str
    action: str
    dialogue: List[dict] = field(default_factory=list)  # [{"character": str, "line": str}]
    visual_prompt: str = ""
    image_path: Optional[str] = None
    audio_path: Optional[str] = None
    video_path: Optional[str] = None
    duration: float = 4.0


# ==============================================================================
# 1. SCRIPT GENERATION
# ==============================================================================

def build_script_prompt(bible: dict, num_scenes: int, episode_idea: str) -> str:
    chars = "\n".join(f"- {c['name']}: {c['role']}" for c in bible["characters"])
    return textwrap.dedent(f"""
    You are a professional animated sitcom writer. Write ONE short episode script.

    SHOW: {bible['title']}
    LOGLINE: {bible['logline']}
    TONE: {bible['tone']}

    CHARACTERS:
    {chars}

    EPISODE IDEA: {episode_idea}

    Write exactly {num_scenes} scenes. Output STRICT JSON only, matching this schema,
    with no markdown fences and no extra commentary:

    {{
      "episode_title": "string",
      "scenes": [
        {{
          "number": 1,
          "setting": "one line describing location/time",
          "action": "one or two lines of visual stage direction (no dialogue here)",
          "dialogue": [
            {{"character": "Name", "line": "what they say"}}
          ]
        }}
      ]
    }}

    Rules:
    - Keep each scene's dialogue to 2-5 lines total, punchy and funny.
    - Only use the characters listed above.
    - Keep language clean and appropriate for a general family audience.
    - Make sure the story has a clear beginning, a comedic complication, and a resolution.
    """).strip()


def generate_script(client: genai.Client, bible: dict, num_scenes: int, episode_idea: str) -> dict:
    prompt = build_script_prompt(bible, num_scenes, episode_idea)
    resp = client.models.generate_content(
        model=TEXT_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.9,
            response_mime_type="application/json",
        ),
    )
    text = resp.text.strip()
    # Defensive cleanup in case the model wraps output in fences anyway
    text = re.sub(r"^```json|^```|```$", "", text, flags=re.MULTILINE).strip()
    return json.loads(text)


# ==============================================================================
# 2. SCENE OBJECTS + VISUAL PROMPTS
# ==============================================================================

def build_scenes(script_json: dict, style_guide: str) -> List[Scene]:
    scenes = []
    for s in script_json["scenes"]:
        dialogue_summary = " ".join(f'{d["character"]}: "{d["line"]}"' for d in s.get("dialogue", []))
        visual_prompt = (
            f"{style_guide}. Scene: {s['setting']}. {s['action']} "
            f"Characters shown reacting/interacting. No text or speech bubbles in the image."
        )
        scenes.append(Scene(
            number=s["number"],
            setting=s["setting"],
            action=s["action"],
            dialogue=s.get("dialogue", []),
            visual_prompt=visual_prompt,
        ))
    return scenes


# ==============================================================================
# 3. CHARACTER REFERENCE SHEET (for visual consistency across scenes/episodes)
# ==============================================================================

def build_reference_sheet_prompt(bible: dict) -> str:
    chars = "\n".join(f"- {c['name']}: {c['role']}" for c in bible["characters"])
    return textwrap.dedent(f"""
    {bible['style_guide']}.

    Create a character reference sheet / model sheet for an original animated
    show called "{bible['title']}". Show the full cast standing in a simple
    front-facing pose in a plain neutral background, arranged left to right,
    clearly separated, full body, consistent scale between characters.
    Label nothing with text. Cast:
    {chars}
    """).strip()


def generate_character_reference_sheet(client: genai.Client, bible: dict, out_dir: str) -> Optional[str]:
    """Generates one image of the whole cast together. Feed this back into every
    scene image prompt so characters stay visually consistent across the episode
    (and across a whole season, if reused between generate_episode() calls)."""
    prompt = build_reference_sheet_prompt(bible)
    resp = client.models.generate_content(
        model=IMAGE_MODEL,
        contents=prompt,
    )
    ref_path = os.path.join(out_dir, "character_reference_sheet.png")
    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None) is not None:
            with open(ref_path, "wb") as f:
                f.write(part.inline_data.data)
            return ref_path
    return None


# ==============================================================================
# 4. SCENE ARTWORK
# ==============================================================================

def generate_scene_image(client: genai.Client, scene: Scene, out_dir: str,
                          reference_image_path: Optional[str] = None) -> str:
    contents = []

    if reference_image_path and os.path.exists(reference_image_path):
        with open(reference_image_path, "rb") as f:
            ref_bytes = f.read()
        contents.append(types.Part.from_bytes(data=ref_bytes, mime_type="image/png"))
        contents.append(
            "Use the character designs shown in this reference image exactly "
            "(same faces, proportions, colors, outfits) — do not redesign them. " +
            scene.visual_prompt
        )
    else:
        contents.append(scene.visual_prompt)

    resp = client.models.generate_content(
        model=IMAGE_MODEL,
        contents=contents,
    )
    img_path = os.path.join(out_dir, f"scene_{scene.number:02d}.png")
    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None) is not None:
            with open(img_path, "wb") as f:
                f.write(part.inline_data.data)
            scene.image_path = img_path
            return img_path
    raise RuntimeError(f"No image returned for scene {scene.number}")


# ==============================================================================
# 5. VOICE LINES (TTS)
# ==============================================================================

def generate_scene_audio(client: genai.Client, scene: Scene, out_dir: str) -> Optional[str]:
    """Turns a scene's dialogue into a single narrated/voiced audio clip."""
    if not scene.dialogue:
        return None

    script_text = " ... ".join(f'{d["character"]} says: {d["line"]}' for d in scene.dialogue)

    resp = client.models.generate_content(
        model=TTS_MODEL,
        contents=script_text,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
                )
            ),
        ),
    )

    audio_path = os.path.join(out_dir, f"scene_{scene.number:02d}.wav")
    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None) is not None:
            import wave
            pcm = part.inline_data.data
            with wave.open(audio_path, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(24000)
                wf.writeframes(pcm)
            scene.audio_path = audio_path
            return audio_path
    return None


# ==============================================================================
# 6. SCENE VIDEO CLIPS (real AI-generated motion, "video" renderer)
# ==============================================================================

def build_video_prompt(scene: Scene, style_guide: str) -> str:
    dialogue_lines = "\n".join(f'{d["character"]}: "{d["line"]}"' for d in scene.dialogue)
    prompt = (
        f"{style_guide}. {scene.setting}. {scene.action} "
        f"Animate the characters with natural movement and expressions matching the action. "
    )
    if dialogue_lines:
        prompt += (
            f"The characters speak the following lines, with matching lip movement and "
            f"comedic timing:\n{dialogue_lines}\n"
        )
    prompt += "Keep the camera mostly static or with a gentle pan. No on-screen text."
    return prompt


def generate_scene_video_clip(client: genai.Client, scene: Scene, out_dir: str, style_guide: str,
                               reference_image_path: Optional[str] = None,
                               poll_interval: float = 10.0, max_wait: float = 300.0) -> Optional[str]:
    """Generates a short AI video clip for one scene using the Veo video model.
    If reference_image_path is given, it's used as the seed/first frame so the
    characters match the reference sheet's designs. Video generation is async —
    this polls the operation until it's done (typically 30s-3min per clip).
    """
    prompt = build_video_prompt(scene, style_guide)

    image_arg = None
    if reference_image_path and os.path.exists(reference_image_path):
        with open(reference_image_path, "rb") as f:
            image_arg = types.Image(image_bytes=f.read(), mime_type="image/png")

    operation = client.models.generate_videos(
        model=VIDEO_MODEL,
        prompt=prompt,
        image=image_arg,
        config=types.GenerateVideosConfig(
            aspect_ratio="16:9",
            duration_seconds=min(MAX_CLIP_SECONDS, 8),
        ),
    )

    waited = 0.0
    while not operation.done:
        if waited >= max_wait:
            print(f"  Scene {scene.number}: video gen timed out after {max_wait}s, skipping.")
            return None
        time.sleep(poll_interval)
        waited += poll_interval
        operation = client.operations.get(operation)

    if not operation.response or not operation.response.generated_videos:
        print(f"  Scene {scene.number}: no video returned (may have been filtered).")
        return None

    generated = operation.response.generated_videos[0]
    video_path = os.path.join(out_dir, f"scene_{scene.number:02d}.mp4")
    client.files.download(file=generated.video)
    generated.video.save(video_path)
    scene.video_path = video_path
    return video_path


def assemble_video_from_clips(scenes: List[Scene], out_path: str, size=VIDEO_SIZE,
                               transition: float = 0.3):
    """Concatenates per-scene AI-generated video clips with short crossfades.
    Falls back to a still image+audio clip for any scene where video generation
    failed, so one failed clip doesn't sink the whole episode."""
    from moviepy.editor import (
        VideoFileClip, ImageClip, AudioFileClip, CompositeVideoClip,
        concatenate_videoclips,
    )

    clips = []
    for scene in scenes:
        if scene.video_path and os.path.exists(scene.video_path):
            clip = VideoFileClip(scene.video_path).resize(size)
            if transition > 0:
                clip = clip.crossfadein(transition)
        elif scene.image_path and os.path.exists(scene.image_path):
            # Fallback: still frame, held for the scene's fallback duration
            duration = scene.duration
            audio_clip = None
            if scene.audio_path and os.path.exists(scene.audio_path):
                audio_clip = AudioFileClip(scene.audio_path)
                duration = audio_clip.duration + SECONDS_PER_IMAGE_PAD
            clip = ImageClip(scene.image_path).set_duration(duration).resize(size)
            if audio_clip:
                clip = clip.set_audio(audio_clip)
            print(f"  Note: scene {scene.number} used the still-image fallback (video gen failed).")
        else:
            continue
        clips.append(clip)

    if not clips:
        raise RuntimeError("No scene clips or images were available to assemble.")

    final = concatenate_videoclips(clips, method="compose", padding=-transition if transition else 0)
    final.write_videofile(out_path, fps=24, codec="libx264", audio_codec="aac")


# ==============================================================================
# 7. VIDEO ASSEMBLY — slideshow renderer (still images + TTS + captions)
# ==============================================================================

def assemble_video_slideshow(scenes: List[Scene], out_path: str, size=VIDEO_SIZE):
    from moviepy.editor import (
        ImageClip, AudioFileClip, CompositeVideoClip, TextClip,
        concatenate_videoclips, CompositeAudioClip,
    )

    clips = []
    for scene in scenes:
        if not scene.image_path:
            continue

        audio_clip = None
        duration = scene.duration
        if scene.audio_path and os.path.exists(scene.audio_path):
            audio_clip = AudioFileClip(scene.audio_path)
            duration = audio_clip.duration + SECONDS_PER_IMAGE_PAD

        img_clip = ImageClip(scene.image_path).set_duration(duration).resize(size)

        # Burn in simple captions from the dialogue (optional, easy to remove)
        caption_text = "\n".join(f'{d["character"]}: {d["line"]}' for d in scene.dialogue)
        layers = [img_clip]
        if caption_text:
            try:
                txt_clip = (
                    TextClip(caption_text, fontsize=28, color="white", stroke_color="black",
                             stroke_width=2, method="caption", size=(size[0] - 80, None))
                    .set_position(("center", "bottom"))
                    .set_duration(duration)
                )
                layers.append(txt_clip)
            except Exception:
                pass  # ImageMagick not installed -> skip captions gracefully

        scene_clip = CompositeVideoClip(layers, size=size).set_duration(duration)
        if audio_clip:
            scene_clip = scene_clip.set_audio(audio_clip)

        clips.append(scene_clip)

    final = concatenate_videoclips(clips, method="compose")
    final.write_videofile(out_path, fps=24, codec="libx264", audio_codec="aac")


# ==============================================================================
# MAIN PIPELINE
# ==============================================================================

def generate_episode(episode_idea: str, num_scenes: int = NUM_SCENES,
                      bible: dict = SHOW_BIBLE, output_dir: str = OUTPUT_DIR,
                      client: Optional[genai.Client] = None,
                      reference_image_path: Optional[str] = None,
                      use_reference_sheet: bool = True,
                      renderer: str = "video") -> str:
    """Generates one episode.

    renderer:
      "video"  -> real AI-generated motion per scene (Veo). Slower, costs more,
                  actually animated. Falls back to a still image+TTS clip for
                  any individual scene where video gen fails.
      "images" -> original fast/cheap slideshow renderer (still images + TTS +
                  burned-in captions), no motion.

    If reference_image_path is given, reuses that character sheet instead of
    generating a new one (use this for later episodes in a season so the whole
    season shares one consistent cast look).
    """
    if client is None:
        if not API_KEY:
            raise EnvironmentError("Set GEMINI_API_KEY before running.")
        client = genai.Client(api_key=API_KEY)

    os.makedirs(output_dir, exist_ok=True)

    if use_reference_sheet and reference_image_path is None:
        print("Generating character reference sheet...")
        reference_image_path = generate_character_reference_sheet(client, bible, output_dir)
    elif not use_reference_sheet:
        reference_image_path = None
    else:
        print("Reusing existing character reference sheet...")

    print("Writing script...")
    script_json = generate_script(client, bible, num_scenes, episode_idea)
    with open(os.path.join(output_dir, "script.json"), "w") as f:
        json.dump(script_json, f, indent=2)

    scenes = build_scenes(script_json, bible["style_guide"])
    out_path = os.path.join(output_dir, "episode.mp4")

    if renderer == "video":
        print("Generating scene video clips (this can take several minutes)...")
        for scene in scenes:
            print(f"  Scene {scene.number}/{len(scenes)}...")
            clip_path = generate_scene_video_clip(
                client, scene, output_dir, bible["style_guide"],
                reference_image_path=reference_image_path,
            )
            if clip_path is None:
                # Fallback for this scene only: still image + TTS voice line
                generate_scene_image(client, scene, output_dir, reference_image_path=reference_image_path)
                generate_scene_audio(client, scene, output_dir)

        print("Assembling video from clips...")
        assemble_video_from_clips(scenes, out_path)
    else:
        print("Generating artwork...")
        for scene in scenes:
            generate_scene_image(client, scene, output_dir, reference_image_path=reference_image_path)
            time.sleep(1)  # be gentle with rate limits

        print("Generating voice lines...")
        for scene in scenes:
            generate_scene_audio(client, scene, output_dir)
            time.sleep(1)

        print("Assembling slideshow video...")
        assemble_video_slideshow(scenes, out_path)

    print(f"Done! Episode saved to: {out_path}")
    return out_path


def generate_season(episode_ideas: List[str], bible: dict = SHOW_BIBLE,
                     num_scenes: int = NUM_SCENES, season_dir: str = "season_output",
                     renderer: str = "video") -> List[str]:
    """Generates a full season: one character reference sheet shared across
    every episode (for a consistent cast look all season), then one episode
    folder per idea in episode_ideas.

    Example:
        generate_season([
            "Rusty tries to win the go-kart race but Baxter sabotages it",
            "Pip's chore robot goes rogue during the school science fair",
            "The family gets snowed in and Dad tries to fix everything himself",
        ])
    """
    if not API_KEY:
        raise EnvironmentError("Set GEMINI_API_KEY before running.")

    os.makedirs(season_dir, exist_ok=True)
    client = genai.Client(api_key=API_KEY)

    print("Generating shared character reference sheet for the season...")
    reference_image_path = generate_character_reference_sheet(client, bible, season_dir)

    episode_paths = []
    for i, idea in enumerate(episode_ideas, start=1):
        print(f"\n=== Episode {i}/{len(episode_ideas)}: {idea[:60]}... ===")
        ep_dir = os.path.join(season_dir, f"episode_{i:02d}")
        out_path = generate_episode(
            idea,
            num_scenes=num_scenes,
            bible=bible,
            output_dir=ep_dir,
            renderer=renderer,
            client=client,
            reference_image_path=reference_image_path,
        )
        episode_paths.append(out_path)

    print(f"\nSeason complete: {len(episode_paths)} episodes in '{season_dir}/'")
    return episode_paths


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate AI cartoon episode(s).")
    parser.add_argument("--idea", type=str, default="Rusty tries to win the neighborhood "
                         "go-kart race but Baxter the dog keeps sabotaging the pit stop.",
                         help="Single-episode mode: the episode premise.")
    parser.add_argument("--scenes", type=int, default=NUM_SCENES)
    parser.add_argument("--out", type=str, default=OUTPUT_DIR)
    parser.add_argument("--renderer", choices=["video", "images"], default="video",
                         help="'video' = real AI-generated motion per scene (Veo, slower, "
                              "costs more). 'images' = fast still-image slideshow with TTS.")
    parser.add_argument("--no-reference", action="store_true",
                         help="Skip generating/using a character reference sheet.")
    parser.add_argument("--season-file", type=str, default=None,
                         help="Season mode: path to a text file with one episode idea per line. "
                              "All episodes will share one character reference sheet.")
    parser.add_argument("--season-out", type=str, default="season_output")
    args = parser.parse_args()

    if args.season_file:
        with open(args.season_file) as f:
            ideas = [line.strip() for line in f if line.strip()]
        generate_season(ideas, num_scenes=args.scenes, season_dir=args.season_out, renderer=args.renderer)
    else:
        generate_episode(args.idea, num_scenes=args.scenes, output_dir=args.out,
                          use_reference_sheet=not args.no_reference, renderer=args.renderer)
