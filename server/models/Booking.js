const mongoose = require('mongoose');

// A real, DIRECT booking (Destination / Package / Hotel) made straight from
// the browse pages via "Book Now" -> Checkout. Completely independent of
// the AI Trip Planner's `Trip` model — a user should never be forced through
// AI planning just to book something.
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  itemType: { type: String, enum: ['Destination', 'Package', 'Hotel'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemName: { type: String, required: true },
  itemImage: { type: String },
  destinationName: { type: String, required: true },

  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  travelers: { type: Number, default: 1, min: 1 },

  travelerDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },

  baseFare: { type: Number, required: true },
  taxesAndFees: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  itinerary: [{
    day: Number,
    theme: String,
    morning: String,
    afternoon: String,
    evening: String
  }],

  bookingRef: { type: String, unique: true },
  status: { type: String, enum: ['Confirmed', 'Cancelled', 'Completed'], default: 'Confirmed' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Refunded'], default: 'Paid' },
}, { timestamps: true });

bookingSchema.pre('save', function () {
  if (!this.bookingRef) {
    this.bookingRef = 'TW' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
