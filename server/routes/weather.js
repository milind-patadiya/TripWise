const express = require('express');
const router = express.Router();

// @GET /api/weather?lat=28.6&lng=77.2 — PUBLIC weather proxy
router.get('/', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query parameters are required' });
    }

    // Clamp coordinates to 4 decimal places to prevent Open-Meteo rejection
    const cleanLat = Number(lat).toFixed(4);
    const cleanLng = Number(lng).toFixed(4);

    if (isNaN(cleanLat) || isNaN(cleanLng)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${cleanLat}&longitude=${cleanLng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error('Open-Meteo failed:', text);
      throw new Error(`Open-Meteo API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Weather API Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch real-time weather data', error: err.message });
  }
});

module.exports = router;
