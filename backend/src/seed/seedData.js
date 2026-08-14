require('dotenv').config();
const mongoose = require('mongoose');
const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');

const sampleStories = [
  {
    title: 'Solo Leveling',
    slug: 'solo-leveling',
    description: 'When the weakest hunter is left for dead in a double dungeon, an enigmatic quest window appears before his eyes. Gaining the power to level up infinitely, he unlocks the secrets of the Shadow Sovereign.',
    coverImage: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
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
    title: 'Return of the Mount Hua Sect',
    slug: 'return-of-the-mount-hua-sect',
    description: 'Chung Myung, the 13th Disciple of the Great Mount Hua Sect, defeated the Heavenly Demon. Reborn 100 years later, he finds his beloved Mount Hua Sect in ruins.',
    coverImage: 'https://uploads.mangadex.org/covers/f0f62b75-5989-4f32-9b59-ab56abe35fc1/6a583c43-1e4a-45e0-91e4-8b48013b234c.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/f0f62b75-5989-4f32-9b59-ab56abe35fc1/6a583c43-1e4a-45e0-91e4-8b48013b234c.jpg.512.jpg',
    author: 'Biga',
    artist: 'LICO',
    type: 'Manhua',
    genres: ['Action', 'Martial Arts', 'Reincarnation', 'Adventure'],
    status: 'Ongoing',
    rating: 4.9,
    views: 890000,
    totalChapters: 8,
    isFeatured: true,
    isTrending: true,
  },
  {
    title: 'Tower of God',
    slug: 'tower-of-god',
    description: 'What do you desire? Fortune? Glory? Power? Revenge? Whatever you desire is at the top of the Tower. Twenty-Fifth Baam enters the tower to find his lost light.',
    coverImage: 'https://uploads.mangadex.org/covers/57e1d491-1dc9-4854-83bf-7a9379566fb2/5ed269d1-63af-45f8-8d67-4e8aa1e1b520.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/57e1d491-1dc9-4854-83bf-7a9379566fb2/5ed269d1-63af-45f8-8d67-4e8aa1e1b520.jpg.512.jpg',
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
    coverImage: 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg',
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
    title: 'The Beginning After the End',
    slug: 'the-beginning-after-the-end',
    description: 'King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. Reborn into a new world filled with magic and monsters, he gets a second chance to relive his life.',
    coverImage: 'https://uploads.mangadex.org/covers/4ada20eb-085a-491a-8c49-477ab42014d7/4298e756-edf0-4bd6-9b83-340bfdb27771.jpg.512.jpg',
    bannerImage: 'https://uploads.mangadex.org/covers/4ada20eb-085a-491a-8c49-477ab42014d7/4298e756-edf0-4bd6-9b83-340bfdb27771.jpg.512.jpg',
    author: 'TurtleMe',
    artist: 'Fuyuki23',
    type: 'Manhwa',
    genres: ['Romance', 'Fantasy', 'Isekai', 'Drama'],
    status: 'Ongoing',
    rating: 4.8,
    views: 650000,
    totalChapters: 10,
    isFeatured: false,
    isTrending: true,
  },
];

const samplePages = [
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000',
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
