import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  PlaneTakeoff, Map, Wallet, Heart, Sparkles,
  CloudSun, CloudRain, Cloud, Sun, Snowflake, Wind,
  ArrowRight, Receipt, CheckSquare, Package,
  Thermometer, Calendar, MapPin, Compass, Hotel as HotelIcon, Ticket
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import api from '@/api/axios';

// ─── Weather icon mapper ────────────────────────────────────
function getWeatherIcon(code: number) {
  if (code <= 1) return { icon: Sun, label: 'Clear', color: 'text-amber-500' };
  if (code <= 3) return { icon: CloudSun, label: 'Cloudy', color: 'text-sky-500' };
  if (code <= 49) return { icon: Cloud, label: 'Foggy', color: 'text-slate-400' };
  if (code <= 69) return { icon: CloudRain, label: 'Rain', color: 'text-blue-500' };
  if (code <= 79) return { icon: Snowflake, label: 'Snow', color: 'text-cyan-400' };
  if (code <= 99) return { icon: Wind, label: 'Stormy', color: 'text-purple-500' };
  return { icon: Cloud, label: 'Unknown', color: 'text-slate-400' };
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ITEM_ICON: Record<string, typeof Compass> = {
  Destination: Compass,
  Package: PlaneTakeoff,
  Hotel: HotelIcon,
};

// ─── Animated Counter ───────────────────────────────────────
function AnimatedCount({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{count}{suffix}</>;
}

// ─── Circular Progress Ring ─────────────────────────────────
function TravelRing({ completed, total, label }: { completed: number; total: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? completed / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
          <motion.circle
            cx="64" cy="64" r={radius} fill="none" strokeWidth="8" strokeLinecap="round"
            stroke="url(#ringGrad)"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{completed}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">of {total}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium mt-2">{label}</p>
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useAuthStore();

  // Fetch user's trips
  const { data: trips } = useQuery({
    queryKey: ['user_trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data;
    },
  });

  // Fetch user's bookings
  const { data: bookings } = useQuery({
    queryKey: ['my_bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my');
      return res.data;
    },
  });

  // Fetch recommended destinations
  const { data: recommendations, isLoading: isLoadingRec } = useQuery({
    queryKey: ['recommended_destinations'],
    queryFn: async () => {
      const res = await api.get('/destinations?limit=3');
      return res.data;
    },
  });

  // Fetch weather via backend proxy (Delhi as default)
  const { data: weather, isLoading: isLoadingWeather } = useQuery({
    queryKey: ['dashboard_weather'],
    queryFn: async () => {
      const res = await api.get('/weather?lat=28.6139&lng=77.209');
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const tripsCount = trips?.length ?? 0;
  const bookingsCount = bookings?.length ?? 0;
  const confirmedBookings = bookings?.filter((b: any) => b.status === 'Confirmed') ?? [];
  const totalSpent = bookings?.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0) ?? 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const recentBookings = bookings?.slice(0, 4) ?? [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Welcome Banner ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 40%, #6366f1 70%, #818cf8 100%)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" />
            <circle cx="100" cy="100" r="50" stroke="white" strokeWidth="1" />
            <circle cx="100" cy="100" r="20" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
              {greeting}, {user?.name.split(' ')[0]}
            </h1>
            <p className="text-indigo-200 text-sm md:text-base">
              Here is an overview of your travel activity.
            </p>
          </div>
          <Link to="/planner/setup">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-900/20 hover:bg-indigo-50 transition-colors"
            >
              <Sparkles size={16} /> Plan a Trip
            </motion.button>
          </Link>
        </div>

        {/* Inline Stats */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Bookings', value: bookingsCount, icon: Ticket },
            { label: 'AI Trips', value: tripsCount, icon: PlaneTakeoff },
            { label: 'Upcoming', value: confirmedBookings.length, icon: Map },
            { label: 'Total Spent', value: `${(totalSpent / 1000).toFixed(0)}K`, icon: Wallet, prefix: 'Rs.' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={14} className="text-indigo-200" />
                <span className="text-xs text-indigo-200 font-medium">{s.label}</span>
              </div>
              <div className="text-xl font-extrabold text-white">
                {typeof s.value === 'number' ? <AnimatedCount value={s.value} prefix={s.prefix} /> : s.value}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Bento Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">

        {/* ── Recent Bookings (Large Card - 7 cols) ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)',
          }}
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white">Recent Bookings</h2>
            <Link to="/dashboard/trips" className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent dark:from-indigo-800 dark:via-slate-800" />

              <div className="space-y-4">
                {recentBookings.map((b: any, i: number) => {
                  const Icon = ITEM_ICON[b.itemType] || Compass;
                  return (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex gap-4 pl-1"
                    >
                      {/* Timeline dot */}
                      <div className="relative flex-shrink-0">
                        <div className={cn(
                          'w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 z-10 relative',
                          b.status === 'Confirmed'
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600'
                            : b.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-600'
                              : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-500'
                        )}>
                          <Icon size={13} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              {b.itemName}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {b.destinationName}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                              b.status === 'Confirmed' && 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
                              b.status === 'Completed' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                              b.status === 'Cancelled' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            )}>
                              {b.status}
                            </span>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                              Rs.{b.totalAmount?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ticket size={11} />
                            {b.bookingRef}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Ticket size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 font-medium mb-4">No bookings yet</p>
              <Link to="/destinations">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
                  Browse Destinations
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* ── Travel Stats Ring (5 cols) ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center justify-center"
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)',
          }}
        >
          <h2 className="font-bold text-slate-900 dark:text-white mb-6 self-start">Travel Progress</h2>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <TravelRing
              completed={bookingsCount}
              total={Math.max(bookingsCount, 10)}
              label="Bookings Made"
            />
            <TravelRing
              completed={confirmedBookings.length}
              total={Math.max(bookingsCount, 5)}
              label="Upcoming Trips"
            />
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl py-3">
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                <AnimatedCount value={tripsCount} />
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">AI Plans</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl py-3">
              <div className="text-lg font-extrabold text-amber-600">
                Rs.<AnimatedCount value={Math.round(totalSpent / 1000)} />K
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Total Spent</div>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Actions (full width - 12 cols) ──────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-12"
        >
          <h2 className="font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Sparkles, label: 'AI Planner', desc: 'Create an AI itinerary', to: '/planner/setup', gradient: 'from-indigo-500 to-indigo-600' },
              { icon: Package, label: 'Packages', desc: 'Browse travel packages', to: '/packages', gradient: 'from-emerald-500 to-emerald-600' },
              { icon: Receipt, label: 'Expenses', desc: 'Track trip spending', to: '/dashboard/expenses', gradient: 'from-amber-500 to-amber-600' },
              { icon: CheckSquare, label: 'Packing', desc: 'Manage packing list', to: '/dashboard/packing', gradient: 'from-sky-500 to-sky-600' },
            ].map((action) => (
              <Link key={action.label} to={action.to}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 cursor-pointer hover:shadow-lg transition-shadow group"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br text-white', action.gradient)}>
                    <action.icon size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Weather Widget (6 cols) ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)' }}
        >
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CloudSun size={14} className="text-sky-500" /> Weather -- New Delhi
          </p>
          {isLoadingWeather ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : weather?.current_weather ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                {(() => {
                  const w = getWeatherIcon(weather.current_weather.weathercode);
                  return (
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <w.icon size={40} className={w.color} />
                    </motion.div>
                  );
                })()}
                <div>
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{Math.round(weather.current_weather.temperature)}°C</div>
                  <p className="text-slate-500 text-sm">{getWeatherIcon(weather.current_weather.weathercode).label}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Wind size={12} /> {weather.current_weather.windspeed} km/h
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Thermometer size={12} /> {weather.daily?.temperature_2m_max?.[0]}° / {weather.daily?.temperature_2m_min?.[0]}°
                </div>
              </div>
              {weather.daily && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-5 gap-2">
                  {weather.daily.time?.slice(1, 6).map((date: string, i: number) => {
                    const dayIndex = new Date(date).getDay();
                    const w = getWeatherIcon(weather.daily.weathercode[i + 1]);
                    return (
                      <motion.div
                        key={date}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className="text-center"
                      >
                        <p className="text-slate-400 text-xs mb-1">{DAYS_SHORT[dayIndex]}</p>
                        <w.icon size={16} className={cn('mx-auto mb-1', w.color)} />
                        <p className="text-xs font-medium text-slate-900 dark:text-white">
                          {Math.round(weather.daily.temperature_2m_max[i + 1])}°
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 text-sm">Weather data unavailable</p>
          )}
        </motion.div>

        {/* ── Recommended Destinations (7 cols) ─────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Recommended for You</h2>
            <Link to="/destinations" className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
              Explore <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {isLoadingRec
              ? [1, 2, 3].map((n) => (
                  <div key={n} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))
              : recommendations?.slice(0, 3).map((rec: any, i: number) => (
                  <Link to={`/destinations/${rec._id}`} key={rec._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="group relative rounded-xl overflow-hidden h-40 cursor-pointer"
                    >
                      <img
                        src={rec.image}
                        alt={rec.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="font-bold text-white text-sm leading-tight">{rec.name}</h4>
                        <p className="text-white/70 text-xs mt-0.5">{rec.state}, {rec.country || 'India'}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-amber-400">
                          <span className="text-amber-400">&#9733;</span> {rec.rating}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
