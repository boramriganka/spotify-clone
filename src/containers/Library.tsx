import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { getUserPlaylists } from '../providers/localProvider';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Plus } from 'lucide-react';
import './Library.scss';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { likedTrackIds, followedArtistIds, artistsById } = useSelector((state: RootState) => state.music);
  const [localPlaylists, setLocalPlaylists] = useState(getUserPlaylists());

  useEffect(() => {
    const update = () => setLocalPlaylists(getUserPlaylists());
    window.addEventListener('playlists_updated', update);
    return () => window.removeEventListener('playlists_updated', update);
  }, []);

  const handleCreatePlaylist = () => {
    (window as any).toggleCreate?.();
  };

  return (
    <div className="library-screen">
      <header className="library-header">
        <div className="header-top">
          <button className="avatar-btn" onClick={() => (window as any).toggleDrawer?.()}>
            <div className="user-avatar">M</div>
          </button>
          <h2>Your Library</h2>
          <div className="header-actions">
            <button className="search-btn"><SearchIcon size={24} /></button>
            <button className="add-btn" onClick={handleCreatePlaylist}><Plus size={28} /></button>
          </div>
        </div>
        <div className="library-chips scroll-container">
          <button className="chip active">Playlists</button>
          <button className="chip">Artists</button>
          <button className="chip">Albums</button>
          <button className="chip">Podcasts & Shows</button>
        </div>
      </header>

      <div className="library-content">
        <div className="library-list">
          {/* Liked Songs Tile */}
          <div className="library-item liked-songs" onClick={() => navigate('/liked')}>
             <div className="icon-box">
                <i className="lucide-heart" />
             </div>
             <div className="info">
                <span className="title">Liked Songs</span>
                <span className="subtitle">Playlist • {likedTrackIds.length} songs</span>
             </div>
          </div>

          {/* User Playlists */}
          {localPlaylists.map(playlist => (
            <div key={playlist.id} className="library-item" onClick={() => navigate(`/playlist/${playlist.id}`)}>
               <img src={playlist.artworkUrl || 'https://picsum.photos/seed/playlist/300/300'} alt="" />
               <div className="info">
                  <span className="title">{playlist.title}</span>
                  <span className="subtitle">Playlist • {playlist.owner}</span>
               </div>
            </div>
          ))}

          {/* Followed Artists */}
          {followedArtistIds.map(id => {
            const artist = artistsById[id];
            if (!artist) return null;
            return (
              <div key={id} className="library-item circle" onClick={() => navigate(`/artist/${id}`)}>
                 <img src={artist.artworkUrl} alt="" />
                 <div className="info">
                    <span className="title">{artist.name}</span>
                    <span className="subtitle">Artist</span>
                 </div>
              </div>
            );
          })}

          {localPlaylists.length === 0 && followedArtistIds.length === 0 && (
            <div className="empty-library">
               <p>Your library is empty</p>
               <button onClick={() => navigate('/search')}>Find something to listen to</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
