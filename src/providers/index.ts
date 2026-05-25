import { AudiusProvider } from './AudiusProvider';
import { JamendoProvider } from './JamendoProvider';
import { iTunesProvider } from './iTunesProvider';
import { MusicProvider, Track, MediaItem, Artist } from './types';

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

    let audiusTracks = results[0].status === 'fulfilled' ? results[0].value as Track[] : [];
    let jamendoTracks = results[1].status === 'fulfilled' ? results[1].value as Track[] : [];
    let itunesTracks = results[2].status === 'fulfilled' ? results[2].value as Track[] : [];
    let artists = [
      ...(results[3].status === 'fulfilled' ? results[3].value as Artist[] : []),
      ...(results[4].status === 'fulfilled' ? results[4].value as Artist[] : [])
    ];

    // Deduplicate tracks by name and artist to prefer full versions
    const trackMap = new Map<string, Track>();

    const addToMap = (tracks: Track[]) => {
      tracks.forEach(t => {
        const key = `${t.name.toLowerCase()}-${t.artist.toLowerCase()}`;
        const existing = trackMap.get(key);
        // Prefer full over preview, or existing if same playability
        if (!existing || (t.playability === 'full' && existing.playability !== 'full')) {
          trackMap.set(key, t);
        }
      });
    };

    addToMap(audiusTracks);
    addToMap(jamendoTracks);
    if (!options.filterFull) {
      addToMap(itunesTracks);
    }

    const deduplicatedTracks = Array.from(trackMap.values());

    // Deduplicate artists
    const artistMap = new Map<string, Artist>();
    artists.forEach(a => {
      const key = a.name.toLowerCase();
      if (!artistMap.has(key)) {
        artistMap.set(key, a);
      }
    });

    const deduplicatedArtists = Array.from(artistMap.values());

    const combined: MediaItem[] = [];

    // Sort tracks: full first, then by "relevance" (audius > jamendo > itunes)
    const sortedTracks = deduplicatedTracks.sort((a, b) => {
      if (a.playability === 'full' && b.playability !== 'full') return -1;
      if (a.playability !== 'full' && b.playability === 'full') return 1;
      return 0;
    });

    combined.push(...deduplicatedArtists.slice(0, 5));
    combined.push(...sortedTracks);

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
    // 1. Try primary stream URL
    if (track.streamUrl) {
      // Basic check if it's potentially valid
      if (track.streamUrl.length > 0) return track.streamUrl;
    }

    // 2. If it's a "full" track that failed, attempt to find a preview fallback on iTunes
    if (track.playability === 'full' && track.source !== 'itunes') {
      try {
        const itunesResults = await this.providers[2].searchTracks(`${track.name} ${track.artist}`);
        if (itunesResults.length > 0) {
          const fallback = itunesResults[0] as Track;
          if (fallback.streamUrl) return fallback.streamUrl;
        }
      } catch (e) {
        console.error("Fallback search failed", e);
      }
    }

    // 3. Last resort: check if the provider can provide a fresh URL
    for (const provider of this.providers) {
      if (track.id.startsWith(provider.name)) {
        return await provider.getStreamUrl(track.id);
      }
    }

    return null;
  }
}

export const musicService = new MusicService();
