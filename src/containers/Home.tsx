import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import MediaCard from '../components/MediaCard/MediaCard';
import HorizontalShelf from '../components/HorizontalShelf/HorizontalShelf';
import { musicService } from '../providers';
import { MediaItem, Track } from '../providers/types';
import { setTracks, setCurrentTrack, setQueue } from '../store/slices/playerSlice';
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
        const saved = localStorage.getItem('spotify_neo_recentlyPlayed');
        if (saved) {
           const parsed = JSON.parse(saved);
           setRecentlyPlayed(parsed);
           dispatch(setTracks(parsed));
        }
      } catch (e) {}

      // Personalized demo data
      const [recent, releases, artists] = await Promise.all([
        musicService.search('Assamese EDM'),
        musicService.search('New Music Friday'),
        musicService.search('Cora Zea')
      ]);

      setRecentItems(recent.slice(0, 8));
      setNewReleases(releases.slice(0, 16));

      const allTracks = [...recent, ...releases].filter(i => i.type === 'track') as Track[];
      dispatch(setTracks(allTracks));

      // Merge with some specified artists
      const featured = await musicService.search('Pink Floyd AP Dhillon Drake');
      setFeaturedArtists([...artists, ...featured].filter(a => a.type === 'artist').slice(0, 10));
    };

    loadData();
  }, []);

  const dispatch = useDispatch();

  const handlePlay = (item: MediaItem) => {
    if (item.type === 'track') {
      dispatch(setTracks([item as Track]));
      dispatch(setCurrentTrack(item.id));
    } else if (item.type === 'artist') {
      window.location.href = `/search?q=${encodeURIComponent(item.name)}`;
    }
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
