const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');
const Hotel = require('../models/Hotel');
const Attraction = require('../models/Attraction');
const Destination = require('../models/Destination');
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const Expense = require('../models/Expense');
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ============================================================
// ENHANCED STATS / DASHBOARD
// ============================================================

// @GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTrips,
      totalDestinations,
      totalBookings,
      totalHotels,
      totalPackages,
      totalAttractions,
      totalPayments,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments({ role: 'traveler' }),
      Trip.countDocuments(),
      Destination.countDocuments(),
      Booking.countDocuments(),
      Hotel.countDocuments(),
      Package.countDocuments(),
      Attraction.countDocuments(),
      Payment.countDocuments(),
      Review.countDocuments(),
    ]);

    // Revenue from bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Booking status breakdown
    const bookingStatusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Payment status breakdown
    const paymentStatusBreakdown = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly user growth (last 6 months)
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'traveler' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent trips
    const recentTrips = await Trip.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .lean();

    // Popular destinations
    const popularDestinations = await Trip.aggregate([
      { $group: { _id: '$destination', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalUsers,
      totalTrips,
      totalDestinations,
      totalBookings,
      totalHotels,
      totalPackages,
      totalAttractions,
      totalPayments,
      totalReviews,
      totalRevenue,
      bookingStatusBreakdown,
      paymentStatusBreakdown,
      monthlyRevenue,
      userGrowth,
      recentBookings,
      recentTrips,
      popularDestinations,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============================================================
// USERS
// ============================================================

// @GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin user' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================
// BOOKINGS
// ============================================================

// @GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/admin/bookings/:id
router.put('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/admin/bookings/:id
router.delete('/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============================================================
// TRIPS
// ============================================================

// @GET /api/admin/trips
router.get('/trips', async (req, res) => {
  try {
    const trips = await Trip.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @PUT /api/admin/trips/:id
router.put('/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('userId', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/admin/trips/:id
router.delete('/trips/:id', async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============================================================
// DESTINATIONS CRUD
// ============================================================

router.get('/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ name: 1 });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/destinations', async (req, res) => {
  try {
    const dest = await Destination.create(req.body);
    res.status(201).json(dest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/destinations/:id', async (req, res) => {
  try {
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    res.json(dest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/destinations/:id', async (req, res) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Destination deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// HOTELS CRUD
// ============================================================

router.get('/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ destination: 1, name: 1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/hotels', async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/hotels/:id', async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// ATTRACTIONS CRUD
// ============================================================

router.get('/attractions', async (req, res) => {
  try {
    const attractions = await Attraction.find().sort({ destination: 1, priority: -1 });
    res.json(attractions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/attractions', async (req, res) => {
  try {
    const attraction = await Attraction.create(req.body);
    res.status(201).json(attraction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/attractions/:id', async (req, res) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attraction) return res.status(404).json({ message: 'Attraction not found' });
    res.json(attraction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/attractions/:id', async (req, res) => {
  try {
    await Attraction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attraction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// PACKAGES CRUD
// ============================================================

router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find()
      .populate('destination', 'name state')
      .sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/packages', async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('destination', 'name state');
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/packages/:id', async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// PAYMENTS
// ============================================================

// @GET /api/admin/payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('booking', 'bookingRef itemName destinationName totalAmount')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/admin/payments/:id
router.put('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', 'name email')
      .populate('booking', 'bookingRef itemName destinationName totalAmount');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============================================================
// NOTIFICATIONS
// ============================================================

// @GET /api/admin/notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/admin/notifications/broadcast
router.post('/notifications/broadcast', async (req, res) => {
  try {
    const { type = 'Promotional', title, message, actionUrl } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    const users = await User.find({ role: 'traveler' }).select('_id');
    const docs = users.map((u) => ({ user: u._id, type, title, message, actionUrl }));
    await Notification.insertMany(docs);
    res.status(201).json({ message: `Notification sent to ${docs.length} users` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/admin/notifications/:id
router.delete('/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============================================================
// REVIEWS
// ============================================================

// @GET /api/admin/reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============================================================
// EXPENSES
// ============================================================

// @GET /api/admin/expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('userId', 'name email')
      .populate('tripId', 'title destination')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============================================================
// ACTIVITY LOGS
// ============================================================

// @GET /api/admin/activity-logs
router.get('/activity-logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
