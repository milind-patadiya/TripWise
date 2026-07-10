const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');
const Hotel = require('../models/Hotel');
const Attraction = require('../models/Attraction');
const Destination = require('../models/Destination');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// @GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'traveler' });
    const totalTrips = await Trip.countDocuments();
    const totalDestinations = await Destination.countDocuments();
    const recentTrips = await Trip.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email');
    const popularDestinations = await Trip.aggregate([
      { $group: { _id: '$destination', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    res.json({ totalUsers, totalTrips, totalDestinations, recentTrips, popularDestinations });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'traveler' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/admin/trips
router.get('/trips', async (req, res) => {
  try {
    const trips = await Trip.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- Destinations CRUD ----
router.get('/destinations', async (req, res) => {
  const destinations = await Destination.find().sort({ name: 1 });
  res.json(destinations);
});
router.post('/destinations', async (req, res) => {
  try {
    const dest = await Destination.create(req.body);
    res.status(201).json(dest);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/destinations/:id', async (req, res) => {
  try {
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(dest);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/destinations/:id', async (req, res) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Destination deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- Hotels CRUD ----
router.get('/hotels', async (req, res) => {
  const hotels = await Hotel.find().sort({ destination: 1, name: 1 });
  res.json(hotels);
});
router.post('/hotels', async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hotel);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/hotels/:id', async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hotel deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- Attractions CRUD ----
router.get('/attractions', async (req, res) => {
  const attractions = await Attraction.find().sort({ destination: 1, priority: -1 });
  res.json(attractions);
});
router.post('/attractions', async (req, res) => {
  try {
    const attraction = await Attraction.create(req.body);
    res.status(201).json(attraction);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/attractions/:id', async (req, res) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(attraction);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/attractions/:id', async (req, res) => {
  try {
    await Attraction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attraction deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
