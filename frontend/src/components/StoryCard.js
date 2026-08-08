import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, METRICS, SHADOWS } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - METRICS.paddingMedium * 3) / 2;

export default function StoryCard({ story, onPress, width = CARD_WIDTH }) {
  const { toggleFavorite, isStoryBookmarked } = useAuth();
  const isBookmarked = isStoryBookmarked(story._id);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.container, { width }]}
      onPress={() => onPress && onPress(story)}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: story.coverImage }} style={styles.coverImage} resizeMode="cover" />

        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{story.type || 'Webtoon'}</Text>
        </View>

        {/* Favorite Icon */}
        <TouchableOpacity
          style={styles.favButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(story);
          }}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isBookmarked ? COLORS.primary : COLORS.text}
          />
        </TouchableOpacity>

        {/* Overlay Bottom Gradient Bar */}
        <View style={styles.overlayBar}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={13} color={COLORS.gold} />
            <Text style={styles.ratingText}>{story.rating || '4.8'}</Text>
          </View>

          <Text style={styles.chapterCount}>{story.totalChapters ? `${story.totalChapters} Ch.` : 'Ongoing'}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.title} numberOfLines={1}>
          {story.title}
        </Text>
        <Text style={styles.genreText} numberOfLines={1}>
          {story.genres ? story.genres.join(' • ') : 'Action • Fantasy'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: METRICS.paddingMedium,
  },
  imageWrapper: {
    height: 210,
    borderRadius: METRICS.borderRadius,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(9, 10, 16, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(9, 10, 16, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  overlayBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9, 10, 16, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  chapterCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  infoBox: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 18,
  },
  genreText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
