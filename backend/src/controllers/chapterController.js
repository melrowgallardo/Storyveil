const Chapter = require('../models/Chapter');
const Story = require('../models/Story');
const asuraService = require('../services/asuraService');
const mongoose = require('mongoose');

// @desc    Get chapter by Chapter ID or Story ID (queries MongoDB, MangaDex, or Asura fallback)
// @route   GET /api/chapters/:id
exports.getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    let chapter;

    if (mongoose.Types.ObjectId.isValid(id)) {
      chapter = await Chapter.findById(id).populate('storyId', 'title totalChapters coverImage description author');

      if (!chapter) {
        chapter = await Chapter.findOne({ storyId: id }).populate('storyId', 'title totalChapters coverImage description author');
      }
    }

    if (chapter) {
      chapter.views = (chapter.views || 0) + 1;
      await chapter.save().catch(() => {});
      return res.json({ success: true, data: chapter });
    }

    return res.status(404).json({
      success: false,
      message: `Chapter "${id}" not found in database or has no hosted pages.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all chapters for a specific story
// @route   GET /api/chapters/story/:storyId
exports.getStoryChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find({ storyId: req.params.storyId }).sort({ chapterNumber: 1 });
    res.json({ success: true, count: chapters.length, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a chapter for a story
// @route   POST /api/chapters
exports.createChapter = async (req, res) => {
  try {
    const { storyId, chapterNumber, title, pages } = req.body;
    const chapter = await Chapter.create({ storyId, chapterNumber, title, pages });

    // Update story totalChapters
    const count = await Chapter.countDocuments({ storyId });
    await Story.findByIdAndUpdate(storyId, { totalChapters: count });

    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
