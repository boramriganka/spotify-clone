import React from 'react';
import { Play, Pause, Heart, Speaker } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleLike } from '../../store/slices/playerSlice';
import { usePlaybackController } from '../../core/player/usePlaybackController';
import ProgressBar from '../ProgressBar/ProgressBar';
import './MiniPlayer.scss';

interface MiniPlayerProps {
  onExpand: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const { currentTrack, status, positionMs, durationMs } = usePlaybackController();
  const { likedTrackIds } = useSelector((state: RootState) => state.player);
  const dispatch = useDispatch();

  if (!currentTrack) return null;

  const isPlaying = status === 'playing';
  const isLiked = likedTrackIds.includes(currentTrack.id);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      dispatch({ type: 'playback/setStatus', payload: 'paused' });
    } else {
      dispatch({ type: 'playback/setStatus', payload: 'playing' });
    }
  };

  return (
    <div className="mini-player-wrapper">
      <div className="mini-player" onClick={onExpand}>
        <div className="track-info">
          <img src={currentTrack.image || ''} alt={currentTrack.name} />
          <div className="text">
            <span className="name">{currentTrack.name}</span>
            <div className="meta">
                {currentTrack.source === 'itunes' && <span className="preview-tag">Preview only</span>}
                <span className="artist">{currentTrack.artist}</span>
            </div>
          </div>
        </div>
        <div className="controls">
          <Speaker size={20} className="device-icon spotify-green" />
          <button onClick={(e) => { e.stopPropagation(); dispatch(toggleLike(currentTrack as any)); }}>
            <Heart size={20} className={isLiked ? 'liked' : ''} fill={isLiked ? 'var(--spotify-green)' : 'none'} />
          </button>
          <button onClick={handleTogglePlay}>
            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
          </button>
        </div>
        <div className="progress-bar-mini" onClick={(e) => e.stopPropagation()}>
          <ProgressBar
            progress={positionMs / 1000}
            duration={durationMs / 1000}
            onSeek={(t) => dispatch({ type: 'playback/setPosition', payload: t * 1000 })}
            showKnob={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
