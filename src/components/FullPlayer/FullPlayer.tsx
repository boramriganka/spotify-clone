import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, MoreHorizontal, Heart, Shuffle,
  SkipBack, SkipForward, Play, Pause, Repeat,
  Share2, ListMusic, Speaker
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { togglePlay, nextTrack, previousTrack, toggleLike, toggleShuffle, toggleRepeat, seekTo } from '../../store/slices/playerSlice';
import { FastAverageColor } from 'fast-average-color';
import BottomSheet from '../BottomSheet/BottomSheet';
import ProgressBar from '../ProgressBar/ProgressBar';
import './FullPlayer.scss';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullPlayer: React.FC<FullPlayerProps> = ({ isOpen, onClose }) => {
  const { currentTrack, isPlaying, progress, duration, likedTrackIds, isShuffled, repeatMode, currentDevice } = useSelector((state: RootState) => state.player);
  const dispatch = useDispatch();
  const [bgColor, setBgColor] = useState('#121212');
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);

  useEffect(() => {
    if (currentTrack?.image) {
      const fac = new FastAverageColor();
      fac.getColorAsync(currentTrack.image)
        .then(color => {
          setBgColor(color.hex);
        })
        .catch(e => console.error(e));
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const progressPercent = (progress / duration) * 100;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="full-player"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ background: `linear-gradient(to bottom, ${bgColor} 0%, #121212 100%)` }}
          >
            <div className="player-header">
              <button onClick={onClose}><ChevronDown size={32} /></button>
              <div className="playing-from">
                <span className="label">PLAYING FROM PLAYLIST</span>
                <span className="playlist-name">Liked Songs</span>
              </div>
              <button><MoreHorizontal size={24} /></button>
            </div>

            <div className="player-content scroll-container">
              <div className="album-art-container">
                <img src={currentTrack.image} alt={currentTrack.name} className="album-art" />
              </div>

              <div className="track-info-container">
                <div className="track-text">
                  <h1>{currentTrack.name}</h1>
                  <p>{currentTrack.artist}</p>
                </div>
                <button onClick={() => dispatch(toggleLike(currentTrack.id))}>
                  <Heart size={28} className={isLiked ? 'liked' : ''} fill={isLiked ? 'var(--spotify-green)' : 'none'} />
                </button>
              </div>

              <div className="progress-container">
              <ProgressBar
                progress={progress}
                duration={duration}
                onSeek={(t) => dispatch(seekTo(t))}
              />
                <div className="time-info">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="main-controls">
                <button
                  className={`shuffle ${isShuffled ? 'active' : ''}`}
                  onClick={() => dispatch(toggleShuffle())}
                >
                  <Shuffle size={24} />
                </button>
                <button className="skip" onClick={() => dispatch(previousTrack())}>
                  <SkipBack size={36} fill="white" />
                </button>
                <button className="play-pause" onClick={() => dispatch(togglePlay())}>
                  {isPlaying ? <Pause size={48} fill="black" /> : <Play size={48} fill="black" />}
                </button>
                <button className="skip" onClick={() => dispatch(nextTrack())}>
                  <SkipForward size={36} fill="white" />
                </button>
                <button
                  className={`repeat ${repeatMode !== 'off' ? 'active' : ''}`}
                  onClick={() => dispatch(toggleRepeat())}
                >
                  <Repeat size={24} />
                  {repeatMode === 'one' && <span className="repeat-one">1</span>}
                </button>
              </div>

              <div className="footer-controls">
                <button className="device-info" onClick={() => setIsDevicePickerOpen(true)}>
                  <Speaker size={18} className="spotify-green" />
                  <span className="spotify-green">{currentDevice}</span>
                </button>
                <div className="extra-actions">
                  <Share2 size={20} />
                  <ListMusic size={20} />
                </div>
              </div>

              <div className="artist-card-section">
                 <div className="artist-card">
                    <div className="artist-banner" style={{backgroundImage: `url(${currentTrack.image})`}}>
                      <span>About the artist</span>
                    </div>
                    <div className="artist-card-content">
                      <h3>{currentTrack.artist}</h3>
                      <p>3,456,789 monthly listeners</p>
                      <p className="bio">Known for their unique sound and captivating performances...</p>
                      <button className="follow-btn">Follow</button>
                    </div>
                 </div>
              </div>

              <div className="explore-section">
                 <h3>Explore {currentTrack.artist}</h3>
                 <div className="explore-grid">
                    {[1,2,3].map(i => (
                      <div key={i} className="explore-tile">
                        <img src={`https://picsum.photos/seed/${currentTrack.artist}-${i}/150/150`} alt="" />
                        <span>Fan Favorites {i}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="credits-card">
                 <div className="credits-header">
                   <h3>Credits</h3>
                   <button className="show-all" onClick={() => setIsCreditsOpen(true)}>Show all</button>
                 </div>
                 <div className="credits-list">
                   <div className="credit-item">
                      <span className="name">{currentTrack.artist}</span>
                      <span className="role">Main Artist</span>
                   </div>
                   <div className="credit-item">
                      <span className="name">{currentTrack.artist}</span>
                      <span className="role">Producer</span>
                   </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomSheet
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        title={currentTrack.name}
        subtitle={currentTrack.artist}
      >
        <div className="credits-sheet-content">
          <div className="credits-section">
            <h4>Artist</h4>
            <div className="credit-row">
              <div className="credit-info">
                <span className="name">{currentTrack.artist}</span>
                <span className="role">Main Artist</span>
              </div>
              <button className="follow-btn-small">Follow</button>
            </div>
          </div>
          <div className="credits-section">
            <h4>Composition and lyrics</h4>
            <div className="credit-row">
              <div className="credit-info">
                <span className="name">{currentTrack.artist}</span>
                <span className="role">Writer</span>
              </div>
            </div>
          </div>
          <div className="credits-section">
            <h4>Production & Engineering</h4>
            <div className="credit-row">
              <div className="credit-info">
                <span className="name">{currentTrack.artist}</span>
                <span className="role">Producer</span>
              </div>
            </div>
          </div>
          <div className="credits-section">
            <h4>Source</h4>
            <p className="source-text">{currentTrack.provider.toUpperCase()}</p>
          </div>
          <button className="report-btn">Report an error</button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={isDevicePickerOpen}
        onClose={() => setIsDevicePickerOpen(false)}
        title="Connect to a device"
      >
        <div className="device-picker-content">
          {['This phone', 'Mriganka’s OnePlus Buds 4', 'Web Player'].map(device => (
             <div key={device} className={`device-item ${device === currentDevice ? 'active' : ''}`}>
               <Speaker size={20} />
               <span>{device}</span>
             </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
};

export default FullPlayer;
