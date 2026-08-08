import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback Mock Data for instant mobile previewing & offline resilience
export const MOCK_STORIES = [
  {
    _id: 'story-1',
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
    totalChapters: 120,
    isFeatured: true,
    isTrending: true,
  },
  {
    _id: 'story-2',
    title: 'Celestial Martial God',
    slug: 'celestial-martial-god',
    description: 'Betrayed by his inner sect brothers, Yun Che transmigrates 10,000 years into the future with the Dragon God Bloodline. Watch as he conquers the nine heavens!',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    author: 'Mars Gravity',
    artist: 'Studio Feng',
    type: 'Manhua',
    genres: ['Action', 'Martial Arts', 'Reincarnation'],
    status: 'Ongoing',
    rating: 4.7,
    views: 890000,
    totalChapters: 85,
    isFeatured: true,
    isTrending: true,
  },
  {
    _id: 'story-3',
    title: 'Tower of Eternity',
    slug: 'tower-of-eternity',
    description: 'What do you desire? Fortune? Glory? Power? Revenge? Whatever you desire is at the top of the Tower. Twenty-Fifth Baam enters the tower to find his lost light.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    author: 'SIU',
    artist: 'SIU',
    type: 'Webtoon',
    genres: ['Fantasy', 'Mystery', 'Sci-Fi'],
    status: 'Ongoing',
    rating: 4.8,
    views: 2100000,
    totalChapters: 540,
    isFeatured: true,
    isTrending: true,
  },
  {
    _id: 'story-4',
    title: 'Omniscient Reader Protocol',
    slug: 'omniscient-reader-protocol',
    description: 'Kim Dokja was an ordinary office worker whose only hobby was reading a web novel titled "Three Ways to Survive the Apocalypse". When the novel comes to life, he alone knows how the world ends.',
    coverImage: 'https://images.unsplash.com/photo-1614680376593-902f749f7edc?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200',
    author: 'sing N song',
    artist: 'Sleepy-C',
    type: 'Webtoon',
    genres: ['Action', 'Apocalypse', 'Psychological'],
    status: 'Ongoing',
    rating: 4.95,
    views: 3400000,
    totalChapters: 195,
    isFeatured: true,
    isTrending: true,
  },
  {
    _id: 'story-5',
    title: 'The Alchemist Princess',
    slug: 'the-alchemist-princess',
    description: 'Reborn as the disgraced third princess of the Empire, Elena uses her modern chemistry knowledge and alchemy magic to rebuild her estate.',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
    bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1200',
    author: 'Aria Rose',
    artist: 'Moonlight Art',
    type: 'Manhwa',
    genres: ['Romance', 'Fantasy', 'Isekai'],
    status: 'Ongoing',
    rating: 4.6,
    views: 650000,
    totalChapters: 68,
    isFeatured: false,
    isTrending: true,
  },
];

export const MOCK_CHAPTER = {
  _id: 'chap-1',
  storyId: 'story-1',
  chapterNumber: 1,
  title: 'Chapter 1: The Double Dungeon Incident',
  pages: [
    { pageNumber: 1, imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=900' },
    { pageNumber: 2, imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=900' },
    { pageNumber: 3, imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=900' },
    { pageNumber: 4, imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=900' },
    { pageNumber: 5, imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=900' },
  ],
};

// API Services
export const storyService = {
  getStories: async (params = {}) => {
    try {
      const res = await apiClient.get('/stories', { params });
      return res.data.data;
    } catch (err) {
      console.log('[API] Backend server unreachable, returning local story dataset.');
      return MOCK_STORIES.filter((item) => {
        if (params.genre && params.genre !== 'All') return item.genres.includes(params.genre);
        if (params.search) return item.title.toLowerCase().includes(params.search.toLowerCase());
        return true;
      });
    }
  },

  getFeaturedStories: async () => {
    try {
      const res = await apiClient.get('/stories/featured');
      return res.data.data;
    } catch (err) {
      return MOCK_STORIES.filter((s) => s.isFeatured);
    }
  },

  getStoryById: async (id) => {
    try {
      const res = await apiClient.get(`/stories/${id}`);
      return res.data.data;
    } catch (err) {
      const found = MOCK_STORIES.find((s) => s._id === id) || MOCK_STORIES[0];
      return {
        ...found,
        chapters: Array.from({ length: 10 }, (_, i) => ({
          _id: `chap-${i + 1}`,
          chapterNumber: i + 1,
          title: `Chapter ${i + 1}: Path of the Sovereign`,
          views: 12000 + i * 450,
        })),
      };
    }
  },

  getChapter: async (chapterId) => {
    try {
      const res = await apiClient.get(`/chapters/${chapterId}`);
      return res.data.data;
    } catch (err) {
      return MOCK_CHAPTER;
    }
  },
};
