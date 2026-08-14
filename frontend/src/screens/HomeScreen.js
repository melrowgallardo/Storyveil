import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { storyService, mangadexService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GENRES = ['All', 'Action', 'Fantasy', 'Romance', 'Martial Arts', 'Sci-Fi', 'System'];

const FORMATS = ['All', 'Manhwa', 'Manhua', 'Manga', 'Webtoon'];

const SORT_TYPES = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'trending', label: 'Trending', icon: 'flame' },
  { id: 'latest', label: 'Latest', icon: 'time-outline' },
  { id: 'most_read', label: 'Most Read', icon: 'eye-outline' },
];

export default function HomeScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();

  // Primary Feed State
  const [feedType, setFeedType] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [stories, setStories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Pagination & Loading States
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Main Data Loading Function
   * Fetches base dataset once per feedType/search and handles loading states safely.
   */
  const loadData = useCallback(
    async (isRefresh = false, pageNum = 1) => {
      try {
        if (isRefresh || pageNum === 1) {
          setLoading(true);
          setPage(1);
          setHasMore(true);
        } else {
          if (!hasMore || loadingMore) return;
          setLoadingMore(true);
        }

        let fetchedList = [];
        let featuredList = [];
        const limit = 30;

        if (searchQuery && searchQuery.trim().length >= 1) {
          fetchedList = await mangadexService.searchManga(searchQuery, limit).catch(() => []);
          featuredList = fetchedList.slice(0, 5);
        } else if (feedType === 'all') {
          const [liveTrending, localStories] = await Promise.all([
            mangadexService.getTrendingManga(limit).catch(() => []),
            storyService.getStories({ limit: 50 }).catch(() => []),
          ]);

          const combined = [...(localStories || []), ...(liveTrending || [])];
          const uniqueMap = new Map();
          combined.forEach((s) => {
            if (s) {
              const key = String(s.title || s._id || s.id).toLowerCase().trim();
              if (!uniqueMap.has(key)) uniqueMap.set(key, s);
            }
          });

          fetchedList = Array.from(uniqueMap.values());
          featuredList = liveTrending && liveTrending.length > 0 ? liveTrending.slice(0, 5) : fetchedList.slice(0, 5);
        } else if (feedType === 'trending') {
          const liveTrending = await mangadexService.getTrendingManga(limit).catch(() => []);
          if (liveTrending && liveTrending.length > 0) {
            fetchedList = liveTrending;
            featuredList = liveTrending.slice(0, 5);
          } else {
            fetchedList = await storyService.getStories({ limit: 50 }).catch(() => []);
            featuredList = await storyService.getFeaturedStories().catch(() => []);
          }
        } else if (feedType === 'latest') {
          const liveTrending = await mangadexService.getTrendingManga(limit).catch(() => []);
          if (liveTrending && liveTrending.length > 0) {
            fetchedList = [...liveTrending].reverse();
            featuredList = fetchedList.slice(0, 5);
          } else {
            const local = await storyService.getStories({ limit: 50 }).catch(() => []);
            fetchedList = [...local].reverse();
            featuredList = fetchedList.slice(0, 5);
          }
        } else if (feedType === 'most_read') {
          const liveTrending = await mangadexService.getTrendingManga(limit).catch(() => []);
          if (liveTrending && liveTrending.length > 0) {
            fetchedList = [...liveTrending].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            featuredList = fetchedList.slice(0, 5);
          } else {
            const local = await storyService.getStories({ limit: 50 }).catch(() => []);
            fetchedList = [...local].sort((a, b) => (b.views || 0) - (a.views || 0));
            featuredList = fetchedList.slice(0, 5);
          }
        }

        if (fetchedList.length === 0) {
          fetchedList = MOCK_STORIES;
          if (featuredList.length === 0) {
            featuredList = MOCK_STORIES.slice(0, 5);
          }
        }

        if (isRefresh || pageNum === 1) {
          setStories(fetchedList);
        } else {
          setStories((prev) => {
            const combined = [...prev, ...fetchedList];
            const uniqueMap = new Map();
            combined.forEach((s) => {
              if (s) {
                const key = String(s.title || s._id || s.id).toLowerCase().trim();
                if (!uniqueMap.has(key)) uniqueMap.set(key, s);
              }
            });
            return Array.from(uniqueMap.values());
          });
        }

        if (featuredList.length > 0) {
          setFeatured(featuredList);
        }

        setHasMore(fetchedList.length >= limit);
      } catch (err) {
        console.error('[HomeScreen] Error fetching stories:', err);
      } finally {
        // Guaranteed loading state reset
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [feedType, searchQuery, hasMore, loadingMore]
  );

  useEffect(() => {
    loadData(true, 1);
  }, [feedType, searchQuery]);

  // Tab Filtering Logic: Fast Client-Side Selection Handlers
  const handleFeedTypeChange = (typeId) => {
    if (feedType === typeId) return;
    setFeedType(typeId);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
  };

  const handleFormatChange = (format) => {
    setSelectedFormat(format);
  };

  const handleResetFilters = () => {
    setFeedType('all');
    setSelectedGenre('All');
    setSelectedFormat('All');
    setSearchQuery('');
    setLoading(false);
    setLoadingMore(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true, 1);
  };

  // Smooth Infinite Scrolling Handler (Disabled when list is empty)
  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore && !searchQuery && filteredStories.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(false, nextPage);
    }
  };

  const handleStoryPress = (item) => {
    try {
      if (!item) {
        console.error('[HomeScreen] handleStoryPress called with empty item.');
        return;
      }

      const itemId = item.id || item._id || item.mangaId || item.mangadexId || item.asuraId || item.storyId;
      if (!itemId) {
        console.error('[HomeScreen] Error: Selected item is missing a unique ID:', item);
        alert('Cannot open story: Missing item ID.');
        return;
      }

      let rawIdStr = String(itemId);
      let source = item.source || 'MangaDex';

      if (rawIdStr.startsWith('asura-') || String(item.source).toLowerCase() === 'asurascans') {
        source = 'AsuraScans';
      } else if (rawIdStr.startsWith('md-') || item.mangadexId || String(item.source).toLowerCase() === 'mangadex') {
        source = 'MangaDex';
        if (!rawIdStr.startsWith('md-') && !rawIdStr.startsWith('story-')) {
          rawIdStr = `md-${rawIdStr}`;
        }
      }

      console.log(`[HomeScreen] Navigating to Reader with ID "${rawIdStr}", source "${source}", title "${item.title}"`);

      navigation.navigate('Reader', {
        id: rawIdStr,
        mangaId: rawIdStr,
        storyId: rawIdStr,
        source: source,
        title: item.title || 'Webtoon',
        story: item,
      });
    } catch (error) {
      console.error('[HomeScreen] Navigation error in handleStoryPress:', error);
      alert(`Navigation Error: ${error.message || 'Failed to navigate to Reader'}`);
    }
  };

  // Fast Client-Side Array Filtering based on active format, genre pill, and search query
  const filteredStories = stories.filter((s) => {
    // 1. Format Filter (All, Manhwa, Manhua, Manga, Webtoon)
    if (selectedFormat && selectedFormat !== 'All') {
      const fmtTarget = selectedFormat.toLowerCase();
      const typeStr = String(s.type || s.format || '').toLowerCase();
      const genreMatchFmt = s.genres && s.genres.some((g) => String(g).toLowerCase() === fmtTarget);
      const tagMatchFmt = s.tags && s.tags.some((t) => String(t).toLowerCase() === fmtTarget);

      const matchesFormat = typeStr.includes(fmtTarget) || genreMatchFmt || tagMatchFmt;
      if (!matchesFormat) return false;
    }

    // 2. Genre Filter (All, Action, Fantasy, Romance, Martial Arts, Sci-Fi, System)
    if (selectedGenre && selectedGenre !== 'All') {
      const target = selectedGenre.toLowerCase();
      const genreMatch = s.genres && s.genres.some((g) => String(g).toLowerCase().includes(target));
      const tagMatch = s.tags && s.tags.some((t) => String(t).toLowerCase().includes(target));
      const typeMatch = s.type && String(s.type).toLowerCase().includes(target);
      const titleMatch = s.title && String(s.title).toLowerCase().includes(target);
      const descMatch = s.description && String(s.description).toLowerCase().includes(target);

      const matchesGenre = genreMatch || tagMatch || typeMatch || titleMatch || descMatch;
      if (!matchesGenre) return false;
    }

    // 3. Search Query Filter
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = s.title && s.title.toLowerCase().includes(query);
      const descMatch = s.description && s.description.toLowerCase().includes(query);
      return titleMatch || descMatch;
    }

    return true;
  });

  const getSectionTitle = () => {
    if (searchQuery) return 'Search Results';
    const formatText = selectedFormat === 'All' ? '' : `${selectedFormat} `;
    const genreText = selectedGenre === 'All' ? '' : `${selectedGenre} `;
    const prefix = `${formatText}${genreText}`.trim();
    const prefixStr = prefix ? `${prefix} ` : '';

    if (feedType === 'all') return `${prefixStr}All Webtoons & Manga`;
    if (feedType === 'trending') return `${prefixStr}Trending Titles`;
    if (feedType === 'latest') return `${prefixStr}Latest Releases`;
    if (feedType === 'most_read') return `${prefixStr}Most Read Titles`;
    return `${prefixStr}Webtoons`;
  };

  // Header Sub-Component for FlatList
  const renderHeader = () => (
    <>
      {/* Expandable Search Input */}
      {showSearch && (
        <View style={[styles.searchBarContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search manga, webtoons, authors..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Featured Hero Banner */}
      {!searchQuery && <FeaturedCarousel stories={featured} onReadNow={handleStoryPress} />}

      {/* Primary Feed / Sort Type Selector Row */}
      <View style={styles.sortSection}>
        <FlatList
          horizontal
          data={SORT_TYPES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
          renderItem={({ item: type }) => {
            const active = feedType === type.id;
            return (
              <TouchableOpacity
                style={[
                  styles.sortPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  active && { backgroundColor: colors.primary, borderColor: colors.primaryGlow },
                ]}
                onPress={() => handleFeedTypeChange(type.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={type.icon}
                  size={14}
                  color={active ? '#FFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.sortText,
                    { color: colors.textSecondary },
                    active && { color: '#FFF', fontWeight: '800' },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Format Selector Row (All, Manhwa, Manhua, Manga, Webtoon) */}
      <View style={styles.formatSection}>
        <FlatList
          horizontal
          data={FORMATS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreScroll}
          renderItem={({ item: format }) => {
            const active = selectedFormat === format;
            return (
              <TouchableOpacity
                style={[
                  styles.formatPill,
                  { backgroundColor: colors.surface },
                  active && { backgroundColor: COLORS.secondary, borderColor: colors.primaryGlow },
                ]}
                onPress={() => handleFormatChange(format)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.formatText,
                    { color: colors.textSecondary },
                    active && { color: '#FFF', fontWeight: '800' },
                  ]}
                >
                  {format}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Secondary Genre Selector Row */}
      <View style={styles.genreSection}>
        <FlatList
          horizontal
          data={GENRES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreScroll}
          renderItem={({ item: genre }) => {
            const active = selectedGenre === genre;
            return (
              <TouchableOpacity
                style={[
                  styles.genrePill,
                  { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                  active && { backgroundColor: colors.primary, borderColor: colors.primaryGlow },
                ]}
                onPress={() => handleGenreChange(genre)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.genreText,
                    { color: colors.textSecondary },
                    active && { color: '#FFF', fontWeight: '800' },
                  ]}
                >
                  {genre}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="flame" size={18} color={COLORS.accent} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{getSectionTitle()}</Text>
        </View>
        <Text style={[styles.countText, { color: colors.textMuted }]}>{filteredStories.length} titles</Text>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="STORYVEIL"
        navigation={navigation}
        onSearchPress={() => setShowSearch(!showSearch)}
        onNotificationPress={() => alert('No new notifications')}
        onQrPress={() => navigation.navigate('QRScanner')}
        onAvatarPress={() => navigation.navigate(isAuthenticated ? 'ProfileTab' : 'Auth')}
      />

      {/* Optimized FlatList Grid Renderer */}
      {loading && !refreshing && stories.length === 0 ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        </View>
      ) : (
        <FlatList
          data={filteredStories}
          renderItem={({ item }) => (
            <StoryCard story={item} onPress={handleStoryPress} />
          )}
          keyExtractor={(item, index) => item._id || item.id || `story-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="filter-outline" size={44} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Titles Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                No titles match your selected filters (
                {selectedFormat !== 'All' ? selectedFormat : ''}{' '}
                {selectedGenre !== 'All' ? selectedGenre : ''}).
              </Text>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: colors.primary }]}
                onPress={handleResetFilters}
              >
                <Ionicons name="refresh-outline" size={16} color="#FFF" />
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            loadingMore && filteredStories.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={{ height: METRICS.paddingLarge }} />
            )
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={true}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
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
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: METRICS.paddingMedium,
  },
  loadingContainer: {
    flex: 1,
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
  sortSection: {
    marginTop: METRICS.paddingSmall,
    marginBottom: 2,
  },
  sortScroll: {
    paddingHorizontal: METRICS.paddingMedium,
    gap: 8,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  formatSection: {
    marginVertical: 4,
  },
  formatPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
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
  genreText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
