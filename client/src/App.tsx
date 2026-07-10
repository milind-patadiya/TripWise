import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import RootLayout from '@/layouts/RootLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Lazy load Pages for performance
const Landing = lazy(() => import('@/pages/public/Landing'));
const Destinations = lazy(() => import('@/pages/public/Destinations'));
const DestinationDetail = lazy(() => import('@/pages/public/DestinationDetail'));
const Packages = lazy(() => import('@/pages/public/Packages'));
const About = lazy(() => import('@/pages/public/About'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const TripPlannerWizard = lazy(() => import('@/pages/planner/TripPlannerWizard'));
const TripItinerary = lazy(() => import('@/pages/planner/TripItinerary'));
const Hotels = lazy(() => import('@/pages/public/Hotels'));
const Transport = lazy(() => import('@/pages/public/Transport'));
const Checkout = lazy(() => import('@/pages/public/Checkout'));
const UserDashboard = lazy(() => import('@/pages/dashboard/UserDashboard'));
const UserTrips = lazy(() => import('@/pages/dashboard/UserTrips'));
const UserWishlist = lazy(() => import('@/pages/dashboard/UserWishlist'));
const ExpenseTracker = lazy(() => import('@/pages/dashboard/ExpenseTracker'));
const PackingChecklist = lazy(() => import('@/pages/dashboard/PackingChecklist'));
const Notifications = lazy(() => import('@/pages/dashboard/Notifications'));
const Settings = lazy(() => import('@/pages/dashboard/Settings'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminBookings = lazy(() => import('@/pages/admin/AdminBookings'));
const AdminDestinations = lazy(() => import('@/pages/admin/AdminDestinations'));
const AdminPackages = lazy(() => import('@/pages/admin/AdminPackages'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));

// Chatbot
import AIChatbot from '@/components/chatbot/AIChatbot';
import SplashScreen from '@/components/ui/SplashScreen';

// Auth guard
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  const { user } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            {/* Public */}
            <Route element={<RootLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/explore" element={<Navigate to="/destinations" replace />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetail />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              
              {/* AI Planner Routes (Protected) */}
              <Route path="/planner/setup" element={<ProtectedRoute><TripPlannerWizard /></ProtectedRoute>} />
              <Route path="/planner/itinerary" element={<ProtectedRoute><TripItinerary /></ProtectedRoute>} />
            </Route>

            {/* Auth */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            </Route>

            {/* User Dashboard */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
            >
              <Route index element={<UserDashboard />} />
              <Route path="trips" element={<UserTrips />} />
              <Route path="wishlist" element={<UserWishlist />} />
              <Route path="expenses" element={<ExpenseTracker />} />
              <Route path="packing" element={<PackingChecklist />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="destinations" element={<AdminDestinations />} />
              <Route path="packages" element={<AdminPackages />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Global AI Chatbot — shows for logged in users */}
        {user && <AIChatbot />}

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              border: '1px solid #e2e8f0',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
