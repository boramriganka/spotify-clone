import React, { useRef, useEffect } from 'react';
import { HiOutlineHeart } from 'react-icons/hi2';
import { FiShuffle } from 'react-icons/fi';
import { MdSkipPrevious, MdSkipNext, MdRepeat, MdRepeatOne } from 'react-icons/md';
import { FaPlay, FaPause } from 'react-icons/fa';
import { HiMicrophone, HiDesktopComputer, HiVolumeUp } from 'react-icons/hi';
import { MdQueueMusic } from 'react-icons/md';
import { usePlayer } from './PlayerContext';

const BottomPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    playerState,
    togglePlayPause,
    setCurrentTime,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    nextTrack,
    previousTrack,
  } = usePlayer();

  // Handle audio playback and track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playerState.currentTrack?.previewUrl) {
      audio.src = playerState.currentTrack.previewUrl;
      audio.currentTime = 0;
      if (playerState.isPlaying) {
        audio.play().catch(err => console.error('Error playing audio:', err));
      }
    }
  }, [playerState.currentTrack?.id, playerState.currentTrack?.previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playerState.isPlaying) {
      audio.play().catch(err => console.error('Error playing audio:', err));
    } else {
      audio.pause();
    }
  }, [playerState.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = playerState.volume / 100;
  }, [playerState.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      // Auto-play next track when current ends
      nextTrack();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentTime, nextTrack]);

  // Sync audio currentTime when user seeks
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playerState.currentTrack) return;
    
    // Only update if difference is significant (more than 0.5 seconds)
    // to avoid conflicts with timeupdate event
    const timeDiff = Math.abs(audio.currentTime - playerState.currentTime);
    if (timeDiff > 0.5) {
      audio.currentTime = Math.min(playerState.currentTime, 30); // Max 30 seconds for previews
    }
  }, [playerState.currentTime, playerState.currentTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    if (playerState.repeatMode === 'one') {
      return <MdRepeatOne size={16} color="#1ED760" />;
    }
    if (playerState.repeatMode === 'all') {
      return <MdRepeat size={16} color="#1ED760" />;
    }
    return <MdRepeat size={16} />;
  };

  // iTunes previews are 30 seconds, use that as max duration
  const maxDuration = 30;
  const progressPercentage = maxDuration > 0 
    ? Math.min((playerState.currentTime / maxDuration) * 100, 100)
    : 0;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '90px',
      backgroundColor: '#000000',
      borderTop: '1px solid #282828',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      zIndex: 1000,
    }}>
      {/* Left: Now Playing */}
      <div style={{
        flex: '0 0 30%',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        minWidth: 0,
      }}>
        {playerState.currentTrack ? (
          <>
            <img
              src={playerState.currentTrack.image}
              alt={playerState.currentTrack.name}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '4px',
                objectFit: 'cover',
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
                marginBottom: '4px',
              }}>
                {playerState.currentTrack.name}
              </div>
              <div style={{
                color: '#B3B3B3',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {playerState.currentTrack.artist}
              </div>
            </div>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#B3B3B3',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#B3B3B3'}
            >
              <HiOutlineHeart size={16} />
            </button>
          </>
        ) : (
          <div style={{ color: '#B3B3B3', fontSize: '14px' }}>
            No track selected
          </div>
        )}
      </div>

      {/* Center: Controls */}
      <div style={{
        flex: '1 1 40%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* Top Row: Control Buttons */}
        <div className="player-controls-group" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <button
            onClick={toggleShuffle}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: playerState.isShuffled ? '#1ED760' : '#B3B3B3',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!playerState.isShuffled) e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              if (!playerState.isShuffled) e.currentTarget.style.color = '#B3B3B3';
            }}
          >
            <FiShuffle size={16} color={playerState.isShuffled ? '#1ED760' : '#B3B3B3'} />
          </button>

          <button
            onClick={previousTrack}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MdSkipPrevious size={20} color="#FFFFFF" />
          </button>

          <button
            onClick={togglePlayPause}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: 'none',
              color: '#000000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {playerState.isPlaying ? (
              <FaPause size={16} color="#000000" />
            ) : (
              <FaPlay size={16} color="#000000" />
            )}
          </button>

          <button
            onClick={nextTrack}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MdSkipNext size={20} color="#FFFFFF" />
          </button>

          <button
            onClick={toggleRepeat}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: playerState.repeatMode !== 'off' ? '#1ED760' : '#B3B3B3',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (playerState.repeatMode === 'off') e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              if (playerState.repeatMode === 'off') e.currentTarget.style.color = '#B3B3B3';
            }}
          >
            {getRepeatIcon()}
          </button>
        </div>

        {/* Bottom Row: Progress Bar */}
        <div className="player-controls-group" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          maxWidth: '600px',
        }}>
          <span style={{
            color: '#B3B3B3',
            fontSize: '11px',
            minWidth: '40px',
            textAlign: 'right',
          }}>
            {formatTime(playerState.currentTime)}
          </span>
          
          <input
            type="range"
            min="0"
            max={maxDuration}
            value={Math.min(playerState.currentTime, maxDuration)}
            onChange={(e) => {
              const newTime = Number(e.target.value);
              setCurrentTime(newTime);
              if (audioRef.current) {
                audioRef.current.currentTime = newTime;
              }
            }}
            style={{
              flex: 1,
              height: '4px',
              '--progress': `${progressPercentage}%`,
            } as React.CSSProperties}
          />
          
          <span style={{
            color: '#B3B3B3',
            fontSize: '11px',
            minWidth: '40px',
            textAlign: 'left',
          }}>
            {formatTime(maxDuration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Other Controls */}
      <div style={{
        flex: '0 0 30%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px',
      }}>
        <button
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#B3B3B3',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#B3B3B3'}
        >
          <HiMicrophone size={16} />
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
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#B3B3B3'}
        >
          <MdQueueMusic size={16} />
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
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#B3B3B3'}
        >
          <HiDesktopComputer size={16} />
        </button>

        <div className="player-controls-group" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '125px',
        }}>
          <HiVolumeUp size={16} color="#B3B3B3" />
          <input
            type="range"
            min="0"
            max="100"
            value={playerState.volume}
            onChange={(e) => {
              const newVolume = Number(e.target.value);
              setVolume(newVolume);
              if (audioRef.current) {
                audioRef.current.volume = newVolume / 100;
              }
            }}
            style={{
              flex: 1,
              height: '4px',
              '--progress': `${playerState.volume}%`,
            } as React.CSSProperties}
          />
        </div>
      </div>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default BottomPlayer;
