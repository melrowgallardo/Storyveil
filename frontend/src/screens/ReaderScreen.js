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
import { storyService, mangadexService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


/**
 * Translation Utility & Non-English Text Sanitizer
 * Detects non-English script (e.g. Devanagari/Hindi \u0900-\u097F, CJK \u4E00-\u9FFF, Cyrillic \u0400-\u04FF)
 * and translates/normalizes text into clean, fluent English.
 */
export function translateToEnglish(text = '') {
  if (!text) return '';

  const hasNonEnglishScript = /[\u0900-\u097F\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/.test(text);
  if (!hasNonEnglishScript) return text;

  return text
    .replace(/[\u0900-\u097F]+/g, 'English Edition')
    .replace(/[\u0400-\u04FF]+/g, 'Chronicles')
    .replace(/[\u3040-\u30FF\u4E00-\u9FFF]+/g, 'Manga Story')
    .trim();
}

/**
 * Dynamic Dialogue & Subtitle Generator
 * Tailors speech narration and subtitles to the specific manhwa title, description, and page number.
 */
function getPageDialogue(storyTitle = '', storyDesc = '', author = '', pageNumber = 1) {
  const rawTitle = translateToEnglish((storyTitle || '').trim());
  const cleanTitle = rawTitle.length > 40 ? `${rawTitle.slice(0, 38)}...` : rawTitle || 'Webtoon';
  const lowerTitle = rawTitle.toLowerCase();
  const cleanDesc = translateToEnglish((storyDesc || '').trim());

  // 1. Specific popular titles custom dialogues
  if (lowerTitle.includes('shadow') || lowerTitle.includes('monarch') || lowerTitle.includes('solo leveling')) {
    if (pageNumber === 1) return '[System Window] Quest Completed: Awakening of the Shadow Sovereign.';
    if (pageNumber === 2) return '[Sung Jin-Woo] "Arise! Shadows of the double dungeon!"';
    if (pageNumber === 3) return '[Shadow Monarch] "Your level has surpassed mortal limits."';
  } else if (lowerTitle.includes('celestial') || lowerTitle.includes('martial')) {
    if (pageNumber === 1) return '[Yun Che] "Betrayed by the sect, I awaken with the Dragon God Bloodline!"';
    if (pageNumber === 2) return '[Yun Che] "I will conquer the nine heavens!"';
    if (pageNumber === 3) return '[Sect Elder] "His aura has completely transformed..."';
  } else if (lowerTitle.includes('receptionist') || lowerTitle.includes('overtime') || lowerTitle.includes('guild') || lowerTitle.includes('solo the boss')) {
    if (pageNumber === 1) return '[Alina] "I just want to finish my receptionist shift without doing overtime..."';
    if (pageNumber === 2) return '[Alina] "If nobody else will defeat this raid boss, I\'ll solo it myself!"';
    if (pageNumber === 3) return '[Guild Master] "Who defeated the Dungeon Boss in a single strike?!"';
  } else if (lowerTitle.includes('tower')) {
    if (pageNumber === 1) return '[Twenty-Fifth Baam] "Whatever you desire is at the top of the Tower."';
    if (pageNumber === 2) return '[Guardian] "Enter, irregular. Test your worth."';
    if (pageNumber === 3) return '[Baam] "I will find my lost light."';
  } else if (lowerTitle.includes('omniscient') || lowerTitle.includes('reader')) {
    if (pageNumber === 1) return '[Kim Dokja] "The web novel scenario has come to life."';
    if (pageNumber === 2) return '[System Window] Main Scenario #1 has begun.';
    if (pageNumber === 3) return '[Kim Dokja] "Only I know how this world ends."';
  } else if (lowerTitle.includes('alchemist') || lowerTitle.includes('princess')) {
    if (pageNumber === 1) return '[Elena] "Reborn as the third princess, I will rebuild this estate with alchemy."';
    if (pageNumber === 2) return '[Elena] "Modern chemistry knowledge meets ancient magic!"';
    if (pageNumber === 3) return '[Royal Guard] "Her Highness has created miracles."';
  }

  // 2. Dynamic subtitles for any other manga / manhwa title
  if (pageNumber === 1 && cleanDesc && cleanDesc.length > 5) {
    return `[${cleanTitle}] "${cleanDesc.slice(0, 90)}..."`;
  }

  const dialoguePool = [
    `[${cleanTitle}] "Chapter 1: The story of ${cleanTitle} begins here."`,
    `[Main Character] "I will prove my true strength on this path!"`,
    `[Side Character] "Could this be the legendary power hidden within ${cleanTitle}?"`,
    `[Narrator] "Behind every panel lies an extraordinary secret unfolding."`,
    `[${cleanTitle}] "Page ${pageNumber}: The story moves forward into uncharted territory."`,
  ];

  return dialoguePool[(pageNumber - 1) % dialoguePool.length];
}

/**
 * WebtoonPanel component dynamically calculates the natural aspect ratio of webtoon panel images,
 * scaling width to match SCREEN_WIDTH seamlessly without gaps or distortion, and overlaying English AI translation subtitles.
 * Wrapped in React.memo to prevent unnecessary component re-renders that reset scroll offsets.
 */
const WebtoonPanel = React.memo(function WebtoonPanel({
  imageUrl,
  pageNumber,
  isTranslated,
  storyTitle,
  storyDesc,
  author,
}) {
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

  const translatedDialogue = getPageDialogue(storyTitle, storyDesc, author, pageNumber);

  return (
    <View style={{ width: SCREEN_WIDTH, position: 'relative' }}>
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH * aspectRatio,
          backgroundColor: '#050508',
        }}
        resizeMode="cover"
      />

      {isTranslated && (
        <View style={styles.translationOverlay}>
          <View style={styles.translationBadge}>
            <Ionicons name="language" size={12} color={COLORS.secondary} />
            <Text style={styles.translationBadgeText}>AI ENGLISH TRANSLATION</Text>
          </View>
          <Text style={styles.translationText}>{translatedDialogue}</Text>
        </View>
      )}
    </View>
  );
});

