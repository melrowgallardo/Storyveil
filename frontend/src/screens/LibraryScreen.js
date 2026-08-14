import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, METRICS, SHADOWS } from '../styles/theme';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { getCoverImageUrl } from '../components/StoryCard';

const TABS = ['Reading', 'Favorites', 'Completed'];

export default function LibraryScreen({ navigation }) {
  const { bookmarks, toggleFavorite } = useAuth();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Reading');

  const filteredBookmarks = bookmarks.filter((item) => {
    if (activeTab === 'Favorites') return item.isFavorite;
    if (activeTab === 'Completed') return item.progressPercentage >= 100;
    return true;
  });

  const handleOpenReader = (item, story) => {
    if (!story) return;
    const rawId = story._id || story.id || story.mangaId || story.mangadexId || story.storyId;
    const sourceStr = story.source || (String(rawId).startsWith('asura-') ? 'AsuraScans' : (String(rawId).startsWith('md-') ? 'MangaDex' : 'local'));
    const chId = item.lastReadChapterId || item.lastReadChapterNumber || story.lastChapterId || 1;

    navigation.navigate('Reader', {
      id: rawId,
      mangaId: rawId,
      storyId: rawId,
      source: sourceStr,
      chapterId: chId,
      chapterNumber: item.lastReadChapterNumber || 1,
      title: story.title || 'Webtoon',
      story: story,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="MY LIBRARY" navigation={navigation} />

      {/* Tab Segment Selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                { backgroundColor: 'transparent' },
                active && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: colors.textSecondary }, active && { color: '#FFF', fontWeight: '800' }]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredBookmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Stories Saved Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Explore titles on the Home screen and bookmark your favorites!</Text>
          </View>
        ) : (
          filteredBookmarks.map((item) => {
            const story = item.storyId;
            const coverUrl = getCoverImageUrl(story);
            return (
              <TouchableOpacity
                key={item._id || story?._id}
                activeOpacity={0.88}
                style={styles.libraryCard}
                onPress={() => handleOpenReader(item, story)}
              >
                {coverUrl ? (
                  <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.coverImage, { backgroundColor: COLORS.surfaceLight || '#222', alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="image-outline" size={24} color={COLORS.textMuted} />
                  </View>
                )}

                <View style={styles.cardDetails}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.storyTitle} numberOfLines={1}>
                      {story?.title || 'Webtoon'}
                    </Text>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => toggleFavorite(story)}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.authorText}>{story?.author || 'Author'}</Text>

                  {/* Reading Progress Indicator */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.chapterProgress}>
                        Chapter {item.lastReadChapterNumber || 1} / {story?.totalChapters || 100}
                      </Text>
                      <Text style={styles.percentText}>{item.progressPercentage || 0}%</Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${item.progressPercentage || 0}%` }]} />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.continueBtn}
                    activeOpacity={0.8}
                    onPress={() => handleOpenReader(item, story)}
                  >
                    <Ionicons name="play" size={14} color="#FFF" />
                    <Text style={styles.continueBtnText}>Continue Chapter {item.lastReadChapterNumber || 1}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: METRICS.paddingMedium,
    marginVertical: METRICS.paddingMedium,
    borderRadius: METRICS.borderRadiusSm,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: METRICS.paddingMedium,
    paddingBottom: METRICS.paddingLarge,
    gap: METRICS.paddingMedium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  libraryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: METRICS.borderRadius,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.card,
  },
  coverImage: {
    width: 80,
    height: 115,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 6,
  },
  authorText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  progressSection: {
    marginVertical: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chapterProgress: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  percentText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
  continueBtnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
