/**
 * Banorte A2UI – Main Application
 *
 * Server-Driven UI mobile app for the Banorte Hackathon.
 * Implements the A2UI pattern: User speaks/types → LLM responds with UI schema → App renders it.
 *
 * MOCK MODE: Set EXPO_PUBLIC_MOCK_MODE=true to run without backend.
 * Try: "tarjeta desechable", "fraude", "suscripciones", "adelanto de nómina"
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from './src/theme/banorte';
import { useA2UI } from './src/hooks/useA2UI';
import { useAudioPlayer } from './src/hooks/useAudioPlayer';
import { MessageBubble } from './src/components/MessageBubble';
import { ChatInput } from './src/components/ChatInput';
import { VoiceWaveIndicator } from './src/components/VoiceWaveIndicator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const { messages, isLoading, sendMessage, handleAction } = useA2UI();
  const audioPlayer = useAudioPlayer();
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [messages.length]);

  // Auto-play audio when agent sends voice_script
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === 'agent' &&
      lastMessage.a2uiPayload?.audio_url
    ) {
      audioPlayer.play(lastMessage.a2uiPayload.audio_url);
    }
  }, [messages.length]);

  const handleSend = useCallback(
    async (text: string) => {
      await sendMessage(text);
    },
    [sendMessage]
  );

  // Loading screen while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* ── Header ── */}
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View>
                  <View style={styles.logoRow}>
                    <Text style={styles.headerLogo}>BANORTE</Text>
                    <View style={styles.headerBadge}>
                      <Text style={styles.headerBadgeText}>A2UI</Text>
                    </View>
                  </View>
                  <Text style={styles.headerSubtext}>Maya · Asistente Generativo</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <VoiceWaveIndicator
                  isActive={audioPlayer.isPlaying}
                  barCount={5}
                  color={Colors.white}
                />
              </View>
            </View>
          </LinearGradient>

          {/* ── Messages Area ── */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Welcome message */}
            {messages.length === 0 && (
              <Animated.View
                entering={FadeInDown.delay(300).springify()}
                style={styles.welcomeContainer}
              >
                <Text style={styles.welcomeEmoji}>🏦</Text>
                <Text style={styles.welcomeTitle}>
                  Hola, soy tu asistente Banorte
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Cuéntame qué necesitas y generaré la interfaz perfecta para ti.
                </Text>
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Prueba decir:</Text>
                  {SUGGESTIONS.map((suggestion, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeInDown.delay(500 + index * 100).springify()}
                    >
                      <SuggestionChip
                        text={suggestion.text}
                        emoji={suggestion.emoji}
                        onPress={() => handleSend(suggestion.text)}
                      />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Message list */}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onAction={handleAction}
              />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.typingIndicator}
              >
                <View style={styles.typingDots}>
                  <TypingDot delay={0} />
                  <TypingDot delay={200} />
                  <TypingDot delay={400} />
                </View>
                <Text style={styles.typingText}>Generando interfaz...</Text>
              </Animated.View>
            )}
          </ScrollView>

          {/* ── Chat Input ── */}
          <ChatInput
            onSendMessage={handleSend}
            isLoading={isLoading}
            placeholder="¿En qué te puedo ayudar?"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ── Suggestion Chip Component ──
const SuggestionChip: React.FC<{
  text: string;
  emoji: string;
  onPress: () => void;
}> = ({ text, emoji, onPress }) => (
  <Animated.View entering={FadeIn}>
    <Text style={styles.suggestionChip} onPress={onPress}>
      {emoji} {text}
    </Text>
  </Animated.View>
);

// ── Typing Dot Component ──
const TypingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = React.useMemo(() => {
    return {
      animationDelay: `${delay}ms`,
    };
  }, [delay]);

  return <View style={[styles.dot]} />;
};

// ── Suggestions Data ──
const SUGGESTIONS = [
  { emoji: '🛡️', text: 'Necesito una tarjeta desechable' },
  { emoji: '🚨', text: 'Tengo un cargo no reconocido' },
  { emoji: '🔪', text: 'Quiero revisar mis suscripciones' },
  { emoji: '💸', text: 'Necesito un adelanto de nómina' },
];

// ── Styles ──
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  // ── Header ──
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerLogo: {
    color: Colors.white,
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.extraBold,
    letterSpacing: 2,
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  headerBadgeText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.semiBold,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // ── Messages ──
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  // ── Welcome ──
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
    paddingHorizontal: Spacing.lg,
  },
  welcomeEmoji: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: Typography.sizes.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
    marginBottom: Spacing.xxl,
  },
  suggestionsContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  suggestionsTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.darkGray,
    marginBottom: Spacing.xs,
  },
  suggestionChip: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.black,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  // ── Typing Indicator ──
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    opacity: 0.4,
  },
  typingText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
  },
});
