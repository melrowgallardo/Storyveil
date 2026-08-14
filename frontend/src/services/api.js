import axios from 'axios';
import Constants from 'expo-constants';
import { Image } from 'react-native';
import { asuraService } from './asuraService';

const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
const hostIp = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
const API_BASE_URL = `http://${hostIp}:5000/api`;

const imageCacheSet = new Set();

/**
 * Fast Memory/Disk Image Prefetching & Caching Manager
 * Caches image URLs instantly to eliminate repeated loading states and image flicker on scroll.
 */
export const prefetchImage = (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return Promise.resolve(false);
  if (imageCacheSet.has(url)) return Promise.resolve(true);

  return Image.prefetch(url)
    .then(() => {
      imageCacheSet.add(url);
      return true;
    })
    .catch(() => false);
};

export const prefetchImages = (urls = []) => {
  if (!Array.isArray(urls) || urls.length === 0) return Promise.resolve();
  const validUrls = urls.filter((u) => typeof u === 'string' && u.startsWith('http'));
  return Promise.all(validUrls.slice(0, 15).map((u) => prefetchImage(u)));
};

/**
 * Timeout Wrapper to guarantee promises fail gracefully within maxMs (default 6 seconds)
 */
export const withTimeout = (promise, ms = 6000) => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Network request timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback Mock Data for instant mobile previewing & offline resilience
export const MOCK_STORIES = [
  {
    _id: 'story-1',
    title: 'Solo Leveling',
    slug: 'solo-leveling',
    description: 'When the weakest hunter is left for dead in a double dungeon, an enigmatic quest window appears before his eyes. Gaining the power to level up infinitely, he unlocks the secrets of the Shadow Sovereign.',
    coverImage: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
    coverImageUrl: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
    author: 'Chugong',
    artist: 'DUBU (REDICE STUDIO)',
    type: 'Webtoon',
    genres: ['Action', 'Fantasy', 'System', 'Supernatural'],
    status: 'Ongoing',
    rating: 4.9,
    views: 1250000,
    totalChapters: 120,
    isFeatured: true,
    isTrending: true,
  },
  {
    _id: 'story-2',
    title: 'Return of the Mount Hua Sect',
    slug: 'return-of-the-mount-hua-sect',
    description: 'Chung Myung, the 13th Disciple of the Great Mount Hua Sect, defeated the Heavenly Demon. Reborn 100 years later, he finds his beloved Mount Hua Sect in ruins.',
    coverImage: 'https://uploads.mangadex.org/covers/f0f62b75-5989-4f32-9b59-ab56abe35fc1/6a583c43-1e4a-45e0-91e4-8b48013b234c.jpg.512.jpg',
    coverImageUrl: 'https://uploads.mangadex.org/covers/f0f62b75-5989-4f32-9b59-ab56abe35fc1/6a583c43-1e4a-45e0-91e4-8b48013b234c.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/f0f62b75-5989-4f32-9b59-ab56abe35fc1/6a583c43-1e4a-45e0-91e4-8b48013b234c.jpg.512.jpg',
    author: 'Biga',
    artist: 'LICO',
    type: 'Manhua',
    genres: ['Action', 'Martial Arts', 'Reincarnation'],
    status: 'Ongoing',
    rating: 4.9,
    views: 890000,
    totalChapters: 85,
    isFeatured: true,
    isTrending: true,
  },
  {
    _id: 'story-3',
    title: 'Tower of God',
    slug: 'tower-of-god',
    description: 'What do you desire? Fortune? Glory? Power? Revenge? Whatever you desire is at the top of the Tower. Twenty-Fifth Baam enters the tower to find his lost light.',
    coverImage: 'https://uploads.mangadex.org/covers/57e1d491-1dc9-4854-83bf-7a9379566fb2/5ed269d1-63af-45f8-8d67-4e8aa1e1b520.jpg.512.jpg',
    coverImageUrl: 'https://uploads.mangadex.org/covers/57e1d491-1dc9-4854-83bf-7a9379566fb2/5ed269d1-63af-45f8-8d67-4e8aa1e1b520.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/57e1d491-1dc9-4854-83bf-7a9379566fb2/5ed269d1-63af-45f8-8d67-4e8aa1e1b520.jpg.512.jpg',
    author: 'SIU',
    artist: 'SIU',
    type: 'Webtoon',
    genres: ['Fantasy', 'Mystery', 'Sci-Fi'],
    status: 'Ongoing',
    rating: 4.8,
    views: 2100000,
    totalChapters: 540,
    isFeatured: true,
    isTrending: true,
  },
  {
    _id: 'story-4',
    title: 'Omniscient Reader Protocol',
    slug: 'omniscient-reader-protocol',
    description: 'Kim Dokja was an ordinary office worker whose only hobby was reading a web novel titled "Three Ways to Survive the Apocalypse". When the novel comes to life, he alone knows how the world ends.',
    coverImage: 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg',
    coverImageUrl: 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg',
    author: 'sing N song',
    artist: 'Sleepy-C',
    type: 'Webtoon',
    genres: ['Action', 'Apocalypse', 'Psychological'],
    status: 'Ongoing',
    rating: 4.95,
    views: 3400000,
    totalChapters: 195,
    isFeatured: true,
    isTrending: true,
  },
  {
    _id: 'story-5',
    title: 'The Beginning After the End',
    slug: 'the-beginning-after-the-end',
    description: 'King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. Reborn into a new world filled with magic and monsters, he gets a second chance to relive his life.',
    coverImage: 'https://uploads.mangadex.org/covers/4ada20eb-085a-491a-8c49-477ab42014d7/4298e756-edf0-4bd6-9b83-340bfdb27771.jpg.512.jpg',
    coverImageUrl: 'https://uploads.mangadex.org/covers/4ada20eb-085a-491a-8c49-477ab42014d7/4298e756-edf0-4bd6-9b83-340bfdb27771.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/4ada20eb-085a-491a-8c49-477ab42014d7/4298e756-edf0-4bd6-9b83-340bfdb27771.jpg.512.jpg',
    author: 'TurtleMe',
    artist: 'Fuyuki23',
    type: 'Manhwa',
    genres: ['Action', 'Fantasy', 'Isekai'],
    status: 'Ongoing',
    rating: 4.8,
    views: 650000,
    totalChapters: 68,
    isFeatured: false,
    isTrending: true,
  },
];

