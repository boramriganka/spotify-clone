import { Middleware } from '@reduxjs/toolkit';
import { persistenceService } from '../../services/persistenceService';

export const persistenceMiddleware: Middleware = store => next => action => {
  const result = next(action);
  const state = store.getState().player;

  // Sync state to persistence service after specific actions
  const type = (action as any).type;

  if (type.startsWith('player/')) {
    if (type.includes('setCurrentTrack') || type.includes('nextTrack') || type.includes('previousTrack')) {
      const track = state.currentTrackId ? state.tracksById[state.currentTrackId] : null;
      persistenceService.setCurrentTrack(track);

      // Sync recently played
      persistenceService.setRecentlyPlayed(state.recentlyPlayedIds.map((id: string) => state.tracksById[id]));
    }

    if (type.includes('setQueue') || type.includes('addToQueue') || type.includes('playNext') || type.includes('removeFromQueue') || type.includes('clearQueue')) {
      persistenceService.setQueue(state.queue.map((item: any) => state.tracksById[item.trackId]));
    }

    if (type.includes('toggleLike')) {
      persistenceService.setLikedTrackIds(state.likedTrackIds);
    }

    if (type.includes('addPlaylist') || type.includes('removePlaylist') || type.includes('updatePlaylist')) {
      persistenceService.setCreatedPlaylists(state.createdPlaylistIds.map((id: string) => state.playlistsById[id]));
    }

    if (type.includes('setVolume') || type.includes('toggleShuffle') || type.includes('toggleRepeat')) {
      persistenceService.setSettings({
        volume: state.volume,
        isShuffled: state.isShuffled,
        repeatMode: state.repeatMode
      });
    }
  }

  return result;
};
