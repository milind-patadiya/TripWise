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
      .sort({ rating: -1 })
      .lean(); // Use lean to easily modify the result

    // Dynamically adjust price based on live Amadeus data (simulating a dynamic package)
    if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_KEY !== 'YOUR_AMADEUS_API_KEY_HERE') {
      const { amadeus, fetchWithCache } = require('../services/amadeusService');
      const axios = require('axios');
      
      const enrichedPackages = await Promise.all(packages.map(async (pkg) => {
        try {
          if (!pkg.destination || !pkg.destination.name) return pkg;
          
          const cacheKey = `package_price_${pkg.destination.name}`;
          const dynamicAddOn = await fetchWithCache(cacheKey, async () => {
             // 1. Geocode to get City code (mocking with standard cities for speed in this demo)
             const destName = pkg.destination.name.toLowerCase();
             const cityToIata = {
                'new delhi': 'DEL', 'mumbai': 'BOM', 'goa': 'GOI', 'bangalore': 'BLR',
                'santorini': 'JTR', 'kyoto': 'ITM', 'bali': 'DPS', 'dubai': 'DXB', 'male': 'MLE'
             };
             const destCode = cityToIata[destName] || 'DEL'; // Fallback to DEL
             
             // Get flights for next month
             const d = new Date();
             d.setDate(d.getDate() + 30);
             const dateStr = d.toISOString().split('T')[0];
             
             const flightRes = await amadeus.shopping.flightOffersSearch.get({
                originLocationCode: 'BOM', // Assuming user originates from BOM for the package
                destinationLocationCode: destCode,
                departureDate: dateStr,
                adults: 1,
                max: 1
             });
             
             if (flightRes.data && flightRes.data.length > 0) {
                 return parseInt(flightRes.data[0].price.total); // Flight cost
             }
             return 5000; // default addon
          }, 3600); // 1 hour cache
          
          // Dynamically set price
          pkg.discountPrice = pkg.price; // Base hotel + activities
          pkg.price = pkg.price + dynamicAddOn; // Base + Live Flight
          pkg.inclusions = [...new Set([...(pkg.inclusions || []), 'Live Flight Pricing'])];
          
          return pkg;
        } catch (err) {
          console.error(`Dynamic pricing failed for ${pkg.title}:`, err.message);
          return pkg;
        }
      }));
      return res.json(enrichedPackages);
    }

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
