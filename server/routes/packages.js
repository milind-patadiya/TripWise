const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/packages
router.get('/', async (req, res, next) => {
  try {
    const { limit = 20, featured, dest } = req.query;
    
    let query = {};
    if (featured === 'true') query.featured = true;
    if (dest) query.destination = dest;

    const packages = await Package.find(query)
      .populate('destination', 'name state')
      .limit(Number(limit))
      .sort({ rating: -1 });

    res.json(packages);
  } catch (error) {
    next(error);
  }
});

// GET /api/packages/:id
router.get('/:id', async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id).populate('destination');
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    next(error);
  }
});

// POST /api/packages (Admin Only)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const pkg = new Package(req.body);
    const createdPackage = await pkg.save();
    res.status(201).json(createdPackage);
  } catch (error) {
    next(error);
  }
});

// PUT /api/packages/:id (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/packages/:id (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({ message: 'Package removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
