const axios = require('axios');
const asuraService = require('../services/asuraService');

const MANGADEX_API_BASE = 'https://api.mangadex.org';
const MANGADEX_COVER_BASE = 'https://uploads.mangadex.org/covers';

/**
 * @desc    Search live manga & webtoons from MangaDex API
 * @route   GET /api/mangadex/search
 * @access  Public
 */
const searchManga = async (req, res, next) => {
  try {
    const { title, limit = 10, offset = 0, genre } = req.query;

    const params = new URLSearchParams();
    if (title && title.trim() !== '') {
      params.append('title', title.trim());
    }
    params.append('limit', Math.min(parseInt(limit, 10) || 10, 50));
    params.append('offset', Math.max(parseInt(offset, 10) || 0, 0));
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');
    params.append('hasAvailableChapters', 'true');
    params.append('order[relevance]', 'desc');
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');

    const response = await axios.get(`${MANGADEX_API_BASE}/manga`, {
      params,
      headers: {
        'User-Agent': 'Storyveil-App/1.0.0 (https://github.com/melrowgallardo/Storyveil)',
      },
      timeout: 10000,
    });

    const mangaList = response.data.data || [];

    // Clean up and transform MangaDex JSON for React Native frontend
    const formattedData = mangaList.map((manga) => {
      const { id, attributes = {}, relationships = [] } = manga;

      // Extract localized title
      const mainTitle =
        attributes.title?.en ||
        attributes.title?.['ja-ro'] ||
        Object.values(attributes.title || {})[0] ||
        'Untitled Manga';

      // Extract description
      const description =
        attributes.description?.en ||
        Object.values(attributes.description || {})[0] ||
        'No description available for this title.';

      // Extract Cover Art image URL
      const coverRel = relationships.find((rel) => rel.type === 'cover_art');
      const coverFileName = coverRel?.attributes?.fileName;
      const coverImage = coverFileName
        ? `${MANGADEX_COVER_BASE}/${id}/${coverFileName}.512.jpg`
        : 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg';

      // Extract Author / Artist
      const authorRel = relationships.find((rel) => rel.type === 'author');
      const artistRel = relationships.find((rel) => rel.type === 'artist');
      const authorName = authorRel?.attributes?.name || artistRel?.attributes?.name || 'MangaDex Creator';

      // Determine format/type (Manga, Manhwa, Manhua, Webtoon)
      let storyType = 'Manga';
      const origLang = attributes.originalLanguage;
      if (origLang === 'ko') storyType = 'Manhwa';
      else if (origLang === 'zh' || origLang === 'zh-hk') storyType = 'Manhua';

      // Extract genre tags
      const genres = (attributes.tags || [])
        .map((tag) => tag.attributes?.name?.en)
        .filter(Boolean)
        .slice(0, 5);

      // Capitalize status
      const status = attributes.status
        ? attributes.status.charAt(0).toUpperCase() + attributes.status.slice(1)
        : 'Ongoing';

      return {
        _id: `md-${id}`,
        mangadexId: id,
        title: mainTitle,
        description,
        coverImage,
        coverImageUrl: coverImage,
        coverUrl: coverImage,
        thumbnail: coverImage,
        author: authorName,
        status,
        type: storyType,
        genres,
        year: attributes.year || null,
        rating: 4.8, // Default platform rating representation
        contentRating: attributes.contentRating || 'safe',
        latestChapter: attributes.lastChapter ? parseInt(attributes.lastChapter, 10) : 1,
        mangadexUrl: `https://mangadex.org/title/${id}`,
        isExternal: true,
        source: 'MangaDex',
      };
    });

    res.status(200).json({
      success: true,
      count: formattedData.length,
      total: response.data.total || formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error('[MangaDex Controller Error]:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch live data from MangaDex API',
      error: error.message,
    });
  }
};

/**
 * @desc    Get detailed manga by MangaDex ID
 * @route   GET /api/mangadex/:id
 * @access  Public
 */
const getMangaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${MANGADEX_API_BASE}/manga/${id}`, {
      params: {
        'includes[]': ['cover_art', 'author', 'artist'],
      },
      headers: {
        'User-Agent': 'Storyveil-App/1.0.0',
      },
    });

    const manga = response.data.data;
    if (!manga) {
      return res.status(404).json({ success: false, message: 'Manga not found on MangaDex' });
    }

    const { attributes = {}, relationships = [] } = manga;

    const mainTitle =
      attributes.title?.en ||
      attributes.title?.['ja-ro'] ||
      Object.values(attributes.title || {})[0] ||
      'Untitled Manga';

    const description =
      attributes.description?.en ||
      Object.values(attributes.description || {})[0] ||
      'No description available.';

    const coverRel = relationships.find((rel) => rel.type === 'cover_art');
    const coverFileName = coverRel?.attributes?.fileName;
    const coverImage = coverFileName
      ? `${MANGADEX_COVER_BASE}/${id}/${coverFileName}`
      : 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg';

    const authorRel = relationships.find((rel) => rel.type === 'author');
    const authorName = authorRel?.attributes?.name || 'MangaDex Creator';

    const genres = (attributes.tags || [])
      .map((tag) => tag.attributes?.name?.en)
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        _id: `md-${id}`,
        mangadexId: id,
        title: mainTitle,
        description,
        coverImage,
        coverImageUrl: coverImage,
        coverUrl: coverImage,
        thumbnail: coverImage,
        author: authorName,
        status: attributes.status || 'ongoing',
        genres,
        mangadexUrl: `https://mangadex.org/title/${id}`,
        isExternal: true,
        source: 'MangaDex',
      },
    });
  } catch (error) {
    console.error('[MangaDex Detail Error]:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch MangaDex title details' });
  }
};

