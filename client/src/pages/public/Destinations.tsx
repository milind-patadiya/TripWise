import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { motion } from 'framer-motion';
import { MapPin, Search, Star, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import AICompareModal from '@/components/destination/AICompareModal';
import { ArrowRightLeft, Sparkles } from 'lucide-react';

export default function Destinations() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [compareOpen, setCompareOpen] = useState(false);

  const { data: destinations, isLoading } = useQuery({
    queryKey: ['destinations', search],
    queryFn: async () => {
      const res = await api.get(`/destinations?search=${search}`);
      return res.data;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              Explore Destinations
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl">
              Discover the most beautiful places around the world. From sunny beaches to snow-capped mountains.
            </p>
          </div>
          
          <button 
            onClick={() => setCompareOpen(true)}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
          >
            <Sparkles size={18} /> AI Compare Destinations
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by city or country..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium">
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Destinations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 h-[400px] animate-pulse">
                <div className="h-[250px] bg-slate-200 dark:bg-slate-800 rounded-t-3xl" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : destinations?.length > 0 ? (
          <>
          <p className="text-sm text-slate-500 mb-6 font-medium">Showing {destinations.length} destination{destinations.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest: any, i: number) => (
              <Link to={`/destinations/${dest._id}`} key={dest._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="relative h-[250px] overflow-hidden">
                  <img 
                    src={dest.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80'} 
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-slate-900">{dest.rating}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-indigo-600 mb-2">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">{dest.state}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{dest.name}</h3>
                  <p className="text-slate-500 line-clamp-3 text-sm leading-relaxed mb-6 flex-1">
                    {dest.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    {dest.travelStyles?.slice(0,3).map((style: string) => (
                      <span key={style} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
          </>
        ) : (
          <div className="text-center py-20">
            <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No destinations found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
          </div>
        )}

      </div>
      <AICompareModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} />
    </div>
  );
}
