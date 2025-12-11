import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { FaPlay, FaHeart, FaRegHeart, FaList } from 'react-icons/fa';
import { search, addToFavourite, removeFavourite } from './modules/reducer';
import { usePlayer } from './PlayerContext';
import PlaylistModal from './PlaylistModal';

import SkeletonLoader from './SkeletonLoader';

interface SearchProps {
  data: any[];
  playlists: any[];
  loading: boolean;
  search: (query: string) => void;
  addToFavourite: (item: any) => void;
  removeFavourite: (item: any) => void;
}

const Search: React.FC<SearchProps> = ({ data, playlists, loading, search, addToFavourite, removeFavourite }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const { playTrack } = usePlayer();

  const categories = ['all', 'movie', 'podcast', 'music', 'musicVideo', 'audiobook', 'shortFilm'];

  useEffect(() => {
    const stored = localStorage.getItem('Favourite');
    if (stored) {
      setFavourites(JSON.parse(stored));
    }
  }, []);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    const category = categories[selectedCategory] === 'all' ? '' : `&media=${categories[selectedCategory]}`;
    search(`?term=${term}${category}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const handleCategoryClick = (index: number) => {
    setSelectedCategory(index);
    if (searchTerm.trim()) {
      const category = categories[index] === 'all' ? '' : `&media=${categories[index]}`;
      search(`?term=${searchTerm}${category}`);
    }
  };

  const isFavourite = (item: any) => {
    return favourites.some(fav => fav.trackId === item.trackId);
  };

  const toggleFavourite = (item: any) => {
    if (isFavourite(item)) {
      removeFavourite(item);
      setFavourites(prev => prev.filter(fav => fav.trackId !== item.trackId));
    } else {
      addToFavourite(item);
      setFavourites(prev => [...prev, item]);
    }
  };

  const handlePlay = (item: any) => {
    if (item.previewUrl) {
      // Create queue from all search results with preview URLs
      const playableTracks = data
        .filter((d: any) => d.previewUrl)
        .map((d: any) => ({
          id: d.trackId?.toString() || '',
          name: d.trackName || d.collectionName || 'Unknown',
          artist: d.artistName || 'Unknown Artist',
          album: d.collectionName || '',
          duration: 30, // iTunes previews are 30 seconds
          image: d.artworkUrl100 || d.artworkUrl60 || '',
          previewUrl: d.previewUrl || '',
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
    <div style={{
      flex: 1,
      height: '100vh',
      backgroundColor: '#121212',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Search Header */}
      <div style={{
        padding: '24px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#121212',
      }}>
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
            placeholder="What do you want to listen to?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
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

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(index)}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: '1px solid #333',
                backgroundColor: selectedCategory === index ? '#FFFFFF' : 'transparent',
                color: selectedCategory === index ? '#000000' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== index) {
                  e.currentTarget.style.borderColor = '#555';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== index) {
                  e.currentTarget.style.borderColor = '#333';
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 32px 32px',
      }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '24px',
          }}>
            <SkeletonLoader count={12} type="card" />
          </div>
        ) : data.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#B3B3B3',
            textAlign: 'center',
          }}>
            <HiMagnifyingGlass size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
              Find your favorite songs
            </h2>
            <p style={{ fontSize: '16px' }}>
              Search for artists, albums, podcasts, and more
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '24px',
          }}>
            {data.map((item, index) => (
              <div
                key={index}
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
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavourite(item);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: isFavourite(item) ? '#1ED760' : '#B3B3B3',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      transition: 'color 0.2s',
                      flex: 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1ED760';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isFavourite(item) ? '#1ED760' : '#B3B3B3';
                    }}
                  >
                    {isFavourite(item) ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                    <span>{isFavourite(item) ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSong(item);
                      setPlaylistModalOpen(true);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#B3B3B3',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1ED760';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#B3B3B3';
                    }}
                    title="Add to playlist"
                  >
                    <FaList size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
  data: state.search.data || [],
  playlists: state.search.playlists || [],
  loading: state.search.loading || false,
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
  search,
  addToFavourite,
  removeFavourite,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Search);

