import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, METRICS, SHADOWS } from '../styles/theme';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const resolveAvatarSource = (avatar) => {
  if (!avatar || avatar === 'preset:robot' || avatar === 'robot' || typeof avatar === 'number') {
    return require('../../assets/robot_avatar.png');
  }
  if (typeof avatar === 'string' && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:'))) {
    return { uri: avatar };
  }
  return require('../../assets/robot_avatar.png');
};

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { themeKey, setTheme, colors, THEME_OPTIONS } = useTheme();
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);
  const [readingNotifications, setReadingNotifications] = useState(true);

  const currentAvatarSource = resolveAvatarSource(user?.avatar);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="MY ACCOUNT" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile / Guest Card */}
        {isAuthenticated && user ? (
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.avatarContainer, { borderColor: colors.primary, backgroundColor: colors.surfaceLight }]}>
              <Image
                source={currentAvatarSource}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={[styles.statusBadge, { backgroundColor: colors.success, borderColor: colors.surface }]} />
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.text }]}>{user.username}</Text>
              <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.proBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.secondary} />
                  <Text style={[styles.proText, { color: colors.secondary }]}>VIP READER</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.guestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.avatarContainerLarge, { borderColor: colors.primary, backgroundColor: colors.surfaceLight }]}>
              <Image
                source={currentAvatarSource}
                style={styles.avatarImageLarge}
                resizeMode="cover"
              />
              <View style={[styles.statusBadgeLarge, { backgroundColor: colors.secondary, borderColor: colors.surface }]} />
            </View>

            <View style={styles.guestInfo}>
              <Text style={[styles.guestTitle, { color: colors.text }]}>Guest Reader</Text>
              <Text style={[styles.guestSubtitle, { color: colors.textMuted }]}>
                Sign in to sync your bookmarks, favorites, and reading streak.
              </Text>
            </View>
            <TouchableOpacity style={[styles.signInBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Auth')}>
              <Text style={styles.signInBtnText}>Sign In / Sign Up</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Reading Statistics Cards */}
        {isAuthenticated && user && (
          <>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Reading Activity</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="book-outline" size={22} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{user.stats?.chaptersRead || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Chapters Read</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="time-outline" size={22} color={colors.secondary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{Math.round((user.stats?.readingTimeMinutes || 0) / 60)} hrs</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Time Spent</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="flame-outline" size={22} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}>{user.stats?.currentStreak || 1} Days</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Daily Streak</Text>
              </View>
            </View>
          </>
        )}

        {/* Settings Group */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>App Preferences</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Theme Selector Section */}
          <View style={[styles.themeSelectorContainer, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Color Theme</Text>
                <Text style={[styles.themeSubtext, { color: colors.textMuted }]}>
                  Active: {THEME_OPTIONS.find((t) => t.key === themeKey)?.name || 'Dark Veil'}
                </Text>
              </View>
            </View>

            <View style={styles.themeGrid}>
              {THEME_OPTIONS.map((item) => {
                const isSelected = item.key === themeKey;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.themePill,
                      {
                        backgroundColor: item.background,
                        borderColor: isSelected ? item.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setTheme(item.key)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.colorDot, { backgroundColor: item.primary }]} />
                    <Text style={[styles.themePillText, { color: item.text }]}>{item.name}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={14} color={item.primary} style={{ marginLeft: 2 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="wifi-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>Download Only via Wi-Fi</Text>
            </View>
            <Switch
              value={downloadOverWifi}
              onValueChange={setDownloadOverWifi}
              trackColor={{ false: colors.surfaceLight, true: colors.primary }}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>Chapter Release Alerts</Text>
            </View>
            <Switch
              value={readingNotifications}
              onValueChange={setReadingNotifications}
              trackColor={{ false: colors.surfaceLight, true: colors.primary }}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => alert('Storage cache cleared (124 MB freed)')}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-bin-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>Clear Offline Image Cache</Text>
            </View>
            <Text style={[styles.cacheSize, { color: colors.textMuted }]}>124 MB</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out / Sign In Action */}
        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out of Storyveil</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.authPromptBtn, { borderColor: colors.primaryGlow }]} onPress={() => navigation.navigate('Auth')}>
            <Ionicons name="log-in-outline" size={20} color={colors.primary} />
            <Text style={[styles.authPromptText, { color: colors.text }]}>Sign In with Account</Text>
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
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  avatarContainerLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statusBadgeLarge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
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
  themeSelectorContainer: {
    padding: METRICS.paddingMedium,
    borderBottomWidth: 1,
    gap: 12,
  },
  themeSubtext: {
    fontSize: 11,
    marginTop: 1,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: '47%',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '700',
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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
