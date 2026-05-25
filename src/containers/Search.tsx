import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { musicService } from '../providers';
import { MediaItem, Track } from '../providers/types';
import { setTracks, setCurrentTrack, setQueue } from '../store/slices/playerSlice';
import MediaCard from '../components/MediaCard/MediaCard';
import './Search.scss';

const Search: React.FC = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'full' | 'preview'>('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const full = params.get('full');
    if (q) {
      setQuery(q);
      if (full === 'true') setFilter('full');
      // Trigger search
      const load = async () => {
         setIsSearching(true);
         let data = await musicService.search(q);
         if (full === 'true' || filter === 'full') {
            data = data.filter(item => item.type !== 'track' || (item as Track).playability === 'full');
         }
         setResults(data);
         dispatch(setTracks(data.filter(i => i.type === 'track') as Track[]));
         setIsSearching(false);
      };
      load();
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    let data = await musicService.search(query);

    if (filter === 'full') {
      data = data.filter(item => item.type !== 'track' || (item as Track).playability === 'full');
    } else if (filter === 'preview') {
      data = data.filter(item => item.type !== 'track' || (item as Track).playability === 'preview');
    }

    setResults(data);

    // Store tracks in normalized state
    const tracks = data.filter(i => i.type === 'track') as Track[];
    dispatch(setTracks(tracks));

    setIsSearching(false);
  };

  const handlePlay = (item: MediaItem) => {
    if (item.type === 'track') {
      const trackResults = results.filter(i => i.type === 'track') as Track[];
      dispatch(setTracks(trackResults));
      dispatch(setQueue(trackResults.map(t => t.id)));
      dispatch(setCurrentTrack(item.id));
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="search-screen">
      <div className="search-header">
        <form className="search-input-wrapper" onSubmit={handleSearch}>
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
        <div className="search-filters">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-chip ${filter === 'full' ? 'active' : ''}`} onClick={() => setFilter('full')}>Full Songs</button>
          <button className={`filter-chip ${filter === 'preview' ? 'active' : ''}`} onClick={() => setFilter('preview')}>Previews</button>
        </div>
      </div>

      <div className="search-content">
        {results.length > 0 ? (
          <div className="results-grid">
            {results.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onClick={() => handlePlay(item)}
              />
            ))}
          </div>
        ) : !isSearching && (
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

        {isSearching && <div className="loading">Searching...</div>}
      </div>
    </div>
  );
};

export default Search;
