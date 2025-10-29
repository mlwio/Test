import { ContentList } from '../ContentList';

export default function ContentListExample() {
  const mockItems = [
    {
      id: '1',
      title: '365 Days to the Wedding',
      category: 'Movie',
      thumbnail: 'https://placehold.co/200x300/1e293b/94a3b8?text=Movie+1',
      driveLink: 'https://example.com',
      seasons: null,
    },
    {
      id: '2',
      title: 'Another Movie',
      category: 'Movie',
      thumbnail: 'https://placehold.co/200x300/1e293b/94a3b8?text=Movie+2',
      driveLink: 'https://example.com',
      seasons: null,
    },
    {
      id: '3',
      title: 'Attack on Titan',
      category: 'Anime',
      thumbnail: 'https://placehold.co/200x300/1e293b/94a3b8?text=Anime',
      driveLink: null,
      seasons: [
        {
          seasonNumber: 1,
          episodes: Array.from({ length: 12 }, (_, i) => ({
            episodeNumber: i + 1,
            link: `https://example.com/s1e${i + 1}`,
          })),
        },
      ],
    },
  ];

  return <ContentList items={mockItems} category="Movie" />;
}
