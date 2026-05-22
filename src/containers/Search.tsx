import React, { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { musicService } from '../providers';
import { MediaItem } from '../providers/types';
import MediaCard from '../components/MediaCard/MediaCard';
import './Search.scss';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    const data = await musicService.search(query);
    setResults(data);
    setIsSearching(false);
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
      </div>

      <div className="search-content">
        {results.length > 0 ? (
          <div className="results-grid">
            {results.map((item) => (
              <MediaCard key={item.id} item={item} />
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
