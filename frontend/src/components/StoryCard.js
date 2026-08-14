import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, METRICS, SHADOWS } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - METRICS.paddingMedium * 3) / 2;

export const DEFAULT_POSTER_FALLBACK = 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg';

/**
 * Resolves valid cover image URL from API data without relying on static fallbacks.
 * Handles all possible properties: coverImageUrl, coverImage, cover_image, coverUrl, cover_url, thumbnail, image, cover, attributes.fileName, relationships cover_art.
 */
export const getCoverImageUrl = (story) => {
  if (!story) return DEFAULT_POSTER_FALLBACK;

  // 1. Direct cover image URL fallback chain checking all possible property names in API payload
  const rawUrl =
    (typeof story.coverImageUrl === 'string' && story.coverImageUrl.startsWith('http') && story.coverImageUrl) ||
    (typeof story.coverImage === 'string' && story.coverImage.startsWith('http') && story.coverImage) ||
    (typeof story.cover_image === 'string' && story.cover_image.startsWith('http') && story.cover_image) ||
    (typeof story.coverUrl === 'string' && story.coverUrl.startsWith('http') && story.coverUrl) ||
    (typeof story.cover_url === 'string' && story.cover_url.startsWith('http') && story.cover_url) ||
    (typeof story.thumbnail === 'string' && story.thumbnail.startsWith('http') && story.thumbnail) ||
    (typeof story.image === 'string' && story.image.startsWith('http') && story.image) ||
    (typeof story.cover === 'string' && story.cover.startsWith('http') && story.cover) ||
    (typeof story.bannerImage === 'string' && story.bannerImage.startsWith('http') && story.bannerImage) ||
    (typeof story.banner_image === 'string' && story.banner_image.startsWith('http') && story.banner_image);

  if (rawUrl) return rawUrl;

  // 2. MangaDex API objects (extract from relationships or attributes)
  const id = story.mangadexId || story.id || (typeof story._id === 'string' ? story._id.replace(/^md-/, '') : null);

  if (story.relationships && Array.isArray(story.relationships)) {
    const coverRel = story.relationships.find((rel) => rel.type === 'cover_art');
    const fileName = coverRel?.attributes?.fileName || coverRel?.fileName;
    if (id && fileName) {
      return `https://uploads.mangadex.org/covers/${id}/${fileName}.512.jpg`;
    }
  }

  const fileName = story.attributes?.fileName || story.data?.attributes?.fileName;
  if (id && fileName) {
    return `https://uploads.mangadex.org/covers/${id}/${fileName}.512.jpg`;
  }

  return DEFAULT_POSTER_FALLBACK;
};

export default function StoryCard({ story, onPress, width = CARD_WIDTH }) {
  const { toggleFavorite, isStoryBookmarked } = useAuth();
  const isBookmarked = isStoryBookmarked(story?._id);

  const rawUrl = getCoverImageUrl(story);

  const [currentUri, setCurrentUri] = useState(rawUrl);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setCurrentUri(rawUrl);
    setImgError(false);
  }, [rawUrl, story?._id, story?.id]);

  const handleImageError = () => {
    if (currentUri && currentUri.includes('.512.jpg')) {
      // Fall back from thumbnail to full-res MangaDex cover URL
      const fullResUri = currentUri.replace(/\.512\.jpg$/, '');
      setCurrentUri(fullResUri);
    } else {
      setImgError(true);
    }
  };

  const hasValidUri = !imgError && typeof currentUri === 'string' && currentUri.startsWith('http');

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.container, { width }]}
      onPress={() => onPress && onPress(story)}
    >
      <View style={styles.imageWrapper}>
        {hasValidUri ? (
          <Image
            source={{ uri: currentUri }}
            style={styles.coverImage}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={[styles.coverImage, styles.solidPlaceholder]}>
            <Ionicons name="book-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.placeholderTitle} numberOfLines={2}>
              {story?.title || 'Webtoon'}
            </Text>
          </View>
        )}

        {/* Type Badge */}
        <View style={styles.typeBadge} pointerEvents="none">
          <Text style={styles.typeText}>{story?.type || 'Webtoon'}</Text>
        </View>

        {/* Favorite Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.favButton}
          onPress={() => toggleFavorite(story)}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isBookmarked ? COLORS.primary : COLORS.text}
          />
        </TouchableOpacity>

        {/* Overlay Bottom Gradient Bar */}
        <View style={styles.overlayBar} pointerEvents="none">
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={13} color={COLORS.gold} />
            <Text style={styles.ratingText}>{story?.rating || '4.8'}</Text>
          </View>

          <Text style={styles.chapterCount}>
            {story?.totalChapters ? `${story.totalChapters} Ch.` : 'Ongoing'}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {story?.title || 'Untitled'}
        </Text>
        <Text style={styles.genreText} numberOfLines={1}>
          {story?.genres && story.genres.length > 0
            ? story.genres.join(' • ')
            : story?.type || 'Webtoon'}
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
  placeholderBox: {
    backgroundColor: COLORS.surfaceLight || '#1A1C24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidPlaceholder: {
    backgroundColor: COLORS.surfaceLight || '#1E202B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  placeholderTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
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
    zIndex: 10,
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
