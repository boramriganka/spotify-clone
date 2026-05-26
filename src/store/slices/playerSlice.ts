import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Track, Artist, Album, Playlist, MediaItem } from '../../providers/types';
import { persistenceService } from '../../services/persistenceService';

export interface QueueItem {
  trackId: string;
  origin: "playlist" | "search" | "home" | "ai-dj" | "alternatives" | "manual" | "autoplay";
  contextId?: string;
  addedAt: number;
}

interface PlayerState {
  // Normalized Data
  tracksById: Record<string, Track>;
  artistsById: Record<string, Artist>;
  albumsById: Record<string, Album>;
  playlistsById: Record<string, Playlist>;

  // Playback State
  currentTrackId: string | null;
  queue: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  shuffledQueue: QueueItem[];
  repeatMode: 'off' | 'one' | 'all';

  // Library State
  likedTrackIds: string[];
  recentlyPlayedIds: string[];
  createdPlaylistIds: string[];
  currentDevice: string;

  // UI State
  searchResults: string[]; // MediaItem IDs
  searchLoading: boolean;

  // Provider Health
  providerStatus: {
    audius: 'active' | 'failing';
    jamendo: 'active' | 'failing' | 'missing_key';
    itunes: 'active' | 'failing';
    lastError: string | null;
    lastFallback: string | null;
  };
}

const settings = persistenceService.getSettings();

const initialState: PlayerState = {
  tracksById: {},
  artistsById: {},
  albumsById: {},
  playlistsById: {},

  currentTrackId: persistenceService.getCurrentTrack()?.id || null,
  queue: persistenceService.getQueue().map(t => ({
    trackId: t.id,
    origin: 'manual',
    addedAt: Date.now()
  })),
  currentIndex: -1,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: settings.volume,
  isShuffled: settings.isShuffled,
  shuffledQueue: [],
  repeatMode: settings.repeatMode,

  likedTrackIds: persistenceService.getLikedTrackIds(),
  recentlyPlayedIds: persistenceService.getRecentlyPlayed().map(t => t.id),
  createdPlaylistIds: persistenceService.getCreatedPlaylists().map(p => p.id),
  currentDevice: "Mriganka’s OnePlus Buds 4",

  searchResults: [],
  searchLoading: false,

  providerStatus: {
    audius: 'active',
    jamendo: 'active',
    itunes: 'active',
    lastError: null,
    lastFallback: null
  }
};

// Pre-populate tracksById from persisted data
const persistedTracks = [
  ...(persistenceService.getCurrentTrack() ? [persistenceService.getCurrentTrack()!] : []),
  ...persistenceService.getQueue(),
  ...persistenceService.getRecentlyPlayed(),
];

