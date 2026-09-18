import { motion } from 'framer-motion';
import { Reveal, Stagger, StaggerItem, SmoothCounter } from '../../components/animations';
import {
  Users, GraduationCap, CheckCircle, FileText, Calendar,
  Zap, Shield, Flag, TrendingUp, AlertTriangle,
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: 0, icon: <Users size={20} />, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Total Tutors', value: 0, icon: <GraduationCap size={20} />, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Verified Tutors', value: 0, icon: <CheckCircle size={20} />, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Open Requirements', value: 0, icon: <FileText size={20} />, color: '#818cf8', bg: '#eef2ff' },
    { label: 'Active Bookings', value: 0, icon: <Calendar size={20} />, color: '#059669', bg: '#ecfdf5' },
    { label: 'Flash Requests', value: 0, icon: <Zap size={20} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.06)' },
    { label: 'Pending Verifications', value: 0, icon: <Shield size={20} />, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Open Reports', value: 0, icon: <Flag size={20} />, color: '#ef4444', bg: '#fef2f2' },
  ];

  return (
    <div>
      <Reveal delay={0.05} direction="up" blur={3}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Admin Dashboard</h1>
          <p className="text-slate-500">Platform overview and management</p>
        </div>
      </Reveal>

      <Stagger stagger={0.05} delay={0.1}>
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

      <Stagger stagger={0.1} delay={0.4}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StaggerItem>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Recent Activity</h3>
              <div className="text-center py-8">
                <TrendingUp size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Activity feed will appear here</p>
              </div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Pending Verifications</h3>
              <div className="text-center py-8">
                <AlertTriangle size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No pending verifications</p>
              </div>
            </div>
          </StaggerItem>
        </div>
      </Stagger>
    </div>
  );
}
