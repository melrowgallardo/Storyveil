const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Story description is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required'],
    },
    bannerImage: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      required: true,
      default: 'Unknown Author',
    },
    artist: {
      type: String,
      default: 'Unknown Artist',
    },
    type: {
      type: String,
      enum: ['Manga', 'Webtoon', 'Manhwa', 'Manhua'],
      default: 'Webtoon',
    },
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['Ongoing', 'Completed', 'Hiatus'],
      default: 'Ongoing',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    views: {
      type: Number,
      default: 0,
    },
    totalChapters: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Story', storySchema);
