export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  artworkUrl: string;
  streamUrl: string;
  playability: 'full' | 'preview' | 'unavailable';
  source: string;
  type: 'track';
}

export interface Artist {
  id: string;
  name: string;
  artworkUrl: string;
  genres: string[];
  type: 'artist';
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artworkUrl: string;
  trackIds: string[];
  type: 'album';
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  artworkUrl: string;
  trackIds: string[];
  owner: string;
  type: 'playlist';
}

export type MediaItem = Track | Artist | Album | Playlist;

export interface MusicProvider {
  name: string;
  searchTracks(query: string): Promise<MediaItem[]>;
  searchArtists(query: string): Promise<MediaItem[]>;
  searchAlbums(query: string): Promise<MediaItem[]>;
  getTrack(id: string): Promise<Track | null>;
  getArtist(id: string): Promise<Artist | null>;
  getAlbum(id: string): Promise<Album | null>;
  getPlaylist(id: string): Promise<Playlist | null>;
  getStreamUrl(trackId: string): Promise<string | null>;
}
