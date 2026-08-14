import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, METRICS } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const resolveAvatarSource = (avatar) => {
  if (!avatar || avatar === 'preset:robot' || avatar === 'robot' || typeof avatar === 'number') {
    return require('../../assets/robot_avatar.png');
  }
  if (typeof avatar === 'string' && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:'))) {
    return { uri: avatar };
  }
  return require('../../assets/robot_avatar.png');
};

export default function Header({ title, onNotificationPress, onSearchPress, onQrPress, onAvatarPress, navigation: propNavigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navFromHook = useNavigation();
  const nav = propNavigation || navFromHook;

  const avatarSource = resolveAvatarSource(user?.avatar);

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else if (nav) {
      if (!isAuthenticated) {
        nav.navigate('Auth');
      } else {
        nav.navigate('MainTabs', { screen: 'ProfileTab' });
      }
    }
  };

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else if (nav) {
      try {
        nav.navigate('Search');
      } catch (e) {
        nav.navigate('HomeTab');
      }
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else if (nav) {
      try {
        nav.navigate('Notifications');
      } catch (e) {
        alert('Notifications: You have no unread notifications.');
      }
    } else {
      alert('Notifications: You have no unread notifications.');
    }
  };

  const handleQrPress = () => {
    if (onQrPress) {
      onQrPress();
    } else if (nav) {
      try {
        nav.navigate('QRScanner');
      } catch (e) {
        console.warn('[Header] QRScanner navigation failed:', e.message);
      }
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 8, METRICS.paddingMedium + 6),
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          zIndex: 999,
          elevation: 10,
        },
      ]}
    >
      <View style={styles.brandRow} pointerEvents="auto">
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.brandTitle, { color: colors.text }]}>{title || 'STORYVEIL'}</Text>
      </View>

      <View style={styles.actionRow} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
          onPress={handleQrPress}
        >
          <Ionicons name="qr-code-outline" size={20} color={colors.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
          onPress={handleSearchPress}
        >
          <Ionicons name="search-outline" size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleAvatarPress}
        >
          <Image
            source={avatarSource}
            style={[styles.avatar, { borderColor: colors.primary }]}
          />
        </TouchableOpacity>
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
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
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
  botBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

