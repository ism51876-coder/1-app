import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MilestoneScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ streak?: string; name?: string }>();
  const streak = parseInt(params.streak ?? '7', 10);
  const name = params.name ?? '';

  const numberScale = useSharedValue(0.3);
  const numberOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    numberScale.value = withSpring(1, { damping: 10, stiffness: 120 });
    numberOpacity.value = withTiming(1, { duration: 400 });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    glowScale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1800 }),
          withTiming(1, { duration: 1800 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
    opacity: numberOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <Pressable style={styles.root} onPress={() => router.back()}>
      <View style={[styles.inner, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        <Animated.View style={[styles.glow, glowStyle]} />

        <Animated.Text style={[styles.streakNum, numberStyle]}>
          {streak}
        </Animated.Text>

        <Animated.View style={textStyle}>
          <Text style={styles.mainText}>
            {streak} kun.
          </Text>
          <Text style={styles.subText}>Davom eting.</Text>
          {name ? <Text style={styles.nameText}>{name}</Text> : null}
        </Animated.View>

        <Animated.View style={[styles.tapHint, textStyle]}>
          <Text style={styles.tapText}>Bosib davom eting</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#030303',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,184,48,0.06)',
  },
  streakNum: {
    fontSize: 120,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -6,
    lineHeight: 128,
    textAlign: 'center',
  },
  mainText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginTop: 8,
  },
  subText: {
    fontSize: 32,
    fontWeight: '300' as const,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  nameText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  tapHint: {
    position: 'absolute',
    bottom: 60,
  },
  tapText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.2)',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.5,
  },
});
