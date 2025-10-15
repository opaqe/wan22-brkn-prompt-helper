// Qwen (DashScope) provider service
// Client-side fetch using OpenAI-compatible Chat Completions API
// Returns the same shapes as our Gemini service functions
import type { VideoPrompt } from '../../types';

const QWEN_BASE_URL_KEY = 'QWEN_BASE_URL';
const QWEN_MODEL_DEFAULT = 'qwen2.5-vl-32b-instruct';
const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

function getApiKey(): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem('QWEN_API_KEY') : null;
  } catch {
    return null;
  }
}

function getBaseUrl(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(QWEN_BASE_URL_KEY)) || DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

function extractJson<T = any>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Step 1: Remove markdown code blocks
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Step 2: Fix common escape sequence issues
    cleanText = cleanText
      .replace(/\\"/g, '"')  // Fix double-escaped quotes
      .replace(/\n/g, ' ')    // Replace newlines with spaces
      .replace(/\r/g, ' ')    // Replace carriage returns
      .replace(/\t/g, ' ')    // Replace tabs
      .replace(/\\/g, '\\\\') // Ensure backslashes are properly escaped
      .replace(/\\\\"/g, '\\"'); // But keep escaped quotes as single escape
    
    try {
      return JSON.parse(cleanText) as T;
    } catch {
      // Step 3: Find JSON boundaries
      const start = Math.min(
        ...['[', '{']
          .map((c) => cleanText.indexOf(c))
          .filter((i) => i >= 0)
      );
      const end = Math.max(
        ...[']', '}']
          .map((c) => cleanText.lastIndexOf(c))
          .filter((i) => i >= 0)
      );
      
      if (start >= 0 && end > start) {
        const slice = cleanText.slice(start, end + 1);
        try {
          return JSON.parse(slice) as T;
        } catch {
          // Step 4: Last resort - fix common JSON issues
          const fixedSlice = slice
            .replace(/,\s*}/g, '}')                    // Remove trailing commas in objects
            .replace(/,\s*]/g, ']')                    // Remove trailing commas in arrays
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')    // Quote unquoted keys
            .replace(/:\s*'([^']*)'/g, ':"$1"');       // Replace single quotes with double
          return JSON.parse(fixedSlice) as T;
        }
      }
      throw new Error(`Response was not valid JSON. Raw response: ${text.substring(0, 200)}...`);
    }
  }
}

