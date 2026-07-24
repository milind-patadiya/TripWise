import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Users, ArrowRight, Star,
  Sparkles, Shield, Clock, BarChart2, CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import DestinationAutocomplete, { PlaceResult } from '@/components/search/DestinationAutocomplete';
import DateRangePicker from '@/components/search/DateRangePicker';
import AISmartSearch from '@/components/search/AISmartSearch';

// ─── Animated counter (no external dep) ─────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

// We will fetch TRENDING destinations dynamically from the API instead.

const FEATURES = [
  { icon: Sparkles, title: 'AI Trip Planning', desc: 'Generate complete day-by-day itineraries powered by Gemini AI in seconds.', color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' },
  { icon: BarChart2, title: 'Smart Budget Allocation', desc: 'Automatically distribute your budget across accommodation, food, transport, and activities.', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' },
  { icon: Shield, title: 'Emergency Support', desc: 'Immediate access to local emergency contacts, hospitals, and safety tips worldwide.', color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600' },
  { icon: Clock, title: 'Real-time Updates', desc: 'Live weather forecasts, flight delays, and destination advisories updated in real-time.', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' },
];

const STATS = [
  { value: 100, label: 'Personalized Itineraries', suffix: '%' },
  { value: 0, label: 'Hidden Booking Fees', suffix: '₹' },
  { value: 24, label: 'Live Weather & Alerts', suffix: '/7' },
  { value: 100, label: 'Secure Payments', suffix: '%' },
];

const FAQS = [
  { q: 'Is TripWise free to use?', a: 'TripWise offers a generous free tier. Premium features like AI itinerary generation and multi-city planning are available on paid plans.' },
  { q: 'How does the AI itinerary generator work?', a: "It uses Google's Gemini AI to analyze your preferences, budget, travel style, and dates to create a personalized day-by-day itinerary with real attraction data." },
  { q: 'Can I collaborate on trip planning with others?', a: 'Yes! You can share your trip plan with friends and family. They can view, suggest changes, and track the itinerary in real time.' },
  { q: 'What real-time data does TripWise provide?', a: 'We integrate OpenWeather API for live forecasts, REST Countries for local info, and an exchange rate API so you always know your actual spend in local currency.' },
];

// ─── FAQ Accordion ──────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        className="w-full flex justify-between items-center px-6 py-4 text-left font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm"
        onClick={() => setIsOpen(o => !o)}
      >
        {q}
        <ChevronDown
          size={18}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-4 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

// ─── Main Landing Page ──────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.08]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [filterTab, setFilterTab] = useState<'standard' | 'ai'>('standard');

  const handleExplore = () => {
    if (selectedPlace?.destinationId) {
      // Direct hit on one of our seeded destinations — go straight there
      navigate(`/destinations/${selectedPlace.destinationId}`);
    } else if (selectedPlace?.name) {
      // Country/State/City not in our DB yet — search destinations for it
      navigate(`/destinations?search=${encodeURIComponent(selectedPlace.name)}`);
    } else {
      navigate('/destinations');
    }
  };

  // Fetch trending destinations from our real API
  const { data: trendingDestinations, isLoading: isLoadingDestinations } = useQuery({
    queryKey: ['landing_destinations'],
    queryFn: async () => {
      const res = await api.get('/destinations?limit=6');
      return res.data;
    }
  });

  return (
    <div className="flex flex-col">
      {/* ── HERO ─────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[100svh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000"
            alt="Travel"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/70" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-8"
          >
            <Sparkles size={14} className="text-amber-400" />
            Powered by Gemini AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] max-w-4xl mx-auto"
          >
            Design your perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-sky-300">
              journey
            </span>{' '}
            with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-light"
          >
            Personalized itineraries, smart budgets, and real-time data — all in one enterprise-grade travel platform.
          </motion.p>

          {/* Search widget tabs */}
          <div className="mt-12 w-full max-w-3xl mx-auto flex justify-center gap-4 mb-2">
            <button
              onClick={() => setFilterTab('standard')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterTab === 'standard' ? 'bg-white text-slate-900' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Standard Search
            </button>
            <button
              onClick={() => setFilterTab('ai')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filterTab === 'ai' ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Sparkles size={14} /> AI Smart Search
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-3xl mx-auto"
          >
            {filterTab === 'standard' ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl">
                <DestinationAutocomplete
                  className="flex-1"
                  onSelect={setSelectedPlace}
                />
                <div className="flex-1 flex items-center bg-white dark:bg-slate-900 rounded-xl gap-2">
                  <DateRangePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onChange={(newCheckIn, newCheckOut) => { setCheckIn(newCheckIn); setCheckOut(newCheckOut); }}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl px-4 py-3 gap-3 md:w-32">
                  <Users className="text-slate-400 flex-shrink-0" size={18} />
                  <input
                    type="number"
                    value={guests}
                    min={1}
                    max={20}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="bg-transparent w-full focus:outline-none text-sm text-slate-800 dark:text-slate-100"
                    aria-label="Number of guests"
                  />
                </div>
                <Button size="lg" onClick={handleExplore} className="rounded-xl px-8 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 h-12">
                  Explore
                </Button>
              </div>
            ) : (
              <AISmartSearch />
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-slate-300 text-xs"
          >
            Plan smarter, travel better with TripWise
          </motion.p>
        </motion.div>

        <a href="#destinations" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce z-10">
          <ChevronDown size={28} />
        </a>
      </section>

      {/* ── STATS ──────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-950 py-16 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ─────────────────────────── */}
      <section id="destinations" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-2">Explore</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Trending Destinations</h2>
              <p className="text-slate-500 mt-2">Curated picks based on traveler reviews and real-time popularity</p>
            </div>
            <Link to="/destinations" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoadingDestinations ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))
            ) : (
              trendingDestinations?.map((dest: any, i: number) => (
                <Link to={`/destinations/${dest._id}`} key={dest._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ y: -8 }}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={dest.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80'}
                        alt={dest.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6">
                      <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">{dest.travelStyles?.[0] || 'Trending'}</span>
                      <h3 className="text-2xl font-bold text-white mt-1">{dest.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-slate-300 text-sm truncate pr-2">{dest.state}</span>
                        <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full shrink-0">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-semibold">{dest.rating}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-2">Platform</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Everything you need to travel smarter</h2>
            <p className="text-slate-500 mt-4">TripWise replaces 10 different apps with one cohesive, AI-powered platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Frequently asked questions</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4e 40%, #312e81 70%, #1e1b4e 100%)' }}>
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
              Start planning your next adventure today
            </h2>
            <p className="text-slate-400 mt-4 text-lg">Free to get started. No credit card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/register">
                <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl px-10">
                  Get started for free
                </Button>
              </Link>
              <Link to="/destinations">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-10">
                  Explore destinations
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 text-sm text-slate-500">
              {['No credit card needed', 'Free AI itineraries', 'Cancel anytime'].map(t => (
                <div key={t} className="flex items-center gap-1.5"><CheckCircle2 size={14} /> {t}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
