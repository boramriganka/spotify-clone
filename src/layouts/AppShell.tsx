import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import BottomNav from '../components/BottomNav/BottomNav';
import AccountDrawer from '../components/AccountDrawer/AccountDrawer';
import MiniPlayer from '../components/MiniPlayer/MiniPlayer';
import FullPlayer from '../components/FullPlayer/FullPlayer';
import AudioEngine from '../components/AudioEngine';
import NowPlayingPanel from '../components/NowPlayingPanel/NowPlayingPanel';
import DesktopPlayer from '../components/DesktopPlayer/DesktopPlayer';
import CreateSheet from '../components/CreateSheet/CreateSheet';
import './AppShell.scss';

const AppShell: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(() => {
    return localStorage.getItem('desktop_panel_open') === 'true';
  });
  const location = useLocation();

  // Hide drawer trigger on deep pages
  const showDrawerTrigger = !['/player', '/settings'].some(path => location.pathname.startsWith(path));

  const togglePanel = () => {
    setIsPanelOpen(prev => {
      const newState = !prev;
      localStorage.setItem('desktop_panel_open', String(newState));
      return newState;
    });
  };

  return (
    <div className="app-shell">
      <AudioEngine />

      <div className="app-layout">
        <Sidebar />

        <main className="main-content scroll-container">
          {showDrawerTrigger && (
            <header className="mobile-header">
              <button className="avatar-btn" onClick={() => setIsDrawerOpen(true)}>
                <div className="avatar">M</div>
              </button>
              <div className="header-chips">
                <button className="chip active">All</button>
                <button className="chip">Music</button>
                <button className="chip">Podcasts</button>
              </div>
            </header>
          )}

          <div className="content-wrapper">
            <Outlet />
          </div>

          {/* Bottom spacing for mini player and bottom nav */}
          <div className="content-bottom-spacing" />
        </main>

        <NowPlayingPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      </div>

      <AccountDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <MiniPlayer onExpand={() => setIsPlayerOpen(true)} />
      <FullPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />

      <DesktopPlayer onTogglePanel={togglePanel} isPanelOpen={isPanelOpen} />
      <BottomNav />
    </div>
  );
};

export default AppShell;
