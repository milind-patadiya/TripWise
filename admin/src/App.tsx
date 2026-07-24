import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import AdminLayout from '@/components/layout/AdminLayout';

// Lazy-load all pages
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Users = lazy(() => import('@/pages/Users'));
const Bookings = lazy(() => import('@/pages/Bookings'));
const Destinations = lazy(() => import('@/pages/Destinations'));
const Hotels = lazy(() => import('@/pages/Hotels'));
const Packages = lazy(() => import('@/pages/Packages'));
const Attractions = lazy(() => import('@/pages/Attractions'));
const Payments = lazy(() => import('@/pages/Payments'));
const Trips = lazy(() => import('@/pages/Trips'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Reviews = lazy(() => import('@/pages/Reviews'));
const Expenses = lazy(() => import('@/pages/Expenses'));
const ActivityLogs = lazy(() => import('@/pages/ActivityLogs'));
const Settings = lazy(() => import('@/pages/Settings'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-admin-bg">
    <div className="w-10 h-10 border-4 border-admin-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={user && user.role === 'admin' ? <Navigate to="/dashboard" /> : <Login />}
          />

          {/* Protected Admin Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={user && user.role === 'admin' ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  );
}
