import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isAiDjOpen: boolean;
  isAccountDrawerOpen: boolean;
  isNowPlayingOpen: boolean;
}

const initialState: UiState = {
  isAiDjOpen: false,
  isAccountDrawerOpen: false,
  isNowPlayingOpen: localStorage.getItem('spotify_neo_isNowPlayingOpen') === 'true',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setAiDjOpen: (state, action: PayloadAction<boolean>) => {
      state.isAiDjOpen = action.payload;
    },
    setAccountDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isAccountDrawerOpen = action.payload;
    },
    setNowPlayingOpen: (state, action: PayloadAction<boolean>) => {
      state.isNowPlayingOpen = action.payload;
      localStorage.setItem('spotify_neo_isNowPlayingOpen', action.payload.toString());
    },
    toggleAiDj: (state) => {
      state.isAiDjOpen = !state.isAiDjOpen;
    }
  },
});

export const { setAiDjOpen, setAccountDrawerOpen, setNowPlayingOpen, toggleAiDj } = uiSlice.actions;
export default uiSlice.reducer;
