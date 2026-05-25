import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { musicService } from '../providers';
import { MediaItem, Track, Artist } from '../providers/types';
import { setPlayback } from '../store/slices/playerSlice';
import { addTracks, addArtists } from '../store/slices/musicSlice';
import { RootState } from '../store';
import MediaCard from '../components/MediaCard/MediaCard';
import './Search.scss';

const CATEGORIES = [
  { name: 'Podcasts', color: '#27856A' },
  { name: 'Made For You', color: '#1E3264' },
  { name: 'New Releases', color: '#E8115B' },
  { name: 'Pop', color: '#8D67AB' },
  { name: 'Hip-Hop', color: '#BC5900' },
  { name: 'Rock', color: '#E91429' },
  { name: 'Latin', color: '#E1118C' },
  { name: 'Dance & Electronic', color: '#D84000' },
  { name: 'Assamese', color: '#503750' },
  { name: 'Indie', color: '#E91429' }
];

const Search: React.FC = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [resultIds, setResultIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeChip, setActiveChip] = useState('All');

  const { tracksById, artistsById, fullSongOnly } = useSelector((state: RootState) => state.music);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    const options = { filterFull: activeChip === 'Full songs' || fullSongOnly };
    const data = await musicService.search(searchTerm, options);

    const tracks = data.filter(i => i.type === 'track') as Track[];
    dispatch(addTracks(tracks));

    const artists = data.filter(i => i.type === 'artist') as Artist[];
    dispatch(addArtists(artists.map(a => ({
      id: a.id,
      name: a.name,
      artworkUrl: a.artworkUrl || '',
      genres: [],
      type: 'artist'
    }))));

    setResultIds(data.map(i => i.id));
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
      const timer = setTimeout(() => handleSearch(query), 300);
      return () => clearTimeout(timer);
    } else {
      setResultIds([]);
    }
  }, [activeChip, query, fullSongOnly]);

  const handlePlay = (id: string) => {
    const track = tracksById[id];
    if (track) {
      const queueIds = resultIds.filter(rid => tracksById[rid]);
      dispatch(setPlayback({
        trackId: id,
        queue: queueIds
      }));
    }
  };

  const handleCategoryClick = (catName: string) => {
     setQuery(catName);
     handleSearch(catName);
  };

  const clearSearch = () => {
    setQuery('');
    setResultIds([]);
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
        <form className="search-input-wrapper" onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}>
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
          {['All', 'Full songs', 'Artists', 'Albums', 'Playlists'].map(chip => (
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
        ) : resultIds.length > 0 ? (
          <>
            {resultIds.some(id => artistsById[id]) && (
              <div className="search-section">
                <h2>Artists</h2>
                <div className="results-grid">
                  {resultIds.filter(id => artistsById[id]).map((id) => {
                    const artist = artistsById[id];
                    return <MediaCard key={id} item={artist} variant="circle" onClick={() => {}} />;
                  })}
                </div>
              </div>
            )}

            <div className="search-section">
              <h2>{activeChip === 'Full songs' ? 'Full songs' : 'Results'}</h2>
              <div className="results-grid">
                {resultIds.filter(id => tracksById[id] && tracksById[id].playability !== 'preview').map((id) => {
                  const track = tracksById[id];
                  return <MediaCard key={id} item={track} onClick={() => handlePlay(id)} />;
                })}
              </div>
            </div>

            {(activeChip === 'All') && resultIds.some(id => tracksById[id]?.playability === 'preview') && (
              <div className="search-section">
                <h2>Preview-only matches</h2>
                <div className="results-grid">
                  {resultIds.filter(id => tracksById[id]?.playability === 'preview').map((id) => {
                    const track = tracksById[id];
                    return <MediaCard key={id} item={track} onClick={() => handlePlay(id)} />;
                  })}
                </div>
              </div>
            )}
          </>
        ) : query ? (
          <div className="no-results">
            <p>No results found for "{query}"</p>
            <p className="subtitle">Try another artist, remix, or related genre.</p>
          </div>
        ) : (
          <div className="browse-all">
            <h2>Browse all</h2>
            <div className="category-grid">
              {CATEGORIES.map((cat, i) => (
                <div
                  key={cat.name}
                  className="category-card"
                  style={{ backgroundColor: cat.color }}
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <span>{cat.name}</span>
                  <img src={`https://picsum.photos/seed/${cat.name}/100/100`} alt="" />
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
