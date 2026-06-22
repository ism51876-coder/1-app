import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Habit, calculateStreak, getAccentColor, getDateString, isCompletedToday } from '@/contexts/HabitsContext';
import { ChainDots } from './ChainDots';
import { ParticleEffect } from './ParticleEffect';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  celebrateAll: boolean;
}

function getLast7(): string[] {
  return Array.from({ length: 7 }, (_, i) => getDateString(6 - i));
}

export function HabitCard({ habit, onToggle, onEdit, celebrateAll }: HabitCardProps) {
  const completed = isCompletedToday(habit);
  const streak = calculateStreak(habit.completions);
  const accent = getAccentColor(habit.color);
  const last7 = getLast7();

  const checkScale = useSharedValue(1);
  const checkFill = useSharedValue(completed ? 1 : 0);
  const cardScale = useSharedValue(1);
  const streakScale = useSharedValue(1);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    checkFill.value = withTiming(completed ? 1 : 0, { duration: 120 });
  }, [completed]);

  useEffect(() => {
    if (celebrateAll) {
      cardScale.value = withSequence(
        withTiming(1.03, { duration: 90 }),
        withSpring(1, { damping: 12 }),
      );
    }
  }, [celebrateAll]);

  const handleToggle = useCallback(() => {
    const willComplete = !completed;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        willComplete ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );
    }

    if (willComplete) {
      checkScale.value = withSpring(1.3, { damping: 8, stiffness: 240 }, () => {
        checkScale.value = withSpring(1, { damping: 14, stiffness: 160 });
      });
      checkFill.value = withTiming(1, { duration: 60 });
      cardScale.value = withDelay(
        100,
        withSequence(
          withTiming(1.025, { duration: 80 }),
          withSpring(1, { damping: 12 }),
        ),
      );
      setTimeout(() => {
        streakScale.value = withSequence(
          withSpring(1.4, { damping: 6, stiffness: 260 }),
          withSpring(1, { damping: 11, stiffness: 180 }),
        );
      }, 180);
      setTimeout(() => {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 900);
      }, 140);
    } else {
      checkFill.value = withTiming(0, { duration: 100 });
      checkScale.value = withSpring(0.85, { damping: 14 }, () => {
        checkScale.value = withSpring(1, { damping: 12 });
      });
    }

    onToggle(habit.id);
  }, [completed, habit.id]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const checkBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const checkFillStyle = useAnimatedStyle(() => ({
    opacity: checkFill.value,
  }));

  const streakNumStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  return (
    <Animated.View style={[styles.card, { backgroundColor: habit.color }, cardStyle]}>
      <Pressable
        style={styles.pressable}
        onPress={handleToggle}
        onLongPress={() => onEdit(habit)}
        android_ripple={null}
      >
        <View style={styles.inner}>
          <View style={styles.left}>
            <Text style={styles.habitName} numberOfLines={1}>
              {habit.name}
            </Text>

            <View style={styles.streakRow}>
              <Animated.Text style={[styles.streakNum, { color: accent }, streakNumStyle]}>
                {streak}
              </Animated.Text>
              <Text style={[styles.streakLabel, { color: accent }]}>KETMA-KET KUN</Text>
            </View>

            <ChainDots
              filledDays={habit.completions}
              last7Dates={last7}
              accentColor={accent}
            />
          </View>

          <View style={styles.right}>
            <Animated.View style={[styles.checkBtn, checkBtnStyle]}>
              <View style={[styles.checkOutline, { borderColor: `${accent}88` }]} />
              <Animated.View style={[styles.checkFill, { backgroundColor: accent }, checkFillStyle]}>
                <Text style={[styles.checkMark, { color: habit.color }]}>✓</Text>
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      </Pressable>

      {showParticles && <ParticleEffect color={accent} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 22,
    marginHorizontal: 14,
    marginVertical: 5,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  streakNum: {
    fontSize: 64,
    lineHeight: 72,
    fontFamily: 'JetBrainsMono_800ExtraBold',
    letterSpacing: -2,
  },
  streakLabel: {
    fontSize: 9,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  checkBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOutline: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 2,
  },
  checkFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 26,
    fontWeight: '800' as const,
    fontFamily: 'SpaceGrotesk_700Bold',
    lineHeight: 30,
  },
});
