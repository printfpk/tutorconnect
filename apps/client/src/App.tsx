import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import TutorDashboard from './pages/dashboard/TutorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { fetchUser, isLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading && isAuthenticated && !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-gray-50)' }}
      >
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin mx-auto mb-4"
            style={{ color: 'var(--color-primary-500)' }}
          />
          <p style={{ color: 'var(--color-gray-500)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Parent/Student Dashboard */}
      <Route
        element={
          <ProtectedRoute roles={['parent', 'student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ParentDashboard />} />
        <Route path="/tutors" element={<PlaceholderPage title="Find Tutors" />} />
        <Route path="/requirements/new" element={<PlaceholderPage title="Post Requirement" />} />
        <Route path="/flash" element={<PlaceholderPage title="Flash Tutoring" />} />
        <Route path="/messages" element={<PlaceholderPage title="Messages" />} />
        <Route path="/bookings" element={<PlaceholderPage title="Bookings" />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
      </Route>

      {/* Tutor Dashboard */}
      <Route
        element={
          <ProtectedRoute roles={['tutor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/tutor/dashboard" element={<TutorDashboard />} />
        <Route path="/tutor/requirements" element={<PlaceholderPage title="Find Requirements" />} />
        <Route path="/tutor/flash" element={<PlaceholderPage title="Flash Requests" />} />
        <Route path="/tutor/offers" element={<PlaceholderPage title="My Offers" />} />
        <Route path="/tutor/bookings" element={<PlaceholderPage title="Bookings" />} />
        <Route path="/tutor/messages" element={<PlaceholderPage title="Messages" />} />
        <Route path="/tutor/reviews" element={<PlaceholderPage title="Reviews" />} />
        <Route path="/tutor/profile" element={<PlaceholderPage title="Tutor Profile" />} />
      </Route>

      {/* Admin Dashboard */}
      <Route
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<PlaceholderPage title="Users" />} />
        <Route path="/admin/tutors" element={<PlaceholderPage title="Tutors" />} />
        <Route path="/admin/requirements" element={<PlaceholderPage title="Requirements" />} />
        <Route path="/admin/bookings" element={<PlaceholderPage title="Bookings" />} />
        <Route path="/admin/flash" element={<PlaceholderPage title="Flash" />} />
        <Route path="/admin/verification" element={<PlaceholderPage title="Verification" />} />
        <Route path="/admin/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/admin/categories" element={<PlaceholderPage title="Categories" />} />
        <Route path="/admin/analytics" element={<PlaceholderPage title="Analytics" />} />
        <Route path="/admin/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-gray-50)' }}>
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-gray-900)' }}>403</h1>
              <p className="mb-4" style={{ color: 'var(--color-gray-500)' }}>You don&apos;t have permission to access this page</p>
              <a href="/login" className="btn btn-primary">Go to Login</a>
            </div>
          </div>
        }
      />

      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-gray-50)' }}>
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-gray-900)' }}>404</h1>
              <p className="mb-4" style={{ color: 'var(--color-gray-500)' }}>Page not found</p>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

// Temporary placeholder for pages not yet built
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="animate-fade-in">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gray-900)' }}
      >
        {title}
      </h1>
      <div className="card p-8 text-center">
        <p style={{ color: 'var(--color-gray-500)' }}>
          This page will be implemented in the next phase
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-gray-900)',
              color: 'white',
              fontSize: '0.875rem',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
