import React, { createContext, useState, useEffect, useContext } from 'react';
import { MOCK_STORIES, authService } from '../services/api';

const AuthContext = createContext();

const STORAGE_KEYS = {
  USER: '@storyveil_user',
  TOKEN: '@storyveil_token',
};

// Safe storage utility supporting React Native Web / Browser localStorage
const getStoredItem = async (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    console.warn('[Storage] Error reading key:', key, e);
  }
  return null;
};

const setStoredItem = async (key, val) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (val === null || val === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
      }
    }
  } catch (e) {
    console.warn('[Storage] Error writing key:', key, e);
  }
};

const removeStoredItem = async (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('[Storage] Error deleting key:', key, e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [bookmarks, setBookmarks] = useState([]);

  // Check saved session on mount; auto log out if no account login exists or session is invalid
  useEffect(() => {
    const initSession = async () => {
      try {
        const storedToken = await getStoredItem(STORAGE_KEYS.TOKEN);
        const storedUserRaw = await getStoredItem(STORAGE_KEYS.USER);

        if (storedToken && storedUserRaw) {
          const parsedUser = JSON.parse(storedUserRaw);
          try {
            // Attempt backend validation if API server is available
            const freshUser = await authService.getMe(storedToken);
            setUser(freshUser);
            setToken(storedToken);
            await setStoredItem(STORAGE_KEYS.USER, freshUser);
          } catch (apiErr) {
            // Auto log out if token is invalid or expired
            if (apiErr.message?.includes('expired') || apiErr.message?.includes('authorized')) {
              await logout();
            } else {
              // Standalone / offline mode with existing session
              setUser(parsedUser);
              setToken(storedToken);
            }
          }
        } else {
          // No account logged in -> auto log out state
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoadingSession(false);
      }
    };

    initSession();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data);
      setToken(data.token);
      await setStoredItem(STORAGE_KEYS.USER, data);
      await setStoredItem(STORAGE_KEYS.TOKEN, data.token);
      return data;
    } catch (err) {
      // Fallback demo login if offline/standalone mode
      if (email.includes('@') && password.length >= 6) {
        const demoUserData = {
          _id: `usr-${Date.now()}`,
          username: email.split('@')[0],
          email: email,
          avatar: null,
          stats: { chaptersRead: 12, readingTimeMinutes: 90, currentStreak: 1 },
          token: `demo-jwt-${Date.now()}`,
        };
        setUser(demoUserData);
        setToken(demoUserData.token);
        await setStoredItem(STORAGE_KEYS.USER, demoUserData);
        await setStoredItem(STORAGE_KEYS.TOKEN, demoUserData.token);
        return demoUserData;
      }
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      const data = await authService.register(username, email, password);
      setUser(data);
      setToken(data.token);
      await setStoredItem(STORAGE_KEYS.USER, data);
      await setStoredItem(STORAGE_KEYS.TOKEN, data.token);
      return data;
    } catch (err) {
      // Fallback demo register if offline/standalone mode
      if (username && email && password.length >= 6) {
        const randomAvatars = [
          'preset:robot',
          'https://cdn-icons-png.flaticon.com/512/4712/4712094.png',
          'https://cdn-icons-png.flaticon.com/512/616/616408.png',
          'https://cdn-icons-png.flaticon.com/512/616/616430.png',
          'https://cdn-icons-png.flaticon.com/512/616/616412.png',
          'https://cdn-icons-png.flaticon.com/512/616/616405.png',
          'https://cdn-icons-png.flaticon.com/512/616/616429.png',
        ];
        const assignedAvatar = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

        const newUserData = {
          _id: `usr-${Date.now()}`,
          username: username,
          email: email,
          avatar: assignedAvatar,
          stats: { chaptersRead: 0, readingTimeMinutes: 0, currentStreak: 1 },
          token: `demo-jwt-${Date.now()}`,
        };
        setUser(newUserData);
        setToken(newUserData.token);
        await setStoredItem(STORAGE_KEYS.USER, newUserData);
        await setStoredItem(STORAGE_KEYS.TOKEN, newUserData.token);
        return newUserData;
      }
      throw err;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await removeStoredItem(STORAGE_KEYS.USER);
    await removeStoredItem(STORAGE_KEYS.TOKEN);
  };

  const toggleFavorite = (story) => {
    setBookmarks((prev) => {
      const existing = prev.find((b) => b.storyId._id === story._id);
      if (existing) {
        return prev.filter((b) => b.storyId._id !== story._id);
      } else {
        return [
          ...prev,
          {
            _id: `bm-${Date.now()}`,
            storyId: story,
            lastReadChapterNumber: 1,
            lastReadPageNumber: 1,
            progressPercentage: 5,
            isFavorite: true,
            status: 'Reading',
          },
        ];
      }
    });
  };

  const updateProgress = (storyId, chapterNumber, pageNumber) => {
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.storyId._id === storyId) {
          const total = b.storyId.totalChapters || 100;
          return {
            ...b,
            lastReadChapterNumber: chapterNumber,
            lastReadPageNumber: pageNumber,
            progressPercentage: Math.min(100, Math.round((chapterNumber / total) * 100)),
          };
        }
        return b;
      })
    );

    if (user) {
      setUser((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          chaptersRead: (prev?.stats?.chaptersRead || 0) + 1,
          readingTimeMinutes: (prev?.stats?.readingTimeMinutes || 0) + 8,
        },
      }));
    }
  };

  const updateUserAvatar = async (newAvatarUrl) => {
    try {
      if (token && !token.startsWith('demo-jwt-')) {
        const updatedUser = await authService.updateProfile(token, { avatar: newAvatarUrl });
        setUser((prev) => ({ ...prev, ...updatedUser }));
        await setStoredItem(STORAGE_KEYS.USER, { ...user, ...updatedUser });
        return updatedUser;
      }
    } catch (e) {
      console.warn('[AuthContext] Update profile API failed, updating locally:', e.message);
    }
    // Local / Offline fallback update
    const updated = { ...(user || { username: 'Reader' }), avatar: newAvatarUrl };
    setUser(updated);
    await setStoredItem(STORAGE_KEYS.USER, updated);
    return updated;
  };

  const isStoryBookmarked = (storyId) => {
    return bookmarks.some((b) => b.storyId._id === storyId && b.isFavorite);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoadingSession,
        setUser,
        login,
        register,
        logout,
        bookmarks,
        toggleFavorite,
        updateProgress,
        updateUserAvatar,
        isStoryBookmarked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

