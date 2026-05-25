import React, { useState } from 'react';
import { Send, Sparkles, Save, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { aiDjService } from '../services/aiService';
import { Track } from '../providers/types';
import { setTracks, setQueue, setCurrentTrack } from '../store/slices/playerSlice';
import TrackRow from '../components/TrackRow/TrackRow';
import './AiDj.scss';

const AiDj: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [vibe, setVibe] = useState('');
  const [tracks, setTracksResult] = useState<Track[]>([]);
  const dispatch = useDispatch();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const { tracks: resTracks, vibe: resVibe } = await aiDjService.parsePrompt(prompt);
    setTracksResult(resTracks);
    setVibe(resVibe);
    setIsGenerating(false);

    if (resTracks.length > 0) {
      dispatch(setTracks(resTracks));
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      dispatch(setQueue(tracks.map(t => t.id)));
      dispatch(setCurrentTrack(tracks[0].id));
    }
  };

  return (
    <div className="ai-dj-screen">
      <div className="ai-dj-header">
        <div className="title">
          <Sparkles className="sparkle-icon" size={24} />
          <h1>AI DJ</h1>
        </div>
        <button onClick={onClose} className="close-btn"><X size={24} /></button>
      </div>

      <div className="ai-dj-content">
        {!vibe && !isGenerating && (
          <div className="welcome">
            <h2>What's your vibe today?</h2>
            <div className="suggestions">
              {['Assamese EDM full songs', 'rainy night coding music', 'romantic Indian indie', 'surprise me'].map(s => (
                <button key={s} onClick={() => { setPrompt(s); }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {isGenerating && <div className="loading">Generating your vibe...</div>}

        {vibe && (
          <div className="generated-content">
            <div className="vibe-explanation">
              <p>{vibe}</p>
              <button className="play-btn" onClick={handlePlayAll}>Play all</button>
            </div>
            <div className="track-list">
              {tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  onPlay={() => {
                    dispatch(setQueue(tracks.map(t => t.id)));
                    dispatch(setCurrentTrack(track.id));
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form className="ai-dj-input" onSubmit={handleGenerate}>
        <input
          type="text"
          placeholder="Ask AI DJ... (e.g. 'rainy night chill')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type="submit"><Send size={20} /></button>
      </form>
    </div>
  );
};

export default AiDj;
