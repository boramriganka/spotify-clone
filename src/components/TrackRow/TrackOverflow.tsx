import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListMusic, PlayCircle, Share2, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addTrackToPlaylist, getUserPlaylists } from '../../providers/localProvider';
import BottomSheet from '../BottomSheet/BottomSheet';
import './TrackOverflow.scss';

interface TrackOverflowProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  trackName: string;
  artistName: string;
}

const TrackOverflow: React.FC<TrackOverflowProps> = ({ isOpen, onClose, trackId, trackName, artistName }) => {
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const playlists = getUserPlaylists();
  const dispatch = useDispatch();

  const handleAddToQueue = () => {
    dispatch({ type: 'player/addToQueue', payload: trackId });
    onClose();
  };

  const handlePlayNext = () => {
    dispatch({ type: 'player/playNext', payload: trackId });
    onClose();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addTrackToPlaylist(playlistId, trackId);
    setShowPlaylistPicker(false);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => { setShowPlaylistPicker(false); onClose(); }}
      title={showPlaylistPicker ? "Add to playlist" : trackName}
      subtitle={showPlaylistPicker ? "" : artistName}
    >
      <div className="track-overflow-content">
        {!showPlaylistPicker ? (
          <div className="overflow-options">
            <button className="option" onClick={handleAddToQueue}>
              <ListMusic size={20} />
              <span>Add to queue</span>
            </button>
            <button className="option" onClick={handlePlayNext}>
              <PlayCircle size={20} />
              <span>Play next</span>
            </button>
            <button className="option" onClick={() => setShowPlaylistPicker(true)}>
              <Plus size={20} />
              <span>Add to playlist</span>
            </button>
            <button className="option">
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>
        ) : (
          <div className="playlist-picker">
            <button className="create-new" onClick={() => { (window as any).toggleCreate?.(); onClose(); }}>
              <Plus size={20} />
              <span>New playlist</span>
            </button>
            <div className="playlist-list scroll-container">
              {playlists.map(p => (
                <button key={p.id} className="playlist-item" onClick={() => handleAddToPlaylist(p.id)}>
                   <img src={p.artworkUrl || 'https://picsum.photos/seed/playlist/300/300'} alt="" />
                   <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default TrackOverflow;
