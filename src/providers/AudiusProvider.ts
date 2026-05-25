import axios from 'axios';
import { MusicProvider, Track, Artist, Album, Playlist, MediaItem } from './types';

const AUDIUS_API_BASE = 'https://discoveryprovider.audius.co/v1';

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
      album: t.title,
      duration: t.duration,
      artworkUrl: t.artwork ? t.artwork['150x150'] || t.artwork['480x480'] : 'https://via.placeholder.com/150',
      streamUrl: `${AUDIUS_API_BASE}/tracks/${t.id}/stream?app_name=SpotifyClone`,
      playability: 'full',
      source: 'audius',
      type: 'track'
    };
  }

  async searchTracks(query: string): Promise<MediaItem[]> {
    const results = await this.fetch('/tracks/search', { query });
    return results ? results.map((t: any) => this.mapTrack(t)) : [];
  }

  async searchArtists(query: string): Promise<MediaItem[]> {
    const results = await this.fetch('/users/search', { query });
    return results ? results.map((u: any) => ({
      id: `audius-user-${u.id}`,
      name: u.name,
      artworkUrl: u.profile_picture ? u.profile_picture['150x150'] : 'https://via.placeholder.com/150',
      genres: [],
      type: 'artist'
    } as MediaItem)) : [];
  }

  async searchAlbums(query: string): Promise<MediaItem[]> {
    const results = await this.fetch('/playlists/search', { query, is_album: true });
    return results ? results.map((p: any) => ({
      id: `audius-playlist-${p.id}`,
      title: p.playlist_name,
      artistId: `audius-user-${p.user.id}`,
      artworkUrl: p.artwork ? p.artwork['150x150'] : 'https://via.placeholder.com/150',
      trackIds: [],
      type: 'album'
    } as MediaItem)) : [];
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
      artworkUrl: u.profile_picture ? u.profile_picture['150x150'] : 'https://via.placeholder.com/150',
      genres: [],
      type: 'artist'
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const cleanId = id.replace('audius-playlist-', '');
    const p = await this.fetch(`/playlists/${cleanId}`);
    if (!p) return null;
    return {
      id: `audius-playlist-${p.id}`,
      title: p.playlist_name,
      artistId: `audius-user-${p.user.id}`,
      artworkUrl: p.artwork ? p.artwork['150x150'] : 'https://via.placeholder.com/150',
      trackIds: [],
      type: 'album'
    };
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const cleanId = id.replace('audius-playlist-', '');
    const p = await this.fetch(`/playlists/${cleanId}`);
    if (!p) return null;
    return {
      id: `audius-playlist-${p.id}`,
      title: p.playlist_name,
      description: p.description || '',
      artworkUrl: p.artwork ? p.artwork['150x150'] : 'https://via.placeholder.com/150',
      trackIds: [],
      owner: p.user.name,
      type: 'playlist'
    };
  }

  async getStreamUrl(trackId: string): Promise<string | null> {
    const cleanId = trackId.replace('audius-', '');
    return `${AUDIUS_API_BASE}/tracks/${cleanId}/stream?app_name=SpotifyClone`;
  }
}
