import { AudiusProvider } from './AudiusProvider';
import { JamendoProvider } from './JamendoProvider';
import { iTunesProvider } from './iTunesProvider';
import { MusicProvider, Track, Artist, Album, MediaItem } from './types';

class MusicService {
  private providers: MusicProvider[];

  constructor() {
    this.providers = [
      new AudiusProvider(),
      new JamendoProvider(),
      new iTunesProvider()
    ];
  }

  async search(query: string): Promise<MediaItem[]> {
    const results = await Promise.allSettled([
      this.providers[0].searchTracks(query), // Audius
      this.providers[1].searchTracks(query), // Jamendo
      this.providers[2].searchTracks(query), // iTunes
    ]);

    const audiusTracks = results[0].status === 'fulfilled' ? results[0].value : [];
    const jamendoTracks = results[1].status === 'fulfilled' ? results[1].value : [];
    const itunesTracks = results[2].status === 'fulfilled' ? results[2].value : [];

    // Prioritize Audius, then Jamendo, then iTunes
    // We also want to interleave them a bit but keep Audius/Jamendo mostly at top
    const combined: MediaItem[] = [];

    // Add all Audius
    combined.push(...audiusTracks);
    // Add all Jamendo
    combined.push(...jamendoTracks);
    // Add iTunes as fallback
    combined.push(...itunesTracks);

    return combined;
  }

  async getTrack(id: string): Promise<Track | null> {
    for (const provider of this.providers) {
      if (id.startsWith(provider.name)) {
        return await provider.getTrack(id);
      }
    }
    return null;
  }

  async getStreamUrl(track: Track): Promise<string | null> {
    if (track.streamUrl) return track.streamUrl;
    if (track.previewUrl) return track.previewUrl;

    for (const provider of this.providers) {
      if (track.id.startsWith(provider.name)) {
        return await provider.getStreamUrl(track.id);
      }
    }
    return null;
  }
}

export const musicService = new MusicService();
