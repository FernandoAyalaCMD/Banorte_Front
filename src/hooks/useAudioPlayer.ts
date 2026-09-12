/**
 * useAudioPlayer Hook
 * Wraps expo-audio for playing ElevenLabs audio clips.
 * Supports both base64 data URIs and HTTP URLs.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  error: string | null;
}

interface AudioPlayerActions {
  play: (source: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
}

export function useAudioPlayer(): AudioPlayerState & AudioPlayerActions {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    progress: 0,
    duration: 0,
    error: null,
  });
  const playerRef = useRef<AudioPlayer | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch {}
      }
    };
  }, []);

  const play = useCallback(async (source: string) => {
    try {
      // Unload previous sound
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch {}
        playerRef.current = null;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Configure audio mode
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });
      } catch {}

      const player = createAudioPlayer(source);
      playerRef.current = player;

      player.addListener('playbackStatusUpdate', (status) => {
        if (status.isLoaded) {
          setState((prev) => ({
            ...prev,
            isPlaying: status.playing,
            progress:
              status.duration && status.duration > 0
                ? (status.currentTime || 0) / status.duration
                : 0,
            duration: status.duration || 0,
            isLoading: false,
          }));

          if (status.didJustFinish) {
            setState((prev) => ({
              ...prev,
              isPlaying: false,
              progress: 1,
            }));
          }
        }
      });

      player.play();
      setState((prev) => ({ ...prev, isLoading: false, isPlaying: true }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio playback failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        error: message,
      }));
    }
  }, []);

  const stop = useCallback(async () => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch {}
      playerRef.current = null;
      setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
    }
  }, []);

  const pause = useCallback(async () => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
      } catch {}
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const resume = useCallback(async () => {
    if (playerRef.current) {
      try {
        playerRef.current.play();
      } catch {}
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  return { ...state, play, stop, pause, resume };
}
