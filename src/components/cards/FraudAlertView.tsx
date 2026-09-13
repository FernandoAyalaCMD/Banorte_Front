/**
 * FraudAlertView – Banorte Sentinel (Gestión de Fraude y Cargos)
 *
 * Features:
 * - Pulsing red banner for frozen card status
 * - Suspicious transaction card with animated alert border
 * - Plastic toggle switch
 * - Recent transactions checklist
 * - "Dispute charge" action button
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/banorte';
import { BanorteButton } from '../ui/BanorteButton';
import { BanorteSwitch } from '../ui/BanorteSwitch';
import { AnimatedCard } from '../ui/AnimatedCard';
import { tapHeavy, tapLight, notifyWarning } from '../../utils/haptics';
import type { FraudAlertViewProps, OnActionCallback } from '../../types/a2ui';

interface Props extends FraudAlertViewProps {
  onAction: OnActionCallback;
}

export const FraudAlertView: React.FC<Props> = ({
  cardInfo = { id: 'card_1', lastFour: '1234', type: 'Credit', isFrozen: false },
  suspiciousTransaction = { id: 'tx_0', merchant: 'Unknown', amount: 0, currency: 'MXN', date: new Date().toISOString(), location: 'Unknown', category: 'Unknown' },
  recentTransactions = [],
  plasticEnabled = true,
  onAction,
}) => {
  const [isPlasticEnabled, setIsPlasticEnabled] = useState(plasticEnabled);
  const [selectedCharges, setSelectedCharges] = useState<string[]>([
    suspiciousTransaction.id,
  ]);
  const [checkedTransactions, setCheckedTransactions] = useState<Record<string, boolean>>(
    Object.fromEntries(recentTransactions.map((t) => [t.id, t.isVerified]))
  );

  // ── Pulsing banner animation ──
  const bannerPulse = useSharedValue(1);
  useEffect(() => {
    bannerPulse.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [bannerPulse]);

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bannerPulse.value,
  }));

  // ── Alert border animation ──
  const borderPulse = useSharedValue(0);
  useEffect(() => {
    borderPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 800 })
      ),
      -1,
      true
    );
  }, [borderPulse]);

  const alertBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(255, 59, 59, ${0.4 + borderPulse.value * 0.6})`,
    borderWidth: 2,
  }));

  // ── Shake animation for alert icon ──
  const shakeX = useSharedValue(0);
  useEffect(() => {
    shakeX.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 80 }),
        withTiming(3, { duration: 80 }),
        withTiming(-2, { duration: 80 }),
        withTiming(2, { duration: 80 }),
        withTiming(0, { duration: 80 }),
        withTiming(0, { duration: 2000 }) // pause between shakes
      ),
      -1,
      false
    );
  }, [shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handlePlasticToggle = useCallback(
    (newValue: boolean) => {
      setIsPlasticEnabled(newValue);
      notifyWarning();
      onAction('switch_toggle', {
        action: 'toggle_plastic',
        cardId: cardInfo.id,
        enabled: newValue,
      });
    },
    [onAction, cardInfo.id]
  );

  const handleCheckTransaction = useCallback(
    (transactionId: string) => {
      tapLight();
      setCheckedTransactions((prev) => ({
        ...prev,
        [transactionId]: !prev[transactionId],
      }));
      const isNowSelected = selectedCharges.includes(transactionId);
      if (isNowSelected) {
        setSelectedCharges((prev) => prev.filter((id) => id !== transactionId));
      } else {
        setSelectedCharges((prev) => [...prev, transactionId]);
      }
    },
    [selectedCharges]
  );

  const handleDisputeCharge = useCallback(() => {
    tapHeavy();
    onAction('button_press', {
      action: 'dispute_charge',
      transactionId: suspiciousTransaction.id,
      selectedCharges,
    });
  }, [onAction, suspiciousTransaction.id, selectedCharges]);

  return (
    <View style={styles.container}>
      {/* ── Pulsing Frozen Banner ── */}
      <Animated.View style={[styles.frozenBanner, bannerAnimatedStyle]}>
        <Animated.Text style={[styles.frozenIcon, shakeStyle]}>🚨</Animated.Text>
        <View>
          <Text style={styles.frozenTitle}>Tarjeta Congelada</Text>
          <Text style={styles.frozenSubtitle}>
            •••• {cardInfo.lastFour} · {cardInfo.type}
          </Text>
        </View>
      </Animated.View>

      {/* ── Suspicious Transaction Card ── */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.suspiciousWrapper}
      >
        <Animated.View style={[styles.suspiciousCard, alertBorderStyle]}>
          <View style={styles.suspiciousHeader}>
            <Animated.Text style={[styles.alertIcon, shakeStyle]}>⚠️</Animated.Text>
            <Text style={styles.suspiciousLabel}>Transacción Sospechosa</Text>
          </View>
          <View style={styles.suspiciousDetails}>
            <View style={styles.suspiciousRow}>
              <Text style={styles.detailLabel}>Comercio</Text>
              <Text style={styles.detailValue}>{suspiciousTransaction.merchant}</Text>
            </View>
            <View style={styles.suspiciousRow}>
              <Text style={styles.detailLabel}>Monto</Text>
              <Text style={styles.detailAmount}>
                ${(suspiciousTransaction.amount || 0).toLocaleString('es-MX')} {suspiciousTransaction.currency}
              </Text>
            </View>
            <View style={styles.suspiciousRow}>
              <Text style={styles.detailLabel}>Fecha</Text>
              <Text style={styles.detailValue}>{suspiciousTransaction.date}</Text>
            </View>
            <View style={styles.suspiciousRow}>
              <Text style={styles.detailLabel}>Ubicación</Text>
              <Text style={styles.detailValue}>{suspiciousTransaction.location}</Text>
            </View>
            <View style={styles.suspiciousRow}>
              <Text style={styles.detailLabel}>Categoría</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{suspiciousTransaction.category}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── Plastic Toggle ── */}
      <AnimatedCard entrance="fadeDown" delay={300} variant="default" style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleIcon}>💳</Text>
            <View>
              <Text style={styles.toggleTitle}>Plásticos físicos</Text>
              <Text style={styles.toggleSubtitle}>
                {isPlasticEnabled ? 'Activos' : 'Desactivados'}
              </Text>
            </View>
          </View>
          <BanorteSwitch
            value={isPlasticEnabled}
            onValueChange={handlePlasticToggle}
            activeColor={Colors.success}
          />
        </View>
      </AnimatedCard>

      {/* ── Recent Transactions Checklist ── */}
      <AnimatedCard entrance="fadeDown" delay={400} variant="outlined" style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>Últimos movimientos</Text>
        <Text style={styles.checklistSubtitle}>Marca los que NO reconozcas</Text>
        {recentTransactions.map((tx, index) => (
          <Animated.View
            key={tx.id}
            entering={FadeIn.delay(500 + index * 100)}
          >
            <Pressable
              style={[
                styles.checklistItem,
                selectedCharges.includes(tx.id) && styles.checklistItemSelected,
              ]}
              onPress={() => handleCheckTransaction(tx.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedCharges.includes(tx.id) && styles.checkboxChecked,
                ]}
              >
                {selectedCharges.includes(tx.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txMerchant}>{tx.merchant}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  selectedCharges.includes(tx.id) && styles.txAmountSelected,
                ]}
              >
                -${(tx.amount || 0).toLocaleString('es-MX')}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </AnimatedCard>

      {/* ── Dispute Button ── */}
      <Animated.View
        entering={FadeInDown.delay(700).springify()}
        style={styles.actions}
      >
        <BanorteButton
          title={`🚫 Desconocer ${selectedCharges.length} cargo${selectedCharges.length > 1 ? 's' : ''}`}
          onPress={handleDisputeCharge}
          variant="danger"
          disabled={selectedCharges.length === 0}
          size="lg"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  // ── Frozen Banner ──
  frozenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.md,
  },
  frozenIcon: {
    fontSize: 28,
  },
  frozenTitle: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  frozenSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 2,
  },
  // ── Suspicious Transaction ──
  suspiciousWrapper: {
    marginVertical: Spacing.xs,
  },
  suspiciousCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
  suspiciousHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  alertIcon: {
    fontSize: 22,
  },
  suspiciousLabel: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.danger,
  },
  suspiciousDetails: {
    gap: Spacing.md,
  },
  suspiciousRow: {
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
  detailAmount: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.danger,
  },
  categoryBadge: {
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    color: Colors.danger,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.semiBold,
    textTransform: 'capitalize',
  },
  // ── Toggle ──
  toggleCard: {
    paddingVertical: Spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  toggleIcon: {
    fontSize: 24,
  },
  toggleTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.black,
  },
  toggleSubtitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
    marginTop: 2,
  },
  // ── Checklist ──
  checklistCard: {
    paddingBottom: Spacing.md,
  },
  checklistTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
    marginBottom: 2,
  },
  checklistSubtitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
    marginBottom: Spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  checklistItemSelected: {
    backgroundColor: Colors.dangerLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
  },
  txInfo: {
    flex: 1,
  },
  txMerchant: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.black,
  },
  txDate: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.gray,
    marginTop: 2,
  },
  txAmount: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.darkGray,
  },
  txAmountSelected: {
    color: Colors.danger,
    fontFamily: Typography.fontFamily.bold,
  },
  // ── Actions ──
  actions: {
    marginTop: Spacing.sm,
  },
});

export default FraudAlertView;
