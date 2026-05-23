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

  async search(query: string, options: { filterFull?: boolean } = {}): Promise<MediaItem[]> {
    const results = await Promise.allSettled([
      this.providers[0].searchTracks(query), // Audius
      this.providers[1].searchTracks(query), // Jamendo
      this.providers[2].searchTracks(query), // iTunes
      this.providers[0].searchArtists(query),
      this.providers[2].searchArtists(query),
    ]);

    let audiusTracks = results[0].status === 'fulfilled' ? results[0].value : [];
    let jamendoTracks = results[1].status === 'fulfilled' ? results[1].value : [];
    let itunesTracks = results[2].status === 'fulfilled' ? results[2].value : [];
    let artists = [
      ...(results[3].status === 'fulfilled' ? results[3].value : []),
      ...(results[4].status === 'fulfilled' ? results[4].value : [])
    ];

    if (options.filterFull) {
      itunesTracks = [];
    }

    // Deduplicate and group
    const combined: MediaItem[] = [];

    // Add full songs first
    combined.push(...audiusTracks);
    combined.push(...jamendoTracks);

    // Add artists
    combined.push(...artists.slice(0, 5));

    // Add preview tracks if not filtered
    if (!options.filterFull) {
      combined.push(...itunesTracks);
    }

    return combined;
  }

  async validateStream(track: Track): Promise<boolean> {
    const url = await this.getStreamUrl(track);
    if (!url) return false;

    // Simple HEAD request or check if it's a valid URL string
    try {
      // In a real browser, we might use a small timeout check
      return url.length > 0;
    } catch (e) {
      return false;
    }
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
