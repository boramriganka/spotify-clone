import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { musicService } from '../providers';
import { MediaItem, Track } from '../providers/types';
import { setTracks } from '../store/slices/playerSlice';
import { useQueue } from '../core/queue/useQueue';
import MediaCard from '../components/MediaCard/MediaCard';
import './Search.scss';

const Search: React.FC = () => {
  const dispatch = useDispatch();
  const { startPlaybackFromContext } = useQueue();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'full' | 'preview' | 'artist' | 'playlist' | 'album'>('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const full = params.get('full');
    if (q) {
      setQuery(q);
      if (full === 'true') setFilter('full');
      performSearch(q, full === 'true' ? 'full' : filter);
    }
  }, []);

  const performSearch = async (q: string, currentFilter: typeof filter) => {
    setIsSearching(true);
    let data = await musicService.search(q);

    // Advanced Ranking: Full playable tracks first, then artists, then previews
    const tracks = data.filter(i => i.type === 'track') as Track[];
    const artists = data.filter(i => i.type === 'artist');
    const playlists = data.filter(i => i.type === 'playlist');
    const albums = data.filter(i => i.type === 'album');

    const fullTracks = tracks.filter(t => t.playability === 'full');
    const previewTracks = tracks.filter(t => t.playability === 'preview');

    let finalResults: MediaItem[] = [];

    if (currentFilter === 'full') {
      finalResults = fullTracks;
    } else if (currentFilter === 'preview') {
      finalResults = previewTracks;
    } else if (currentFilter === 'artist') {
      finalResults = artists;
    } else if (currentFilter === 'playlist') {
      finalResults = playlists;
    } else if (currentFilter === 'album') {
      finalResults = albums;
    } else {
      // All
      finalResults = [...fullTracks, ...artists, ...playlists, ...albums, ...previewTracks];
    }

    setResults(finalResults);
    dispatch(setTracks(tracks));
    setIsSearching(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query, filter);
  };

  const handlePlay = (item: MediaItem) => {
    if (item.type === 'track') {
      const trackResults = results.filter(i => i.type === 'track') as Track[];
      startPlaybackFromContext({
        sourceType: 'search',
        sourceId: query,
        tracks: trackResults,
        startTrackId: item.id
      });
    } else if (item.type === 'artist') {
      setQuery(item.name);
      performSearch(item.name, 'all');
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
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => { setFilter('all'); if (query) performSearch(query, 'all'); }}>All</button>
          <button className={`filter-chip ${filter === 'full' ? 'active' : ''}`} onClick={() => { setFilter('full'); if (query) performSearch(query, 'full'); }}>Full Songs</button>
          <button className={`filter-chip ${filter === 'artist' ? 'active' : ''}`} onClick={() => { setFilter('artist'); if (query) performSearch(query, 'artist'); }}>Artists</button>
          <button className={`filter-chip ${filter === 'playlist' ? 'active' : ''}`} onClick={() => { setFilter('playlist'); if (query) performSearch(query, 'playlist'); }}>Playlists</button>
          <button className={`filter-chip ${filter === 'album' ? 'active' : ''}`} onClick={() => { setFilter('album'); if (query) performSearch(query, 'album'); }}>Albums</button>
          <button className={`filter-chip ${filter === 'preview' ? 'active' : ''}`} onClick={() => { setFilter('preview'); if (query) performSearch(query, 'preview'); }}>Previews</button>
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
