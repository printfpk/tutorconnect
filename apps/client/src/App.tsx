import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import TutorDashboard from './pages/dashboard/TutorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import FindTutors from './pages/FindTutors';
import FlashPage from './pages/FlashPage';
import TutorRequirements from './pages/dashboard/TutorRequirements';
import PostRequirementPage from './pages/PostRequirementPage';
import MyRequestsPage from './pages/dashboard/MyRequestsPage';
import OffersPage from './pages/dashboard/OffersPage';
import MessagesPage from './pages/dashboard/MessagesPage';
import BookingsPage from './pages/dashboard/BookingsPage';
import TutorOffersPage from './pages/dashboard/TutorOffersPage';
import TutorBookingsPage from './pages/dashboard/TutorBookingsPage';
import TutorCalendarPage from './pages/dashboard/TutorCalendarPage';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pearl)' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Loader2 size={36} style={{ color: 'var(--indigo)' }} />
          </motion.div>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem', fontWeight: 500 }}>Loading TutorConnect...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />

      {/* Parent/Student Dashboard */}
      <Route element={<ProtectedRoute roles={['parent', 'student']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<ParentDashboard />} />
        <Route path="/tutors" element={<FindTutors />} />
        <Route path="/requirements/new" element={<PostRequirementPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/favorites" element={<PlaceholderPage title="Favorites" desc="Tutors you've saved for later." icon="❤️" />} />
        <Route path="/reviews" element={<PlaceholderPage title="Reviews" desc="Your feedback and ratings." icon="⭐" />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile" desc="Manage your account and preferences." icon="👤" />} />
      </Route>

      {/* Tutor Dashboard */}
      <Route element={<ProtectedRoute roles={['tutor']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/tutor/dashboard" element={<TutorDashboard />} />
        <Route path="/tutor/requirements" element={<TutorRequirements />} />
        <Route path="/tutor/flash" element={<FlashPage />} />
        <Route path="/tutor/offers" element={<TutorOffersPage />} />
        <Route path="/tutor/bookings" element={<TutorBookingsPage />} />
        <Route path="/tutor/calendar" element={<TutorCalendarPage />} />
        <Route path="/tutor/messages" element={<MessagesPage />} />
        <Route path="/tutor/reviews" element={<PlaceholderPage title="Reviews" desc="Your ratings and student feedback." icon="⭐" />} />
        <Route path="/tutor/profile" element={<PlaceholderPage title="Tutor Profile" desc="Your professional portfolio." icon="👨‍🏫" />} />
      </Route>

      {/* Admin Dashboard */}
      <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<PlaceholderPage title="Users" icon="👥" />} />
        <Route path="/admin/tutors" element={<PlaceholderPage title="Tutors" icon="🎓" />} />
        <Route path="/admin/requirements" element={<PlaceholderPage title="Requirements" icon="📋" />} />
        <Route path="/admin/bookings" element={<PlaceholderPage title="Bookings" icon="📅" />} />
        <Route path="/admin/flash" element={<PlaceholderPage title="Flash" icon="⚡" />} />
        <Route path="/admin/verification" element={<PlaceholderPage title="Verification" icon="✅" />} />
        <Route path="/admin/reports" element={<PlaceholderPage title="Reports" icon="🚩" />} />
        <Route path="/admin/categories" element={<PlaceholderPage title="Categories" icon="📂" />} />
        <Route path="/admin/analytics" element={<PlaceholderPage title="Analytics" icon="📊" />} />
        <Route path="/admin/settings" element={<PlaceholderPage title="Settings" icon="⚙️" />} />
      </Route>

      {/* Errors */}
      <Route path="/unauthorized" element={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pearl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🚫</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-display)', color: 'var(--gray-900)' }}>403</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>You don't have permission to access this page.</p>
            <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: 'linear-gradient(135deg, var(--indigo), var(--violet))', color: 'white', borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
              Go to Login
            </a>
          </div>
        </div>
      } />

      {/* Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route path="*" element={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pearl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌀</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-display)', color: 'var(--gray-900)' }}>404</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>This page doesn't exist.</p>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: 'linear-gradient(135deg, var(--indigo), var(--violet))', color: 'white', borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
              Go Home
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
}

// Premium placeholder for unimplemented pages
function PlaceholderPage({ title, desc, icon }: { title: string; desc?: string; icon?: string }) {
  return (
    <div>
      <div style={{ padding: '28px 0 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gray-900)', marginBottom: 8 }}>
          {title}
        </h1>
        {desc && <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>{desc}</p>}
      </div>
      <motion.div
        style={{
          background: 'white', borderRadius: 24, padding: '60px 40px',
          border: '1.5px solid var(--gray-100)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          textAlign: 'center',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {icon && <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>{icon}</div>}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
          Coming soon
        </h3>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', maxWidth: 300, margin: '0 auto' }}>
          This feature is being crafted with care and will be available soon.
        </p>
      </motion.div>
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
              borderRadius: 14,
              background: '#1f2937',
              color: 'white',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
