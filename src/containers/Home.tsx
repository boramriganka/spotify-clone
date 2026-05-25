import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MediaCard from '../components/MediaCard/MediaCard';
import HorizontalShelf from '../components/HorizontalShelf/HorizontalShelf';
import { musicService } from '../providers';
import { MediaItem, Track, Artist } from '../providers/types';
import { setPlayback } from '../store/slices/playerSlice';
import { addTracks, addArtists } from '../store/slices/musicSlice';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import './Home.scss';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [recentGridIds, setRecentGridIds] = useState<string[]>([]);
  const [newReleaseIds, setNewReleaseIds] = useState<string[]>([]);
  const [featuredArtistIds, setFeaturedArtistIds] = useState<string[]>([]);

  const { tracksById, artistsById, fullSongOnly } = useSelector((state: RootState) => state.music);

  useEffect(() => {
    const loadData = async () => {
      const options = { filterFull: fullSongOnly };
      const [recent, releases, artists, assamese] = await Promise.all([
        musicService.search('discovery', options),
        musicService.search('New Music', options),
        musicService.search('popular artists', options),
        musicService.search('Assamese EDM', options)
      ]);

      const allTracks = [...recent, ...releases, ...assamese].filter(i => i.type === 'track') as Track[];
      dispatch(addTracks(allTracks));

      const allArtists = artists.filter(i => i.type === 'artist') as Artist[];
      dispatch(addArtists(allArtists.map(a => ({
        id: a.id,
        name: a.name,
        artworkUrl: a.artworkUrl || '',
        genres: [],
        type: 'artist' as const
      }))));

      setRecentGridIds(assamese.slice(0, 8).map(i => i.id));
      setNewReleaseIds(releases.slice(0, 16).map(i => i.id));
      setFeaturedArtistIds(allArtists.slice(0, 10).map(i => i.id));
    };

    loadData();
  }, [dispatch, fullSongOnly]);

  const handlePlay = (id: string) => {
    const track = tracksById[id];
    if (track) {
      dispatch(setPlayback({
        trackId: id,
        queue: [...newReleaseIds, ...recentGridIds]
      }));
    }
  };

  const handleArtistClick = (id: string) => {
     navigate(`/artist?id=${id}`);
  };

  return (
    <div className="home-screen scroll-container">
      <section className="recent-grid">
        {recentGridIds.slice(0, 6).map((id) => {
          const item = tracksById[id];
          if (!item) return null;
          return <MediaCard key={id} item={item} variant="tile" onClick={() => handlePlay(id)} />;
        })}
      </section>

      <HorizontalShelf title="New Releases" onSeeAll={() => {}}>
        {newReleaseIds.map((id) => {
          const item = tracksById[id];
          if (!item) return null;
          return <MediaCard key={id} item={item} onClick={() => handlePlay(id)} />;
        })}
      </HorizontalShelf>

      <HorizontalShelf title="Assamese / Indian discovery" onSeeAll={() => {}}>
        {recentGridIds.map((id) => {
          const item = tracksById[id];
          if (!item) return null;
          return <MediaCard key={id} item={item} onClick={() => handlePlay(id)} />;
        })}
      </HorizontalShelf>

      <HorizontalShelf title="Popular artists" onSeeAll={() => {}}>
        {featuredArtistIds.map((id) => {
          const artist = artistsById[id];
          if (!artist) return null;
          return <MediaCard key={id} item={artist} variant="circle" onClick={() => handleArtistClick(id)} />;
        })}
      </HorizontalShelf>
    </div>
  );
};

export default Home;
