/**
 * BanorteSwitch
 * Custom switch with Banorte brand colors and haptic toggle feedback.
 * Animated thumb with smooth color transitions.
 */

import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors, Shadows, AnimationConfig } from '../../theme/banorte';
import { tapLight } from '../../utils/haptics';

interface BanorteSwitchProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  disabled?: boolean;
  /** Active color (default: Banorte green) */
  activeColor?: string;
  /** Inactive color (default: light gray) */
  inactiveColor?: string;
  style?: ViewStyle;
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;
const THUMB_MARGIN = 2;

export const BanorteSwitch: React.FC<BanorteSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  activeColor = Colors.success,
  inactiveColor = Colors.lightGray,
  style,
}) => {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, AnimationConfig.springTap);
  }, [value, progress]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    tapLight();
    onValueChange(!value);
  }, [disabled, value, onValueChange]);

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    ),
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(
          progress.value * (TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2),
          AnimationConfig.springTap
        ),
      },
    ],
  }));

  return (
    <Pressable onPress={handleToggle} disabled={disabled} style={style}>
      <Animated.View
        style={[
          styles.track,
          trackAnimatedStyle,
          disabled && styles.disabled,
        ]}
      >
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
    paddingHorizontal: THUMB_MARGIN,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default BanorteSwitch;
