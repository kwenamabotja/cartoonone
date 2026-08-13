# AI Cartoon Episode Generator

Generates a short animated episode end-to-end with the Gemini API:
character reference sheet → script → **AI-generated video clips per scene**
(real motion, via Veo) → assembled MP4. A faster/cheaper still-image
slideshow mode is also available.

## Setup

```bash
pip install -r requirements.txt
export GEMINI_API_KEY="your-ai-studio-api-key"
```

`moviepy`'s caption burn-in (images renderer only) also uses ImageMagick if
available. If it's not installed, captions are skipped automatically (video
still renders fine) — install it with `apt-get install imagemagick` (Linux)
if you want captions.

## Run — real animated video (default)

```bash
python cartoon_generator.py --idea "Pip invents a robot to do her chores and it goes rogue" --scenes 6
```

This uses `--renderer video` by default: each scene becomes a real
AI-generated ~5-8 second video clip (via Veo), seeded from the character
reference sheet, with dialogue spoken and lip-synced as part of the clip
itself. Clips are stitched together with short crossfades into `episode.mp4`.

**This is slow and costs more than image generation** — each clip takes
roughly 30 seconds to a few minutes to generate and the code polls until
it's ready. Expect a 6-scene episode to take several minutes to render.
If a clip fails to generate (filtered, timeout, quota), that one scene
automatically falls back to a still image + narrated voice line instead of
failing the whole episode.

## Run — fast still-image slideshow (for quick iteration)

```bash
python cartoon_generator.py --idea "..." --scenes 6 --renderer images
```

Much faster and cheaper: one illustrated still image per scene + a TTS voice
line + burned-in captions, held on screen for the audio's duration. Good for
testing a script/story fast before committing to a full video render.

Output lands in `output/`:
- `character_reference_sheet.png` — the whole cast generated once and reused
  as a visual seed for every scene/clip, so characters stay consistent
- `script.json` — the full generated script
- `scene_XX.mp4` — (video renderer) one generated clip per scene
- `scene_XX.png` / `scene_XX.wav` — (images renderer, or per-scene fallback
  in video renderer) still frame + voice line
- `episode.mp4` — the finished, assembled video

Skip the reference sheet with `--no-reference` if you'd rather each scene be
generated independently (faster, but less consistent character look).

## Generating a whole season

Put one episode premise per line in a text file, e.g. `season_ideas.txt`:

```
Rusty tries to win the go-kart race but Baxter sabotages it
Pip's chore robot goes rogue during the school science fair
The family gets snowed in and Dad tries to fix everything himself
```

Then run:

```bash
python cartoon_generator.py --season-file season_ideas.txt --season-out my_season --renderer video
```

This generates **one** character reference sheet up front and reuses it for
every episode, so the whole season shares a consistent cast look. Output
structure:

```
my_season/
  character_reference_sheet.png
  episode_01/
    script.json, scene_XX.mp4, episode.mp4
  episode_02/
    ...
```

You can also call `generate_season([...])` directly from Python if you want
to build the idea list programmatically (e.g. have Gemini itself brainstorm
a season's worth of premises first, then feed that list in).

## Customizing your show

Edit `SHOW_BIBLE` at the top of `cartoon_generator.py`:

- `title` / `logline` / `tone` — your show's premise
- `characters` — your own original cast (name + short description)
- `style_guide` — the visual style fed into every image/video prompt

Keep `characters` and `style_guide` original — describe your own designs
rather than naming/copying an existing show's specific characters or art,
so the output is safe to publish on YouTube/TV under your own IP.

## Honest limitations

- **Clip length**: Veo currently caps individual clips at ~8 seconds, so an
  episode is a sequence of short generated clips, not one continuous shot.
  Long scenes' dialogue gets compressed to fit.
- **Character consistency**: the reference-sheet seeding helps a lot but
  isn't pixel-perfect guarantee across every clip — occasional drift is
  possible. For a fully locked, consistent character design used the same
  way every episode (the studio-standard approach), treat this pipeline's
  reference sheet as your character design, then rig it in a tool like
  Adobe Character Animator or Toon Boom Harmony for production use.
- **Cost/quota**: video generation is billed and rate-limited more heavily
  than text/image calls on most Gemini API tiers — check your quota in AI
  Studio before running a full season.

## Notes on the models used

- `gemini-2.5-flash` — script writing (swap to `gemini-2.5-pro` for higher
  quality writing at higher cost/latency)
- `gemini-2.5-flash-image` — character reference sheet + still-image renderer
- `veo-3.0-fast-generate-001` — scene video clips (swap to `veo-3.0-generate-001`
  for higher quality, higher cost)
- `gemini-2.5-flash-preview-tts` — voice line audio (images renderer / per-scene
  video fallback)

Model names/availability change more often than most other Gemini models,
especially for video. If any of these return a "model not found" error,
check the current model list in Google AI Studio and swap the name into the
CONFIG section at the top of `cartoon_generator.py`.
