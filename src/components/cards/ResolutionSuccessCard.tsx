/**
 * ResolutionSuccessCard – Pantalla de éxito genérica
 *
 * Features:
 * - Animated checkmark with scale + rotation
 * - Confirmation message and details
 * - Folio number
 * - "Go home" action
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/banorte';
import { BanorteButton } from '../ui/BanorteButton';
import { AnimatedCard } from '../ui/AnimatedCard';
import { notifySuccess } from '../../utils/haptics';
import type { ResolutionSuccessCardProps, OnActionCallback } from '../../types/a2ui';

interface Props extends ResolutionSuccessCardProps {
  onAction: OnActionCallback;
}

const TYPE_ICONS: Record<string, string> = {
  payment: '✅',
  card: '💳',
  subscription: '🔪',
  dispute: '🛡️',
  advance: '💸',
};

export const ResolutionSuccessCard: React.FC<Props> = ({
  title = 'Operación Exitosa',
  description = 'La solicitud fue procesada correctamente.',
  details = [],
  folio = 'Folio N/A',
  type = 'card',
  onAction,
}) => {
  const checkScale = useSharedValue(0);
  const checkRotation = useSharedValue(-180);
  const ringScale = useSharedValue(0);

  useEffect(() => {
    notifySuccess();
    // Animate ring
    ringScale.value = withDelay(
      100,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    // Animate checkmark
    checkScale.value = withDelay(
      300,
      withSpring(1, { damping: 10, stiffness: 150 })
    );
    checkRotation.value = withDelay(
      300,
      withSpring(0, { damping: 15, stiffness: 120 })
    );
  }, [checkScale, checkRotation, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value },
      { rotate: `${checkRotation.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* ── Success Animation ── */}
      <View style={styles.animationContainer}>
        <Animated.View style={[styles.successRing, ringStyle]}>
          <Animated.View style={[styles.checkContainer, checkStyle]}>
            <Text style={styles.checkIcon}>{TYPE_ICONS[type] || '✅'}</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* ── Message ── */}
      <AnimatedCard entrance="fadeDown" delay={500} variant="success" style={styles.messageCard}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </AnimatedCard>

      {/* ── Details ── */}
      <AnimatedCard entrance="fadeDown" delay={600} variant="outlined" style={styles.detailsCard}>
        {details.map((detail, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(700 + index * 100).springify()}
            style={styles.detailRow}
          >
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={styles.detailValue}>{detail.value}</Text>
          </Animated.View>
        ))}

        {folio && (
          <Animated.View
            entering={FadeInDown.delay(900).springify()}
            style={styles.folioContainer}
          >
            <Text style={styles.folioLabel}>Folio de confirmación</Text>
            <Text style={styles.folioValue}>{folio}</Text>
          </Animated.View>
        )}
      </AnimatedCard>

      {/* ── Home Button ── */}
      <Animated.View
        entering={FadeInDown.delay(1000).springify()}
        style={styles.actions}
      >
        <BanorteButton
          title="🏠 Volver al inicio"
          onPress={() => onAction('go_home', {})}
          variant="primary"
          size="lg"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  // ── Animation ──
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  successRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.successGlow,
  },
  checkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 42,
  },
  // ── Message ──
  messageCard: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  // ── Details ──
  detailsCard: {
    width: '100%',
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
  },
  detailValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.black,
  },
  folioContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.silver,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
    alignItems: 'center',
  },
  folioLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
    marginBottom: Spacing.xxs,
  },
  folioValue: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.success,
    letterSpacing: 2,
  },
  // ── Actions ──
  actions: {
    width: '100%',
    marginTop: Spacing.md,
  },
});

export default ResolutionSuccessCard;
