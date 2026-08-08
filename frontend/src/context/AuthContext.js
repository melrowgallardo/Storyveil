import React, { createContext, useState, useContext } from 'react';
import { MOCK_STORIES } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    _id: 'usr-101',
    username: 'Melrow Gallardo',
    email: 'melrow@storyveil.app',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    stats: {
      chaptersRead: 84,
      readingTimeMinutes: 460,
      currentStreak: 7,
    },
  });

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

    setUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        chaptersRead: prev.stats.chaptersRead + 1,
        readingTimeMinutes: prev.stats.readingTimeMinutes + 8,
      },
    }));
  };

  const isStoryBookmarked = (storyId) => {
    return bookmarks.some((b) => b.storyId._id === storyId && b.isFavorite);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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
