import { Track as ProviderTrack } from '../providers/types';

export type NeoTrack = {
  id: string;
  name: string;
  artist: string;
  album?: string | null;
  image?: string | null; // Compatibility with existing code
  artwork?: string | null; // Neo-standard
  previewUrl?: string | null;
  duration?: number | null; // seconds
  durationMs?: number | null; // ms compatibility
  genre?: string | null;
  source?: 'itunes' | 'audius' | 'jamendo' | 'local' | 'unknown';
  raw?: any;
};

/**
 * Creates a stable track ID based on available metadata.
 * Order of preference:
 * 1. track.id
 * 2. track.trackId
 * 3. track.track_id
 * 4. collectionId + trackName
 * 5. previewUrl
 * 6. name + artist + album + duration (deterministic string)
 */
export const getStableTrackId = (track: any): string | null => {
  if (!track) return null;

  if (track.id) return track.id.toString();
  if (track.trackId) return track.trackId.toString();
  if (track.track_id) return track.track_id.toString();

  if (track.collectionId && track.trackName) {
    return `${track.collectionId}-${track.trackName}`;
  }

  if (track.previewUrl || track.streamUrl) {
    return track.previewUrl || track.streamUrl;
  }

  const name = track.name || track.trackName || '';
  const artist = track.artist || track.artistName || '';
  const album = track.album || track.collectionName || '';
  const duration = track.duration || track.trackTimeMillis || '';

  if (name && artist) {
    return `${name}-${artist}-${album}-${duration}`.replace(/\s+/g, '-').toLowerCase();
  }

  return null;
};

export const normalizeTrack = (track: any): NeoTrack | null => {
  if (!track) return null;

  // If it's already a NeoTrack (has source and specific shape), return it
  if (track.source && track.id && track.name && track.artist) {
      return track as NeoTrack;
  }

  const stableId = getStableTrackId(track);
  if (!stableId) return null;

  return {
    id: stableId,
    name: track.name || track.trackName || 'Unknown Track',
    artist: track.artist || track.artistName || 'Unknown Artist',
    album: track.album || track.collectionName || null,
    image: track.image || track.artworkUrl100 || track.artworkUrl60 || null,
    artwork: track.artwork || track.image || track.artworkUrl100 || null,
    previewUrl: track.previewUrl || track.streamUrl || null,
    duration: track.duration || (track.trackTimeMillis ? track.trackTimeMillis / 1000 : null),
    durationMs: track.durationMs || track.trackTimeMillis || (track.duration ? track.duration * 1000 : null),
    genre: track.genre || track.primaryGenreName || null,
    source: track.provider || (track.kind === 'song' ? 'itunes' : 'unknown'),
    raw: track
  };
};

export const getTrackId = (track: NeoTrack | ProviderTrack): string => {
  return track.id;
};

export const isPlayable = (track: NeoTrack | ProviderTrack): boolean => {
  return !!(track.previewUrl || (track as any).streamUrl);
};
