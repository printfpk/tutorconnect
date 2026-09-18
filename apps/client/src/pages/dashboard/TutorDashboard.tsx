import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Reveal, Stagger, StaggerItem, SmoothCounter } from '../../components/animations';
import { Search, Send, Calendar, Zap, Star, MapPin, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TutorDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Nearby Requirements', value: 0, icon: <Search size={20} />, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Active Offers', value: 0, icon: <Send size={20} />, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Active Bookings', value: 0, icon: <Calendar size={20} />, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Flash Opportunities', value: 0, icon: <Zap size={20} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.06)' },
  ];

  const profileStats = [
    { label: 'Rating', value: '—', icon: <Star size={16} /> },
    { label: 'Completed Sessions', value: '0', icon: <CheckCircle size={16} /> },
    { label: 'Response Rate', value: '—', icon: <TrendingUp size={16} /> },
  ];

  return (
    <div>
      <Reveal delay={0.05} direction="up" blur={3}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome, {user?.firstName}! 🎓
          </h1>
          <p className="text-slate-500">Here's your teaching activity overview</p>
        </div>
      </Reveal>

      <Stagger stagger={0.06} delay={0.15}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
                whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-slate-900"><SmoothCounter to={s.value} /></div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Reveal delay={0.3} direction="left" blur={3}>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Your Profile</h3>
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Profile completion</span>
                <span className="font-bold text-indigo-600">20%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: '20%' }}
                  transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Complete your profile to attract more students</p>
            </div>

            <div className="space-y-3">
              {profileStats.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-500">{s.icon} {s.label}</span>
                  <span className="text-sm font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>

            <Link to="/tutor/profile">
              <motion.button
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border-2 border-slate-200 cursor-pointer"
                whileHover={{ borderColor: '#a5b4fc', color: '#4f46e5' }}
                whileTap={{ scale: 0.97 }}
              >
                Complete Profile
              </motion.button>
            </Link>
          </div>
        </Reveal>

        {/* Nearby requirements */}
        <Reveal delay={0.4} direction="right" blur={3} className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Nearby Requirements</h3>
              <Link to="/tutor/requirements" className="text-sm font-semibold text-indigo-600 hover:underline">View all →</Link>
            </div>
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-100 text-slate-400">
                <MapPin size={28} />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>No nearby requirements yet</h4>
              <p className="text-sm text-slate-500 mb-4">Complete your profile and set your service area to discover requirements</p>
              <Link to="/tutor/profile">
                <motion.button
                  className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 cursor-pointer"
                  whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(99,102,241,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Set Up Your Profile
                </motion.button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
