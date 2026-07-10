const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['System', 'Booking', 'Payment', 'Alert', 'Promotional'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  actionUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
