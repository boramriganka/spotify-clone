import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  currentTrackId: string | null;
  queue: string[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  shuffledQueue: string[];
  repeatMode: 'off' | 'one' | 'all';
  playbackError: string | null;
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
  currentTrackId: loadState('spotify_currentTrackId', null),
  queue: loadState('spotify_queueIds', []),
  currentIndex: loadState('spotify_currentIndex', -1),
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: loadState('spotify_volume', 0.7),
  isShuffled: loadState('spotify_isShuffled', false),
  shuffledQueue: loadState('spotify_shuffledQueueIds', []),
  repeatMode: loadState('spotify_repeatMode', 'off'),
  playbackError: null,
  currentDevice: "This phone",
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayback: (state, action: PayloadAction<{ trackId: string; queue?: string[]; index?: number }>) => {
      state.currentTrackId = action.payload.trackId;

      if (action.payload.queue) {
        state.queue = action.payload.queue;
        state.currentIndex = action.payload.index !== undefined
          ? action.payload.index
          : state.queue.indexOf(action.payload.trackId);
      } else {
        if (!state.queue.includes(action.payload.trackId)) {
          state.queue.push(action.payload.trackId);
          state.currentIndex = state.queue.length - 1;
        } else {
          state.currentIndex = state.queue.indexOf(action.payload.trackId);
        }
      }

      if (state.isShuffled) {
        const others = state.queue.filter(id => id !== state.currentTrackId);
        state.shuffledQueue = [state.currentTrackId, ...others.sort(() => Math.random() - 0.5)];
        state.currentIndex = 0;
      }

      state.isPlaying = true;
      state.progress = 0;
      state.playbackError = null;

      localStorage.setItem('spotify_currentTrackId', JSON.stringify(state.currentTrackId));
      localStorage.setItem('spotify_queueIds', JSON.stringify(state.queue));
      localStorage.setItem('spotify_currentIndex', JSON.stringify(state.currentIndex));
    },
    addToQueue: (state, action: PayloadAction<string>) => {
      if (!state.queue.includes(action.payload)) {
        state.queue.push(action.payload);
        if (state.isShuffled) {
          state.shuffledQueue.push(action.payload);
        }
        localStorage.setItem('spotify_queueIds', JSON.stringify(state.queue));
      }
    },
    playNext: (state, action: PayloadAction<string>) => {
      // Remove if already exists to move it
      state.queue = state.queue.filter(id => id !== action.payload);
      state.shuffledQueue = state.shuffledQueue.filter(id => id !== action.payload);

      const insertIndex = state.currentIndex + 1;
      state.queue.splice(insertIndex, 0, action.payload);

      if (state.isShuffled) {
        state.shuffledQueue.splice(insertIndex, 0, action.payload);
      }

      localStorage.setItem('spotify_queueIds', JSON.stringify(state.queue));
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
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
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
          state.currentIndex = activeQueue.length - 1;
          return;
        }
      }

      state.currentIndex = nextIndex;
      state.currentTrackId = activeQueue[nextIndex];
      state.progress = 0;
      state.isPlaying = true;
      localStorage.setItem('spotify_currentTrackId', JSON.stringify(state.currentTrackId));
      localStorage.setItem('spotify_currentIndex', JSON.stringify(state.currentIndex));
    },
    previousTrack: (state) => {
      const activeQueue = state.isShuffled ? state.shuffledQueue : state.queue;
      if (activeQueue.length === 0) return;

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
      state.currentTrackId = activeQueue[prevIndex];
      state.progress = 0;
      state.isPlaying = true;
      localStorage.setItem('spotify_currentTrackId', JSON.stringify(state.currentTrackId));
      localStorage.setItem('spotify_currentIndex', JSON.stringify(state.currentIndex));
    },
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled;
      if (state.isShuffled && state.currentTrackId) {
        const others = state.queue.filter(id => id !== state.currentTrackId);
        state.shuffledQueue = [state.currentTrackId, ...others.sort(() => Math.random() - 0.5)];
        state.currentIndex = 0;
      }
      localStorage.setItem('spotify_isShuffled', JSON.stringify(state.isShuffled));
    },
    toggleRepeat: (state) => {
      const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      state.repeatMode = modes[nextIdx];
      localStorage.setItem('spotify_repeatMode', JSON.stringify(state.repeatMode));
    },
    setPlaybackError: (state, action: PayloadAction<string | null>) => {
      state.playbackError = action.payload;
      state.isPlaying = false;
    }
  }
});

export const {
  setPlayback,
  addToQueue,
  playNext,
  togglePlay,
  setIsPlaying,
  setProgress,
  setDuration,
  nextTrack,
  previousTrack,
  toggleShuffle,
  toggleRepeat,
  setPlaybackError,
} = playerSlice.actions;

export default playerSlice.reducer;
