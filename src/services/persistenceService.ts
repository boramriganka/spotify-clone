import { Track, Artist, Album, Playlist } from '../providers/types';

export const persistenceService = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`spotify_neo_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  },

  load: <T>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(`spotify_neo_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error('Error loading from localStorage', e);
      return defaultValue;
    }
  },

  // Specific helpers
  getLikedTracks: () => persistenceService.load<Track[]>('likedTracks', []),
  setLikedTracks: (tracks: Track[]) => persistenceService.save('likedTracks', tracks),

  getQueue: () => persistenceService.load<Track[]>('queue', []),
  setQueue: (queue: Track[]) => persistenceService.save('queue', queue),

  getCurrentTrack: () => persistenceService.load<Track | null>('currentTrack', null),
  setCurrentTrack: (track: Track | null) => persistenceService.save('currentTrack', track),

  getRecentlyPlayed: () => persistenceService.load<Track[]>('recentlyPlayed', []),
  setRecentlyPlayed: (tracks: Track[]) => persistenceService.save('recentlyPlayed', tracks),

  getCreatedPlaylists: () => persistenceService.load<Playlist[]>('createdPlaylists', []),
  setCreatedPlaylists: (playlists: Playlist[]) => persistenceService.save('createdPlaylists', playlists),

  getSettings: () => persistenceService.load<any>('settings', {
    showOnlyFullSongs: false,
    volume: 0.7,
    isShuffled: false,
    repeatMode: 'off'
  }),
  setSettings: (settings: any) => persistenceService.save('settings', settings),
};
