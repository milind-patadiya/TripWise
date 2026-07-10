import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlaneTakeoff, Plus, Calendar, MapPin, Users, Ticket, XCircle,
  Hotel as HotelIcon, Compass, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import api from '@/api/axios';

const ITEM_ICON: Record<string, typeof Compass> = {
  Destination: Compass,
  Package: PlaneTakeoff,
  Hotel: HotelIcon,
};

export default function UserTrips() {
  const [tab, setTab] = useState<'bookings' | 'ai'>('bookings');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Real direct bookings (Destination / Package / Hotel — booked via Checkout)
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['my_bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my');
      return res.data;
    },
  });

  // AI Trip Planner itineraries
  const { data: trips, isLoading: loadingTrips } = useQuery({
    queryKey: ['user_trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.put(`/bookings/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my_bookings'] }),
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Trips</h1>
          <p className="text-slate-500 mt-1">Your bookings and AI-planned itineraries, all in one place.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/destinations">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus size={16} /> Book a Trip
            </Button>
          </Link>
          <Link to="/planner/setup">
            <Button className="flex items-center gap-2 bg-indigo-600 text-white shadow-md">
              <Sparkles size={16} /> Plan with AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['bookings', 'ai'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            {t === 'bookings' ? `My Bookings (${bookings?.length ?? 0})` : `AI Itineraries (${trips?.length ?? 0})`}
          </button>
        ))}
      </div>

      {/* Bookings tab */}
      {tab === 'bookings' && (
        loadingBookings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 h-48 animate-pulse" />
            ))}
          </div>
        ) : bookings?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {bookings.map((b: any) => {
                const Icon = ITEM_ICON[b.itemType] || Compass;
                return (
                  <motion.div
                    key={b._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                  >
                    {b.itemImage && (
                      <img src={b.itemImage} alt={b.itemName} className="w-full h-36 object-cover" />
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                          <Icon size={11} /> {b.itemType}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                            b.status === 'Confirmed' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                            b.status === 'Cancelled' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            b.status === 'Completed' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          )}
                        >
                          {b.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 leading-tight">{b.itemName}</h3>
                      <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                        <MapPin size={13} /> {b.destinationName}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {b.checkOut && ` – ${new Date(b.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={13} className="text-slate-400" /> {b.travelers} traveler{b.travelers > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Ticket size={13} className="text-slate-400" /> {b.bookingRef}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                        <div className="flex gap-2">
                          {b.itinerary && b.itinerary.length > 0 && (
                            <button
                              onClick={() => setExpandedBooking(expandedBooking === b._id ? null : b._id)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {expandedBooking === b._id ? 'Hide Itinerary' : 'View Itinerary'}
                            </button>
                          )}
                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => cancelMutation.mutate(b._id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <XCircle size={13} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Itinerary View */}
                      <AnimatePresence>
                        {expandedBooking === b._id && b.itinerary && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"
                          >
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Trip Itinerary</h4>
                            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                              {b.itinerary.map((day: any) => (
                                <div key={day.day} className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/50">
                                  <div className="absolute w-2 h-2 bg-indigo-600 rounded-full -left-[5px] top-1.5" />
                                  <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Day {day.day}: {day.theme}</h5>
                                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                                    <p><strong className="text-slate-700 dark:text-slate-300">Morning:</strong> {day.morning}</p>
                                    <p><strong className="text-slate-700 dark:text-slate-300">Afternoon:</strong> {day.afternoon}</p>
                                    <p><strong className="text-slate-700 dark:text-slate-300">Evening:</strong> {day.evening}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No bookings yet</h3>
            <p className="text-slate-500 mb-6">Book a destination, package, or hotel to see it here.</p>
            <Link to="/destinations">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl h-12">
                Browse Destinations
              </Button>
            </Link>
          </div>
        )
      )}

      {/* AI Itineraries tab */}
      {tab === 'ai' && (
        loadingTrips ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 h-32 animate-pulse" />
            ))}
          </div>
        ) : trips?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip: any) => (
              <div key={trip._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
                    <PlaneTakeoff size={24} />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full uppercase tracking-wider">
                    {trip.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{trip.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{trip.destination}</p>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    {trip.days} Days
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    ₹{trip.budget?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <Sparkles size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No AI itineraries yet</h3>
            <p className="text-slate-500 mb-6">Let our AI planner design a custom trip for you.</p>
            <Link to="/planner/setup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl h-12">
                Plan with AI
              </Button>
            </Link>
          </div>
        )
      )}
    </div>
  );
}
