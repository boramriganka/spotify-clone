import axios from 'axios';
import { MusicProvider, Track, Artist, Album, Playlist } from './types';

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
      artistId: `itunes-artist-${item.artistId}`,
      album: item.collectionName || '',
      albumId: `itunes-album-${item.collectionId}`,
      duration: Math.floor((item.trackTimeMillis || 0) / 1000),
      image: item.artworkUrl100?.replace('100x100bb', '600x600bb') || 'https://via.placeholder.com/600',
      previewUrl: item.previewUrl || '',
      provider: 'itunes',
      type: 'track'
    };
  }

  async searchTracks(query: string): Promise<Track[]> {
    const results = await this.fetch({ term: query, media: 'music', limit: 20 });
    return results ? results.map((t: any) => this.mapTrack(t)) : [];
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const results = await this.fetch({ term: query, entity: 'musicArtist', limit: 10 });
    return results ? results.map((a: any) => ({
      id: `itunes-artist-${a.artistId}`,
      name: a.artistName,
      image: 'https://via.placeholder.com/300', // iTunes doesn't easily provide artist images in search
      provider: 'itunes',
      type: 'artist'
    })) : [];
  }

  async searchAlbums(query: string): Promise<Album[]> {
    const results = await this.fetch({ term: query, entity: 'album', limit: 10 });
    return results ? results.map((a: any) => ({
      id: `itunes-album-${a.collectionId}`,
      name: a.collectionName,
      artist: a.artistName,
      image: a.artworkUrl100?.replace('100x100bb', '600x600bb'),
      tracks: [],
      provider: 'itunes',
      type: 'album'
    })) : [];
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
      image: 'https://via.placeholder.com/300',
      provider: 'itunes',
      type: 'artist'
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const cleanId = id.replace('itunes-album-', '');
    const results = await this.fetch({ id: cleanId, entity: 'song' });
    if (!results || results.length === 0) return null;
    const albumInfo = results[0];
    const tracks = results.slice(1).map((t: any) => this.mapTrack(t));
    return {
      id: `itunes-album-${albumInfo.collectionId}`,
      name: albumInfo.collectionName,
      artist: albumInfo.artistName,
      image: albumInfo.artworkUrl100?.replace('100x100bb', '600x600bb'),
      tracks,
      provider: 'itunes',
      type: 'album'
    };
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return null; // iTunes API doesn't support public playlists easily
  }

  async getStreamUrl(trackId: string): Promise<string | null> {
    const track = await this.getTrack(trackId);
    return track ? track.previewUrl || null : null;
  }
}
