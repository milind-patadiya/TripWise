# TripWise Database Schema Documentation

Below are the exact MongoDB collections and Mongoose Schemas used in the TripWise application.

## 1. User Schema (`users`)
Stores both regular traveler and admin accounts.
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: 'default.png' },
  preferences: {
    currency: { type: String, default: 'INR' },
    theme: { type: String, default: 'system' }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 2. Destination Schema (`destinations`)
Stores global travel destinations with metadata.
```javascript
{
  name: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Unsplash URL
  rating: { type: Number, default: 4.5 },
  tags: [{ type: String }],
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  bestTimeToVisit: { type: String }
}
```

## 3. Hotel Schema (`hotels`)
Stores hotel recommendations linked to destinations.
```javascript
{
  name: { type: String, required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  address: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  rating: { type: Number, default: 4.0 },
  amenities: [{ type: String }],
  coordinates: { lat: Number, lng: Number }
}
```

## 4. Trip Schema (`trips`)
Stores user-generated and saved itineraries.
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  destination: { type: String, required: true },
  source: { type: String },
  days: { type: Number, required: true },
  travelers: { type: Number, default: 1 },
  budget: { type: Number, required: true },
  status: { type: String, enum: ['planned', 'ongoing', 'completed'], default: 'planned' },
  itinerary: { type: Object }, // JSON object of the day-by-day AI plan
  createdAt: Date
}
```

## 5. Attraction Schema (`attractions`)
Top sights linked to destinations.
```javascript
{
  name: { type: String, required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  description: { type: String },
  image: { type: String },
  category: { type: String }, // 'Temple', 'Beach', 'Museum', etc.
  entryFee: { type: Number, default: 0 }
}
```
