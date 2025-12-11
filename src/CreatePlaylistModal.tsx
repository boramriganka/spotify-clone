import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createPlaylist } from './modules/reducer';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  createPlaylist: (name: string) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  createPlaylist,
}) => {
  const [playlistName, setPlaylistName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (playlistName.trim()) {
      createPlaylist(playlistName.trim());
      setPlaylistName('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#282828',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '400px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h2 style={{
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
          }}>
            Create playlist
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#B3B3B3',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#B3B3B3'}
          >
            <HiX size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
          }}>
            Playlist name
          </label>
          <input
            type="text"
            placeholder="My Playlist"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1A1A1A',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '14px',
              outline: 'none',
            }}
            autoFocus
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!playlistName.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: playlistName.trim() ? '#1ED760' : '#333',
              border: 'none',
              borderRadius: '4px',
              color: playlistName.trim() ? '#000000' : '#666',
              fontSize: '14px',
              fontWeight: '700',
              cursor: playlistName.trim() ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (playlistName.trim()) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (playlistName.trim()) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
  createPlaylist,
}, dispatch);

export default connect(null, mapDispatchToProps)(CreatePlaylistModal);

