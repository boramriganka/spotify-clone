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

  // Track active request to prevent race conditions
  const activeTrackIdRef = useRef<string | null>(null);

  // Handle track changes and stream URL fetching
  useEffect(() => {
    if (!currentTrack) {
      setStreamUrl(null);
      activeTrackIdRef.current = null;
      return;
    }

    const trackId = currentTrack.id;
    activeTrackIdRef.current = trackId;

    // Reset states for new track
    setStreamUrl(null);
    dispatch(setStatus('loading'));

    let isCancelled = false;

    musicService.getStreamUrl(currentTrack as any)
      .then(url => {
        if (isCancelled || activeTrackIdRef.current !== trackId) return;

        if (url) {
          setStreamUrl(url);
          // status will be updated to 'playing' by onPlaying or manual play call
        } else {
          setStreamUrl(null);
          dispatch(setError('Track unavailable'));
          dispatch(setStatus('unavailable'));
        }
      })
      .catch(err => {
        if (isCancelled || activeTrackIdRef.current !== trackId) return;
        console.error("Failed to fetch stream URL", err);
        setStreamUrl(null);
        dispatch(setError('Failed to load track'));
        dispatch(setStatus('error'));
      });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.id, dispatch]); // Only trigger on ID change

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
    if (activeTrackIdRef.current) {
       dispatch(setError('Audio playback error'));
       dispatch(setStatus('error'));
       // Small delay before skipping to avoid rapid failure loops
       setTimeout(() => next(), 2000);
    }
  };

  const handleWaiting = () => dispatch(setStatus('buffering'));
  const handlePlaying = () => {
    if (status !== 'playing') {
      dispatch(setStatus('playing'));
    }
  };

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
