import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../theme/banorte';

// Asumimos que tienes algún icono de micrófono en tu proyecto.
// Si usas expo/vector-icons, reemplaza esto:
// import { Ionicons } from '@expo/vector-icons';
// Aquí pondremos un emoji o texto provisional por si acaso
const MicrophoneIcon = () => <Animated.Text style={{fontSize: 24}}>🎤</Animated.Text>;

interface MicrophoneButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export function MicrophoneButton({
  isRecording,
  isTranscribing,
  onPressIn,
  onPressOut,
}: MicrophoneButtonProps) {
  
  // Animación de pulso cuando está grabando
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: isRecording
            ? withRepeat(
                withSequence(
                  withTiming(1.2, { duration: 500 }),
                  withTiming(1, { duration: 500 })
                ),
                -1,
                true
              )
            : withSpring(1),
        },
      ],
      backgroundColor: isRecording ? '#EB0029' : Colors.lightGray,
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isTranscribing}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        {isTranscribing ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <MicrophoneIcon />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
