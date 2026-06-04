import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setTrack,
  setStatus,
  setPosition,
  setVolume,
  setError,
  PlaybackStatus
} from './playbackSlice';
import { NeoTrack, normalizeTrack } from '../../utils/trackNormalizer';
import { musicService } from '../../providers';

export const usePlaybackController = () => {
  const dispatch = useDispatch();
  const { currentTrack, status, positionMs, durationMs, volume, error } = useSelector((state: RootState) => state.playback);

  const playTrack = async (track: any) => {
    const normalized = normalizeTrack(track);
    dispatch(setTrack(normalized));
    dispatch(setStatus('loading'));

    try {
      const streamUrl = await musicService.getStreamUrl(normalized as any);
      if (!streamUrl) {
        dispatch(setError('Track unavailable: No stream URL found'));
        dispatch(setStatus('unavailable'));
        return;
      }
      // AudioEngine will pick up the change in currentTrack and start playing
      dispatch(setStatus('playing'));
    } catch (err) {
      dispatch(setError('Failed to load track'));
      dispatch(setStatus('error'));
    }
  };

  const play = () => {
    if (currentTrack) {
      dispatch(setStatus('playing'));
    }
  };

  const pause = () => {
    dispatch(setStatus('paused'));
  };

  const togglePlay = () => {
    if (status === 'playing') {
      pause();
    } else {
      play();
    }
  };

  const seek = (posMs: number) => {
    dispatch(setPosition(posMs));
  };

  const updateVolume = (val: number) => {
    dispatch(setVolume(val));
  };

  return {
    currentTrack,
    status,
    positionMs,
    durationMs,
    volume,
    error,
    playTrack,
    play,
    pause,
    togglePlay,
    seek,
    setVolume: updateVolume,
  };
};
