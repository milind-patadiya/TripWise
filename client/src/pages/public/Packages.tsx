import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Calendar, Plane, CreditCard, ChevronRight, Heart, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import BookingModal, { BookableItem } from '@/components/booking/BookingModal';

export default function Packages() {
  const [filter, setFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('popular');
  const [localWishlist, setLocalWishlist] = useState<string[]>([]);
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await api.get(`/packages`);
      return res.data;
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      if (!user) return null;
      const res = await api.get(`/auth/profile`);
      return res.data;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (profile?.wishlist) {
      setLocalWishlist(profile.wishlist.map((w: any) => typeof w === 'string' ? w : w._id));
    }
  }, [profile]);

  const toggleWishlistMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/auth/wishlist/${id}`);
    },
    onSuccess: (res) => {
      setLocalWishlist(res.data.wishlist.map((w: any) => w._id));
      queryClient.invalidateQueries({ queryKey: ['user_profile'] });
    }
  });

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to save to wishlist');
      navigate('/login');
      return;
    }
    // Optimistic UI update
    if (localWishlist.includes(id)) {
      setLocalWishlist(localWishlist.filter(w => w !== id));
      toast.success('Removed from wishlist');
    } else {
      setLocalWishlist([...localWishlist, id]);
      toast.success('Added to wishlist');
    }
    toggleWishlistMutation.mutate(id);
  };

  const displayedPackages = packages?.filter((p: any) => filter === 'All' || p.tags?.includes(filter))
    .sort((a: any, b: any) => {
      if (sortOrder === 'price_low') return a.price - b.price;
      if (sortOrder === 'price_high') return b.price - a.price;
      return b.rating - a.rating; // Default 'popular'
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-3">Curated Experiences</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            Exclusive Holiday Packages
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-500">
            Handcrafted itineraries featuring luxury stays, exclusive tours, and seamless travel arrangements.
          </motion.p>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <Filter size={18} className="text-slate-400 mr-2" />
            {['All', 'Luxury', 'Adventure', 'Romantic', 'Cultural', 'Family'].map(tag => (
              <button 
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === tag ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <ArrowUpDown size={18} className="text-slate-400" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 rounded-xl py-2 px-4 focus:ring-2 focus:ring-indigo-500 font-medium w-full md:w-auto"
            >
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Packages List */}
        {isLoading ? (
          <div className="space-y-8 max-w-5xl mx-auto">
            {[1, 2, 3].map(n => (
              <div key={n} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 h-[280px] animate-pulse flex" />
            ))}
          </div>
        ) : displayedPackages?.length > 0 ? (
          <div className="space-y-8 max-w-5xl mx-auto">
            <AnimatePresence>
              {displayedPackages.map((pkg: any) => (
                <motion.div
                  key={pkg._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-500"
                >
                  {/* Image Section */}
                  <div className="md:w-[400px] h-[250px] md:h-auto relative overflow-hidden shrink-0 cursor-pointer">
                    <img 
                      src={pkg.image} 
                      alt={pkg.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <button 
                      onClick={(e) => toggleWishlist(pkg._id, e)}
                      className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart size={18} className={localWishlist.includes(pkg._id) ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                    </button>
                    {pkg.featured && (
                      <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                        Featured
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-600" />
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {pkg.durationDays} Days / {pkg.durationNights} Nights
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-3 font-medium uppercase tracking-wider">
                        <Compass size={16} className="text-indigo-600" />
                        {pkg.destination?.name || 'Multiple Destinations'}
                        <span className="mx-2 text-slate-300">•</span>
                        <span className="text-amber-500 font-bold flex items-center gap-1">★ {pkg.rating}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors cursor-pointer">
                        {pkg.title}
                      </h3>
                      <p className="text-slate-500 line-clamp-2 leading-relaxed mb-6">
                        {pkg.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pkg.inclusions?.map((inc: string) => (
                          <span key={inc} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg">
                            {inc.includes('Flight') ? <Plane size={14}/> : <CreditCard size={14}/>}
                            {inc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                      <div>
                        {pkg.discountPrice && pkg.discountPrice < pkg.price && (
                          <p className="text-slate-400 text-sm mb-1 line-through font-medium">₹{pkg.price.toLocaleString('en-IN')}</p>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{(pkg.discountPrice || pkg.price).toLocaleString('en-IN')}</span>
                          <span className="text-slate-500 text-sm">/ person</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link to={`/destinations/${pkg.destination?._id}`} className="w-full sm:w-auto">
                          <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl font-bold h-12 px-6 flex items-center justify-center gap-2">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          size="lg"
                          onClick={() =>
                            setBookingItem({
                              itemType: 'Package',
                              itemId: pkg._id,
                              itemName: pkg.title,
                              itemImage: pkg.image,
                              destinationName: pkg.destination?.name || 'India',
                              unitPrice: pkg.discountPrice || pkg.price,
                              priceLabel: 'per person',
                              fixedDurationNights: pkg.durationNights,
                            })
                          }
                          className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all"
                        >
                          Book Now <ChevronRight size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {displayedPackages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Compass size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No packages found for "{filter}"</h3>
                <p className="text-slate-500">Try selecting a different filter.</p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No packages available right now</h3>
            <p className="text-slate-500">Please check back later.</p>
          </div>
        )}

      {/* AI Customization Banner (TravelTriangle Style) */}
      <div className="max-w-5xl mx-auto mt-20">
        <div className="bg-indigo-600 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden shadow-2xl border border-indigo-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-700 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Can't find the perfect package?
            </h2>
            <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Our AI Travel Planner can instantly craft a 100% customized itinerary based on your exact budget, dates, and interests.
            </p>
            <Link to="/planner/setup">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-50 font-bold text-lg px-10 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all duration-300">
                Customize with AI 
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </div>

      {bookingItem && (
        <BookingModal item={bookingItem} onClose={() => setBookingItem(null)} />
      )}
    </div>
  );
}
