import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Users, PlaneTakeoff, MapPin, TrendingUp, ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import api from '@/api/axios';

const BOOKING_DATA = [
  { month: 'Jan', bookings: 120, revenue: 145000 },
  { month: 'Feb', bookings: 180, revenue: 210000 },
  { month: 'Mar', bookings: 150, revenue: 175000 },
  { month: 'Apr', bookings: 240, revenue: 290000 },
  { month: 'May', bookings: 310, revenue: 380000 },
  { month: 'Jun', bookings: 280, revenue: 340000 },
  { month: 'Jul', bookings: 390, revenue: 470000 },
];

const DESTINATION_DATA = [
  { name: 'Goa', value: 35, color: '#4f46e5' },
  { name: 'Jaipur', value: 25, color: '#10b981' },
  { name: 'Manali', value: 20, color: '#f59e0b' },
  { name: 'Others', value: 20, color: '#94a3b8' },
];

const RECENT_USERS = [
  { name: 'Priya Sharma', email: 'priya@email.com', joined: '2 hours ago', trips: 3, status: 'Active' },
  { name: 'Rahul Mehta', email: 'rahul@email.com', joined: '5 hours ago', trips: 1, status: 'Active' },
  { name: 'Ananya Gupta', email: 'ananya@email.com', joined: '1 day ago', trips: 7, status: 'Active' },
  { name: 'Vikram Singh', email: 'vikram@email.com', joined: '2 days ago', trips: 2, status: 'Inactive' },
];

function StatCard({ label, value, icon: Icon, change, color }: { label: string; value: string | number; icon: React.ElementType; change: number; color: string }) {
  const positive = change >= 0;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${positive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

import React from 'react';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });

  const STAT_CARDS = [
    { label: 'Total Users', value: stats?.totalUsers ?? 2841, icon: Users, change: 12.5, color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' },
    { label: 'Total Trips', value: stats?.totalTrips ?? 8392, icon: PlaneTakeoff, change: 8.1, color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' },
    { label: 'Destinations', value: stats?.totalDestinations ?? 180, icon: MapPin, change: 4.3, color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' },
    { label: 'Revenue', value: '₹42.8L', icon: TrendingUp, change: -2.4, color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back. Here's what's happening across the platform.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bookings Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Bookings & Revenue Trend</h2>
            <span className="text-xs text-slate-400">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={BOOKING_DATA}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Destination Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Top Destinations</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={DESTINATION_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {DESTINATION_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {DESTINATION_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly bar chart + Recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-6">Monthly Bookings</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BOOKING_DATA} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="bookings" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Users */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Recent Users</h2>
            <a href="/admin/users" className="text-xs text-indigo-600 font-medium hover:underline">View all</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 text-xs font-semibold text-slate-400 pr-4">User</th>
                  <th className="pb-3 text-xs font-semibold text-slate-400 pr-4">Trips</th>
                  <th className="pb-3 text-xs font-semibold text-slate-400 pr-4">Joined</th>
                  <th className="pb-3 text-xs font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {RECENT_USERS.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white text-xs">{u.name}</div>
                          <div className="text-slate-400 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 text-xs">{u.trips}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{u.joined}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
