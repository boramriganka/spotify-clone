import React from 'react';
import { Play, Pause, Heart, Speaker } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { togglePlay, setProgress } from '../../store/slices/playerSlice';
import { toggleLike } from '../../store/slices/musicSlice';
import ProgressBar from '../ProgressBar/ProgressBar';
import './MiniPlayer.scss';

interface MiniPlayerProps {
  onExpand: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const { currentTrackId, isPlaying, progress, duration, playbackError } = useSelector((state: RootState) => state.player);
  const { tracksById, likedTrackIds } = useSelector((state: RootState) => state.music);
  const dispatch = useDispatch();

  const currentTrack = currentTrackId ? tracksById[currentTrackId] : null;

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  return (
    <div className="mini-player-wrapper">
      <div className="mini-player" onClick={onExpand}>
        <div className="track-info">
          <img src={currentTrack.artworkUrl} alt={currentTrack.name} />
          <div className="text">
            <span className="name">{currentTrack.name}</span>
            <div className="meta">
                {currentTrack.playability === 'preview' && <span className="preview-tag">Preview only</span>}
                <span className="artist">{currentTrack.artist}</span>
            </div>
          </div>
        </div>
        <div className="controls">
          <Speaker size={20} className="device-icon spotify-green" />
          <button onClick={(e) => { e.stopPropagation(); dispatch(toggleLike(currentTrack.id)); }}>
            <Heart size={20} className={isLiked ? 'liked' : ''} fill={isLiked ? 'var(--spotify-green)' : 'none'} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); dispatch(togglePlay()); }}>
            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
          </button>
        </div>
        <div className="progress-bar-mini" onClick={(e) => e.stopPropagation()}>
          <ProgressBar
            progress={progress}
            duration={duration}
            onSeek={(t) => dispatch(setProgress(t))}
            showKnob={false}
          />
        </div>
        {playbackError && <div className="player-toast">{playbackError}</div>}
      </div>
    </div>
  );
};

export default MiniPlayer;
