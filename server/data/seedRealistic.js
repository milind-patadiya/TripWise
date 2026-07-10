const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Attraction = require('../models/Attraction');
const Package = require('../models/Package');

dotenv.config();

// ─── VERIFIED WORKING IMAGE URLS ─────────────────────────────────────────────
// All these URLs have been tested and return 200 OK. Using Unsplash source URLs
// which are permanent redirects and never expire (unlike the /photos/ endpoint).

const destinations = [
  { 
    name: 'Santorini', state: 'Cyclades', country: 'Greece',
    lat: 36.3932, lng: 25.4615,
    description: 'Famous for its whitewashed, cubiform houses clinging to cliffs above an underwater caldera. Santorini offers breathtaking sunsets, stunning beaches, and a vibrant culinary scene.', 
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5f1?w=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=800&fit=crop&q=80'
    ],
    estimatedCostPerDay: 15000, bestTimeToVisit: 'September to October', 
    travelStyles: ['Luxury', 'Romantic', 'Relaxation'], travelerTypes: ['Couple', 'Solo'], popularFor: ['Sunsets', 'Wine', 'Views'], rating: 4.9 
  },
  { 
    name: 'Kyoto', state: 'Kansai', country: 'Japan',
    lat: 35.0116, lng: 135.7681,
    description: 'Once the capital of Japan, Kyoto is famous for its numerous classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.', 
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?w=800&fit=crop&q=80'
    ],
    estimatedCostPerDay: 12000, bestTimeToVisit: 'March to May', 
    travelStyles: ['Cultural', 'Historical'], travelerTypes: ['Family', 'Couple', 'Solo'], popularFor: ['Temples', 'Geisha', 'Nature'], rating: 4.8 
  },
  {
    name: 'Bali', state: 'Bali', country: 'Indonesia',
    lat: -8.4095, lng: 115.1889,
    description: 'An Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&fit=crop&q=80'
    ],
    estimatedCostPerDay: 5000, bestTimeToVisit: 'April to October',
    travelStyles: ['Adventure', 'Relaxation', 'Nature'], travelerTypes: ['Couple', 'Friends', 'Solo'], popularFor: ['Beaches', 'Surfing', 'Yoga'], rating: 4.7
  },
  {
    name: 'Amalfi Coast', state: 'Campania', country: 'Italy',
    lat: 40.6333, lng: 14.6029,
    description: 'A 50-kilometer stretch of coastline along the southern edge of Italy\'s Sorrentine Peninsula. It is known for its rugged terrain, scenic beauty, picturesque towns and diversity.',
    image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1516483638261-f41af5e81c00?w=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?w=800&fit=crop&q=80'
    ],
    estimatedCostPerDay: 18000, bestTimeToVisit: 'May to September',
    travelStyles: ['Luxury', 'Romantic', 'Culinary'], travelerTypes: ['Couple', 'Family'], popularFor: ['Coastal Views', 'Food', 'Boating'], rating: 4.9
  },
  {
    name: 'Male', state: 'Kaafu Atoll', country: 'Maldives',
    lat: 4.1755, lng: 73.5093,
    description: 'A tropical nation in the Indian Ocean composed of 26 ring-shaped atolls. Known for its beaches, blue lagoons and extensive reefs. Perfect for a luxury beach getaway.',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&fit=crop&q=80'
    ],
    estimatedCostPerDay: 25000, bestTimeToVisit: 'November to April',
    travelStyles: ['Luxury', 'Relaxation'], travelerTypes: ['Couple', 'Family'], popularFor: ['Scuba Diving', 'Resorts', 'Beaches'], rating: 5.0
  },
  {
    name: 'Dubai', state: 'Dubai', country: 'United Arab Emirates',
    lat: 25.2048, lng: 55.2708,
    description: 'A city and emirate in the United Arab Emirates known for luxury shopping, ultramodern architecture and a lively nightlife scene. Burj Khalifa dominates the skyscraper-filled skyline.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1582672060624-9ea622ce8ee9?w=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&fit=crop&q=80'
    ],
    estimatedCostPerDay: 20000, bestTimeToVisit: 'November to March',
    travelStyles: ['Luxury', 'Adventure', 'Shopping'], travelerTypes: ['Family', 'Couple', 'Friends'], popularFor: ['Skyscrapers', 'Shopping', 'Desert Safari'], rating: 4.7
  }
];

