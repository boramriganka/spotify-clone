import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { HiBars3 } from 'react-icons/hi2';
import { HiX } from 'react-icons/hi';
import { Analytics } from './vercelAnalytics';
import Sidebar from './Sidebar';
import Home from './Home';
import Search from './Search';
import Favourites from './Favourites';
import BottomPlayer from './BottomPlayer';
import { PlayerProvider } from './PlayerContext';
import { getQuickLinks, Playlist } from './api';
import './App.css';

interface AppProps {
  userPlaylists: any[];
}

const App: React.FC<AppProps> = ({ userPlaylists }) => {
  const [activeView, setActiveView] = useState('home');
  const [libraryFilter, setLibraryFilter] = useState<'playlists' | 'artists' | 'albums'>('playlists');
  const [sidebarPlaylists, setSidebarPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    // Clear selected playlist when switching views (except when going to home with a playlist selected)
    if (view !== 'home') {
      setSelectedPlaylist(null);
    }
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const loadPlaylists = React.useCallback(async () => {
    try {
      const playlists = await getQuickLinks();
      setSidebarPlaylists(playlists);
    } catch (error) {
      console.error('Error loading sidebar playlists:', error);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // Listen for changes to favorites and playlists in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'Favourite' || e.key === 'playlists') {
        // Reload playlists when favorites or playlists change
        loadPlaylists();
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (from same tab)
    const handleCustomStorageChange = () => {
      loadPlaylists();
    };
    window.addEventListener('favoritesChanged', handleCustomStorageChange);
    window.addEventListener('playlistsChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesChanged', handleCustomStorageChange);
      window.removeEventListener('playlistsChanged', handleCustomStorageChange);
    };
  }, [loadPlaylists]);

  return (
    <PlayerProvider>
      <Analytics />
      <div className="app-container">
        {/* Mobile Hamburger Menu */}
        <button
          className={`mobile-menu-button ${sidebarOpen ? 'sidebar-open' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <HiX size={24} /> : <HiBars3 size={24} />}
        </button>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="mobile-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`sidebar-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Sidebar
            activeView={activeView}
            onViewChange={handleViewChange}
            libraryFilter={libraryFilter}
            onLibraryFilterChange={setLibraryFilter}
            playlists={sidebarPlaylists}
            userPlaylists={userPlaylists}
            onPlaylistSelect={(playlist) => {
              setSelectedPlaylist(playlist);
              setActiveView('home');
            }}
          />
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          {activeView === 'home' && <Home selectedPlaylist={selectedPlaylist} onPlaylistBack={() => setSelectedPlaylist(null)} />}
          {activeView === 'search' && <Search />}
          {activeView === 'library' && <Favourites />}
        </div>
      </div>
      
      <BottomPlayer />
    </PlayerProvider>
  );
};

const mapStateToProps = (state: any) => ({
  userPlaylists: state.search?.playlists || [],
});

export default connect(mapStateToProps)(App);

