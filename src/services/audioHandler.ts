/**
 * Audio Handler Service
 * Standalone audio playback service for ElevenLabs TTS clips using expo-audio.
 */

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let currentPlayer: AudioPlayer | null = null;

/**
 * Play audio from a URL or base64 data URI.
 * Automatically cleans up the previous sound instance.
 */
export async function playAudio(source: string): Promise<void> {
  // Cleanup previous
  if (currentPlayer) {
    try {
      currentPlayer.pause();
      currentPlayer.remove();
    } catch {
      // Ignore cleanup errors
    }
    currentPlayer = null;
  }

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  } catch {
    // Ignore audio mode errors
  }

  const player = createAudioPlayer(source);
  currentPlayer = player;

  player.addListener('playbackStatusUpdate', (status) => {
    if (status.isLoaded && status.didJustFinish) {
      try {
        player.remove();
      } catch {}
      if (currentPlayer === player) {
        currentPlayer = null;
      }
    }
  });

  player.play();
}

/**
 * Stop current audio playback.
 */
export async function stopAudio(): Promise<void> {
  if (currentPlayer) {
    try {
      currentPlayer.pause();
      currentPlayer.remove();
    } catch {}
    currentPlayer = null;
  }
}

/**
 * Check if audio is currently playing.
 */
export function isAudioPlaying(): boolean {
  return currentPlayer !== null && currentPlayer.playing;
}
