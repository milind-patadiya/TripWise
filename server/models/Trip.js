const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  budget: { type: Number, required: true },
  days: { type: Number, required: true },
  travelers: { type: Number, default: 1 },
  travelStyle: {
    type: String,
    enum: ['Adventure', 'Nature', 'Religious', 'Relaxation', 'Cultural'],
    required: true
  },
  travelerType: {
    type: String,
    enum: ['Student', 'Family', 'Couple', 'Solo'],
    required: true
  },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['planned', 'ongoing', 'completed'], default: 'planned' },
  budgetAllocation: {
    transport: Number,
    hotel: Number,
    food: Number,
    attractions: Number,
    emergency: Number
  },
  selectedHotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  selectedTransport: { type: String },
  itinerary: [{ day: Number, activities: [String] }],
  packingList: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);
