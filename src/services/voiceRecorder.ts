/**
 * Voice Recorder Service
 * Captures user voice input via expo-audio AudioRecorder.
 */

import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioRecorder,
} from 'expo-audio';

let recorder: AudioRecorder | null = null;

/**
 * Start recording audio from the device microphone.
 * Returns the recorder instance.
 */
export async function startRecording(): Promise<AudioRecorder> {
  // Request permissions
  const { granted } = await requestRecordingPermissionsAsync();
  if (!granted) {
    throw new Error('Microphone permission not granted');
  }

  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });

  const newRecorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
  await newRecorder.prepareToRecordAsync();
  newRecorder.record();

  recorder = newRecorder;
  return newRecorder;
}

/**
 * Stop the current recording and return the URI of the audio file.
 */
export async function stopRecording(): Promise<string | null> {
  if (!recorder) return null;

  await recorder.stop();
  await setAudioModeAsync({
    allowsRecording: false,
  });

  const uri = recorder.uri;
  recorder = null;
  return uri;
}

/**
 * Check if currently recording.
 */
export function isRecording(): boolean {
  return recorder !== null && recorder.isRecording;
}
