const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @GET /api/notifications - list current user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @GET /api/notifications/unread-count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/notifications/:id/read - mark one as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/notifications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @DELETE /api/notifications - clear all for current user
router.delete('/', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @POST /api/notifications/broadcast - Admin only: send a promo/system notification to all users
router.post('/broadcast', protect, adminOnly, async (req, res) => {
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

module.exports = router;

// Helper used internally by other routes to create a single notification.
// Not an HTTP endpoint — exported for reuse (e.g. trips.js on booking creation).
module.exports.createNotification = async ({ userId, type, title, message, actionUrl }) => {
  try {
    return await Notification.create({ user: userId, type, title, message, actionUrl });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};
