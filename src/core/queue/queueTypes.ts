import { NeoTrack } from '../../utils/trackNormalizer';

export interface QueueItem {
  id: string;
  trackId: string;
  track: NeoTrack;
  sourcePosition: number;
  availability: 'playable' | 'unavailable';
}

export interface QueueSnapshot {
  id: string;
  sourceType: 'search' | 'artist' | 'album' | 'playlist' | 'charts' | 'mood' | 'smart-search' | 'manual';
  sourceId: string;
  queueItemIds: string[];
  createdAt: number;
}
