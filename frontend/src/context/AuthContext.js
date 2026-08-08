import React, { createContext, useState, useContext } from 'react';
import { MOCK_STORIES, authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    _id: 'usr-101',
    username: 'Melrow Gallardo',
    email: 'melrow@storyveil.app',
    avatar: null,

    stats: {
      chaptersRead: 84,
      readingTimeMinutes: 460,
      currentStreak: 7,
    },
  });

  const [token, setToken] = useState('demo-jwt-token-storyveil-2026');

  const [bookmarks, setBookmarks] = useState([
    {
      _id: 'bm-1',
      storyId: MOCK_STORIES[0],
      lastReadChapterNumber: 14,
      lastReadPageNumber: 2,
      progressPercentage: 45,
      isFavorite: true,
      status: 'Reading',
    },
    {
      _id: 'bm-2',
      storyId: MOCK_STORIES[3],
      lastReadChapterNumber: 32,
      lastReadPageNumber: 1,
      progressPercentage: 70,
      isFavorite: true,
      status: 'Reading',
    },
  ]);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data);
      setToken(data.token);
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
      return data;
    } catch (err) {
      // Fallback demo register if offline/standalone mode
      if (username && email && password.length >= 6) {
        const newUserData = {
          _id: `usr-${Date.now()}`,
          username: username,
          email: email,
          avatar: null,

          stats: { chaptersRead: 0, readingTimeMinutes: 0, currentStreak: 1 },
          token: `demo-jwt-${Date.now()}`,
        };
        setUser(newUserData);
        setToken(newUserData.token);
        return newUserData;
      }
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
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

  const isStoryBookmarked = (storyId) => {
    return bookmarks.some((b) => b.storyId._id === storyId && b.isFavorite);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        setUser,
        login,
        register,
        logout,
        bookmarks,
        toggleFavorite,
        updateProgress,
        isStoryBookmarked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
