import React, { useState, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { HiInformationCircle, HiX } from 'react-icons/hi';
import { FaPlay, FaSearch, FaHeart, FaList, FaMusic } from 'react-icons/fa';
import { getQuickLinks, getMadeForYou, Playlist } from './api';
import { usePlayer } from './PlayerContext';
import SkeletonLoader from './SkeletonLoader';
import PlaylistDetail from './PlaylistDetail';
import './Home.css';

interface HomeProps {
  selectedPlaylist?: Playlist | null;
  onPlaylistBack?: () => void;
}

const Home: React.FC<HomeProps> = ({ selectedPlaylist: propSelectedPlaylist, onPlaylistBack }) => {
  const [quickLinks, setQuickLinks] = useState<Playlist[]>([]);
  const [madeForYou, setMadeForYou] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(propSelectedPlaylist || null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  usePlayer();

  // Update selectedPlaylist when prop changes
  React.useEffect(() => {
    setSelectedPlaylist(propSelectedPlaylist || null);
  }, [propSelectedPlaylist]);

  const loadPlaylists = React.useCallback(async () => {
    setLoading(true);
    try {
      const [quick, made] = await Promise.all([
        getQuickLinks(),
        getMadeForYou(),
      ]);
      setQuickLinks(quick);
      setMadeForYou(made);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // Listen for changes to favorites
  useEffect(() => {
    const handleFavoritesChange = () => {
      loadPlaylists();
    };
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'Favourite') {
        loadPlaylists();
      }
    });

    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChange);
    };
  }, [loadPlaylists]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        onBack={() => {
          setSelectedPlaylist(null);
          if (onPlaylistBack) {
            onPlaylistBack();
          }
        }}
      />
    );
  }

  return (
    <div className="home-container" style={{
      flex: 1,
      height: '100vh',
      backgroundColor: '#121212',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Gradient Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '332px',
        background: 'linear-gradient(to bottom, #064e3b 0%, #121212 100%)',
        zIndex: 0,
      }} />

      {/* Top Bar - Sticky */}
      <div className="home-top-bar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(18, 18, 18, 0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="home-nav-buttons" style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.7,
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            <HiChevronLeft size={20} />
          </button>
          <button
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.7,
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            <HiChevronRight size={20} />
          </button>
        </div>
        
        <button
          onClick={() => setShowWelcomeModal(true)}
          style={{
            padding: '8px 24px',
            borderRadius: '23px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <HiInformationCircle size={18} />
          <span>What's This?</span>
        </button>
      </div>

      {/* Content - Scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Greeting */}
        <h1 className="home-greeting" style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#FFFFFF',
          marginBottom: '24px',
        }}>
          {getGreeting()}
        </h1>

        {loading ? (
          <>
            {/* Quick Links Skeleton */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '48px',
            }}>
              <SkeletonLoader count={6} type="list" />
            </div>
            {/* Made For You Skeleton */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                height: '24px',
                width: '200px',
                borderRadius: '4px',
                backgroundColor: '#1A1A1A',
                marginBottom: '16px',
                background: 'linear-gradient(90deg, #1A1A1A 25%, #2A2A2A 50%, #1A1A1A 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }} />
              <div style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '8px',
              }}>
                <SkeletonLoader count={8} type="card" />
              </div>
            </div>
            <style>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>
          </>
        ) : (
          <>
            {/* Quick Links Grid */}
            <div className="home-quick-links" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '48px',
            }}>
              {quickLinks.map((playlist) => (
            <div
              key={playlist.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                backgroundColor: '#1A1A1A',
                borderRadius: '4px',
                padding: '12px',
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
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <img
                src={playlist.image}
                alt={playlist.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}>
                  {playlist.name}
                </div>
                <div style={{
                  color: '#B3B3B3',
                  fontSize: '14px',
                }}>
                  {playlist.description}
                </div>
              </div>
              <button
                style={{
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
                  transition: 'opacity 0.2s',
                  position: 'absolute',
                  right: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlaylist(playlist);
                }}
              >
                <FaPlay size={24} color="#000000" />
              </button>
            </div>
          ))}
        </div>

        {/* Made For You Section */}
        <div className="home-made-for-you" style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '16px',
          }}>
            Made For You
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '8px',
          }}>
            {madeForYou.map((playlist) => (
              <div
                key={playlist.id}
                className="home-card"
                style={{
                  minWidth: '180px',
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
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <img
                    src={playlist.image}
                    alt={playlist.name}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '4px',
                      objectFit: 'cover',
                    }}
                  />
                  <button
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlaylist(playlist);
                    }}
                  >
                    <FaPlay size={24} color="#000000" />
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
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {playlist.description}
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}
      </div>

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
          onClick={() => setShowWelcomeModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1A1A1A',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              border: '1px solid #333',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
              <div>
                <h2 style={{
                  color: '#FFFFFF',
                  fontSize: '28px',
                  fontWeight: '700',
                  marginBottom: '8px',
                }}>
                  Welcome to Music Discovery
                </h2>
                <p style={{
                  color: '#B3B3B3',
                  fontSize: '16px',
                }}>
                  Your personal music streaming experience
                </p>
              </div>
              <button
                onClick={() => setShowWelcomeModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#B3B3B3',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2A2A2A';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#B3B3B3';
                }}
              >
                <HiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}>
              {/* What is this section */}
              <div>
                <h3 style={{
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                }}>
                  What is this?
                </h3>
                <p style={{
                  color: '#B3B3B3',
                  fontSize: '15px',
                  lineHeight: '1.6',
                }}>
                  A full-featured music discovery platform powered by the iTunes API. 
                  Explore millions of tracks, albums, and artists with real-time search 
                  and create your personalized music library.
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 style={{
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                }}>
                  What you can do:
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}>
                  {/* Feature 1: Search */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#252525',
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: '#1ED760',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <FaSearch size={20} color="#000000" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '4px',
                      }}>
                        Search & Discover
                      </h4>
                      <p style={{
                        color: '#B3B3B3',
                        fontSize: '14px',
                        lineHeight: '1.5',
                      }}>
                        Search for artists, albums, songs, and more across 7 content categories. 
                        Real-time results powered by iTunes API with category filters.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2: Playlists */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#252525',
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: '#1ED760',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <FaMusic size={20} color="#000000" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '4px',
                      }}>
                        Curated Playlists
                      </h4>
                      <p style={{
                        color: '#B3B3B3',
                        fontSize: '14px',
                        lineHeight: '1.5',
                      }}>
                        Explore pre-made playlists like "Made For You", "Daily Mix", and "Chill Hits" 
                        filled with real songs from iTunes API, all ready to play.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3: Favorites */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#252525',
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: '#1ED760',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <FaHeart size={20} color="#000000" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '4px',
                      }}>
                        Save Your Favorites
                      </h4>
                      <p style={{
                        color: '#B3B3B3',
                        fontSize: '14px',
                        lineHeight: '1.5',
                      }}>
                        Like songs and save them to your favorites collection. 
                        All your saved music is stored locally and persists across sessions.
                      </p>
                    </div>
                  </div>

                  {/* Feature 4: Custom Playlists */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#252525',
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: '#1ED760',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <FaList size={20} color="#000000" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '4px',
                      }}>
                        Create Custom Playlists
                      </h4>
                      <p style={{
                        color: '#B3B3B3',
                        fontSize: '14px',
                        lineHeight: '1.5',
                      }}>
                        Build your own playlists by adding songs from search results. 
                        Organize your music collection exactly how you want it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Features */}
              <div style={{
                padding: '20px',
                backgroundColor: '#252525',
                borderRadius: '8px',
                border: '1px solid #333',
              }}>
                <h4 style={{
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '12px',
                }}>
                  <span role="img" aria-label="musical note">🎵</span> Full-Featured Player
                </h4>
                <p style={{
                  color: '#B3B3B3',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  marginBottom: '12px',
                }}>
                  Control playback with next/previous tracks, volume adjustment, shuffle mode, 
                  and repeat options. Click any track to start playing instantly!
                </p>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#1A1A1A',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  marginTop: '12px',
                }}>
                  <p style={{
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '6px',
                  }}>
                    <span role="img" aria-label="warning">⚠️</span> Track Duration Note
                  </p>
                  <p style={{
                    color: '#B3B3B3',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}>
                    All tracks are 30-second previews provided by the iTunes API. This is a limitation 
                    of the free API service - full-length tracks are not available. The progress bar 
                    reflects this 30-second duration.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowWelcomeModal(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '23px',
                  backgroundColor: '#1ED760',
                  color: '#000000',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1DB954';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1ED760';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
