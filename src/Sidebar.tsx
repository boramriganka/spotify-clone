import React, { useState, useEffect } from 'react';
import { HiHome } from 'react-icons/hi2';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { HiLibrary } from 'react-icons/hi';
import { HiPlus } from 'react-icons/hi';
import { HiChevronRight } from 'react-icons/hi2';
import { Playlist } from './api';
import CreatePlaylistModal from './CreatePlaylistModal';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  libraryFilter: 'playlists' | 'artists' | 'albums';
  onLibraryFilterChange: (filter: 'playlists' | 'artists' | 'albums') => void;
  playlists?: Playlist[];
  onPlaylistSelect?: (playlist: Playlist) => void;
  userPlaylists?: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  libraryFilter,
  onLibraryFilterChange,
  playlists = [],
  onPlaylistSelect,
  userPlaylists = []
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);

  // Combine pre-made playlists with user playlists
  useEffect(() => {
    const combined: Playlist[] = [...playlists];
    
    // Convert user playlists to Playlist format
    if (userPlaylists && userPlaylists.length > 0) {
      userPlaylists.forEach((userPlaylist) => {
        const convertedPlaylist: Playlist = {
          id: userPlaylist.id,
          name: userPlaylist.name,
          description: `${userPlaylist.songs?.length || 0} songs`,
          image: userPlaylist.songs?.[0]?.artworkUrl100 || userPlaylist.songs?.[0]?.artworkUrl60 || 'https://picsum.photos/seed/playlist/300/300',
          tracks: (userPlaylist.songs || []).map((song: any) => ({
            id: song.trackId?.toString() || '',
            name: song.trackName || song.collectionName || 'Unknown',
            artist: song.artistName || 'Unknown Artist',
            album: song.collectionName || '',
            duration: Math.floor((song.trackTimeMillis || 0) / 1000),
            image: song.artworkUrl100 || song.artworkUrl60 || '',
            previewUrl: song.previewUrl || '',
          })),
        };
        combined.push(convertedPlaylist);
      });
    }
    
    setAllPlaylists(combined);
  }, [playlists, userPlaylists]);

  return (
    <div style={{
      width: '240px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px',
      backgroundColor: '#000000',
    }}>
      {/* Container 1: Home and Search */}
      <div style={{
        backgroundColor: '#121212',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <button
          onClick={() => onViewChange('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px',
            backgroundColor: activeView === 'home' ? '#1A1A1A' : 'transparent',
            border: 'none',
            color: activeView === 'home' ? '#FFFFFF' : '#B3B3B3',
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: activeView === 'home' ? '700' : '400',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (activeView !== 'home') {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = '#1A1A1A';
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'home') {
              e.currentTarget.style.color = '#B3B3B3';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <HiHome size={24} />
          <span>Home</span>
        </button>
        
        <button
          onClick={() => onViewChange('search')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px',
            backgroundColor: activeView === 'search' ? '#1A1A1A' : 'transparent',
            border: 'none',
            color: activeView === 'search' ? '#FFFFFF' : '#B3B3B3',
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: activeView === 'search' ? '700' : '400',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (activeView !== 'search') {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = '#1A1A1A';
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'search') {
              e.currentTarget.style.color = '#B3B3B3';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <HiMagnifyingGlass size={24} />
          <span>Search</span>
        </button>
      </div>

      {/* Container 2: Your Library */}
      <div style={{
        backgroundColor: '#121212',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 4px',
          marginBottom: '8px',
        }}>
          <button
            onClick={() => onViewChange('library')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: activeView === 'library' ? '#1A1A1A' : 'transparent',
              border: 'none',
              color: activeView === 'library' ? '#FFFFFF' : '#B3B3B3',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeView === 'library' ? '700' : '400',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeView !== 'library') {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = '#1A1A1A';
              }
            }}
            onMouseLeave={(e) => {
              if (activeView !== 'library') {
                e.currentTarget.style.color = '#B3B3B3';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <HiLibrary size={24} />
            <span>Your Library</span>
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#B3B3B3',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#B3B3B3';
              }}
            >
              <HiPlus size={20} />
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#B3B3B3',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#B3B3B3';
              }}
            >
              <HiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          padding: '0 4px',
        }}>
          {(['playlists', 'artists', 'albums'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onLibraryFilterChange(filter)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid #333',
                backgroundColor: libraryFilter === filter ? '#FFFFFF' : 'transparent',
                color: libraryFilter === filter ? '#000000' : '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (libraryFilter !== filter) {
                  e.currentTarget.style.borderColor = '#555';
                }
              }}
              onMouseLeave={(e) => {
                if (libraryFilter !== filter) {
                  e.currentTarget.style.borderColor = '#333';
                }
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Library Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative',
          zIndex: 1,
        }}>
          {libraryFilter === 'playlists' && allPlaylists.length > 0 ? (
            allPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                aria-label={`Open ${playlist.name} playlist`}
                onClick={() => {
                  if (onPlaylistSelect) {
                    onPlaylistSelect(playlist);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  position: 'relative',
                  zIndex: 2,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A1A1A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <img
                  src={playlist.image}
                  alt={playlist.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '4px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {playlist.name}
                  </div>
                  <div style={{
                    color: '#B3B3B3',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {playlist.tracks.length} songs
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div style={{
              color: '#B3B3B3',
              fontSize: '14px',
              padding: '16px',
              textAlign: 'center',
            }}>
              {libraryFilter === 'playlists' ? 'No playlists available' : 'Coming soon'}
            </div>
          )}
        </div>
      </div>
      
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Sidebar;
