import axios from 'axios';
import { MusicProvider, Track, Artist, Album, Playlist } from './types';

const JAMENDO_API_BASE = process.env.REACT_APP_JAMENDO_API_BASE || 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.REACT_APP_JAMENDO_CLIENT_ID || '56d3047d'; // Default demo key

export class JamendoProvider implements MusicProvider {
  name = 'jamendo';

  private async fetch(endpoint: string, params: any = {}) {
    try {
      const response = await axios.get(`${JAMENDO_API_BASE}${endpoint}`, {
        params: {
          client_id: JAMENDO_CLIENT_ID,
          format: 'json',
          ...params
        }
      });
      return response.data.results;
    } catch (error) {
      console.error(`Jamendo API Error (${endpoint}):`, error);
      return null;
    }
  }

  private mapTrack(t: any): Track {
    return {
      id: `jamendo-${t.id}`,
      name: t.name,
      artist: t.artist_name,
      artistId: `jamendo-artist-${t.artist_id}`,
      album: t.album_name,
      albumId: `jamendo-album-${t.album_id}`,
      duration: t.duration,
      image: t.album_image || t.image || 'https://via.placeholder.com/150',
      streamUrl: t.audio,
      playability: 'full',
      provider: 'jamendo',
      type: 'track'
    };
  }

  async searchTracks(query: string): Promise<Track[]> {
    const results = await this.fetch('/tracks', { search: query, limit: 20, audioformat: 'mp32' });
    return results ? results.map((t: any) => this.mapTrack(t)) : [];
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const results = await this.fetch('/artists', { name: query, limit: 10 });
    return results ? results.map((a: any) => ({
      id: `jamendo-artist-${a.id}`,
      name: a.name,
      image: a.image || 'https://via.placeholder.com/150',
      provider: 'jamendo',
      type: 'artist'
    })) : [];
  }

  async searchAlbums(query: string): Promise<Album[]> {
    const results = await this.fetch('/albums', { namesearch: query, limit: 10 });
    return results ? results.map((a: any) => ({
      id: `jamendo-album-${a.id}`,
      name: a.name,
      artist: a.artist_name,
      image: a.image || 'https://via.placeholder.com/150',
      tracks: [],
      provider: 'jamendo',
      type: 'album'
    })) : [];
  }

  async getTrack(id: string): Promise<Track | null> {
    const cleanId = id.replace('jamendo-', '');
    const results = await this.fetch('/tracks', { id: cleanId });
    return results && results.length > 0 ? this.mapTrack(results[0]) : null;
  }

  async getArtist(id: string): Promise<Artist | null> {
    const cleanId = id.replace('jamendo-artist-', '');
    const results = await this.fetch('/artists', { id: cleanId });
    if (!results || results.length === 0) return null;
    const a = results[0];
    return {
      id: `jamendo-artist-${a.id}`,
      name: a.name,
      image: a.image || 'https://via.placeholder.com/150',
      provider: 'jamendo',
      type: 'artist'
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const cleanId = id.replace('jamendo-album-', '');
    const results = await this.fetch('/albums', { id: cleanId });
    if (!results || results.length === 0) return null;
    const a = results[0];
    return {
      id: `jamendo-album-${a.id}`,
      name: a.name,
      artist: a.artist_name,
      image: a.image || 'https://via.placeholder.com/150',
      tracks: [],
      provider: 'jamendo',
      type: 'album'
    };
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const cleanId = id.replace('jamendo-playlist-', '');
    const results = await this.fetch('/playlists', { id: cleanId });
    if (!results || results.length === 0) return null;
    const p = results[0];
    return {
      id: `jamendo-playlist-${p.id}`,
      name: p.name,
      description: '',
      owner: p.user_name,
      image: p.shareurl, // Jamendo playlists don't always have simple images
      tracks: [],
      provider: 'jamendo',
      type: 'playlist'
    };
  }

  async getStreamUrl(trackId: string): Promise<string | null> {
    const track = await this.getTrack(trackId);
    return track ? track.streamUrl || null : null;
  }
}
