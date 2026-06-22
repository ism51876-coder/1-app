import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface LockedCardProps {
  onPress: () => void;
  index: number;
}

const LOCKED_COLORS = ['#1A0533', '#1F0018'];

export function LockedCard({ onPress, index }: LockedCardProps) {
  const bg = LOCKED_COLORS[index % LOCKED_COLORS.length];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: bg }]}
      onPress={onPress}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.lockCircle}>
          <Ionicons name="lock-closed" size={22} color="rgba(255,255,255,0.5)" />
        </View>
        <Text style={styles.label}>Premium</Text>
        <Text style={styles.sublabel}>$1.99 — ochish</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 24,
    overflow: 'hidden',
    opacity: 0.55,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  sublabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
    fontFamily: 'Inter_400Regular',
  },
});
