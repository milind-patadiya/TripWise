const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/destinations
router.get('/', async (req, res, next) => {
  try {
    const { limit = 20, search, state } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }
    if (state) {
      query.state = state;
    }

    const destinations = await Destination.find(query)
      .limit(Number(limit))
      .sort({ rating: -1 });

    res.json(destinations);
  } catch (error) {
    next(error);
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json(destination);
  } catch (error) {
    next(error);
  }
});

// POST /api/destinations (Admin Only)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const destination = new Destination(req.body);
    const createdDestination = await destination.save();
    res.status(201).json(createdDestination);
  } catch (error) {
    next(error);
  }
});

// PUT /api/destinations/:id (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json(destination);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/destinations/:id (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ message: 'Destination removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
