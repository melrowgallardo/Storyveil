const express = require('express');
const router = express.Router();
const { getUserBookmarks, updateProgress, removeBookmark, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/bookmarks', protect, getUserBookmarks);
router.post('/bookmarks', protect, updateProgress);
router.delete('/bookmarks/:storyId', protect, removeBookmark);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
