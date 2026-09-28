import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import {
  Home, Search, FileText, Zap, MessageSquare, Calendar, User, LogOut,
  Bell, GraduationCap, LayoutDashboard, Send, Star, Settings,
  Shield, Users, BarChart3, Flag, Layers, CheckCircle, Menu, X,
  ChevronDown, Heart, BookOpen, ArrowRight,
} from 'lucide-react';
import gsap from 'gsap';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  flash?: boolean;
  badge?: string;
}

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'parent':
    case 'student':
      return [
        { label: 'Home', path: '/dashboard', icon: <Home size={18} /> },
        { label: 'Find Tutors', path: '/tutors', icon: <Search size={18} /> },
        { label: 'My Requests', path: '/my-requests', icon: <FileText size={18} /> },
        { label: 'Offers', path: '/offers', icon: <Send size={18} /> },
        { label: 'Bookings', path: '/bookings', icon: <Calendar size={18} /> },
        { label: 'Messages', path: '/messages', icon: <MessageSquare size={18} />, badge: '3' },
        { label: 'Favorites', path: '/favorites', icon: <Heart size={18} /> },
        { label: 'Reviews', path: '/reviews', icon: <Star size={18} /> },
      ];
    case 'tutor':
      return [
        { label: 'Dashboard', path: '/tutor/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Discover', path: '/tutor/requirements', icon: <Search size={18} /> },
        { label: 'Flash ⚡', path: '/tutor/flash', icon: <Zap size={18} />, flash: true },
        { label: 'My Offers', path: '/tutor/offers', icon: <Send size={18} /> },
        { label: 'Bookings', path: '/tutor/bookings', icon: <Calendar size={18} /> },
        { label: 'Calendar', path: '/tutor/calendar', icon: <Calendar size={18} /> },
        { label: 'Messages', path: '/tutor/messages', icon: <MessageSquare size={18} /> },
        { label: 'Reviews', path: '/tutor/reviews', icon: <Star size={18} /> },
        { label: 'Profile', path: '/tutor/profile', icon: <User size={18} /> },
      ];
    case 'admin':
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Users', path: '/admin/users', icon: <Users size={18} /> },
        { label: 'Tutors', path: '/admin/tutors', icon: <GraduationCap size={18} /> },
        { label: 'Requirements', path: '/admin/requirements', icon: <FileText size={18} /> },
        { label: 'Bookings', path: '/admin/bookings', icon: <Calendar size={18} /> },
        { label: 'Flash', path: '/admin/flash', icon: <Zap size={18} /> },
        { label: 'Verification', path: '/admin/verification', icon: <CheckCircle size={18} /> },
        { label: 'Reports', path: '/admin/reports', icon: <Flag size={18} /> },
        { label: 'Categories', path: '/admin/categories', icon: <Layers size={18} /> },
        { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
      ];
    default:
      return [];
  }
}

