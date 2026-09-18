import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Reveal, Stagger, StaggerItem, SmoothCounter } from '../../components/animations';
import {
  FileText, Send, Calendar, Zap, MapPin, Clock, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ParentDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Active Requirements', value: 0, icon: <FileText size={20} />, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Offers Received', value: 0, icon: <Send size={20} />, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Active Bookings', value: 0, icon: <Calendar size={20} />, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Flash Requests', value: 0, icon: <Zap size={20} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.06)' },
  ];

  const actions = [
    {
      title: 'Post a Requirement',
      desc: 'Describe what you need and receive offers from qualified tutors nearby',
      icon: <FileText size={24} />, iconBg: '#eef2ff', iconColor: '#4f46e5',
      href: '/requirements/new',
    },
    {
      title: 'Find Tutors Near You',
      desc: 'Browse and compare verified tutors on an interactive map',
      icon: <MapPin size={24} />, iconBg: '#ecfdf5', iconColor: '#059669',
      href: '/tutors',
    },
    {
      title: 'Flash Tutoring',
      desc: 'Need a tutor right now? Find one instantly near you',
      icon: <Zap size={24} />, iconBg: 'rgba(244,63,94,0.06)', iconColor: '#f43f5e',
      href: '/flash', isFlash: true,
    },
  ];

  return (
    <div>
      {/* Greeting */}
      <Reveal delay={0.05} direction="up" blur={3}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-500">Here's what's happening with your tutoring requirements</p>
        </div>
      </Reveal>

      {/* Stats */}
      <Stagger stagger={0.06} delay={0.15}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
                whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900"><SmoothCounter to={s.value} /></div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      {/* Quick actions */}
      <Stagger stagger={0.08} delay={0.35}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {actions.map((a) => (
            <StaggerItem key={a.title}>
              <Link to={a.href}>
                <motion.div
                  className="bg-white rounded-2xl border border-slate-200 p-6 group cursor-pointer relative overflow-hidden"
                  whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)', borderColor: a.isFlash ? '#fda4af' : '#c7d2fe' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Top gradient line on hover */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: a.isFlash ? 'linear-gradient(90deg, #f43f5e, #ec4899)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: a.iconBg, color: a.iconColor }}>
                    {a.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>{a.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{a.desc}</p>
                  <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Get started <ArrowRight size={14} />
                  </span>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      {/* Empty state */}
      <Reveal delay={0.6} direction="up" blur={2}>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-100 text-slate-400">
            <Clock size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>No recent activity</h3>
          <p className="text-slate-500 mb-4">Post your first requirement to connect with nearby tutors</p>
          <Link to="/requirements/new">
            <motion.button
              className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 cursor-pointer"
              whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(99,102,241,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              Post Your First Requirement
            </motion.button>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
