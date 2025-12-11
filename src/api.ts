// Mock data API for Spotify clone
import axios from 'axios';

const ITUNES_URL = 'https://itunes.apple.com/search';

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  image: string;
  previewUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  tracks: Track[];
}

// Convert iTunes result to Track format
const convertiTunesToTrack = (item: any): Track => ({
  id: item.trackId?.toString() || item.collectionId?.toString() || '',
  name: item.trackName || item.collectionName || 'Unknown',
  artist: item.artistName || 'Unknown Artist',
  album: item.collectionName || '',
  duration: Math.floor((item.trackTimeMillis || 0) / 1000),
  image: item.artworkUrl100 || item.artworkUrl60 || '',
  previewUrl: item.previewUrl || '',
});

// Convert localStorage favorite item to Track format
const convertFavoriteToTrack = (item: any): Track => ({
  id: item.trackId?.toString() || item.collectionId?.toString() || '',
  name: item.trackName || item.collectionName || 'Unknown',
  artist: item.artistName || 'Unknown Artist',
  album: item.collectionName || '',
  duration: Math.floor((item.trackTimeMillis || 0) / 1000),
  image: item.artworkUrl100 || item.artworkUrl60 || '',
  previewUrl: item.previewUrl || '',
});

// Get liked songs from localStorage
const getLikedSongs = (): Track[] => {
  try {
    const stored = localStorage.getItem('Favourite');
    if (stored) {
      const favorites = JSON.parse(stored);
      return favorites.map(convertFavoriteToTrack);
    }
  } catch (error) {
    console.error('Error loading liked songs:', error);
  }
  return [];
};

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

export interface Category {
  id: string;
  name: string;
  playlists: Playlist[];
}

// Mock image URLs (using placeholder images)
const getImageUrl = (seed: string) => `https://picsum.photos/seed/${seed}/300/300`;

// Generate mock tracks
const generateTracks = (count: number, seed: string): Track[] => {
  const artists = ['The Weeknd', 'Dua Lipa', 'Billie Eilish', 'Post Malone', 'Ariana Grande', 'Drake', 'Taylor Swift', 'Ed Sheeran'];
  const albums = ['After Hours', 'Future Nostalgia', 'Happier Than Ever', 'Hollywood\'s Bleeding', 'Positions', 'Certified Lover Boy', 'Midnights', 'Equals'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${seed}-${i}`,
    name: `Track ${i + 1} - ${seed}`,
    artist: artists[i % artists.length],
    album: albums[i % albums.length],
    duration: Math.floor(Math.random() * 200) + 150, // 150-350 seconds
    image: getImageUrl(`${seed}-${i}`),
  }));
};

// Generate mock playlists
const generatePlaylists = (count: number, category: string): Playlist[] => {
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
    name: `${category} Playlist ${i + 1}`,
    description: descriptions[i % descriptions.length],
    image: getImageUrl(`${category}-playlist-${i}`),
    tracks: generateTracks(20, `${category}-playlist-${i}`),
  }));
};

// Quick Links (Recent items) - with real iTunes data
export const getQuickLinks = async (): Promise<Playlist[]> => {
  const themes = {
    '1': { name: 'Liked Songs', description: 'Your liked songs', theme: 'popular hits', image: getImageUrl('liked') },
    '2': { name: 'Discover Weekly', description: 'Your weekly mixtape', theme: 'new music', image: getImageUrl('discover') },
    '3': { name: 'Release Radar', description: 'New releases', theme: 'latest releases', image: getImageUrl('releases') },
    '4': { name: 'Daily Mix 1', description: 'Based on your listening', theme: 'pop music', image: getImageUrl('mix1') },
    '5': { name: 'Daily Mix 2', description: 'Based on your listening', theme: 'rock music', image: getImageUrl('mix2') },
    '6': { name: 'Chill Hits', description: 'Kick back to the best new and recent chill hits', theme: 'chill music', image: getImageUrl('chill') },
  };

  const playlists = await Promise.all(
    Object.entries(themes).map(async ([id, config]) => {
      // For "Liked Songs" (id: '1'), use favorites from localStorage
      if (id === '1') {
        const likedTracks = getLikedSongs();
        const image = likedTracks.length > 0 ? likedTracks[0].image : config.image;
        return {
          id,
          name: config.name,
          description: `${likedTracks.length} liked songs`,
          image,
          tracks: likedTracks,
        };
      }
      
      // For other playlists, fetch from iTunes API
      const tracks = await fetchSongsByTheme(config.theme, 10);
      return {
        id,
        name: config.name,
        description: config.description,
        image: tracks[0]?.image || config.image,
        tracks,
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

  const playlists = await Promise.all(
    themes.map(async (config, index) => {
      const tracks = await fetchSongsByTheme(config.theme, 15);
      return {
        id: `made-for-you-${index}`,
        name: config.name,
        description: `Curated ${config.theme} tracks for you`,
        image: tracks[0]?.image || getImageUrl(`made-for-you-${index}`),
        tracks,
      };
    })
  );

  return playlists;
};

// Categories
export const getCategories = (): Category[] => {
  const categoryNames = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B'];
  
  return categoryNames.map((name, i) => ({
    id: `category-${i}`,
    name,
    playlists: generatePlaylists(6, name.toLowerCase()),
  }));
};

// Your Library playlists
export const getLibraryPlaylists = (): Playlist[] => {
  return generatePlaylists(20, 'library');
};

// Your Library artists
export const getLibraryArtists = () => {
  const artists = ['The Weeknd', 'Dua Lipa', 'Billie Eilish', 'Post Malone', 'Ariana Grande', 'Drake', 'Taylor Swift', 'Ed Sheeran', 'The Beatles', 'Queen'];
  return artists.map((name, i) => ({
    id: `artist-${i}`,
    name,
    image: getImageUrl(`artist-${name}`),
    followers: Math.floor(Math.random() * 10000000) + 1000000,
  }));
};

// Your Library albums
export const getLibraryAlbums = () => {
  const albums = [
    { name: 'After Hours', artist: 'The Weeknd' },
    { name: 'Future Nostalgia', artist: 'Dua Lipa' },
    { name: 'Happier Than Ever', artist: 'Billie Eilish' },
    { name: 'Hollywood\'s Bleeding', artist: 'Post Malone' },
    { name: 'Positions', artist: 'Ariana Grande' },
    { name: 'Certified Lover Boy', artist: 'Drake' },
  ];
  
  return albums.map((album, i) => ({
    id: `album-${i}`,
    name: album.name,
    artist: album.artist,
    image: getImageUrl(`album-${album.name}`),
    year: 2020 + (i % 4),
  }));
};
