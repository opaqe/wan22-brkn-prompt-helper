// Provider-agnostic LLM router. For now, routes everything to Gemini to preserve existing behavior.
// Keys are stored in localStorage per provider.

import type { VideoPrompt } from '../../types';
import {
  generatePrompts as geminiGeneratePrompts,
  generateCaptionFromImage as geminiGenerateCaption,
  transformPromptToJson as geminiTransformToJson,
} from '../geminiService';

export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'stability' | 'perplexity';

export const PROVIDERS: Record<LLMProvider, { label: string; storageKey: string }> = {
  gemini: { label: 'Google Gemini', storageKey: 'GEMINI_API_KEY' },
  openai: { label: 'OpenAI', storageKey: 'OPENAI_API_KEY' },
  anthropic: { label: 'Anthropic', storageKey: 'ANTHROPIC_API_KEY' },
  stability: { label: 'Stability AI', storageKey: 'STABILITY_API_KEY' },
  perplexity: { label: 'Perplexity', storageKey: 'PERPLEXITY_API_KEY' },
};

const ACTIVE_PROVIDER_KEY = 'LLM_PROVIDER';

export function getActiveProvider(): LLMProvider {
  const p = (typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_PROVIDER_KEY) : 'gemini') as LLMProvider | null;
  return (p && p in PROVIDERS ? p : 'gemini');
}

export function setActiveProvider(provider: LLMProvider) {
  if (!(provider in PROVIDERS)) return;
  localStorage.setItem(ACTIVE_PROVIDER_KEY, provider);
}

export function getApiKey(provider: LLMProvider = getActiveProvider()): string | null {
  const keyName = PROVIDERS[provider].storageKey;
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(keyName) : null;
  } catch {
    return null;
  }
}

export function setApiKey(key: string, provider: LLMProvider = getActiveProvider()) {
  const keyName = PROVIDERS[provider].storageKey;
  localStorage.setItem(keyName, key.trim());
}

export function clearApiKey(provider: LLMProvider = getActiveProvider()) {
  const keyName = PROVIDERS[provider].storageKey;
  localStorage.removeItem(keyName);
}

// Public API that mirrors the original Gemini service
export async function generatePrompts(params: {
  scene: string;
  style: string;
  protagonistAction: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  isNsfw: boolean;
}): Promise<VideoPrompt[]> {
  const provider = getActiveProvider();
  if (provider !== 'gemini') {
    console.warn(`[LLM Router] Provider "${provider}" not implemented yet. Falling back to Gemini.`);
  }
  return geminiGeneratePrompts(params);
}

export async function generateCaptionFromImage(params: { imageData: string; mimeType: string }): Promise<string> {
  const provider = getActiveProvider();
  if (provider !== 'gemini') {
    console.warn(`[LLM Router] Provider "${provider}" image captioning not implemented yet. Falling back to Gemini.`);
  }
  return geminiGenerateCaption(params);
}

export async function transformPromptToJson(promptText: string): Promise<object> {
  const provider = getActiveProvider();
  if (provider !== 'gemini') {
    console.warn(`[LLM Router] Provider "${provider}" transform-to-JSON not implemented yet. Falling back to Gemini.`);
  }
  return geminiTransformToJson(promptText);
}

export function isApiKeySet(provider: LLMProvider = getActiveProvider()): boolean {
  return !!getApiKey(provider);
}
