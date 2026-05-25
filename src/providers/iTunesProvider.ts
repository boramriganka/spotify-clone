import axios from 'axios';
import { MusicProvider, Track, Artist, Album, Playlist, MediaItem } from './types';

const ITUNES_URL = 'https://itunes.apple.com/search';

export class iTunesProvider implements MusicProvider {
  name = 'itunes';

  private async fetch(params: any = {}) {
    try {
      const response = await axios.get(ITUNES_URL, { params });
      return response.data.results;
    } catch (error) {
      console.error(`iTunes API Error:`, error);
      return null;
    }
  }

  private mapTrack(item: any): Track {
    return {
      id: `itunes-${item.trackId || item.collectionId}`,
      name: item.trackName || item.collectionName || 'Unknown',
      artist: item.artistName || 'Unknown Artist',
      album: item.collectionName || '',
      duration: Math.floor((item.trackTimeMillis || 0) / 1000),
      artworkUrl: item.artworkUrl100?.replace('100x100bb', '600x600bb') || 'https://via.placeholder.com/600',
      streamUrl: item.previewUrl || '',
      playability: 'preview',
      source: 'itunes',
      type: 'track'
    };
  }

  async searchTracks(query: string): Promise<MediaItem[]> {
    const results = await this.fetch({ term: query, media: 'music', limit: 20 });
    return results ? results.map((t: any) => this.mapTrack(t)) : [];
  }

  async searchArtists(query: string): Promise<MediaItem[]> {
    const results = await this.fetch({ term: query, entity: 'musicArtist', limit: 10 });
    return results ? results.map((a: any) => ({
      id: `itunes-artist-${a.artistId}`,
      name: a.artistName,
      artworkUrl: 'https://via.placeholder.com/300',
      genres: [],
      type: 'artist'
    } as MediaItem)) : [];
  }

  async searchAlbums(query: string): Promise<MediaItem[]> {
    const results = await this.fetch({ term: query, entity: 'album', limit: 10 });
    return results ? results.map((a: any) => ({
      id: `itunes-album-${a.collectionId}`,
      title: a.collectionName,
      artistId: `itunes-artist-${a.artistId}`,
      artworkUrl: a.artworkUrl100?.replace('100x100bb', '600x600bb'),
      trackIds: [],
      type: 'album'
    } as MediaItem)) : [];
  }

  async getTrack(id: string): Promise<Track | null> {
    const cleanId = id.replace('itunes-', '');
    const results = await this.fetch({ id: cleanId });
    return results && results.length > 0 ? this.mapTrack(results[0]) : null;
  }

  async getArtist(id: string): Promise<Artist | null> {
    const cleanId = id.replace('itunes-artist-', '');
    const results = await this.fetch({ id: cleanId });
    if (!results || results.length === 0) return null;
    return {
      id: `itunes-artist-${results[0].artistId}`,
      name: results[0].artistName,
      artworkUrl: 'https://via.placeholder.com/300',
      genres: [],
      type: 'artist'
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const cleanId = id.replace('itunes-album-', '');
    const results = await this.fetch({ id: cleanId, entity: 'song' });
    if (!results || results.length === 0) return null;
    const albumInfo = results[0];
    return {
      id: `itunes-album-${albumInfo.collectionId}`,
      title: albumInfo.collectionName,
      artistId: `itunes-artist-${albumInfo.artistId}`,
      artworkUrl: albumInfo.artworkUrl100?.replace('100x100bb', '600x600bb'),
      trackIds: [],
      type: 'album'
    };
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return null;
  }

  async getStreamUrl(trackId: string): Promise<string | null> {
    const track = await this.getTrack(trackId);
    return track ? track.streamUrl || null : null;
  }
}
