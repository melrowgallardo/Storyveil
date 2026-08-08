const Story = require('../models/Story');
const Chapter = require('../models/Chapter');

// @desc    Get all stories with optional filtering (genre, search, type, status)
// @route   GET /api/stories
exports.getStories = async (req, res) => {
  try {
    const { genre, search, type, status, featured, trending } = req.query;
    let query = {};

    if (genre && genre !== 'All') {
      query.genres = { $in: [genre] };
    }
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }
    if (trending === 'true') {
      query.isTrending = true;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const stories = await Story.find(query).sort({ rating: -1, views: -1 });
    res.json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single story details by ID with chapter list
// @route   GET /api/stories/:id
exports.getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Increment view count
    story.views += 1;
    await story.save();

    const chapters = await Chapter.find({ storyId: story._id }).select('chapterNumber title views createdAt').sort({ chapterNumber: 1 });

    res.json({
      success: true,
      data: {
        ...story.toObject(),
        chapters,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured hero slider stories
// @route   GET /api/stories/featured
exports.getFeaturedStories = async (req, res) => {
  try {
    const featured = await Story.find({ isFeatured: true }).limit(5);
    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new story (Admin/Creator endpoint)
// @route   POST /api/stories
exports.createStory = async (req, res) => {
  try {
    const story = await Story.create(req.body);
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
