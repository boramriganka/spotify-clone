import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleLike } from '../../store/slices/playerSlice';
import './NowPlayingPanel.scss';

interface NowPlayingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NowPlayingPanel: React.FC<NowPlayingPanelProps> = ({ isOpen, onClose }) => {
  const { currentTrackId, tracksById, likedTrackIds } = useSelector((state: RootState) => state.player);
  const currentTrack = currentTrackId ? tracksById[currentTrackId] : null;
  const dispatch = useDispatch();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className="now-playing-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
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
                <Heart size={24} className={isLiked ? 'liked' : ''} fill={isLiked ? '#1DB954' : 'none'} />
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
              <div className="credit-list">
                <div className="credit-item">
                    <div className="name-role">
                        <span className="name">{currentTrack.artist}</span>
                        <span className="role">Main Artist</span>
                    </div>
                    <button className="follow-link">Follow</button>
                </div>
                <div className="credit-item">
                    <div className="name-role">
                        <span className="name">{currentTrack.artist}</span>
                        <span className="role">Producer</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default NowPlayingPanel;
