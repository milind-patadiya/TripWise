const axios = require('axios');

// Using Open-Meteo (No API Key required)
const getWeather = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    
    const { data } = await axios.get(weatherUrl);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
};

module.exports = {
  getWeather
};
