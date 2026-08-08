const Chapter = require('../models/Chapter');
const Story = require('../models/Story');

// @desc    Get chapter by ID or storyId + chapterNumber
// @route   GET /api/chapters/:id
exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('storyId', 'title totalChapters coverImage');
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    chapter.views += 1;
    await chapter.save();

    res.json({ success: true, data: chapter });
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
