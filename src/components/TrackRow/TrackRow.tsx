import React from 'react';
import { MoreHorizontal, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { NeoTrack } from '../../utils/trackNormalizer';
import { toggleLike } from '../../store/slices/playerSlice';
import { RootState } from '../../store';
import './TrackRow.scss';

interface TrackRowProps {
  track: NeoTrack;
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
    // Legacy support for toggleLike which expects Provider Track, but NeoTrack is mostly compatible
    dispatch(toggleLike(track as any));
  };

  const durationSec = track.duration || 0;

  return (
    <div className={`track-row ${isActive ? 'active' : ''}`} onClick={onPlay}>
      <div className="track-start">
        {index !== undefined && <span className="track-index">{index + 1}</span>}
        <img src={track.image || track.artwork || ''} alt={track.name} className="track-img" />
        <div className="track-info">
          <span className="track-name">{track.name}</span>
          <div className="track-meta">
            {track.source === 'itunes' && <span className="preview-label">Preview</span>}
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
        <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={handleLike} aria-label={isLiked ? "Unlike" : "Like"}>
          <Heart size={16} fill={isLiked ? "var(--spotify-green)" : "none"} color={isLiked ? "var(--spotify-green)" : "currentColor"} />
        </button>
        <span className="track-duration">
          {Math.floor(durationSec / 60)}:{String(Math.floor(durationSec % 60)).padStart(2, '0')}
        </span>
        <button className="track-more" aria-label="More options">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default TrackRow;
