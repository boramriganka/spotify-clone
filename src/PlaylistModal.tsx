import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HiX } from 'react-icons/hi';
import { createPlaylist, addToPlaylist } from './modules/reducer';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: any | null;
  playlists: any[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: any) => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  song,
  playlists,
  createPlaylist,
  addToPlaylist,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNewPlaylistName('');
      setShowCreateInput(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateInput(false);
    }
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (song) {
      addToPlaylist(playlistId, song);
      onClose();
    }
  };

  const isSongInPlaylist = (playlistId: string) => {
    if (!song) return false;
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist?.songs.some((s: any) => s.trackId === song.trackId) || false;
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
          maxHeight: '80vh',
          overflow: 'auto',
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
            Add to playlist
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

        {song && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            padding: '12px',
            backgroundColor: '#1A1A1A',
            borderRadius: '4px',
          }}>
            <img
              src={song.artworkUrl100 || song.artworkUrl60 || ''}
              alt={song.trackName || song.collectionName}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '4px',
                objectFit: 'cover',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {song.trackName || song.collectionName || 'Unknown'}
              </div>
              <div style={{
                color: '#B3B3B3',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {song.artistName || 'Unknown Artist'}
              </div>
            </div>
          </div>
        )}

        {/* Create New Playlist */}
        <div style={{ marginBottom: '16px' }}>
          {!showCreateInput ? (
            <button
              onClick={() => setShowCreateInput(true)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#555';
                e.currentTarget.style.backgroundColor = '#1A1A1A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              + Create new playlist
            </button>
          ) : (
            <div style={{
              display: 'flex',
              gap: '8px',
            }}>
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePlaylist();
                  }
                }}
                style={{
                  flex: 1,
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
              <button
                onClick={handleCreatePlaylist}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#1ED760',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Create
              </button>
            </div>
          )}
        </div>

        {/* Existing Playlists */}
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {playlists.length === 0 ? (
            <div style={{
              color: '#B3B3B3',
              fontSize: '14px',
              textAlign: 'center',
              padding: '24px',
            }}>
              No playlists yet. Create one to get started!
            </div>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => !isSongInPlaylist(playlist.id) && handleAddToPlaylist(playlist.id)}
                disabled={isSongInPlaylist(playlist.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isSongInPlaylist(playlist.id) ? '#1A1A1A' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: isSongInPlaylist(playlist.id) ? '#B3B3B3' : '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'left',
                  cursor: isSongInPlaylist(playlist.id) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                  opacity: isSongInPlaylist(playlist.id) ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSongInPlaylist(playlist.id)) {
                    e.currentTarget.style.backgroundColor = '#1A1A1A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSongInPlaylist(playlist.id)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {playlist.name} {isSongInPlaylist(playlist.id) && '✓'}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  playlists: state.search.playlists || [],
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
  createPlaylist,
  addToPlaylist,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistModal);

