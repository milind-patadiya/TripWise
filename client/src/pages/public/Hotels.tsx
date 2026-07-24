import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Search, MapPin, Star, Filter, Coffee, Wifi, Dumbbell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import BookingModal, { BookableItem } from '@/components/booking/BookingModal';

export default function Hotels() {
  const [destination, setDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('Goa');
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels', searchQuery],
    queryFn: async () => {
      const res = await api.get(`/hotels?destination=${searchQuery}`);
      return res.data;
    },
    enabled: true
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) setSearchQuery(destination);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      
      {/* Hero Header — Clean dark design, no gradient */}
      <div className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Find the Perfect Stay</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Book hotels, resorts, and homestays at the best prices across India.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white rounded-2xl p-2 flex shadow-2xl relative z-10">
            <div className="flex-1 flex items-center px-4 gap-3 border-r border-slate-200">
              <MapPin className="text-slate-400" size={24} />
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where do you want to stay?" 
                className="w-full text-slate-900 bg-transparent py-3 outline-none text-lg placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 h-12 text-lg gap-2">
              <Search size={18} /> Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 text-lg border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <Filter size={20} /> Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Price Range</h4>
                <input type="range" className="w-full accent-indigo-600" min="0" max="20000" />
                <div className="flex justify-between text-sm text-slate-500 mt-2">
                  <span>₹0</span>
                  <span>₹20,000+</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Star Rating</h4>
                {[5,4,3].map(star => (
                  <label key={star} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-600" />
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      {star} <Star size={14} className="fill-amber-400 text-amber-400" />
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Listings */}
        <div className="lg:col-span-3 space-y-6">
          {!isLoading && hotels?.length > 0 && (
            <p className="text-sm text-slate-500 font-medium">Showing {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} in {searchQuery}</p>
          )}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && hotels?.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-4xl mb-4">🏨</div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No hotels found</h2>
              <p className="text-slate-500">Try searching for a different destination like Goa, Manali, or Jaipur.</p>
            </div>
          )}

          {hotels?.map((hotel: any) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={hotel._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
            >
              <div className="md:w-1/3 h-56 md:h-auto overflow-hidden relative">
                <img 
                  src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600'} 
                  alt={hotel.name} 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                {hotel.category === 'Luxury' && (
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    LUXURY
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {hotel.name}
                    </h2>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg font-bold">
                        <Star size={16} className="fill-indigo-600" />
                        {hotel.rating}
                      </div>
                      <span className="text-xs text-slate-500 mt-1">
                        {hotel.rating >= 4.5 ? 'Excellent' : hotel.rating >= 4 ? 'Very Good' : 'Good'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                    <MapPin size={14} /> {hotel.distance || `${hotel.destination} City Center`}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities?.map((amenity: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                        {amenity === 'Free WiFi' && <Wifi size={12} />}
                        {amenity === 'Breakfast Included' && <Coffee size={12} />}
                        {amenity === 'Gym' && <Dumbbell size={12} />}
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-end justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Price per night</span>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                      ₹{hotel.pricePerNight?.toLocaleString('en-IN')}
                    </div>
                    <span className="text-xs text-slate-400">+₹{Math.floor(hotel.pricePerNight * 0.18)} taxes & fees</span>
                  </div>
                  <Button
                    onClick={() =>
                      setBookingItem({
                        itemType: 'Hotel',
                        itemId: hotel._id,
                        itemName: hotel.name,
                        itemImage: hotel.image,
                        destinationName: hotel.destination,
                        unitPrice: hotel.pricePerNight,
                        priceLabel: 'per night',
                      })
                    }
                    className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl gap-2"
                  >
                    Book Now <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {bookingItem && (
        <BookingModal item={bookingItem} onClose={() => setBookingItem(null)} />
      )}
    </div>
  );
}
