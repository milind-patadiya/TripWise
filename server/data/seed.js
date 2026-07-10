const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Attraction = require('../models/Attraction');

const destinations = [
  {
    name: 'Goa',
    state: 'Goa',
    country: 'India',
    lat: 15.2993,
    lng: 74.1240,
    description: 'Beach paradise with vibrant nightlife, Portuguese heritage, and golden sands. Famous for its pristine beaches, water sports, seafood cuisine, and the laid-back Susegad lifestyle.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 2500,
    bestTimeToVisit: 'November to February',
    travelStyles: ['Relaxation', 'Adventure', 'Cultural'],
    travelerTypes: ['Couple', 'Solo', 'Family'],
    popularFor: ['Beaches', 'Nightlife', 'Water Sports'],
    rating: 4.8
  },
  {
    name: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    lat: 32.2396,
    lng: 77.1887,
    description: 'Snow-capped peaks, adventure sports, and scenic Himalayan beauty. A perfect getaway for nature lovers with lush valleys, ancient temples, and thrilling activities.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585510466645-a648e51e5fb5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 2000,
    bestTimeToVisit: 'October to June',
    travelStyles: ['Adventure', 'Nature', 'Relaxation'],
    travelerTypes: ['Couple', 'Solo', 'Family'],
    popularFor: ['Trekking', 'Snow', 'Rohtang Pass'],
    rating: 4.7
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    lat: 26.9124,
    lng: 75.7873,
    description: 'The Pink City with majestic forts, palaces, and rich Rajput culture. Known for its stunning architecture, colorful bazaars, traditional cuisine, and royal heritage.',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1800,
    bestTimeToVisit: 'October to March',
    travelStyles: ['Cultural', 'Religious', 'Nature'],
    travelerTypes: ['Family', 'Couple', 'Solo', 'Student'],
    popularFor: ['Amber Fort', 'Hawa Mahal', 'Shopping'],
    rating: 4.6
  },
  {
    name: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    lat: 24.5854,
    lng: 73.7125,
    description: 'City of Lakes with royal heritage, romantic sunsets, and grand palaces. Often called the Venice of the East, it captivates with its lakeside charm and regal architecture.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e13?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 2000,
    bestTimeToVisit: 'September to March',
    travelStyles: ['Cultural', 'Relaxation', 'Religious'],
    travelerTypes: ['Couple', 'Family', 'Solo'],
    popularFor: ['Lake Pichola', 'City Palace', 'Boat Rides'],
    rating: 4.7
  },
  {
    name: 'Kerala',
    state: 'Kerala',
    country: 'India',
    lat: 10.8505,
    lng: 76.2711,
    description: "God's Own Country with backwaters, houseboats, and lush green nature. Renowned for Ayurvedic wellness, spice plantations, and serene tropical landscapes.",
    image: 'https://images.unsplash.com/photo-1602158123929-22876e1a4c74?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1602158123929-22876e1a4c74?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1609340667460-0dc82fc4a0b9?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 2200,
    bestTimeToVisit: 'September to March',
    travelStyles: ['Nature', 'Relaxation', 'Cultural'],
    travelerTypes: ['Couple', 'Family', 'Solo'],
    popularFor: ['Backwaters', 'Alleppey', 'Munnar'],
    rating: 4.8
  },
  {
    name: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 27.1767,
    lng: 78.0081,
    description: 'Home to the iconic Taj Mahal, one of the Seven Wonders of the World. A city steeped in Mughal history with stunning monuments, marble crafts, and rich cuisine.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515091943-9d5c0ad475af?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1500,
    bestTimeToVisit: 'October to March',
    travelStyles: ['Cultural', 'Religious'],
    travelerTypes: ['Family', 'Couple', 'Student', 'Solo'],
    popularFor: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri'],
    rating: 4.5
  },
  {
    name: 'Darjeeling',
    state: 'West Bengal',
    country: 'India',
    lat: 27.0360,
    lng: 88.2627,
    description: 'Queen of the Hills with tea gardens, toy trains, and Himalayan panoramas. A colonial-era hill station famous for its sunrise views of Kanchenjunga.',
    image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1622308644420-b20142dc993c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544634076-a90160ddf44e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1800,
    bestTimeToVisit: 'March to May, September to November',
    travelStyles: ['Nature', 'Adventure', 'Relaxation'],
    travelerTypes: ['Couple', 'Solo', 'Family'],
    popularFor: ['Tea Gardens', 'Tiger Hill', 'Toy Train'],
    rating: 4.5
  },
  {
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.3176,
    lng: 82.9739,
    description: 'Spiritual capital of India on the banks of the holy Ganga. One of the oldest continuously inhabited cities in the world, renowned for its evening Ganga Aarti ceremony.',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1627894006066-b45e74e0dda8?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1200,
    bestTimeToVisit: 'October to March',
    travelStyles: ['Religious', 'Cultural'],
    travelerTypes: ['Family', 'Solo', 'Student'],
    popularFor: ['Ganga Aarti', 'Ghats', 'Temples'],
    rating: 4.4
  },
  {
    name: 'Rishikesh',
    state: 'Uttarakhand',
    country: 'India',
    lat: 30.0869,
    lng: 78.2676,
    description: 'Yoga capital of the world with river rafting and spiritual retreats. Nestled in the Himalayan foothills along the sacred Ganges, offering adventure and peace in equal measure.',
    image: 'https://images.unsplash.com/photo-1600089769887-7fbe4e7fa280?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1600089769887-7fbe4e7fa280?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583396618422-23253b7599a1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1588842725786-f697acdb70c0?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1500,
    bestTimeToVisit: 'September to June',
    travelStyles: ['Adventure', 'Religious', 'Nature'],
    travelerTypes: ['Solo', 'Couple', 'Student'],
    popularFor: ['River Rafting', 'Yoga', 'Bungee Jumping'],
    rating: 4.6
  },
  {
    name: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    lat: 31.1048,
    lng: 77.1734,
    description: 'Former British summer capital with colonial architecture and cool climate. The Queen of Hill Stations enchants with its panoramic views, heritage railway, and pine forests.',
    image: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1597074866923-dc0589150458?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1800,
    bestTimeToVisit: 'March to June, December to February',
    travelStyles: ['Nature', 'Relaxation', 'Adventure'],
    travelerTypes: ['Family', 'Couple', 'Solo'],
    popularFor: ['Mall Road', 'Kufri', 'Jakhoo Temple'],
    rating: 4.4
  },
  {
    name: 'Mysore',
    state: 'Karnataka',
    country: 'India',
    lat: 12.2958,
    lng: 76.6394,
    description: 'Palace city known for grand Dasara celebrations and sandalwood. The cultural capital of Karnataka boasts magnificent palaces, vibrant silk markets, and royal heritage.',
    image: 'https://images.unsplash.com/photo-1600112356853-97f4a231fe07?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1600112356853-97f4a231fe07?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1580581096469-8afb1aafd5d2?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1600,
    bestTimeToVisit: 'October to February',
    travelStyles: ['Cultural', 'Religious', 'Nature'],
    travelerTypes: ['Family', 'Couple', 'Student', 'Solo'],
    popularFor: ['Mysore Palace', 'Chamundi Hills', 'Brindavan Gardens'],
    rating: 4.5
  },
  {
    name: 'Andaman Islands',
    state: 'Andaman & Nicobar',
    country: 'India',
    lat: 11.7401,
    lng: 92.6586,
    description: 'Pristine beaches, coral reefs, and crystal-clear turquoise waters. A tropical paradise with some of Asia\'s finest diving spots and untouched natural beauty.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 3500,
    bestTimeToVisit: 'November to May',
    travelStyles: ['Adventure', 'Relaxation', 'Nature'],
    travelerTypes: ['Couple', 'Solo', 'Family'],
    popularFor: ['Scuba Diving', 'Radhanagar Beach', 'Cellular Jail'],
    rating: 4.8
  },
  {
    name: 'Ooty',
    state: 'Tamil Nadu',
    country: 'India',
    lat: 11.4102,
    lng: 76.6950,
    description: 'Queen of Hill Stations with tea estates, botanical gardens, and misty valleys. A serene retreat in the Nilgiri Hills with pleasant weather year-round.',
    image: 'https://images.unsplash.com/photo-1574427097806-770612085967?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1574427097806-770612085967?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585123388867-3bfe6a4f62ae?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1500,
    bestTimeToVisit: 'April to June',
    travelStyles: ['Nature', 'Relaxation'],
    travelerTypes: ['Family', 'Couple', 'Solo'],
    popularFor: ['Tea Gardens', 'Ooty Lake', 'Botanical Garden'],
    rating: 4.3
  },
  {
    name: 'Ladakh',
    state: 'Jammu & Kashmir',
    country: 'India',
    lat: 34.1526,
    lng: 77.5771,
    description: 'High-altitude desert with dramatic landscapes, Buddhist monasteries, and starry skies. The Land of High Passes offers an otherworldly experience.',
    image: 'https://images.unsplash.com/photo-1626015365107-fbbe81ee3ea2?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1626015365107-fbbe81ee3ea2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600781258365-7a7d53d2c7cd?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 3000,
    bestTimeToVisit: 'June to September',
    travelStyles: ['Adventure', 'Nature', 'Cultural'],
    travelerTypes: ['Solo', 'Couple', 'Student'],
    popularFor: ['Pangong Lake', 'Monasteries', 'Bike Trip'],
    rating: 4.9
  },
  {
    name: 'Mount Abu',
    state: 'Rajasthan',
    country: 'India',
    lat: 24.5926,
    lng: 72.7156,
    description: 'Only hill station in Rajasthan with cool climate and Dilwara Temples. A refreshing retreat from the desert heat with stunning marble temples and scenic lakes.',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=800'
    ],
    estimatedCostPerDay: 1400,
    bestTimeToVisit: 'October to June',
    travelStyles: ['Religious', 'Nature', 'Relaxation'],
    travelerTypes: ['Family', 'Couple', 'Student'],
    popularFor: ['Nakki Lake', 'Dilwara Temples', 'Guru Shikhar'],
    rating: 4.2
  },
];

