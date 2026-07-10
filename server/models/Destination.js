const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  description: { type: String },
  image: { type: String },
  images: [String],
  estimatedCostPerDay: { type: Number },
  bestTimeToVisit: { type: String },
  travelStyles: [String],
  travelerTypes: [String],
  popularFor: [String],
  rating: { type: Number, min: 1, max: 5, default: 4 }
});

module.exports = mongoose.model('Destination', destinationSchema);
