import { useAuthStore } from '@/store/authStore';
import { Search, Bell, Command, UserCircle, AlignLeft, Moon, Sun, ArrowRightLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Analytics Overview',
  '/users': 'Customers CRM',
  '/bookings': 'Bookings Management',
  '/destinations': 'Destinations Directory',
  '/hotels': 'Hotels & Accommodations',
  '/packages': 'Travel Packages',
  '/attractions': 'Attractions',
  '/payments': 'Financial Dashboard',
  '/trips': 'Trip Planner AI',
  '/notifications': 'Messaging Center',
  '/reviews': 'Review Moderation',
  '/expenses': 'Expenses Tracking',
  '/activity-logs': 'Activity Timeline',
  '/settings': 'Workspace Settings',
};

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const { user } = useAuthStore();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Workspace';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-6 select-none shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      {/* Left: Mobile collapse & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 -ml-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
        >
          <AlignLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-[14px] font-medium">
          <span className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">TripWise Inc.</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold tracking-tight">{title}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Fake Command Palette Trigger */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md text-[13px] text-slate-400 font-medium transition-colors cursor-pointer w-48 lg:w-64">
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search...</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-sans text-[10px] font-bold shadow-sm">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-sans text-[10px] font-bold shadow-sm">K</kbd>
          </div>
        </button>

        <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1"></div>

        {/* Action Icons */}
        <button className="relative p-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </button>
      </div>
    </header>
  );
}
