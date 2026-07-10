import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaneTakeoff, Menu, X, User, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { label: 'Destinations', to: '/destinations' },
  { label: 'Hotels', to: '/hotels' },
  { label: 'Transport', to: '/transport' },
  { label: 'Packages', to: '/packages' },
  { label: 'AI Planner', to: '/planner/setup' },
  { label: 'About', to: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isHeroPage = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navBg = isHeroPage && !scrolled
    ? 'bg-transparent'
    : 'bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-sm';

  const textColor = isHeroPage && !scrolled
    ? 'text-white'
    : 'text-slate-700 dark:text-slate-200';

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', navBg)}>
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <PlaneTakeoff className={cn('transition-colors', isHeroPage && !scrolled ? 'text-white' : 'text-indigo-600')} size={22} />
          <span className={cn('transition-colors font-extrabold tracking-tight', isHeroPage && !scrolled ? 'text-white' : 'text-slate-900 dark:text-white')}>
            TripWise
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'text-sm font-medium transition-colors hover:text-indigo-500',
                textColor
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(p => !p)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium rounded-full px-3 py-1.5 transition-colors',
                  isHeroPage && !scrolled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.name.split(' ')[0]}
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-50"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <LayoutDashboard size={15} /> My Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <User size={15} /> Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                        <Shield size={15} /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100 dark:border-slate-800" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut size={15} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className={cn('text-sm font-medium transition-colors hover:text-indigo-500 hidden md:block', textColor)}>
                Sign in
              </Link>
              <Link to="/register">
                <Button size="sm" className={cn(isHeroPage && !scrolled ? 'bg-white text-indigo-700 hover:bg-slate-100' : '')}>
                  Get started
                </Button>
              </Link>
            </>
          )}
          {/* Mobile menu */}
          <button
            className={cn('md:hidden p-2 rounded-lg', textColor)}
            onClick={() => setMobileOpen(p => !p)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pb-4"
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 mt-3">
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Sign in</Button></Link>
                <Link to="/register" className="flex-1"><Button className="w-full">Get started</Button></Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
