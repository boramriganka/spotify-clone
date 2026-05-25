import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setProgress, setIsPlaying, nextTrack } from '../store/slices/playerSlice';
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
          // Sync duration if it changed (e.g. metadata loaded)
          // Actually duration is usually in track object, but fallback just in case
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
    // Simple fallback: try next track if current one fails
    // In a real app we'd try different providers for the same track first
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
