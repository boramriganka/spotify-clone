import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NeoTrack } from '../../utils/trackNormalizer';
import { PlaybackSession, PlaybackCheckpoint } from '../persistence/playbackPersistence';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error' | 'unavailable' | 'blocked';

interface PlaybackState {
  currentTrack: NeoTrack | null;
  status: PlaybackStatus;
  positionMs: number;
  durationMs: number;
  volume: number;
  error: string | null;
  session: PlaybackSession | null;
  checkpoint: PlaybackCheckpoint | null;
  isRestored: boolean;
}

const initialState: PlaybackState = {
  currentTrack: null,
  status: 'idle',
  positionMs: 0,
  durationMs: 0,
  volume: 0.7,
  error: null,
  session: null,
  checkpoint: null,
  isRestored: false,
};

const playbackSlice = createSlice({
  name: 'playback',
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<NeoTrack | null>) => {
      state.currentTrack = action.payload;
      if (action.payload) {
        state.status = 'loading';
      } else {
        state.status = 'idle';
      }
      state.positionMs = 0;
      state.error = null;
    },
    setStatus: (state, action: PayloadAction<PlaybackStatus>) => {
      state.status = action.payload;
    },
    setPosition: (state, action: PayloadAction<number>) => {
      state.positionMs = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.durationMs = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.status = 'error';
      }
    },
    setSession: (state, action: PayloadAction<PlaybackSession | null>) => {
      state.session = action.payload;
    },
    setCheckpoint: (state, action: PayloadAction<PlaybackCheckpoint | null>) => {
      state.checkpoint = action.payload;
    },
    restoreSession: (state, action: PayloadAction<{ session: PlaybackSession; checkpoint: PlaybackCheckpoint | null; track: NeoTrack | null }>) => {
      state.session = action.payload.session;
      state.checkpoint = action.payload.checkpoint;
      state.currentTrack = action.payload.track;
      if (action.payload.checkpoint) {
        state.positionMs = action.payload.checkpoint.positionMs;
      }
      state.status = 'paused';
      state.isRestored = true;
    },
    completeRestoration: (state) => {
      state.isRestored = true;
    }
  }
});

export const {
  setTrack,
  setStatus,
  setPosition,
  setDuration,
  setVolume,
  setError,
  setSession,
  setCheckpoint,
  restoreSession,
  completeRestoration
} = playbackSlice.actions;

export default playbackSlice.reducer;
