const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { protect } = require('../middleware/authMiddleware');

// @GET /api/recommendations/destinations
router.get('/destinations', protect, async (req, res) => {
  try {
    const { budget, days, travelStyle, travelerType } = req.query;
    const maxCostPerDay = budget / days;
    const filter = {};
    if (travelStyle) filter.travelStyles = travelStyle;
    if (travelerType) filter.travelerTypes = travelerType;

    let destinations = await Destination.find(filter);

    // Filter by budget per day
    if (maxCostPerDay) {
      destinations = destinations.filter(d => d.estimatedCostPerDay <= maxCostPerDay * 1.3);
    }

    // Sort by rating
    destinations.sort((a, b) => b.rating - a.rating);

    res.json(destinations.slice(0, 6));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/recommendations/transport
router.get('/transport', protect, async (req, res) => {
  try {
    const { source, destination, travelers } = req.query;
    const n = parseInt(travelers) || 1;

    // Smart transport options based on route
    const options = [
      {
        type: 'Bus',
        icon: '🚌',
        costPerPerson: Math.floor(Math.random() * 800) + 200,
        duration: `${Math.floor(Math.random() * 8) + 4}h ${Math.floor(Math.random() * 60)}m`,
        comfort: 'Economy',
        availability: 'High',
        recommended: travelerType === 'Student'
      },
      {
        type: 'Train',
        icon: '🚂',
        costPerPerson: Math.floor(Math.random() * 1200) + 400,
        duration: `${Math.floor(Math.random() * 10) + 6}h`,
        comfort: 'Standard',
        availability: 'Medium',
        recommended: true
      },
      {
        type: 'Flight',
        icon: '✈️',
        costPerPerson: Math.floor(Math.random() * 5000) + 2500,
        duration: `${Math.floor(Math.random() * 2) + 1}h ${Math.floor(Math.random() * 60)}m`,
        comfort: 'Premium',
        availability: 'High',
        recommended: false
      },
      {
        type: 'Cab',
        icon: '🚗',
        costPerPerson: Math.floor(Math.random() * 2000) + 1000,
        duration: `${Math.floor(Math.random() * 6) + 3}h`,
        comfort: 'Comfortable',
        availability: 'Very High',
        recommended: travelerType === 'Family'
      }
    ];

    res.json(options.map(o => ({ ...o, totalCost: o.costPerPerson * n })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/recommendations/food
router.get('/food', protect, async (req, res) => {
  try {
    const { days, travelers, travelerType } = req.query;
    const n = parseInt(travelers) || 1;
    const d = parseInt(days) || 1;

    const foodOptions = [
      { category: 'Budget', icon: '🍱', costPerPersonPerDay: 300, description: 'Local dhabas, street food, budget restaurants' },
      { category: 'Veg', icon: '🥗', costPerPersonPerDay: 500, description: 'Vegetarian restaurants, thalis, healthy options' },
      { category: 'Non-Veg', icon: '🍗', costPerPersonPerDay: 700, description: 'Multi-cuisine, non-veg restaurants, local specialties' },
      { category: 'Luxury', icon: '🍽️', costPerPersonPerDay: 1500, description: 'Fine dining, hotel restaurants, premium cuisine' }
    ];

    res.json(foodOptions.map(o => ({
      ...o,
      totalCost: o.costPerPersonPerDay * n * d
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
