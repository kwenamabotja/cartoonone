import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily / safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API endpoint to generate a full cartoon roleplay script for kids education (any topic)
app.post("/api/gemini/generate-script", async (req, res) => {
  try {
    const {
      topic = "Variables",
      category = "General Knowledge",
      targetAge = "5-8",
      charA,
      charB,
      characters: reqCharacters,
      setting = "classroom",
      sceneCount = 6,
      showStyle = "cartoon_network",
    } = req.body;

    // Validate and clamp requested scene count between 5 and 12
    const requestedScenes = Number(sceneCount) || 6;
    const actualSceneCount = Math.max(5, Math.min(12, requestedScenes));

    const characters = Array.isArray(reqCharacters) && reqCharacters.length > 0
      ? reqCharacters
      : [charA || { name: "Byte", style: "dog" }, charB || { name: "Chip", style: "robot" }];

    const charListStr = characters.map((c: any, i: number) => `Character ${i + 1}: ${c.name} (${c.style || 'cartoon'}) - Role: ${c.role || 'Presenter'}`).join('\n');
    const speakerNamesStr = characters.map((c: any) => `"${c.name}"`).join(' or ');
    const isSolo = characters.length === 1;

    const ai = getGeminiClient();

    const isAdultAudience = String(targetAge).includes("Adult") || String(targetAge).includes("18+") || String(category).includes("Cybersecurity") || String(category).includes("Adult") || String(category).includes("Professional");

    // Dynamic animation profile parameters based on showStyle
    const showStyleProfiles: Record<string, string> = {
      cartoon_network: `SHOW ANIMATION PROFILE: Cartoon Network Slapstick & Fast-Paced Comedy
- Camera Frequency: High camera switching frequency. Frequently alternate between 'QUICK_WHIP_PAN', 'CLOSE_UP_EMOTE', 'REACTION_SHOT', and 'OVER_THE_SHOULDER'.
- Pacing & Gestures: Exaggerated cartoon reactions and slapstick poses ('shocked_eyes', 'squash_and_stretch', 'facepalm', 'point_dramatic', 'double_take', 'holding_prop', 'scratching_head').
- Sound Effects: High-energy, snappy cartoon sound effects ('boing', 'pop', 'dramatic_sting', 'bounce', 'whistle', 'applause').
- Tone: High-energy, funny, slightly chaotic, break-the-fourth-wall slapstick comedy.`,

      spongebob: `SHOW ANIMATION PROFILE: SpongeBob Comedic Pacing & High SFX Density
- Sound Density: High sound-effect density on almost every beat ('dramatic_sting', 'laugh_track', 'boing', 'giggle', 'robot_beep', 'pop', 'fanfare', 'tada').
- Reaction Holds: Extreme expression holds and dramatic title-card style stings ('shocked_eyes', 'squash_and_stretch', 'laughing', 'confused', 'celebrating').
- Camera Directing: Dramatic close-up reaction shots, sudden push-ins, and comedic cuts ('CLOSE_UP_EMOTE', 'SLOW_PUSH_IN', 'QUICK_WHIP_PAN', 'REACTION_SHOT').
- Tone: Absurdist, theatrical enthusiasm, dramatic gasp moments, funny visual gags, nautical/cartoon playfulness.`,

      bluey: `SHOW ANIMATION PROFILE: Bluey Storybook Warmth & Gentle Pacing
- Camera Directing: Smooth, calm camera holds ('SLOW_PUSH_IN', 'MEDIUM_TWO_SHOT', 'WIDE_ESTABLISHING'). Minimal jarring cuts.
- Pacing & Gestures: Tender emotional pacing, heartwarming beat pauses ('timingHoldMs': 800 to 1800ms), gentle expressive gestures ('open_palms', 'hugging', 'waving', 'thinking_chin', 'hand_on_hip', 'pointing_finger').
- Sound Effects & Ambience: Gentle acoustic cues and warm sound triggers ('magic', 'tada', 'whistle', 'applause', 'none').
- Tone: Warm storybook feel, empathetic character dialogue, imaginative pretend-play, relatable family/friendship humor.`,

      educational_classic: `SHOW ANIMATION PROFILE: Educational Classic Broadcast
- Camera Directing: Balanced, clear broadcast framing ('MEDIUM_TWO_SHOT', 'OVER_THE_SHOULDER', 'WIDE_ESTABLISHING').
- Pacing & Gestures: Structured step-by-step breakdown with clear visual takeaway snippets ('pointing_finger', 'open_palms', 'thumbs_up', 'clapping', 'crossing_arms').
- Sound Effects: Clean UI and success notification triggers ('success', 'robot_beep', 'tada', 'pop').
- Tone: Clear, encouraging, structured step-by-step educational flow.`
    };

    const selectedProfile = showStyleProfiles[showStyle] || showStyleProfiles["cartoon_network"];

    // 3-Act Structure partitioning
    const act1Count = Math.max(1, Math.floor(actualSceneCount * 0.25));
    const act2Count = Math.max(2, Math.floor(actualSceneCount * 0.5));

    const prompt = `You are a Principal TV Animation Director & Showrunner for hit broadcast cartoon series.
Create a broadcast-quality, funny, expressive, and highly engaging cartoon script with EXACTLY ${actualSceneCount} SCENES.
Topic: "${topic}" (Subject Category: "${category}")
Target Audience: ${targetAge} (${isAdultAudience ? 'Adult Professionals / IT' : 'Kids & Youth'})

Show Characters:
${charListStr}

Setting / Environment: ${setting}

${selectedProfile}

STRICT 3-ACT ANIMATION PACING MANDATE:
You MUST structure the episode into a classic 3-Act narrative arc across the ${actualSceneCount} scenes:
- ACT 1: Cold Open & Setup (Scenes 1 to ${act1Count}):
  Hook the audience immediately in location '${setting}'. Introduce character conflict, curiosity, or hilarious mistake regarding "${topic}".
- ACT 2: Escalation & Hijinks (Scenes ${act1Count + 1} to ${act1Count + act2Count}):
  Escalate the comedic confusion! Dynamic back-and-forth dialogue, physical comedy gags, comedic beat pauses, and clear educational/takeaway visual cards explaining key concepts.
- ACT 3: Resolution & Outro Gag (Scenes ${act1Count + act2Count + 1} to ${actualSceneCount}):
  Climax, lightbulb epiphany/resolution moment, core lesson recap, and a funny final outro joke / callback gag.

DIRECTING & PACING SPECIFICATIONS:
1. Every scene dialogue MUST mandate a cinematic camera angle: 'WIDE_ESTABLISHING', 'OVER_THE_SHOULDER', 'CLOSE_UP_EMOTE', 'QUICK_WHIP_PAN', 'SLOW_PUSH_IN', 'MEDIUM_TWO_SHOT', or 'REACTION_SHOT'.
2. Assign secondary micro-actions and physical comedy gags (e.g., "dramatic double-take gasp", "spills tea cup", "adjusts tech glasses", "suspicious side-eye blink", "leans into camera").
3. Assign expressive hand gestures: 'pointing_finger', 'open_palms', 'thumbs_up', 'hand_on_hip', 'scratching_head', 'facepalm', 'clapping', 'waving', 'crossing_arms', 'shrugging', 'shocked_eyes', 'holding_prop', 'squash_and_stretch', 'point_dramatic', 'double_take', 'thinking_chin', or 'none'.
4. Include deliberate comedic timing hold pauses ('timingHoldMs': 400 to 1800ms) for reaction beats.
5. Provide automatic phoneme viseme mouth cues ('visemeCues') for frame-accurate lip sync.
6. Scene Transition Animation: Assign 'fade', 'slide', 'zoom', 'wipe', 'bounce', or 'none'.

Tone Guidelines:
${isAdultAudience ? `- Target Group: Adults, Developers, IT & Cybersecurity Pros.
- Tone: Witty, sharp, relatable, workplace tech humor, accurate concepts delivered cleanly without being dry.` : `- Target Group: Kids & Youth (${targetAge} years old).
- Tone: Playful, engaging, imaginative analogies, funny character banter.`}

Return a JSON object containing:
- "title": Catchy cartoon episode title with emojis
- "category": Topic category ("${category}")
- "showStyle": Selected style ("${showStyle}")
- "scenes": Array of EXACTLY ${actualSceneCount} scenes. Each scene object MUST contain:
  - "actNumber": Integer (1, 2, or 3)
  - "actName": String (e.g., "Act 1: Cold Open & Setup", "Act 2: Escalation & Hijinks", "Act 3: Resolution & Outro Gag")
  - "speaker": Name of speaker (${speakerNamesStr})
  - "dialogue": Expressive, punchy line of dialogue (keep under 25 words per line for snappy timing).
  - "speakerEmotion": One of ["happy", "thinking", "explaining", "surprised", "confused", "laughing", "celebrating", "angry", "wink", "sad", "shocked_eyes", "squash_and_stretch", "facepalm"]
  - "listenerEmotion": One of ["happy", "thinking", "explaining", "surprised", "confused", "laughing", "celebrating", "angry", "wink", "sad", "shocked_eyes", "squash_and_stretch", "facepalm"]
  - "cameraAngle": One of ["WIDE_ESTABLISHING", "OVER_THE_SHOULDER", "CLOSE_UP_EMOTE", "QUICK_WHIP_PAN", "SLOW_PUSH_IN", "MEDIUM_TWO_SHOT", "REACTION_SHOT"]
  - "microAction": Secondary physical action/gag description.
  - "handGesture": One of ["pointing_finger", "open_palms", "thumbs_up", "hand_on_hip", "scratching_head", "facepalm", "clapping", "waving", "crossing_arms", "shrugging", "shocked_eyes", "holding_prop", "squash_and_stretch", "point_dramatic", "double_take", "thinking_chin", "none"]
  - "sceneTransition": One of ["fade", "slide", "zoom", "wipe", "bounce", "none"]
  - "timingHoldMs": Pause duration in milliseconds (400 to 1800)
  - "visemeCues": Array of phoneme objects { "timeOffsetMs": number, "viseme": "A"|"E"|"I"|"O"|"U"|"M"|"F"|"rest" }
  - "codeSnippet": Short visual fact/formula/key takeaway card or code block, or empty string.
  - "codeHighlight": Optional keyword or formula term to highlight, or empty string.
  - "soundEffect": One of ["pop", "success", "magic", "robot_beep", "tada", "whistle", "giggle", "bounce", "applause", "laugh_track", "dramatic_sting", "fanfare", "boing", "none"]
  - "actionEffect": One of ["walk", "run", "jump", "fly", "dance", "flip", "bounce", "shake", "float", "zoom", "spin", "sit", "none"]
- "youtubeTitle": An engaging YouTube video title.
- "youtubeDescription": YouTube description with timestamps, summary, key takeaways, and hashtags.
- "tags": Array of 6-10 keywords/hashtags.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            showStyle: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  actNumber: { type: Type.INTEGER },
                  actName: { type: Type.STRING },
                  speaker: { type: Type.STRING },
                  dialogue: { type: Type.STRING },
                  speakerEmotion: { type: Type.STRING },
                  listenerEmotion: { type: Type.STRING },
                  cameraAngle: { type: Type.STRING },
                  microAction: { type: Type.STRING },
                  handGesture: { type: Type.STRING },
                  sceneTransition: { type: Type.STRING },
                  timingHoldMs: { type: Type.INTEGER },
                  visemeCues: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        timeOffsetMs: { type: Type.INTEGER },
                        viseme: { type: Type.STRING },
                      },
                      required: ["timeOffsetMs", "viseme"],
                    },
                  },
                  codeSnippet: { type: Type.STRING },
                  codeHighlight: { type: Type.STRING },
                  soundEffect: { type: Type.STRING },
                  actionEffect: { type: Type.STRING },
                },
                required: [
                  "speaker",
                  "dialogue",
                  "speakerEmotion",
                  "listenerEmotion",
                  "cameraAngle",
                  "microAction",
                  "handGesture",
                  "soundEffect",
                  "actionEffect",
                ],
              },
            },
            youtubeTitle: { type: Type.STRING },
            youtubeDescription: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "scenes", "youtubeTitle", "youtubeDescription", "tags"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (err: any) {
    console.error("Error generating script:", err);
    res.status(500).json({ error: err.message || "Failed to generate cartoon script" });
  }
});

// API endpoint to generate frame-accurate phoneme visemes for speech synthesis audio
app.post("/api/gemini/generate-visemes", async (req, res) => {
  try {
    const { dialogue = "", totalDurationMs = 3000 } = req.body;
    const ai = getGeminiClient();

    const prompt = `Analyze this spoken cartoon dialogue line and break it down into phoneme visemes for lip-sync animation:
Line: "${dialogue}"
Total Duration: ${totalDurationMs} ms.

Map character mouth movements to standard visemes: 'A', 'E', 'I', 'O', 'U', 'M', 'F', 'rest'.
Return JSON with an array "visemeCues" containing objects with "timeOffsetMs" (from 0 to ${totalDurationMs}) and "viseme".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visemeCues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeOffsetMs: { type: Type.INTEGER },
                  viseme: { type: Type.STRING },
                },
                required: ["timeOffsetMs", "viseme"],
              },
            },
          },
          required: ["visemeCues"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("Error generating visemes:", err);
    res.status(500).json({ error: err.message || "Failed to generate viseme timing" });
  }
});

