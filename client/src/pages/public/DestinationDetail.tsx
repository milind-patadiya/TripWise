import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  MapPin, CloudSun, Clock, Info, Globe, Shield, Star, ThumbsUp, Activity, 
  Banknote, Languages, Navigation, Ticket
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '@/api/axios';
import { fetchCountryInfo } from '@/services/externalApi';
import BookingModal from '@/components/booking/BookingModal';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DestinationDetail() {
  const { id } = useParams();
  const [showBooking, setShowBooking] = useState(false);

  // 1. Fetch Destination from our DB
  const { data: destination, isLoading: loadingDest } = useQuery({
    queryKey: ['destination', id],
    queryFn: async () => {
      const res = await api.get(`/destinations/${id}`);
      return res.data;
    }
  });

  // 2. Fetch Weather via backend proxy (Open-Meteo)
  const { data: weather } = useQuery({
    queryKey: ['weather', destination?.lat, destination?.lng],
    enabled: !!destination?.lat && !!destination?.lng,
    queryFn: async () => {
      const res = await api.get(`/weather?lat=${destination.lat}&lng=${destination.lng}`);
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // 3. Fetch Country Info (REST Countries)
  const { data: countryInfo } = useQuery({
    queryKey: ['country', destination?.country],
    enabled: !!destination?.country,
    queryFn: () => fetchCountryInfo(destination.country)
  });

  // 4. Fetch Attractions for this destination
  const { data: attractions } = useQuery({
    queryKey: ['attractions', destination?.name],
    enabled: !!destination?.name,
    queryFn: async () => {
      const res = await api.get(`/attractions?destination=${destination.name}`);
      return res.data;
    }
  });

  if (loadingDest) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-slate-50 dark:bg-slate-950 flex justify-center">
        <div className="animate-pulse flex flex-col gap-8 w-full max-w-6xl px-4">
          <div className="h-[40vh] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-10 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return <div className="pt-32 text-center text-xl font-bold">Destination not found.</div>;
  }

  const currencies = countryInfo?.currencies ? Object.values(countryInfo.currencies)[0] as any : null;
  const languages = countryInfo?.languages ? Object.values(countryInfo.languages).join(', ') : 'Unknown';
  const temperature = weather?.current_weather?.temperature;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* ── HERO IMAGE ──────────────────────────────────────────────── */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img 
          src={destination.images?.[0] || destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 md:px-6 pb-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {destination.travelStyles?.[0] || 'Popular'}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                {destination.rating} / 5
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-2">{destination.name}</h1>
            <div className="flex items-center gap-2 text-slate-200 text-lg md:text-xl">
              <MapPin size={20} />
              {destination.state}, {destination.country || 'India'}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Left Column - Overview, Attractions & Map */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Overview */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Overview</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {destination.description}
              </p>
            </motion.section>

            {/* Top Attractions */}
            {attractions && attractions.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Ticket size={24} className="text-indigo-600" />
                  Top Attractions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attractions.slice(0, 4).map((attr: any) => (
                    <div key={attr._id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{attr.name}</h3>
                        <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                          <Star size={10} className="text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{attr.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{attr.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">{attr.category}</span>
                        <span>{attr.entryFee > 0 ? `₹${attr.entryFee}` : 'Free entry'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Interactive Map (Leaflet) */}
            {destination.lat && destination.lng && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Navigation size={24} className="text-indigo-600" />
                  Explore on Map
                </h2>
                <div className="h-[400px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                  <MapContainer 
                    center={[destination.lat, destination.lng]} 
                    zoom={11} 
                    scrollWheelZoom={false} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[destination.lat, destination.lng]}>
                      <Popup>
                        <div className="font-bold text-indigo-600">{destination.name}</div>
                        <div>{destination.country || 'India'}</div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </motion.section>
            )}

            {/* Travel Styles & Badges */}
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Good to know</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <ThumbsUp className="text-emerald-500" size={24} />
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-bold">Best Time</div>
                    <div className="font-medium text-slate-900 dark:text-white">{destination.bestTimeToVisit}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <Activity className="text-indigo-500" size={24} />
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-bold">Great For</div>
                    <div className="font-medium text-slate-900 dark:text-white">{destination.travelStyles?.join(', ')}</div>
                  </div>
                </div>
              </div>
            </motion.section>

          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-28 space-y-6">
              
              {/* Weather Widget — Clean minimal design */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CloudSun size={20} className="text-sky-500" /> Live Weather
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Open-Meteo</span>
                </div>
                {temperature !== undefined ? (
                  <div>
                    <div className="flex items-end gap-3 mb-2">
                      <div className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{Math.round(temperature)}°<span className="text-3xl text-slate-400">C</span></div>
                    </div>
                    <p className="text-sm text-slate-500">Currently in {destination.name}</p>
                    {weather?.daily && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3">
                        {weather.daily.time?.slice(1, 4).map((date: string, i: number) => (
                          <div key={date} className="text-center">
                            <p className="text-xs text-slate-400 mb-1">{new Date(date).toLocaleDateString('en', { weekday: 'short' })}</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(weather.daily.temperature_2m_max[i + 1])}°</p>
                            <p className="text-xs text-slate-400">{Math.round(weather.daily.temperature_2m_min[i + 1])}°</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-pulse flex items-center gap-4 py-2">
                    <div className="h-12 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                )}
              </motion.div>

              {/* Country Facts Widget */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                  <Globe size={20} className="text-indigo-600" /> Destination Facts
                </h3>
                
                {countryInfo ? (
                  <div className="space-y-5">
                    <div className="flex gap-4 items-start">
                      <Banknote size={20} className="text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Currency</div>
                        <div className="text-sm text-slate-500">{currencies?.name} ({currencies?.symbol})</div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <Languages size={20} className="text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Languages</div>
                        <div className="text-sm text-slate-500">{languages}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <Clock size={20} className="text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Timezone</div>
                        <div className="text-sm text-slate-500">{countryInfo.timezones?.[0]}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <Shield size={20} className="text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Capital</div>
                        <div className="text-sm text-slate-500">{countryInfo.capital?.[0]}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="flex gap-4">
                        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Price Estimate */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="bg-slate-900 rounded-3xl p-6 text-white shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-medium">Estimated Budget</span>
                  <Info size={16} className="text-slate-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">₹{destination.estimatedCostPerDay?.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400 text-sm">/ day</span>
                </div>
                <Link
                  to="/planner/setup"
                  onClick={() => {
                    localStorage.setItem('trip_planner_data', JSON.stringify({ destination: destination.name, days: 3, travelers: 2, budget: 'Moderate', interests: [] }));
                  }}
                  className="block w-full mt-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-center font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  ✨ Plan a custom trip with AI instead
                </Link>
                <button
                  onClick={() => setShowBooking(true)}
                  className="block w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold py-3 rounded-xl transition-colors"
                >
                  Book Now
                </button>
              </motion.div>

              {showBooking && (
                <BookingModal
                  item={{
                    itemType: 'Destination',
                    itemId: destination._id,
                    itemName: destination.name,
                    itemImage: destination.image,
                    destinationName: `${destination.name}, ${destination.country}`,
                    unitPrice: destination.estimatedCostPerDay || 2000,
                    priceLabel: 'per day',
                  }}
                  onClose={() => setShowBooking(false)}
                />
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
