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

  const artworkUrl = (item as any).artworkUrl;
  const name = (item as any).name || (item as any).title;

  if (isTile) {
    return (
      <div className="media-tile" onClick={onClick}>
        <img src={artworkUrl} alt={name} />
        <span className="tile-title">{name}</span>
      </div>
    );
  }

  return (
    <div className={`media-card ${isCircle ? 'circle' : ''}`} onClick={onClick}>
      <div className="image-container">
        <img src={artworkUrl} alt={name} />
        {!isCircle && (
          <button className="play-button">
            <Play fill="black" size={20} />
          </button>
        )}
      </div>
      <div className="card-info">
        <span className="item-name">{name}</span>
        <span className="item-desc">
          {item.type === 'track' && (
            <div className="track-meta">
              {(item as Track).playability === 'preview' && <span className="preview-tag">Preview</span>}
              <span>{(item as Track).artist}</span>
            </div>
          )}
          {item.type === 'album' && (item as any).artist}
          {item.type === 'artist' && 'Artist'}
          {item.type === 'playlist' && (item as any).description}
        </span>
      </div>
    </div>
  );
};

export default MediaCard;
