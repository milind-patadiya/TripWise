const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  description: { type: String },
  entryFee: { type: Number, default: 0 },
  openingTime: { type: String },
  closingTime: { type: String },
  category: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  priority: { type: Number, default: 1 },
  image: { type: String, default: '' },
  location: {
    lat: Number,
    lng: Number
  },
  travelStyles: [String]
});

module.exports = mongoose.model('Attraction', attractionSchema);
