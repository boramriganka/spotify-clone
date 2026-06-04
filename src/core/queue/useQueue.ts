import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setQueue,
  setCurrentIndex,
  addNext as addNextAction,
  appendToQueue as appendAction,
  removeItem,
  toggleShuffle,
  setRepeatMode,
  clearQueue,
  QueueItem
} from './queueSlice';
import { NeoTrack, normalizeTrack } from '../../utils/trackNormalizer';
import { usePlaybackController } from '../player/usePlaybackController';
import { QueueSnapshot } from '../persistence/playbackPersistence';

export const useQueue = () => {
  const dispatch = useDispatch();
  const { items, currentIndex, repeatMode, shuffleEnabled } = useSelector((state: RootState) => state.queue);
  const { playTrack } = usePlaybackController();

  const startPlaybackFromContext = (params: {
    sourceType: QueueSnapshot['sourceType'];
    sourceId: string;
    tracks: any[];
    startTrackId?: string;
  }) => {
    const normalizedTracks = params.tracks.map(normalizeTrack);
    const queueItems: QueueItem[] = normalizedTracks.map((track, index) => ({
      id: `${params.sourceType}-${params.sourceId}-${track.id}-${index}`,
      trackId: track.id,
      track,
      sourcePosition: index,
      availability: 'playable'
    }));

    const snapshot: QueueSnapshot = {
      id: `${params.sourceType}-${params.sourceId}-${Date.now()}`,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      queueItemIds: queueItems.map(item => item.id),
      createdAt: Date.now()
    };

    let startIndex = 0;
    if (params.startTrackId) {
      startIndex = normalizedTracks.findIndex(t => t.id === params.startTrackId);
      if (startIndex === -1) startIndex = 0;
    }

    dispatch(setQueue({ snapshot, items: queueItems, currentIndex: startIndex }));
    playTrack(normalizedTracks[startIndex]);
  };

  const playNow = (track: any) => {
    const normalized = normalizeTrack(track);
    const item: QueueItem = {
      id: `manual-${normalized.id}-${Date.now()}`,
      trackId: normalized.id,
      track: normalized,
      sourcePosition: 0,
      availability: 'playable'
    };

    // For a simple playNow, we could either clear and set a 1-item queue
    // or just insert it at the current position.
    // Let's go with inserting and moving index.
    dispatch(addNextAction(item));
    dispatch(setCurrentIndex(currentIndex + 1));
    playTrack(normalized);
  };

  const next = () => {
    if (currentIndex < items.length - 1) {
      const nextIndex = currentIndex + 1;
      dispatch(setCurrentIndex(nextIndex));
      playTrack(items[nextIndex].track);
    } else if (repeatMode === 'all' && items.length > 0) {
      dispatch(setCurrentIndex(0));
      playTrack(items[0].track);
    }
  };

  const previous = (positionMs: number) => {
    if (positionMs > 3000) {
      playTrack(items[currentIndex].track);
      return;
    }

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      dispatch(setCurrentIndex(prevIndex));
      playTrack(items[prevIndex].track);
    } else if (repeatMode === 'all' && items.length > 0) {
      const lastIndex = items.length - 1;
      dispatch(setCurrentIndex(lastIndex));
      playTrack(items[lastIndex].track);
    }
  };

  return {
    items,
    currentIndex,
    repeatMode,
    shuffleEnabled,
    startPlaybackFromContext,
    playNow,
    next,
    previous,
    addNext: (track: any) => {
        const normalized = normalizeTrack(track);
        dispatch(addNextAction({
            id: `manual-${normalized.id}-${Date.now()}`,
            trackId: normalized.id,
            track: normalized,
            sourcePosition: 0,
            availability: 'playable'
        }));
    },
    append: (track: any) => {
        const normalized = normalizeTrack(track);
        dispatch(appendAction({
            id: `manual-${normalized.id}-${Date.now()}`,
            trackId: normalized.id,
            track: normalized,
            sourcePosition: 0,
            availability: 'playable'
        }));
    },
    remove: (id: string) => dispatch(removeItem(id)),
    toggleShuffle: () => dispatch(toggleShuffle()),
    setRepeatMode: (mode: 'off' | 'one' | 'all') => dispatch(setRepeatMode(mode)),
    clearQueue: () => dispatch(clearQueue())
  };
};