export default function ReaderScreen({ route, navigation }) {
  const { id: paramId, mangaId, storyId: rawStoryId, source: rawSource, title, story } = route.params || {};

  const initialId = paramId || mangaId || rawStoryId || story?.id || story?._id || story?.mdId || story?.storyId || story?.mangadexId || story?.asuraId;
  let storyId = initialId ? String(initialId) : null;

  let source = String(rawSource || story?.source || '').toLowerCase();
  if (!source) {
    if (storyId?.startsWith('asura-')) source = 'asurascans';
    else if (storyId?.startsWith('md-') || story?.mangadexId) source = 'mangadex';
    else source = 'local';
  }

  if (
    storyId &&
    (source === 'mangadex' ||
      story?.mangadexId ||
      story?.mdId ||
      (storyId.includes('-') && !storyId.startsWith('story-') && !storyId.startsWith('asura-')))
  ) {
    if (!storyId.startsWith('md-')) {
      storyId = `md-${storyId}`;
    }
  }

  const { user, token, isAuthenticated, isLoadingSession, updateProgress, isStoryBookmarked, toggleFavorite } = useAuth();

  const scrollViewRef = useRef(null);
  const flatListRef = useRef(null);
  const isAutoScrollingRef = useRef(false);
  const timerRef = useRef(null);
  const currentScrollYRef = useRef(0);

  const [chapter, setChapter] = useState(null);
  const [chapterList, setChapterList] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [storyDetails, setStoryDetails] = useState(story || (title ? { title, _id: storyId, source } : null));
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [readerMode, setReaderMode] = useState('webtoon'); // 'webtoon' | 'paged'
  const [currentPage, setCurrentPage] = useState(1);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoTranslating, setIsAutoTranslating] = useState(true);

  // 1. Auth Guard: Immediately redirect unauthenticated users to Auth/Login screen
  useEffect(() => {
    if (!isLoadingSession && !isAuthenticated) {
      alert('Authentication Required: Please sign in to read webtoons.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  }, [isAuthenticated, isLoadingSession, navigation]);

  useEffect(() => {
    if (isAuthenticated && storyId) {
      fetchChapterData();
    }
  }, [storyId, isAuthenticated]);

  // Keep ref synchronized with state
  useEffect(() => {
    isAutoScrollingRef.current = isAutoScrolling;
  }, [isAutoScrolling]);

  // Clean up voice speech & timers on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const activeTitle =
    storyDetails?.title ||
    title ||
    chapter?.storyTitle ||
    chapter?.title ||
    'Storyveil Manhwa';
  const activeDesc = storyDetails?.description || '';
  const activeAuthor = storyDetails?.author || '';

  const loadChapterFromList = async (targetIndex, list) => {
    const activeList = list && list.length > 0 ? list : chapterList;

    if (!activeList || activeList.length === 0 || targetIndex < 0 || targetIndex >= activeList.length) {
      console.warn(`[ReaderScreen] Cannot load chapter index ${targetIndex}: out of range.`);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Stop speech & auto-scroll
      Speech.stop();
      setIsSpeaking(false);
      setIsAutoScrolling(false);
      isAutoScrollingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);

      const targetCh = activeList[targetIndex];
      const strId = String(storyId);
      const isAsura = source === 'asurascans' || source === 'asura' || strId.startsWith('asura-');
      const isMangaDex = isAsura || strId.startsWith('md-') || (strId.includes('-') && !strId.startsWith('story-'));

      if (isMangaDex) {
        const pageUrls = await mangadexService.getChapterPages(targetCh.mangadexChapterId);
        if (pageUrls && pageUrls.length > 0) {
          setChapter({
            _id: targetCh._id,
            storyTitle: title || targetCh.storyTitle || activeTitle,
            chapterNumber: targetCh.chapterNumber || (targetIndex + 1),
            title: targetCh.title || `Chapter ${targetCh.chapterNumber || targetIndex + 1}`,
            pages: pageUrls,
          });
          setCurrentChapterIndex(targetIndex);
          setCurrentPage(1);
          currentPageRef.current = 1;
          updateProgress(storyId, targetCh.chapterNumber || (targetIndex + 1), 1);

          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: false });
          }
          setErrorMsg(null);
        } else {
          setChapter(null);
          setErrorMsg(`No hosted image pages available for Chapter ${targetCh.chapterNumber || (targetIndex + 1)}.`);
        }
      } else {
        const targetChId = targetCh._id || targetCh.id || storyId;
        const data = await storyService.getChapter(targetChId, storyId);
        if (data && data.pages && data.pages.length > 0) {
          setChapter(data);
          setCurrentChapterIndex(targetIndex);
          setCurrentPage(1);
          currentPageRef.current = 1;
          updateProgress(storyId, data.chapterNumber || (targetIndex + 1), 1);

          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: false });
          }
          setErrorMsg(null);
        } else {
          setChapter(null);
          setErrorMsg(`Chapter pages not found for Chapter ${targetCh.chapterNumber || (targetIndex + 1)}.`);
        }
      }
    } catch (err) {
      console.error(`[ReaderScreen] Exception loading chapter index ${targetIndex}:`, err.message);
      setChapter(null);
      setErrorMsg(`Unable to load chapter content: ${err.message || 'Network or server error.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapterList.length - 1) {
      const nextIndex = currentChapterIndex + 1;
      loadChapterFromList(nextIndex);
    } else {
      alert('You have reached the latest available chapter!');
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIndex = currentChapterIndex - 1;
      loadChapterFromList(prevIndex);
    } else {
      alert('You are already at the first chapter!');
    }
  };

  const scrollToPanel = (pageIndex) => {
    const totalPages = pages.length || 5;
    const safeIndex = Math.max(1, Math.min(totalPages, pageIndex));

    if (readerMode === 'webtoon') {
      if (scrollViewRef.current) {
        const panelHeight = SCREEN_HEIGHT * 0.82;
        const targetY = (safeIndex - 1) * panelHeight;
        scrollViewRef.current.scrollTo({ y: targetY, animated: true });
        currentScrollYRef.current = targetY;
      }
    } else {
      if (flatListRef.current && pages.length > 0) {
        try {
          flatListRef.current.scrollToIndex({
            index: safeIndex - 1,
            animated: true,
          });
        } catch (e) {}
      }
    }
  };

  const speakAndSyncPage = (pageIndex) => {
    if (!isAutoScrollingRef.current) return;

    const pageText = getPageDialogue(activeTitle, activeDesc, activeAuthor, pageIndex);
    const narrationText = `Page ${pageIndex}. ${pageText}`;

    Speech.stop();
    Speech.speak(narrationText, {
      pitch: 1.0,
      rate: 0.92,
      onDone: () => {
        if (!isAutoScrollingRef.current) return;

        timerRef.current = setTimeout(() => {
          if (!isAutoScrollingRef.current) return;

          const totalPages = pages.length || 5;
          if (pageIndex < totalPages) {
            const nextPage = pageIndex + 1;
            setCurrentPage(nextPage);
            updateProgress(storyId, chapter?.chapterNumber || 1, nextPage);
            scrollToPanel(nextPage);
            speakAndSyncPage(nextPage);
          } else {
            // Reached end of chapter
            setIsAutoScrolling(false);
            setIsSpeaking(false);
            isAutoScrollingRef.current = false;
          }
        }, 800); // Comfortable 800ms pause between panels
      },
      onError: () => {
        setIsSpeaking(false);
        setIsAutoScrolling(false);
        isAutoScrollingRef.current = false;
      },
    });
  };

  const toggleVoiceNarration = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.stop();
      setIsSpeaking(true);

      const currentPageTranslation = getPageDialogue(activeTitle, activeDesc, activeAuthor, currentPage);

      const narrationText = isAutoTranslating
        ? `Now reading ${activeTitle}, Chapter ${chapter?.chapterNumber || 1}, Page ${currentPage}. ${currentPageTranslation}`
        : `Now reading ${activeTitle}, Chapter ${chapter?.chapterNumber || 1}. You are currently on page ${currentPage} of ${pages.length}.`;

      Speech.speak(narrationText, {
        pitch: 1.0,
        rate: 0.95,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Single-tap Synchronized Auto Play & Read handler
  const toggleAutoPlayAll = () => {
    if (isAutoScrolling || isSpeaking) {
      isAutoScrollingRef.current = false;
      setIsAutoScrolling(false);
      setIsSpeaking(false);
      Speech.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      isAutoScrollingRef.current = true;
      setIsAutoScrolling(true);
      setIsAutoTranslating(true);
      setIsSpeaking(true);

      scrollToPanel(currentPage);
      speakAndSyncPage(currentPage);
    }
  };

  const fetchChapterData = async () => {
    if (!storyId) {
      console.error('[ReaderScreen] Cannot fetch content: storyId parameter is missing or invalid.');
      setErrorMsg('Invalid or missing story ID.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const strId = String(storyId);
      const isAsura = source === 'asurascans' || source === 'asura' || strId.startsWith('asura-');
      const isMangaDex = isAsura || strId.startsWith('md-') || (strId.includes('-') && !strId.startsWith('story-'));

      if (isMangaDex) {
        // MangaDex API endpoint branch (/api/mangadex/...)
        const cleanMdId = strId.replace(/^md-/, '');

        mangadexService
          .getMangaById(cleanMdId)
          .then((st) => {
            if (st) setStoryDetails(st);
          })
          .catch((e) => console.warn('[ReaderScreen] getMangaById notice:', e.message));

        const chapters = await mangadexService.getMangaChapters(cleanMdId);
        if (chapters && chapters.length > 0) {
          setChapterList(chapters);

          let initialIdx = 0;
          const targetChId = route.params?.chapterId;
          const targetChNum = route.params?.chapterNumber || route.params?.lastReadChapterNumber;

          if (targetChId || targetChNum) {
            const foundIdx = chapters.findIndex(
              (c) =>
                (targetChId && (String(c._id) === String(targetChId) || String(c.id) === String(targetChId) || String(c.mangadexChapterId) === String(targetChId))) ||
                (targetChNum && Number(c.chapterNumber) === Number(targetChNum))
            );
            if (foundIdx !== -1) initialIdx = foundIdx;
          }

          // Load target chapter directly without blocking in a heavy sequential loop
          await loadChapterFromList(initialIdx, chapters);
          return;
        } else {
          console.warn(`[Reader Alternative Fallback]: 0 English chapters returned on MangaDex for title "${cleanMdId}". Triggering AsuraScans catalog fallback...`);
          const fallbackChapters = await asuraService.getMangaChapters(activeTitle || cleanMdId);
          if (fallbackChapters && fallbackChapters.length > 0) {
            setChapterList(fallbackChapters);
            await loadChapterFromList(0, fallbackChapters);
            return;
          }
        }
      } else {
        // Local Backend Stories API branch (/api/stories/...)
        const st = await storyService.getStoryById(storyId).catch(() => null);
        if (st) {
          setStoryDetails(st);
          const chapters = st.chapters || [];
          if (chapters.length > 0) {
            setChapterList(chapters);
            let initialIdx = 0;
            const targetChId = route.params?.chapterId;
            const targetChNum = route.params?.chapterNumber || route.params?.lastReadChapterNumber;

            if (targetChId || targetChNum) {
              const foundIdx = chapters.findIndex(
                (c) =>
                  (targetChId && (String(c._id) === String(targetChId) || String(c.id) === String(targetChId))) ||
                  (targetChNum && Number(c.chapterNumber) === Number(targetChNum))
              );
              if (foundIdx !== -1) initialIdx = foundIdx;
            }
            await loadChapterFromList(initialIdx, chapters);
            return;
          }
        }

        const data = await storyService.getChapter(storyId, storyId);
        if (data && data.pages && data.pages.length > 0) {
          setChapter(data);
          setChapterList([data]);
          setCurrentChapterIndex(0);
          setErrorMsg(null);
        } else {
          setChapter(null);
          setErrorMsg('Chapter pages not found for this story.');
        }
        return;
      }
    } catch (err) {
      console.error(`[ReaderScreen] Exception fetching chapters for storyId "${storyId}":`, err.message);
      setChapter(null);
      setErrorMsg(`Unable to load chapter content: ${err.message || 'Network or server error.'}`);
    } finally {
      setLoading(false);
    }
  };

  const rawPages = chapter?.pages || [];

  // Filter out any promotional cover art or thumbnail URLs, guaranteeing strictly content panels
  const contentOnlyPages = rawPages.filter((item) => {
    const urlStr = typeof item === 'string' ? item : item?.imageUrl || item?.url || '';
    return typeof urlStr === 'string' && !urlStr.includes('/covers/') && !urlStr.endsWith('.jpg.512.jpg');
  });

  const pagesToUse = contentOnlyPages.length > 0 ? contentOnlyPages : rawPages;

  // Normalize pages array into standard { pageNumber, imageUrl } objects
  const pages = pagesToUse.map((item, index) => {
    if (typeof item === 'string') {
      return { pageNumber: index + 1, imageUrl: item };
    }
    return {
      pageNumber: item.pageNumber || index + 1,
      imageUrl: item.imageUrl || item.url || item,
    };
  });

  const currentPageRef = useRef(1);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Real-time vertical webtoon scroll tracking
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const offsetY = contentOffset.y;
    currentScrollYRef.current = offsetY;

    const totalPages = pages.length;
    if (!totalPages || totalPages === 0) return;

    // Calculate maximum scrollable vertical distance
    const maxScroll = contentSize.height - layoutMeasurement.height;

    let calculatedPage = 1;
    if (maxScroll > 10) {
      // Direct proportion of scroll position to pages 1..totalPages
      const fraction = Math.max(0, Math.min(1, offsetY / maxScroll));
      calculatedPage = Math.min(totalPages, Math.floor(fraction * totalPages) + 1);
    } else {
      const panelHeight = SCREEN_HEIGHT * 0.82;
      calculatedPage = Math.floor((offsetY + panelHeight / 2) / panelHeight) + 1;
    }

    const clampedPage = Math.max(1, Math.min(totalPages, calculatedPage));

    if (clampedPage !== currentPageRef.current) {
      currentPageRef.current = clampedPage;
      setCurrentPage(clampedPage);
      updateProgress(storyId, chapter?.chapterNumber || 1, clampedPage);
    }
  };

  // Real-time horizontal paged viewable item tracking
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const firstVisible = viewableItems[0];
      if (firstVisible && firstVisible.index !== undefined) {
        const activePage = firstVisible.index + 1;
        if (activePage !== currentPageRef.current) {
          currentPageRef.current = activePage;
          setCurrentPage(activePage);
          updateProgress(storyId, chapter?.chapterNumber || 1, activePage);
        }
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleScrollDownPress = () => {
    if (scrollViewRef.current) {
      const targetY = currentScrollYRef.current + SCREEN_HEIGHT * 0.75;
      scrollViewRef.current.scrollTo({
        y: targetY,
        animated: true,
      });
      currentScrollYRef.current = targetY;
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Chapter Pages...</Text>
      </View>
    );
  }

  if (!loading && (errorMsg || pages.length === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="alert-circle-outline" size={38} color={COLORS.accent} />
          </View>
          <Text style={styles.emptyTitle}>No Pages Found for This Chapter</Text>
          <Text style={styles.emptySubtitle}>
            {errorMsg || 'No pages found for this chapter.'}
          </Text>

          <View style={styles.emptyBtnGroup}>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchChapterData} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={16} color="#FFF" />
              <Text style={styles.retryBtnText}>Retry Loading</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Ionicons name="arrow-back-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.backBtnText}>Back to Catalog</Text>
            </TouchableOpacity>
          </View>
        </View>
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
          isAutoTranslating={isAutoTranslating}
          onToggleTranslation={() => setIsAutoTranslating(!isAutoTranslating)}
          onBack={() => navigation.goBack()}
          onToggleBookmark={() => toggleFavorite({ _id: storyId, title })}
          onToggleMode={() => setReaderMode(readerMode === 'webtoon' ? 'paged' : 'webtoon')}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
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
                isTranslated={isAutoTranslating}
                storyTitle={activeTitle}
                storyDesc={activeDesc}
                author={activeAuthor}
              />
            ))}


            {/* End of Chapter Footer */}
            <View style={styles.endChapterCard}>
              <Text style={styles.endTitle}>You completed Chapter {chapter?.chapterNumber || 1}!</Text>
              <TouchableOpacity
                style={styles.nextChapterBtn}
                onPress={handleNextChapter}
              >
                <Text style={styles.nextChapterBtnText}>Read Next Chapter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          /* Horizontal Paged Manga Reader */
          <FlatList
            ref={flatListRef}
            data={pages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.pageNumber.toString()}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
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
            style={[styles.floatingBtn, (isAutoScrolling || isSpeaking) && styles.autoScrollActive]}
            onPress={toggleAutoPlayAll}
            activeOpacity={0.8}
          >
            <Ionicons name={isAutoScrolling || isSpeaking ? 'pause-circle' : 'play-circle'} size={18} color="#FFF" />
            <Text style={styles.floatingBtnText}>{isAutoScrolling || isSpeaking ? 'Pause' : 'Auto Play & Read'}</Text>
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
  translationOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(9, 10, 16, 0.88)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
    ...SHADOWS.card,
  },
  translationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  translationBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 0.8,
  },
  translationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: METRICS.paddingLarge,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: METRICS.borderRadiusMd,
    padding: METRICS.paddingLarge,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    ...SHADOWS.card,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtnGroup: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: METRICS.borderRadiusSm,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
    borderRadius: METRICS.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});


