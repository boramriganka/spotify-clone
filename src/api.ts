import { Track, Playlist } from './providers/types';
import axios from 'axios';

const ITUNES_URL = 'https://itunes.apple.com/search';

// Convert iTunes result to Track format
export const convertiTunesToTrack = (item: any): Track => ({
  id: `itunes-${item.trackId || item.collectionId}`,
  name: item.trackName || item.collectionName || 'Unknown',
  artist: item.artistName || 'Unknown Artist',
  album: item.collectionName || '',
  duration: Math.floor((item.trackTimeMillis || 0) / 1000),
  artworkUrl: item.artworkUrl100 || item.artworkUrl60 || '',
  streamUrl: item.previewUrl || '',
  playability: item.previewUrl ? 'preview' : 'unavailable',
  source: 'itunes',
  type: 'track'
});

// Fetch songs from iTunes API for a theme
export const fetchSongsByTheme = async (theme: string, limit: number = 20): Promise<Track[]> => {
  try {
    const response = await axios.get(ITUNES_URL, {
      params: {
        term: theme,
        media: 'music',
        limit: limit,
      },
    });
    
    if (response.data && response.data.results) {
      return response.data.results.map(convertiTunesToTrack);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching songs for theme ${theme}:`, error);
    return [];
  }
};

// Mock image URLs (using placeholder images)
export const getImageUrl = (seed: string) => `https://picsum.photos/seed/${seed}/300/300`;

// Generate mock playlists
export const generatePlaylists = (count: number, category: string): Playlist[] => {
  const descriptions = [
    'The biggest hits right now',
    'New music you need to hear',
    'Trending tracks this week',
    'Your daily mix',
    'Discover Weekly',
    'Release Radar',
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${category}-playlist-${i}`,
    title: `${category} Playlist ${i + 1}`,
    description: descriptions[i % descriptions.length],
    artworkUrl: getImageUrl(`${category}-playlist-${i}`),
    trackIds: [],
    owner: 'Spotify',
    type: 'playlist' as const
  }));
};

// Quick Links (Recent items) - with real iTunes data
export const getQuickLinks = async (): Promise<Playlist[]> => {
  const themes = [
    { id: 'ql-1', name: 'Liked Songs', description: 'Your liked songs', theme: 'popular hits', image: getImageUrl('liked') },
    { id: 'ql-2', name: 'Discover Weekly', description: 'Your weekly mixtape', theme: 'new music', image: getImageUrl('discover') },
    { id: 'ql-3', name: 'Release Radar', description: 'New releases', theme: 'latest releases', image: getImageUrl('releases') },
    { id: 'ql-4', name: 'Daily Mix 1', description: 'Based on your listening', theme: 'pop music', image: getImageUrl('mix1') },
    { id: 'ql-5', name: 'Daily Mix 2', description: 'Based on your listening', theme: 'rock music', image: getImageUrl('mix2') },
    { id: 'ql-6', name: 'Chill Hits', description: 'Kick back to the best new and recent chill hits', theme: 'chill music', image: getImageUrl('chill') },
  ];

  const playlists: Playlist[] = await Promise.all(
    themes.map(async (config) => {
      const tracks = await fetchSongsByTheme(config.theme, 10);
      return {
        id: config.id,
        title: config.name,
        description: config.description,
        artworkUrl: tracks[0]?.artworkUrl || config.image,
        trackIds: tracks.map(t => t.id),
        owner: 'Spotify',
        type: 'playlist' as const
      };
    })
  );

  return playlists;
};

// Made For You section - with real iTunes data
export const getMadeForYou = async (): Promise<Playlist[]> => {
  const themes = [
    { theme: 'jazz', name: 'Jazz Vibes' },
    { theme: 'electronic', name: 'Electronic Beats' },
    { theme: 'hip hop', name: 'Hip Hop Essentials' },
    { theme: 'country', name: 'Country Roads' },
    { theme: 'classical', name: 'Classical Collection' },
    { theme: 'r&b', name: 'R&B Soul' },
    { theme: 'indie', name: 'Indie Mix' },
    { theme: 'reggae', name: 'Reggae Vibes' },
  ];

  const playlists: Playlist[] = await Promise.all(
    themes.map(async (config, index) => {
      const tracks = await fetchSongsByTheme(config.theme, 15);
      return {
        id: `made-for-you-${index}`,
        title: config.name,
        description: `Curated ${config.theme} tracks for you`,
        artworkUrl: tracks[0]?.artworkUrl || getImageUrl(`made-for-you-${index}`),
        trackIds: tracks.map(t => t.id),
        owner: 'Spotify',
        type: 'playlist' as const
      };
    })
  );

  return playlists;
};
