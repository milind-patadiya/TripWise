import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lightbulb, Loader2, Shield, Phone, CreditCard, Bus, Users } from 'lucide-react';
import api from '@/api/axios';

export default function AITravelTips({ destination }: { destination: string }) {
  const { data, isFetching } = useQuery({
    queryKey: ['ai_tips', destination],
    enabled: !!destination,
    queryFn: async () => {
      const res = await api.post('/ai/tips', { destination });
      return res.data;
    }
  });

  if (isFetching) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-indigo-500 mr-3" />
        <span className="text-slate-500 font-medium">Generating local travel tips for {destination}...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center">
          <Lightbulb size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Local Travel Tips</h3>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <Shield className="text-emerald-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Safety & Scams</h4>
            <ul className="list-disc pl-4 space-y-1">
              {data.safetyTips?.map((tip: string, i: number) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-400">{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <Users className="text-indigo-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Local Customs</h4>
            <ul className="list-disc pl-4 space-y-1">
              {data.localCustoms?.map((tip: string, i: number) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-400">{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <Bus className="text-sky-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Getting Around</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{data.transportAdvice}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <CreditCard className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Currency & Payment</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{data.currencyAdvice}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Phone className="text-rose-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Emergency Info</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{data.emergencyInfo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
