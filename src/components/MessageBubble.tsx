/**
 * MessageBubble
 * Chat message bubble for user and agent messages.
 * Agent messages can contain A2UI rendered components inline.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/banorte';
import type { ChatMessage, A2UIEventType } from '../types/a2ui';
import { A2UIRenderer } from './A2UIRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
  onAction: (
    actionId: string,
    eventType: A2UIEventType,
    payload: Record<string, unknown>
  ) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onAction,
}) => {
  const isUser = message.role === 'user';

  return (
    <Animated.View
      entering={isUser ? FadeInUp.duration(300).springify() : FadeInDown.duration(400).springify()}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.agentContainer,
      ]}
    >
      {/* Text content */}
      {message.content && !message.a2uiPayload && (
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.agentBubble,
          ]}
        >
          <Text
            style={[
              styles.text,
              isUser ? styles.userText : styles.agentText,
            ]}
          >
            {message.content}
          </Text>
        </View>
      )}

      {/* Agent voice script + A2UI component */}
      {message.a2uiPayload && (
        <View style={styles.a2uiContainer}>
          {message.content && (
            <View style={[styles.bubble, styles.agentBubble, styles.voiceScriptBubble]}>
              <Text style={[styles.text, styles.agentText]}>
                🔊 {message.content}
              </Text>
            </View>
          )}
          <A2UIRenderer payload={message.a2uiPayload} onAction={onAction} />
        </View>
      )}

      {/* Timestamp */}
      <Text
        style={[
          styles.timestamp,
          isUser ? styles.userTimestamp : styles.agentTimestamp,
        ]}
      >
        {new Date(message.timestamp).toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    maxWidth: '95%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  agentContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.xs,
    ...Shadows.sm,
  },
  agentBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.xs,
    ...Shadows.sm,
  },
  voiceScriptBubble: {
    marginBottom: Spacing.sm,
    backgroundColor: `${Colors.primary}08`,
    borderWidth: 1,
    borderColor: `${Colors.primary}20`,
  },
  text: {
    fontSize: Typography.sizes.md,
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
  },
  userText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.medium,
  },
  agentText: {
    color: Colors.black,
    fontFamily: Typography.fontFamily.regular,
  },
  a2uiContainer: {
    width: '100%',
  },
  timestamp: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xxs,
    opacity: 0.5,
  },
  userTimestamp: {
    color: Colors.gray,
    textAlign: 'right',
  },
  agentTimestamp: {
    color: Colors.gray,
    textAlign: 'left',
  },
});

export default MessageBubble;
