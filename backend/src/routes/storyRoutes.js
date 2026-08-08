const express = require('express');
const router = express.Router();
const { getStories, getStoryById, getFeaturedStories, createStory } = require('../controllers/storyController');

router.get('/', getStories);
router.get('/featured', getFeaturedStories);
router.get('/:id', getStoryById);
router.post('/', createStory);

module.exports = router;
