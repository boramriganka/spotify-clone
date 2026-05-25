import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Track, Artist, Album, Playlist } from '../../providers/types';

interface MusicState {
  tracksById: Record<string, Track>;
  artistsById: Record<string, Artist>;
  albumsById: Record<string, Album>;
  playlistsById: Record<string, Playlist>;
  likedTrackIds: string[];
  followedArtistIds: string[];
  followedPlaylistIds: string[];
  createdPlaylistIds: string[];
  recentlyPlayedIds: string[];
  searchResults: string[];
  fullSongOnly: boolean;
  hidePreviewOnly: boolean;
  autoplay: boolean;
  dataSaver: boolean;
  privateSession: boolean;
}

const loadState = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const initialState: MusicState = {
  tracksById: {},
  artistsById: {},
  albumsById: {},
  playlistsById: {},
  likedTrackIds: loadState('spotify_likedTrackIds', []),
  followedArtistIds: loadState('spotify_followedArtistIds', []),
  followedPlaylistIds: loadState('spotify_followedPlaylistIds', []),
  createdPlaylistIds: loadState('spotify_createdPlaylistIds', []),
  recentlyPlayedIds: loadState('spotify_recentlyPlayedIds', []),
  searchResults: [],
  fullSongOnly: loadState('spotify_fullSongOnly', false),
  hidePreviewOnly: loadState('spotify_hidePreviewOnly', false),
  autoplay: loadState('spotify_autoplay', true),
  dataSaver: loadState('spotify_dataSaver', false),
  privateSession: loadState('spotify_privateSession', false),
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    addTracks: (state, action: PayloadAction<Track[]>) => {
      action.payload.forEach(track => {
        state.tracksById[track.id] = track;
      });
    },
    addArtists: (state, action: PayloadAction<Artist[]>) => {
      action.payload.forEach(artist => {
        state.artistsById[artist.id] = artist;
      });
    },
    addAlbums: (state, action: PayloadAction<Album[]>) => {
      action.payload.forEach(album => {
        state.albumsById[album.id] = album;
      });
    },
    addPlaylists: (state, action: PayloadAction<Playlist[]>) => {
      action.payload.forEach(playlist => {
        state.playlistsById[playlist.id] = playlist;
      });
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.likedTrackIds.includes(id)) {
        state.likedTrackIds = state.likedTrackIds.filter(i => i !== id);
      } else {
        state.likedTrackIds.unshift(id);
      }
      localStorage.setItem('spotify_likedTrackIds', JSON.stringify(state.likedTrackIds));
    },
    toggleFollowArtist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.followedArtistIds.includes(id)) {
        state.followedArtistIds = state.followedArtistIds.filter(i => i !== id);
      } else {
        state.followedArtistIds.unshift(id);
      }
      localStorage.setItem('spotify_followedArtistIds', JSON.stringify(state.followedArtistIds));
    },
    addRecentlyPlayed: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.recentlyPlayedIds = [id, ...state.recentlyPlayedIds.filter(i => i !== id)].slice(0, 50);
      localStorage.setItem('spotify_recentlyPlayedIds', JSON.stringify(state.recentlyPlayedIds));
    },
    updateSetting: (state, action: PayloadAction<{ key: keyof MusicState; value: any }>) => {
       const { key, value } = action.payload;
       (state as any)[key] = value;
       localStorage.setItem(`spotify_${String(key)}`, JSON.stringify(value));
    }
  }
});

export const {
  addTracks,
  addArtists,
  addAlbums,
  addPlaylists,
  toggleLike,
  toggleFollowArtist,
  addRecentlyPlayed,
  updateSetting
} = musicSlice.actions;

export default musicSlice.reducer;
