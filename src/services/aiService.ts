import { musicService } from '../providers';
import { Track } from '../providers/types';

export const aiDjService = {
  parsePrompt: async (prompt: string): Promise<{ tracks: Track[], vibe: string }> => {
    const lowercasePrompt = prompt.toLowerCase();
    let query = prompt;
    let vibe = "Getting some tunes for you...";

    if (lowercasePrompt.includes('assamese')) {
      query = "Assamese EDM";
      vibe = "Surfacing the best of Assamese EDM for your vibe.";
    } else if (lowercasePrompt.includes('rainy')) {
      query = "Rainy night chill";
      vibe = "Setting the mood for a rainy night.";
    } else if (lowercasePrompt.includes('coding')) {
      query = "Lofi coding focus";
      vibe = "Focus mode activated. Here's some coding music.";
    } else if (lowercasePrompt.includes('romantic')) {
      query = "Indian indie romantic";
      vibe = "Feeling romantic? Here's some Indian indie.";
    } else if (lowercasePrompt.includes('cora zea')) {
       query = "Cora Zea emotional";
       vibe = "Tracks like Cora Zea, but deeper.";
    }

    let results = await musicService.search(query);
    let tracks = results.filter(i => i.type === 'track') as Track[];

    if (lowercasePrompt.includes('full') || lowercasePrompt.includes('no preview')) {
       tracks = tracks.filter(t => t.playability === 'full');
    }

    // Ensure we have at least some tracks, otherwise expand search
    if (tracks.length < 3 && !lowercasePrompt.includes('full')) {
       const expanded = await musicService.search(query + " chill");
       tracks = [...tracks, ...(expanded.filter(i => i.type === 'track') as Track[])];
    }

    return {
      tracks: tracks.slice(0, 20),
      vibe
    };
  }
};

export const tasteGraphService = {
  getMusicDNA: () => {
    const recentlyPlayed = JSON.parse(localStorage.getItem('spotify_neo_recentlyPlayed') || '[]');
    const likedIds = JSON.parse(localStorage.getItem('spotify_neo_likedTrackIds') || '[]');

    if (recentlyPlayed.length === 0 && likedIds.length === 0) {
      return {
        vibe: "Silent Explorer",
        persona: "The Blank Canvas",
        topArtists: ["Finding your sound..."],
        recommendations: [],
        currentVibe: "Quiet",
        moods: ["Peaceful"]
      };
    }

    // Analyze artists
    const artistCounts: Record<string, number> = {};
    recentlyPlayed.forEach((t: any) => {
      artistCounts[t.artist] = (artistCounts[t.artist] || 0) + 1;
    });
    const topArtists = Object.entries(artistCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);

    // Determine Vibe & Moods
    const hasEdm = recentlyPlayed.some((t: any) => (t.artist || '').toLowerCase().includes('edm') || (t.name || '').toLowerCase().includes('remix'));
    const hasIndian = recentlyPlayed.some((t: any) => (t.artist || '').toLowerCase().includes('assamese') || (t.artist || '').toLowerCase().includes('dhillon'));

    let vibe = "Eclectic Mix";
    let moods = ["Dynamic"];

    if (hasEdm && hasIndian) {
      vibe = "Northeast Nostalgia + EDM Vibe";
      moods = ["Energetic", "Cultural"];
    } else if (hasIndian) {
      vibe = "Desi Indie Soul";
      moods = ["Emotional", "Nostalgic"];
    } else if (hasEdm) {
      vibe = "2AM Club Focus";
      moods = ["Electronic", "Deep"];
    }

    return {
      vibe,
      persona: recentlyPlayed.length > 20 ? "The Connoisseur" : "The Digital Nomad",
      topArtists: topArtists.length > 0 ? topArtists : ["Various Artists"],
      recommendations: recentlyPlayed.slice(0, 6),
      currentVibe: vibe.split('+')[0].trim(),
      moods
    };
  }
};
