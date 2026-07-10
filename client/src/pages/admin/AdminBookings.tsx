import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Ticket, MapPin, Users } from 'lucide-react';
import api from '@/api/axios';
import { cn } from '@/utils/cn';

interface Booking {
  _id: string;
  user: { name: string; email: string };
  itemType: 'Destination' | 'Package' | 'Hotel';
  itemName: string;
  destinationName: string;
  checkIn: string;
  checkOut?: string;
  travelers: number;
  totalAmount: number;
  bookingRef: string;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: string;
  createdAt: string;
}

export default function AdminBookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings');
      return data;
    },
  });

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.itemName.toLowerCase().includes(search.toLowerCase()) ||
      b.destinationName.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Bookings</h1>
          <p className="text-sm text-slate-500">{bookings.length} total bookings · ₹{totalRevenue.toLocaleString('en-IN')} revenue</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 w-64 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
          >
            {['All', 'Confirmed', 'Cancelled', 'Completed'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-500">Booking</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Customer</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Dates</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Travelers</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Amount</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="border-b border-slate-100 dark:border-slate-800">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((b) => (
                  <tr key={b._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                          {b.itemType}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-1">{b.itemName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={10} /> {b.destinationName}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Ticket size={10} /> {b.bookingRef}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{b.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400">{b.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {b.checkOut && (
                        <div className="text-xs text-slate-400">
                          to {new Date(b.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1"><Users size={12} /> {b.travelers}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      ₹{b.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                        b.status === 'Confirmed' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        b.status === 'Cancelled' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        b.status === 'Completed' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      )}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
