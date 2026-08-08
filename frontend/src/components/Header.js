import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, METRICS } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, onNotificationPress, onSearchPress, onQrPress }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, METRICS.paddingMedium + 6) }]}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="book" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.brandTitle}>{title || 'STORYVEIL'}</Text>
      </View>

      <View style={styles.actionRow}>
        {onQrPress && (
          <TouchableOpacity style={styles.iconBtn} onPress={onQrPress}>
            <Ionicons name="qr-code-outline" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
          <Ionicons name="search-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          <View style={styles.dot} />
        </TouchableOpacity>

        <Image source={{ uri: user.avatar }} style={styles.avatar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: METRICS.paddingMedium,
    paddingVertical: METRICS.paddingSmall + 4,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
});
