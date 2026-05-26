import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MediaItem } from '../../providers/types';
import './MediaCard.scss';

interface MediaCardProps {
  item: MediaItem;
  onClick?: () => void;
  variant?: 'square' | 'circle' | 'tile';
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, variant = 'square' }) => {
  const navigate = useNavigate();
  const isCircle = variant === 'circle' || item.type === 'artist';
  const isTile = variant === 'tile';

  const renderPlayabilityBadge = () => {
    if (item.type !== 'track') return null;
    const track = item as any;
    if (track.playability === 'full') return <span className="badge badge-full">Full Song</span>;
    if (track.playability === 'preview') return <span className="badge badge-preview">Preview</span>;
    return <span className="badge badge-unavailable">Unavailable</span>;
  };

  const handleFindFull = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app this would trigger a search for full alternatives
    navigate(`/search?q=${encodeURIComponent(item.name + ' ' + (item as any).artist)}&full=true`);
  };

  if (isTile) {
    return (
      <div className="media-tile" onClick={onClick}>
        <img src={item.image} alt={item.name} />
        <span className="tile-title">{item.name}</span>
        {item.type === 'track' && (item as any).playability === 'full' && (
           <span className="badge">FULL</span>
        )}
      </div>
    );
  }

  return (
    <div className={`media-card ${isCircle ? 'circle' : ''}`} onClick={onClick}>
      <div className="image-container">
        <img src={item.image} alt={item.name} />
        {renderPlayabilityBadge()}
        {!isCircle && (
          <button className="play-button">
            <Play fill="black" size={20} />
          </button>
        )}
      </div>
      <div className="card-info">
        <span className="item-name">{item.name}</span>
        <span className="item-desc">
          {item.type === 'track' && item.artist}
          {item.type === 'album' && item.artist}
          {item.type === 'artist' && 'Artist'}
          {item.type === 'playlist' && (item as any).description}
        </span>
        {item.type === 'track' && (item as any).playability === 'preview' && (
          <button className="find-full-cta" onClick={handleFindFull}>Find full version</button>
        )}
      </div>
    </div>
  );
};

export default MediaCard;
