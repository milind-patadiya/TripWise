const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const User = require('../models/User');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Attraction = require('../models/Attraction');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Notification = require('../models/Notification');

async function exportData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripwise';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const exportDir = path.join(__dirname, 'mongodb-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    const collections = [
      { name: 'users', model: User },
      { name: 'destinations', model: Destination },
      { name: 'hotels', model: Hotel },
      { name: 'attractions', model: Attraction },
      { name: 'packages', model: Package },
      { name: 'bookings', model: Booking },
      { name: 'trips', model: Trip },
      { name: 'notifications', model: Notification },
    ];

    for (const { name, model } of collections) {
      const data = await model.find().lean();
      fs.writeFileSync(path.join(exportDir, `${name}.json`), JSON.stringify(data, null, 2));
      console.log(`Exported ${data.length} records to ${name}.json`);
    }

    console.log('Export complete! Files are saved in server/data/mongodb-export');
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

exportData();
