import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './slices/playerSlice';
import uiReducer from './slices/uiSlice';
import playbackReducer from '../core/player/playbackSlice';
import queueReducer from '../core/queue/queueSlice';
import { persistenceMiddleware } from './middleware/persistenceMiddleware';

export const store = configureStore({
  reducer: {
    player: playerReducer, // Keeping for legacy support and library data
    ui: uiReducer,
    playback: playbackReducer,
    queue: queueReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
