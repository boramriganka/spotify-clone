import React, { useRef } from 'react';
import './ProgressBar.scss';

interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
  showKnob?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, duration, onSeek, showKnob = true }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const percent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedPercent = x / rect.width;
    onSeek(clickedPercent * duration);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newTime = progress;
    if (e.key === 'ArrowRight') {
      newTime = Math.min(duration, progress + 5);
    } else if (e.key === 'ArrowLeft') {
      newTime = Math.max(0, progress - 5);
    } else if (e.key === 'Home') {
      newTime = 0;
    } else if (e.key === 'End') {
      newTime = duration;
    } else {
      return;
    }
    e.preventDefault();
    onSeek(newTime);
  };

  return (
    <div
      className="progress-bar-container"
      ref={barRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={progress}
      aria-label="Playback progress"
    >
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }}>
          {showKnob && <div className="progress-bar-knob" />}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
