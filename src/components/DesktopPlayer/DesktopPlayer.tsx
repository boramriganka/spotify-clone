import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Speaker, Shuffle, Repeat, ListMusic, Maximize2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setIsPlaying, toggleLike, nextTrack, previousTrack, toggleShuffle, toggleRepeat, seekTo } from '../../store/slices/playerSlice';
import ProgressBar from '../ProgressBar/ProgressBar';
import './DesktopPlayer.scss';

interface DesktopPlayerProps {
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

const DesktopPlayer: React.FC<DesktopPlayerProps> = ({ onTogglePanel, isPanelOpen }) => {
  const { currentTrackId, tracksById, isPlaying, progress, duration, likedTrackIds, isShuffled, repeatMode } = useSelector((state: RootState) => state.player);
  const currentTrack = currentTrackId ? tracksById[currentTrackId] : null;
  const dispatch = useDispatch();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="desktop-player">
      <div className="track-section" onClick={onTogglePanel}>
        <img src={currentTrack.image} alt={currentTrack.name} />
        <div className="text">
          <span className="name">{currentTrack.name}</span>
          <div className="meta">
              {currentTrack.provider === 'itunes' && <span className="preview-tag">Preview only</span>}
              <span className="artist">{currentTrack.artist}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); dispatch(toggleLike(currentTrack.id)); }}>
          <Heart size={16} className={isLiked ? 'liked' : ''} fill={isLiked ? '#1DB954' : 'none'} />
        </button>
      </div>

      <div className="controls-section">
        <div className="buttons">
          <button className={`shuffle ${isShuffled ? 'active' : ''}`} onClick={() => dispatch(toggleShuffle())}>
            <Shuffle size={16} />
          </button>
          <button onClick={() => dispatch(previousTrack())}><SkipBack size={20} fill="white" /></button>
          <button className="play-pause" onClick={() => dispatch(setIsPlaying(!isPlaying))}>
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
          </button>
          <button onClick={() => dispatch(nextTrack())}><SkipForward size={20} fill="white" /></button>
          <button className={`repeat ${repeatMode !== 'off' ? 'active' : ''}`} onClick={() => dispatch(toggleRepeat())}>
            <Repeat size={16} />
          </button>
        </div>
        <div className="progress-area">
          <span>{formatTime(progress)}</span>
          <ProgressBar progress={progress} duration={duration} onSeek={(t) => dispatch(seekTo(t))} />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="extra-section">
        <button onClick={onTogglePanel} className={isPanelOpen ? 'active' : ''}><Maximize2 size={16} /></button>
        <button><ListMusic size={16} /></button>
        <div className="volume-control">
          <Speaker size={16} />
          <div className="volume-bar" />
        </div>
      </div>
    </footer>
  );
};

export default DesktopPlayer;
