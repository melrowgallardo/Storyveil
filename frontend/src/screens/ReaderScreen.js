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
import { storyService, mangadexService, MOCK_CHAPTER } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * WebtoonPanel component dynamically calculates the natural aspect ratio of webtoon panel images,
 * scaling width to match SCREEN_WIDTH seamlessly without gaps or distortion.
 */
function WebtoonPanel({ imageUrl, pageNumber }) {
  const [aspectRatio, setAspectRatio] = useState(1.4);

  useEffect(() => {
    if (imageUrl) {
      Image.getSize(
        imageUrl,
        (width, height) => {
          if (width > 0 && height > 0) {
            setAspectRatio(height / width);
          }
        },
        (err) => console.warn(`[Page ${pageNumber}] Aspect ratio calculation skipped:`, err.message)
      );
    }
  }, [imageUrl]);

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * aspectRatio,
        backgroundColor: '#050508',
      }}
      resizeMode="cover"
    />
  );
}

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
      if (storyId && String(storyId).startsWith('md-')) {
        const cleanMdId = String(storyId).replace('md-', '');
        const chapters = await mangadexService.getMangaChapters(cleanMdId);
        if (chapters && chapters.length > 0) {
          const firstChapter = chapters[0];
          const pageUrls = await mangadexService.getChapterPages(firstChapter.mangadexChapterId);
          if (pageUrls && pageUrls.length > 0) {
            setChapter({
              _id: firstChapter._id,
              storyTitle: title || 'MangaDex Title',
              chapterNumber: firstChapter.chapterNumber || 1,
              title: firstChapter.title || `Chapter ${firstChapter.chapterNumber || 1}`,
              pages: pageUrls,
            });
            return;
          }
        }
      }

      // Fetch from local backend API
      const data = await storyService.getChapter('chap-1');
      setChapter(data);
    } catch (err) {
      setChapter(MOCK_CHAPTER);
    } finally {
      setLoading(false);
    }
  };

  const rawPages = chapter?.pages || MOCK_CHAPTER.pages;

  // Normalize pages array into standard { pageNumber, imageUrl } objects
  const pages = rawPages.map((item, index) => {
    if (typeof item === 'string') {
      return { pageNumber: index + 1, imageUrl: item };
    }
    return {
      pageNumber: item.pageNumber || index + 1,
      imageUrl: item.imageUrl || item.url || item,
    };
  });

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const viewHeight = event.nativeEvent.layoutMeasurement.height;

    if (contentHeight > 0) {
      const pageRatio = (offsetY + viewHeight / 2) / contentHeight;
      const totalPages = pages.length || 5;
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
          /* Continuous Seamless Vertical Webtoon Reader */
          <ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.webtoonScroll}
          >
            {pages.map((page) => (
              <WebtoonPanel
                key={page.pageNumber}
                imageUrl={page.imageUrl}
                pageNumber={page.pageNumber}
              />
            ))}

            {/* End of Chapter Footer */}
            <View style={styles.endChapterCard}>
              <Text style={styles.endTitle}>You completed Chapter {chapter?.chapterNumber || 1}!</Text>
              <TouchableOpacity
                style={styles.nextChapterBtn}
                onPress={() => alert('Proceeding to Next Chapter...')}
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
    marginTop: 0,
    paddingBottom: 40,
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
