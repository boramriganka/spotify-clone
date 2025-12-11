import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Home from './Home';
import BottomPlayer from './BottomPlayer';
import { PlayerProvider } from './PlayerContext';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('home');
  const [libraryFilter, setLibraryFilter] = useState<'playlists' | 'artists' | 'albums'>('playlists');

  return (
    <PlayerProvider>
      <div style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#000000',
        gap: '8px',
        padding: '8px',
        paddingBottom: '98px', // Space for bottom player
      }}>
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          libraryFilter={libraryFilter}
          onLibraryFilterChange={setLibraryFilter}
        />
        
        {activeView === 'home' && <Home />}
        {activeView === 'search' && (
          <div style={{
            flex: 1,
            backgroundColor: '#121212',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            Search View (Coming Soon)
          </div>
        )}
        {activeView === 'library' && (
          <div style={{
            flex: 1,
            backgroundColor: '#121212',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            Library View (Coming Soon)
          </div>
        )}
      </div>
      
      <BottomPlayer />
    </PlayerProvider>
  );
};

export default App;
