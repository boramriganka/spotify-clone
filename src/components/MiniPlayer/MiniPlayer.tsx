import React from 'react';
import { Play, Pause, Heart, Speaker } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setIsPlaying, toggleLike, seekTo } from '../../store/slices/playerSlice';
import ProgressBar from '../ProgressBar/ProgressBar';
import './MiniPlayer.scss';

interface MiniPlayerProps {
  onExpand: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const { currentTrackId, tracksById, isPlaying, progress, duration, likedTrackIds, currentDevice } = useSelector((state: RootState) => state.player);
  const currentTrack = currentTrackId ? tracksById[currentTrackId] : null;
  const dispatch = useDispatch();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  return (
    <div className="mini-player-wrapper">
      <div className="mini-player" onClick={onExpand}>
        <div className="track-info">
          <img src={currentTrack.image} alt={currentTrack.name} />
          <div className="text">
            <span className="name">{currentTrack.name}</span>
            <div className="meta">
                {currentTrack.provider === 'itunes' && <span className="preview-tag">Preview only</span>}
                <span className="artist">{currentTrack.artist}</span>
            </div>
          </div>
        </div>
        <div className="controls">
          <Speaker size={20} className="device-icon spotify-green" />
          <button
            onClick={(e) => { e.stopPropagation(); dispatch(toggleLike(currentTrack)); }}
            aria-label={isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
          >
            <Heart size={20} className={isLiked ? 'liked' : ''} fill={isLiked ? 'var(--spotify-green)' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); dispatch(setIsPlaying(!isPlaying)); }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
          </button>
        </div>
        <div className="progress-bar-mini" onClick={(e) => e.stopPropagation()}>
          <ProgressBar
            progress={progress}
            duration={duration}
            onSeek={(t) => dispatch(seekTo(t))}
            showKnob={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
