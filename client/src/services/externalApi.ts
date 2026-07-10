import axios from 'axios';

// ─── Weather API (Open-Meteo) ──────────────────────────────────────────────────
export const fetchWeather = async (lat: number, lon: number) => {
  try {
    // Ensure accurate lat/lon rounding for Open-Meteo
    const cleanLat = Number(lat).toFixed(4);
    const cleanLon = Number(lon).toFixed(4);
    const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${cleanLat}&longitude=${cleanLon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch weather', error);
    return null;
  }
};

// ─── Country API (REST Countries) ──────────────────────────────────────────────
export const fetchCountryInfo = async (countryName: string) => {
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
    return res.data[0];
  } catch (error) {
    try {
      const resFallback = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
      return resFallback.data[0];
    } catch (fallbackError) {
      console.error('Failed to fetch country info', fallbackError);
      return null;
    }
  }
};

// ─── Unsplash API & Robust Fallback ───────────────────────────────────────────
export const getDynamicImage = async (query: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY;
  
  if (apiKey && !apiKey.includes('your_')) {
    try {
      const res = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${apiKey}&per_page=1&orientation=landscape`);
      if (res.data.results && res.data.results.length > 0) {
        return res.data.results[0].urls.regular;
      }
    } catch (e) {
      console.error('Unsplash API failed, using fallback', e);
    }
  }
  
  // High-quality static fallbacks based on query semantics (mimicking a CDN like MakeMyTrip)
  const q = query.toLowerCase();
  if (q.includes('beach') || q.includes('goa') || q.includes('andaman')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200';
  } else if (q.includes('mountain') || q.includes('manali') || q.includes('ladakh') || q.includes('snow') || q.includes('shimla')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';
  } else if (q.includes('city') || q.includes('delhi') || q.includes('mumbai') || q.includes('bangalore')) {
    return 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1200';
  } else if (q.includes('temple') || q.includes('varanasi') || q.includes('culture') || q.includes('jaipur')) {
    return 'https://images.unsplash.com/photo-1514222134-b57cbf8ce698?auto=format&fit=crop&q=80&w=1200';
  } else if (q.includes('nature') || q.includes('kerala') || q.includes('forest')) {
    return 'https://images.unsplash.com/photo-1518182170546-076616fdfaaf?auto=format&fit=crop&q=80&w=1200';
  }
  
  // Generic beautiful landscape fallback
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200';
};

// ─── Geocoding API (Nominatim OpenStreetMap) ──────────────────────────────────
export const geocodeLocation = async (query: string) => {
  try {
    // Nominatim requires an identifier, otherwise it blocks requests with 403.
    // Adding the email parameter satisfies their usage policy for non-authenticated apps.
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      },
      params: {
        'email': 'developer@tripwise.local'
      }
    });
    
    if (res.data && res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lon: parseFloat(res.data[0].lon),
        displayName: res.data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed', error);
    return null;
  }
};
