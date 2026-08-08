const axios = require('axios');

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
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';

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
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';

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
    const { limit = 50, offset = 0 } = req.query;

    const response = await axios.get(`${MANGADEX_API_BASE}/manga/${id}/feed`, {
      params: {
        'translatedLanguage[]': ['en'],
        limit,
        offset,
        'order[chapter]': 'asc',
        'contentRating[]': ['safe', 'suggestive'],
      },
      headers: {
        'User-Agent': 'Storyveil-App/1.0.0',
      },
    });

    const chapters = (response.data.data || []).map((ch) => ({
      _id: `md-ch-${ch.id}`,
      mangadexChapterId: ch.id,
      chapterNumber: parseFloat(ch.attributes.chapter) || 1,
      title: ch.attributes.title || `Chapter ${ch.attributes.chapter || 1}`,
      pagesCount: ch.attributes.pages || 0,
      publishDate: ch.attributes.publishAt,
    }));

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters,
    });
  } catch (error) {
    console.error('[MangaDex Chapters Error]:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch MangaDex chapters' });
  }
};

module.exports = {
  searchManga,
  getMangaById,
  getMangaChapters,
};
