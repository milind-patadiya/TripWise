const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  stripePaymentIntentId: { type: String },
  status: { type: String, enum: ['Pending', 'Succeeded', 'Failed', 'Refunded'], default: 'Pending' },
  receiptUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
