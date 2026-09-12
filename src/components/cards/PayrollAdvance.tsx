/**
 * PayrollAdvance – Adelanto de Nómina Express
 *
 * Features:
 * - Interactive slider with pre-positioned amount
 * - Dynamic currency labels
 * - Commission / date breakdown
 * - Comparative installment table (1 vs 2 quincenas)
 * - Disbursement request button
 */

import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  FadeInDown,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/banorte';
import { BanorteButton } from '../ui/BanorteButton';
import { AnimatedCard } from '../ui/AnimatedCard';
import { tapMedium, selectionChanged, notifySuccess } from '../../utils/haptics';
import type { PayrollAdvanceProps, PayrollInstallmentOption, OnActionCallback } from '../../types/a2ui';

interface Props extends PayrollAdvanceProps {
  onAction: OnActionCallback;
}

const SLIDER_WIDTH = 280;
const THUMB_SIZE = 28;

export const PayrollAdvance: React.FC<Props> = ({
  maxAmount,
  minAmount,
  defaultAmount,
  disbursementDate,
  installmentOptions,
  employerName,
  onAction,
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [selectedInstallment, setSelectedInstallment] = useState(
    installmentOptions[0]?.installments ?? 1
  );

  const translateX = useSharedValue(
    ((defaultAmount - minAmount) / (maxAmount - minAmount)) * SLIDER_WIDTH
  );

  // Calculate commission for current amount
  const currentOption = useMemo(() => {
    return installmentOptions.find((o) => o.installments === selectedInstallment);
  }, [installmentOptions, selectedInstallment]);

  const commissionRate = useMemo(() => {
    if (!currentOption || currentOption.totalRepayment === 0) return 0;
    return (currentOption.commission / currentOption.totalRepayment) * 100;
  }, [currentOption]);

  const scaledCommission = useMemo(() => {
    if (!currentOption) return 0;
    return (amount / maxAmount) * currentOption.commission;
  }, [amount, maxAmount, currentOption]);

  const scaledPayment = useMemo(() => {
    if (!currentOption) return 0;
    return (amount + scaledCommission) / currentOption.installments;
  }, [amount, scaledCommission, currentOption]);

  const updateAmount = useCallback(
    (newX: number) => {
      const clamped = Math.max(0, Math.min(newX, SLIDER_WIDTH));
      const ratio = clamped / SLIDER_WIDTH;
      const rawAmount = minAmount + ratio * (maxAmount - minAmount);
      // Round to nearest 100
      const rounded = Math.round(rawAmount / 100) * 100;
      setAmount(Math.max(minAmount, Math.min(rounded, maxAmount)));
    },
    [minAmount, maxAmount]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(e.x, SLIDER_WIDTH));
      translateX.value = newX;
      runOnJS(updateAmount)(newX);
      runOnJS(selectionChanged)();
    })
    .onEnd(() => {
      runOnJS(tapMedium)();
    });

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      const newX = Math.max(0, Math.min(e.x, SLIDER_WIDTH));
      translateX.value = withSpring(newX, { damping: 15, stiffness: 200 });
      runOnJS(updateAmount)(newX);
      runOnJS(tapMedium)();
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - THUMB_SIZE / 2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  const handleSelectInstallment = useCallback(
    (installments: number) => {
      tapMedium();
      setSelectedInstallment(installments);
      onAction('selection_change', {
        action: 'select_installment',
        installments,
        amount,
      });
    },
    [onAction, amount]
  );

  const handleRequestAdvance = useCallback(() => {
    notifySuccess();
    onAction('button_press', {
      action: 'request_advance',
      amount,
      installments: selectedInstallment,
      commission: scaledCommission,
      paymentPerPeriod: scaledPayment,
    });
  }, [onAction, amount, selectedInstallment, scaledCommission, scaledPayment]);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* ── Header ── */}
      <AnimatedCard entrance="fadeDown" variant="default" style={styles.headerCard}>
        <Text style={styles.headerIcon}>💸</Text>
        <Text style={styles.headerTitle}>Adelanto de Nómina</Text>
        <Text style={styles.headerSubtitle}>{employerName}</Text>
      </AnimatedCard>

      {/* ── Amount Selector ── */}
      <AnimatedCard entrance="fadeDown" delay={100} variant="elevated" style={styles.sliderCard}>
        <Text style={styles.amountLabel}>Monto a solicitar</Text>
        <Text style={styles.amountValue}>
          ${amount.toLocaleString('es-MX')}
          <Text style={styles.amountCurrency}> MXN</Text>
        </Text>

        {/* Custom Slider */}
        <GestureDetector gesture={composedGesture}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <Animated.View style={[styles.sliderFill, fillStyle]} />
            </View>
            <Animated.View style={[styles.sliderThumb, thumbStyle]}>
              <View style={styles.thumbInner} />
            </Animated.View>
          </View>
        </GestureDetector>

        <View style={styles.sliderLabels}>
          <Text style={styles.sliderMin}>
            ${minAmount.toLocaleString('es-MX')}
          </Text>
          <Text style={styles.sliderMax}>
            ${maxAmount.toLocaleString('es-MX')}
          </Text>
        </View>
      </AnimatedCard>

      {/* ── Breakdown ── */}
      <AnimatedCard entrance="fadeDown" delay={200} variant="outlined" style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>Desglose</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>💰 Monto solicitado</Text>
          <Text style={styles.breakdownValue}>
            ${amount.toLocaleString('es-MX')}
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>📊 Comisión</Text>
          <Text style={styles.breakdownValueSmall}>
            ${scaledCommission.toFixed(0)} ({commissionRate.toFixed(1)}%)
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>📅 Fecha dispersión</Text>
          <Text style={styles.breakdownValue}>{disbursementDate}</Text>
        </View>
        <View style={[styles.breakdownRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={styles.totalValue}>
            ${(amount + scaledCommission).toLocaleString('es-MX')}
          </Text>
        </View>
      </AnimatedCard>

      {/* ── Installment Comparison Table ── */}
      <AnimatedCard entrance="fadeDown" delay={300} variant="default" style={styles.tableCard}>
        <Text style={styles.sectionTitle}>Opciones de pago</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Plazo</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Pago/qna</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Comisión</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Tasa</Text>
        </View>
        {installmentOptions.map((option, index) => {
          const isSelected = option.installments === selectedInstallment;
          const optionPayment = (amount + (amount / maxAmount) * option.commission) / option.installments;
          const optionCommission = (amount / maxAmount) * option.commission;

          return (
            <Animated.View
              key={option.installments}
              entering={FadeIn.delay(400 + index * 100)}
            >
              <Pressable
                style={[styles.tableRow, isSelected && styles.tableRowSelected]}
                onPress={() => handleSelectInstallment(option.installments)}
              >
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1 }]}>
                  {option.installments} qna{option.installments > 1 ? 's' : ''}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  ${optionPayment.toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  ${optionCommission.toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>
                  {option.annualRate}%
                </Text>
                {isSelected && <View style={styles.selectedIndicator} />}
              </Pressable>
            </Animated.View>
          );
        })}
      </AnimatedCard>

      {/* ── Request Button ── */}
      <Animated.View
        entering={FadeInDown.delay(600).springify()}
        style={styles.actions}
      >
        <BanorteButton
          title={`🚀 Solicitar $${amount.toLocaleString('es-MX')}`}
          onPress={handleRequestAdvance}
          variant="primary"
          size="lg"
        />
        <Text style={styles.disclaimer}>
          Al solicitar, aceptas los términos y condiciones del adelanto de nómina Banorte.
        </Text>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  // ── Header ──
  headerCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
    marginTop: Spacing.xxs,
  },
  // ── Slider ──
  sliderCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  amountLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
    marginBottom: Spacing.sm,
  },
  amountValue: {
    fontSize: Typography.sizes.xxxl,
    fontFamily: Typography.fontFamily.extraBold,
    color: Colors.primary,
    marginBottom: Spacing.xxl,
  },
  amountCurrency: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
  },
  sliderContainer: {
    width: SLIDER_WIDTH + THUMB_SIZE,
    height: THUMB_SIZE + 20,
    justifyContent: 'center',
    paddingHorizontal: THUMB_SIZE / 2,
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 6,
    backgroundColor: Colors.silver,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  sliderThumb: {
    position: 'absolute',
    top: 10,
    left: THUMB_SIZE / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SLIDER_WIDTH,
    marginTop: Spacing.sm,
  },
  sliderMin: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
  },
  sliderMax: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
  },
  // ── Breakdown ──
  breakdownCard: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.darkGray,
  },
  breakdownValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.black,
  },
  breakdownValueSmall: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.warning,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.silver,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
  },
  totalValue: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.extraBold,
    color: Colors.primary,
  },
  // ── Table ──
  tableCard: {
    paddingHorizontal: Spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.silver,
  },
  tableHeaderCell: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    position: 'relative',
  },
  tableRowSelected: {
    backgroundColor: `${Colors.primary}10`,
  },
  tableCell: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.darkGray,
  },
  tableCellBold: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
  },
  selectedIndicator: {
    position: 'absolute',
    left: -4,
    top: '25%',
    width: 3,
    height: '50%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  // ── Actions ──
  actions: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});

export default PayrollAdvance;
