const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  distance: { type: String },
  amenities: [String],
  category: { type: String, enum: ['Budget', 'Standard', 'Luxury'], default: 'Standard' },
  image: { type: String, default: '' },
  address: { type: String },
  phone: { type: String }
});

module.exports = mongoose.model('Hotel', hotelSchema);
