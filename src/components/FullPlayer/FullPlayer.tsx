import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, MoreHorizontal, Heart, Shuffle,
  SkipBack, SkipForward, Play, Pause, Repeat,
  Share2, ListMusic, Volume2, Tv
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleLike, setCurrentDevice } from '../../store/slices/playerSlice';
import { setNowPlayingOpen } from '../../store/slices/uiSlice';
import { usePlaybackController } from '../../core/player/usePlaybackController';
import { useQueue } from '../../core/queue/useQueue';
import { FastAverageColor } from 'fast-average-color';
import BottomSheet from '../BottomSheet/BottomSheet';
import ProgressBar from '../ProgressBar/ProgressBar';
import './FullPlayer.scss';

const GENERIC_DEVICES = ['This device', 'Web Player', 'TV / Chromecast'];

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullPlayer: React.FC<FullPlayerProps> = ({ isOpen, onClose }) => {
  const { currentTrack, status, positionMs, durationMs, togglePlay, seek } = usePlaybackController();
  const { next, previous, shuffleEnabled, toggleShuffle, repeatMode, setRepeatMode } = useQueue();
  const { likedTrackIds, currentDevice } = useSelector((state: RootState) => state.player);
  const queueSnapshot = useSelector((state: RootState) => state.queue.snapshot);
  const dispatch = useDispatch();
  const [bgColor, setBgColor] = useState('#121212');
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareToast, setShareToast] = useState(false);

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

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;
  const isPlaying = status === 'playing';

  const playingFromLabel = queueSnapshot
    ? queueSnapshot.sourceType.replace(/-/g, ' ').toUpperCase()
    : 'NOW PLAYING';

  const playingFromName = queueSnapshot?.sourceId === 'liked'
    ? 'Liked Songs'
    : queueSnapshot?.sourceId || currentTrack?.artist || '';

  const handleShare = () => {
    const text = `${currentTrack!.name} by ${currentTrack!.artist}`;
    if (navigator.share) {
      navigator.share({ title: currentTrack!.name, text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      });
    }
  };

  const formatTime = (timeMs: number) => {
    const timeSec = timeMs / 1000;
    const mins = Math.floor(timeSec / 60);
    const secs = Math.floor(timeSec % 60);
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
                <span className="label">{playingFromLabel}</span>
                <span className="playlist-name">{playingFromName}</span>
              </div>
              <button onClick={() => setIsCreditsOpen(true)}><MoreHorizontal size={24} /></button>
            </div>

            <div className="player-content scroll-container">
              <div className="album-art-container">
                <img src={currentTrack.image} alt={currentTrack.name} className="album-art" />
              </div>

              <div className="track-info-container">
                <div className="track-text">
                  <h1>{currentTrack.name}</h1>
                  <div className="meta">
                    {currentTrack.source === 'itunes' && <span className="preview-tag">Preview only</span>}
                    <p>{currentTrack.artist}</p>
                  </div>
                </div>
            <button onClick={() => dispatch(toggleLike(currentTrack as any))}>
                  <Heart size={28} className={isLiked ? 'liked' : ''} fill={isLiked ? 'var(--spotify-green)' : 'none'} />
                </button>
              </div>

              <div className="progress-container">
              <ProgressBar
                progress={positionMs / 1000}
                duration={durationMs / 1000}
                onSeek={(t) => seek(t * 1000)}
              />
                <div className="time-info">
                  <span>{formatTime(positionMs)}</span>
                  <span>{formatTime(durationMs)}</span>
                </div>
              </div>

              <div className="main-controls">
                <button
                  className={`shuffle ${shuffleEnabled ? 'active' : ''}`}
                  onClick={() => toggleShuffle()}
                >
                  <Shuffle size={24} />
                </button>
                <button className="skip" onClick={() => previous(positionMs)}>
                  <SkipBack size={36} fill="white" />
                </button>
                <button className="play-pause" onClick={() => togglePlay()}>
                  {isPlaying ? <Pause size={48} fill="black" /> : <Play size={48} fill="black" />}
                </button>
                <button className="skip" onClick={() => next()}>
                  <SkipForward size={36} fill="white" />
                </button>
                <button
                  className={`repeat ${repeatMode !== 'off' ? 'active' : ''}`}
                  onClick={() => {
                    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
                    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
                    setRepeatMode(modes[nextIdx]);
                  }}
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
                  <button onClick={handleShare} className="icon-btn" title={shareToast ? 'Copied!' : 'Share'}>
                    <Share2 size={20} className={shareToast ? 'spotify-green' : ''} />
                  </button>
                  <button onClick={() => { dispatch(setNowPlayingOpen(true)); onClose(); }} className="icon-btn">
                    <ListMusic size={20} />
                  </button>
                </div>
              </div>

              <div className="artist-card-section">
                 <div className="artist-card">
                    <div className="artist-banner" style={{backgroundImage: `url(${currentTrack.image})`}}>
                      <span>About the artist</span>
                    </div>
                    <div className="artist-card-content">
                      <h3>{currentTrack.artist}</h3>
                      <p className="bio">Explore more from this artist and discover their music.</p>
                      <button
                        className={`follow-btn ${isFollowing ? 'following' : ''}`}
                        onClick={() => setIsFollowing(f => !f)}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
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
            <p className="source-text">{(currentTrack.source || 'unknown').toUpperCase()}</p>
          </div>
          <button className="report-btn" onClick={() => { alert('Thank you — error reported!'); setIsCreditsOpen(false); }}>Report an error</button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={isDevicePickerOpen}
        onClose={() => setIsDevicePickerOpen(false)}
        title="Connect to a device"
      >
        <div className="device-picker-content">
          {GENERIC_DEVICES.map(device => (
             <div
               key={device}
               className={`device-item ${device === currentDevice ? 'active' : ''}`}
               onClick={() => { dispatch(setCurrentDevice(device)); setIsDevicePickerOpen(false); }}
             >
               <Volume2 size={20} />
               <span>{device}</span>
             </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
};

export default FullPlayer;
