const express = require('express');
const router = express.Router();
const {
  searchManga,
  getMangaById,
  getMangaChapters,
  getChapterPages,
  getTrendingManga,
} = require('../controllers/mangadexController');

// @route   GET /api/mangadex/trending
// @desc    Get live trending webtoons & manga sorted by followedCount
router.get('/trending', getTrendingManga);

// @route   GET /api/mangadex/search
// @desc    Search live manga and webtoons on MangaDex
router.get('/search', searchManga);

// @route   GET /api/mangadex/chapter/:chapterId/pages
// @desc    Get live image page URLs for a MangaDex chapter ID
router.get('/chapter/:chapterId/pages', getChapterPages);

// @route   GET /api/mangadex/:id
// @desc    Get single manga details from MangaDex
router.get('/:id', getMangaById);

// @route   GET /api/mangadex/:id/chapters
// @desc    Get chapters feed for a MangaDex title
router.get('/:id/chapters', getMangaChapters);

module.exports = router;