const hotels = [
  // Goa
  { name: 'Taj Exotica Resort & Spa', destination: 'Goa', pricePerNight: 12000, rating: 5, distance: '2 km from Beach', amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant', 'Bar'], category: 'Luxury', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600' },
  { name: 'Lemon Tree Amarante', destination: 'Goa', pricePerNight: 5500, rating: 4, distance: '0.5 km from Beach', amenities: ['Pool', 'WiFi', 'Restaurant', 'Bar'], category: 'Standard', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=600' },
  { name: 'OYO Rooms Calangute', destination: 'Goa', pricePerNight: 1200, rating: 3, distance: '1 km from Beach', amenities: ['WiFi', 'AC'], category: 'Budget', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600' },
  // Manali
  { name: 'The Himalayan', destination: 'Manali', pricePerNight: 8000, rating: 5, distance: '1 km from Mall Road', amenities: ['Mountain View', 'Fireplace', 'Spa', 'Restaurant', 'WiFi'], category: 'Luxury', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600' },
  { name: 'Snow Valley Resorts', destination: 'Manali', pricePerNight: 3500, rating: 4, distance: '2 km from Mall Road', amenities: ['Mountain View', 'Restaurant', 'WiFi', 'Parking'], category: 'Standard', image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=600' },
  { name: 'Hotel Snowflake', destination: 'Manali', pricePerNight: 900, rating: 3, distance: '500m from Bus Stand', amenities: ['WiFi', 'Hot Water'], category: 'Budget', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600' },
  // Jaipur
  { name: 'Rambagh Palace', destination: 'Jaipur', pricePerNight: 25000, rating: 5, distance: '5 km from City Center', amenities: ['Pool', 'Spa', 'Multiple Restaurants', 'WiFi', 'Garden'], category: 'Luxury', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=600' },
  { name: 'Hotel Sarovar Portico', destination: 'Jaipur', pricePerNight: 4500, rating: 4, distance: '2 km from Railway Station', amenities: ['Pool', 'Restaurant', 'WiFi', 'Gym'], category: 'Standard', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600' },
  { name: 'OYO Rooms Pink City', destination: 'Jaipur', pricePerNight: 800, rating: 3, distance: '1 km from Hawa Mahal', amenities: ['WiFi', 'AC', 'TV'], category: 'Budget', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600' },
  // Udaipur
  { name: 'Taj Lake Palace', destination: 'Udaipur', pricePerNight: 35000, rating: 5, distance: 'On Lake Pichola', amenities: ['Lake View', 'Spa', 'Pool', 'Fine Dining', 'WiFi'], category: 'Luxury', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=600' },
  { name: 'Hotel Fateh Prakash Palace', destination: 'Udaipur', pricePerNight: 7000, rating: 4, distance: '0.5 km from City Palace', amenities: ['Lake View', 'Restaurant', 'WiFi'], category: 'Standard', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=600' },
  { name: 'Zostel Udaipur', destination: 'Udaipur', pricePerNight: 600, rating: 3, distance: '1 km from Lake Pichola', amenities: ['WiFi', 'Common Kitchen', 'Terrace'], category: 'Budget', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600' },
  // Kerala
  { name: 'Kumarakom Lake Resort', destination: 'Kerala', pricePerNight: 15000, rating: 5, distance: 'On Vembanad Lake', amenities: ['Backwater View', 'Spa', 'Pool', 'Ayurveda', 'Restaurant'], category: 'Luxury', image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=600' },
  { name: 'Houseboat Stay', destination: 'Kerala', pricePerNight: 6000, rating: 4, distance: 'Alleppey Backwaters', amenities: ['Backwater View', 'All Meals', 'AC', 'Driver'], category: 'Standard', image: 'https://images.unsplash.com/photo-1602158123929-22876e1a4c74?auto=format&fit=crop&q=80&w=600' },
  { name: 'Government Guest House', destination: 'Kerala', pricePerNight: 800, rating: 3, distance: '2 km from Bus Stand', amenities: ['WiFi', 'Basic Amenities'], category: 'Budget', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600' },
  // Ladakh
  { name: 'The Grand Dragon Ladakh', destination: 'Ladakh', pricePerNight: 10000, rating: 5, distance: '2 km from Leh Market', amenities: ['Mountain View', 'Restaurant', 'Oxygen Bar', 'WiFi', 'Spa'], category: 'Luxury', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600' },
  { name: 'Hotel Yak Tail', destination: 'Ladakh', pricePerNight: 3000, rating: 4, distance: '1 km from Leh Market', amenities: ['Mountain View', 'Restaurant', 'WiFi'], category: 'Standard', image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=600' },
  { name: 'Zostel Leh', destination: 'Ladakh', pricePerNight: 700, rating: 3, distance: '500m from Main Market', amenities: ['WiFi', 'Common Area', 'Terrace'], category: 'Budget', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600' },
];

const attractions = [
  // Goa
  { name: 'Baga Beach', destination: 'Goa', description: 'Most popular beach with water sports and beach shacks', entryFee: 0, openingTime: '6:00 AM', closingTime: '10:00 PM', category: 'Beach', rating: 4.5, priority: 5, travelStyles: ['Relaxation', 'Adventure'], location: { lat: 15.5552, lng: 73.7516 } },
  { name: 'Dudhsagar Falls', destination: 'Goa', description: 'Stunning four-tiered waterfall in the Western Ghats', entryFee: 400, openingTime: '7:00 AM', closingTime: '5:00 PM', category: 'Nature', rating: 4.7, priority: 4, travelStyles: ['Adventure', 'Nature'], location: { lat: 15.3144, lng: 74.3142 } },
  { name: 'Old Goa Churches', destination: 'Goa', description: 'UNESCO World Heritage churches including Basilica of Bom Jesus', entryFee: 0, openingTime: '9:00 AM', closingTime: '6:30 PM', category: 'Heritage', rating: 4.4, priority: 3, travelStyles: ['Cultural', 'Religious'], location: { lat: 15.5007, lng: 73.9119 } },
  // Manali
  { name: 'Rohtang Pass', destination: 'Manali', description: 'High-altitude mountain pass with stunning snow views', entryFee: 550, openingTime: '8:00 AM', closingTime: '4:00 PM', category: 'Adventure', rating: 4.8, priority: 5, travelStyles: ['Adventure', 'Nature'], location: { lat: 32.3712, lng: 77.2463 } },
  { name: 'Solang Valley', destination: 'Manali', description: 'Adventure valley with skiing, zorbing, and paragliding', entryFee: 0, openingTime: '9:00 AM', closingTime: '6:00 PM', category: 'Adventure', rating: 4.6, priority: 4, travelStyles: ['Adventure'], location: { lat: 32.3243, lng: 77.1550 } },
  { name: 'Hadimba Temple', destination: 'Manali', description: 'Ancient wooden temple dedicated to Goddess Hadimba', entryFee: 0, openingTime: '8:00 AM', closingTime: '6:00 PM', category: 'Religious', rating: 4.5, priority: 3, travelStyles: ['Religious', 'Cultural'], location: { lat: 32.2396, lng: 77.1887 } },
  // Jaipur
  { name: 'Amber Fort', destination: 'Jaipur', description: 'Majestic hilltop fort with stunning architecture and elephant rides', entryFee: 200, openingTime: '8:00 AM', closingTime: '5:30 PM', category: 'Heritage', rating: 4.7, priority: 5, travelStyles: ['Cultural', 'Nature'], location: { lat: 26.9855, lng: 75.8513 } },
  { name: 'Hawa Mahal', destination: 'Jaipur', description: 'Iconic Palace of Winds with 953 small windows', entryFee: 50, openingTime: '9:00 AM', closingTime: '4:30 PM', category: 'Heritage', rating: 4.5, priority: 4, travelStyles: ['Cultural'], location: { lat: 26.9239, lng: 75.8267 } },
  { name: 'City Palace', destination: 'Jaipur', description: 'Royal palace complex with museum and royal family residence', entryFee: 300, openingTime: '9:30 AM', closingTime: '5:00 PM', category: 'Heritage', rating: 4.6, priority: 4, travelStyles: ['Cultural', 'Religious'], location: { lat: 26.9257, lng: 75.8237 } },
  // Udaipur
  { name: 'City Palace Udaipur', destination: 'Udaipur', description: 'Largest royal complex in Rajasthan overlooking Lake Pichola', entryFee: 300, openingTime: '9:30 AM', closingTime: '5:30 PM', category: 'Heritage', rating: 4.7, priority: 5, travelStyles: ['Cultural'], location: { lat: 24.5757, lng: 73.6831 } },
  { name: 'Lake Pichola Boat Ride', destination: 'Udaipur', description: 'Scenic boat ride with views of Lake Palace and City Palace', entryFee: 400, openingTime: '8:00 AM', closingTime: '7:00 PM', category: 'Leisure', rating: 4.8, priority: 5, travelStyles: ['Relaxation', 'Cultural'], location: { lat: 24.5744, lng: 73.6792 } },
  { name: 'Jagdish Temple', destination: 'Udaipur', description: '17th century temple dedicated to Lord Vishnu', entryFee: 0, openingTime: '4:15 AM', closingTime: '8:00 PM', category: 'Religious', rating: 4.4, priority: 3, travelStyles: ['Religious'], location: { lat: 24.5768, lng: 73.6835 } },
  // Kerala
  { name: 'Alleppey Backwaters', destination: 'Kerala', description: 'Serene houseboat cruise through 900 km of backwaters', entryFee: 8000, openingTime: '6:00 AM', closingTime: '8:00 PM', category: 'Nature', rating: 4.9, priority: 5, travelStyles: ['Relaxation', 'Nature'], location: { lat: 9.4981, lng: 76.3388 } },
  { name: 'Munnar Tea Gardens', destination: 'Kerala', description: 'Vast rolling tea estates at 1600m altitude', entryFee: 100, openingTime: '9:00 AM', closingTime: '5:00 PM', category: 'Nature', rating: 4.7, priority: 4, travelStyles: ['Nature', 'Relaxation'], location: { lat: 10.0889, lng: 77.0595 } },
  // Ladakh
  { name: 'Pangong Lake', destination: 'Ladakh', description: 'Stunning high-altitude lake at 4350m changing colors through the day', entryFee: 400, openingTime: '6:00 AM', closingTime: '7:00 PM', category: 'Nature', rating: 4.9, priority: 5, travelStyles: ['Adventure', 'Nature'], location: { lat: 33.7566, lng: 78.6481 } },
  { name: 'Thiksey Monastery', destination: 'Ladakh', description: 'Stunning hilltop monastery resembling the Potala Palace in Tibet', entryFee: 50, openingTime: '6:00 AM', closingTime: '7:00 PM', category: 'Religious', rating: 4.7, priority: 4, travelStyles: ['Religious', 'Cultural'], location: { lat: 33.9294, lng: 77.6683 } },
  { name: 'Leh Palace', destination: 'Ladakh', description: '17-storey ancient palace overlooking Leh city', entryFee: 15, openingTime: '7:00 AM', closingTime: '4:00 PM', category: 'Heritage', rating: 4.5, priority: 3, travelStyles: ['Cultural', 'Adventure'], location: { lat: 34.1642, lng: 77.5848 } },
];

async function seedDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected for seeding');

  // Clear existing data
  await Destination.deleteMany();
  await Hotel.deleteMany();
  await Attraction.deleteMany();
  await User.deleteMany({ email: 'admin@tripwise.com' });

  // Insert data
  await Destination.insertMany(destinations);
  console.log(`✅ ${destinations.length} destinations seeded (with images, coordinates, and country)`);

  await Hotel.insertMany(hotels);
  console.log(`✅ ${hotels.length} hotels seeded (with images)`);

  await Attraction.insertMany(attractions);
  console.log(`✅ ${attractions.length} attractions seeded`);

  // Create admin user
  const hashed = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Admin', email: 'admin@tripwise.com', password: hashed, role: 'admin' });
  console.log('✅ Admin user created → email: admin@tripwise.com | password: admin123');

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
}

seedDB().catch(err => { console.error(err); process.exit(1); });
