import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, MapPin,
  LogOut, PlaneTakeoff, Bell, Search, ChevronDown,
  Package, ChevronLeft, Menu, Ticket
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Overview', to: '/admin' },
    ]
  },
  {
    label: 'Management',
    items: [
      { icon: Ticket, label: 'Bookings', to: '/admin/bookings' },
      { icon: Users, label: 'Users', to: '/admin/users' },
      { icon: MapPin, label: 'Destinations', to: '/admin/destinations' },
      { icon: Package, label: 'Packages', to: '/admin/packages' },
    ]
  }
];

const SidebarContent = ({
  sidebarOpen,
  setSidebarOpen,
  setMobileOpen,
  location,
  user,
  handleLogout
}: any) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <PlaneTakeoff className="text-indigo-400 flex-shrink-0" size={20} />
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-white text-sm overflow-hidden whitespace-nowrap"
            >
              TripWise Admin
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <button
        onClick={() => setSidebarOpen((o: boolean) => !o)}
        className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
      >
        <ChevronLeft size={16} className={cn('transition-transform', !sidebarOpen && 'rotate-180')} />
      </button>
    </div>

    {/* Search */}
    {sidebarOpen && (
      <div className="px-3 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input placeholder="Search..." className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none w-full" />
        </div>
      </div>
    )}

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          {sidebarOpen && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">{group.label}</p>
          )}
          <div className="space-y-0.5">
            {group.items.map(({ icon: Icon, label, to }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  title={!sidebarOpen ? label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  )}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>

    {/* User footer */}
    <div className="p-3 border-t border-slate-800 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {user?.name.charAt(0).toUpperCase()}
      </div>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 overflow-hidden min-w-0"
          >
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 truncate">{user?.role}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {sidebarOpen && (
        <button onClick={handleLogout} className="p-1.5 rounded-md text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
          <LogOut size={15} />
        </button>
      )}
    </div>
  </div>
);

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications] = useState(5);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0 z-40 fixed top-0 left-0 h-full overflow-hidden"
      >
        <SidebarContent 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setMobileOpen={setMobileOpen}
          location={location}
          user={user}
          handleLogout={handleLogout}
        />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 bg-slate-900 z-50 overflow-hidden"
            >
              <SidebarContent 
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                setMobileOpen={setMobileOpen}
                location={location}
                user={user}
                handleLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <motion.div
        animate={{ marginLeft: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-w-0 md:ml-0"
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu size={18} />
            </button>
            {/* Breadcrumb */}
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="text-slate-900 dark:text-white font-medium">Admin</span>
              {location.pathname !== '/admin' && (
                <>
                  <span className="mx-1.5">/</span>
                  <span className="capitalize">{location.pathname.split('/').pop()}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-48">
              <Search size={14} className="text-slate-400" />
              <input placeholder="Quick search..." className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none w-full" />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell size={18} />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">{user?.name.split(' ')[0]}</span>
              <ChevronDown size={14} className="text-slate-400 hidden md:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
