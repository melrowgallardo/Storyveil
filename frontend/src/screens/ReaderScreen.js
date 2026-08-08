import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { COLORS, METRICS } from '../styles/theme';
import ReaderControls from '../components/ReaderControls';
import { storyService, MOCK_CHAPTER } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReaderScreen({ route, navigation }) {
  const { storyId, title } = route.params || { storyId: 'story-1', title: 'Shadow Monarch: Rebirth' };
  const { updateProgress, isStoryBookmarked, toggleFavorite } = useAuth();

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [readerMode, setReaderMode] = useState('webtoon'); // 'webtoon' | 'paged'
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchChapterData();
  }, [storyId]);

  const fetchChapterData = async () => {
    try {
      setLoading(true);
      const data = await storyService.getChapter('chap-1');
      setChapter(data);
    } catch (err) {
      setChapter(MOCK_CHAPTER);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const viewHeight = event.nativeEvent.layoutMeasurement.height;

    if (contentHeight > 0) {
      const pageRatio = (offsetY + viewHeight / 2) / contentHeight;
      const totalPages = chapter?.pages?.length || 5;
      const calculatedPage = Math.max(1, Math.min(totalPages, Math.ceil(pageRatio * totalPages)));
      if (calculatedPage !== currentPage) {
        setCurrentPage(calculatedPage);
        updateProgress(storyId, chapter?.chapterNumber || 1, calculatedPage);
      }
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Opening Veil of Mystery...</Text>
      </View>
    );
  }

  const pages = chapter?.pages || MOCK_CHAPTER.pages;
  const isBookmarked = isStoryBookmarked(storyId);

  return (
    <View style={styles.container}>
      {/* Interactive Reader Controls Overlay */}
      {showControls && (
        <ReaderControls
          chapterTitle={chapter?.title || `Chapter ${chapter?.chapterNumber || 1}`}
          currentPage={currentPage}
          totalPages={pages.length}
          readerMode={readerMode}
          isBookmarked={isBookmarked}
          onBack={() => navigation.goBack()}
          onToggleBookmark={() => toggleFavorite({ _id: storyId, title })}
          onToggleMode={() => setReaderMode(readerMode === 'webtoon' ? 'paged' : 'webtoon')}
          onPrevChapter={() => alert('Viewing Chapter 1 (First Chapter)')}
          onNextChapter={() => alert('Next chapter unlocked!')}
        />
      )}

      <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={toggleControls}>
        {readerMode === 'webtoon' ? (
          /* Continuous Vertical Webtoon Reader */
          <ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.webtoonScroll}
          >
            {pages.map((page) => (
              <Image
                key={page.pageNumber}
                source={{ uri: page.imageUrl }}
                style={styles.webtoonImage}
                resizeMode="contain"
              />
            ))}

            {/* End of Chapter Footer */}
            <View style={styles.endChapterCard}>
              <Text style={styles.endTitle}>You completed Chapter {chapter?.chapterNumber || 1}!</Text>
              <TouchableOpacity
                style={styles.nextChapterBtn}
                onPress={() => alert('Proceeding to Chapter 2...')}
              >
                <Text style={styles.nextChapterBtnText}>Read Next Chapter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          /* Horizontal Paged Manga Reader */
          <FlatList
            data={pages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.pageNumber.toString()}
            onMomentumScrollEnd={(e) => {
              const p = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH) + 1;
              setCurrentPage(p);
              updateProgress(storyId, chapter?.chapterNumber || 1, p);
            }}
            renderItem={({ item }) => (
              <View style={styles.pagedSlide}>
                <Image source={{ uri: item.imageUrl }} style={styles.pagedImage} resizeMode="contain" />
              </View>
            )}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  webtoonScroll: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  webtoonImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.5,
    backgroundColor: '#111',
  },
  pagedSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagedImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  endChapterCard: {
    width: SCREEN_WIDTH,
    padding: METRICS.paddingLarge,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    marginVertical: 20,
  },
  endTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  nextChapterBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: METRICS.borderRadiusSm,
  },
  nextChapterBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