/**
 * @desc    Get chapters feed for a MangaDex manga ID
 * @route   GET /api/mangadex/:id/chapters
 * @access  Public
 */
const getMangaChapters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    let chapters = [];
    let source = 'MangaDex';

    try {
      const params = new URLSearchParams();
      params.append('translatedLanguage[]', 'en'); // Primary query: English translations only
      params.append('limit', String(Math.min(parseInt(limit, 10) || 100, 100)));
      params.append('offset', String(Math.max(parseInt(offset, 10) || 0, 0)));
      params.append('order[chapter]', 'asc');
      params.append('contentRating[]', 'safe');
      params.append('contentRating[]', 'suggestive');
      params.append('includes[]', 'scanlation_group');

      const response = await axios.get(`${MANGADEX_API_BASE}/manga/${id}/feed`, {
        params,
        headers: { 'User-Agent': 'Storyveil-App/1.0.0' },
        timeout: 10000,
      });

      const rawList = response.data?.data || [];
      const validChapters = rawList.filter((ch) => (ch.attributes?.pages || 0) > 0);

      if (validChapters.length > 0) {
        chapters = validChapters.map((ch) => {
          const rawTitle = ch.attributes.title;
          const cleanTitle = rawTitle && !/[\u0900-\u097F\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/.test(rawTitle)
            ? rawTitle
            : null;

          return {
            _id: `md-ch-${ch.id}`,
            mangadexChapterId: ch.id,
            chapterNumber: parseFloat(ch.attributes.chapter) || 1,
            title: cleanTitle
              ? `Ch. ${ch.attributes.chapter || 1} - ${cleanTitle}`
              : `Chapter ${ch.attributes.chapter || 1}`,
            pagesCount: ch.attributes.pages || 0,
            publishDate: ch.attributes.publishAt,
            language: ch.attributes.translatedLanguage || 'en',
            source: 'MangaDex',
          };
        });
      }
    } catch (mangadexErr) {
      console.warn(`[Fallback Controller]: MangaDex request failed for "${id}": ${mangadexErr.message}. Triggering AsuraScans English fallback...`);
    }

    // Prioritized Fallback Strategy: If MangaDex returns 0 chapters or fails, call AsuraScans service!
    if (chapters.length === 0) {
      let mangaTitle = id;
      try {
        const cleanId = String(id).replace(/^md-/, '');
        const mangaRes = await axios.get(`${MANGADEX_API_BASE}/manga/${cleanId}`, {
          headers: { 'User-Agent': 'Storyveil-App/1.0.0' },
          timeout: 4000,
        });
        const attr = mangaRes.data?.data?.attributes;
        const resolvedTitle = attr?.title?.en || attr?.title?.['ja-ro'] || Object.values(attr?.title || {})[0];
        if (resolvedTitle) {
          mangaTitle = resolvedTitle;
        }
      } catch (e) {
        console.warn(`[Fallback Controller]: Manga title lookup notice for ID "${id}":`, e.message);
      }

      console.log(`[Fallback Controller]: MangaDex returned 0 chapters for title "${mangaTitle}". Triggering AsuraScans English fallback service...`);
      source = 'AsuraScans';
      const fetchChaptersFn = asuraService.fetchMangaChapters || asuraService.getMangaChapters;
      chapters = await fetchChaptersFn(mangaTitle);
    }

    res.status(200).json({
      success: true,
      count: chapters.length,
      source,
      data: chapters,
    });
  } catch (error) {
    console.error('[Chapter Controller Error]:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch chapters', error: error.message });
  }
};


