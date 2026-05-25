import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Track } from '../../providers/types';
import TrackOverflow from './TrackOverflow';
import './TrackRow.scss';

interface TrackRowProps {
  track: Track;
  index?: number;
  isActive?: boolean;
  onPlay?: () => void;
  showAlbum?: boolean;
}

const TrackRow: React.FC<TrackRowProps> = ({ track, index, isActive, onPlay, showAlbum = true }) => {
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  return (
    <>
      <div className={`track-row ${isActive ? 'active' : ''}`} onClick={onPlay}>
        <div className="track-start">
          {index !== undefined && <span className="track-index">{index + 1}</span>}
          <img src={track.artworkUrl} alt={track.name} className="track-img" />
          <div className="track-info">
            <span className="track-name">{track.name}</span>
            <div className="track-meta">
              {track.playability === 'preview' && <span className="preview-label">Preview</span>}
              {track.playability === 'full' && <span className="full-label">Full Song</span>}
              {track.playability === 'unavailable' && <span className="unavailable-label">Unavailable</span>}
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
          <button className="track-more" onClick={(e) => { e.stopPropagation(); setIsOverflowOpen(true); }}>
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <TrackOverflow
        isOpen={isOverflowOpen}
        onClose={() => setIsOverflowOpen(false)}
        trackId={track.id}
        trackName={track.name}
        artistName={track.artist}
      />
    </>
  );
};

export default TrackRow;
