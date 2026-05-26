import React, { useEffect, useState } from 'react';
import { Play, Shuffle, Download, ArrowLeft, MoreVertical } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTracks, setCurrentTrack, setQueue, toggleShuffle } from '../store/slices/playerSlice';
import TrackRow from '../components/TrackRow/TrackRow';
import { useParams } from 'react-router-dom';
import { musicService } from '../providers';
import { Track, Playlist as PlaylistType } from '../providers/types';
import { getUserPlaylists } from '../providers/localProvider';
import './Playlist.scss';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const dispatch = useDispatch();
  const { currentTrackId, likedTrackIds, tracksById } = useSelector((state: RootState) => state.player);

  const { createdPlaylistIds, playlistsById } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (id && playlistsById[id]) {
        setPlaylist(playlistsById[id]);
      } else if (window.location.pathname === '/liked' || id === 'liked') {
         const likedTracks = likedTrackIds.map(tid => tracksById[tid]).filter(Boolean);
         setPlaylist({
            id: 'liked',
            name: 'Liked Songs',
            description: 'Your liked songs, always with you.',
            image: '',
            owner: 'Mriganka',
            tracks: likedTracks,
            provider: 'local',
            type: 'playlist'
          });
      } else if (id && id.startsWith('local-')) {
        const locals = getUserPlaylists();
        const found = locals.find(p => p.id === id);
        if (found) setPlaylist(found);
      }
    };
    loadPlaylist();
  }, [id, likedTrackIds, tracksById, playlistsById]);

  const tracks = playlist?.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      dispatch(setTracks(tracks));
      dispatch(setQueue(tracks.map(t => ({
        trackId: t.id,
        origin: 'playlist',
        contextId: playlist?.id,
        addedAt: Date.now()
      }))));
      dispatch(setCurrentTrack(tracks[0].id));
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
       dispatch(toggleShuffle());
       const randomIndex = Math.floor(Math.random() * tracks.length);
       dispatch(setTracks(tracks));
       dispatch(setQueue(tracks.map(t => ({
        trackId: t.id,
        origin: 'playlist',
        contextId: playlist?.id,
        addedAt: Date.now()
       }))));
       dispatch(setCurrentTrack(tracks[randomIndex].id));
    }
  };

  const handlePlayTrack = (track: Track) => {
    dispatch(setTracks(tracks));
    dispatch(setQueue(tracks.map(t => ({
        trackId: t.id,
        origin: 'playlist',
        contextId: playlist?.id,
        addedAt: Date.now()
    }))));
    dispatch(setCurrentTrack(track.id));
  };

  return (
    <div className="playlist-screen">
      <header className="playlist-header">
        <div className="header-bg" />
        <div className="header-content">
          <div className="album-art">
             <div className="liked-heart-bg">
                <Play fill="white" size={40} />
             </div>
          </div>
          <div className="playlist-info">
            <span className="type">Playlist</span>
            <h1>{playlist?.name || 'Liked Songs'}</h1>
            <div className="meta">
              <span className="owner">{playlist?.owner || 'Mriganka'}</span> • {tracks.length} songs
            </div>
          </div>
        </div>
      </header>

      {tracks.length === 0 && (
        <div className="empty-playlist">
          <p>Start adding songs to your playlist</p>
          <button onClick={() => window.location.href='/search'}>Find songs</button>
        </div>
      )}

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
        {tracks.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            isActive={track.id === currentTrackId}
            onPlay={() => handlePlayTrack(track)}
          />
        ))}
      </div>
    </div>
  );
};

export default Playlist;
