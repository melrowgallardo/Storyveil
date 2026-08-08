import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, METRICS } from '../styles/theme';
import Header from '../components/Header';
import FeaturedCarousel from '../components/FeaturedCarousel';
import StoryCard from '../components/StoryCard';
import { storyService } from '../services/api';

const GENRES = ['All', 'Action', 'Fantasy', 'Romance', 'Martial Arts', 'Sci-Fi', 'System'];

export default function HomeScreen({ navigation }) {
  const [stories, setStories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storyList, featuredList] = await Promise.all([
        storyService.getStories({ genre: selectedGenre, search: searchQuery }),
        storyService.getFeaturedStories(),
      ]);
      setStories(storyList);
      setFeatured(featuredList);
    } catch (err) {
      console.error('[Home] Error fetching stories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGenre, searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStoryPress = (story) => {
    navigation.navigate('Reader', { storyId: story._id, title: story.title });
  };

  return (
    <View style={styles.container}>
      <Header
        title="STORYVEIL"
        onSearchPress={() => setShowSearch(!showSearch)}
        onNotificationPress={() => alert('No new notifications')}
      />

      {/* Expandable Search Input */}
      {showSearch && (
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search manga, webtoons, authors..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Hero Banner */}
        {!searchQuery && <FeaturedCarousel stories={featured} onReadNow={handleStoryPress} />}

        {/* Genre Pill Selector */}
        <View style={styles.genreSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreScroll}>
            {GENRES.map((genre) => {
              const active = selectedGenre === genre;
              return (
                <TouchableOpacity
                  key={genre}
                  style={[styles.genrePill, active && styles.genrePillActive]}
                  onPress={() => setSelectedGenre(genre)}
                >
                  <Text style={[styles.genreText, active && styles.genreTextActive]}>{genre}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <Ionicons name="flame" size={18} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : selectedGenre === 'All' ? 'Trending Webtoons' : `${selectedGenre} Titles`}
            </Text>
          </View>
          <Text style={styles.countText}>{stories.length} titles</Text>
        </View>

        {/* Story Grid */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} onPress={handleStoryPress} />
            ))}
          </View>
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
  scrollContent: {
    paddingBottom: METRICS.paddingLarge,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: METRICS.paddingMedium,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: METRICS.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  genreSection: {
    marginVertical: METRICS.paddingSmall,
  },
  genreScroll: {
    paddingHorizontal: METRICS.paddingMedium,
    gap: 8,
  },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  genrePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryGlow,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  genreTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: METRICS.paddingMedium,
    marginVertical: METRICS.paddingMedium,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  countText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: METRICS.paddingMedium,
  },
});
