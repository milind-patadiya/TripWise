const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  durationDays: { type: Number, required: true },
  durationNights: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  description: { type: String, required: true },
  image: { type: String, required: true },
  images: [String],
  inclusions: [String], // e.g. Flights, Hotels, Transfers, Meals
  tags: [String], // e.g. Honeymoon, Adventure, Family
  rating: { type: Number, min: 1, max: 5, default: 4 },
  reviewsCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
