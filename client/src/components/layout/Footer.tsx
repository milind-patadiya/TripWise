import { Link } from 'react-router-dom';
import { PlaneTakeoff } from 'lucide-react';

const FOOTER_LINKS = {
  Discover: [
    { label: 'Destinations', to: '/destinations' },
    { label: 'Packages', to: '/packages' },
    { label: 'Hotels', to: '/hotels' },
    { label: 'Transport', to: '/transport' },
  ],
  Platform: [
    { label: 'AI Trip Planner', to: '/planner/setup' },
    { label: 'User Dashboard', to: '/dashboard' },
    { label: 'My Bookings', to: '/dashboard/trips' },
    { label: 'Expense Tracker', to: '/dashboard/expenses' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
  ],
};

const SOCIAL_LINKS = [
  { label: 'Twitter', href: 'https://twitter.com', letter: 'X' },
  { label: 'Instagram', href: 'https://instagram.com', letter: 'In' },
  { label: 'LinkedIn', href: 'https://linkedin.com', letter: 'Li' },
  { label: 'GitHub', href: 'https://github.com', letter: 'Gh' },
];

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-slate-900 dark:text-white mb-4">
              <PlaneTakeoff className="text-indigo-600" size={22} />
              TripWise
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              The enterprise travel platform that turns complex trip planning into a seamless, AI-powered experience. Built for modern travelers.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-400 transition-colors text-xs font-bold">
                  {s.letter}
                </a>
              ))}
            </div>
          </div>
          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">{group}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} TripWise, Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>for travelers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