async function chat({
  messages,
  response_format,
  temperature = 0.7,
  max_tokens = 1024,
}: {
  messages: any[];
  response_format?: any;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Qwen (DashScope) API key missing. Save it in Settings.");
  }

  const res = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: QWEN_MODEL_DEFAULT,
      messages,
      temperature,
      max_tokens,
      response_format,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`DashScope error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error('Empty response from Qwen.');
  return content.trim();
}

export async function generateCaptionFromImage(params: { imageData: string; mimeType: string }): Promise<string[]> {
  const { imageData, mimeType } = params;
  const dataUrl = `data:${mimeType};base64,${imageData}`;

  const system = {
    role: 'system',
    content: 'You analyze an image and return exactly 3 rich, distinct captions as a JSON array of strings. Output JSON only.'
  };
  const user = {
    role: 'user',
    content: [
      { type: 'text', text: `Analyze this image and return exactly 3 detailed caption options (each 80-120 words). When a person is the main subject, lead with physicality, then describe feelings and environment:

**Lead with Physicality:**
- Race/Ethnicity (Slavic, Asian, African, etc.)
- Hair color/style  
- Body type and size (petite, athletic, curvy, muscular)
- Breast size (when relevant: small, medium, large)
- Notable features (freckles, dimples, scars, tattoos)

**Then add Action & Sensory Details:**
- What they're doing (action/pose)
- Sensory details (how things feel - cool metal, warm skin, rough fabric)

**Describe Feelings & Environment:**
- Emotional atmosphere (tension, serenity, passion, excitement)
- Environmental mood and lighting quality
- Setting details that enhance emotional tone

**Examples:**
SFW: "A broad-shouldered African American man with tight curly black hair and defined abs is mid-pullup in a dimly lit industrial gym. His biceps bulge and veins stand out against his dark skin. The atmosphere is gritty and determined, with golden hour light cutting through dusty windows. The air feels heavy with effort and ambition."
NSFW: "A petite Asian woman with long black hair, large breasts, and slender legs stands in semi-transparent lingerie. Her skin is porcelain pale with a small birthmark below her collarbone. The bedroom atmosphere is thick with anticipation, silk sheets catching warm lamplight. Her gaze is vulnerable and inviting, the space intimate and hushed."

Return exactly 3 captions as a JSON array of strings. No prose.` },
      { type: 'image_url', image_url: { url: dataUrl } },
    ],
  };

  const text = await chat({
    messages: [system, user],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });
  const json = extractJson<string[]>(text);
  if (!Array.isArray(json)) throw new Error('Qwen did not return an array.');
  return json as string[];
}

export async function transformPromptToJson(promptText: string): Promise<object> {
  const system = {
    role: 'system',
    content: 'Return a strict JSON object matching the requested fields. Output JSON only.'
  };
  const user = {
    role: 'user',
    content: `Analyze this video prompt and return a JSON object with these keys: scene_description, visual_style, protagonist_action, camera_angle, camera_movement, lighting_details, additional_keywords (array).\n\nPrompt: "${promptText}"`,
  };
  const text = await chat({
    messages: [system, user],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });
  return extractJson<object>(text);
}

// ============ THREE-PART GENERATION SYSTEM ============

// Part 1: Caption & Character Generation
export async function generateCaptionAndCharacter(params: {
  scene: string;
  style: string;
  isNsfw: boolean;
}): Promise<string> {
  const { scene, style, isNsfw } = params;

  const system = {
    role: 'system',
    content: isNsfw
      ? 'You are a master visual storyteller for adult content. Describe scenes with rich physical and sensory details.'
      : 'You create WAN 2.2 video prompts. Focus on precise subject and scene descriptions.'
  };

  const user = {
    role: 'user',
    content: `Create a detailed subject and scene description (60-80 words) following WAN 2.2 structure.

Scene: "${scene}"
Visual Style: "${style}"

Structure your description:
1. **Subject Description**: Describe the main subject/character in detail (who they are, appearance, clothing)
2. **Scene Setting**: Describe the environment and background (where this takes place, atmosphere)

Example: "A young woman in a red dress holding a glowing umbrella, in a bustling neon-lit city street at night"

Return ONLY the description as plain text (no JSON, no labels).`
  };

  return await chat({
    messages: [system, user],
    temperature: 0.8,
    max_tokens: 300
  });
}

// Part 2: Action & Scene Dynamics
export async function generateActionDescription(params: {
  refinedScene: string;
  protagonistAction: string;
  isNsfw: boolean;
}): Promise<string> {
  const { refinedScene, protagonistAction, isNsfw } = params;

  const system = {
    role: 'system',
    content: isNsfw
      ? 'You are a master visual storyteller for adult content. Describe character actions with sensory and emotional depth.'
      : 'You create WAN 2.2 video prompts. Focus on motion and character movement.'
  };

  const user = {
    role: 'user',
    content: `Add motion details to this scene (50-70 words) following WAN 2.2 structure.

Scene: "${refinedScene}"
Action: "${protagonistAction}"

Structure your description:
- **Motion & Character Action**: Describe how the character/subject moves and what they're doing
- Keep it dynamic and specific

Example: "slowly walking forward while looking over her shoulder, hair flowing in the wind"

Return ONLY the motion description as plain text (no JSON, no labels).`
  };

  return await chat({
    messages: [system, user],
    temperature: 0.8,
    max_tokens: 250
  });
}

// Part 3: Final Camera & Cinematography
export async function generateFinalPrompts(params: {
  actionDescription: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  isNsfw: boolean;
  cameraDevice?: string;
}): Promise<VideoPrompt[]> {
  const { actionDescription, cameraAngle, cameraMovement, lighting, isNsfw, cameraDevice } = params;

  const system = {
    role: 'system',
    content: isNsfw
      ? 'You are a master cinematographer for adult content. Create complete video prompts with camera work. Output JSON only.'
      : 'You create WAN 2.2 video prompts. Combine subject, scene, motion, camera work, and visual style. Output JSON only.'
  };

  const user = {
    role: 'user',
    content: `Generate 3 complete WAN 2.2 video prompt variations as a JSON array. Each item has {"title": string, "prompt": string}.

Scene & Action: "${actionDescription}"
Camera Angle: "${cameraAngle}"
Camera Movement: "${cameraMovement}"
Camera/Device: "${cameraDevice ?? 'cinematic camera'}"
Lighting: "${lighting}"

WAN 2.2 Structure (80-120 words each):
[Subject] + [Scene] + [Motion] + [Camera Work] + [Visual Style/Lighting]

Example: "A lone cowboy riding through a desert canyon, sunset lighting, drone tracking shot, cinematic grading"

Integrate camera angle and movement naturally into the narrative. Each variation should be complete and cinematic.

Return ONLY a JSON array of 3 prompts.`
  };

  const text = await chat({
    messages: [system, user],
    response_format: { type: 'json_object' },
    temperature: isNsfw ? 0.9 : 0.8,
    max_tokens: 1500
  });

  const json = extractJson<VideoPrompt[]>(text);
  if (!Array.isArray(json)) throw new Error('Expected an array of prompts.');
  return json as VideoPrompt[];
}

// ============ LEGACY SINGLE-CALL GENERATION ============

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

  const system = {
    role: 'system',
    content: `${isNsfw
      ? 'You are a master visual storyteller for adult, tasteful content. Follow safety rules. Output JSON only.'
      : 'You are a master visual storyteller for cinematic content. Output JSON only.'}`,
  };

  const user = {
    role: 'user',
    content: `Generate 3 video prompt variations as a JSON array. Each item has {"title": string, "prompt": string}.\n\nRules:\n- 80–120 words each (max 140).\n- **CRITICAL: Build each prompt around the Main Scene description - it's your foundation. Use every detail from it.**\n- Weave camera angle and movement into narrative.\n- Combine elements cohesively.\n\nCriteria:\n- Main Scene (YOUR FOUNDATION): "${scene}"\n- Visual Style: "${style}"\n- Protagonist Action: "${protagonistAction}"\n- Camera Angle: "${cameraAngle}"\n- Camera Movement: "${cameraMovement}"\n- Camera/Device: "${cameraDevice ?? ''}"\n- Lighting: "${lighting}"`,
  };

  const text = await chat({
    messages: [system, user],
    response_format: { type: 'json_object' },
    temperature: isNsfw ? 0.9 : 0.8,
  });

  const json = extractJson<VideoPrompt[]>(text);
  if (!Array.isArray(json)) throw new Error('Expected an array of prompts.');
  return json as VideoPrompt[];
}
