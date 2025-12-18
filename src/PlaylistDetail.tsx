import React from 'react';
import { HiChevronLeft } from 'react-icons/hi2';
import { FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Playlist, Track } from './api';
import { usePlayer } from './PlayerContext';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addToFavourite, removeFavourite } from './modules/reducer';

interface PlaylistDetailProps {
  playlist: Playlist | null;
  onBack: () => void;
  favourites: any[];
  addToFavourite: (item: any) => void;
  removeFavourite: (item: any) => void;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
  playlist,
  onBack,
  favourites,
  addToFavourite,
  removeFavourite,
}) => {
  const { playerState, playTrack } = usePlayer();

  if (!playlist) return null;

  const isFavourite = (track: Track) => {
    return favourites.some(fav => fav.trackId === track.id || fav.id === track.id);
  };

  const toggleFavourite = (track: Track) => {
    const trackData = {
      trackId: track.id,
      trackName: track.name,
      artistName: track.artist,
      collectionName: track.album,
      artworkUrl100: track.image,
      previewUrl: track.previewUrl,
    };

    if (isFavourite(track)) {
      removeFavourite(trackData);
    } else {
      addToFavourite(trackData);
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (track.previewUrl) {
      // Filter tracks that have preview URLs
      const playableTracks = playlist.tracks.filter(t => t.previewUrl);
      const trackIndex = playableTracks.findIndex(t => t.id === track.id);
      playTrack(track, playableTracks, trackIndex);
    }
  };

  const isCurrentTrack = (track: Track) => {
    return playerState.currentTrack?.id === track.id;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      {/* Header with back button */}
      <div style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <button
          onClick={onBack}
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
      </div>

      {/* Playlist Header */}
      <div style={{
        padding: '0 32px 24px',
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-end',
      }}>
        <div style={{
          width: '232px',
          height: '232px',
          borderRadius: '4px',
          backgroundColor: '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 60px rgba(0, 0, 0, 0.5)',
        }}>
          <img
            src={playlist.image}
            alt={playlist.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            Playlist
          </div>
          <h1 style={{
            fontSize: '72px',
            fontWeight: '900',
            color: '#FFFFFF',
            margin: '0 0 16px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {playlist.name}
          </h1>
          <div style={{
            color: '#B3B3B3',
            fontSize: '14px',
            marginBottom: '24px',
          }}>
            {playlist.description}
          </div>
          <div style={{
            color: '#FFFFFF',
            fontSize: '14px',
            marginBottom: '32px',
          }}>
            {playlist.tracks.length} songs
          </div>
          <button
            onClick={() => {
              // Find first track with preview URL
              const firstPlayableTrack = playlist.tracks.find(t => t.previewUrl);
              if (firstPlayableTrack) {
                const playableTracks = playlist.tracks.filter(t => t.previewUrl);
                playTrack(firstPlayableTrack, playableTracks, 0);
              }
            }}
            style={{
              padding: '14px 32px',
              borderRadius: '23px',
              backgroundColor: '#1ED760',
              border: 'none',
              color: '#000000',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FaPlay size={16} />
            <span>Play</span>
          </button>
        </div>
      </div>

      {/* Songs List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 32px 32px',
      }}>
        <div style={{
          borderBottom: '1px solid #333',
          paddingBottom: '8px',
          marginBottom: '8px',
          display: 'grid',
          gridTemplateColumns: '16px 1fr 1fr 1fr 60px 40px',
          gap: '16px',
          alignItems: 'center',
          color: '#B3B3B3',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: '0 16px 8px',
        }}>
          <div>#</div>
          <div>TITLE</div>
          <div>ALBUM</div>
          <div>DATE ADDED</div>
          <div style={{ textAlign: 'right' }}>DURATION</div>
          <div></div>
        </div>
        {playlist.tracks.map((track, index) => (
          <div
            key={track.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '16px 1fr 1fr 1fr 60px 40px',
              gap: '16px',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1A1A1A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => track.previewUrl && handlePlayTrack(track)}
          >
            <div style={{
              color: '#B3B3B3',
              fontSize: '16px',
              textAlign: 'center',
            }}>
              {index + 1}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <img
                src={track.image}
                alt={track.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  color: isCurrentTrack(track) ? '#1ED760' : '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: isCurrentTrack(track) ? '500' : '400',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '4px',
                }}>
                  {track.name}
                </div>
                <div style={{
                  color: '#B3B3B3',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {track.artist}
                </div>
              </div>
            </div>
            <div style={{
              color: '#B3B3B3',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {track.album}
            </div>
            <div style={{
              color: '#B3B3B3',
              fontSize: '14px',
            }}>
              Today
            </div>
            <div style={{
              color: '#B3B3B3',
              fontSize: '14px',
              textAlign: 'right',
            }}>
              {formatDuration(track.duration)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(track);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: isFavourite(track) ? '#1ED760' : '#B3B3B3',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1ED760';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isFavourite(track) ? '#1ED760' : '#B3B3B3';
                }}
              >
                {isFavourite(track) ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  favourites: state.search.favourite || [],
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
  addToFavourite,
  removeFavourite,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistDetail);

