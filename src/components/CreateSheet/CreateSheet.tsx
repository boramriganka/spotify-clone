import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, Download } from 'lucide-react';
import BottomSheet from '../BottomSheet/BottomSheet';
import { saveUserPlaylist } from '../../providers/localProvider';
import './CreateSheet.scss';

interface CreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateSheet: React.FC<CreateSheetProps> = ({ isOpen, onClose }) => {
  const [isNaming, setIsNaming] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (playlistName.trim()) {
      const playlist = saveUserPlaylist(playlistName);
      setPlaylistName('');
      setIsNaming(false);
      onClose();
      navigate(`/playlist/${playlist.id}`);
    }
  };

  const handleCancel = () => {
    setIsNaming(false);
    setPlaylistName('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleCancel} title={isNaming ? "Give your playlist a name" : "Create"}>
      <div className="create-sheet-content">
        {!isNaming ? (
          <div className="options">
            <div className="option-item" onClick={() => setIsNaming(true)}>
              <div className="icon-wrapper"><PlusCircle size={24} /></div>
              <div className="text">
                <span className="title">Playlist</span>
                <span className="desc">Build a playlist with songs</span>
              </div>
            </div>
            <div className="option-item disabled">
              <div className="icon-wrapper"><Users size={24} /></div>
              <div className="text">
                <span className="title">Blend</span>
                <span className="desc">Combine tastes with friends</span>
              </div>
            </div>
            <div className="option-item disabled">
              <div className="icon-wrapper"><Download size={24} /></div>
              <div className="text">
                <span className="title">Import</span>
                <span className="desc">Add from liked songs</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="naming-flow">
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="My Playlist #1"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="actions">
              <button className="cancel-btn" onClick={() => setIsNaming(false)}>Cancel</button>
              <button className="create-btn" onClick={handleCreate} disabled={!playlistName.trim()}>Create</button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default CreateSheet;
