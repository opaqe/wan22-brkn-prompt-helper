// Provider-agnostic LLM router. For now, routes everything to Gemini to preserve existing behavior.
// Keys are stored in localStorage per provider.

import type { VideoPrompt } from '../../types';
import {
  generatePrompts as geminiGeneratePrompts,
  generateCaptionFromImage as geminiGenerateCaption,
  transformPromptToJson as geminiTransformToJson,
} from '../geminiService';
import {
  generatePrompts as qwenGeneratePrompts,
  generateCaptionFromImage as qwenGenerateCaption,
  transformPromptToJson as qwenTransformToJson,
} from '../providers/qwenService';
import {
  generatePrompts as ollamaGeneratePrompts,
  generateCaptionFromImage as ollamaGenerateCaption,
  transformPromptToJson as ollamaTransformToJson,
} from '../providers/ollamaService';
import {
  generatePrompts as lmStudioGeneratePrompts,
  generateCaptionFromImage as lmStudioGenerateCaption,
  transformPromptToJson as lmStudioTransformToJson,
} from '../providers/lmStudioService';

export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'stability' | 'perplexity' | 'qwen' | 'ollama' | 'lmstudio';

export const PROVIDERS: Record<LLMProvider, { label: string; storageKey: string }> = {
  gemini: { label: 'Google Gemini', storageKey: 'GEMINI_API_KEY' },
  openai: { label: 'OpenAI', storageKey: 'OPENAI_API_KEY' },
  anthropic: { label: 'Anthropic', storageKey: 'ANTHROPIC_API_KEY' },
  stability: { label: 'Stability AI', storageKey: 'STABILITY_API_KEY' },
  perplexity: { label: 'Perplexity', storageKey: 'PERPLEXITY_API_KEY' },
  qwen: { label: 'Qwen (DashScope)', storageKey: 'QWEN_API_KEY' },
  ollama: { label: 'Ollama (Local)', storageKey: 'OLLAMA_BASE_URL' },
  lmstudio: { label: 'LM Studio (Local)', storageKey: 'LM_STUDIO_BASE_URL' },
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
  cameraDevice?: string;
}): Promise<VideoPrompt[]> {
  const provider = getActiveProvider();
  console.log('[LLM Router] generatePrompts called with provider:', provider);
  console.log('[LLM Router] Params:', { scene: params.scene.substring(0, 50), style: params.style, isNsfw: params.isNsfw });
  
  try {
    switch (provider) {
      case 'qwen':
        console.log('[LLM Router] Routing to Qwen...');
        return await qwenGeneratePrompts(params);
      case 'ollama':
        console.log('[LLM Router] Routing to Ollama...');
        return await ollamaGeneratePrompts(params);
      case 'lmstudio':
        console.log('[LLM Router] Routing to LM Studio...');
        return await lmStudioGeneratePrompts(params);
      case 'gemini':
      default:
        if (provider !== 'gemini') {
          console.warn(`[LLM Router] Provider "${provider}" not fully implemented. Falling back to Gemini.`);
        }
        console.log('[LLM Router] Routing to Gemini...');
        return await geminiGeneratePrompts(params);
    }
  } catch (error) {
    console.error('[LLM Router] Error in generatePrompts:', error);
    throw error;
  }
}

export async function generateCaptionFromImage(params: { imageData: string; mimeType: string }): Promise<string[]> {
  const provider = getActiveProvider();
  console.log('[LLM Router] generateCaptionFromImage called with provider:', provider);
  console.log('[LLM Router] Image mimeType:', params.mimeType);
  
  try {
    switch (provider) {
      case 'qwen':
        console.log('[LLM Router] Routing to Qwen for captioning...');
        return await qwenGenerateCaption(params);
      case 'ollama':
        console.log('[LLM Router] Routing to Ollama for captioning...');
        return await ollamaGenerateCaption(params);
      case 'lmstudio':
        console.log('[LLM Router] Routing to LM Studio for captioning...');
        return await lmStudioGenerateCaption(params);
      case 'gemini':
      default:
        if (provider !== 'gemini') {
          console.warn(`[LLM Router] Provider "${provider}" image captioning not fully implemented. Falling back to Gemini.`);
        }
        console.log('[LLM Router] Routing to Gemini for captioning...');
        return await geminiGenerateCaption(params);
    }
  } catch (error) {
    console.error('[LLM Router] Error in generateCaptionFromImage:', error);
    throw error;
  }
}

export async function transformPromptToJson(promptText: string): Promise<object> {
  const provider = getActiveProvider();
  switch (provider) {
    case 'qwen':
      return qwenTransformToJson(promptText);
    case 'ollama':
      return ollamaTransformToJson(promptText);
    case 'lmstudio':
      return lmStudioTransformToJson(promptText);
    case 'gemini':
    default:
      if (provider !== 'gemini') {
        console.warn(`[LLM Router] Provider "${provider}" transform-to-JSON not fully implemented. Falling back to Gemini.`);
      }
      return geminiTransformToJson(promptText);
  }
}

export function isApiKeySet(provider: LLMProvider = getActiveProvider()): boolean {
  return !!getApiKey(provider);
}
