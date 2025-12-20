import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { FaPlay, FaHeart, FaList, FaTrash } from 'react-icons/fa';
import { removeFavourite, deletePlaylist, removeFromPlaylist } from './modules/reducer';
import { usePlayer } from './PlayerContext';
import PlaylistModal from './PlaylistModal';
import './Favourites.css';

interface FavouritesProps {
  playlists: any[];
  removeFavourite: (item: any) => void;
  deletePlaylist: (playlistId: string) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
}

const Favourites: React.FC<FavouritesProps> = ({ playlists, removeFavourite, deletePlaylist, removeFromPlaylist }) => {
  const [favourites, setFavourites] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'favourites' | 'playlists'>('favourites');
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const stored = localStorage.getItem('Favourite');
    if (stored) {
      setFavourites(JSON.parse(stored));
    }
  }, []);

  const filteredFavourites = favourites.filter(item =>
    item.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.trackName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.collectionName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemove = (item: any) => {
    removeFavourite(item);
    setFavourites(prev => prev.filter(fav => fav.trackId !== item.trackId));
  };

  const handlePlay = (item: any) => {
    if (item.previewUrl) {
      // Create queue from all favourites with preview URLs
      const playableTracks = favourites
        .filter((fav: any) => fav.previewUrl)
        .map((fav: any) => ({
          id: fav.trackId?.toString() || '',
          name: fav.trackName || fav.collectionName || 'Unknown',
          artist: fav.artistName || 'Unknown Artist',
          album: fav.collectionName || '',
          duration: 30, // iTunes previews are 30 seconds
          image: fav.artworkUrl100 || fav.artworkUrl60 || '',
          previewUrl: fav.previewUrl || '',
        }));
      
      const currentTrack = {
        id: item.trackId?.toString() || '',
        name: item.trackName || item.collectionName || 'Unknown',
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName || '',
        duration: 30,
        image: item.artworkUrl100 || item.artworkUrl60 || '',
        previewUrl: item.previewUrl || '',
      };
      
      const trackIndex = playableTracks.findIndex(t => t.id === currentTrack.id);
      playTrack(currentTrack, playableTracks, trackIndex >= 0 ? trackIndex : 0);
    }
  };

  return (
    <div className="favourites-container" style={{
      flex: 1,
      height: '100vh',
      backgroundColor: '#121212',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div className="favourites-header" style={{
        padding: '24px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#121212',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: 0,
          }}>
            Your Library
          </h1>
          <div style={{
            display: 'flex',
            gap: '8px',
          }}>
            <button
              onClick={() => setViewMode('favourites')}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: '1px solid #333',
                backgroundColor: viewMode === 'favourites' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'favourites' ? '#000000' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Favourites
            </button>
            <button
              onClick={() => setViewMode('playlists')}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: '1px solid #333',
                backgroundColor: viewMode === 'playlists' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'playlists' ? '#000000' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Playlists
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{
          position: 'relative',
          marginBottom: '24px',
        }}>
          <HiMagnifyingGlass 
            size={24} 
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#B3B3B3',
            }}
          />
          <input
            type="text"
            className="favourites-search-input"
            placeholder="Search your favourites"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              backgroundColor: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#000000',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 32px 32px',
      }}>
        {viewMode === 'favourites' ? (
          filteredFavourites.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#B3B3B3',
            textAlign: 'center',
          }}>
            <FaHeart size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
              {searchTerm ? 'No favourites found' : 'No favourites yet'}
            </h2>
            <p style={{ fontSize: '16px' }}>
              {searchTerm 
                ? 'Try a different search term' 
                : 'Start adding songs to your favourites from the search page'}
            </p>
          </div>
        ) : (
          <div className="favourites-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '24px',
          }}>
            {filteredFavourites.map((item, index) => (
              <div
                key={index}
                className="favourites-card"
                style={{
                  padding: '16px',
                  backgroundColor: '#1A1A1A',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2A2A2A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A1A1A';
                }}
              >
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <img
                    src={item.artworkUrl100 || item.artworkUrl60 || ''}
                    alt={item.trackName || item.collectionName}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '4px',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(item);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#1ED760',
                      border: 'none',
                      color: '#000000',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s, transform 0.2s',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <FaPlay size={16} />
                  </button>
                </div>
                <div style={{
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {item.trackName || item.collectionName || 'Unknown'}
                </div>
                <div style={{
                  color: '#B3B3B3',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '8px',
                }}>
                  {item.artistName || 'Unknown Artist'}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#1ED760',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#1ED760';
                  }}
                >
                  <FaHeart size={16} />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
          )
        ) : (
          playlists.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#B3B3B3',
              textAlign: 'center',
            }}>
              <FaList size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
                No playlists yet
              </h2>
              <p style={{ fontSize: '16px' }}>
                Create playlists from the search page
              </p>
            </div>
          ) : (
            <div className="favourites-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '24px',
            }}>
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="favourites-card"
                  style={{
                    padding: '16px',
                    backgroundColor: '#1A1A1A',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2A2A2A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A1A1A';
                  }}
                >
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '4px',
                      backgroundColor: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      color: '#1ED760',
                    }}>
                      <FaList />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(playlist.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        border: 'none',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0';
                      }}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                  <div style={{
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {playlist.name}
                  </div>
                  <div style={{
                    color: '#B3B3B3',
                    fontSize: '14px',
                  }}>
                    {playlist.songs?.length || 0} songs
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <PlaylistModal
        isOpen={playlistModalOpen}
        onClose={() => {
          setPlaylistModalOpen(false);
          setSelectedSong(null);
        }}
        song={selectedSong}
      />
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  playlists: state.search.playlists || [],
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
  removeFavourite,
  deletePlaylist,
  removeFromPlaylist,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Favourites);

