import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard/MediaCard';
import { Heart, Clock, User, ListMusic } from 'lucide-react';
import './Playlist.scss';

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

      <div className="library-content" style={{ padding: '24px' }}>
        <div className="library-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '24px' }}>

          {/* Liked Songs Tile */}
          <div
            className="media-card"
            onClick={() => navigate('/liked')}
            style={{
                background: 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)',
                height: 'auto',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px'
            }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart fill="white" size={48} />
            </div>
            <div className="card-info" style={{ color: 'white' }}>
              <span className="item-name" style={{ fontSize: '24px' }}>Liked Songs</span>
              <span className="item-desc" style={{ color: 'white' }}>{likedTrackIds.length} songs</span>
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
