import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  setStatus,
  setPosition,
  setDuration,
  setError
} from '../core/player/playbackSlice';
import { useQueue } from '../core/queue/useQueue';
import { musicService } from '../providers';

const AudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useDispatch();
  const { currentTrack, status, volume, positionMs, durationMs } = useSelector((state: RootState) => state.playback);
  const { repeatMode, next } = useQueue();
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  // Handle track changes and stream URL fetching
  useEffect(() => {
    if (currentTrack) {
      setStreamUrl(null); // Clear previous URL while loading
      musicService.getStreamUrl(currentTrack as any).then(url => {
        if (url) {
          setStreamUrl(url);
        } else {
          dispatch(setError('Track unavailable'));
        }
      });
    } else {
      setStreamUrl(null);
    }
  }, [currentTrack, dispatch]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle play/pause status
  useEffect(() => {
    if (!audioRef.current || !streamUrl) return;

    if (status === 'playing') {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name === 'NotAllowedError') {
            dispatch(setStatus('blocked'));
          } else {
            console.error("Playback failed", e);
            dispatch(setStatus('error'));
          }
        });
      }
    } else if (status === 'paused') {
      audioRef.current.pause();
    }
  }, [status, streamUrl, dispatch]);

  // Handle seek requests from UI
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime * 1000 - positionMs) > 2000) {
      audioRef.current.currentTime = positionMs / 1000;
    }
  }, [positionMs]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      // We only update position if it's playing to avoid loops during seeks
      if (status === 'playing') {
        dispatch(setPosition(audioRef.current.currentTime * 1000));
      }
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        const durMs = audioRef.current.duration * 1000;
        if (durMs !== durationMs) {
          dispatch(setDuration(durMs));
        }
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
      next();
    }
  };

  const handleError = () => {
    dispatch(setError('Audio playback error'));
    next(); // Simple fallback: try next track
  };

  const handleWaiting = () => dispatch(setStatus('buffering'));
  const handlePlaying = () => dispatch(setStatus('playing'));

  return (
    <audio
      ref={audioRef}
      src={streamUrl || undefined}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onError={handleError}
      onWaiting={handleWaiting}
      onPlaying={handlePlaying}
    />
  );
};

export default AudioEngine;
