import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NeoTrack } from '../../utils/trackNormalizer';
import { QueueSnapshot } from '../persistence/playbackPersistence';

export interface QueueItem {
  id: string;
  trackId: string;
  track: NeoTrack;
  sourcePosition: number;
  availability: 'playable' | 'unavailable';
}

interface QueueState {
  snapshot: QueueSnapshot | null;
  items: QueueItem[];
  currentIndex: number;
  repeatMode: 'off' | 'one' | 'all';
  shuffleEnabled: boolean;
  shuffledIndices: number[];
}

const initialState: QueueState = {
  snapshot: null,
  items: [],
  currentIndex: -1,
  repeatMode: 'off',
  shuffleEnabled: false,
  shuffledIndices: [],
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    setQueue: (state, action: PayloadAction<{ snapshot: QueueSnapshot; items: QueueItem[]; currentIndex: number }>) => {
      state.snapshot = action.payload.snapshot;
      state.items = action.payload.items;
      state.currentIndex = action.payload.currentIndex;
      if (state.shuffleEnabled) {
        state.shuffledIndices = Array.from(Array(state.items.length).keys()).sort(() => Math.random() - 0.5);
      }
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    addNext: (state, action: PayloadAction<QueueItem>) => {
      state.items.splice(state.currentIndex + 1, 0, action.payload);
      // Logic for shuffle indices adjustment would go here
    },
    appendToQueue: (state, action: PayloadAction<QueueItem>) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleShuffle: (state) => {
      state.shuffleEnabled = !state.shuffleEnabled;
      if (state.shuffleEnabled) {
        state.shuffledIndices = Array.from(Array(state.items.length).keys()).sort(() => Math.random() - 0.5);
      } else {
        state.shuffledIndices = [];
      }
    },
    setRepeatMode: (state, action: PayloadAction<QueueState['repeatMode']>) => {
      state.repeatMode = action.payload;
    },
    clearQueue: (state) => {
      state.snapshot = null;
      state.items = [];
      state.currentIndex = -1;
      state.shuffledIndices = [];
    }
  }
});

export const {
  setQueue,
  setCurrentIndex,
  addNext,
  appendToQueue,
  removeItem,
  toggleShuffle,
  setRepeatMode,
  clearQueue
} = queueSlice.actions;

export default queueSlice.reducer;
