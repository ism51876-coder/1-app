import { Audio } from 'expo-av';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export function useSound() {
  const playCheck = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: false, shouldDuckAndroid: true });
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/check.wav'),
        { shouldPlay: true, volume: 1.0 },
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch {}
  }, []);

  const playMilestone = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: false, shouldDuckAndroid: true });
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/milestone.wav'),
        { shouldPlay: true, volume: 1.0 },
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch {}
  }, []);

  return { playCheck, playMilestone };
}
