import React, { useState, useEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS, METRICS, SHADOWS } from '../styles/theme';
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

  const scrollViewRef = useRef(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [readerMode, setReaderMode] = useState('webtoon'); // 'webtoon' | 'paged'
  const [currentPage, setCurrentPage] = useState(1);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    fetchChapterData();
  }, [storyId]);

  // Clean up voice speech on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const toggleVoiceNarration = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const narrationText = `Now reading ${title || 'Storyveil Manga'}. ${chapter?.title || `Chapter ${chapter?.chapterNumber || 1}`}. You are currently on page ${currentPage} of ${pages.length}.`;
      Speech.speak(narrationText, {
        pitch: 1.0,
        rate: 0.95,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Auto-scroll loop
  useEffect(() => {
    let timer = null;
    if (isAutoScrolling) {
      timer = setInterval(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: currentScrollY + 4,
            animated: false,
          });
          setCurrentScrollY((prev) => prev + 4);
        }
      }, 30);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoScrolling, currentScrollY]);


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
    setCurrentScrollY(offsetY);

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

  const handleScrollDownPress = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: currentScrollY + SCREEN_HEIGHT * 0.75,
        animated: true,
      });
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
          isSpeaking={isSpeaking}
          onToggleVoice={toggleVoiceNarration}
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
            ref={scrollViewRef}
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

      {/* Floating Scroll Down, Auto-Scroll, & Read Aloud Action Buttons */}
      {readerMode === 'webtoon' && (
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={[styles.floatingBtn, isSpeaking && styles.voiceActiveFloatingBtn]}
            onPress={toggleVoiceNarration}
            activeOpacity={0.8}
          >
            <Ionicons name={isSpeaking ? 'volume-high' : 'volume-medium'} size={18} color="#FFF" />
            <Text style={styles.floatingBtnText}>{isSpeaking ? 'Pause' : 'Read Aloud'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.floatingBtn} onPress={handleScrollDownPress} activeOpacity={0.8}>
            <Ionicons name="chevron-down-circle" size={18} color="#FFF" />
            <Text style={styles.floatingBtnText}>Scroll Down</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingBtn, isAutoScrolling && styles.autoScrollActive]}
            onPress={() => setIsAutoScrolling(!isAutoScrolling)}
            activeOpacity={0.8}
          >
            <Ionicons name={isAutoScrolling ? 'pause-circle' : 'play-circle'} size={18} color="#FFF" />
            <Text style={styles.floatingBtnText}>{isAutoScrolling ? 'Pause' : 'Auto'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
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
    paddingBottom: 50,
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
  floatingControls: {
    position: 'absolute',
    bottom: 30,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
  },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 18, 30, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...SHADOWS.glow,
  },
  autoScrollActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryGlow,
  },
  voiceActiveFloatingBtn: {
    backgroundColor: COLORS.accent,
    borderColor: 'rgba(236, 72, 153, 0.6)',
  },
  floatingBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

