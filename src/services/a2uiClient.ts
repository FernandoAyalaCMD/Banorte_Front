/**
 * A2UI Client Service
 * HTTP client for communication with the MCP / Gemini backend.
 *
 * Endpoint:
 * - POST /api/chat
 *
 * Request contract:
 * {
 *   "message": string,
 *   "userId": string,
 *   "actionContext"?: { action: string, payload: Record<string, unknown> }
 * }
 *
 * Response contract:
 * {
 *   "a2ui": {
 *     "speechText": string,
 *     "component": ComponentName,
 *     "props": Record<string, unknown>,
 *     "availableActions"?: string[]
 *   },
 *   "audioUrl"?: string,
 *   "conversationId"?: string
 * }
 */

import type { A2UIPayload, A2UIResponse, A2UIEvent, ComponentName } from '../types/a2ui';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const IS_MOCK_MODE =
  process.env.EXPO_PUBLIC_MOCK_MODE === 'true';

interface BackendChatResponse {
  a2ui?: {
    speechText?: string;
    voice_script?: string;
    component?: string;
    component_name?: string;
    props?: Record<string, unknown>;
    availableActions?: string[];
    available_actions?: string[];
  };
  audioUrl?: string;
  audio_url?: string;
  conversationId?: string;
  conversation_id?: string;
  success?: boolean;
  error?: string;
}

/** Helper to make POST requests with timeout */
async function post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  // 45s timeout for Gemini LLM + MCP tools + ElevenLabs TTS
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'BanorteA2UI/1.0',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Normalize backend chat response to standard A2UIResponse format.
 */
function normalizeResponse(res: BackendChatResponse): A2UIResponse {
  if (res.error) {
    return { success: false, error: res.error };
  }

  const rawA2ui = res.a2ui;
  if (!rawA2ui) {
    return { success: true };
  }

  const componentName = (rawA2ui.component || rawA2ui.component_name || 'ResolutionSuccessCard') as ComponentName;
  const voiceScript = rawA2ui.speechText || rawA2ui.voice_script || '';
  let audioUrl = res.audioUrl || res.audio_url;

  if (audioUrl && audioUrl.startsWith('/')) {
    audioUrl = `${API_BASE_URL}${audioUrl}`;
  }

  const payload: A2UIPayload = {
    component: componentName,
    props: (rawA2ui.props || {}) as any,
    actionId: res.conversationId || res.conversation_id || `act-${Date.now()}`,
    voice_script: voiceScript,
    audio_url: audioUrl,
  };

  return {
    success: true,
    payload,
  };
}

/**
 * Send a user message (text or action trigger) to the backend /api/chat.
 */
export async function sendMessage(
  text: string,
  userId: string = 'usr_banorte_demo',
  actionContext?: { action: string; payload: Record<string, unknown> }
): Promise<A2UIResponse> {
  if (IS_MOCK_MODE) {
    return { success: true };
  }

  try {
    const raw = await post<BackendChatResponse>('/api/chat', {
      message: text,
      userId,
      actionContext,
    });
    return normalizeResponse(raw);
  } catch (error) {
    // Fallback attempt on legacy /api/a2ui/message if /api/chat fails
    try {
      const fallback = await post<A2UIResponse>('/api/a2ui/message', {
        message: text,
        userId,
        actionContext,
      });
      return fallback;
    } catch {
      throw error;
    }
  }
}

/**
 * Send a user interaction event back to the LLM.
 * Closes the A2UI loop.
 */
export async function sendEvent(event: A2UIEvent, userId: string = 'usr_banorte_demo'): Promise<A2UIResponse> {
  if (IS_MOCK_MODE) {
    return { success: true };
  }

  return sendMessage(
    `[Action: ${event.eventType}]`,
    userId,
    {
      action: (event.payload.action as string) || event.eventType,
      payload: event.payload,
    }
  );
}

/**
 * Health check for the backend connection.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
