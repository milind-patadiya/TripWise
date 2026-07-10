const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');

// @GET /api/hotels?destination=Goa — PUBLIC (no auth required)
router.get('/', async (req, res) => {
  try {
    const { destination, category } = req.query;
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
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
