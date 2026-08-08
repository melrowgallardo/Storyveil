import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const COLORS = {
  background: '#090A10',
  surface: '#121526',
  surfaceLight: '#1E233D',
  cardBg: 'rgba(255, 255, 255, 0.04)',
  
  primary: '#7C3AED',
  primaryGlow: 'rgba(124, 58, 237, 0.35)',
  secondary: '#06B6D4',
  accent: '#EC4899',
  gold: '#F59E0B',
  
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  border: 'rgba(255, 255, 255, 0.1)',
  borderActive: 'rgba(124, 58, 237, 0.6)',
  
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export const METRICS = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  paddingSmall: 8,
  paddingMedium: 16,
  paddingLarge: 24,
  borderRadius: 14,
  borderRadiusSm: 8,
  borderRadiusLg: 20,
};

export const SHADOWS = {
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};
