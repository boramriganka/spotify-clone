import React from 'react';
import { Play } from 'lucide-react';
import { MediaItem, Track } from '../../providers/types';
import './MediaCard.scss';

interface MediaCardProps {
  item: MediaItem;
  onClick?: () => void;
  variant?: 'square' | 'circle' | 'tile';
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, variant = 'square' }) => {
  const isCircle = variant === 'circle' || item.type === 'artist';
  const isTile = variant === 'tile';

  if (isTile) {
    return (
      <div className="media-tile" onClick={onClick}>
        <img src={item.image} alt={item.name} />
        <span className="tile-title">{item.name}</span>
      </div>
    );
  }

  return (
    <div className={`media-card ${isCircle ? 'circle' : ''}`} onClick={onClick}>
      <div className="image-container">
        <img src={item.image} alt={item.name} />
        {!isCircle && (
          <button className="play-button">
            <Play fill="black" size={20} />
          </button>
        )}
      </div>
      <div className="card-info">
        <span className="item-name">{item.name}</span>
        <span className="item-desc">
          {item.type === 'track' && (
            <div className="track-meta">
              {(item as Track).availability === 'preview' && <span className="preview-tag">Preview</span>}
              <span>{item.artist}</span>
            </div>
          )}
          {item.type === 'album' && item.artist}
          {item.type === 'artist' && 'Artist'}
          {item.type === 'playlist' && (item as any).description}
        </span>
      </div>
    </div>
  );
};

export default MediaCard;
