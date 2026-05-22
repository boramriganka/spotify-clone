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

      // Personalized demo data
      const [recent, releases, artists] = await Promise.all([
        musicService.search('Assamese EDM'),
        musicService.search('New Music Friday'),
        musicService.search('Cora Zea')
      ]);

      setRecentItems(recent.slice(0, 8));
      setNewReleases(releases.slice(0, 16));

      // Merge with some specified artists
      const featured = await musicService.search('Pink Floyd AP Dhillon Drake');
      setFeaturedArtists([...artists, ...featured].filter(a => a.type === 'artist').slice(0, 10));
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

      <HorizontalShelf title="It's New Music Friday" onSeeAll={() => {}}>
        {newReleases.map((item) => (
          <MediaCard key={item.id} item={item} onClick={() => handlePlay(item)} />
        ))}
      </HorizontalShelf>

      <HorizontalShelf title="Assamese EDM" onSeeAll={() => {}}>
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
