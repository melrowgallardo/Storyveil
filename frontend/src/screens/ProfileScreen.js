import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, METRICS, SHADOWS } from '../styles/theme';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);
  const [readingNotifications, setReadingNotifications] = useState(true);

  return (
    <View style={styles.container}>
      <Header title="MY ACCOUNT" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile / Guest Card */}
        {isAuthenticated && user ? (
          <View style={styles.profileCard}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.botAvatarContainer}>
                <Ionicons name="hardware-chip" size={30} color={COLORS.secondary} />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.proBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={COLORS.secondary} />
                  <Text style={styles.proText}>VIP READER</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (

          <View style={styles.guestCard}>
            <View style={styles.guestIconBadge}>
              <Ionicons name="hardware-chip" size={42} color={COLORS.secondary} />
            </View>

            <View style={styles.guestInfo}>
              <Text style={styles.guestTitle}>Guest Reader</Text>
              <Text style={styles.guestSubtitle}>Sign in to sync your bookmarks, favorites, and reading streak.</Text>
            </View>
            <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Auth')}>
              <Text style={styles.signInBtnText}>Sign In / Sign Up</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Reading Statistics Cards */}
        {isAuthenticated && user && (
          <>
            <Text style={styles.sectionHeader}>Reading Activity</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="book-outline" size={22} color={COLORS.primary} />
                <Text style={styles.statValue}>{user.stats?.chaptersRead || 0}</Text>
                <Text style={styles.statLabel}>Chapters Read</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={22} color={COLORS.secondary} />
                <Text style={styles.statValue}>{Math.round((user.stats?.readingTimeMinutes || 0) / 60)} hrs</Text>
                <Text style={styles.statLabel}>Time Spent</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="flame-outline" size={22} color={COLORS.accent} />
                <Text style={styles.statValue}>{user.stats?.currentStreak || 1} Days</Text>
                <Text style={styles.statLabel}>Daily Streak</Text>
              </View>
            </View>
          </>
        )}

        {/* Settings Group */}
        <Text style={styles.sectionHeader}>App Preferences</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="wifi-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.settingTitle}>Download Only via Wi-Fi</Text>
            </View>
            <Switch
              value={downloadOverWifi}
              onValueChange={setDownloadOverWifi}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.settingTitle}>Chapter Release Alerts</Text>
            </View>
            <Switch
              value={readingNotifications}
              onValueChange={setReadingNotifications}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => alert('Storage cache cleared (124 MB freed)')}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-bin-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.settingTitle}>Clear Offline Image Cache</Text>
            </View>
            <Text style={styles.cacheSize}>124 MB</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out / Sign In Action */}
        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Sign Out of Storyveil</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.authPromptBtn} onPress={() => navigation.navigate('Auth')}>
            <Ionicons name="log-in-outline" size={20} color={COLORS.primary} />
            <Text style={styles.authPromptText}>Sign In with Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: METRICS.paddingMedium,
    paddingVertical: METRICS.paddingMedium,
    paddingBottom: METRICS.paddingLarge,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: METRICS.paddingMedium,
    borderRadius: METRICS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: METRICS.paddingMedium,
    ...SHADOWS.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  botAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  email: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  proText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  guestCard: {
    backgroundColor: COLORS.surface,
    padding: METRICS.paddingMedium,
    borderRadius: METRICS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 10,
    ...SHADOWS.card,
  },
  guestIconBadge: {
    marginBottom: -4,
  },
  guestInfo: {
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  guestSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: METRICS.borderRadiusSm,
    marginTop: 6,
    ...SHADOWS.glow,
  },
  signInBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: METRICS.paddingLarge,
    marginBottom: METRICS.paddingMedium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: METRICS.paddingMedium,
    borderRadius: METRICS.borderRadiusSm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  settingsGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: METRICS.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: METRICS.paddingMedium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  cacheSize: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: METRICS.paddingLarge,
    padding: METRICS.paddingMedium,
    borderRadius: METRICS.borderRadiusSm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  authPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: METRICS.paddingLarge,
    padding: METRICS.paddingMedium,
    borderRadius: METRICS.borderRadiusSm,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
  authPromptText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
});
