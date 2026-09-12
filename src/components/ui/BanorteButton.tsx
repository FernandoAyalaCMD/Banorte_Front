/**
 * BanorteButton
 * Premium button with Banorte brand gradients, press animation, and haptic feedback.
 * Variants: primary (red gradient), secondary (outlined), danger (red solid), ghost (transparent).
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, AnimationConfig } from '../../theme/banorte';
import { tapMedium, tapHeavy } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface BanorteButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const BanorteButton: React.FC<BanorteButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  size = 'md',
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, AnimationConfig.springTap);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, AnimationConfig.springTap);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    if (variant === 'danger') {
      tapHeavy();
    } else {
      tapMedium();
    }
    onPress();
  }, [disabled, loading, variant, onPress]);

  const sizeStyles = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? Colors.primary : Colors.white}
          size="small"
        />
      ) : (
        <>
          {icon && <Animated.View style={styles.iconWrapper}>{icon}</Animated.View>}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              variantTextStyles[variant],
              isDisabled && styles.disabledText,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        style={[animatedStyle, fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#999', '#777'] : [Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, sizeStyles.container, isDisabled && styles.disabledContainer]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.base,
        sizeStyles.container,
        variantContainerStyles[variant],
        isDisabled && styles.disabledContainer,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

const SIZE_MAP: Record<string, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
    text: { fontSize: Typography.sizes.sm },
  },
  md: {
    container: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.xl },
    text: { fontSize: Typography.sizes.md },
  },
  lg: {
    container: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl },
    text: { fontSize: Typography.sizes.lg },
  },
};

const variantContainerStyles: Record<string, ViewStyle> = {
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

const variantTextStyles: Record<string, TextStyle> = {
  primary: { color: Colors.white },
  secondary: { color: Colors.primary },
  danger: { color: Colors.white },
  ghost: { color: Colors.primary },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontFamily: Typography.fontFamily.semiBold,
    letterSpacing: 0.3,
  },
  iconWrapper: {
    marginRight: Spacing.xs,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default BanorteButton;
