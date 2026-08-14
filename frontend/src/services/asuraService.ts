export interface AsuraManga {
  _id: string;
  asuraId: string;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  status: string;
  type: string;
  source: 'AsuraScans';
}

export interface AsuraChapter {
  _id: string;
  mangadexChapterId: string;
  chapterNumber: number;
  title: string;
  pagesCount: number;
  publishDate?: string;
  source: 'AsuraScans';
  pages?: string[];
}

const MOCK_ASURA_DATABASE: (AsuraManga & { chapters: AsuraChapter[] })[] = [
  {
    _id: 'asura-solo-leveling',
    asuraId: 'asura-solo-leveling',
    title: 'Solo Leveling (Shadow Sovereign)',
    description: 'In a world where hunters possessed of magical powers must battle deadly monsters, Sung Jin-Woo is known as the weakest hunter of all mankind. Surviving a double dungeon, he unlocks an exclusive system to level up endlessly.',
    coverImage: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
    author: 'Chugong / DUBU',
    status: 'Completed',
    type: 'Manhwa',
    source: 'AsuraScans',
    chapters: Array.from({ length: 15 }, (_, i) => ({
      _id: `asura-ch-sl-${i + 1}`,
      mangadexChapterId: `asura-ch-sl-${i + 1}`,
      chapterNumber: i + 1,
      title: `Chapter ${i + 1}: Awakening of the Monarch`,
      pagesCount: 0,
      publishDate: new Date(Date.now() - (15 - i) * 86400000).toISOString(),
      source: 'AsuraScans',
    })),
  },
  {
    _id: 'asura-beginning-after-end',
    asuraId: 'asura-beginning-after-end',
    title: 'The Beginning After the End',
    description: 'King Grey has unrivaled strength, wealth, and prestige. Reborn into a new world filled with magic and monsters, he gets a second chance to relive his life.',
    coverImage: 'https://uploads.mangadex.org/covers/4ada20eb-085a-491a-8c49-477ab42014d7/4298e756-edf0-4bd6-9b83-340bfdb27771.jpg.512.jpg',
    author: 'TurtleMe',
    status: 'Ongoing',
    type: 'Manhwa',
    source: 'AsuraScans',
    chapters: Array.from({ length: 10 }, (_, i) => ({
      _id: `asura-ch-tbate-${i + 1}`,
      mangadexChapterId: `asura-ch-tbate-${i + 1}`,
      chapterNumber: i + 1,
      title: `Chapter ${i + 1}: Reincarnation of King Grey`,
      pagesCount: 0,
      publishDate: new Date(Date.now() - (10 - i) * 86400000).toISOString(),
      source: 'AsuraScans',
    })),
  },
];

const searchManga = async (query: string = ''): Promise<AsuraManga[]> => {
  try {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return MOCK_ASURA_DATABASE;

    const matched = MOCK_ASURA_DATABASE.filter((item) =>
      item.title.toLowerCase().includes(cleanQuery) ||
      item.description.toLowerCase().includes(cleanQuery)
    );

    if (matched.length > 0) return matched;

    return [
      {
        _id: `asura-${cleanQuery.replace(/\s+/g, '-')}`,
        asuraId: `asura-${cleanQuery.replace(/\s+/g, '-')}`,
        title: query,
        description: `English translated manhwa series for "${query}" hosted on AsuraScans.`,
        coverImage: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
        author: 'Asura Scans Studio',
        status: 'Ongoing',
        type: 'Manhwa',
        source: 'AsuraScans',
      },
    ];
  } catch (error: any) {
    console.error('[asuraService] searchManga error:', error.message);
    return MOCK_ASURA_DATABASE;
  }
};

const getMangaInfo = async (idOrTitle: string): Promise<AsuraManga | null> => {
  try {
    const cleanId = String(idOrTitle || '').toLowerCase().trim();
    const found = MOCK_ASURA_DATABASE.find(
      (m) => m.asuraId.toLowerCase() === cleanId || m.title.toLowerCase().includes(cleanId)
    );

    if (found) return found;

    return {
      _id: `asura-${cleanId}`,
      asuraId: `asura-${cleanId}`,
      title: idOrTitle || 'Asura Webtoon',
      description: 'English translated webtoon series from AsuraScans catalog.',
      coverImage: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
      author: 'Asura Scans',
      status: 'Ongoing',
      type: 'Manhwa',
      source: 'AsuraScans',
    };
  } catch (error: any) {
    console.error('[asuraService] getMangaInfo error:', error.message);
    return null;
  }
};

const getMangaChapters = async (idOrTitle: string): Promise<AsuraChapter[]> => {
  try {
    const cleanId = String(idOrTitle || '').toLowerCase().trim();
    const found = MOCK_ASURA_DATABASE.find(
      (m) => m.asuraId.toLowerCase() === cleanId ||
             cleanId.includes(m.asuraId.toLowerCase()) ||
             m.title.toLowerCase().includes(cleanId)
    );

    if (found && found.chapters) {
      return found.chapters;
    }

    const safeTitle = (idOrTitle || 'Webtoon Series').replace(/^md-/, '').replace(/^asura-/, '');
    const cleanDisplayTitle = safeTitle.length > 30 ? 'Webtoon Chapter' : safeTitle;

    return Array.from({ length: 12 }, (_, i) => ({
      _id: `asura-ch-${safeTitle}-${i + 1}`,
      mangadexChapterId: `asura-ch-${safeTitle}-${i + 1}`,
      chapterNumber: i + 1,
      title: `Chapter ${i + 1}: ${cleanDisplayTitle}`,
      pagesCount: 0,
      publishDate: new Date(Date.now() - (12 - i) * 86400000).toISOString(),
      source: 'AsuraScans',
    }));
  } catch (error: any) {
    console.error('[asuraService] getMangaChapters error:', error.message);
    return [];
  }
};

const getChapterPages = async (chapterId: string): Promise<string[]> => {
  try {
    const cleanChId = String(chapterId || '').toLowerCase().trim();

    for (const manga of MOCK_ASURA_DATABASE) {
      const matchCh = manga.chapters.find(
        (c) => c._id.toLowerCase() === cleanChId || c.mangadexChapterId.toLowerCase() === cleanChId
      );
      if (matchCh && matchCh.pages && matchCh.pages.length > 0) {
        return matchCh.pages;
      }
    }

    return [];
  } catch (error: any) {
    console.error('[asuraService] getChapterPages error:', error.message);
    return [];
  }
};

export const asuraService = {
  searchManga,
  getMangaInfo,
  fetchMangaInfo: getMangaInfo,
  getMangaChapters,
  fetchMangaChapters: getMangaChapters,
  getChapterPages,
  fetchChapterPages: getChapterPages,
};
