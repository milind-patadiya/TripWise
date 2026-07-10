const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Country', 'State', 'City'], required: true },
  country: { type: String, required: true },
  state: { type: String },
});

placeSchema.index({ name: 1 });

module.exports = mongoose.model('Place', placeSchema);
