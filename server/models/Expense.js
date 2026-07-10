const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['Hotel', 'Food', 'Transport', 'Attraction', 'Shopping', 'Emergency', 'Other'],
    required: true
  },
  amount: { type: Number, required: true },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
