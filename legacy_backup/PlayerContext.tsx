import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Track } from './api';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  shuffledQueue: Track[];
  repeatMode: 'off' | 'one' | 'all';
}

interface PlayerContextType {
  playerState: PlayerState;
  playTrack: (track: Track, queue?: Track[], startIndex?: number) => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 30, // iTunes previews are typically 30 seconds
    volume: 50,
    isShuffled: false,
    shuffledQueue: [],
    repeatMode: 'off',
  });

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playTrack = (track: Track, queue?: Track[], startIndex?: number) => {
    const trackQueue = queue || [track];
    const index = startIndex !== undefined ? startIndex : (queue ? queue.findIndex(t => t.id === track.id) : 0);
    
    setPlayerState(prev => {
      const shuffled = prev.isShuffled ? shuffleArray(trackQueue) : trackQueue;
      let actualIndex = prev.isShuffled 
        ? shuffled.findIndex(t => t.id === track.id)
        : index;
      
      // Ensure index is valid
      if (actualIndex < 0) {
        actualIndex = 0;
      }
      
      return {
        ...prev,
        currentTrack: track,
        queue: trackQueue,
        currentIndex: actualIndex,
        shuffledQueue: shuffled,
        isPlaying: true,
        duration: 30, // iTunes previews are 30 seconds
        currentTime: 0,
      };
    });
  };

  const togglePlayPause = () => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const setCurrentTime = (time: number) => {
    setPlayerState(prev => ({
      ...prev,
      currentTime: time,
    }));
  };

  const setVolume = (volume: number) => {
    setPlayerState(prev => ({
      ...prev,
      volume,
    }));
  };

  const toggleShuffle = () => {
    setPlayerState(prev => {
      const newShuffled = !prev.isShuffled;
      let newIndex = prev.currentIndex;
      let shuffledQueue = prev.shuffledQueue;

      if (newShuffled && prev.queue.length > 0) {
        // Create shuffled queue
        shuffledQueue = shuffleArray(prev.queue);
        // Find current track in shuffled queue
        const currentTrackId = prev.currentTrack?.id;
        if (currentTrackId) {
          newIndex = shuffledQueue.findIndex(t => t.id === currentTrackId);
          if (newIndex === -1) newIndex = 0;
        }
      } else if (!newShuffled && prev.currentTrack) {
        // Find current track in original queue
        const currentTrackId = prev.currentTrack.id;
        newIndex = prev.queue.findIndex(t => t.id === currentTrackId);
        if (newIndex === -1) newIndex = 0;
      }

      return {
        ...prev,
        isShuffled: newShuffled,
        currentIndex: newIndex,
        shuffledQueue: newShuffled ? shuffledQueue : [],
      };
    });
  };

  const toggleRepeat = () => {
    setPlayerState(prev => {
      const modes: ('off' | 'one' | 'all')[] = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(prev.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return {
        ...prev,
        repeatMode: modes[nextIndex],
      };
    });
  };

  const nextTrack = () => {
    setPlayerState(prev => {
      if (!prev.currentTrack || prev.queue.length === 0) return prev;

      const activeQueue = prev.isShuffled ? prev.shuffledQueue : prev.queue;
      let nextIndex = prev.currentIndex + 1;

      if (prev.repeatMode === 'one') {
        // Repeat current track
        return {
          ...prev,
          currentTime: 0,
          isPlaying: true,
        };
      }

      if (nextIndex >= activeQueue.length) {
        // End of queue
        if (prev.repeatMode === 'all') {
          nextIndex = 0; // Loop back to start
        } else {
          // Stop playing
          return {
            ...prev,
            isPlaying: false,
            currentTime: 0,
          };
        }
      }

      const nextTrackItem = activeQueue[nextIndex];
      if (!nextTrackItem?.previewUrl) {
        // Skip tracks without preview - try next one
        if (nextIndex + 1 < activeQueue.length) {
          const skipNext = activeQueue[nextIndex + 1];
          if (skipNext?.previewUrl) {
            return {
              ...prev,
              currentTrack: skipNext,
              currentIndex: nextIndex + 1,
              currentTime: 0,
              isPlaying: true,
            };
          }
        }
        // No more playable tracks
        return {
          ...prev,
          isPlaying: false,
          currentTime: 0,
        };
      }

      return {
        ...prev,
        currentTrack: nextTrackItem,
        currentIndex: nextIndex,
        currentTime: 0,
        isPlaying: true,
      };
    });
  };

  const previousTrack = () => {
    setPlayerState(prev => {
      if (!prev.currentTrack || prev.queue.length === 0) return prev;

      const activeQueue = prev.isShuffled ? prev.shuffledQueue : prev.queue;
      let prevIndex = prev.currentIndex - 1;

      if (prev.repeatMode === 'one') {
        // Repeat current track
        return {
          ...prev,
          currentTime: 0,
          isPlaying: true,
        };
      }

      if (prevIndex < 0) {
        // Beginning of queue
        if (prev.repeatMode === 'all') {
          prevIndex = activeQueue.length - 1; // Loop to end
        } else {
          // Go to start of current track
          return {
            ...prev,
            currentTime: 0,
          };
        }
      }

      const previousTrackItem = activeQueue[prevIndex];
      if (!previousTrackItem?.previewUrl) {
        // Skip tracks without preview - try previous one
        if (prevIndex - 1 >= 0) {
          const skipPrev = activeQueue[prevIndex - 1];
          if (skipPrev?.previewUrl) {
            return {
              ...prev,
              currentTrack: skipPrev,
              currentIndex: prevIndex - 1,
              currentTime: 0,
              isPlaying: true,
            };
          }
        }
        // No playable tracks before
        return {
          ...prev,
          currentTime: 0,
        };
      }

      return {
        ...prev,
        currentTrack: previousTrackItem,
        currentIndex: prevIndex,
        currentTime: 0,
        isPlaying: true,
      };
    });
  };

  return (
    <PlayerContext.Provider
      value={{
        playerState,
        playTrack,
        togglePlayPause,
        setCurrentTime,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        nextTrack,
        previousTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
