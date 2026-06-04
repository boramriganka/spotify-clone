import React, { useState } from 'react';
import { Send, Sparkles, Save, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { aiDjService } from '../services/aiService';
import { Track } from '../providers/types';
import { addPlaylist } from '../store/slices/playerSlice';
import { Playlist } from '../providers/types';
import TrackRow from '../components/TrackRow/TrackRow';
import { useQueue } from '../core/queue/useQueue';
import { usePlaybackController } from '../core/player/usePlaybackController';
import './AiDj.scss';

const AiDj: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [vibe, setVibe] = useState('');
  const [tracks, setTracksResult] = useState<Track[]>([]);
  const dispatch = useDispatch();
  const { startPlaybackFromContext } = useQueue();
  const { currentTrack } = usePlaybackController();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const { tracks: resTracks, vibe: resVibe } = await aiDjService.parsePrompt(prompt);
    setTracksResult(resTracks);
    setVibe(resVibe);
    setIsGenerating(false);
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      startPlaybackFromContext({
        sourceType: 'manual',
        sourceId: 'ai-dj',
        tracks,
        startTrackId: tracks[0].id
      });
    }
  };

  const handleSaveAsPlaylist = () => {
    if (tracks.length === 0) return;
    const newPlaylist: Playlist = {
      id: `ai-dj-${Date.now()}`,
      name: `AI DJ: ${prompt || 'Vibe'}`,
      description: vibe,
      image: tracks[0].image,
      owner: 'Mriganka',
      tracks: tracks,
      provider: 'local',
      type: 'playlist'
    };
    dispatch(addPlaylist(newPlaylist));
    alert('Vibe saved to your Library!');
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
              <div className="vibe-actions">
                <button className="play-btn" onClick={handlePlayAll}>Play all</button>
                <button className="save-btn" onClick={handleSaveAsPlaylist}><Save size={18} /> Save as Playlist</button>
              </div>
              <div className="refine-chips">
                 <button onClick={() => { setPrompt(p => p + " more energetic"); }}>More energetic</button>
                 <button onClick={() => { setPrompt(p => p + " full songs only"); }}>Full songs only</button>
                 <button onClick={() => { setPrompt("surprise me"); }}>Surprise me</button>
              </div>
            </div>
            <div className="track-list">
              {tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  isActive={track.id === currentTrack?.id}
                  onPlay={() => {
                    startPlaybackFromContext({
                      sourceType: 'manual',
                      sourceId: 'ai-dj',
                      tracks,
                      startTrackId: track.id
                    });
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
