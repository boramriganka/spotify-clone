import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard/MediaCard';
import HorizontalShelf from '../components/HorizontalShelf/HorizontalShelf';
import { musicService } from '../providers';
import { MediaItem, Track } from '../providers/types';
import { setTracks } from '../store/slices/playerSlice';
import { useQueue } from '../core/queue/useQueue';
import './Home.scss';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const Home: React.FC = () => {
  const [recentItems, setRecentItems] = useState<MediaItem[]>([]);
  const [newReleases, setNewReleases] = useState<MediaItem[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<MediaItem[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<MediaItem[]>([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { startPlaybackFromContext } = useQueue();

  useEffect(() => {
    const loadData = async () => {
      // Load real recently played from storage
      try {
        const saved = localStorage.getItem('spotify_neo_recentlyPlayed');
        if (saved) {
           const parsed = JSON.parse(saved);
           setRecentlyPlayed(parsed.slice(0, 10));
           dispatch(setTracks(parsed));
        }
      } catch (e) {}

      // Personalized discovery data
      const [discovery, releases, artists, assamese] = await Promise.all([
        musicService.search('Top full songs'),
        musicService.search('New Music Friday'),
        musicService.search('Cora Zea'),
        musicService.search('Assamese')
      ]);

      setRecentItems(discovery.slice(0, 8));
      setNewReleases(releases.slice(0, 16));

      const allTracks = [...discovery, ...releases, ...assamese].filter(i => i.type === 'track') as Track[];
      dispatch(setTracks(allTracks));

      // Merge with some specified artists
      const featured = await musicService.search('Pink Floyd AP Dhillon Drake');
      setFeaturedArtists([...artists, ...featured, ...assamese].filter(a => a.type === 'artist').slice(0, 10));
    };

    loadData();
  }, [dispatch]);

  const handlePlay = (item: MediaItem, context: MediaItem[] = [], sourceId: string = 'home') => {
    if (item.type === 'track') {
      const tracks = context.filter(i => i.type === 'track') as Track[];
      startPlaybackFromContext({
        sourceType: 'manual',
        sourceId,
        tracks: tracks.length > 0 ? tracks : [item as Track],
        startTrackId: item.id
      });
    } else if (item.type === 'artist') {
      navigate(`/search?q=${encodeURIComponent(item.name)}`);
    }
  };

  return (
    <div className="home-screen">
      <h2 className="home-greeting">{getGreeting()}</h2>
      <section className="recent-grid">
        {recentItems.slice(0, 6).map((item) => (
          <MediaCard key={item.id} item={item} variant="tile" onClick={() => handlePlay(item, recentItems, 'discovery')} />
        ))}
      </section>

      {recentlyPlayed.length > 0 && (
        <HorizontalShelf title="Recently played" onSeeAll={() => {}}>
          {recentlyPlayed.map((item) => (
            <MediaCard key={item.id} item={item} onClick={() => handlePlay(item, recentlyPlayed, 'recently-played')} />
          ))}
        </HorizontalShelf>
      )}

      <HorizontalShelf title="It's New Music Friday" onSeeAll={() => {}}>
        {newReleases.map((item) => (
          <MediaCard key={item.id} item={item} onClick={() => handlePlay(item, newReleases, 'new-releases')} />
        ))}
      </HorizontalShelf>

      <HorizontalShelf title="Full songs discovery" onSeeAll={() => navigate('/search?q=full%20songs')}>
        {recentItems.map((item) => (
          <MediaCard key={item.id} item={item} onClick={() => handlePlay(item, recentItems, 'full-songs')} />
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
