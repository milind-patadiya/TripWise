import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Plus, ArrowRightLeft, Check, ThumbsUp, MapPin, CloudSun, Loader2 } from 'lucide-react';
import api from '@/api/axios';
import DestinationAutocomplete, { PlaceResult } from '@/components/search/DestinationAutocomplete';

export default function AICompareModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [destA, setDestA] = useState<PlaceResult | null>(null);
  const [destB, setDestB] = useState<PlaceResult | null>(null);

  const { data: comparison, isFetching, refetch, error } = useQuery({
    queryKey: ['compare', destA?.name, destB?.name],
    enabled: false,
    queryFn: async () => {
      const res = await api.post('/ai/compare', { destA: destA?.name, destB: destB?.name });
      return res.data;
    }
  });

  const handleCompare = () => {
    if (destA && destB) refetch();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={20} />
            <h2 className="font-bold text-lg">AI Destination Compare</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!comparison && !isFetching && (
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-center text-slate-500 dark:text-slate-400">
                Select two destinations and our AI will provide a comprehensive side-by-side comparison across weather, budget, crowd level, and more.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-indigo-600 z-10 hidden md:flex">
                  <ArrowRightLeft size={18} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Destination 1</label>
                  <DestinationAutocomplete 
                    placeholder="E.g. Goa, India" 
                    onSelect={setDestA} 
                    className="border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  {destA && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 p-3 rounded-xl flex items-center justify-between">
                      <span className="font-semibold">{destA.name}</span>
                      <button onClick={() => setDestA(null)}><X size={16} /></button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Destination 2</label>
                  <DestinationAutocomplete 
                    placeholder="E.g. Bali, Indonesia" 
                    onSelect={setDestB} 
                    className="border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  {destB && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 p-3 rounded-xl flex items-center justify-between">
                      <span className="font-semibold">{destB.name}</span>
                      <button onClick={() => setDestB(null)}><X size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleCompare}
                  disabled={!destA || !destB}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2"
                >
                  Generate AI Comparison
                </button>
              </div>
            </div>
          )}

          {isFetching && (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 size={48} className="text-indigo-600 animate-spin mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Destinations...</h3>
              <p className="text-slate-500 text-center max-w-md">Our AI is compiling weather data, budget estimates, and traveler feedback to compare {destA?.name} and {destB?.name}.</p>
            </div>
          )}

          {error && !isFetching && (
            <div className="py-10 text-center text-red-500 font-medium">Failed to generate comparison. Please try again.</div>
          )}

          {comparison && !isFetching && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Winner Banner */}
              {comparison.winner !== 'Tie' && (
                <div className="bg-gradient-to-r from-amber-200 to-amber-100 border border-amber-300 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm">
                  <ThumbsUp className="text-amber-600" />
                  <span className="font-bold text-amber-900">AI Winner: {comparison.winner}</span>
                </div>
              )}

              {/* Comparison Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <div className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider flex items-center justify-center">Category</div>
                  <div className="p-4 font-extrabold text-slate-900 dark:text-white text-lg text-center border-l border-slate-200 dark:border-slate-800">{destA?.name}</div>
                  <div className="p-4 font-extrabold text-slate-900 dark:text-white text-lg text-center border-l border-slate-200 dark:border-slate-800">{destB?.name}</div>
                </div>
                
                <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {comparison.comparison.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="p-4 font-semibold text-slate-700 dark:text-slate-300 flex items-center">{item.category}</div>
                      <div className="p-4 text-sm text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800">{item.destA}</div>
                      <div className="p-4 text-sm text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800">{item.destB}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Dest A */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white text-center">{destA?.name}</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3 uppercase text-xs tracking-widest">Pros</h4>
                    <ul className="space-y-2">
                      {comparison.prosConsA.pros.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                          <Check size={16} className="mt-0.5 shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5">
                    <h4 className="font-bold text-red-700 dark:text-red-400 mb-3 uppercase text-xs tracking-widest">Cons</h4>
                    <ul className="space-y-2">
                      {comparison.prosConsA.cons.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                          <X size={16} className="mt-0.5 shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Dest B */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white text-center">{destB?.name}</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3 uppercase text-xs tracking-widest">Pros</h4>
                    <ul className="space-y-2">
                      {comparison.prosConsB.pros.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                          <Check size={16} className="mt-0.5 shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5">
                    <h4 className="font-bold text-red-700 dark:text-red-400 mb-3 uppercase text-xs tracking-widest">Cons</h4>
                    <ul className="space-y-2">
                      {comparison.prosConsB.cons.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                          <X size={16} className="mt-0.5 shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => { setDestA(null); setDestB(null); }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Compare other destinations
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