function getGreeting(role: string) {
  switch (role) {
    case 'tutor': return { title: 'TutorConnect', subtitle: 'Teach · Inspire · Earn' };
    case 'admin': return { title: 'TutorConnect', subtitle: 'Admin Console' };
    default: return { title: 'TutorConnect', subtitle: 'Find · Learn · Grow' };
  }
}

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navItems = getNavItems(user?.role || 'parent');
  const branding = getGreeting(user?.role || 'parent');

  useEffect(() => { setSidebarOpen(false); setProfileOpen(false); }, [location.pathname]);

  // Animate sidebar in on mobile
  useEffect(() => {
    if (sidebarRef.current && window.innerWidth < 1024) {
      gsap.to(sidebarRef.current, {
        x: sidebarOpen ? 0 : -260,
        duration: 0.35,
        ease: 'power3.out',
      });
    }
  }, [sidebarOpen]);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path: string) => location.pathname === path;

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const roleColor = user?.role === 'tutor'
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : user?.role === 'admin'
    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
    : 'linear-gradient(135deg, #5c6ac4, #7c3aed)';

  const roleLabel = user?.role === 'tutor' ? 'Tutor' : user?.role === 'admin' ? 'Admin' : 'Parent';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--pearl)' }}>
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40, backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        ref={sidebarRef}
        style={{
          width: 'var(--sidebar-width)',
          flexShrink: 0,
          background: 'white',
          borderRight: '1px solid var(--gray-100)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 50,
          transform: undefined,
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        }}
        className="lg:relative lg:translate-x-0"
      >
        {/* Logo — exact match to login page */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          borderBottom: '1px solid var(--gray-100)',
          flexShrink: 0,
        }}>
          {/* Orange circle SVG logo — same as AuthSidebar */}
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
            <path d="M24 8C15.16 8 8 15.16 8 24s7.16 16 16 16 16-7.16 16-16S32.84 8 24 8zm0 28c-6.63 0-12-5.37-12-12s5.37-12 12-12 12 5.37 12 12-5.37 12-12 12z" fill="#ea580c"/>
            <path d="M24 16c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#ea580c"/>
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#111827', lineHeight: 1.1 }}>
              TutorConnect
            </div>
            <div style={{ fontSize: '0.58rem', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>
              Learn · Grow · Together
            </div>
          </div>
          {/* Mobile close */}
          <button
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4 }}
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                  style={{ position: 'relative' }}
                >
                  {/* Active left bar */}
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: 20, borderRadius: 999,
                        background: 'linear-gradient(180deg, #5c6ac4, #7c3aed)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span style={{
                    color: active ? '#5c6ac4' : 'var(--gray-400)',
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.15s',
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.flash && (
                    <motion.span
                      style={{
                        background: 'rgba(244,63,94,0.08)',
                        color: '#f43f5e',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '2px 7px',
                        borderRadius: 999,
                        textTransform: 'uppercase',
                      }}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      LIVE
                    </motion.span>
                  )}
                  {item.badge && (
                    <span style={{
                      background: item.badge === '3' ? '#f43f5e' : 'var(--indigo)', color: 'white',
                      fontSize: '0.6rem', fontWeight: 700,
                      width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings separator */}
          <div className="divider" style={{ margin: '16px 0 12px' }} />
          {user?.role === 'parent' && (
            <Link to="/learning-hub" className={`nav-link ${isActive('/learning-hub') ? 'active' : ''}`} style={{ position: 'relative' }}>
              <span style={{ color: isActive('/learning-hub') ? '#5c6ac4' : 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
                <CheckCircle size={18} />
              </span>
              <span style={{ flex: 1 }}>Learning Hub</span>
              <span style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>New</span>
            </Link>
          )}
          <Link to={user?.role === 'tutor' ? '/tutor/profile' : user?.role === 'admin' ? '/admin/settings' : '/settings'}
            className={`nav-link ${isActive('/settings') || isActive('/tutor/profile') || isActive('/admin/settings') ? 'active' : ''}`}
          >
            <span style={{ color: (isActive('/settings') || isActive('/tutor/profile') || isActive('/admin/settings')) ? '#5c6ac4' : 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
              <Settings size={18} />
            </span>
            <span style={{ flex: 1 }}>Settings</span>
          </Link>
        </nav>

        {/* Learning banner ad (Parent) */}
        {user?.role === 'parent' && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f3e8ff, #e0e7ff, #fce7f3)',
              borderRadius: 16, padding: '16px', position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: '#312e81', lineHeight: 1.2, zIndex: 1 }}>
                Better<br/>Learning<br/>Brighter<br/>Tomorrows.
              </div>
              <motion.button
                style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 1 }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              >
                <ArrowRight size={14} color="#5c6ac4" />
              </motion.button>
              <div style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)', borderRadius: '50%' }} />
            </div>
          </div>
        )}

        {/* User card */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--gray-100)', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: 'var(--gray-50)',
            marginBottom: 8,
          }}>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8rem', background: roleColor, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fullName}
              </div>
              <div style={{ fontSize: '0.67rem', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {roleLabel}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 10, border: 'none', background: 'transparent',
              fontSize: '0.82rem', fontWeight: 500, color: 'var(--gray-500)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff1f2'; (e.currentTarget as HTMLElement).style.color = '#f43f5e'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--gray-500)'; }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingLeft: 240 }}>

        {/* ── Top bar ── */}
        <header style={{
          height: 'var(--topbar-height)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center',
          gap: 12, padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 30,
          flexShrink: 0,
        }}>
          {/* Mobile hamburger */}
          <motion.button
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--gray-600)' }}
            whileHover={{ background: 'var(--gray-100)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </motion.button>

          {/* Search bar */}
          <div style={{
            flex: 1, maxWidth: 500,
            position: 'relative',
            display: 'flex', alignItems: 'center',
          }}>
            <Search size={16} style={{ position: 'absolute', left: 16, color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input
              placeholder={user?.role === 'tutor' ? 'Search requirements...' : 'Search subjects, skills, or tutors...'}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 999,
                fontSize: '0.85rem',
                background: 'var(--gray-50)',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                color: 'var(--gray-700)',
                transition: 'all 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--indigo)';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(92,106,196,0.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--gray-200)';
                e.target.style.background = 'var(--gray-50)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{
              position: 'absolute', right: 8,
              background: 'white', border: '1px solid var(--gray-200)',
              borderRadius: 6, padding: '2px 6px',
              fontSize: '0.65rem', fontWeight: 600, color: 'var(--gray-400)',
              display: 'flex', alignItems: 'center', gap: 2, pointerEvents: 'none',
            }}>
              ⌘ K
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <motion.button
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gray-600)', position: 'relative',
                }}
                whileHover={{ background: 'var(--gray-100)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotifOpen(o => !o)}
              >
                <Bell size={18} />
                {/* Notification dot */}
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#f43f5e', border: '1.5px solid white',
                }} />
              </motion.button>
            </div>

            {/* Messages */}
            <motion.button
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gray-600)',
              }}
              whileHover={{ background: 'var(--gray-100)' }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare size={18} />
            </motion.button>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <motion.button
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'var(--gray-50)',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: 999,
                  padding: '5px 12px 5px 6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                whileHover={{ borderColor: 'var(--gray-300)', background: 'white' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setProfileOpen(o => !o)}
              >
                <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem', background: roleColor }}>
                  {initials}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  {user?.firstName}
                </span>
                <ChevronDown size={13} style={{ color: 'var(--gray-400)' }} />
              </motion.button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'white',
                      border: '1px solid var(--gray-100)',
                      borderRadius: 16,
                      padding: '8px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                      minWidth: 180,
                      zIndex: 100,
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--gray-100)', marginBottom: 6 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-900)' }}>{fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{user?.email}</div>
                    </div>
                    {[
                      { label: 'View Profile', icon: <User size={14} />, path: user?.role === 'tutor' ? '/tutor/profile' : '/profile' },
                      { label: 'Settings', icon: <Settings size={14} />, path: '/settings' },
                    ].map(item => (
                      <Link key={item.label} to={item.path}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 10,
                          fontSize: '0.82rem', fontWeight: 500, color: 'var(--gray-700)',
                          textDecoration: 'none', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--gray-50)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: 6, paddingTop: 6 }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 10, border: 'none',
                          background: 'transparent', fontSize: '0.82rem', fontWeight: 500,
                          color: '#f43f5e', cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff1f2'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin badge */}
            {user?.role === 'admin' && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px',
                background: 'rgba(245,158,11,0.08)',
                color: '#d97706',
                borderRadius: 999,
                fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                border: '1px solid rgba(245,158,11,0.15)',
              }}>
                <Shield size={10} /> Admin
              </span>
            )}
          </div>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 24, scale: 0.99, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, scale: 1.005, filter: 'blur(4px)' }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  opacity: { duration: 0.35 },
                  filter: { duration: 0.4 },
                }}
                style={{ willChange: 'transform, opacity' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
