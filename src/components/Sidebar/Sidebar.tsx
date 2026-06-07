import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import './Sidebar.scss';

const Sidebar: React.FC = () => {
  const { createdPlaylistIds, playlistsById } = useSelector((state: RootState) => state.player);
  const localPlaylists = createdPlaylistIds.map(id => playlistsById[id]).filter(Boolean);
  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Search size={24} />
          <span>Search</span>
        </NavLink>
        <NavLink to="/library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Library size={24} />
          <span>Your Library</span>
        </NavLink>
      </div>

      <div className="sidebar-actions">
        <button className="action-item" onClick={() => (window as any).toggleCreateSheet?.()}>
          <div className="icon-box create-playlist">
            <PlusSquare size={20} />
          </div>
          <span>Create Playlist</span>
        </button>
        <NavLink to="/liked" className="action-item">
          <div className="icon-box liked-songs">
            <Heart size={16} fill="white" />
          </div>
          <span>Liked Songs</span>
        </NavLink>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-playlists scroll-container">
        {localPlaylists.length === 0 && (
          <p className="sidebar-empty-hint">Create your first playlist</p>
        )}
        {localPlaylists.map((p) => (
          <NavLink key={p.id} to={`/playlist/${p.id}`} className="playlist-item">
            {p.name}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
