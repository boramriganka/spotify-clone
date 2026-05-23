import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Track } from '../../providers/types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  shuffledQueue: Track[];
  repeatMode: 'off' | 'one' | 'all';
  likedTrackIds: string[];
  currentDevice: string;
}

const loadState = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const initialState: PlayerState = {
  currentTrack: loadState('spotify_currentTrack', null),
  queue: loadState('spotify_queue', []),
  currentIndex: loadState('spotify_currentIndex', -1),
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: loadState('spotify_volume', 0.7),
  isShuffled: loadState('spotify_isShuffled', false),
  shuffledQueue: loadState('spotify_shuffledQueue', []),
  repeatMode: loadState('spotify_repeatMode', 'off'),
  likedTrackIds: loadState('spotify_likedTrackIds', []),
  currentDevice: "Mriganka’s OnePlus Buds 4",
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<{ track: Track; queue?: Track[]; index?: number }>) => {
      state.currentTrack = action.payload.track;

      if (action.payload.queue) {
        state.queue = action.payload.queue;
        state.currentIndex = action.payload.index !== undefined
          ? action.payload.index
          : state.queue.findIndex(t => t.id === action.payload.track.id);
      } else {
        // If track not in queue, add it to end
        const existingIdx = state.queue.findIndex(t => t.id === action.payload.track.id);
        if (existingIdx === -1) {
          state.queue.push(action.payload.track);
          state.currentIndex = state.queue.length - 1;
        } else {
          state.currentIndex = existingIdx;
        }
      }

      if (state.isShuffled) {
        // If we just set a new queue and shuffle is on, reshuffle
        const otherTracks = state.queue.filter(t => t.id !== state.currentTrack?.id);
        state.shuffledQueue = [state.currentTrack!, ...otherTracks.sort(() => Math.random() - 0.5)];
        state.currentIndex = 0;
        localStorage.setItem('spotify_shuffledQueue', JSON.stringify(state.shuffledQueue));
      }

      state.isPlaying = true;
      state.progress = 0;
      state.duration = action.payload.track.duration;

      // Persist
      localStorage.setItem('spotify_currentTrack', JSON.stringify(state.currentTrack));
      localStorage.setItem('spotify_queue', JSON.stringify(state.queue));
      localStorage.setItem('spotify_currentIndex', JSON.stringify(state.currentIndex));

      // Add to recently played
      const recent = loadState('spotify_recentlyPlayed', []);
      const updatedRecent = [action.payload.track, ...recent.filter((t: any) => t.id !== action.payload.track.id)].slice(0, 20);
      localStorage.setItem('spotify_recentlyPlayed', JSON.stringify(updatedRecent));
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    seekTo: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
      localStorage.setItem('spotify_volume', JSON.stringify(state.volume));
    },
    nextTrack: (state) => {
      const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue;
      if (activeQueue.length === 0) return;

      let nextIndex = state.currentIndex + 1;
      if (nextIndex >= activeQueue.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          state.isPlaying = false;
          return;
        }
      }

      state.currentIndex = nextIndex;
      state.currentTrack = activeQueue[nextIndex];
      state.progress = 0;
      state.duration = state.currentTrack.duration;
      state.isPlaying = true;
      localStorage.setItem('spotify_currentTrack', JSON.stringify(state.currentTrack));
      localStorage.setItem('spotify_currentIndex', JSON.stringify(state.currentIndex));
    },
    previousTrack: (state) => {
      const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue;
      if (activeQueue.length === 0) return;

      // If more than 3 seconds in, restart track
      if (state.progress > 3) {
        state.progress = 0;
        return;
      }

      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        if (state.repeatMode === 'all') {
          prevIndex = activeQueue.length - 1;
        } else {
          state.progress = 0;
          return;
        }
      }

      state.currentIndex = prevIndex;
      state.currentTrack = activeQueue[prevIndex];
      state.progress = 0;
      state.duration = state.currentTrack.duration;
      state.isPlaying = true;
      localStorage.setItem('spotify_currentTrack', JSON.stringify(state.currentTrack));
      localStorage.setItem('spotify_currentIndex', JSON.stringify(state.currentIndex));
    },
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled;
      if (state.isShuffled && state.currentTrack) {
        const otherTracks = state.queue.filter(t => t.id !== state.currentTrack?.id);
        state.shuffledQueue = [state.currentTrack, ...otherTracks.sort(() => Math.random() - 0.5)];
        state.currentIndex = 0;
        localStorage.setItem('spotify_shuffledQueue', JSON.stringify(state.shuffledQueue));
        localStorage.setItem('spotify_currentIndex', JSON.stringify(state.currentIndex));
      }
      localStorage.setItem('spotify_isShuffled', JSON.stringify(state.isShuffled));
    },
    toggleRepeat: (state) => {
      const modes: PlayerState['repeatMode'][] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      state.repeatMode = modes[nextIdx];
      localStorage.setItem('spotify_repeatMode', JSON.stringify(state.repeatMode));
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.likedTrackIds.includes(id)) {
        state.likedTrackIds = state.likedTrackIds.filter(i => i !== id);
      } else {
        state.likedTrackIds.push(id);
      }
      localStorage.setItem('spotify_likedTrackIds', JSON.stringify(state.likedTrackIds));
    },
    setQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue = action.payload;
      localStorage.setItem('spotify_queue', JSON.stringify(state.queue));
    },
    addToQueue: (state, action: PayloadAction<Track>) => {
      state.queue.push(action.payload);
      localStorage.setItem('spotify_queue', JSON.stringify(state.queue));
    },
    playNext: (state, action: PayloadAction<Track>) => {
      state.queue.splice(state.currentIndex + 1, 0, action.payload);
      localStorage.setItem('spotify_queue', JSON.stringify(state.queue));
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(t => t.id !== action.payload);
      localStorage.setItem('spotify_queue', JSON.stringify(state.queue));
    }
  },
});

export const {
  setTrack,
  togglePlay,
  setIsPlaying,
  setProgress,
  setVolume,
  nextTrack,
  previousTrack,
  toggleShuffle,
  toggleRepeat,
  toggleLike,
  setQueue,
  seekTo,
  addToQueue,
  playNext,
  removeFromQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
