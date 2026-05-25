import React, { useEffect, useState } from 'react';
import { Play, Shuffle, Download, MoreVertical, Search, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setPlayback, toggleShuffle } from '../store/slices/playerSlice';
import { addTracks } from '../store/slices/musicSlice';
import TrackRow from '../components/TrackRow/TrackRow';
import { useParams, useLocation } from 'react-router-dom';
import { musicService } from '../providers';
import { Track, Playlist as PlaylistType } from '../providers/types';
import { getUserPlaylists } from '../providers/localProvider';
import './Playlist.scss';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const currentTrackId = useSelector((state: RootState) => state.player.currentTrackId);
  const { tracksById, likedTrackIds } = useSelector((state: RootState) => state.music);

  const isLikedPage = location.pathname === '/liked';

  useEffect(() => {
    const loadPlaylist = async () => {
      setIsLoading(true);
      if (isLikedPage) {
        setPlaylist({
          id: 'liked',
          title: 'Liked Songs',
          description: '',
          artworkUrl: '',
          owner: 'Mriganka',
          trackIds: likedTrackIds,
          type: 'playlist'
        });
      } else if (id) {
        const locals = getUserPlaylists();
        const found = locals.find(p => p.id === id);
        if (found) {
          setPlaylist(found);
        } else {
           // Fallback or fetch from service
           setPlaylist(null);
        }
      }
      setIsLoading(false);
    };
    loadPlaylist();
  }, [id, isLikedPage, likedTrackIds, tracksById]);

  const trackIds = playlist?.trackIds || [];

  const handlePlayAll = () => {
    if (trackIds.length > 0) {
      dispatch(setPlayback({ trackId: trackIds[0], queue: trackIds, index: 0 }));
    }
  };

  const handleShufflePlay = () => {
    if (trackIds.length > 0) {
       dispatch(toggleShuffle());
       const randomIndex = Math.floor(Math.random() * trackIds.length);
       dispatch(setPlayback({ trackId: trackIds[randomIndex], queue: trackIds }));
    }
  };

  const handlePlayTrack = (tid: string, index: number) => {
    dispatch(setPlayback({ trackId: tid, queue: trackIds, index }));
  };

  if (isLoading) return <div className="playlist-loading">Loading...</div>;

  if (!playlist) {
    return (
      <div className="playlist-error">
        <h2>Playlist not found</h2>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="playlist-screen">
      <header className="playlist-header">
        <div className="header-bg" />
        <div className="header-content">
          <div className="album-art">
             {isLikedPage ? (
               <div className="liked-heart-bg">
                  <Play fill="white" size={40} />
               </div>
             ) : (
               <img src={playlist?.artworkUrl || 'https://picsum.photos/seed/playlist/300/300'} alt="" />
             )}
          </div>
          <div className="playlist-info">
            <span className="type">Playlist</span>
            <h1>{playlist?.title || 'Liked Songs'}</h1>
            <div className="meta">
              <span className="owner">{playlist?.owner || 'Mriganka'}</span> • {trackIds.length} songs
            </div>
          </div>
        </div>
      </header>

      {trackIds.length === 0 ? (
        <div className="empty-playlist">
          <p>Start adding songs to your playlist</p>
          <button className="find-songs-btn" onClick={() => window.location.href='/search'}>Find songs</button>
        </div>
      ) : (
        <>
          <div className="playlist-actions">
            <div className="left-actions">
              <Download size={24} className="action-icon" />
              <MoreVertical size={24} className="action-icon" />
            </div>
            <div className="right-actions">
              <Shuffle size={24} className="shuffle-icon" onClick={handleShufflePlay} />
              <button className="play-button" onClick={handlePlayAll}>
                <Play fill="black" size={24} />
              </button>
            </div>
          </div>

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
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Playlist;
