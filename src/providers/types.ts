export interface Track {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  duration: number; // in seconds
  image: string;
  streamUrl?: string;
  previewUrl?: string;
  provider: 'audius' | 'jamendo' | 'itunes';
  type: 'track';
  liked?: boolean;
  isFull: boolean;
  availability: 'full' | 'preview' | 'unavailable' | 'loading';
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  followers?: number;
  monthlyListeners?: number;
  bio?: string;
  provider: 'audius' | 'jamendo' | 'itunes';
  type: 'artist';
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  image: string;
  releaseDate?: string;
  tracks: Track[];
  provider: 'audius' | 'jamendo' | 'itunes';
  type: 'album';
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  tracks: Track[];
  provider: 'audius' | 'jamendo' | 'itunes' | 'local';
  type: 'playlist';
}

export type MediaItem = Track | Artist | Album | Playlist;

export interface MusicProvider {
  name: string;
  searchTracks(query: string): Promise<Track[]>;
  searchArtists(query: string): Promise<Artist[]>;
  searchAlbums(query: string): Promise<Album[]>;
  getTrack(id: string): Promise<Track | null>;
  getArtist(id: string): Promise<Artist | null>;
  getAlbum(id: string): Promise<Album | null>;
  getPlaylist(id: string): Promise<Playlist | null>;
  getStreamUrl(trackId: string): Promise<string | null>;
}
