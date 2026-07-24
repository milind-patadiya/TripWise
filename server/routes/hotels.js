const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const { amadeus, fetchWithCache } = require('../services/amadeusService');
const axios = require('axios');

// @GET /api/hotels?destination=Goa — PUBLIC
router.get('/', async (req, res) => {
  try {
    const { destination, category } = req.query;
    
    // Attempt Amadeus API integration if destination is provided and API keys exist
    if (destination && process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_KEY !== 'YOUR_AMADEUS_API_KEY_HERE') {
      try {
        const cacheKey = `hotels_${destination}`;
        const amadeusData = await fetchWithCache(cacheKey, async () => {
          // 1. Get City IATA code from keyword
          const cityResponse = await amadeus.referenceData.locations.get({
            keyword: destination,
            subType: 'CITY'
          });
          
          if (!cityResponse.data || cityResponse.data.length === 0) {
            throw new Error('City not found in Amadeus');
          }
          
          const cityCode = cityResponse.data[0].iataCode;
          
          // 2. Get Hotels by City
          const hotelsResponse = await amadeus.referenceData.locations.hotels.byCity.get({
            cityCode: cityCode,
            radius: 5,
            radiusUnit: 'KM'
          });
          
          if (!hotelsResponse.data || hotelsResponse.data.length === 0) {
            throw new Error('No hotels found in this city');
          }
          
          // Limit to 10 hotels to avoid rate limits on pricing API
          const hotelIds = hotelsResponse.data.slice(0, 10).map(h => h.hotelId).join(',');
          
          // 3. Get Hotel Offers (Prices)
          const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
            hotelIds: hotelIds,
            adults: 2
          });
          
          // Map Amadeus response to match frontend expectations
          return offersResponse.data.map((offer, index) => {
            const hotel = offer.hotel;
            const price = offer.offers && offer.offers[0] ? offer.offers[0].price : null;
            
            return {
              _id: hotel.hotelId, // Use Amadeus ID
              name: hotel.name,
              destination: hotel.cityCode, // Could map back to full name if needed
              rating: hotel.rating || Math.floor(Math.random() * 2) + 4, // Amadeus often misses ratings
              pricePerNight: price ? parseFloat(price.total) : 150,
              currency: price ? price.currency : 'USD',
              image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600&sig=${index}`, // Mock image
              amenities: hotel.amenities || ['Wifi', 'Air Conditioning'],
              distance: hotel.distance ? `${hotel.distance.value} ${hotel.distance.unit}` : 'City Center',
              cancellationPolicy: offer.offers?.[0]?.policies?.cancellations?.[0]?.description?.text || 'Standard cancellation policy applies'
            };
          });
        });
        
        return res.json(amadeusData);
      } catch (amadeusError) {
        console.error('Amadeus Hotel API failed, falling back to DB:', amadeusError.message);
        // Fallthrough to DB
      }
    }

    // Fallback: Use MongoDB Data
    const filter = {};
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (category) filter.category = category;
    
    const hotels = await Hotel.find(filter).sort({ rating: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/hotels/:id — PUBLIC
router.get('/:id', async (req, res) => {
  try {
    // If ID looks like Amadeus ID (usually 8 chars alphanumeric)
    if (req.params.id && req.params.id.length < 15 && process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_KEY !== 'YOUR_AMADEUS_API_KEY_HERE') {
      try {
        const cacheKey = `hotel_detail_${req.params.id}`;
        const data = await fetchWithCache(cacheKey, async () => {
           const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
            hotelIds: req.params.id,
            adults: 2
          });
          
          if (!offersResponse.data || offersResponse.data.length === 0) {
            throw new Error('Hotel offer not found');
          }
          
          const offer = offersResponse.data[0];
          const hotel = offer.hotel;
          const price = offer.offers && offer.offers[0] ? offer.offers[0].price : null;
          
          return {
             _id: hotel.hotelId,
              name: hotel.name,
              destination: hotel.cityCode,
              description: hotel.description?.text || 'A beautiful hotel located in the heart of the city.',
              rating: hotel.rating || 4,
              pricePerNight: price ? parseFloat(price.total) : 150,
              currency: price ? price.currency : 'USD',
              image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
              amenities: hotel.amenities || ['Wifi', 'Air Conditioning', 'Pool', 'Restaurant'],
              distance: hotel.distance ? `${hotel.distance.value} ${hotel.distance.unit}` : 'City Center',
              cancellationPolicy: offer.offers?.[0]?.policies?.cancellations?.[0]?.description?.text || 'Standard cancellation policy applies'
          };
        });
        return res.json(data);
      } catch (err) {
         console.error('Amadeus single hotel fetch failed, falling back to DB:', err.message);
      }
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
