import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { getUserPlaylists } from '../../providers/localProvider';
import './Sidebar.scss';

const Sidebar: React.FC = () => {
  const [localPlaylists, setLocalPlaylists] = useState(getUserPlaylists());

  useEffect(() => {
    const update = () => setLocalPlaylists(getUserPlaylists());
    window.addEventListener('playlists_updated', update);
    return () => window.removeEventListener('playlists_updated', update);
  }, []);
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
        <button className="action-item">
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
        {localPlaylists.map((p) => (
          <NavLink key={p.id} to={`/playlist/${p.id}`} className="playlist-item">
            {p.name}
          </NavLink>
        ))}
        <div className="sidebar-divider" style={{ margin: '8px 0' }} />
        {['Chill Vibes', 'Driving Mix', 'Morning Coffee', 'Focus', 'Top Hits 2023', 'Oldies but Goldies'].map((name) => (
          <div key={name} className="playlist-item">
            {name}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
