import { ContentItem } from '../ContentItem';

export default function ContentItemExample() {
  const mockMovie = {
    id: '1',
    title: '365 Days to the Wedding',
    category: 'Movie',
    thumbnail: 'https://placehold.co/200x300/1e293b/94a3b8?text=Movie',
    driveLink: 'https://example.com',
    seasons: null,
  };

  const mockAnime = {
    id: '2',
    title: 'Attack on Titan',
    category: 'Anime',
    thumbnail: 'https://placehold.co/200x300/1e293b/94a3b8?text=Anime',
    driveLink: null,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, link: 'https://example.com/s1e1' },
          { episodeNumber: 2, link: 'https://example.com/s1e2' },
          { episodeNumber: 3, link: 'https://example.com/s1e3' },
          { episodeNumber: 4, link: 'https://example.com/s1e4' },
          { episodeNumber: 5, link: 'https://example.com/s1e5' },
        ],
      },
      {
        seasonNumber: 2,
        episodes: [
          { episodeNumber: 1, link: 'https://example.com/s2e1' },
          { episodeNumber: 2, link: 'https://example.com/s2e2' },
          { episodeNumber: 3, link: 'https://example.com/s2e3' },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-4">
      <ContentItem item={mockMovie} index={0} />
      <ContentItem item={mockAnime} index={1} />
    </div>
  );
}
