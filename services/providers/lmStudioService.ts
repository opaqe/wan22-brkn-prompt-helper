// LM Studio provider service (local OpenAI-compatible API)
// Uses OpenAI-compatible chat completions endpoint
import type { VideoPrompt } from '../../types';

const LM_STUDIO_BASE_URL_KEY = 'LM_STUDIO_BASE_URL';
const LM_STUDIO_MODEL_KEY = 'LM_STUDIO_MODEL';
const DEFAULT_BASE_URL = 'http://localhost:1234';
const DEFAULT_MODEL = 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF';

function getBaseUrl(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(LM_STUDIO_BASE_URL_KEY)) || DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

function getModel(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(LM_STUDIO_MODEL_KEY)) || DEFAULT_MODEL;
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

async function chat({
  messages,
  temperature = 0.7,
  max_tokens = 1024,
}: {
  messages: any[];
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  const baseUrl = getBaseUrl();
  const model = getModel();

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`LM Studio error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error('Empty response from LM Studio.');
  return content.trim();
}

export async function generateCaptionFromImage(params: { imageData: string; mimeType: string }): Promise<string[]> {
  const { imageData, mimeType } = params;
  const dataUrl = `data:${mimeType};base64,${imageData}`;

  const messages = [
    {
      role: 'system',
      content: 'Analyze the image and return exactly 3 rich, distinct caption options (1–2 sentences each) as a JSON array of strings. Output JSON only.'
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this image and return exactly 3 caption options as a JSON array of strings.' },
        { type: 'image_url', image_url: { url: dataUrl } }
      ]
    }
  ];

  const text = await chat({ messages, temperature: 0.7 });
  const json = extractJson<string[]>(text);
  if (!Array.isArray(json)) throw new Error('LM Studio did not return an array.');
  return json as string[];
}

export async function transformPromptToJson(promptText: string): Promise<object> {
  const messages = [
    {
      role: 'system',
      content: 'Return a strict JSON object matching the requested fields. Output JSON only.'
    },
    {
      role: 'user',
      content: `Analyze this video prompt and return a JSON object with these keys: scene_description, visual_style, protagonist_action, camera_angle, camera_movement, lighting_details, additional_keywords (array).\n\nPrompt: "${promptText}"`
    }
  ];

  const text = await chat({ messages, temperature: 0.1 });
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

  const systemContent = isNsfw
    ? 'You are a master visual storyteller for adult, tasteful content. Follow safety rules. Generate video prompts as JSON only.'
    : 'You are a master visual storyteller for cinematic content. Generate video prompts as JSON only.';

  const userContent = `Generate 3 video prompt variations as a JSON array. Each item has {"title": string, "prompt": string}.

Rules:
- 80–120 words each (max 140).
- Weave camera angle and movement into narrative.
- Combine elements cohesively.

Criteria:
- Main Scene: "${scene}"
- Visual Style: "${style}"
- Protagonist Action: "${protagonistAction}"
- Camera Angle: "${cameraAngle}"
- Camera Movement: "${cameraMovement}"
- Camera/Device: "${cameraDevice ?? ''}"
- Lighting: "${lighting}"`;

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: userContent }
  ];

  const text = await chat({
    messages,
    temperature: isNsfw ? 0.9 : 0.8,
    max_tokens: 1500
  });

  const json = extractJson<VideoPrompt[]>(text);
  if (!Array.isArray(json)) throw new Error('Expected an array of prompts.');
  return json as VideoPrompt[];
}