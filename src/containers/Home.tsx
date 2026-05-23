import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import MediaCard from '../components/MediaCard/MediaCard';
import HorizontalShelf from '../components/HorizontalShelf/HorizontalShelf';
import { musicService } from '../providers';
import { MediaItem } from '../providers/types';
import { setTrack } from '../store/slices/playerSlice';
import './Home.scss';

const Home: React.FC = () => {
  const [recentItems, setRecentItems] = useState<MediaItem[]>([]);
  const [newReleases, setNewReleases] = useState<MediaItem[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<MediaItem[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<MediaItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // Load real recently played from storage
      try {
        const saved = localStorage.getItem('spotify_recentlyPlayed');
        if (saved) setRecentlyPlayed(JSON.parse(saved));
      } catch (e) {}

      // Personalized discovery focused on full songs
      const [recent, releases, artists, assamese] = await Promise.all([
        musicService.search('discovery', { filterFull: true }),
        musicService.search('New Music', { filterFull: true }),
        musicService.search('popular artists', { filterFull: true }),
        musicService.search('Assamese EDM', { filterFull: true })
      ]);

      setRecentItems(assamese.slice(0, 8));
      setNewReleases(releases.slice(0, 16));
      setFeaturedArtists(artists.filter(a => a.type === 'artist').slice(0, 10));
    };

    loadData();
  }, []);

  const dispatch = useDispatch();

  const handlePlay = (item: MediaItem) => {
    if (item.type === 'track') {
      dispatch(setTrack({ track: item }));
    }
    // Handle other types as needed
  };

  return (
    <div className="home-screen">
      <section className="recent-grid">
        {recentItems.slice(0, 6).map((item) => (
          <MediaCard key={item.id} item={item} variant="tile" onClick={() => handlePlay(item)} />
        ))}
      </section>

      {recentlyPlayed.length > 0 && (
        <HorizontalShelf title="Recently played" onSeeAll={() => {}}>
          {recentlyPlayed.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </HorizontalShelf>
      )}

      <HorizontalShelf title="Full songs you can play now" onSeeAll={() => {}}>
        {newReleases.map((item) => (
          <MediaCard key={item.id} item={item} onClick={() => handlePlay(item)} />
        ))}
      </HorizontalShelf>

      <HorizontalShelf title="Assamese / Indian discovery" onSeeAll={() => {}}>
        {recentItems.map((item) => (
          <MediaCard key={item.id} item={item} onClick={() => handlePlay(item)} />
        ))}
      </HorizontalShelf>

      <HorizontalShelf title="Popular artists" onSeeAll={() => {}}>
        {featuredArtists.map((item) => (
          <MediaCard key={item.id} item={item} variant="circle" onClick={() => handlePlay(item)} />
        ))}
      </HorizontalShelf>
    </div>
  );
};

export default Home;