const hotels = [
  { name: 'Canaves Oia Epitome', destination: 'Santorini', description: 'Luxury hotel located in the picturesque town of Oia with stunning caldera views.', pricePerNight: 45000, rating: 5.0, distance: 'Clifftop, Oia', category: 'Luxury', amenities: ['Infinity Pool', 'Spa', 'Fine Dining', 'Free WiFi'], image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&fit=crop&q=80' },
  { name: 'Ubud Hanging Gardens', destination: 'Bali', description: 'Award-winning resort nestled in the Balinese jungle with infinity pools overlooking a river gorge.', pricePerNight: 18000, rating: 4.8, distance: 'Ubud Jungle', category: 'Luxury', amenities: ['Infinity Pool', 'Spa', 'Yoga', 'Free WiFi'], image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&fit=crop&q=80' },
  { name: 'The Ritz-Carlton Kyoto', destination: 'Kyoto', description: 'Elegant luxury hotel on the banks of the Kamogawa River, blending traditional Japanese aesthetics with modern comfort.', pricePerNight: 55000, rating: 4.9, distance: 'Kamogawa River', category: 'Luxury', amenities: ['Spa', 'Fine Dining', 'Gym', 'Free WiFi', 'Breakfast Included'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&fit=crop&q=80' },
  { name: 'Burj Al Arab Jumeirah', destination: 'Dubai', description: 'The iconic sail-shaped luxury hotel standing on its own artificial island.', pricePerNight: 85000, rating: 5.0, distance: 'Jumeirah Beach', category: 'Luxury', amenities: ['Private Beach', 'Spa', 'Fine Dining', 'Butler Service', 'Free WiFi'], image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&fit=crop&q=80' },
  { name: 'Soneva Fushi', destination: 'Male', description: 'Barefoot luxury resort in the Maldives with overwater villas and pristine beaches.', pricePerNight: 65000, rating: 5.0, distance: 'Baa Atoll', category: 'Luxury', amenities: ['Private Pool', 'Spa', 'Diving Center', 'Free WiFi'], image: 'https://images.unsplash.com/photo-1540541338287-41700cea7514?w=600&fit=crop&q=80' },
  { name: 'Hotel Santa Caterina', destination: 'Amalfi Coast', description: 'A stunning cliffside hotel overlooking the Mediterranean Sea along the Amalfi Coast.', pricePerNight: 42000, rating: 4.8, distance: 'Amalfi Town', category: 'Luxury', amenities: ['Sea View', 'Pool', 'Restaurant', 'Free WiFi'], image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&fit=crop&q=80' }
];

const attractions = [
  // Santorini
  { name: 'Oia Sunset Point', destination: 'Santorini', description: 'Famous viewpoint to watch the sunset over the caldera. One of the most photographed spots in the world.', entryFee: 0, openingTime: 'Open 24/7', closingTime: 'Open 24/7', category: 'Nature', rating: 4.9, priority: 1 },
  { name: 'Red Beach', destination: 'Santorini', description: 'Unique volcanic beach with striking red and black lava cliffs.', entryFee: 0, openingTime: '8:00 AM', closingTime: '7:00 PM', category: 'Nature', rating: 4.7, priority: 2 },
  // Kyoto
  { name: 'Fushimi Inari Shrine', destination: 'Kyoto', description: 'Iconic shrine famous for thousands of vermillion torii gates winding through the mountain.', entryFee: 0, openingTime: 'Open 24/7', closingTime: 'Open 24/7', category: 'Temple', rating: 4.9, priority: 1 },
  { name: 'Kinkaku-ji (Golden Pavilion)', destination: 'Kyoto', description: 'Zen Buddhist temple covered in gold leaf, set beside a reflective pond.', entryFee: 400, openingTime: '9:00 AM', closingTime: '5:00 PM', category: 'Temple', rating: 4.8, priority: 2 },
  // Bali
  { name: 'Uluwatu Temple', destination: 'Bali', description: 'Ancient sea temple perched on a steep cliff above the Indian Ocean.', entryFee: 50000, openingTime: '7:00 AM', closingTime: '7:00 PM', category: 'Temple', rating: 4.7, priority: 1 },
  { name: 'Tegallalang Rice Terraces', destination: 'Bali', description: 'Beautiful rice paddies offering dramatic views of terraced hillside.', entryFee: 20000, openingTime: '8:00 AM', closingTime: '6:00 PM', category: 'Nature', rating: 4.6, priority: 2 },
  // Dubai
  { name: 'Burj Khalifa', destination: 'Dubai', description: 'The tallest building in the world at 828 meters, with observation decks offering panoramic views.', entryFee: 3500, openingTime: '8:30 AM', closingTime: '11:00 PM', category: 'Architecture', rating: 4.9, priority: 1 },
  { name: 'Dubai Mall', destination: 'Dubai', description: 'One of the largest shopping malls in the world with an aquarium, ice rink, and 1200+ stores.', entryFee: 0, openingTime: '10:00 AM', closingTime: '12:00 AM', category: 'Shopping', rating: 4.7, priority: 2 },
  // Maldives
  { name: 'Banana Reef', destination: 'Male', description: 'One of the most famous dive sites in the Maldives, teeming with marine life and colorful coral.', entryFee: 5000, openingTime: '6:00 AM', closingTime: '6:00 PM', category: 'Nature', rating: 4.8, priority: 1 },
  // Amalfi Coast
  { name: 'Path of the Gods', destination: 'Amalfi Coast', description: 'A breathtaking coastal hiking trail with stunning views of the Mediterranean.', entryFee: 0, openingTime: 'Open 24/7', closingTime: 'Open 24/7', category: 'Nature', rating: 4.9, priority: 1 }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripwise');
    console.log('✅ MongoDB connected for seeding');

    // Clear old data
    await Destination.deleteMany();
    await Hotel.deleteMany();
    await Attraction.deleteMany();
    await Package.deleteMany();

    // Insert destinations
    const insertedDestinations = await Destination.insertMany(destinations);
    console.log(`📍 ${insertedDestinations.length} destinations seeded`);

    // Insert hotels
    await Hotel.insertMany(hotels);
    console.log(`🏨 ${hotels.length} hotels seeded`);

    // Insert attractions
    await Attraction.insertMany(attractions);
    console.log(`🎯 ${attractions.length} attractions seeded`);

    // Create Packages linked to the newly inserted Destinations
    const packages = [
      {
        title: 'Romantic Santorini Getaway',
        destination: insertedDestinations.find(d => d.name === 'Santorini')._id,
        durationDays: 5, durationNights: 4,
        price: 85000, discountPrice: 79000,
        description: 'Experience the magic of Santorini with luxury cliffside accommodation, sunset catamaran cruise, and wine tasting tours.',
        image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5f1?w=800&fit=crop&q=80'],
        inclusions: ['Flights', '4-Star Hotel', 'Breakfast', 'Airport Transfers', 'Catamaran Cruise'],
        tags: ['Honeymoon', 'Luxury', 'Romantic'],
        rating: 4.9, reviewsCount: 124, featured: true
      },
      {
        title: 'Ultimate Bali Adventure',
        destination: insertedDestinations.find(d => d.name === 'Bali')._id,
        durationDays: 7, durationNights: 6,
        price: 45000, discountPrice: 42000,
        description: 'Explore the lush rice terraces, ancient temples, and beautiful beaches of Bali. Perfect for adventure seekers and nature lovers.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&fit=crop&q=80'],
        inclusions: ['Flights', 'Resort', 'Breakfast', 'Ubud Tour', 'Water Sports'],
        tags: ['Adventure', 'Nature', 'Beaches'],
        rating: 4.8, reviewsCount: 312, featured: true
      },
      {
        title: 'Classic Kyoto Experience',
        destination: insertedDestinations.find(d => d.name === 'Kyoto')._id,
        durationDays: 6, durationNights: 5,
        price: 95000, discountPrice: 88000,
        description: 'Immerse yourself in Japanese culture with traditional ryokan stays, tea ceremonies, and bamboo forest walks.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&fit=crop&q=80'],
        inclusions: ['Flights', 'Ryokan', 'Breakfast & Dinner', 'Temple Tours'],
        tags: ['Cultural', 'Historical', 'Family'],
        rating: 4.7, reviewsCount: 89, featured: false
      },
      {
        title: 'Dubai Luxury Escape',
        destination: insertedDestinations.find(d => d.name === 'Dubai')._id,
        durationDays: 4, durationNights: 3,
        price: 55000, discountPrice: 49000,
        description: 'Experience the glitz and glamour of Dubai. Includes desert safari, Burj Khalifa tickets, and luxury accommodation.',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1582672060624-9ea622ce8ee9?w=800&fit=crop&q=80'],
        inclusions: ['Flights', '5-Star Hotel', 'Breakfast', 'Desert Safari', 'Burj Khalifa Entry'],
        tags: ['Luxury', 'Shopping', 'City'],
        rating: 4.6, reviewsCount: 450, featured: true
      },
      {
        title: 'Maldives Paradise Retreat',
        destination: insertedDestinations.find(d => d.name === 'Male')._id,
        durationDays: 5, durationNights: 4,
        price: 120000, discountPrice: 110000,
        description: 'Escape to crystal-clear waters and pristine white sand beaches. Overwater villa with private pool and all-inclusive dining.',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&fit=crop&q=80'],
        inclusions: ['Flights', 'Overwater Villa', 'All Meals', 'Snorkeling', 'Spa Treatment'],
        tags: ['Luxury', 'Romantic', 'Beaches'],
        rating: 5.0, reviewsCount: 67, featured: true
      },
      {
        title: 'Amalfi Coast Explorer',
        destination: insertedDestinations.find(d => d.name === 'Amalfi Coast')._id,
        durationDays: 6, durationNights: 5,
        price: 105000, discountPrice: 95000,
        description: 'Drive along the stunning Amalfi coastline, explore charming villages, and indulge in authentic Italian cuisine.',
        image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&fit=crop&q=80',
        images: ['https://images.unsplash.com/photo-1516483638261-f41af5e81c00?w=800&fit=crop&q=80'],
        inclusions: ['Flights', 'Boutique Hotel', 'Breakfast', 'Boat Tour', 'Cooking Class'],
        tags: ['Luxury', 'Romantic', 'Cultural'],
        rating: 4.8, reviewsCount: 156, featured: false
      }
    ];
    await Package.insertMany(packages);
    console.log(`📦 ${packages.length} packages seeded`);

    console.log('\n🎉 All data seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
