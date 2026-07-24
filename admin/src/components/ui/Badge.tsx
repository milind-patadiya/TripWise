import { getStatusBadgeClass } from '@/lib/utils';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  // We map specific known statuses to the strict enterprise color variants
  const getEnterpriseBadgeClass = (val: string) => {
    const s = val.toLowerCase();
    if (['completed', 'confirmed', 'paid', 'succeeded', 'active', 'success'].includes(s)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (['pending', 'processing', 'featured', 'warning'].includes(s)) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (['cancelled', 'failed', 'refunded', 'error', 'danger'].includes(s)) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (['admin', 'primary', 'info'].includes(s)) {
      return 'bg-brand-50 text-brand-700 border-brand-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200'; // Default Neutral
  };

  return (
    <span className={twMerge(clsx('badge', getEnterpriseBadgeClass(status), className))}>
      {status}
    </span>
  );
}
