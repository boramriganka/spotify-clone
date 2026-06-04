import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setTrack,
  setStatus,
  setPosition,
  setVolume as setVolumeAction,
  setError,
} from './playbackSlice';
import { normalizeTrack } from '../../utils/trackNormalizer';

export const usePlaybackController = () => {
  const dispatch = useDispatch();
  const { currentTrack, status, positionMs, durationMs, volume, error } = useSelector((state: RootState) => state.playback);

  const playTrack = async (track: any) => {
    const normalized = normalizeTrack(track);
    if (!normalized) {
      dispatch(setError('Invalid track data'));
      dispatch(setStatus('error'));
      return;
    }

    // Clear previous error and set new track
    dispatch(setError(null));
    dispatch(setTrack(normalized));
    dispatch(setStatus('loading'));

    // Note: AudioEngine handles fetching the stream URL and starting playback
  };

  const play = () => {
    if (currentTrack && (status === 'paused' || status === 'idle' || status === 'ended')) {
      dispatch(setStatus('playing'));
    }
  };

  const pause = () => {
    if (status === 'playing' || status === 'buffering') {
      dispatch(setStatus('paused'));
    }
  };

  const togglePlay = () => {
    if (status === 'playing' || status === 'buffering') {
      pause();
    } else if (status === 'paused' || status === 'idle' || status === 'ended') {
      play();
    } else if (status === 'error') {
      // Basic retry: re-dispatch current track to trigger reload in AudioEngine
      if (currentTrack) {
        playTrack(currentTrack);
      }
    }
  };

  const seek = (posMs: number) => {
    dispatch(setPosition(posMs));
  };

  const updateVolume = (val: number) => {
    dispatch(setVolumeAction(val));
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
