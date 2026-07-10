const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');
const { sendBookingConfirmation } = require('../utils/communicationService');
const { buildDynamicItinerary } = require('../utils/itineraryBuilder');

// @POST /api/bookings - create a direct booking (Destination / Package / Hotel)
// This is the MakeMyTrip-style direct booking flow — NOT connected to the AI planner.
router.post('/', protect, async (req, res) => {
  try {
    const {
      itemType, itemId, itemName, itemImage, destinationName,
      checkIn, checkOut, travelers, travelerDetails,
      baseFare, taxesAndFees = 0, discount = 0,
    } = req.body;

    if (!itemType || !itemId || !itemName || !destinationName || !checkIn || !baseFare) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const totalAmount = Math.max(0, Number(baseFare) + Number(taxesAndFees) - Number(discount));

    let days = 3; // Default
    if (checkOut && checkIn) {
      const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      days = diffDays > 0 ? diffDays : 1;
    } else if (itemType === 'Package') {
      days = 5; // Default for packages without checkout
    }

    const generatedItinerary = await buildDynamicItinerary(destinationName, days);

    const booking = await Booking.create({
      user: req.user._id,
      itemType, itemId, itemName, itemImage, destinationName,
      checkIn, checkOut, travelers: travelers || 1, travelerDetails,
      baseFare, taxesAndFees, discount, totalAmount,
      itinerary: generatedItinerary
    });

    createNotification({
      userId: req.user._id,
      type: 'Booking',
      title: 'Booking Confirmed',
      message: `Your ${itemType.toLowerCase()} booking for ${itemName} (${destinationName}) is confirmed. Ref: ${booking.bookingRef}`,
      actionUrl: '/dashboard/trips',
    });

    // Send Real Email and SMS
    if (travelerDetails && travelerDetails.email) {
      sendBookingConfirmation(travelerDetails.email, travelerDetails.phone, {
        itemName,
        destinationName,
        checkIn,
        travelers: travelers || 1,
        travelerDetails,
        totalAmount,
        bookingRef: booking.bookingRef,
        itinerary: generatedItinerary
      });
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('BOOKING FAILED WITH BODY:', req.body);
    console.error('ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/bookings/my - current user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'Cancelled', paymentStatus: 'Refunded' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    createNotification({
      userId: req.user._id,
      type: 'Alert',
      title: 'Booking Cancelled',
      message: `Your booking for ${booking.itemName} (Ref: ${booking.bookingRef}) has been cancelled and refunded.`,
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/bookings - ADMIN: all bookings across all users
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
