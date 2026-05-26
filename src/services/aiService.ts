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

    return {
      tracks,
      vibe
    };
  }
};

export const tasteGraphService = {
  getMusicDNA: () => {
    const recentlyPlayed = JSON.parse(localStorage.getItem('spotify_neo_recentlyPlayed') || '[]');

    if (recentlyPlayed.length === 0) {
      return {
        vibe: "Music Explorer",
        persona: "The Newbie",
        topArtists: ["Discovery"],
        recommendations: [],
        currentVibe: "Curious"
      };
    }

    // Deterministic mock analysis based on real local data
    const genres = recentlyPlayed.map((t: any) => (t.artist || '').includes('EDM') ? 'EDM' : 'Indie');
    const topGenre = genres.sort((a: any, b: any) =>
      genres.filter((v: any) => v === a).length - genres.filter((v: any) => v === b).length
    ).pop() || 'Discovery';

    const artists = Array.from(new Set(recentlyPlayed.map((t: any) => t.artist))).filter(Boolean) as string[];

    return {
      vibe: `${topGenre} Enthusiast`,
      persona: recentlyPlayed.length > 10 ? "The Connoisseur" : "The Nocturnal Discoverer",
      topArtists: artists.length > 0 ? artists.slice(0, 3) : ["Discovery"],
      recommendations: recentlyPlayed.slice(0, 10),
      currentVibe: topGenre
    };
  }
};
