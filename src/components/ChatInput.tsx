/**
 * ChatInput
 * Text input with microphone button for voice input.
 * Supports text submission and voice recording toggle.
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/banorte';
import { tapMedium, tapLight } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onMicPressIn?: () => void;
  onMicPressOut?: () => void;
  isLoading?: boolean;
  isRecording?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onMicPressIn,
  onMicPressOut,
  isLoading = false,
  isRecording = false,
  placeholder = '¿En qué te puedo ayudar?',
}) => {
  const [text, setText] = useState('');
  const sendScale = useSharedValue(1);
  const micScale = useSharedValue(1);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    tapMedium();
    onSendMessage(trimmed);
    setText('');
  }, [text, isLoading, onSendMessage]);

  const sendAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  const hasText = text.trim().length > 0;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.inputRow}>
        {/* Mic Button */}
        <AnimatedPressable
          style={[
            styles.iconButton,
            isRecording && styles.micRecording,
            micAnimatedStyle,
          ]}
          onPressIn={() => {
            micScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
            tapLight();
            onMicPressIn?.();
          }}
          onPressOut={() => {
            micScale.value = withSpring(1, { damping: 15, stiffness: 300 });
            onMicPressOut?.();
          }}
        >
          <Text style={[styles.iconText, isRecording && styles.iconTextRecording]}>
            {isRecording ? '⏹️' : '🎤'}
          </Text>
        </AnimatedPressable>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={Colors.lightGray}
          multiline
          maxLength={500}
          editable={!isLoading}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit
        />

        {/* Send Button */}
        <AnimatedPressable
          style={[
            styles.sendButton,
            hasText && !isLoading && styles.sendButtonActive,
            sendAnimatedStyle,
          ]}
          onPressIn={() => {
            sendScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            sendScale.value = withSpring(1, { damping: 15, stiffness: 300 });
          }}
          onPress={handleSend}
          disabled={!hasText || isLoading}
        >
          <Text style={styles.sendIcon}>
            {isLoading ? '⏳' : '➤'}
          </Text>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.silver,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micRecording: {
    backgroundColor: Colors.dangerLight,
  },
  iconText: {
    fontSize: 20,
  },
  iconTextRecording: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.black,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  sendIcon: {
    fontSize: 18,
    color: Colors.white,
  },
});

export default ChatInput;
