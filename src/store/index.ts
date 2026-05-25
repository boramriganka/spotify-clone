import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './slices/playerSlice';
import musicReducer from './slices/musicSlice';

export const store = configureStore({
  reducer: {
    player: playerReducer,
    music: musicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
