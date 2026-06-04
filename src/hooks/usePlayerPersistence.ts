import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { playbackPersistence } from '../core/persistence/playbackPersistence';
import { restoreSession, completeRestoration } from '../core/player/playbackSlice';
import { setQueue } from '../core/queue/queueSlice';

export const usePlayerPersistence = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const session = playbackPersistence.loadSession();
        const snapshot = playbackPersistence.loadQueueSnapshot();
        const items = playbackPersistence.loadQueueItems();
        const checkpoint = playbackPersistence.loadCheckpoint();

        if (session && snapshot && items.length > 0) {
          // Find the track for the session
          const currentItem = items.find(item => item.trackId === session.activeTrackId) || items[session.currentIndex];
          const track = currentItem ? currentItem.track : null;

          dispatch(setQueue({
            snapshot,
            items,
            currentIndex: session.currentIndex
          }));

          dispatch(restoreSession({
            session,
            checkpoint,
            track
          }));
        }
      } catch (e) {
        console.error('Failed to hydrate player state', e);
      } finally {
        dispatch(completeRestoration());
      }
    };

    hydrate();
  }, [dispatch]);
};
