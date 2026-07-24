import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number; // percentage
    isPositive: boolean;
    label?: string; // e.g., 'vs last month'
  };
}

export default function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="enterprise-card p-5 group hover:-translate-y-0.5 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-card text-slate-600 font-medium">{title}</h3>
        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-100 transition-colors">
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-[28px] font-bold text-slate-900 tracking-tight leading-none">
          {value}
        </div>
        
        {trend && (
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-0.5 text-[13px] font-semibold ${
              trend.value === 0 ? 'text-slate-500' : trend.isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {trend.value === 0 ? (
                <Minus className="w-3.5 h-3.5" />
              ) : trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(trend.value)}%
            </div>
            {trend.label && (
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
