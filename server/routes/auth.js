const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    createNotification({
      userId: user._id,
      type: 'System',
      title: 'Welcome to TripWise! 🎉',
      message: `Hi ${name.split(' ')[0]}, thanks for joining TripWise. Start by exploring destinations or plan your first AI-powered trip.`,
      actionUrl: '/planner/setup'
    });

    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', require('../middleware/authMiddleware').protect, async (req, res) => {
  res.json(req.user);
});

// @PUT /api/auth/profile
router.put('/profile', require('../middleware/authMiddleware').protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('wishlist');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle wishlist item
router.post('/wishlist/:packageId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const packageId = req.params.packageId;
    
    if (user.wishlist.includes(packageId)) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== packageId);
    } else {
      user.wishlist.push(packageId);
    }
    await user.save();
    
    // Return populated user to update state
    const updatedUser = await User.findById(user._id).select('-password').populate('wishlist');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