// API Services
export const storyService = {
  getStories: async (params = {}) => {
    try {
      const res = await apiClient.get('/stories', { params });
      return res.data.data;
    } catch (err) {
      console.log('[API] Backend server unreachable, returning local story dataset.');
      return MOCK_STORIES.filter((item) => {
        if (params.genre && params.genre !== 'All') return item.genres.includes(params.genre);
        if (params.search) return item.title.toLowerCase().includes(params.search.toLowerCase());
        return true;
      });
    }
  },

  getFeaturedStories: async () => {
    try {
      const res = await apiClient.get('/stories/featured');
      return res.data.data;
    } catch (err) {
      return MOCK_STORIES.filter((s) => s.isFeatured);
    }
  },

  getStoryById: async (id) => {
    try {
      const res = await apiClient.get(`/stories/${id}`);
      return res.data.data;
    } catch (err) {
      const found = MOCK_STORIES.find((s) => s._id === id || s.id === id || s.mangadexId === id);
      if (found) {
        return {
          ...found,
          chapters: Array.from({ length: 10 }, (_, i) => ({
            _id: `chap-${i + 1}`,
            chapterNumber: i + 1,
            title: `Chapter ${i + 1}: ${found.title}`,
            views: 12000 + i * 450,
          })),
        };
      }
      return null;
    }
  },

  getChapter: async (chapterId, storyId) => {
    const targetId = chapterId || storyId;
    try {
      const res = await apiClient.get(`/chapters/${targetId}`);
      if (res.data.data && res.data.data.pages && res.data.data.pages.length > 0) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[storyService.getChapter Error]:', err.message);
    }
    throw new Error('Chapter pages unavailable or not found in database.');
  },
};

