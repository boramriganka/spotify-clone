import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Track } from '../../providers/types';
import './TrackRow.scss';

interface TrackRowProps {
  track: Track;
  index?: number;
  isActive?: boolean;
  onPlay?: () => void;
  showAlbum?: boolean;
}

const TrackRow: React.FC<TrackRowProps> = ({ track, index, isActive, onPlay, showAlbum = true }) => {
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
