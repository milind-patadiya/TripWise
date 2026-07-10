// Trigger restart
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin during development to prevent port mismatch issues (e.g., 5173 vs 5174)
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use('/api/', apiLimiter);

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const destinationRoutes = require('./routes/destinations');
const packageRoutes = require('./routes/packages');
const tripRoutes = require('./routes/trips');
const aiRoutes = require('./routes/ai');
const plannerRoutes = require('./routes/planner');
const hotelRoutes = require('./routes/hotels');
const attractionRoutes = require('./routes/attractions');
const expenseRoutes = require('./routes/expenses');
const recommendRoutes = require('./routes/recommendations');
const transportRoutes = require('./routes/transport');
const weatherRoutes = require('./routes/weather');
const notificationRoutes = require('./routes/notifications');
const bookingRoutes = require('./routes/bookings');
const searchRoutes = require('./routes/search');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/recommendations', recommendRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'TripWise API is running',
    geminiConfigured: !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_'),
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('PASTE_YOUR')) {
  console.error('\nMONGO_URI is missing or not configured in server/.env');
  console.error('   Copy server/.env.example to server/.env and set a real MongoDB connection string.');
  console.error('   Get a free one at https://www.mongodb.com/cloud/atlas/register\n');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('\nJWT_SECRET is missing in server/.env — authentication will not work without it.\n');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('   Double check your MONGO_URI in server/.env (username/password, IP whitelist on Atlas).');
    process.exit(1);
  });
