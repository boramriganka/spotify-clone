import React from 'react';
import { Share2, Sparkles, TrendingUp } from 'lucide-react';
import { tasteGraphService } from '../services/aiService';
import './MusicDna.scss';

const MusicDna: React.FC = () => {
  const dna = tasteGraphService.getMusicDNA();

  return (
    <div className="music-dna-screen">
      <header className="dna-header">
        <h1>Music DNA</h1>
        <p>Your taste, decoded by AI.</p>
      </header>

      <div className="dna-card-container">
        <div className="dna-card">
          <div className="card-header">
            <Sparkles size={20} />
            <span>MY MUSIC DNA</span>
          </div>
          <div className="card-body">
             <h2>{dna.vibe}</h2>
             <div className="persona">
               <span className="label">PERSONALITY</span>
               <h3>{dna.persona}</h3>
             </div>
             <div className="top-artists">
               <span className="label">TOP ARTISTS</span>
               <div className="artists-list">
                 {dna.topArtists.map(a => <span key={a}>{a}</span>)}
               </div>
             </div>
             <div className="vibe-tags">
               <span className="label">CURRENT VIBE</span>
               <div className="tags">
                 <span className="tag">{(dna as any).currentVibe}</span>
               </div>
             </div>
          </div>
          <div className="card-footer">
            <div className="brand">SPOTIFY NEO</div>
            <button className="share-btn"><Share2 size={16} /> Share</button>
          </div>
        </div>
      </div>

      <section className="recommendations">
        <h3>Recommended for your DNA</h3>
        {dna.recommendations.length > 0 ? (
          <div className="rec-grid">
             {dna.recommendations.map((t: any) => (
               <div key={t.id} className="rec-item">
                 <img src={t.image} alt={t.name} />
                 <div className="info">
                   <span className="name">{t.name}</span>
                   <span className="artist">{t.artist}</span>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Listen to some music to generate recommendations!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MusicDna;
