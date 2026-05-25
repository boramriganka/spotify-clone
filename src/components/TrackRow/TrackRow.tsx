import React from 'react';
import { MoreHorizontal, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Track } from '../../providers/types';
import { toggleLike } from '../../store/slices/playerSlice';
import { RootState } from '../../store';
import './TrackRow.scss';

interface TrackRowProps {
  track: Track;
  index?: number;
  isActive?: boolean;
  onPlay?: () => void;
  showAlbum?: boolean;
}

const TrackRow: React.FC<TrackRowProps> = ({ track, index, isActive, onPlay, showAlbum = true }) => {
  const dispatch = useDispatch();
  const likedTrackIds = useSelector((state: RootState) => state.player.likedTrackIds);
  const isLiked = likedTrackIds.includes(track.id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLike(track.id));
  };

  return (
    <div className={`track-row ${isActive ? 'active' : ''}`} onClick={onPlay}>
      <div className="track-start">
        {index !== undefined && <span className="track-index">{index + 1}</span>}
        <img src={track.image} alt={track.name} className="track-img" />
        <div className="track-info">
          <span className="track-name">{track.name}</span>
          <div className="track-meta">
            {track.provider === 'itunes' && <span className="preview-label">Preview</span>}
            <span className="track-artist">{track.artist}</span>
          </div>
        </div>
      </div>

      {showAlbum && (
        <div className="track-album">
          {track.album}
        </div>
      )}

      <div className="track-end">
        <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <Heart size={16} fill={isLiked ? "var(--spotify-green)" : "none"} color={isLiked ? "var(--spotify-green)" : "currentColor"} />
        </button>
        <span className="track-duration">
          {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
        </span>
        <button className="track-more">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default TrackRow;
