import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface Habit {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  createdAt: string;
  completions: string[];
}

interface HabitsContextType {
  habits: Habit[];
  isPremium: boolean;
  isLoaded: boolean;
  addHabit: (name: string, color: string, emoji?: string) => void;
  updateHabit: (id: string, name: string, color: string, emoji?: string) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string) => void;
  unlockPremium: () => void;
}

const HabitsContext = createContext<HabitsContextType | null>(null);

const STORAGE_KEY = '@streak_habits';
const PREMIUM_KEY = '@streak_premium';

export const CARD_PRESETS: { bg: string; accent: string }[] = [
  { bg: '#4C2B8A', accent: '#C4B5FD' },
  { bg: '#1B5E38', accent: '#86EFAC' },
  { bg: '#5A3A08', accent: '#FCD34D' },
  { bg: '#3A0D48', accent: '#F0ABFC' },
  { bg: '#0D2B5A', accent: '#93C5FD' },
  { bg: '#1A3A1A', accent: '#A7F3A0' },
  { bg: '#3A0D0D', accent: '#FCA5A5' },
  { bg: '#2A2A0D', accent: '#FDE68A' },
];

export function getAccentColor(bgColor: string): string {
  const preset = CARD_PRESETS.find((p) => p.bg === bgColor);
  return preset?.accent ?? '#C4B5FD';
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

export function calculateStreak(completions: string[]): number {
  const completionSet = new Set(completions);
  let streak = 0;
  let daysAgo = 0;
  while (completionSet.has(getDateString(daysAgo))) {
    streak++;
    daysAgo++;
  }
  return streak;
}

export function isCompletedToday(habit: Habit): boolean {
  return habit.completions.includes(getTodayString());
}

export const MILESTONE_STREAKS = [7, 14, 30, 60, 100];

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [habitsRaw, premiumRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(PREMIUM_KEY),
        ]);
        if (habitsRaw) {
          setHabits(JSON.parse(habitsRaw));
        } else {
          const defaultHabits: Habit[] = [
            {
              id: 'default_sport',
              name: 'Sport',
              color: '#4C2B8A',
              emoji: '💪',
              createdAt: getTodayString(),
              completions: [],
            },
            {
              id: 'default_kitob',
              name: 'Kitob o\'qish',
              color: '#1B5E38',
              emoji: '📚',
              createdAt: getTodayString(),
              completions: [],
            },
          ];
          setHabits(defaultHabits);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultHabits));
        }
        if (premiumRaw === 'true') setIsPremium(true);
      } catch {}
      setIsLoaded(true);
    })();
  }, []);

  const saveHabits = useCallback(async (next: Habit[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addHabit = useCallback(
    (name: string, color: string, emoji?: string) => {
      const habit: Habit = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        name,
        color,
        emoji,
        createdAt: getTodayString(),
        completions: [],
      };
      setHabits((prev) => {
        const next = [...prev, habit];
        saveHabits(next);
        return next;
      });
    },
    [saveHabits],
  );

  const updateHabit = useCallback(
    (id: string, name: string, color: string, emoji?: string) => {
      setHabits((prev) => {
        const next = prev.map((h) => (h.id === id ? { ...h, name, color, emoji } : h));
        saveHabits(next);
        return next;
      });
    },
    [saveHabits],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      setHabits((prev) => {
        const next = prev.filter((h) => h.id !== id);
        saveHabits(next);
        return next;
      });
    },
    [saveHabits],
  );

  const toggleCompletion = useCallback((id: string) => {
    const today = getTodayString();
    setHabits((prev) => {
      const next = prev.map((h) => {
        if (h.id !== id) return h;
        const hasToday = h.completions.includes(today);
        const completions = hasToday
          ? h.completions.filter((d) => d !== today)
          : [...h.completions, today];
        return { ...h, completions };
      });
      saveHabits(next);
      return next;
    });
  }, [saveHabits]);

  const unlockPremium = useCallback(async () => {
    setIsPremium(true);
    try {
      await AsyncStorage.setItem(PREMIUM_KEY, 'true');
    } catch {}
  }, []);

  return (
    <HabitsContext.Provider
      value={{
        habits,
        isPremium,
        isLoaded,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
        unlockPremium,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits(): HabitsContextType {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
