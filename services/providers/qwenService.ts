// Qwen (DashScope) provider service
// Client-side fetch using OpenAI-compatible Chat Completions API
// Returns the same shapes as our Gemini service functions
import type { VideoPrompt } from '../../types';

const DASHCOPE_COMPAT_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const QWEN_MODEL_DEFAULT = 'qwen2.5-vl-32b-instruct';

function getApiKey(): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem('QWEN_API_KEY') : null;
  } catch {
    return null;
  }
}

function extractJson<T = any>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to find a JSON array/object inside the text
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

  const res = await fetch(DASHCOPE_COMPAT_ENDPOINT, {
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
      { type: 'text', text: 'Analyze this image and return exactly 3 caption options (1–2 sentences each) as a JSON array of strings. No prose.' },
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
    content: `Generate 3 video prompt variations as a JSON array. Each item has {"title": string, "prompt": string}.\n\nRules:\n- 80–120 words each (max 140).\n- Weave camera angle and movement into narrative.\n- Combine elements cohesively.\n\nCriteria:\n- Main Scene: "${scene}"\n- Visual Style: "${style}"\n- Protagonist Action: "${protagonistAction}"\n- Camera Angle: "${cameraAngle}"\n- Camera Movement: "${cameraMovement}"\n- Camera/Device: "${cameraDevice ?? ''}"\n- Lighting: "${lighting}"`,
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
