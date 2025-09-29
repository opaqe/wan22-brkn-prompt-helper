// Ollama provider service (local)
// Uses the /api/generate endpoint. For vision, pass base64 images (without data URL prefix).
import type { VideoPrompt } from '../../types';

const OLLAMA_BASE_URL_KEY = 'OLLAMA_BASE_URL';
const OLLAMA_MODEL_KEY = 'OLLAMA_MODEL';
const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'qwen2.5-vl:32b';

function getBaseUrl(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(OLLAMA_BASE_URL_KEY)) || DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

function getModel(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(OLLAMA_MODEL_KEY)) || DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

function extractJson<T = any>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = Math.min(
      ...['[', '{']
        .map((c) => text.indexOf(c))
        .filter((i) => i >= 0)
    );
    const end = Math.max(
      ...[']', '}']
        .map((c) => text.lastIndexOf(c))
        .filter((i) => i >= 0)
    );
    if (start >= 0 && end > start) {
      const slice = text.slice(start, end + 1);
      return JSON.parse(slice) as T;
    }
    throw new Error('Response was not valid JSON.');
  }
}

async function generate({ prompt, images }: { prompt: string; images?: string[] }): Promise<string> {
  const baseUrl = getBaseUrl();
  const model = getModel();

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, images, stream: false }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Ollama error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text: string = data?.response ?? '';
  if (!text) throw new Error('Empty response from Ollama.');
  return text.trim();
}

export async function generateCaptionFromImage(params: { imageData: string; mimeType: string }): Promise<string[]> {
  const { imageData } = params;
  const prompt = `Analyze the image and return exactly 3 rich, distinct caption options. When a person is the main subject, lead with detailed physicality:

**Lead with Physicality:**
- Race/Ethnicity (Slavic, Asian, African, etc.)
- Hair color/style
- Body type and size (petite, athletic, curvy, muscular)
- Notable features (freckles, dimples, scars, tattoos)

**Then add:**
- What they're doing (action/pose)
- Sensory details (how things feel - cool metal, warm skin, rough fabric)

**Examples:**
SFW: "A broad-shouldered African American man with tight curly black hair and defined abs is mid-pullup. His biceps bulge and veins stand out against his dark skin."
NSFW: "A petite Asian woman with long black hair, large breasts, and slender legs stands in semi-transparent lingerie. Her skin is porcelain pale with a small birthmark below her collarbone."

Return exactly 3 captions as a JSON array of strings. Output JSON only.`;
  const text = await generate({ prompt, images: [imageData] });
  const json = extractJson<string[]>(text);
  if (!Array.isArray(json)) throw new Error('Ollama did not return an array.');
  return json as string[];
}

export async function transformPromptToJson(promptText: string): Promise<object> {
  const prompt = `Analyze the following video prompt and return a JSON object with keys: scene_description, visual_style, protagonist_action, camera_angle, camera_movement, lighting_details, additional_keywords (array). Output JSON only.\n\nPrompt: "${promptText}"`;
  const text = await generate({ prompt });
  return extractJson<object>(text);
}

export async function generatePrompts(params: {
  scene: string;
  style: string;
  protagonistAction: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  isNsfw: boolean;
  cameraDevice?: string;
}): Promise<VideoPrompt[]> {
  const { scene, style, protagonistAction, cameraAngle, cameraMovement, lighting, isNsfw, cameraDevice } = params;

  const sys = isNsfw
    ? 'You are a master visual storyteller for tasteful adult content. Follow safety rules. '
    : 'You are a master visual storyteller for cinematic content. ';

  const prompt = `${sys}Generate 3 video prompt variations as a JSON array. Each item is an object with keys \"title\" and \"prompt\".\nRules:\n- 80–120 words each (max 140).\n- Weave camera angle and movement into narrative.\n- Combine elements cohesively.\n\nCriteria:\n- Main Scene: \"${scene}\"\n- Visual Style: \"${style}\"\n- Protagonist Action: \"${protagonistAction}\"\n- Camera Angle: \"${cameraAngle}\"\n- Camera Movement: \"${cameraMovement}\"\n- Camera/Device: \"${cameraDevice ?? ''}\"\n- Lighting: \"${lighting}\"`;

  const text = await generate({ prompt });
  const json = extractJson<VideoPrompt[]>(text);
  if (!Array.isArray(json)) throw new Error('Expected an array of prompts.');
  return json as VideoPrompt[];
}
