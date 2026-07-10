require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');
const places = require('./worldPlaces');

async function seedPlaces() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding places');

    await Place.deleteMany({});
    await Place.insertMany(places);
    console.log(`✅ ${places.length} places seeded (countries, states, cities)`);

    console.log('🎉 Places seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding places:', err.message);
    process.exit(1);
  }
}

seedPlaces();
