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
    const step = 5; // 5 seconds jump

    switch (e.key) {
      case 'ArrowRight':
        newTime = Math.min(duration, progress + step);
        break;
      case 'ArrowLeft':
        newTime = Math.max(0, progress - step);
        break;
      case 'Home':
        newTime = 0;
        break;
      case 'End':
        newTime = duration;
        break;
      default:
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
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={Math.round(progress)}
      aria-label="Progress bar"
      onKeyDown={handleKeyDown}
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