persistedTracks.forEach(t => {
  if (t) initialState.tracksById[t.id] = t;
});

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setTracks: (state, action: PayloadAction<Track[]>) => {
      action.payload.forEach(track => {
        state.tracksById[track.id] = track;
      });
    },
    setArtists: (state, action: PayloadAction<Artist[]>) => {
      action.payload.forEach(artist => {
        state.artistsById[artist.id] = artist;
      });
    },
    setCurrentTrack: (state, action: PayloadAction<string | null>) => {
      state.currentTrackId = action.payload;
      if (action.payload && state.tracksById[action.payload]) {
        // Add to recently played
        const id = action.payload;
        state.recentlyPlayedIds = [id, ...state.recentlyPlayedIds.filter(i => i !== id)].slice(0, 50);
      }
    },
    setQueue: (state, action: PayloadAction<QueueItem[]>) => {
      state.queue = action.payload;

      if (state.isShuffled && state.currentTrackId) {
        const currentItem = state.queue.find(item => item.trackId === state.currentTrackId);
        const otherItems = state.queue.filter(item => item.trackId !== state.currentTrackId);
        state.shuffledQueue = currentItem
          ? [currentItem, ...otherItems.sort(() => Math.random() - 0.5)]
          : [...state.queue].sort(() => Math.random() - 0.5);
      }
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    seekTo: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.likedTrackIds.includes(id)) {
        state.likedTrackIds = state.likedTrackIds.filter(i => i !== id);
      } else {
        state.likedTrackIds.push(id);
      }
    },
    nextTrack: (state) => {
      const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue;
      if (activeQueue.length === 0) return;

      const currentIndex = activeQueue.findIndex(item => item.trackId === state.currentTrackId);
      let nextIndex = currentIndex + 1;

      if (nextIndex >= activeQueue.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          state.isPlaying = false;
          return;
        }
      }

      state.currentTrackId = activeQueue[nextIndex].trackId;
      state.progress = 0;
      state.isPlaying = true;
    },
    previousTrack: (state) => {
      const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue;
      if (activeQueue.length === 0) return;

      if (state.progress > 3) {
        state.progress = 0;
        return;
      }

      const currentIndex = activeQueue.findIndex(item => item.trackId === state.currentTrackId);
      let prevIndex = currentIndex - 1;

      if (prevIndex < 0) {
        if (state.repeatMode === 'all') {
          prevIndex = activeQueue.length - 1;
        } else {
          state.progress = 0;
          return;
        }
      }

      state.currentTrackId = activeQueue[prevIndex].trackId;
      state.progress = 0;
      state.isPlaying = true;
    },
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled;
      if (state.isShuffled && state.currentTrackId) {
        const currentItem = state.queue.find(item => item.trackId === state.currentTrackId);
        const otherItems = state.queue.filter(item => item.trackId !== state.currentTrackId);
        state.shuffledQueue = currentItem
          ? [currentItem, ...otherItems.sort(() => Math.random() - 0.5)]
          : [...state.queue].sort(() => Math.random() - 0.5);
      }
    },
    toggleRepeat: (state) => {
      const modes: PlayerState['repeatMode'][] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      state.repeatMode = modes[nextIdx];
    },
    addToQueue: (state, action: PayloadAction<QueueItem>) => {
      state.queue.push(action.payload);
    },
    playNext: (state, action: PayloadAction<QueueItem>) => {
      const currentIndex = state.queue.findIndex(item => item.trackId === state.currentTrackId);
      state.queue.splice(currentIndex + 1, 0, action.payload);
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(item => item.trackId !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = state.currentTrackId ? state.queue.filter(item => item.trackId === state.currentTrackId) : [];
      state.shuffledQueue = [];
    },
    setProviderStatus: (state, action: PayloadAction<Partial<PlayerState['providerStatus']>>) => {
      state.providerStatus = { ...state.providerStatus, ...action.payload };
    },
    addPlaylist: (state, action: PayloadAction<Playlist>) => {
      state.playlistsById[action.payload.id] = action.payload;
      if (!state.createdPlaylistIds.includes(action.payload.id)) {
        state.createdPlaylistIds.push(action.payload.id);
      }
    },
    removePlaylist: (state, action: PayloadAction<string>) => {
      delete state.playlistsById[action.payload];
      state.createdPlaylistIds = state.createdPlaylistIds.filter(id => id !== action.payload);
    },
    updatePlaylist: (state, action: PayloadAction<{ id: string, tracks: Track[] }>) => {
      if (state.playlistsById[action.payload.id]) {
        state.playlistsById[action.payload.id].tracks = action.payload.tracks;
      }
    }
  },
});

export const {
  setTracks,
  setArtists,
  setCurrentTrack,
  setQueue,
  setIsPlaying,
  setProgress,
  setDuration,
  setVolume,
  toggleLike,
  nextTrack,
  previousTrack,
  toggleShuffle,
  toggleRepeat,
  addToQueue,
  playNext,
  removeFromQueue,
  clearQueue,
  setProviderStatus,
  addPlaylist,
  removePlaylist,
  updatePlaylist,
  seekTo,
} = playerSlice.actions;

export default playerSlice.reducer;
