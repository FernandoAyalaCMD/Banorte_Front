/**
 * SubscriptionManager – Subscriptions Killer
 *
 * Features:
 * - Scrollable list of subscriptions with logos and amounts
 * - Interactive toggle switch per service
 * - Live savings bar that updates in real-time
 * - Animated savings counter
 * - "Apply changes" action button
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInRight,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/banorte';
import { BanorteButton } from '../ui/BanorteButton';
import { BanorteSwitch } from '../ui/BanorteSwitch';
import { ProgressBar } from '../ui/ProgressBar';
import { AnimatedCard } from '../ui/AnimatedCard';
import { tapLight, notifySuccess } from '../../utils/haptics';
import type { SubscriptionManagerProps, SubscriptionItem, OnActionCallback } from '../../types/a2ui';

interface Props extends SubscriptionManagerProps {
  onAction: OnActionCallback;
}

const CATEGORY_ICONS: Record<string, string> = {
  streaming: '📺',
  music: '🎵',
  gaming: '🎮',
  cloud: '☁️',
  fitness: '💪',
  other: '📦',
};

const CATEGORY_COLORS: Record<string, string> = {
  streaming: '#E50914',
  music: '#1DB954',
  gaming: '#9147FF',
  cloud: '#007AFF',
  fitness: '#FF6B35',
  other: '#8E8E93',
};

export const SubscriptionManager: React.FC<Props> = ({
  subscriptions = [],
  totalMonthlySpend = 0,
  onAction,
}) => {
  const [activeSubscriptions, setActiveSubscriptions] = useState<Record<string, boolean>>(
    Object.fromEntries(subscriptions.map((s) => [s.id, s.isActive]))
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Calculate savings
  const savings = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      const wasActive = sub.isActive;
      const isNowActive = activeSubscriptions[sub.id];
      if (wasActive && !isNowActive) {
        return total + sub.monthlyCost;
      }
      return total;
    }, 0);
  }, [subscriptions, activeSubscriptions]);

  const currentSpend = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      if (activeSubscriptions[sub.id]) {
        return total + sub.monthlyCost;
      }
      return total;
    }, 0);
  }, [subscriptions, activeSubscriptions]);

  // Animate savings bar
  const savingsProgress = useSharedValue(0);
  useEffect(() => {
    const ratio = totalMonthlySpend > 0 ? savings / totalMonthlySpend : 0;
    savingsProgress.value = withSpring(ratio, { damping: 20, stiffness: 100 });
  }, [savings, totalMonthlySpend, savingsProgress]);

  const savingsBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(savingsProgress.value * 100, 100)}%` as any,
  }));

  const handleToggle = useCallback(
    (subscriptionId: string, newValue: boolean) => {
      tapLight();
      setActiveSubscriptions((prev) => ({
        ...prev,
        [subscriptionId]: newValue,
      }));
      setHasChanges(true);
      onAction('switch_toggle', {
        action: 'toggle_subscription',
        serviceId: subscriptionId,
        enabled: newValue,
      });
    },
    [onAction]
  );

  const handleApplyChanges = useCallback(() => {
    notifySuccess();
    const changes = subscriptions
      .filter((sub) => sub.isActive !== activeSubscriptions[sub.id])
      .map((sub) => ({
        serviceId: sub.id,
        serviceName: sub.serviceName,
        action: activeSubscriptions[sub.id] ? 'activate' : 'cancel',
        monthlyCost: sub.monthlyCost,
      }));

    onAction('button_press', {
      action: 'apply_subscription_changes',
      changes,
      totalSavings: savings,
    });
  }, [onAction, subscriptions, activeSubscriptions, savings]);

  const renderSubscription = ({ item, index }: { item: SubscriptionItem; index: number }) => (
    <Animated.View entering={FadeInRight.delay(200 + index * 100).springify()}>
      <View style={styles.subscriptionItem}>
        <View style={styles.subLeft}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: `${CATEGORY_COLORS[item.category]}15` },
            ]}
          >
            <Text style={styles.logoEmoji}>
              {CATEGORY_ICONS[item.category] || '📦'}
            </Text>
          </View>
          <View style={styles.subInfo}>
            <Text style={styles.subName}>{item.serviceName}</Text>
            <Text style={styles.subCategory}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)} · Próx: {item.nextChargeDate}
            </Text>
          </View>
        </View>
        <View style={styles.subRight}>
          <Text
            style={[
              styles.subAmount,
              !activeSubscriptions[item.id] && styles.subAmountInactive,
            ]}
          >
            ${item.monthlyCost.toLocaleString('es-MX')}
          </Text>
          <BanorteSwitch
            value={activeSubscriptions[item.id]}
            onValueChange={(val) => handleToggle(item.id, val)}
            activeColor={CATEGORY_COLORS[item.category]}
          />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <AnimatedCard entrance="fadeDown" variant="default" style={styles.headerCard}>
        <Text style={styles.headerIcon}>🔪</Text>
        <Text style={styles.headerTitle}>Subscriptions Killer</Text>
        <Text style={styles.headerSubtitle}>
          {subscriptions.length} suscripciones encontradas
        </Text>
      </AnimatedCard>

      {/* ── Savings Banner ── */}
      <AnimatedCard
        entrance="fadeDown"
        delay={100}
        variant={savings > 0 ? 'success' : 'default'}
        style={styles.savingsCard}
      >
        <View style={styles.savingsHeader}>
          <Text style={styles.savingsLabel}>
            {savings > 0 ? '🎉 Ahorro mensual' : '💰 Ahorro potencial'}
          </Text>
          <Text
            style={[
              styles.savingsAmount,
              savings > 0 && styles.savingsAmountActive,
            ]}
          >
            ${savings.toLocaleString('es-MX')}/mes
          </Text>
        </View>
        <View style={styles.savingsBarTrack}>
          <Animated.View style={[styles.savingsBarFill, savingsBarStyle]} />
        </View>
        <View style={styles.spendRow}>
          <Text style={styles.spendLabel}>Gasto actual:</Text>
          <Text style={styles.spendValue}>
            ${currentSpend.toLocaleString('es-MX')}/mes
          </Text>
        </View>
      </AnimatedCard>

      {/* ── Subscription List ── */}
      <AnimatedCard entrance="fadeDown" delay={200} variant="outlined" style={styles.listCard}>
        {subscriptions.map((item, index) => (
          <React.Fragment key={item.id}>
            {renderSubscription({ item, index })}
            {index < subscriptions.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </AnimatedCard>

      {/* ── Apply Button ── */}
      <Animated.View
        entering={FadeInDown.delay(600).springify()}
        style={styles.actions}
      >
        <BanorteButton
          title={`✅ Aplicar cambios${savings > 0 ? ` (-$${savings.toLocaleString('es-MX')}/mes)` : ''}`}
          onPress={handleApplyChanges}
          variant="primary"
          disabled={!hasChanges}
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
  // ── Savings ──
  savingsCard: {
    paddingVertical: Spacing.lg,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  savingsLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.darkGray,
  },
  savingsAmount: {
    fontSize: Typography.sizes.xxl,
    fontFamily: Typography.fontFamily.extraBold,
    color: Colors.gray,
  },
  savingsAmountActive: {
    color: Colors.success,
  },
  savingsBarTrack: {
    height: 8,
    backgroundColor: Colors.silver,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  savingsBarFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
  },
  spendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spendLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.gray,
  },
  spendValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.darkGray,
  },
  // ── List ──
  listCard: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  subscriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  subLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  subInfo: {
    flex: 1,
  },
  subName: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.black,
  },
  subCategory: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.gray,
    marginTop: 2,
  },
  subRight: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  subAmount: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.black,
  },
  subAmountInactive: {
    color: Colors.lightGray,
    textDecorationLine: 'line-through',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.silver,
    marginHorizontal: Spacing.sm,
  },
  // ── Actions ──
  actions: {
    marginTop: Spacing.sm,
  },
});

export default SubscriptionManager;
