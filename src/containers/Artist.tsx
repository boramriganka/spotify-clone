import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Play, Shuffle, ArrowLeft, MoreVertical } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import TrackRow from '../components/TrackRow/TrackRow';
import { musicService } from '../providers';
import { Track, Artist } from '../providers/types';
import { useQueue } from '../core/queue/useQueue';
import { usePlaybackController } from '../core/player/usePlaybackController';
import './Artist.scss';

const ArtistPage: React.FC = () => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const { startPlaybackFromContext } = useQueue();
  const { currentTrack } = usePlaybackController();

  useEffect(() => {
    const loadArtist = async () => {
      // Mocking an artist page
      const artists = await musicService.search('The Weeknd');
      let artistItem = artists.find(a => a.type === 'artist') as Artist;

      if (!artistItem && artists.length > 0) {
        // Fallback: use first item metadata to create artist object
        const first = artists[0] as any;
        artistItem = {
          id: 'artist-fallback',
          name: first.artist || first.name,
          image: first.image,
          type: 'artist'
        } as Artist;
      }

      if (artistItem) setArtist(artistItem);

      const songs = artists; // reuse results
      setTracks(songs.filter(i => i.type === 'track').slice(0, 5) as Track[]);
    };
    loadArtist();
  }, []);

  const handlePlayTrack = (track: Track) => {
    startPlaybackFromContext({
      sourceType: 'artist',
      sourceId: artist?.id || 'unknown',
      tracks: tracks,
      startTrackId: track.id
    });
  };

  if (!artist) return null;

  return (
    <div className="artist-screen">
      <Helmet>
        <title>{artist.name} — Spotify Neo</title>
      </Helmet>
      <header className="artist-header" style={{ backgroundImage: `url(${artist.image})` }}>
        <div className="overlay" />
        <div className="header-content">
          <span className="verified">Verified Artist</span>
          <h1>{artist.name}</h1>
          <span className="listeners">3,456,789 monthly listeners</span>
        </div>
      </header>

      <div className="artist-actions">
        <button className="follow-btn">Following</button>
        <MoreVertical size={24} className="action-icon" />
        <div className="right-actions">
          <Shuffle size={24} className="shuffle-icon" />
          <button className="play-button" onClick={() => tracks[0] && handlePlayTrack(tracks[0])}>
            <Play fill="black" size={24} />
          </button>
        </div>
      </div>

      <div className="artist-content">
        <h2>Popular</h2>
        <div className="track-list">
          {tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              isActive={track.id === currentTrack?.id}
              onPlay={() => handlePlayTrack(track)}
              showAlbum={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
