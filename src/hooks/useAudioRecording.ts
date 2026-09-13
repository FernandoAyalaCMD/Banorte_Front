import { useState, useCallback } from 'react';
import { useAudioRecorder, useAudioRecorderState, requestRecordingPermissionsAsync, RecordingPresets } from 'expo-audio';
import { Platform } from 'react-native';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';

export function useAudioRecording() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);

  const startRecording = useCallback(async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        console.error('Permission to record audio not granted:', permission);
        return;
      }

      if (!recorder.isRecording) {
        await recorder.prepareToRecordAsync();
        recorder.record();
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, [recorder]);

  const stopRecordingAndTranscribe = useCallback(async (): Promise<string | null> => {
    try {
      if (!recorder.isRecording) {
        return null;
      }

      setIsTranscribing(true);
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        setIsTranscribing(false);
        return null;
      }

      const uploadUri = Platform.OS === 'android' && !uri.startsWith('file://') ? `file://${uri}` : uri;
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

      // Convertir el audio a Base64 usando expo-file-system para evitar problemas con FormData
      const base64Audio = await readAsStringAsync(uploadUri, {
        encoding: EncodingType.Base64,
      });

      console.log('🎙️ Enviando audio en Base64 al backend:', apiUrl);

      const response = await fetch(`${apiUrl}/api/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          filename: 'audio.m4a',
          audioBase64: base64Audio
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      setIsTranscribing(false);
      return data.text;

    } catch (error) {
      console.error('Error during transcription:', error);
      setIsTranscribing(false);
      return null;
    }
  }, [recorder]);

  return {
    isRecording: recorderState.isRecording,
    isTranscribing,
    startRecording,
    stopRecordingAndTranscribe,
  };
}