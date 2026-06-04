import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Speaker, Shuffle, Repeat, ListMusic, Maximize2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleLike } from '../../store/slices/playerSlice';
import { usePlaybackController } from '../../core/player/usePlaybackController';
import { useQueue } from '../../core/queue/useQueue';
import ProgressBar from '../ProgressBar/ProgressBar';
import './DesktopPlayer.scss';

interface DesktopPlayerProps {
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

const DesktopPlayer: React.FC<DesktopPlayerProps> = ({ onTogglePanel, isPanelOpen }) => {
  const { currentTrack, status, positionMs, durationMs, volume, setVolume, togglePlay } = usePlaybackController();
  const { next, previous, shuffleEnabled, toggleShuffle, repeatMode, setRepeatMode } = useQueue();
  const { likedTrackIds } = useSelector((state: RootState) => state.player);
  const dispatch = useDispatch();

  if (!currentTrack) return null;

  const isPlaying = status === 'playing';
  const isLiked = likedTrackIds.includes(currentTrack.id);

  const formatTime = (timeMs: number) => {
    const timeSec = timeMs / 1000;
    const mins = Math.floor(timeSec / 60);
    const secs = Math.floor(timeSec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="desktop-player">
      <div className="track-section" onClick={onTogglePanel}>
        <img src={currentTrack.image || ''} alt={currentTrack.name} />
        <div className="text">
          <span className="name">{currentTrack.name}</span>
          <div className="meta">
              {currentTrack.source === 'itunes' && <span className="preview-tag">Preview only</span>}
              <span className="artist">{currentTrack.artist}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); dispatch(toggleLike(currentTrack as any)); }}>
          <Heart size={16} className={isLiked ? 'liked' : ''} fill={isLiked ? '#1DB954' : 'none'} />
        </button>
      </div>

      <div className="controls-section">
        <div className="buttons">
          <button className={`shuffle ${shuffleEnabled ? 'active' : ''}`} onClick={() => toggleShuffle()}>
            <Shuffle size={16} />
          </button>
          <button onClick={() => previous(positionMs)}><SkipBack size={20} fill="white" /></button>
          <button className="play-pause" onClick={() => togglePlay()}>
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
          </button>
          <button onClick={() => next()}><SkipForward size={20} fill="white" /></button>
          <button className={`repeat ${repeatMode !== 'off' ? 'active' : ''}`} onClick={() => {
              const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
              const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
              setRepeatMode(modes[nextIdx]);
          }}>
            <Repeat size={16} />
          </button>
        </div>
        <div className="progress-area">
          <span>{formatTime(positionMs)}</span>
          <ProgressBar
            progress={positionMs / 1000}
            duration={durationMs / 1000}
            onSeek={(t) => dispatch({ type: 'playback/setPosition', payload: t * 1000 })}
          />
          <span>{formatTime(durationMs)}</span>
        </div>
      </div>

      <div className="extra-section">
        <button onClick={onTogglePanel} className={isPanelOpen ? 'active' : ''}><Maximize2 size={16} /></button>
        <button><ListMusic size={16} /></button>
        <div className="volume-control">
          <Speaker size={16} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </footer>
  );
};

export default DesktopPlayer;
