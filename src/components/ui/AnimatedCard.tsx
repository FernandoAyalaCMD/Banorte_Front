/**
 * AnimatedCard
 * Card container with shadow, rounded corners, and entrance animation.
 * Uses Reanimated entering/exiting animations for smooth transitions.
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInRight,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Shadows, Spacing } from '../../theme/banorte';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Delay for entrance animation (ms) */
  delay?: number;
  /** Type of entrance animation */
  entrance?: 'fadeDown' | 'slideRight' | 'none';
  /** Background variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'danger' | 'success';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  delay = 0,
  entrance = 'fadeDown',
  variant = 'default',
}) => {
  const enteringAnimation = (() => {
    switch (entrance) {
      case 'fadeDown':
        return FadeInDown.delay(delay).springify().damping(18).stiffness(120);
      case 'slideRight':
        return SlideInRight.delay(delay).springify().damping(18).stiffness(120);
      case 'none':
        return undefined;
    }
  })();

  return (
    <Animated.View
      entering={enteringAnimation}
      exiting={FadeOutUp.duration(250)}
      style={[styles.base, variantStyles[variant], style]}
    >
      {children}
    </Animated.View>
  );
};

const variantStyles: Record<string, ViewStyle> = {
  default: {
    backgroundColor: Colors.white,
    ...Shadows.md,
  },
  elevated: {
    backgroundColor: Colors.white,
    ...Shadows.lg,
  },
  outlined: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.silver,
  },
  danger: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  success: {
    backgroundColor: Colors.successLight,
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginVertical: Spacing.sm,
  },
});

export default AnimatedCard;
