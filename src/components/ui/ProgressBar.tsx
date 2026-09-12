/**
 * ProgressBar
 * Animated progress bar using Reanimated shared values.
 * Supports color transitions based on progress level.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { Colors, BorderRadius } from '../../theme/banorte';

interface ProgressBarProps {
  /** Progress value from 0 to 1 */
  progress: number;
  /** Height of the bar */
  height?: number;
  /** Whether to animate color changes based on progress */
  colorTransition?: boolean;
  /** Custom color (overrides colorTransition) */
  color?: string;
  /** Background track color */
  trackColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  colorTransition = false,
  color,
  trackColor = Colors.silver,
  style,
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress, animatedProgress]);

  const animatedBarStyle = useAnimatedStyle(() => {
    const barColor = color
      ? color
      : colorTransition
        ? interpolateColor(
            animatedProgress.value,
            [0, 0.3, 0.6, 1],
            [Colors.danger, Colors.warning, Colors.success, Colors.success]
          )
        : Colors.primary;

    return {
      width: `${animatedProgress.value * 100}%` as any,
      backgroundColor: barColor,
    };
  });

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }, style]}>
      <Animated.View style={[styles.bar, { height }, animatedBarStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: BorderRadius.full,
  },
});

export default ProgressBar;
