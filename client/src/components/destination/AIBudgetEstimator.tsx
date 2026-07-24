import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, IndianRupee, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';

interface Props {
  destination: string;
}

export default function AIBudgetEstimator({ destination }: Props) {
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState('Moderate');

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['ai_budget', destination, days, travelers, travelStyle],
    enabled: false,
    queryFn: async () => {
      const res = await api.post('/ai/budget', { destination, days, travelers, travelStyle });
      return res.data;
    }
  });

  return (
    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <IndianRupee size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <h3 className="font-bold text-lg text-white">AI Budget Estimator</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-slate-400 uppercase font-semibold">Days</label>
              <select 
                value={days} 
                onChange={e => setDays(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {[1, 3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} Days</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 uppercase font-semibold">Travelers</label>
              <select 
                value={travelers} 
                onChange={e => setTravelers(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(t => <option key={t} value={t}>{t} {t === 1 ? 'Person' : 'People'}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-slate-400 uppercase font-semibold">Travel Style</label>
            <div className="mt-1 flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              {['Budget', 'Moderate', 'Luxury'].map(style => (
                <button
                  key={style}
                  onClick={() => setTravelStyle(style)}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${travelStyle === style ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 mb-2"
        >
          {isFetching ? <Loader2 size={16} className="animate-spin" /> : <IndianRupee size={16} />}
          {isFetching ? 'Estimating...' : 'Calculate Budget'}
        </button>

        <AnimatePresence>
          {data && !isFetching && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-slate-700 space-y-4 overflow-hidden"
            >
              <div className="flex justify-between items-end">
                <div className="text-sm text-slate-400">Total Est. Cost</div>
                <div className="text-2xl font-bold text-emerald-400">₹{data.totalEstimated.toLocaleString('en-IN')}</div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(data.breakdown || {}).map(([category, amount]: any) => (
                  <div key={category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-white font-medium">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(amount / data.totalEstimated) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {data.savingTips?.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400 uppercase">AI Money Saving Tip</span>
                  </div>
                  <p className="text-xs text-amber-200/80 leading-relaxed">{data.savingTips[0]}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
