import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export function PaywallModal({ visible, onClose, onUnlock }: PaywallModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.handle} />

          <View style={styles.iconWrap}>
            <Ionicons name="flame" size={40} color="#FFB830" />
          </View>

          <Text style={styles.title}>4 ta odat va bosqichlar</Text>
          <Text style={styles.desc}>
            Bepul versiyada 2 ta odat kuzatiladi. Siz uchun ko'proq kerakmi?
          </Text>

          <View style={styles.features}>
            {['4 ta odat', 'Bosqich animatsiyalari', 'Bir martalik to\'lov — obuna emas'].map((f) => (
              <View key={f} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#FFB830" />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.buyBtn, pressed && styles.buyBtnPressed]}
            onPress={onUnlock}
          >
            <Text style={styles.buyText}>$1.99 — Ochish</Text>
          </Pressable>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Keyinroq</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 16,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    marginBottom: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,184,48,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
  },
  features: {
    alignSelf: 'stretch',
    gap: 12,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Inter_500Medium',
  },
  buyBtn: {
    backgroundColor: '#FFB830',
    borderRadius: 18,
    paddingVertical: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 14,
  },
  buyBtnPressed: {
    opacity: 0.8,
  },
  buyText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#000000',
    fontFamily: 'Inter_700Bold',
  },
  closeBtn: {
    paddingVertical: 10,
  },
  closeText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Inter_400Regular',
  },
});
