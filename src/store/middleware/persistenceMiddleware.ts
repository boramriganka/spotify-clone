import { Middleware } from '@reduxjs/toolkit';
import { playbackPersistence } from '../../core/persistence/playbackPersistence';

let lastSaveTime = 0;
const SAVE_INTERVAL_MS = 10000; // Throttle checkpoint saves to every 10 seconds

export const persistenceMiddleware: Middleware = store => next => action => {
  const result = next(action);
  const state = store.getState();
  const type = (action as any).type;

  // Handle new architecture persistence
  if (type.startsWith('playback/') || type.startsWith('queue/')) {
    const { playback, queue } = state;

    // Immediate save for critical state changes
    const isCriticalAction =
        type.includes('setTrack') ||
        type.includes('setQueue') ||
        type.includes('setStatus') ||
        type.includes('setCurrentIndex');

    const now = Date.now();
    const shouldSaveCheckpoint = isCriticalAction || (now - lastSaveTime > SAVE_INTERVAL_MS);

    if (shouldSaveCheckpoint) {
        if (queue.snapshot) {
            playbackPersistence.saveQueueSnapshot(queue.snapshot);
            playbackPersistence.saveQueueItems(queue.items);
        }

        if (playback.currentTrack) {
            playbackPersistence.saveSession({
                id: playback.session?.id || 'default',
                queueSnapshotId: queue.snapshot?.id || 'default',
                currentIndex: queue.currentIndex,
                repeatMode: queue.repeatMode,
                shuffleEnabled: queue.shuffleEnabled,
                shuffleSeed: 0,
                activeTrackId: playback.currentTrack.id
            });

            playbackPersistence.saveCheckpoint({
                sessionId: playback.session?.id || 'default',
                queueSnapshotId: queue.snapshot?.id || 'default',
                currentIndex: queue.currentIndex,
                trackId: playback.currentTrack.id,
                positionMs: playback.positionMs,
                updatedAt: now
            });
        }
        lastSaveTime = now;
    }
  }

  // Legacy player slice persistence
  if (type.startsWith('player/')) {
    const playerState = state.player;
    if (type.includes('toggleLike')) {
      playbackPersistence.saveFavourites(playerState.likedTrackIds.map((id: string) => playerState.tracksById[id]));
    }
  }

  return result;
};
