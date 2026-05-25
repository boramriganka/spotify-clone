import { Playlist } from '../providers/types';

const PLAYLISTS_KEY = 'spotify_clone_user_playlists';

export const getUserPlaylists = (): Playlist[] => {
  const stored = localStorage.getItem(PLAYLISTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const saveUserPlaylist = (title: string): Playlist => {
  const playlists = getUserPlaylists();
  const newPlaylist: Playlist = {
    id: `local-playlist-${Date.now()}`,
    title,
    description: 'A new custom playlist',
    artworkUrl: 'https://picsum.photos/seed/playlist/300/300',
    owner: 'Mriganka',
    trackIds: [],
    type: 'playlist'
  };
  playlists.push(newPlaylist);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  window.dispatchEvent(new Event('playlists_updated'));
  return newPlaylist;
};

export const addTrackToPlaylist = (playlistId: string, trackId: string) => {
  const playlists = getUserPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    if (!playlist.trackIds.includes(trackId)) {
      playlist.trackIds.push(trackId);
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
      window.dispatchEvent(new Event('playlists_updated'));
    }
  }
};
