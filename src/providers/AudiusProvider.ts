import axios from 'axios';
import { MusicProvider, Track, Artist, Album, Playlist } from './types';

const AUDIUS_API_BASE = process.env.REACT_APP_AUDIUS_API_BASE || 'https://discoveryprovider.audius.co/v1';

export class AudiusProvider implements MusicProvider {
  name = 'audius';

  private async fetch(endpoint: string, params: any = {}) {
    try {
      const response = await axios.get(`${AUDIUS_API_BASE}${endpoint}`, {
        params: { ...params, app_name: 'SpotifyClone' }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Audius API Error (${endpoint}):`, error);
      return null;
    }
  }

  private mapTrack(t: any): Track {
    return {
      id: `audius-${t.id}`,
      name: t.title,
      artist: t.user.name,
      artistId: `audius-user-${t.user.id}`,
      album: t.title, // Audius tracks are often singles
      duration: t.duration,
      image: t.artwork ? t.artwork['150x150'] || t.artwork['480x480'] : 'https://via.placeholder.com/150',
      streamUrl: `${AUDIUS_API_BASE}/tracks/${t.id}/stream`,
      provider: 'audius',
      type: 'track'
    };
  }

  async searchTracks(query: string): Promise<Track[]> {
    const results = await this.fetch('/tracks/search', { query });
    return results ? results.map((t: any) => this.mapTrack(t)) : [];
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const results = await this.fetch('/users/search', { query });
    return results ? results.map((u: any) => ({
      id: `audius-user-${u.id}`,
      name: u.name,
      image: u.profile_picture ? u.profile_picture['150x150'] : 'https://via.placeholder.com/150',
      followers: u.follower_count,
      provider: 'audius',
      type: 'artist'
    })) : [];
  }

  async searchAlbums(query: string): Promise<Album[]> {
    // Audius uses 'playlists' for albums if they are collections
    const results = await this.fetch('/playlists/search', { query, is_album: true });
    return results ? results.map((p: any) => ({
      id: `audius-playlist-${p.id}`,
      name: p.playlist_name,
      artist: p.user.name,
      image: p.artwork ? p.artwork['150x150'] : 'https://via.placeholder.com/150',
      tracks: [],
      provider: 'audius',
      type: 'album'
    })) : [];
  }

  async getTrack(id: string): Promise<Track | null> {
    const cleanId = id.replace('audius-', '');
    const result = await this.fetch(`/tracks/${cleanId}`);
    return result ? this.mapTrack(result) : null;
  }

  async getArtist(id: string): Promise<Artist | null> {
    const cleanId = id.replace('audius-user-', '');
    const u = await this.fetch(`/users/${cleanId}`);
    if (!u) return null;
    return {
      id: `audius-user-${u.id}`,
      name: u.name,
      image: u.profile_picture ? u.profile_picture['150x150'] : 'https://via.placeholder.com/150',
      followers: u.follower_count,
      provider: 'audius',
      type: 'artist'
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const cleanId = id.replace('audius-playlist-', '');
    const p = await this.fetch(`/playlists/${cleanId}`);
    if (!p) return null;
    return {
      id: `audius-playlist-${p.id}`,
      name: p.playlist_name,
      artist: p.user.name,
      image: p.artwork ? p.artwork['150x150'] : 'https://via.placeholder.com/150',
      tracks: [], // Need to fetch tracks separately usually
      provider: 'audius',
      type: 'album'
    };
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return this.getAlbum(id) as any; // Simplified
  }

  async getStreamUrl(trackId: string): Promise<string | null> {
    const cleanId = trackId.replace('audius-', '');
    return `${AUDIUS_API_BASE}/tracks/${cleanId}/stream?app_name=SpotifyClone`;
  }
}
