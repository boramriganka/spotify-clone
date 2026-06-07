import React, { useEffect, useState } from 'react';
import { Play, Shuffle, Download, MoreVertical, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import TrackRow from '../components/TrackRow/TrackRow';
import { useParams, useNavigate } from 'react-router-dom';
import { Track, Playlist as PlaylistType } from '../providers/types';
import { getUserPlaylists } from '../providers/localProvider';
import { useQueue } from '../core/queue/useQueue';
import { usePlaybackController } from '../core/player/usePlaybackController';
import './Playlist.scss';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const { startPlaybackFromContext, toggleShuffle, shuffleEnabled } = useQueue();
  const { currentTrack } = usePlaybackController();
  const { likedTrackIds, tracksById } = useSelector((state: RootState) => state.player);

  const { playlistsById } = useSelector((state: RootState) => state.player);

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
            owner: 'You',
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
      startPlaybackFromContext({
        sourceType: 'playlist',
        sourceId: playlist?.id || 'unknown',
        tracks,
        startTrackId: tracks[0].id
      });
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
       if (!shuffleEnabled) {
         toggleShuffle();
       }
       // If shuffle is enabled, startPlaybackFromContext will handle the shuffling of the queue
       startPlaybackFromContext({
         sourceType: 'playlist',
         sourceId: playlist?.id || 'unknown',
         tracks,
         startTrackId: tracks[Math.floor(Math.random() * tracks.length)].id
       });
    }
  };

  const handlePlayTrack = (track: Track) => {
    startPlaybackFromContext({
      sourceType: 'playlist',
      sourceId: playlist?.id || 'unknown',
      tracks,
      startTrackId: track.id
    });
  };

  return (
    <div className="playlist-screen">
      <header className="playlist-header">
        <div className="header-bg" />
        <div className="header-content">
          <div className="album-art">
            {playlist?.image ? (
              <img src={playlist.image} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : playlist?.id === 'liked' ? (
              <div className="liked-heart-bg">
                <Heart fill="white" size={40} />
              </div>
            ) : (
              <div className="liked-heart-bg" style={{ background: 'linear-gradient(135deg, #404040 0%, #282828 100%)' }}>
                <Play fill="white" size={40} />
              </div>
            )}
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
          <button onClick={() => navigate('/search')}>Find songs</button>
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
            isActive={track.id === currentTrack?.id}
            onPlay={() => handlePlayTrack(track)}
          />
        ))}
      </div>
    </div>
  );
};

export default Playlist;
