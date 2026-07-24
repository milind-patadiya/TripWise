import { useEffect, useState } from 'react';
import { Users, CalendarCheck, IndianRupee, Route, ArrowRight, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import RevenueChart from '@/components/charts/RevenueChart';
import BookingsPieChart from '@/components/charts/BookingsPieChart';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import Badge from '@/components/ui/Badge';
import api from '@/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Stats {
  totalUsers: number;
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
  bookingStatusBreakdown: { _id: string; count: number }[];
  paymentStatusBreakdown: { _id: string; count: number }[];
  monthlyRevenue: { _id: string; revenue: number; count: number }[];
  userGrowth: { _id: string; count: number }[];
  recentBookings: {
    _id: string;
    bookingRef: string;
    itemName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user?: { name: string };
  }[];
  popularDestinations: { _id: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="enterprise-card h-32 animate-pulse bg-slate-50 border-none" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="enterprise-card h-80 animate-pulse bg-slate-50 border-none" />
          <div className="enterprise-card h-80 animate-pulse bg-slate-50 border-none" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
      {/* Page Header */}
      <div>
        <h1 className="text-title-dashboard mb-1">Analytics Overview</h1>
        <p className="text-body-main">Monitor your workspace performance and real-time activity.</p>
      </div>

      {/* KPI Stats Grid - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={IndianRupee} 
          trend={{ value: 12.5, isPositive: true, label: 'vs last month' }} 
        />
        <StatsCard 
          title="Active Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend={{ value: 8.2, isPositive: true, label: 'vs last month' }} 
        />
        <StatsCard 
          title="Bookings Made" 
          value={stats.totalBookings.toLocaleString()} 
          icon={CalendarCheck} 
          trend={{ value: 2.1, isPositive: false, label: 'vs last month' }} 
        />
        <StatsCard 
          title="Trips Planned" 
          value={stats.totalTrips.toLocaleString()} 
          icon={Route} 
          trend={{ value: 15.3, isPositive: true, label: 'vs last month' }} 
        />
      </div>

      {/* Primary Analytics Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="enterprise-card flex flex-col">
          <div className="enterprise-card-header">
            <div>
              <h3 className="text-title-card">Revenue Trend</h3>
              <p className="text-body-small mt-0.5">Monthly gross revenue volume</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[13px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" /> 12.5%
              </span>
            </div>
          </div>
          <div className="enterprise-card-body flex-1 min-h-[300px]">
            <RevenueChart data={stats.monthlyRevenue} />
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="enterprise-card flex flex-col">
          <div className="enterprise-card-header">
            <div>
              <h3 className="text-title-card">User Registrations</h3>
              <p className="text-body-small mt-0.5">New account creations per month</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[13px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" /> 8.2%
              </span>
            </div>
          </div>
          <div className="enterprise-card-body flex-1 min-h-[300px]">
            <UserGrowthChart data={stats.userGrowth} />
          </div>
        </div>
      </div>

      {/* Secondary Analytics Grid - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions Table */}
        <div className="enterprise-card lg:col-span-2 flex flex-col">
          <div className="enterprise-card-header">
            <div>
              <h3 className="text-title-card">Recent Transactions</h3>
              <p className="text-body-small mt-0.5">Latest bookings across the platform</p>
            </div>
            <Link to="/bookings" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-5 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Ref ID</th>
                  <th className="py-3 px-5 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-5 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-5 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentBookings.slice(0, 5).map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <span className="font-mono text-[13px] text-slate-500">{b.bookingRef}</span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold shadow-sm">
                          {b.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[14px] text-slate-900 leading-tight">{b.user?.name || 'Guest User'}</span>
                          <span className="text-[12px] text-slate-500 truncate max-w-[150px] leading-tight">{b.itemName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-semibold text-[14px] text-slate-900">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-3 px-5"><Badge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown Panel (Split between Pie and List) */}
        <div className="enterprise-card flex flex-col">
          <div className="enterprise-card-header border-none pb-0">
            <div>
              <h3 className="text-title-card">Booking Overview</h3>
              <p className="text-body-small mt-0.5">Status distribution</p>
            </div>
          </div>
          <div className="enterprise-card-body p-4 flex-1 h-[240px]">
            <BookingsPieChart data={stats.bookingStatusBreakdown} />
          </div>
          <div className="border-t border-slate-100 p-5">
            <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4">Top Destinations</h4>
            <div className="space-y-4">
              {stats.popularDestinations.slice(0, 3).map((dest, idx) => (
                <div key={dest._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold bg-slate-100 text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="text-[14px] font-medium text-slate-800">{dest._id}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-slate-900">{dest.count} trips</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
