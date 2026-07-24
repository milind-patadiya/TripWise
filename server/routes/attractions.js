const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');
const { amadeus, fetchWithCache } = require('../services/amadeusService');
const axios = require('axios');

// @GET /api/attractions?destination=Goa — PUBLIC
router.get('/', async (req, res) => {
  try {
    const { destination, travelStyle } = req.query;

    if (destination && process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_KEY !== 'YOUR_AMADEUS_API_KEY_HERE') {
      try {
        const cacheKey = `attractions_${destination}`;
        const amadeusData = await fetchWithCache(cacheKey, async () => {
          // 1. Geocode destination to get Lat/Lng
          const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`, {
            headers: { 'Accept-Language': 'en-US,en;q=0.9' },
            params: { 'email': 'developer@tripwise.local' }
          });

          if (!geoRes.data || geoRes.data.length === 0) {
            throw new Error('Could not geocode destination');
          }

          const { lat, lon } = geoRes.data[0];

          // 2. Fetch Points of Interest from Amadeus
          const poiResponse = await amadeus.referenceData.locations.pointsOfInterest.get({
            latitude: lat,
            longitude: lon,
            radius: 10
          });

          if (!poiResponse.data || poiResponse.data.length === 0) {
            throw new Error('No attractions found in Amadeus');
          }

          // 3. Map to frontend format
          return poiResponse.data.slice(0, 15).map((poi, index) => {
            return {
              _id: poi.id,
              name: poi.name,
              destination: destination,
              category: poi.category,
              description: `A highly rated ${poi.category.toLowerCase()} located in ${destination}.`,
              rating: Math.floor(Math.random() * 2) + 4, // Amadeus POI doesn't usually return rating
              image: `https://images.unsplash.com/photo-1596422846543-74c6c211ff18?auto=format&fit=crop&q=80&w=600&sig=${index}`, // Mock Image
              address: `${poi.name}, ${destination}`,
              distance: poi.distance ? `${poi.distance.value} ${poi.distance.unit}` : 'Near city center',
              openingHours: '9:00 AM - 6:00 PM', // Amadeus rarely gives hours
              location: {
                lat: poi.geoCode.latitude,
                lng: poi.geoCode.longitude
              }
            };
          });
        });
        
        return res.json(amadeusData);
      } catch (amadeusError) {
        console.error('Amadeus POI API failed, falling back to DB:', amadeusError.message);
      }
    }

    // Fallback: Use MongoDB Data
    const filter = {};
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (travelStyle) filter.travelStyles = travelStyle;
    
    const attractions = await Attraction.find(filter).sort({ priority: -1, rating: -1 });
    res.json(attractions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
