import React, { useEffect, useState } from 'react';
import { Play, Shuffle, ArrowLeft, MoreVertical } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTracks as setGlobalTracks, setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import TrackRow from '../components/TrackRow/TrackRow';
import { musicService } from '../providers';
import { Track, Artist } from '../providers/types';
import './Artist.scss';

const ArtistPage: React.FC = () => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const dispatch = useDispatch();
  const { currentTrackId } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    const loadArtist = async () => {
      // Mocking an artist page
      const artists = await musicService.search('The Weeknd');
      const artistItem = artists.find(a => a.type === 'artist') as Artist;
      if (artistItem) setArtist(artistItem);

      const songs = await musicService.search('The Weeknd');
      setTracks(songs.filter(i => i.type === 'track').slice(0, 5) as Track[]);
    };
    loadArtist();
  }, []);

  const handlePlayTrack = (track: Track) => {
    dispatch(setGlobalTracks(tracks));
    dispatch(setQueue(tracks.map(t => t.id)));
    dispatch(setCurrentTrack(track.id));
  };

  if (!artist) return null;

  return (
    <div className="artist-screen">
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
          <button className="play-button">
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
              isActive={track.id === currentTrackId}
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
