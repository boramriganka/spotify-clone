import React, { useEffect, useState } from 'react';
import { Play, Shuffle, Download, MoreVertical } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setPlayback, toggleShuffle } from '../store/slices/playerSlice';
import { addTracks, toggleFollowArtist } from '../store/slices/musicSlice';
import TrackRow from '../components/TrackRow/TrackRow';
import { musicService } from '../providers';
import { Track, Artist } from '../providers/types';
import { useLocation } from 'react-router-dom';
import './Artist.scss';

const ArtistPage: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const artistId = params.get('id');

  const [artist, setArtist] = useState<Artist | null>(null);
  const [trackIds, setTrackIds] = useState<string[]>([]);

  const { currentTrackId } = useSelector((state: RootState) => state.player);
  const { tracksById, followedArtistIds, fullSongOnly } = useSelector((state: RootState) => state.music);

  useEffect(() => {
    const loadArtist = async () => {
      const options = { filterFull: fullSongOnly };
      // If we have an ID, we'd fetch that specific artist, otherwise mock 'The Weeknd'
      const searchTerm = artistId ? artistId.split('-').pop() || 'The Weeknd' : 'The Weeknd';

      const artistsResults = await musicService.search(searchTerm, options);
      const artistItem = artistsResults.find(a => a.type === 'artist') as Artist;
      if (artistItem) setArtist(artistItem);

      const songs = await musicService.search(searchTerm, options);
      const filteredTracks = songs.filter(i => i.type === 'track') as Track[];
      dispatch(addTracks(filteredTracks));
      setTrackIds(filteredTracks.slice(0, 5).map(t => t.id));
    };
    loadArtist();
  }, [dispatch, artistId, fullSongOnly]);

  const handlePlayTrack = (tid: string, index: number) => {
    dispatch(setPlayback({ trackId: tid, queue: trackIds, index }));
  };

  const isFollowing = artist ? followedArtistIds.includes(artist.id) : false;

  if (!artist) return <div className="loading">Loading...</div>;

  return (
    <div className="artist-screen scroll-container">
      <header className="artist-header" style={{ backgroundImage: `url(${artist.artworkUrl})` }}>
        <div className="overlay" />
        <div className="header-content">
          <span className="verified">Verified Artist</span>
          <h1>{artist.name}</h1>
          <span className="listeners">3,456,789 monthly listeners</span>
        </div>
      </header>

      <div className="artist-actions">
        <button
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
          onClick={() => dispatch(toggleFollowArtist(artist.id))}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <MoreVertical size={24} className="action-icon" />
        <div className="right-actions">
          <Shuffle size={24} className="shuffle-icon" />
          <button className="play-button" onClick={() => handlePlayTrack(trackIds[0], 0)}>
            <Play fill="black" size={24} />
          </button>
        </div>
      </div>

      <div className="artist-content">
        <h2>Popular</h2>
        <div className="track-list">
          {trackIds.map((tid, i) => {
            const track = tracksById[tid];
            if (!track) return null;
            return (
              <TrackRow
                key={tid}
                track={track}
                index={i}
                isActive={tid === currentTrackId}
                onPlay={() => handlePlayTrack(tid, i)}
                showAlbum={false}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
