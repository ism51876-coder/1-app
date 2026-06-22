import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HabitCard } from '@/components/HabitCard';
import { LockedCard } from '@/components/LockedCard';
import { PaywallModal } from '@/components/PaywallModal';
import {
  MILESTONE_STREAKS,
  calculateStreak,
  isCompletedToday,
  useHabits,
} from '@/contexts/HabitsContext';
import { useSound } from '@/hooks/useSound';

const FREE_LIMIT = 2;
const TOTAL_SLOTS = 4;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { habits, isPremium, isLoaded, toggleCompletion, unlockPremium } = useHabits();
  const { playCheck, playMilestone } = useSound();
  const [showPaywall, setShowPaywall] = useState(false);
  const [celebrateAll, setCelebrateAll] = useState(false);
  const [showAllDone, setShowAllDone] = useState(false);
  const prevAllDone = useRef(false);

  const limit = isPremium ? TOTAL_SLOTS : FREE_LIMIT;
  const allDoneToday = habits.length > 0 && habits.every((h) => isCompletedToday(h));

  const flashOpacity = useSharedValue(0);
  const allDoneBannerScale = useSharedValue(0.8);
  const allDoneBannerOpacity = useSharedValue(0);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const bannerStyle = useAnimatedStyle(() => ({
    opacity: allDoneBannerOpacity.value,
    transform: [{ scale: allDoneBannerScale.value }],
  }));

  useEffect(() => {
    if (!isLoaded) return;
    if (allDoneToday && !prevAllDone.current && habits.length > 0) {
      setTimeout(() => {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        playMilestone();
        setCelebrateAll(true);
        flashOpacity.value = withSequence(
          withTiming(0.18, { duration: 70 }),
          withTiming(0, { duration: 300 }),
        );
        setShowAllDone(true);
        allDoneBannerOpacity.value = withTiming(1, { duration: 250 });
        allDoneBannerScale.value = withSpring(1, { damping: 12, stiffness: 180 });
        setTimeout(() => {
          allDoneBannerOpacity.value = withTiming(0, { duration: 200 });
          setTimeout(() => setShowAllDone(false), 200);
        }, 2800);
        setTimeout(() => setCelebrateAll(false), 600);
      }, 350);
    }
    prevAllDone.current = allDoneToday;
  }, [allDoneToday, isLoaded]);

  const handleToggle = useCallback(
    (id: string) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;
      const wasCompleted = isCompletedToday(habit);
      toggleCompletion(id);
      playCheck();
      if (!wasCompleted) {
        const newStreak = calculateStreak(habit.completions) + 1;
        if (MILESTONE_STREAKS.includes(newStreak) && isPremium) {
          playMilestone();
          setTimeout(() => {
            router.push({ pathname: '/milestone', params: { streak: newStreak, name: habit.name } });
          }, 700);
        }
      }
    },
    [habits, toggleCompletion, isPremium, playCheck, playMilestone],
  );

  const handleEdit = useCallback((habit: import('@/contexts/HabitsContext').Habit) => {
    router.push({ pathname: '/add-habit', params: { id: habit.id } });
  }, []);

  const handleAdd = useCallback(() => {
    if (habits.length >= limit) {
      setShowPaywall(true);
      return;
    }
    router.push('/add-habit');
  }, [habits.length, limit]);

  const topInset = Platform.OS === 'web' ? 20 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 24 : insets.bottom;
  const lockedCount = isPremium ? 0 : (TOTAL_SLOTS - FREE_LIMIT);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

      {showAllDone && (
        <Animated.View style={[styles.allDoneBanner, bannerStyle]} pointerEvents="none">
          <Text style={styles.allDoneText}>BUGUN HAMMASI BAJARILDI</Text>
        </Animated.View>
      )}

      {/* Cards */}
      <View style={[styles.cards, { paddingTop: topInset + 8 }]}>
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={handleToggle}
            onEdit={handleEdit}
            celebrateAll={celebrateAll}
          />
        ))}
        {Array.from({ length: lockedCount }, (_, i) => (
          <LockedCard
            key={`locked-${i}`}
            index={i}
            onPress={() => setShowPaywall(true)}
          />
        ))}
      </View>

      {/* Bottom add button */}
      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
          onPress={handleAdd}
        >
          <Text style={styles.addBtnText}>+ Odat qo'shish</Text>
        </Pressable>
      </View>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlock={() => { setShowPaywall(false); unlockPremium(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080808',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 99,
  },
  allDoneBanner: {
    position: 'absolute',
    top: '50%',
    left: 24,
    right: 24,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  allDoneText: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cards: {
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#080808',
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addBtnPressed: {
    opacity: 0.6,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    letterSpacing: 0.2,
  },
});
