import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Track, Artist, Album, Playlist, MediaItem } from '../../providers/types';
import { persistenceService } from '../../services/persistenceService';

interface PlayerState {
  // Normalized Data
  tracksById: Record<string, Track>;
  artistsById: Record<string, Artist>;
  albumsById: Record<string, Album>;
  playlistsById: Record<string, Playlist>;

  // Playback State
  currentTrackId: string | null;
  queue: string[]; // array of track IDs
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  shuffledQueue: string[];
  repeatMode: 'off' | 'one' | 'all';

  // Library State
  likedTrackIds: string[];
  recentlyPlayedIds: string[];
  createdPlaylistIds: string[];
  currentDevice: string;

  // UI State
  searchResults: string[]; // MediaItem IDs
  searchLoading: boolean;
}

const settings = persistenceService.getSettings();

const initialState: PlayerState = {
  tracksById: {},
  artistsById: {},
  albumsById: {},
  playlistsById: {},

  currentTrackId: persistenceService.getCurrentTrack()?.id || null,
  queue: persistenceService.getQueue().map(t => t.id),
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
        persistenceService.setCurrentTrack(state.tracksById[action.payload]);

        // Add to recently played
        const id = action.payload;
        state.recentlyPlayedIds = [id, ...state.recentlyPlayedIds.filter(i => i !== id)].slice(0, 50);
        persistenceService.setRecentlyPlayed(state.recentlyPlayedIds.map(i => state.tracksById[i]));
      }
    },
    setQueue: (state, action: PayloadAction<string[]>) => {
      state.queue = action.payload;
      persistenceService.setQueue(state.queue.map(id => state.tracksById[id]));

      if (state.isShuffled && state.currentTrackId) {
        const otherIds = state.queue.filter(id => id !== state.currentTrackId);
        state.shuffledQueue = [state.currentTrackId, ...otherIds.sort(() => Math.random() - 0.5)];
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
      const settings = persistenceService.getSettings();
      persistenceService.setSettings({ ...settings, volume: action.payload });
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.likedTrackIds.includes(id)) {
        state.likedTrackIds = state.likedTrackIds.filter(i => i !== id);
      } else {
        state.likedTrackIds.push(id);
      }
      persistenceService.setLikedTrackIds(state.likedTrackIds);
    },
    nextTrack: (state) => {
      const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue;
      if (activeQueue.length === 0) return;

      let nextIndex = activeQueue.indexOf(state.currentTrackId || '') + 1;
      if (nextIndex >= activeQueue.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          state.isPlaying = false;
          return;
        }
      }

      state.currentTrackId = activeQueue[nextIndex];
      state.progress = 0;
      state.isPlaying = true;
      persistenceService.setCurrentTrack(state.tracksById[state.currentTrackId]);
    },
    previousTrack: (state) => {
      const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue;
      if (activeQueue.length === 0) return;

      if (state.progress > 3) {
        state.progress = 0;
        return;
      }

      let prevIndex = activeQueue.indexOf(state.currentTrackId || '') - 1;
      if (prevIndex < 0) {
        if (state.repeatMode === 'all') {
          prevIndex = activeQueue.length - 1;
        } else {
          state.progress = 0;
          return;
        }
      }

      state.currentTrackId = activeQueue[prevIndex];
      state.progress = 0;
      state.isPlaying = true;
      persistenceService.setCurrentTrack(state.tracksById[state.currentTrackId]);
    },
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled;
      if (state.isShuffled && state.currentTrackId) {
        const otherIds = state.queue.filter(id => id !== state.currentTrackId);
        state.shuffledQueue = [state.currentTrackId, ...otherIds.sort(() => Math.random() - 0.5)];
      }
      const settings = persistenceService.getSettings();
      persistenceService.setSettings({ ...settings, isShuffled: state.isShuffled });
    },
    toggleRepeat: (state) => {
      const modes: PlayerState['repeatMode'][] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      state.repeatMode = modes[nextIdx];
      const settings = persistenceService.getSettings();
      persistenceService.setSettings({ ...settings, repeatMode: state.repeatMode });
    },
    addToQueue: (state, action: PayloadAction<string>) => {
      state.queue.push(action.payload);
      persistenceService.setQueue(state.queue.map(id => state.tracksById[id]));
    },
    playNext: (state, action: PayloadAction<string>) => {
      const currentIndex = state.queue.indexOf(state.currentTrackId || '');
      state.queue.splice(currentIndex + 1, 0, action.payload);
      persistenceService.setQueue(state.queue.map(id => state.tracksById[id]));
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(id => id !== action.payload);
      persistenceService.setQueue(state.queue.map(id => state.tracksById[id]));
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
  seekTo,
} = playerSlice.actions;

export default playerSlice.reducer;
