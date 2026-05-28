import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Speaker, Shuffle, Repeat, ListMusic, Maximize2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setIsPlaying, toggleLike, nextTrack, previousTrack, toggleShuffle, toggleRepeat, seekTo, setVolume } from '../../store/slices/playerSlice';
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
        <button
          onClick={(e) => { e.stopPropagation(); dispatch(toggleLike(currentTrack)); }}
          aria-label={isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
        >
          <Heart size={16} className={isLiked ? 'liked' : ''} fill={isLiked ? '#1DB954' : 'none'} />
        </button>
      </div>

      <div className="controls-section">
        <div className="buttons">
          <button
            className={`shuffle ${isShuffled ? 'active' : ''}`}
            onClick={() => dispatch(toggleShuffle())}
            aria-label={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <Shuffle size={16} />
          </button>
          <button onClick={() => dispatch(previousTrack())} aria-label="Previous track">
            <SkipBack size={20} fill="white" />
          </button>
          <button
            className="play-pause"
            onClick={() => dispatch(setIsPlaying(!isPlaying))}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
          </button>
          <button onClick={() => dispatch(nextTrack())} aria-label="Next track">
            <SkipForward size={20} fill="white" />
          </button>
          <button
            className={`repeat ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={() => dispatch(toggleRepeat())}
            aria-label={repeatMode === 'off' ? 'Enable repeat' : 'Disable repeat'}
          >
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
        <button
          onClick={onTogglePanel}
          className={isPanelOpen ? 'active' : ''}
          aria-label={isPanelOpen ? 'Close now playing' : 'Open now playing'}
        >
          <Maximize2 size={16} />
        </button>
        <button aria-label="Queue"><ListMusic size={16} /></button>
        <div className="volume-control">
          <Speaker size={16} aria-label="Volume" />
          <VolumeSlider />
        </div>
      </div>
    </footer>
  );
};

const VolumeSlider: React.FC = () => {
  const volume = useSelector((state: RootState) => state.player.volume);
  const dispatch = useDispatch();
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={volume}
      onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
      className="volume-slider"
      aria-label="Volume"
    />
  );
};

export default DesktopPlayer;
