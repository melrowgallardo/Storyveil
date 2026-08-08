require('dotenv').config();
const mongoose = require('mongoose');
const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');

const sampleStories = [
  {
    title: 'Shadow Monarch: Rebirth',
    slug: 'shadow-monarch-rebirth',
    description: 'When the weakest hunter is left for dead in a double dungeon, an enigmatic quest window appears before his eyes. Gaining the power to level up infinitely, he unlocks the secrets of the Shadow Sovereign.',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1200',
    author: 'Chugong',
    artist: 'DUBU (REDICE STUDIO)',
    type: 'Webtoon',
    genres: ['Action', 'Fantasy', 'System', 'Supernatural'],
    status: 'Ongoing',
    rating: 4.9,
    views: 1250000,
    totalChapters: 12,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'Celestial Martial God',
    slug: 'celestial-martial-god',
    description: 'Betrayed by his inner sect brothers, Yun Che transmigrates 10,000 years into the future with the Dragon God Bloodline. Watch as he conquers the nine heavens!',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    author: 'Mars Gravity',
    artist: 'Studio Feng',
    type: 'Manhua',
    genres: ['Action', 'Martial Arts', 'Reincarnation', 'Adventure'],
    status: 'Ongoing',
    rating: 4.7,
    views: 890000,
    totalChapters: 8,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'Tower of Eternity',
    slug: 'tower-of-eternity',
    description: 'What do you desire? Fortune? Glory? Power? Revenge? Whatever you desire is at the top of the Tower. Twenty-Fifth Baam enters the tower to find his lost light.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    author: 'SIU',
    artist: 'SIU',
    type: 'Webtoon',
    genres: ['Fantasy', 'Mystery', 'Sci-Fi', 'Drama'],
    status: 'Ongoing',
    rating: 4.8,
    views: 2100000,
    totalChapters: 15,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'Omniscient Reader Protocol',
    slug: 'omniscient-reader-protocol',
    description: 'Kim Dokja was an ordinary office worker whose only hobby was reading a web novel titled "Three Ways to Survive the Apocalypse". When the novel comes to life, he alone knows how the world ends.',
    coverImage: 'https://images.unsplash.com/photo-1614680376593-902f749f7edc?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200',
    author: 'sing N song',
    artist: 'Sleepy-C',
    type: 'Webtoon',
    genres: ['Action', 'Apocalypse', 'Psychological', 'Fantasy'],
    status: 'Ongoing',
    rating: 4.95,
    views: 3400000,
    totalChapters: 20,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'The Alchemist Princess',
    slug: 'the-alchemist-princess',
    description: 'Reborn as the disgraced third princess of the Empire, Elena uses her modern chemistry knowledge and alchemy magic to rebuild her estate and capture the hearts of the high court.',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200',
    author: 'Aria Rose',
    artist: 'Moonlight Art',
    type: 'Manhwa',
    genres: ['Romance', 'Fantasy', 'Isekai', 'Drama'],
    status: 'Ongoing',
    rating: 4.6,
    views: 650000,
    totalChapters: 10,
    isFeatured: false,
    isTrending: true,
  },
];

const samplePages = [
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI missing from environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB Atlas...');

    // Clear existing collection records
    await Story.deleteMany({});
    await Chapter.deleteMany({});
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // Seed Demo User
    const demoUser = await User.create({
      username: 'storyveil_reader',
      email: 'reader@storyveil.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      stats: { chaptersRead: 42, readingTimeMinutes: 320, currentStreak: 5 },
    });
    console.log(`[Seed] Created Demo User: ${demoUser.username}`);

    // Seed Stories & Chapters
    for (const storyData of sampleStories) {
      const story = await Story.create(storyData);
      console.log(`[Seed] Story inserted: ${story.title}`);

      // Create 5 sample chapters for each story
      for (let i = 1; i <= 5; i++) {
        await Chapter.create({
          storyId: story._id,
          chapterNumber: i,
          title: `Chapter ${i}: The Awakening of Power`,
          pages: samplePages.map((url, index) => ({ pageNumber: index + 1, imageUrl: url })),
          views: Math.floor(Math.random() * 5000) + 500,
        });
      }

      // Add a bookmark for demo user for the first 2 stories
      if (sampleStories.indexOf(storyData) < 2) {
        await Bookmark.create({
          userId: demoUser._id,
          storyId: story._id,
          lastReadChapterNumber: 3,
          lastReadPageNumber: 2,
          progressPercentage: 60,
          isFavorite: true,
          status: 'Reading',
        });
      }
    }

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedDB();
