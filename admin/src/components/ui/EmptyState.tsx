import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ message = 'No data found', icon }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl border-dashed"
    >
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1">No results found</h3>
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </motion.div>
  );
}
