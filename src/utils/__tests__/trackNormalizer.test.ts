import { normalizeTrack, getStableTrackId } from '../trackNormalizer';

describe('trackNormalizer', () => {
  describe('getStableTrackId', () => {
    it('returns id if present', () => {
      expect(getStableTrackId({ id: '123' })).toBe('123');
    });

    it('returns trackId if present', () => {
      expect(getStableTrackId({ trackId: 456 })).toBe('456');
    });

    it('returns composite key for collection and track name', () => {
      expect(getStableTrackId({ collectionId: 'coll', trackName: 'song' })).toBe('coll-song');
    });

    it('returns previewUrl as fallback', () => {
      expect(getStableTrackId({ previewUrl: 'http://preview' })).toBe('http://preview');
    });

    it('returns deterministic string for name and artist', () => {
      expect(getStableTrackId({ name: 'Hello', artist: 'Adele' })).toBe('hello-adele--');
    });

    it('returns null for empty track', () => {
      expect(getStableTrackId({})).toBeNull();
      expect(getStableTrackId(null)).toBeNull();
    });
  });

  describe('normalizeTrack', () => {
    it('returns null for invalid track', () => {
      expect(normalizeTrack(null)).toBeNull();
      expect(normalizeTrack({})).toBeNull();
    });

    it('normalizes itunes track correctly', () => {
      const itunesTrack = {
        trackId: 12345,
        trackName: 'Test Song',
        artistName: 'Test Artist',
        collectionName: 'Test Album',
        artworkUrl100: 'http://image',
        previewUrl: 'http://preview',
        trackTimeMillis: 30000,
        primaryGenreName: 'Pop',
        kind: 'song'
      };

      const normalized = normalizeTrack(itunesTrack);
      expect(normalized).toEqual({
        id: '12345',
        name: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        image: 'http://image',
        artwork: 'http://image',
        previewUrl: 'http://preview',
        duration: 30,
        durationMs: 30000,
        genre: 'Pop',
        source: 'itunes',
        raw: itunesTrack
      });
    });

    it('preserves existing NeoTrack', () => {
      const neoTrack = {
        id: 'stable-id',
        name: 'Neo',
        artist: 'Matrix',
        source: 'local'
      };
      expect(normalizeTrack(neoTrack)).toEqual(neoTrack);
    });
  });
});
