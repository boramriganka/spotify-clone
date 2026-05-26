import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setProgress, setIsPlaying, nextTrack, setProviderStatus, setDuration } from '../store/slices/playerSlice';
import { musicService } from '../providers';

const AudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useDispatch();
  const { currentTrackId, tracksById, isPlaying, volume, progress, repeatMode } = useSelector((state: RootState) => state.player);
  const currentTrack = currentTrackId ? tracksById[currentTrackId] : null;
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentTrack) {
      musicService.getStreamUrl(currentTrack).then(url => {
        setStreamUrl(url);
      });
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && streamUrl) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
             console.error("Playback failed", e);
             dispatch(setIsPlaying(false));
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, streamUrl]);

  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - progress) > 2) {
      audioRef.current.currentTime = progress;
    }
  }, [progress]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setProgress(audioRef.current.currentTime));
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          dispatch(setDuration(audioRef.current.duration));
      }
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      dispatch(nextTrack());
    }
  };

  const handleError = () => {
    console.error("Audio playback error");
    if (currentTrack) {
        dispatch(setProviderStatus({
            [currentTrack.provider]: 'failing',
            lastError: `Playback failed for ${currentTrack.name} from ${currentTrack.provider}`
        }));
    }
    // Simple fallback: try next track if current one fails
    dispatch(nextTrack());
  };

  return (
    <audio
      ref={audioRef}
      src={streamUrl || undefined}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onError={handleError}
    />
  );
};

export default AudioEngine;
