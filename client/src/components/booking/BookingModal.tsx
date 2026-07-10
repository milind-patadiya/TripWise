import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface BookableItem {
  itemType: 'Destination' | 'Package' | 'Hotel';
  itemId: string;
  itemName: string;
  itemImage?: string;
  destinationName: string;
  /** Price used for calculation. For Hotel: per night. For Package: per person (whole package). For Destination: per day. */
  unitPrice: number;
  priceLabel: string; // e.g. "per night", "per person", "per day"
  /** If set (Package), duration is fixed and checkout date is derived automatically. */
  fixedDurationNights?: number;
}

interface Props {
  item: BookableItem;
  onClose: () => void;
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function BookingModal({ item, onClose }: Props) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(tomorrow());
  const [nights, setNights] = useState(item.fixedDurationNights || 2);
  const [travelers, setTravelers] = useState(2);

  const checkOut = addDays(checkIn, item.fixedDurationNights ?? nights);

  // Pricing logic depends on item type
  const multiplier =
    item.itemType === 'Package' ? travelers :
    item.itemType === 'Hotel' ? nights :
    nights * travelers; // Destination: per-day cost x days x travelers

  const baseFare = Math.round(item.unitPrice * multiplier);
  const taxesAndFees = Math.round(baseFare * 0.12);
  const discount = baseFare > 15000 ? Math.round(baseFare * 0.05) : 0;
  const totalAmount = baseFare + taxesAndFees - discount;

  const handleContinue = () => {
    navigate('/checkout', {
      state: {
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        itemImage: item.itemImage,
        destinationName: item.destinationName,
        checkIn,
        checkOut: item.itemType === 'Package' || item.itemType === 'Hotel' ? checkOut : undefined,
        travelers,
        baseFare,
        taxesAndFees,
        discount,
        totalAmount,
      },
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Book {item.itemName}</h3>
              <p className="text-sm text-slate-500">{item.destinationName}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Calendar size={14} /> {item.itemType === 'Hotel' ? 'Check-in' : 'Travel Date'}
              </label>
              <input
                type="date"
                min={tomorrow()}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-600 text-slate-900 dark:text-white"
              />
            </div>

            {item.itemType !== 'Package' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  {item.itemType === 'Hotel' ? 'Nights' : 'Duration (days)'}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setNights((n) => Math.max(1, n - 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-lg font-bold text-slate-900 dark:text-white w-8 text-center">{nights}</span>
                  <button
                    onClick={() => setNights((n) => Math.min(30, n + 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="text-sm text-slate-400">
                    {item.itemType === 'Hotel' ? `Checkout: ${checkOut}` : ''}
                  </span>
                </div>
              </div>
            )}

            {item.fixedDurationNights !== undefined && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                {item.fixedDurationNights} nights / {item.fixedDurationNights + 1} days · Return: {checkOut}
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Users size={14} /> Travelers
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-bold text-slate-900 dark:text-white w-8 text-center">{travelers}</span>
                <button
                  onClick={() => setTravelers((t) => Math.min(20, t + 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Base fare</span><span>₹{baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Taxes & fees</span><span>₹{taxesAndFees.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Total</span><span className="text-indigo-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl">
              Continue to Book
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
