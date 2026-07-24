import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, MapPin, Hotel, Package, Landmark,
  CreditCard, Route, Bell, Star, Receipt, Activity, Settings, LogOut,
  ChevronLeft, ChevronRight, PlaneTakeoff, GripVertical
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
}

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Analytics' },
      { to: '/activity-logs', icon: Activity, label: 'Timeline' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/users', icon: Users, label: 'Customers CRM' },
      { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
      { to: '/payments', icon: CreditCard, label: 'Finance' },
      { to: '/trips', icon: Route, label: 'Trip Planner' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { to: '/destinations', icon: MapPin, label: 'Destinations' },
      { to: '/hotels', icon: Hotel, label: 'Hotels' },
      { to: '/packages', icon: Package, label: 'Packages' },
      { to: '/attractions', icon: Landmark, label: 'Attractions' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { to: '/reviews', icon: Star, label: 'Moderation' },
      { to: '/notifications', icon: Bell, label: 'Messaging' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`h-full flex flex-col bg-white border-r border-slate-200 transition-[width] duration-300 ease-in-out flex-shrink-0 select-none z-20 relative shadow-sm ${
        collapsed ? 'w-20' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <PlaneTakeoff className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-extrabold text-slate-900 tracking-tight text-[17px] truncate font-heading mt-0.5">
              TripWise
            </span>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={group.title} className={`mb-6 ${idx === navGroups.length - 1 ? 'mb-0' : ''}`}>
            {!collapsed ? (
              <p className="px-6 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {group.title}
              </p>
            ) : (
              <div className="h-3 mb-2 flex items-center justify-center">
                <div className="w-4 border-t border-slate-200"></div>
              </div>
            )}
            <div className="space-y-0.5 px-3">
              {group.items.map(({ to, icon: Icon, label }) => (
                <div 
                  key={to} 
                  className="relative group/tooltip"
                  onMouseEnter={() => setHoveredLink(to)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-brand-600 before:rounded-r-md'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      } ${collapsed ? 'justify-center before:hidden' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover/tooltip:text-slate-600'}`} />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </>
                    )}
                  </NavLink>
                  {/* Tooltip for collapsed state */}
                  {collapsed && hoveredLink === to && (
                    <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-[12px] font-medium rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-slate-900">
                      {label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle Button (Floating) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-20 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all z-30"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Profile Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-sm font-bold flex-shrink-0 border border-slate-200">
          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-900 truncate leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] font-medium text-slate-500 truncate leading-tight mt-0.5">{user?.email || 'admin@tripwise.com'}</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 ml-auto"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
