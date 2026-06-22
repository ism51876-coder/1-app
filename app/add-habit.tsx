import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CARD_PRESETS, getAccentColor, useHabits } from '@/contexts/HabitsContext';
import { ChainDots } from '@/components/ChainDots';

const DEMO_LAST7 = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return d.toISOString().split('T')[0];
}).filter((_, i) => i % 2 === 0 || i === 6);

const DEMO_COMPLETIONS = DEMO_LAST7.slice(0, 3);

export default function AddHabitScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { habits, addHabit, updateHabit, deleteHabit } = useHabits();

  const editingHabit = params.id ? habits.find((h) => h.id === params.id) : null;
  const isEditing = !!editingHabit;

  const [name, setName] = useState(editingHabit?.name ?? '');
  const [selectedColor, setSelectedColor] = useState(
    editingHabit?.color ?? CARD_PRESETS[0].bg,
  );

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setSelectedColor(editingHabit.color);
    }
  }, [editingHabit]);

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isEditing && editingHabit) {
      updateHabit(editingHabit.id, trimmed, selectedColor);
    } else {
      addHabit(trimmed, selectedColor);
    }
    router.back();
  }, [name, selectedColor, isEditing, editingHabit]);

  const handleDelete = useCallback(() => {
    if (!editingHabit) return;
    Alert.alert(
      "Odatni o'chirish",
      `"${editingHabit.name}" odatini o'chirishni xohlaysizmi?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: () => {
            deleteHabit(editingHabit.id);
            router.back();
          },
        },
      ],
    );
  }, [editingHabit]);

  const topInset = Platform.OS === 'web' ? 44 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const canSave = name.trim().length > 0;
  const accent = getAccentColor(selectedColor);

  const previewLast7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Tahrirlash' : 'Yangi odat'}
        </Text>
        <Pressable
          style={[styles.headerBtn, !canSave && { opacity: 0.3 }]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Ionicons name="checkmark" size={22} color={canSave ? '#FFFFFF' : 'rgba(255,255,255,0.3)'} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview card */}
        <View style={[styles.previewCard, { backgroundColor: selectedColor }]}>
          <View style={styles.previewInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewName}>{name || 'Odat nomi'}</Text>
              <View style={styles.previewStreakRow}>
                <Text style={[styles.previewNum, { color: accent }]}>0</Text>
                <Text style={[styles.previewKetma, { color: accent }]}>KETMA-KET KUN</Text>
              </View>
              <ChainDots
                filledDays={[]}
                last7Dates={previewLast7}
                accentColor={accent}
              />
            </View>
            <View style={[styles.previewCircle, { borderColor: `${accent}66` }]} />
          </View>
        </View>

        {/* Name input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOMI</Text>
          <TextInput
            style={styles.input}
            placeholder="Masalan: Meditatsiya, Sport..."
            placeholderTextColor="rgba(255,255,255,0.22)"
            value={name}
            onChangeText={setName}
            maxLength={32}
            autoFocus={!isEditing}
            selectionColor={accent}
          />
        </View>

        {/* Color picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RANG</Text>
          <View style={styles.colorGrid}>
            {CARD_PRESETS.map((preset) => (
              <Pressable
                key={preset.bg}
                onPress={() => setSelectedColor(preset.bg)}
                style={[
                  styles.colorChip,
                  { backgroundColor: preset.bg },
                  selectedColor === preset.bg && [
                    styles.colorChipSelected,
                    { borderColor: preset.accent },
                  ],
                ]}
              >
                {selectedColor === preset.bg && (
                  <View style={[styles.colorCheckCircle, { backgroundColor: preset.accent }]}>
                    <Ionicons name="checkmark" size={13} color={preset.bg} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {isEditing && (
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={17} color="#EF4444" />
            <Text style={styles.deleteText}>Odatni o'chirish</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  content: {
    paddingHorizontal: 16,
    gap: 26,
  },
  previewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 2,
  },
  previewInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewName: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  previewStreakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  previewNum: {
    fontSize: 44,
    lineHeight: 50,
    fontFamily: 'JetBrainsMono_800ExtraBold',
    letterSpacing: -1.5,
  },
  previewKetma: {
    fontSize: 8,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    letterSpacing: 1,
    marginBottom: 3,
  },
  previewCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    marginLeft: 12,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_400Regular',
    borderWidth: 1,
    borderColor: '#222222',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorChip: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorChipSelected: {
    borderWidth: 2.5,
  },
  colorCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 4,
  },
  deleteText: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'SpaceGrotesk_500Medium',
  },
});
