export const storage = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`spotify_neo_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage`, e);
    }
  },

  load: <T>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(`spotify_neo_${key}`);
      if (!saved) return defaultValue;
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error loading ${key} from localStorage, resetting to default`, e);
      return defaultValue;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(`spotify_neo_${key}`);
    } catch (e) {
      console.error(`Error removing ${key} from localStorage`, e);
    }
  },

  clear: () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('spotify_neo_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Error clearing app localStorage', e);
    }
  }
};
