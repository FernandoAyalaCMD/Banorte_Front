/**
 * useA2UI Hook
 * Main state management hook for the A2UI interaction loop.
 *
 * Flow: User message → Backend → A2UIPayload → Render → User action → Backend → New Payload
 */

import { useState, useCallback, useRef } from 'react';
import type { A2UIPayload, A2UIResponse, A2UIEventType, ChatMessage } from '../types/a2ui';
import { sendMessage, sendEvent } from '../services/a2uiClient';
import { findMockPayload, mockResolutionSuccess } from '../mocks/payloads';

const IS_MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_MODE === 'true';

interface A2UIState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
}

export function useA2UI() {
  const [state, setState] = useState<A2UIState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: `session-${Date.now()}`,
  });

  const messageIdCounter = useRef(0);

  const generateId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg-${messageIdCounter.current}-${Date.now()}`;
  }, []);

  /**
   * Send a text message from the user.
   * In mock mode, matches keywords to return pre-built payloads.
   */
  const handleSendMessage = useCallback(
    async (text: string) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        let payload: A2UIPayload | undefined;

        if (IS_MOCK_MODE) {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 800));
          const mock = findMockPayload(text);
          if (mock) {
            payload = mock;
          }
        } else {
          const response = await sendMessage(text, state.sessionId);
          if (response.success && response.payload) {
            payload = response.payload;
          } else if (response.error) {
            throw new Error(response.error);
          }
        }

        // Add agent response
        const agentMessage: ChatMessage = {
          id: generateId(),
          role: 'agent',
          content: payload?.voice_script || (IS_MOCK_MODE && !payload
            ? 'No entendí tu solicitud. Prueba diciendo: "tarjeta desechable", "fraude", "suscripciones" o "adelanto de nómina".'
            : undefined),
          a2uiPayload: payload,
          timestamp: Date.now(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, agentMessage],
          isLoading: false,
        }));

        return payload;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error de conexión';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        // Add error message
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: 'agent',
          content: `❌ ${errorMessage}`,
          timestamp: Date.now(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMsg],
        }));

        return undefined;
      }
    },
    [state.sessionId, generateId]
  );

  /**
   * Send a user interaction event back to the LLM.
   * Closes the A2UI loop.
   */
  const handleAction = useCallback(
    async (
      actionId: string,
      eventType: A2UIEventType,
      eventPayload: Record<string, unknown>
    ) => {
      console.log('[A2UI Event]', { actionId, eventType, eventPayload });

      try {
        if (IS_MOCK_MODE) {
          // In mock mode, simulate a success response for certain actions
          if (
            eventType === 'button_press' &&
            (eventPayload.action === 'request_advance' ||
              eventPayload.action === 'apply_subscription_changes' ||
              eventPayload.action === 'dispute_charge')
          ) {
            await new Promise((resolve) => setTimeout(resolve, 600));
            const successPayload = mockResolutionSuccess();
            const agentMessage: ChatMessage = {
              id: generateId(),
              role: 'agent',
              content: successPayload.voice_script,
              a2uiPayload: successPayload,
              timestamp: Date.now(),
            };
            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, agentMessage],
            }));
          }
          return;
        }

        const response = await sendEvent({
          actionId,
          eventType,
          payload: eventPayload,
          timestamp: Date.now(),
        });

        if (response.success && response.payload) {
          const agentMessage: ChatMessage = {
            id: generateId(),
            role: 'agent',
            content: response.payload.voice_script,
            a2uiPayload: response.payload,
            timestamp: Date.now(),
          };

          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, agentMessage],
          }));
        }
      } catch (err) {
        console.error('[A2UI Event Error]', err);
      }
    },
    [generateId]
  );

  /**
   * Clear all messages and reset the conversation.
   */
  const resetConversation = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      sessionId: `session-${Date.now()}`,
    });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage: handleSendMessage,
    handleAction,
    resetConversation,
  };
}
