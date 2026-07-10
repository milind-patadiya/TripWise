import { useState, useRef, useEffect } from 'react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isBefore, isWithinInterval,
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  checkIn: string; // yyyy-MM-dd or ''
  checkOut: string; // yyyy-MM-dd or ''
  onChange: (checkIn: string, checkOut: string) => void;
  className?: string;
}

function toISO(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export default function DateRangePicker({ checkIn, checkOut, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;

  const gridStart = startOfWeek(startOfMonth(viewMonth));
  const gridEnd = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Start a new selection
      onChange(toISO(day), '');
    } else if (isBefore(day, checkInDate)) {
      // Clicked before current check-in — restart range from here
      onChange(toISO(day), '');
    } else if (isSameDay(day, checkInDate)) {
      // Clicked same day again — do nothing, keep as check-in only
      return;
    } else {
      // Valid check-out
      onChange(toISO(checkInDate), toISO(day));
      setOpen(false);
    }
  };

  const label = checkInDate
    ? checkOutDate
      ? `${format(checkInDate, 'd MMM')} → ${format(checkOutDate, 'd MMM')}`
      : `${format(checkInDate, 'd MMM')} → Select return`
    : 'Check-in → Check-out';

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center bg-white dark:bg-slate-900 rounded-xl px-4 py-3 gap-2 text-left"
      >
        <Calendar className="text-slate-400 flex-shrink-0" size={18} />
        <span className={cn('text-sm truncate', checkInDate ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400')}>
          {label}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-[320px]">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-sm text-slate-900 dark:text-white">{format(viewMonth, 'MMMM yyyy')}</span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] font-bold text-slate-400 text-center py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const disabled = isBefore(day, today);
              const isCurrentMonth = isSameMonth(day, viewMonth);
              const isCheckIn = checkInDate && isSameDay(day, checkInDate);
              const isCheckOut = checkOutDate && isSameDay(day, checkOutDate);
              const inRange =
                checkInDate && checkOutDate &&
                isWithinInterval(day, { start: checkInDate, end: checkOutDate });

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors',
                    disabled && 'text-slate-200 dark:text-slate-700 cursor-not-allowed',
                    !disabled && !isCurrentMonth && 'text-slate-300 dark:text-slate-600',
                    !disabled && isCurrentMonth && !isCheckIn && !isCheckOut && !inRange && 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
                    inRange && !isCheckIn && !isCheckOut && 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
                    (isCheckIn || isCheckOut) && 'bg-indigo-600 text-white font-bold hover:bg-indigo-600'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 mt-3 text-center">
            {!checkInDate ? 'Select your travel start date' : !checkOutDate ? 'Now select your return date' : 'Click "Explore" to search'}
          </p>
        </div>
      )}
    </div>
  );
}
