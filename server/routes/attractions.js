const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');

// @GET /api/attractions?destination=Goa — PUBLIC (no auth required)
router.get('/', async (req, res) => {
  try {
    const { destination, travelStyle } = req.query;
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