/**
 * @desc    Get live image page URLs for a MangaDex chapter ID
 * @route   GET /api/mangadex/chapter/:chapterId/pages
 * @access  Public
 */
const getChapterPages = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const cleanChapterId = String(chapterId || '').replace(/^md-ch-/, '').replace(/^md-/, '').replace(/^asura-ch-/, '');
    console.log(`[MangaDex At-Home Request] Fetching chapter pages for ID: "${chapterId}" (cleanId: "${cleanChapterId}")`);

    const fetchPagesFn = asuraService.fetchChapterPages || asuraService.getChapterPages;

    // Check if chapter ID is from AsuraScans service
    if (String(chapterId).startsWith('asura-')) {
      const pageUrls = await fetchPagesFn(chapterId);
      const safePages = (Array.isArray(pageUrls) ? pageUrls : []).filter((url) => typeof url === 'string' && !url.includes('/covers/'));
      if (safePages.length > 0) {
        console.log(`[AsuraScans Chapter Pages] Returned ${safePages.length} pages for ID "${chapterId}"`);
        return res.status(200).json({
          success: true,
          count: safePages.length,
          chapterId,
          source: 'AsuraScans',
          pages: safePages,
        });
      }
    }

    let pageUrls = [];
    let mangadexSuccess = false;

    try {
      const response = await axios.get(`${MANGADEX_API_BASE}/at-home/server/${cleanChapterId}`, {
        headers: {
          'User-Agent': 'Storyveil-App/1.0.0 (https://github.com/melrowgallardo/Storyveil)',
        },
        timeout: 10000,
      });

      const { baseUrl, chapter } = response.data || {};
      const dataFiles = chapter?.data || [];
      const dataSaverFiles = chapter?.dataSaver || [];
      const hash = chapter?.hash;

      console.log(
        `[MangaDex At-Home Response] Status: ${response.status}, baseUrl: "${baseUrl}", hash: "${hash}", dataCount: ${dataFiles.length}, dataSaverCount: ${dataSaverFiles.length}`
      );

      if (baseUrl && hash && (dataFiles.length > 0 || dataSaverFiles.length > 0)) {
        const isSaver = dataFiles.length === 0;
        const pageFiles = isSaver ? dataSaverFiles : dataFiles;
        const modePath = isSaver ? 'data-saver' : 'data';

        pageUrls = pageFiles.map(
          (fileName) => `${baseUrl}/${modePath}/${hash}/${fileName}`
        );
        mangadexSuccess = pageUrls.length > 0;
      }
    } catch (mangadexErr) {
      console.warn(
        `[MangaDex At-Home Server Error] Request failed for chapter "${cleanChapterId}": ${mangadexErr.response?.data?.message || mangadexErr.message}`
      );
    }

    // If MangaDex returned valid image pages, respond immediately
    if (mangadexSuccess && pageUrls.length > 0) {
      console.log(`[MangaDex Success] Returning ${pageUrls.length} image pages for chapter "${chapterId}"`);
      return res.status(200).json({
        success: true,
        count: pageUrls.length,
        chapterId,
        source: 'MangaDex',
        pages: pageUrls,
      });
    }

    // FALLBACK STRATEGY: If MangaDex returns 0 pages or fails, call AsuraScans / backup generator
    console.warn(
      `[Fallback Triggered] 0 hosted pages found on MangaDex for chapter "${chapterId}". Attempting alternative source fallback...`
    );

    const fallbackPages = await fetchPagesFn(chapterId);
    const safeFallback = Array.isArray(fallbackPages) && fallbackPages.length > 0
      ? fallbackPages.filter((url) => typeof url === 'string' && !url.includes('/covers/'))
      : [];

    console.log(`[Fallback Success] Returning ${safeFallback.length} alternative webtoon pages for chapter "${chapterId}"`);
    return res.status(200).json({
      success: safeFallback.length > 0,
      count: safeFallback.length,
      chapterId,
      source: safeFallback.length > 0 ? 'Alternative Scraper Fallback' : 'None',
      pages: safeFallback,
    });
  } catch (error) {
    console.error('[Chapter Pages Controller Error]:', error.message);
    res.status(500).json({
      success: false,
      message: `Failed to fetch chapter pages: ${error.message || 'Server error.'}`,
      pages: [],
    });
  }
};

