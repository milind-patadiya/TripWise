import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  PlaneTakeoff, LayoutDashboard, Heart, Bell, Settings, LogOut, Plus,
  CheckSquare, Receipt, ChevronDown, X, Menu
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import api from '@/api/axios';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', to: '/dashboard' },
  { icon: PlaneTakeoff, label: 'My Trips', to: '/dashboard/trips' },
  { icon: Heart, label: 'Wishlist', to: '/dashboard/wishlist' },
  { icon: Receipt, label: 'Expenses', to: '/dashboard/expenses' },
  { icon: CheckSquare, label: 'Packing', to: '/dashboard/packing' },
  { icon: Bell, label: 'Alerts', to: '/dashboard/notifications' },
  { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications_unread_count'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      return res.data as { count: number };
    },
    refetchInterval: 60 * 1000,
  });
  const unreadCount = unreadData?.count ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  // Mobile bottom nav - show 5 key items
  const MOBILE_NAV = NAV_ITEMS.slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Top Navigation Bar (Desktop) ────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                  }}
                >
                  <PlaneTakeoff size={16} className="text-white" />
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base hidden sm:block">
                  TripWise
                </span>
              </Link>

              {/* Desktop Nav Pills */}
              <nav className="hidden lg:flex items-center gap-1">
                {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={cn(
                        'relative flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                        active
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-200/50 dark:border-indigo-700/30"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative flex items-center gap-2">
                        <Icon size={16} />
                        {label}
                        {to === '/dashboard/notifications' && unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5">
              {/* Plan Trip CTA */}
              <Link to="/planner/setup">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="hidden sm:flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  }}
                >
                  <Plus size={16} /> Plan Trip
                </motion.button>
              </Link>

              {/* Notification bell (mobile shortcut) */}
              <Link
                to="/dashboard/notifications"
                className="relative lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                    }}
                  >
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {user?.name.split(' ')[0]}
                    </div>
                    <div className="text-xs text-slate-400 leading-tight">
                      {user?.role === 'admin' ? 'Admin' : 'Traveler'}
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-slate-400 hidden md:block transition-transform duration-200',
                      profileOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {user?.name}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/dashboard/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Settings size={15} /> Account Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                          >
                            <LogOut size={15} /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile hamburger (for tablet-sized screens between mobile bottom bar and desktop nav) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-out Menu ────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed right-0 top-0 h-full w-72 bg-white dark:bg-slate-900 z-50 flex flex-col shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5',
                        active
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon size={18} />
                      {label}
                      {to === '/dashboard/notifications' && unreadCount > 0 && (
                        <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Link to="/planner/setup" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className="w-full flex items-center justify-center gap-2 text-white text-sm font-semibold px-4 py-3 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    }}
                  >
                    <Plus size={16} /> Plan a New Trip
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page Content ────────────────────────────────────────── */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6"
      >
        <Outlet />
      </motion.main>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_NAV.map(({ icon: Icon, label, to }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0',
                  active
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'
                )}
              >
                <div className="relative">
                  <Icon size={20} />
                  {active && (
                    <motion.div
                      layoutId="mobile-tab"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
