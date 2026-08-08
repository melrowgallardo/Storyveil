import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, METRICS, SHADOWS } from '../styles/theme';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const TABS = ['Reading', 'Favorites', 'Completed'];

export default function LibraryScreen({ navigation }) {
  const { bookmarks, toggleFavorite } = useAuth();
  const [activeTab, setActiveTab] = useState('Reading');

  const filteredBookmarks = bookmarks.filter((item) => {
    if (activeTab === 'Favorites') return item.isFavorite;
    if (activeTab === 'Completed') return item.progressPercentage >= 100;
    return true;
  });

  return (
    <View style={styles.container}>
      <Header title="MY LIBRARY" />

      {/* Tab Segment Selector */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredBookmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Stories Saved Yet</Text>
            <Text style={styles.emptySubtitle}>Explore titles on the Home screen and bookmark your favorites!</Text>
          </View>
        ) : (
          filteredBookmarks.map((item) => {
            const story = item.storyId;
            return (
              <View key={item._id} style={styles.libraryCard}>
                <Image source={{ uri: story.coverImage }} style={styles.coverImage} />

                <View style={styles.cardDetails}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.storyTitle} numberOfLines={1}>
                      {story.title}
                    </Text>
                    <TouchableOpacity onPress={() => toggleFavorite(story)}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.authorText}>{story.author || 'Chugong'}</Text>

                  {/* Reading Progress Indicator */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.chapterProgress}>
                        Chapter {item.lastReadChapterNumber} / {story.totalChapters || 100}
                      </Text>
                      <Text style={styles.percentText}>{item.progressPercentage}%</Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${item.progressPercentage}%` }]} />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.continueBtn}
                    onPress={() => navigation.navigate('Reader', { storyId: story._id, title: story.title })}
                  >
                    <Ionicons name="play" size={14} color="#FFF" />
                    <Text style={styles.continueBtnText}>Continue Chapter {item.lastReadChapterNumber}</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
