const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const Destination = require('../models/Destination');

// @GET /api/search/autocomplete?q=a - instant suggestions for cities/states/countries
// starting with the typed letters (MakeMyTrip-style destination search).
router.get('/autocomplete', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    // Prefix match (starts-with) is what users expect from a travel search box —
    // "A" should show Agra, Amsterdam, Argentina... not things that merely contain "a".
    const regex = new RegExp('^' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [places, seededDestinations] = await Promise.all([
      Place.find({ name: regex }).limit(12).lean(),
      // Also surface any of our own seeded Destination documents that match,
      // so a hit can deep-link straight to a real destination detail page.
      Destination.find({ name: regex }).select('name state country image').limit(6).lean(),
    ]);

    const destIds = new Set(seededDestinations.map(d => d.name.toLowerCase()));

    const results = [
      ...seededDestinations.map(d => ({
        name: d.name,
        type: 'Destination',
        country: d.country,
        state: d.state,
        image: d.image,
        destinationId: d._id,
      })),
      ...places
        .filter(p => !destIds.has(p.name.toLowerCase()))
        .map(p => ({ name: p.name, type: p.type, country: p.country, state: p.state })),
    ].slice(0, 10);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
