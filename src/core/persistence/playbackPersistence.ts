import { storage } from './storage';
import { NeoTrack } from '../../utils/trackNormalizer';
import { QueueItem, QueueSnapshot } from '../queue/queueTypes';

export interface PlaybackSession {
  id: string;
  queueSnapshotId: string;
  currentIndex: number;
  repeatMode: 'off' | 'one' | 'all';
  shuffleEnabled: boolean;
  shuffleSeed: number;
  activeTrackId: string | null;
}

export interface PlaybackCheckpoint {
  sessionId: string;
  queueSnapshotId: string;
  currentIndex: number;
  trackId: string | null;
  positionMs: number;
  updatedAt: number;
}

const KEYS = {
  QUEUE_SNAPSHOT: 'queue_snapshot',
  QUEUE_ITEMS: 'queue_items',
  SESSION: 'playback_session',
  CHECKPOINT: 'playback_checkpoint',
  RECENT_TRACKS: 'recent_tracks',
  FAVOURITES: 'likedTracks', // Keep existing key
  PLAYLISTS: 'createdPlaylists', // Keep existing key
  SETTINGS: 'settings'
};

export const playbackPersistence = {
  saveSession: (session: PlaybackSession) => storage.save(KEYS.SESSION, session),
  loadSession: (): PlaybackSession | null => storage.load(KEYS.SESSION, null),

  saveCheckpoint: (checkpoint: PlaybackCheckpoint) => storage.save(KEYS.CHECKPOINT, checkpoint),
  loadCheckpoint: (): PlaybackCheckpoint | null => storage.load(KEYS.CHECKPOINT, null),

  saveQueueSnapshot: (snapshot: QueueSnapshot) => storage.save(KEYS.QUEUE_SNAPSHOT, snapshot),
  loadQueueSnapshot: (): QueueSnapshot | null => storage.load(KEYS.QUEUE_SNAPSHOT, null),

  saveQueueItems: (items: QueueItem[]) => storage.save(KEYS.QUEUE_ITEMS, items),
  loadQueueItems: (): QueueItem[] => storage.load(KEYS.QUEUE_ITEMS, []),

  saveRecentTracks: (tracks: NeoTrack[]) => storage.save(KEYS.RECENT_TRACKS, tracks),
  loadRecentTracks: (): NeoTrack[] => storage.load(KEYS.RECENT_TRACKS, []),

  // Compatibility helpers
  saveFavourites: (tracks: NeoTrack[]) => storage.save(KEYS.FAVOURITES, tracks),
  loadFavourites: (): NeoTrack[] => storage.load(KEYS.FAVOURITES, []),
};
