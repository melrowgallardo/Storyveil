const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    lastReadChapterNumber: {
      type: Number,
      default: 1,
    },
    lastReadPageNumber: {
      type: Number,
      default: 1,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Reading', 'Completed', 'Plan to Read', 'Dropped'],
      default: 'Reading',
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
