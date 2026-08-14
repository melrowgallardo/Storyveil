import React, { createContext, useContext, useState, useEffect } from 'react';

// Safe storage utility supporting React Native Web / Browser localStorage & AsyncStorage
const getStoredTheme = async (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    console.warn('[ThemeContext] Web storage read warning:', e);
  }
  return null;
};

const setStoredTheme = async (key, val) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (e) {
    console.warn('[ThemeContext] Web storage write warning:', e);
  }
};

export const THEME_PALETTES = {
  dark: {
    key: 'dark',
    name: 'Dark Veil',
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
    statusBar: 'light',
    previewColor: '#7C3AED',
  },
  light: {
    key: 'light',
    name: 'Clean Light',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceLight: '#F1F5F9',
    cardBg: 'rgba(0, 0, 0, 0.03)',

    primary: '#7C3AED',
    primaryGlow: 'rgba(124, 58, 237, 0.25)',
    secondary: '#0891B2',
    accent: '#DB2777',
    gold: '#D97706',

    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',

    border: 'rgba(0, 0, 0, 0.12)',
    borderActive: 'rgba(124, 58, 237, 0.6)',

    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    statusBar: 'dark',
    previewColor: '#F8FAFC',
  },
  midnight: {
    key: 'midnight',
    name: 'Deep Ocean',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceLight: '#334155',
    cardBg: 'rgba(255, 255, 255, 0.05)',

    primary: '#2563EB',
    primaryGlow: 'rgba(37, 99, 235, 0.35)',
    secondary: '#38BDF8',
    accent: '#06B6D4',
    gold: '#F59E0B',

    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    border: 'rgba(255, 255, 255, 0.12)',
    borderActive: 'rgba(37, 99, 235, 0.6)',

    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    statusBar: 'light',
    previewColor: '#2563EB',
  },
  sunset: {
    key: 'sunset',
    name: 'Amber Dusk',
    background: '#1C1018',
    surface: '#2D1B28',
    surfaceLight: '#3F2738',
    cardBg: 'rgba(255, 255, 255, 0.05)',

    primary: '#F43F5E',
    primaryGlow: 'rgba(244, 63, 94, 0.35)',
    secondary: '#F59E0B',
    accent: '#8B5CF6',
    gold: '#F59E0B',

    text: '#FFF1F2',
    textSecondary: '#FDA4AF',
    textMuted: '#9F1239',

    border: 'rgba(255, 255, 255, 0.12)',
    borderActive: 'rgba(244, 63, 94, 0.6)',

    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    statusBar: 'light',
    previewColor: '#F43F5E',
  },
};

const THEME_STORAGE_KEY = '@storyveil_theme_key';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await getStoredTheme(THEME_STORAGE_KEY);
      if (savedTheme && THEME_PALETTES[savedTheme]) {
        setThemeKey(savedTheme);
      }
    } catch (e) {
      console.warn('[ThemeContext] Error loading theme:', e.message);
    } finally {
      setIsLoaded(true);
    }
  };

  const changeTheme = async (newKey) => {
    if (!THEME_PALETTES[newKey]) return;
    try {
      setThemeKey(newKey);
      await setStoredTheme(THEME_STORAGE_KEY, newKey);
    } catch (e) {
      console.warn('[ThemeContext] Error saving theme:', e.message);
    }
  };

  const currentPalette = THEME_PALETTES[themeKey] || THEME_PALETTES.dark;

  return (
    <ThemeContext.Provider
      value={{
        themeKey,
        theme: currentPalette,
        colors: currentPalette,
        setTheme: changeTheme,
        isDark: themeKey !== 'light',
        THEME_OPTIONS: Object.values(THEME_PALETTES),
        isLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
