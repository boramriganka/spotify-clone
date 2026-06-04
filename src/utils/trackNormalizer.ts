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

export const normalizeTrack = (track: any): NeoTrack => {
  if (!track) return null as any;

  // If it's already a NeoTrack (has source and specific shape), return it
  if (track.source && track.id) {
      return track as NeoTrack;
  }

  // Handle ProviderTrack from existing providers
  const id = track.id || track.trackId?.toString() || Math.random().toString(36).substr(2, 9);

  return {
    id: id.toString(),
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
