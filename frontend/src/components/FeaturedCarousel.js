import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, METRICS, SHADOWS } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - METRICS.paddingMedium * 2;

export default function FeaturedCarousel({ stories = [], onReadNow }) {
  if (!stories.length) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map((story) => (
          <View key={story._id} style={styles.slide}>
            <Image source={{ uri: story.bannerImage || story.coverImage }} style={styles.bannerImage} />

            <View style={styles.overlayGradient}>
              <View style={styles.badgeRow}>
                <View style={styles.featuredBadge}>
                  <Ionicons name="sparkles" size={12} color={COLORS.gold} />
                  <Text style={styles.featuredText}>FEATURED WEBTOON</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={COLORS.gold} />
                  <Text style={styles.ratingValue}>{story.rating}</Text>
                </View>
              </View>

              <Text style={styles.title} numberOfLines={1}>
                {story.title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {story.description}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.readButton} onPress={() => onReadNow && onReadNow(story)}>
                  <Ionicons name="play" size={16} color="#FFF" />
                  <Text style={styles.readButtonText}>Read Chapter 1</Text>
                </TouchableOpacity>

                <View style={styles.genrePill}>
                  <Text style={styles.genrePillText}>{story.genres ? story.genres[0] : 'Action'}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: METRICS.paddingSmall,
  },
  scrollContent: {
    paddingHorizontal: METRICS.paddingMedium,
    gap: METRICS.paddingMedium,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: 220,
    borderRadius: METRICS.borderRadiusLg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.glow,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(9, 10, 16, 0.75)',
    padding: METRICS.paddingMedium,
    justifyContent: 'flex-end',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: METRICS.borderRadiusSm,
    ...SHADOWS.glow,
  },
  readButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  genrePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  genrePillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