/**
 * @desc    Get aggregated trending manga & manhwa from MangaDex and AsuraScans
 * @route   GET /api/mangadex/trending
 * @access  Public
 */
const getTrendingManga = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, genre } = req.query;

    const params = new URLSearchParams();
    params.append('limit', Math.min(parseInt(limit, 10) || 20, 50));
    params.append('offset', Math.max(parseInt(offset, 10) || 0, 0));
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');
    params.append('hasAvailableChapters', 'true');
    params.append('order[followedCount]', 'desc');
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');

    // Concurrently fetch multi-source catalog from MangaDex and AsuraScans
    const [mangadexRes, asuraRes] = await Promise.allSettled([
      axios.get(`${MANGADEX_API_BASE}/manga`, {
        params,
        headers: {
          'User-Agent': 'Storyveil-App/1.0.0 (https://github.com/melrowgallardo/Storyveil)',
        },
        timeout: 10000,
      }),
      asuraService.getLatestUpdates(),
    ]);

    let mangadexList = [];
    if (mangadexRes.status === 'fulfilled' && mangadexRes.value.data?.data) {
      mangadexList = mangadexRes.value.data.data.map((manga) => {
        const { id, attributes = {}, relationships = [] } = manga;

        const mainTitle =
          attributes.title?.en ||
          attributes.title?.['ja-ro'] ||
          Object.values(attributes.title || {})[0] ||
          'Untitled Manga';

        const description =
          attributes.description?.en ||
          Object.values(attributes.description || {})[0] ||
          'No description available.';

        const coverRel = relationships.find((rel) => rel.type === 'cover_art');
        const coverFileName = coverRel?.attributes?.fileName;
        const coverImage = coverFileName
          ? `${MANGADEX_COVER_BASE}/${id}/${coverFileName}.512.jpg`
          : 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg';

        const authorRel = relationships.find((rel) => rel.type === 'author');
        const artistRel = relationships.find((rel) => rel.type === 'artist');
        const authorName = authorRel?.attributes?.name || artistRel?.attributes?.name || 'MangaDex Creator';

        let storyType = 'Manga';
        const origLang = attributes.originalLanguage;
        if (origLang === 'ko') storyType = 'Manhwa';
        else if (origLang === 'zh' || origLang === 'zh-hk') storyType = 'Manhua';

        const genres = (attributes.tags || [])
          .map((tag) => tag.attributes?.name?.en)
          .filter(Boolean)
          .slice(0, 4);

        return {
          _id: `md-${id}`,
          id: `md-${id}`,
          mangadexId: id,
          title: mainTitle,
          description,
          coverImage,
          coverImageUrl: coverImage,
          author: authorName,
          status: attributes.status ? attributes.status.charAt(0).toUpperCase() + attributes.status.slice(1) : 'Ongoing',
          type: storyType,
          genres,
          rating: 4.9,
          isTrending: true,
          source: 'MangaDex',
        };
      });
    }

    let asuraList = [];
    if (asuraRes.status === 'fulfilled' && Array.isArray(asuraRes.value)) {
      asuraList = asuraRes.value;
    }

    // Interleave titles from both sources for rich catalog representation
    const mergedList = [];
    const maxLen = Math.max(mangadexList.length, asuraList.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < asuraList.length) mergedList.push(asuraList[i]);
      if (i < mangadexList.length) mergedList.push(mangadexList[i]);
    }

    // Optional genre filter at backend controller level
    let filteredList = mergedList;
    if (genre && genre !== 'All') {
      const targetGenre = genre.toLowerCase();
      filteredList = mergedList.filter((item) => {
        const gMatch = item.genres && item.genres.some((g) => String(g).toLowerCase().includes(targetGenre));
        const tMatch = item.type && String(item.type).toLowerCase().includes(targetGenre);
        return gMatch || tMatch;
      });
    }

    res.status(200).json({
      success: true,
      count: filteredList.length,
      data: filteredList,
    });
  } catch (error) {
    console.error('[Multi-Source Trending Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aggregated trending manga from sources',
      error: error.message,
    });
  }
};

module.exports = {
  searchManga,
  getMangaById,
  getMangaChapters,
  getChapterPages,
  getTrendingManga,
};

