import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { MapPin, Plane, Train, Bus, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Transport() {
  const [origin, setOrigin] = useState('New Delhi');
  const [destination, setDestination] = useState('Goa');
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [activeTab, setActiveTab] = useState<'flights' | 'trains' | 'buses'>('flights');

  const { data: transportData, refetch, isLoading, isError, error } = useQuery({
    queryKey: ['transport', origin, destination, date],
    queryFn: async () => {
      const res = await api.get(`/transport/search?origin=${origin}&destination=${destination}&date=${date}`);
      return res.data;
    },
    enabled: false,
    retry: false // Do not retry on 503 errors
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => refetch(), 0);
  };

  useEffect(() => {
    setTimeout(() => refetch(), 0);
  }, []);

  // Extract custom error message from backend if available
  const errorMessage = (error as any)?.response?.data?.message || 'No live transport data is available at the moment. Please try again later.';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      
      {/* Search Header */}
      <div className="bg-slate-900 text-white py-12 px-4 border-b-4 border-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-purple-900/50" />
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-8">Book Flights, Trains & Buses</h1>
          
          <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 rounded-3xl p-4 flex flex-col md:flex-row gap-4 shadow-2xl relative z-10 max-w-5xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
              <MapPin className="text-slate-400 mr-2 shrink-0" size={20} />
              <div className="flex flex-col w-full text-left">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</span>
                <input 
                  type="text" value={origin} onChange={(e) => setOrigin(e.target.value)}
                  className="w-full text-slate-900 dark:text-white bg-transparent outline-none font-semibold text-lg"
                />
              </div>
            </div>

            <div className="flex-1 flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
              <MapPin className="text-slate-400 mr-2 shrink-0" size={20} />
              <div className="flex flex-col w-full text-left">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</span>
                <input 
                  type="text" value={destination} onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-slate-900 dark:text-white bg-transparent outline-none font-semibold text-lg"
                />
              </div>
            </div>

            <div className="flex-1 flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
              <Calendar className="text-slate-400 mr-2 shrink-0" size={20} />
              <div className="flex flex-col w-full text-left">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</span>
                <input 
                  type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full text-slate-900 dark:text-white bg-transparent outline-none font-semibold"
                />
              </div>
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-10 h-[68px] text-lg font-bold">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto max-w-5xl mt-10 px-4">
        <div className="flex gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-max mb-8">
          {[
            { id: 'flights', icon: Plane, label: 'Flights' },
            { id: 'trains', icon: Train, label: 'Trains' },
            { id: 'buses', icon: Bus, label: 'Buses' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-6 py-2.5 font-bold text-sm md:text-base transition-colors shrink-0 rounded-xl z-10 ${
                activeTab === tab.id 
                  ? 'text-indigo-700 dark:text-indigo-300' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="transport-tab"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(n => <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {isError && activeTab === 'flights' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-10 text-center">
            <Plane size={48} className="mx-auto text-red-400 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Transport Service Unavailable</h3>
            <p className="text-red-600 dark:text-red-300 max-w-lg mx-auto">{errorMessage}</p>
          </motion.div>
        )}

        {(isError || (transportData && transportData.trains.length === 0)) && activeTab === 'trains' && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Train size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400">Live train data is currently unavailable for this region.</h3>
          </div>
        )}

        {(isError || (transportData && transportData.buses.length === 0)) && activeTab === 'buses' && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Bus size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400">Live bus data is currently unavailable for this region.</h3>
          </div>
        )}

        {!isLoading && !isError && transportData && (
          <div className="space-y-4">
            
            {activeTab === 'flights' && transportData.flights.map((flight: any) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} key={flight.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center p-2 shrink-0">
                    <img src={flight.logo} alt={flight.airline} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{flight.airline}</h3>
                    <p className="text-xs text-slate-500">{flight.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between flex-1 px-4 md:px-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{flight.departure}</div>
                    <div className="text-sm text-slate-500 font-semibold">{origin}</div>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs text-slate-400 mb-1">{flight.duration}</span>
                    <div className="w-full h-px bg-slate-300 dark:bg-slate-700 relative flex items-center justify-center">
                      <Plane size={16} className="text-indigo-600 bg-white dark:bg-slate-900 px-1 absolute" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 mt-1">{flight.stops}</span>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{flight.arrival}</div>
                    <div className="text-sm text-slate-500 font-semibold">{destination}</div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{flight.price.toLocaleString('en-IN')}</div>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl mt-2 px-8" onClick={() => window.location.href = '/checkout'}>
                    Book
                  </Button>
                </div>
              </motion.div>
            ))}


            {activeTab === 'trains' && transportData.trains.map((train: any) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} key={train.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all duration-300">
                {/* Train mapping similar structure to flight */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Train size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{train.name}</h3>
                    <p className="text-xs text-slate-500">Train No: {train.number}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-1/3 justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold">{train.departure}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock size={16} className="text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-500">{train.duration}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{train.arrival}</div>
                  </div>
                </div>

                <div className="w-full md:w-1/3 flex gap-2 overflow-x-auto pb-2 md:pb-0 justify-end">
                  {train.classes.map((cls: any) => (
                    <div key={cls.type} onClick={() => window.location.href = '/checkout'} className={`border rounded-xl p-3 shrink-0 cursor-pointer ${cls.available ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 opacity-50'}`}>
                      <div className="text-sm font-bold">{cls.type}</div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">₹{cls.price}</div>
                      <div className={`text-xs font-semibold mt-1 ${cls.available ? 'text-emerald-600' : 'text-red-500'}`}>
                        {cls.available ? 'AVAILABLE' : 'WAITLIST'}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}


            {activeTab === 'buses' && transportData.buses.map((bus: any) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} key={bus.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all duration-300">
                {/* Bus structure */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Bus size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{bus.operator}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{bus.type}</p>
                    <div className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded inline-block mt-1">★ {bus.rating}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-1/3 justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold">{bus.departure}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-slate-500">{bus.duration}</span>
                    <div className="w-16 h-px bg-slate-300 dark:bg-slate-700 my-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{bus.arrival}</div>
                  </div>
                </div>

                <div className="w-full md:w-1/3 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{bus.price}</div>
                  <Button className="bg-indigo-600 text-white font-bold px-8 py-2.5 rounded-xl" onClick={() => window.location.href = '/checkout'}>Book</Button>
                </div>
              </motion.div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
