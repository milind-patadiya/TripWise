const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

// @POST /api/trips - Create a trip
router.post('/', protect, async (req, res) => {
  try {
    const {
      title, source, destination, budget, days, travelers,
      travelStyle, travelerType, startDate, endDate
    } = req.body;

    // Smart budget allocation
    const budgetAllocation = allocateBudget(budget, travelerType, travelStyle);

    // Generate packing list
    const packingList = generatePackingList(travelStyle, travelerType, days);

    const trip = await Trip.create({
      userId: req.user._id,
      title: title || `Trip to ${destination}`,
      source, destination, budget, days, travelers,
      travelStyle, travelerType, startDate, endDate,
      budgetAllocation, packingList
    });

    // Fire-and-forget: notify the user their trip/itinerary was created
    createNotification({
      userId: req.user._id,
      type: 'Booking',
      title: 'Itinerary Created',
      message: `Your trip to ${trip.destination} (${trip.days} days) has been planned. Budget: ₹${trip.budget?.toLocaleString('en-IN')}.`,
      actionUrl: `/dashboard/trips/${trip._id}`
    });

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/trips - Get all trips for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/trips/:id - Get single trip
router.get('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @PUT /api/trips/:id - Update trip
router.put('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body, { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @DELETE /api/trips/:id - Delete trip
router.delete('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Smart Budget Allocation Engine
function allocateBudget(budget, travelerType, travelStyle) {
  let percentages = { transport: 0.25, hotel: 0.35, food: 0.20, attractions: 0.10, emergency: 0.10 };
  if (travelerType === 'Student') {
    percentages = { transport: 0.30, hotel: 0.30, food: 0.25, attractions: 0.08, emergency: 0.07 };
  } else if (travelerType === 'Family') {
    percentages = { transport: 0.25, hotel: 0.35, food: 0.22, attractions: 0.10, emergency: 0.08 };
  } else if (travelerType === 'Couple') {
    percentages = { transport: 0.22, hotel: 0.38, food: 0.20, attractions: 0.12, emergency: 0.08 };
  }
  if (travelStyle === 'Adventure') percentages.attractions += 0.05, percentages.hotel -= 0.05;
  if (travelStyle === 'Relaxation') percentages.hotel += 0.05, percentages.attractions -= 0.05;

  return {
    transport: Math.round(budget * percentages.transport),
    hotel: Math.round(budget * percentages.hotel),
    food: Math.round(budget * percentages.food),
    attractions: Math.round(budget * percentages.attractions),
    emergency: Math.round(budget * percentages.emergency)
  };
}

// Smart Packing List Generator
function generatePackingList(travelStyle, travelerType, days) {
  const base = ['ID Proof', 'Cash', 'Phone Charger', 'Medicines', 'Water Bottle', 'Sunscreen'];
  const styleItems = {
    Adventure: ['Trekking Shoes', 'Backpack', 'Rain Jacket', 'First Aid Kit', 'Torch', 'Rope'],
    Nature: ['Binoculars', 'Camera', 'Insect Repellent', 'Hat', 'Comfortable Shoes'],
    Religious: ['Traditional Clothes', 'Scarf/Dupatta', 'Comfortable Footwear', 'Offering Items'],
    Relaxation: ['Casual Clothes', 'Sunglasses', 'Beach Wear', 'Books', 'Earphones'],
    Cultural: ['Smart Casual Clothes', 'Camera', 'Notebook', 'Comfortable Walking Shoes']
  };
  const typeItems = {
    Student: ['Student ID', 'Budget Snacks', 'Power Bank'],
    Family: ['Kids Snacks', 'Baby Essentials', 'Family Documents', 'Extra Medicines'],
    Couple: ['Couple Accessories', 'Camera', 'Romantic Essentials'],
    Solo: ['Solo Safety Alarm', 'Journal', 'Portable Charger']
  };
  if (days > 3) base.push('Extra Clothes', 'Laundry Bag');
  return [...new Set([...base, ...(styleItems[travelStyle] || []), ...(typeItems[travelerType] || [])])];
}

module.exports = router;
