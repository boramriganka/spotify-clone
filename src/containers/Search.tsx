import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { musicService } from '../providers';
import { MediaItem, Track } from '../providers/types';
import { setTrack } from '../store/slices/playerSlice';
import MediaCard from '../components/MediaCard/MediaCard';
import './Search.scss';

const Search: React.FC = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeChip, setActiveChip] = useState('Full songs');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    const filterFull = activeChip === 'Full songs';
    const data = await musicService.search(query, { filterFull });
    setResults(data);
    setIsSearching(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
       setQuery(q);
    }
  }, []);

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [activeChip, query]);

  const handlePlay = (item: MediaItem) => {
    if (item.type === 'track') {
      const trackResults = results.filter(i => i.type === 'track') as Track[];
      const index = trackResults.findIndex(t => t.id === item.id);
      dispatch(setTrack({
        track: item as Track,
        queue: trackResults,
        index: index !== -1 ? index : 0
      }));
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="search-screen">
      <div className="search-header">
        <div className="search-top-mobile">
           <button className="avatar-btn" onClick={() => (window as any).toggleDrawer?.()}>
             <div className="avatar">M</div>
           </button>
           <h2>Search</h2>
        </div>
        <form className="search-input-wrapper" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <SearchIcon className="search-icon" size={20} />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button type="button" onClick={clearSearch} className="clear-btn">
              <X size={20} />
            </button>
          )}
        </form>
        <div className="search-chips scroll-container">
          {['All', 'Full songs', 'Artists', 'Albums', 'Playlists', 'Preview only'].map(chip => (
            <button
              key={chip}
              className={`chip ${activeChip === chip ? 'active' : ''}`}
              onClick={() => setActiveChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="search-content">
        {isSearching ? (
          <div className="loading">Searching...</div>
        ) : results.length > 0 ? (
          <>
            {results.some(i => i.type === 'artist') && (
              <div className="search-section">
                <h2>Artists</h2>
                <div className="results-grid">
                  {results.filter(i => i.type === 'artist').map((item) => (
                    <MediaCard key={item.id} item={item} onClick={() => handlePlay(item)} />
                  ))}
                </div>
              </div>
            )}

            <div className="search-section">
              <h2>{activeChip === 'Full songs' ? 'Full songs' : 'Results'}</h2>
              <div className="results-grid">
                {results.filter(i => i.type === 'track' && (i as Track).availability !== 'preview').map((item) => (
                  <MediaCard key={item.id} item={item} onClick={() => handlePlay(item)} />
                ))}
              </div>
            </div>

            {(activeChip === 'All' || activeChip === 'Preview only') && results.some(i => (i as Track).availability === 'preview') && (
              <div className="search-section">
                <h2>Preview-only matches</h2>
                <div className="results-grid">
                  {results.filter(i => i.type === 'track' && (i as Track).availability === 'preview').map((item) => (
                    <MediaCard key={item.id} item={item} onClick={() => handlePlay(item)} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : query ? (
          <div className="no-results">
            <p>No {activeChip.toLowerCase()} found for "{query}"</p>
            <p className="subtitle">Try another artist, remix, live version, or related genre.</p>
          </div>
        ) : (
          <div className="browse-all">
            <h2>Browse all</h2>
            <div className="category-grid">
              {['Podcasts', 'Live Events', 'Made For You', 'New Releases', 'Pop', 'Hip-Hop', 'Rock', 'Latin'].map((cat, i) => (
                <div key={cat} className={`category-card color-${i % 8}`}>
                  <span>{cat}</span>
                  <img src={`https://picsum.photos/seed/${cat}/100/100`} alt="" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
