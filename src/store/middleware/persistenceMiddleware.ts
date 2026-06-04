import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { playbackPersistence } from '../../core/persistence/playbackPersistence';
import { setTrack, setStatus, setPosition } from '../../core/player/playbackSlice';
import { setQueue, setCurrentIndex } from '../../core/queue/queueSlice';
import { toggleLike } from '../../store/slices/playerSlice';

const SAVE_INTERVAL_MS = 10000; // Throttle checkpoint saves to every 10 seconds

export const createPersistenceMiddleware = (): Middleware => {
  let lastSaveTime = 0;

  return store => next => action => {
    const result = next(action);
    const state = store.getState();
    const type = (action as any).type;

    // Handle new architecture persistence
    if (type.startsWith('playback/') || type.startsWith('queue/')) {
      const { playback, queue } = state;

      const isCriticalAction =
          setTrack.match(action) ||
          setQueue.match(action) ||
          setStatus.match(action) ||
          setCurrentIndex.match(action);

      const now = Date.now();
      const shouldSaveCheckpoint = isCriticalAction || (now - lastSaveTime > SAVE_INTERVAL_MS);

      if (shouldSaveCheckpoint) {
          try {
              if (queue.snapshot) {
                  playbackPersistence.saveQueueSnapshot(queue.snapshot);
                  playbackPersistence.saveQueueItems(queue.items);
              }

              if (playback.currentTrack && queue.snapshot?.id) {
                  const sessionId = playback.session?.id || `session-${queue.snapshot.id}`;

                  playbackPersistence.saveSession({
                      id: sessionId,
                      queueSnapshotId: queue.snapshot.id,
                      currentIndex: queue.currentIndex,
                      repeatMode: queue.repeatMode,
                      shuffleEnabled: queue.shuffleEnabled,
                      shuffleSeed: queue.shuffleSeed || 0,
                      activeTrackId: playback.currentTrack.id
                  });

                  playbackPersistence.saveCheckpoint({
                      sessionId: sessionId,
                      queueSnapshotId: queue.snapshot.id,
                      currentIndex: queue.currentIndex,
                      trackId: playback.currentTrack.id,
                      positionMs: playback.positionMs,
                      updatedAt: now
                  });
              }
              lastSaveTime = now;
          } catch (e) {
              console.error('Failed to persist playback state', e);
          }
      }
    }

    // Legacy player slice persistence
    if (toggleLike.match(action)) {
      try {
        const playerState = state.player;
        playbackPersistence.saveFavourites(playerState.likedTrackIds.map((id: string) => playerState.tracksById[id]));
      } catch (e) {
        console.error('Failed to persist favourites', e);
      }
    }

    return result;
  };
};

export const persistenceMiddleware = createPersistenceMiddleware();