export const authService = {
  login: async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(errorMsg);
    }
  },

  register: async (username, email, password) => {
    try {
      const res = await apiClient.post('/auth/register', { username, email, password });
      return res.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(errorMsg);
    }
  },

  getMe: async (token) => {
    try {
      const res = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Session verification failed';
      throw new Error(errorMsg);
    }
  },

  updateProfile: async (token, updateData) => {
    try {
      const res = await apiClient.put('/user/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.user;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Profile update failed';
      throw new Error(errorMsg);
    }
  },
};

export const mangadexService = {
  getTrendingManga: async (limit = 20) => {
    try {
      const res = await apiClient.get('/mangadex/trending', { params: { limit } });
      if (res.data.data && res.data.data.length > 0) {
        const covers = res.data.data.map((item) => item.coverImageUrl || item.coverImage).filter(Boolean);
        prefetchImages(covers);
        return res.data.data;
      }
    } catch (err) {
      console.warn('[MangaDex Trending Warning]: Backend unreachable, calling MangaDex directly.');
    }

    try {
      const directRes = await axios.get('https://api.mangadex.org/manga', {
        params: {
          limit: Math.min(limit, 20),
          'includes[]': ['cover_art', 'author', 'artist'],
          hasAvailableChapters: 'true',
          'order[followedCount]': 'desc',
          'contentRating[]': ['safe', 'suggestive'],
        },
        timeout: 6000,
      });
      const list = directRes.data.data || [];
      const resultList = list.map((manga) => {
        const { id, attributes = {}, relationships = [] } = manga;
        const mainTitle = attributes.title?.en || Object.values(attributes.title || {})[0] || 'Untitled Manga';
        const description = attributes.description?.en || Object.values(attributes.description || {})[0] || 'No description.';
        const coverRel = relationships.find((rel) => rel.type === 'cover_art');
        const coverFileName = coverRel?.attributes?.fileName;
        const coverImage = coverFileName
          ? `https://uploads.mangadex.org/covers/${id}/${coverFileName}.512.jpg`
          : 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg';
        const authorRel = relationships.find((rel) => rel.type === 'author');
        return {
          _id: `md-${id}`,
          mangadexId: id,
          title: mainTitle,
          description,
          coverImage,
          coverImageUrl: coverImage,
          author: authorRel?.attributes?.name || 'MangaDex Creator',
          type: attributes.originalLanguage === 'ko' ? 'Manhwa' : attributes.originalLanguage === 'zh' ? 'Manhua' : 'Manga',
          rating: 4.9,
          genres: (attributes.tags || []).map((t) => t.attributes?.name?.en).filter(Boolean).slice(0, 4),
          isTrending: true,
          source: 'MangaDex',
        };
      });
      prefetchImages(resultList.map((item) => item.coverImageUrl));
      return resultList;
    } catch (directErr) {
      return [];
    }
  },

  searchManga: async (title, limit = 10) => {
    try {
      const res = await apiClient.get('/mangadex/search', { params: { title, limit } });
      if (res.data?.data) {
        prefetchImages(res.data.data.map((item) => item.coverImageUrl || item.coverImage));
        return res.data.data;
      }
    } catch (err) {
      console.warn('[MangaDex Service Warning]: Backend unreachable, calling MangaDex directly.');
      try {
        const directRes = await axios.get('https://api.mangadex.org/manga', {
          params: {
            title: title ? title.trim() : undefined,
            limit: Math.min(limit, 20),
            'includes[]': ['cover_art', 'author', 'artist'],
            hasAvailableChapters: 'true',
            'order[relevance]': 'desc',
            'contentRating[]': ['safe', 'suggestive'],
          },
          timeout: 6000,
        });
        const list = directRes.data.data || [];
        const resultList = list.map((manga) => {
          const { id, attributes = {}, relationships = [] } = manga;
          const mainTitle = attributes.title?.en || Object.values(attributes.title || {})[0] || 'Untitled Manga';
          const description = attributes.description?.en || Object.values(attributes.description || {})[0] || 'No description.';
          const coverRel = relationships.find((rel) => rel.type === 'cover_art');
          const coverFileName = coverRel?.attributes?.fileName;
          const coverImage = coverFileName
            ? `https://uploads.mangadex.org/covers/${id}/${coverFileName}.512.jpg`
            : 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg';
          const authorRel = relationships.find((rel) => rel.type === 'author');
          return {
            _id: `md-${id}`,
            mangadexId: id,
            title: mainTitle,
            description,
            coverImage,
            coverImageUrl: coverImage,
            author: authorRel?.attributes?.name || 'MangaDex Author',
            type: attributes.originalLanguage === 'ko' ? 'Manhwa' : attributes.originalLanguage === 'zh' ? 'Manhua' : 'Manga',
            rating: 4.8,
            genres: (attributes.tags || []).map((t) => t.attributes?.name?.en).filter(Boolean).slice(0, 4),
            source: 'MangaDex',
          };
        });
        prefetchImages(resultList.map((item) => item.coverImageUrl));
        return resultList;
      } catch (directErr) {
        return [];
      }
    }
  },

  getMangaById: async (id) => {
    try {
      const res = await apiClient.get(`/mangadex/${id}`);
      return res.data.data;
    } catch (err) {
      try {
        const cleanId = String(id).replace('md-', '');
        const directRes = await axios.get(`https://api.mangadex.org/manga/${cleanId}`, {
          params: { 'includes[]': ['cover_art', 'author'] },
          timeout: 6000,
        });
        const manga = directRes.data.data;
        if (!manga) return null;
        const { attributes = {}, relationships = [] } = manga;
        const mainTitle = attributes.title?.en || Object.values(attributes.title || {})[0] || 'Untitled Manga';
        const description = attributes.description?.en || Object.values(attributes.description || {})[0] || 'No description.';
        const coverRel = relationships.find((rel) => rel.type === 'cover_art');
        const coverFileName = coverRel?.attributes?.fileName;
        const coverImage = coverFileName
          ? `https://uploads.mangadex.org/covers/${cleanId}/${coverFileName}`
          : 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg';
        return {
          _id: `md-${cleanId}`,
          mangadexId: cleanId,
          title: mainTitle,
          description,
          coverImage,
          coverImageUrl: coverImage,
          author: attributes.author || 'MangaDex Creator',
          type: attributes.originalLanguage === 'ko' ? 'Manhwa' : attributes.originalLanguage === 'zh' ? 'Manhua' : 'Manga',
          rating: 4.9,
          genres: (attributes.tags || []).map((t) => t.attributes?.name?.en).filter(Boolean),
          source: 'MangaDex',
        };
      } catch (directErr) {
        return null;
      }
    }
  },

  getMangaChapters: async (id) => {
    try {
      const cleanId = String(id).replace(/^md-/, '');
      const res = await apiClient.get(`/mangadex/${cleanId}/chapters`);
      if (res.data.data && res.data.data.length > 0) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[MangaDex Chapters Backend Warning]:', err.message);
    }

    try {
      const cleanId = String(id).replace(/^md-/, '');
      const params = new URLSearchParams();
      params.append('translatedLanguage[]', 'en'); // Explicitly request English chapters only
      params.append('limit', '100');
      params.append('order[chapter]', 'asc');
      params.append('contentRating[]', 'safe');
      params.append('contentRating[]', 'suggestive');

      const directRes = await axios.get(`https://api.mangadex.org/manga/${cleanId}/feed`, {
        params,
        timeout: 6000,
      });

      const rawList = directRes.data?.data || [];
      const validChapters = rawList.filter((ch) => (ch.attributes?.pages || 0) > 0);

      if (validChapters.length > 0) {
        return validChapters.map((ch) => {
          const rawTitle = ch.attributes.title;
          const cleanTitle = rawTitle && !/[\u0900-\u097F\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/.test(rawTitle)
            ? rawTitle
            : null;

          return {
            _id: `md-ch-${ch.id}`,
            mangadexChapterId: ch.id,
            chapterNumber: parseFloat(ch.attributes.chapter) || 1,
            title: cleanTitle ? `Ch. ${ch.attributes.chapter || 1} - ${cleanTitle}` : `Chapter ${ch.attributes.chapter || 1}`,
            pagesCount: ch.attributes.pages || 0,
            language: ch.attributes.translatedLanguage || 'en',
            source: 'MangaDex',
          };
        });
      }
    } catch (directErr) {
      console.warn('[MangaDex Direct Chapters Warning]:', directErr.message);
    }

    // Direct Client AsuraScans English Fallback Strategy
    console.log(`[asuraService Fallback]: Triggering AsuraScans fallback for "${id}"...`);
    return await asuraService.getMangaChapters(id);
  },

  getChapterPages: async (chapterId) => {
    const cleanChapterId = String(chapterId || '').replace(/^md-ch-/, '').replace(/^md-/, '').replace(/^asura-ch-/, '');
    console.log(`[MangaDex Client getChapterPages] Requesting pages for chapterId: "${chapterId}" (cleanId: "${cleanChapterId}")`);

    if (String(chapterId).startsWith('asura-')) {
      const pages = await asuraService.getChapterPages(chapterId);
      const safePages = (Array.isArray(pages) ? pages : []).filter((url) => typeof url === 'string' && !url.includes('/covers/'));
      if (safePages.length > 0) {
        prefetchImages(safePages);
        return safePages;
      }
    }

    // 1. Try primary backend API endpoint (/api/mangadex/chapter/:chapterId/pages)
    try {
      const res = await apiClient.get(`/mangadex/chapter/${chapterId}/pages`);
      if (res.data?.pages && res.data.pages.length > 0) {
        const contentPages = res.data.pages.filter((url) => typeof url === 'string' && !url.includes('/covers/'));
        if (contentPages.length > 0) {
          prefetchImages(contentPages);
          return contentPages;
        }
      }
    } catch (err) {
      console.warn('[MangaDex Client Backend Notice]:', err.message);
    }

    // 2. Try direct call to MangaDex At-Home server endpoint
    try {
      const directRes = await axios.get(`https://api.mangadex.org/at-home/server/${cleanChapterId}`, {
        timeout: 6000,
      });
      const { baseUrl, chapter } = directRes.data || {};
      console.log(`[MangaDex Direct At-Home Response] baseUrl: "${baseUrl}", hash: "${chapter?.hash}", data: ${chapter?.data?.length || 0}`);

      if (baseUrl && chapter && chapter.hash) {
        const hash = chapter.hash;
        const pageFiles = chapter.data && chapter.data.length > 0 ? chapter.data : chapter.dataSaver || [];
        const isSaver = !(chapter.data && chapter.data.length > 0);
        const modePath = isSaver ? 'data-saver' : 'data';
        const pageUrls = pageFiles.map((fileName) => `${baseUrl}/${modePath}/${hash}/${fileName}`);
        if (pageUrls.length > 0) {
          prefetchImages(pageUrls);
          return pageUrls;
        }
      }
    } catch (directErr) {
      console.warn('[MangaDex Direct At-Home Notice]:', directErr.message);
    }

    // 3. Fallback Strategy: If MangaDex returns 0 pages, call alternative scraper source
    const fallbackPages = await asuraService.getChapterPages(chapterId);
    const safeFallbackRaw = (Array.isArray(fallbackPages) ? fallbackPages : []).filter((url) => typeof url === 'string' && !url.includes('/covers/'));
    if (safeFallbackRaw.length > 0) {
      prefetchImages(safeFallbackRaw);
      return safeFallbackRaw;
    }

    // Return empty array when no pages are available (ReaderScreen will render clean ActivityIndicator / Retry view)
    return [];
  },
};
