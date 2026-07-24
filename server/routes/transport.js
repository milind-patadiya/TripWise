const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { amadeus, fetchWithCache } = require('../services/amadeusService');

// @GET /api/transport/search
router.get('/search', protect, async (req, res) => {
  const { origin, destination, date, passengers } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ message: 'Origin, destination, and date are required.' });
  }

  try {
    const cityToIata = {
      'new delhi': 'DEL', 'mumbai': 'BOM', 'goa': 'GOI', 'bangalore': 'BLR',
      'chennai': 'MAA', 'kolkata': 'CCU', 'hyderabad': 'HYD', 'jaipur': 'JAI',
      'santorini': 'JTR', 'kyoto': 'ITM', 'bali': 'DPS', 'dubai': 'DXB', 'male': 'MLE'
    };
    
    // In a real app, use Geocoding/Amadeus City Search for dynamic IATA codes
    const originCode = cityToIata[origin.toLowerCase()] || origin;
    const destCode = cityToIata[destination.toLowerCase()] || destination;

    if (!process.env.AMADEUS_API_KEY || process.env.AMADEUS_API_KEY === 'YOUR_AMADEUS_API_KEY_HERE') {
      const mockFlights = [
        {
          id: 'mock-1',
          airline: 'IndiGo',
          logo: 'https://images.kiwi.com/airlines/64/6E.png',
          departure: '08:30 AM',
          arrival: '11:00 AM',
          duration: '2h 30m',
          stops: 'Non-stop',
          price: 5400,
          type: 'Economy'
        },
        {
          id: 'mock-2',
          airline: 'Vistara',
          logo: 'https://images.kiwi.com/airlines/64/UK.png',
          departure: '10:15 AM',
          arrival: '01:00 PM',
          duration: '2h 45m',
          stops: 'Non-stop',
          price: 6200,
          type: 'Premium Economy'
        },
        {
          id: 'mock-3',
          airline: 'Air India',
          logo: 'https://images.kiwi.com/airlines/64/AI.png',
          departure: '02:00 PM',
          arrival: '04:45 PM',
          duration: '2h 45m',
          stops: 'Non-stop',
          price: 4800,
          type: 'Economy'
        }
      ];
      return res.json({ flights: mockFlights, trains: [], buses: [] });
    }

    const cacheKey = `flights_${originCode}_${destCode}_${date}_${passengers || 1}`;
    
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: originCode,
        destinationLocationCode: destCode,
        departureDate: date,
        adults: passengers || 1,
        currencyCode: 'INR', // Amadeus SDK uses currencyCode instead of currency
        max: 10
      });
      
      const flightData = response.data;
      const dictionaries = response.result.dictionaries;

      return flightData.map(offer => {
        const segment = offer.itineraries[0].segments[0];
        const airlineCode = segment.carrierCode;
        return {
          id: offer.id,
          airline: dictionaries.carriers[airlineCode] || airlineCode,
          logo: `https://images.kiwi.com/airlines/64/${airlineCode}.png`,
          departure: new Date(segment.departure.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          arrival: new Date(segment.arrival.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          duration: offer.itineraries[0].duration.replace('PT', '').toLowerCase(),
          stops: offer.itineraries[0].segments.length > 1 ? `${offer.itineraries[0].segments.length - 1} Stop(s)` : 'Non-stop',
          price: parseInt(offer.price.total),
          type: offer.travelerPricings[0].fareDetailsBySegment[0].cabin || 'Economy'
        };
      });
    }, 1800); // 30 minutes cache

    return res.json({ flights: data, trains: [], buses: [] });
  } catch (error) {
    console.error('Transport API Error:', error.message);
    return res.status(503).json({ 
      message: 'No live transport data is available at the moment. Please try again later.' 
    });
  }
});

module.exports = router;
