import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard/MediaCard';
import { Heart } from 'lucide-react';
import './Playlist.scss';
import './Library.scss';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { likedTrackIds, tracksById, recentlyPlayedIds, createdPlaylistIds, playlistsById } = useSelector((state: RootState) => state.player);

  const likedTracks = likedTrackIds.map(id => tracksById[id]).filter(Boolean);
  const recentlyPlayed = recentlyPlayedIds.map(id => tracksById[id]).filter(Boolean);
  const createdPlaylists = createdPlaylistIds.map(id => playlistsById[id]).filter(Boolean);

  return (
    <div className="library-screen playlist-screen">
      <header className="playlist-header">
        <div className="header-bg" />
        <div className="header-content">
          <h1>Your Library</h1>
        </div>
      </header>

      <div className="library-content">
        <div className="library-grid">

          <div className="liked-songs-card" onClick={() => navigate('/liked')}>
            <div className="liked-icon">
              <Heart fill="white" size={48} />
            </div>
            <div className="liked-info">
              <span className="liked-title">Liked Songs</span>
              <span className="liked-count">{likedTrackIds.length} songs</span>
            </div>
          </div>

          {createdPlaylists.map(playlist => (
            <MediaCard
              key={playlist.id}
              item={playlist}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            />
          ))}

          {recentlyPlayed.slice(0, 10).map(track => (
            <MediaCard
              key={track.id}
              item={track}
              onClick={() => navigate(`/search?q=${encodeURIComponent(track.name)}`)}
            />
          ))}

        </div>
      </div>
    </div>
  );
};

export default Library;
