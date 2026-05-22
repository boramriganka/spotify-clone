import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Speaker, Share2, ListMusic } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleLike } from '../../store/slices/playerSlice';
import './NowPlayingPanel.scss';

interface NowPlayingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NowPlayingPanel: React.FC<NowPlayingPanelProps> = ({ isOpen, onClose }) => {
  const { currentTrack, likedTrackIds, currentDevice } = useSelector((state: RootState) => state.player);
  const dispatch = useDispatch();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className="now-playing-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="panel-header">
            <h3>Now Playing</h3>
            <button onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>

          <div className="panel-content scroll-container">
            <img src={currentTrack.image} alt={currentTrack.name} className="main-art" />

            <div className="track-info">
              <div className="text">
                <h2>{currentTrack.name}</h2>
                <p>{currentTrack.artist}</p>
              </div>
              <button onClick={() => dispatch(toggleLike(currentTrack.id))}>
                <Heart size={24} className={isLiked ? 'liked' : ''} fill={isLiked ? 'var(--spotify-green)' : 'none'} />
              </button>
            </div>

            <div className="artist-card">
              <div className="banner" style={{ backgroundImage: `url(${currentTrack.image})` }}>
                <span>About the artist</span>
              </div>
              <div className="content">
                <h3>{currentTrack.artist}</h3>
                <p>3,456,789 monthly listeners</p>
                <button className="follow-btn">Follow</button>
              </div>
            </div>

            <div className="panel-credits">
              <div className="header">
                <h4>Credits</h4>
                <button className="show-all">Show all</button>
              </div>
              <div className="credit-item">
                <span className="name">{currentTrack.artist}</span>
                <span className="role">Main Artist</span>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default NowPlayingPanel;