// API endpoint to generate YouTube Metadata optimization
app.post("/api/gemini/youtube-metadata", async (req, res) => {
  try {
    const { title, topic, targetAge, scenes } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate YouTube Metadata for a kids educational cartoon video.
Episode Title: ${title}
Programming Topic: ${topic}
Target Age: ${targetAge}
Script Summary: ${JSON.stringify(scenes?.map((s: any) => `${s.speaker}: ${s.dialogue}`).slice(0, 5))}

Provide a JSON with:
- "youtubeTitle": Eye-catching title under 70 characters with emojis.
- "youtubeDescription": Engaging description including timestamps for intro, roleplay story, code takeaway, and call-to-action to subscribe.
- "tags": Array of relevant search tags for YouTube algorithm.
- "thumbnailIdeas": Array of 3 creative visual thumbnail prompts/ideas.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            youtubeTitle: { type: Type.STRING },
            youtubeDescription: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            thumbnailIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["youtubeTitle", "youtubeDescription", "tags", "thumbnailIdeas"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("Error generating YouTube metadata:", err);
    res.status(500).json({ error: err.message || "Failed to generate YouTube metadata" });
  }
});

// Start Express + Vite Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cartoon Code Studio Server running on http://localhost:${PORT}`);
  });
}

startServer();
