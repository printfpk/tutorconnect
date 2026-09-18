import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import {
  Home, Search, FileText, Zap, MessageSquare, Calendar, User, LogOut,
  Menu, X, Bell, GraduationCap, LayoutDashboard, Send, Star, Settings,
  Shield, Users, BarChart3, Flag, Layers, CheckCircle,
} from 'lucide-react';

interface NavItem { label: string; path: string; icon: React.ReactNode; flash?: boolean }

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'parent': case 'student':
      return [
        { label: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
        { label: 'Find Tutors', path: '/tutors', icon: <Search size={20} /> },
        { label: 'Post Requirement', path: '/requirements/new', icon: <FileText size={20} /> },
        { label: 'Flash Tutoring', path: '/flash', icon: <Zap size={20} />, flash: true },
        { label: 'Messages', path: '/messages', icon: <MessageSquare size={20} /> },
        { label: 'Bookings', path: '/bookings', icon: <Calendar size={20} /> },
        { label: 'Profile', path: '/profile', icon: <User size={20} /> },
      ];
    case 'tutor':
      return [
        { label: 'Dashboard', path: '/tutor/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'Find Requirements', path: '/tutor/requirements', icon: <Search size={20} /> },
        { label: 'Flash Requests', path: '/tutor/flash', icon: <Zap size={20} />, flash: true },
        { label: 'My Offers', path: '/tutor/offers', icon: <Send size={20} /> },
        { label: 'Bookings', path: '/tutor/bookings', icon: <Calendar size={20} /> },
        { label: 'Messages', path: '/tutor/messages', icon: <MessageSquare size={20} /> },
        { label: 'Reviews', path: '/tutor/reviews', icon: <Star size={20} /> },
        { label: 'Profile', path: '/tutor/profile', icon: <User size={20} /> },
      ];
    case 'admin':
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'Users', path: '/admin/users', icon: <Users size={20} /> },
        { label: 'Tutors', path: '/admin/tutors', icon: <GraduationCap size={20} /> },
        { label: 'Requirements', path: '/admin/requirements', icon: <FileText size={20} /> },
        { label: 'Bookings', path: '/admin/bookings', icon: <Calendar size={20} /> },
        { label: 'Flash', path: '/admin/flash', icon: <Zap size={20} /> },
        { label: 'Verification', path: '/admin/verification', icon: <CheckCircle size={20} /> },
        { label: 'Reports', path: '/admin/reports', icon: <Flag size={20} /> },
        { label: 'Categories', path: '/admin/categories', icon: <Layers size={20} /> },
        { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      ];
    default: return [];
  }
}

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavItems(user?.role || 'parent');

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-slate-200 transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 shrink-0 border-b border-slate-200">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text" style={{ WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-display)' }}>
            TutorConnect
          </span>
          <button className="lg:hidden ml-auto p-1 text-slate-400 cursor-pointer" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
                style={{
                  background: isActive(item.path) ? '#eef2ff' : 'transparent',
                  color: isActive(item.path) ? '#4338ca' : '#64748b',
                }}
              >
                {/* Active indicator */}
                {isActive(item.path) && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500"
                    layoutId="sidebar-indicator"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span style={{ color: isActive(item.path) ? '#6366f1' : '#94a3b8' }}>{item.icon}</span>
                {item.label}
                {item.flash && (
                  <motion.span
                    className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-rose-50 text-rose-500"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    live
                  </motion.span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="p-4 shrink-0 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-indigo-500 to-violet-600">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-4 lg:px-6 shrink-0 bg-white border-b border-slate-200">
          <button className="lg:hidden p-2 rounded-lg text-slate-500 cursor-pointer" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <motion.button
            className="relative p-2 rounded-xl text-slate-500 cursor-pointer"
            whileHover={{ backgroundColor: '#f1f5f9' }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} />
          </motion.button>
          {user?.role === 'admin' && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 flex items-center gap-1">
              <Shield size={11} /> Admin
            </span>
          )}
        </header>

        {/* Content with page transition */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
