import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setAiDjOpen, setAccountDrawerOpen, setNowPlayingOpen } from '../store/slices/uiSlice';
import Sidebar from '../components/Sidebar/Sidebar';
import BottomNav from '../components/BottomNav/BottomNav';
import AccountDrawer from '../components/AccountDrawer/AccountDrawer';
import MiniPlayer from '../components/MiniPlayer/MiniPlayer';
import FullPlayer from '../components/FullPlayer/FullPlayer';
import AudioEngine from '../components/AudioEngine';
import NowPlayingPanel from '../components/NowPlayingPanel/NowPlayingPanel';
import DesktopPlayer from '../components/DesktopPlayer/DesktopPlayer';
import CreateSheet from '../components/CreateSheet/CreateSheet';
import AiDj from '../containers/AiDj';
import { usePlayerPersistence } from '../hooks/usePlayerPersistence';
import './AppShell.scss';

const AppShell: React.FC = () => {
  usePlayerPersistence();
  const dispatch = useDispatch();
  const { isAiDjOpen, isAccountDrawerOpen, isNowPlayingOpen } = useSelector((state: RootState) => state.ui);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const location = useLocation();

  // Hide drawer trigger on deep pages
  const showDrawerTrigger = !['/player', '/settings'].some(path => location.pathname.startsWith(path));

  const togglePanel = () => {
    dispatch(setNowPlayingOpen(!isNowPlayingOpen));
  };

  React.useEffect(() => {
    (window as any).toggleAiDj = () => dispatch(setAiDjOpen(true));
    (window as any).toggleCreateSheet = () => setIsCreateOpen(prev => !prev);
  }, [dispatch]);

  return (
    <div className="app-shell">
      <AudioEngine />

      <div className="app-layout">
        <Sidebar />

        <main className="main-content scroll-container">
          {showDrawerTrigger && (
            <header className="mobile-header">
              <button className="avatar-btn" onClick={() => dispatch(setAccountDrawerOpen(true))}>
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

        <NowPlayingPanel isOpen={isNowPlayingOpen} onClose={() => dispatch(setNowPlayingOpen(false))} />
      </div>

      <AccountDrawer isOpen={isAccountDrawerOpen} onClose={() => dispatch(setAccountDrawerOpen(false))} />

      <MiniPlayer onExpand={() => setIsPlayerOpen(true)} />
      <FullPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />

      <DesktopPlayer onTogglePanel={togglePanel} isPanelOpen={isNowPlayingOpen} />
      <BottomNav />

      {isAiDjOpen && <AiDj onClose={() => dispatch(setAiDjOpen(false))} />}
      <CreateSheet isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};

export default AppShell;
