import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setProgress, setIsPlaying, nextTrack, setDuration } from '../store/slices/playerSlice';
import { musicService } from '../providers';

const AudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useDispatch();
  const { currentTrackId, isPlaying, volume, repeatMode, progress } = useSelector((state: RootState) => state.player);
  const tracksById = useSelector((state: RootState) => state.music.tracksById);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    const track = currentTrackId ? tracksById[currentTrackId] : null;
    if (track) {
      musicService.getStreamUrl(track).then(url => {
        setStreamUrl(url);
      });
    } else {
      setStreamUrl(null);
    }
  }, [currentTrackId, tracksById]);

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
  }, [isPlaying, streamUrl, dispatch]);

  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - progress) > 2) {
      audioRef.current.currentTime = progress;
    }
  }, [progress]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setProgress(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      dispatch(setDuration(audioRef.current.duration));
    }
  };

  const handleError = (e: any) => {
     console.error("Audio error", e);
     // Auto skip if error after a delay to avoid infinite loops if all tracks fail
     setTimeout(() => dispatch(nextTrack()), 1000);
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

  return (
    <audio
      ref={audioRef}
      src={streamUrl || undefined}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onLoadedMetadata={handleLoadedMetadata}
      onError={handleError}
    />
  );
};

export default AudioEngine;
