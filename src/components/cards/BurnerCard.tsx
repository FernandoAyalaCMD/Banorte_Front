/**
 * BurnerCard – SafeCart (Tarjeta Desechable Anti-Fraude)
 *
 * Visual credit card with:
 * - Banorte gradient design
 * - Animated CVV flip reveal
 * - 10-minute countdown timer with progress bar
 * - Copy data & Adjust limit actions
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/banorte';
import { BanorteButton } from '../ui/BanorteButton';
import { ProgressBar } from '../ui/ProgressBar';
import { AnimatedCard } from '../ui/AnimatedCard';
import { useCountdown } from '../../hooks/useCountdown';
import { tapMedium, notifySuccess } from '../../utils/haptics';
import type { BurnerCardProps, OnActionCallback } from '../../types/a2ui';

interface Props extends BurnerCardProps {
  onAction: OnActionCallback;
}

export const BurnerCard: React.FC<Props> = ({
  cardNumber,
  cardHolder,
  expiryDate,
  cvv,
  spendingLimit,
  remainingSeconds,
  brand,
  onAction,
}) => {
  const [showCvv, setShowCvv] = useState(false);
  const { seconds, formatted, progress } = useCountdown(remainingSeconds);
  const flipRotation = useSharedValue(0);
  const shimmer = useSharedValue(0);

  // Shimmer animation on the card
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, [shimmer]);

  // CVV flip animation
  const toggleCvv = useCallback(() => {
    tapMedium();
    const target = showCvv ? 0 : 180;
    flipRotation.value = withSpring(target, { damping: 15, stiffness: 100 });
    setShowCvv(!showCvv);
  }, [showCvv, flipRotation]);

  const cvvAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value}deg` }],
  }));

  const handleCopyData = useCallback(() => {
    notifySuccess();
    onAction('copy_action', {
      cardNumber,
      cvv,
      expiryDate,
      cardHolder,
    });
  }, [onAction, cardNumber, cvv, expiryDate, cardHolder]);

  const handleAdjustLimit = useCallback(() => {
    tapMedium();
    onAction('button_press', {
      action: 'adjust_limit',
      currentLimit: spendingLimit,
    });
  }, [onAction, spendingLimit]);

  const formatCardNumber = (num?: string) => { if(!num) return "•••• •••• •••• ••••";
    return num.replace(/(.{4})/g, '$1 ').trim();
  };

  const isExpiring = seconds <= 60;
  const isExpired = seconds <= 0;

  return (
    <AnimatedCard entrance="fadeDown" variant="default" style={styles.container}>
      {/* ── Credit Card Visual ── */}
      <LinearGradient
        colors={
          isExpired
            ? ['#666', '#444', '#333']
            : [Colors.cardGradientStart, Colors.cardGradientMid, Colors.cardGradientEnd]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <View style={styles.chipLine} />
              <View style={[styles.chipLine, { width: 16 }]} />
            </View>
          </View>
          <Text style={styles.brandText}>
            {brand === 'visa' ? 'VISA' : 'MASTERCARD'}
          </Text>
        </View>

        {/* Card Number */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.cardNumber}>
            {isExpired ? '•••• •••• •••• ••••' : formatCardNumber(cardNumber)}
          </Text>
        </Animated.View>

        {/* Card Details */}
        <View style={styles.cardDetails}>
          <View>
            <Text style={styles.cardLabel}>TITULAR</Text>
            <Text style={styles.cardValue}>{cardHolder}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>VENCE</Text>
            <Text style={styles.cardValue}>{expiryDate}</Text>
          </View>
          <Pressable onPress={toggleCvv}>
            <Text style={styles.cardLabel}>CVV</Text>
            <Animated.View style={cvvAnimatedStyle}>
              <Text style={styles.cvvText}>
                {showCvv ? cvv : '•••'}
              </Text>
            </Animated.View>
          </Pressable>
        </View>

        {/* SafeCart Badge */}
        <View style={styles.safeBadge}>
          <Text style={styles.safeBadgeIcon}>🛡️</Text>
          <Text style={styles.safeBadgeText}>SafeCart</Text>
        </View>

        {/* Banorte Logo */}
        <Text style={styles.banorteLogo}>BANORTE</Text>
      </LinearGradient>

      {/* ── Timer Section ── */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(500)}
        style={styles.timerSection}
      >
        <View style={styles.timerHeader}>
          <Text style={styles.timerIcon}>{isExpired ? '❌' : isExpiring ? '⚠️' : '⏱️'}</Text>
          <Text
            style={[
              styles.timerText,
              isExpiring && styles.timerTextWarning,
              isExpired && styles.timerTextExpired,
            ]}
          >
            {isExpired ? 'Tarjeta expirada' : `Expira en ${formatted}`}
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          height={6}
          colorTransition
          style={styles.timerBar}
        />
      </Animated.View>

      {/* ── Spending Limit ── */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(500)}
        style={styles.limitSection}
      >
        <Text style={styles.limitLabel}>Límite de gasto</Text>
        <Text style={styles.limitAmount}>
          ${(spendingLimit || 0).toLocaleString('es-MX')} MXN
        </Text>
      </Animated.View>

      {/* ── Action Buttons ── */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(500)}
        style={styles.actions}
      >
        <BanorteButton
          title="📋 Copiar datos"
          onPress={handleCopyData}
          variant="primary"
          disabled={isExpired}
          size="md"
        />
        <View style={{ height: Spacing.sm }} />
        <BanorteButton
          title="⚙️ Ajustar límite"
          onPress={handleAdjustLimit}
          variant="secondary"
          disabled={isExpired}
          size="md"
        />
      </Animated.View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
    minHeight: 200,
    justifyContent: 'space-between',
    ...Shadows.glow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chipContainer: {
    width: 45,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  chip: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    gap: 3,
  },
  chipLine: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 1,
  },
  brandText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 2,
    opacity: 0.9,
  },
  cardNumber: {
    color: Colors.white,
    fontSize: Typography.sizes.xxl,
    fontFamily: Typography.fontFamily.semiBold,
    letterSpacing: 3,
    marginBottom: Spacing.lg,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardValue: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  cvvText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 2,
  },
  safeBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.xl + 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,135,90,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  safeBadgeIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  safeBadgeText: {
    color: '#7DFFBA',
    fontSize: 9,
    fontFamily: Typography.fontFamily.semiBold,
    letterSpacing: 0.5,
  },
  banorteLogo: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.xl,
    color: 'rgba(255,255,255,0.3)',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 3,
  },
  timerSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timerIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  timerText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.darkGray,
  },
  timerTextWarning: {
    color: Colors.warning,
    fontFamily: Typography.fontFamily.semiBold,
  },
  timerTextExpired: {
    color: Colors.danger,
    fontFamily: Typography.fontFamily.semiBold,
  },
  timerBar: {
    marginTop: Spacing.xs,
  },
  limitSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  limitLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
  },
  limitAmount: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
  },
  actions: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});

export default BurnerCard;
