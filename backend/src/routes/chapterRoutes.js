const express = require('express');
const router = express.Router();
const { getChapterById, getStoryChapters, createChapter } = require('../controllers/chapterController');

router.get('/:id', getChapterById);
router.get('/story/:storyId', getStoryChapters);
router.post('/', createChapter);

module.exports = router;
