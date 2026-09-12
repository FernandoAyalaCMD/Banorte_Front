/**
 * VoiceWaveIndicator
 * Visual waveform animation displayed while the agent is "speaking" (audio playing).
 * Shows animated bars in Banorte red that pulse rhythmically.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing } from '../theme/banorte';

interface VoiceWaveIndicatorProps {
  isActive: boolean;
  barCount?: number;
  color?: string;
}

const BAR_WIDTH = 4;
const BAR_GAP = 3;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 24;

export const VoiceWaveIndicator: React.FC<VoiceWaveIndicatorProps> = ({
  isActive,
  barCount = 7,
  color = Colors.primary,
}) => {
  if (!isActive) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <View style={styles.barsContainer}>
        {Array.from({ length: barCount }).map((_, index) => (
          <WaveBar
            key={index}
            index={index}
            color={color}
            totalBars={barCount}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const WaveBar: React.FC<{
  index: number;
  color: string;
  totalBars: number;
}> = ({ index, color, totalBars }) => {
  const height = useSharedValue(MIN_HEIGHT);

  useEffect(() => {
    // Create varied timing for each bar
    const delay = index * 80;
    const duration = 400 + Math.random() * 200;

    // Center bars are taller
    const distFromCenter = Math.abs(index - (totalBars - 1) / 2);
    const maxH = MAX_HEIGHT - distFromCenter * 3;

    height.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(Math.max(maxH, MIN_HEIGHT + 4), {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(MIN_HEIGHT + Math.random() * 6, {
            duration: duration * 0.8,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      )
    );
  }, [height, index, totalBars]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: color, width: BAR_WIDTH },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BAR_GAP,
    height: MAX_HEIGHT + 4,
  },
  bar: {
    borderRadius: 2,
  },
});

export default VoiceWaveIndicator;
