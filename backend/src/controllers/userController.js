const Bookmark = require('../models/Bookmark');
const User = require('../models/User');

// @desc    Get user's library / bookmarks & history
// @route   GET /api/user/bookmarks
exports.getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookmarks = await Bookmark.find({ userId })
      .populate('storyId', 'title coverImage author status totalChapters rating genres type')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: bookmarks.length, data: bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update reading progress or bookmark a story
// @route   POST /api/user/bookmarks
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { storyId, lastReadChapterNumber, lastReadPageNumber, progressPercentage, isFavorite, status } = req.body;

    let bookmark = await Bookmark.findOne({ userId, storyId });

    if (bookmark) {
      if (lastReadChapterNumber !== undefined) bookmark.lastReadChapterNumber = lastReadChapterNumber;
      if (lastReadPageNumber !== undefined) bookmark.lastReadPageNumber = lastReadPageNumber;
      if (progressPercentage !== undefined) bookmark.progressPercentage = progressPercentage;
      if (isFavorite !== undefined) bookmark.isFavorite = isFavorite;
      if (status !== undefined) bookmark.status = status;
      await bookmark.save();
    } else {
      bookmark = await Bookmark.create({
        userId,
        storyId,
        lastReadChapterNumber: lastReadChapterNumber || 1,
        lastReadPageNumber: lastReadPageNumber || 1,
        progressPercentage: progressPercentage || 0,
        isFavorite: isFavorite || false,
        status: status || 'Reading',
      });
    }

    // Increment user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.chaptersRead': 1, 'stats.readingTimeMinutes': 5 },
    });

    const populated = await Bookmark.findById(bookmark._id).populate('storyId');
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/user/bookmarks/:storyId
exports.removeBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { storyId } = req.params;

    await Bookmark.findOneAndDelete({ userId, storyId });
    res.json({ success: true, message: 'Bookmark removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
