import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stagger, StaggerItem } from '../../components/animations';
import { Calendar, Clock, User, BookOpen, Video, Home, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

interface Booking {
  _id: string;
  tutor?: { firstName: string; lastName: string; avatar?: string };
  parent?: { firstName: string; lastName: string; avatar?: string };
  requirement?: { subject: string; className: string; teachingMode: string };
  scheduledAt: string;
  durationMinutes: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  location?: string;
  meetingLink?: string;
  amount: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  upcoming:  { label: 'Upcoming',  color: '#2563eb', bg: '#eff6ff', icon: <Clock size={13} /> },
  ongoing:   { label: 'Live Now',  color: '#059669', bg: '#f0fdf4', icon: <CheckCircle size={13} /> },
  completed: { label: 'Completed', color: '#6366f1', bg: '#eef2ff', icon: <CheckCircle size={13} /> },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', icon: <XCircle size={13} /> },
};

export default function TutorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    api.get('/bookings/mine')
      .then(res => setBookings(res.data?.data?.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings
    : filter === 'upcoming' ? bookings.filter(b => b.status === 'upcoming' || b.status === 'ongoing')
    : bookings.filter(b => b.status === 'completed');

  const upcoming = bookings.filter(b => b.status === 'upcoming' || b.status === 'ongoing').length;
  const completed = bookings.filter(b => b.status === 'completed').length;

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: '28px 0 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 6px' }}>
          Bookings
        </h1>
        <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.95rem' }}>Your teaching sessions</p>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total', value: bookings.length, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Upcoming', value: upcoming, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Completed', value: completed, color: '#059669', bg: '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 16, padding: '14px 18px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: s.color, opacity: 0.75 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'upcoming', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              background: filter === f ? 'var(--gray-900)' : 'var(--gray-100)',
              color: filter === f ? 'white' : 'var(--gray-600)',
              transition: 'all 0.2s',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 24, border: '1.5px solid var(--gray-100)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
            No bookings yet
          </h3>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>
            When a parent accepts your offer, sessions will appear here.
          </p>
        </div>
      ) : (
        <Stagger stagger={0.07} delay={0.05} style={{ display: 'grid', gap: 14 }}>
          {filtered.map(booking => {
            const sc = statusConfig[booking.status] || statusConfig.upcoming;
            const dateObj = new Date(booking.scheduledAt);
            const isOnline = booking.requirement?.teachingMode === 'online';
            return (
              <StaggerItem key={booking._id}>
                <motion.div
                  whileHover={{ y: -2 }}
                  style={{ background: 'white', borderRadius: 20, padding: '20px 24px', border: '1.5px solid var(--gray-100)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--lavender-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={20} color="var(--indigo-deep)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--gray-900)', fontFamily: 'var(--font-display)', marginBottom: 3 }}>
                          {booking.requirement?.subject || 'Session'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                          {booking.requirement?.className}
                          {booking.parent && ` · ${booking.parent.firstName} ${booking.parent.lastName}`}
                        </div>
                      </div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: sc.bg, color: sc.color, fontSize: '0.72rem', fontWeight: 700 }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                      <Calendar size={14} color="var(--gray-400)" />
                      {dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                      <Clock size={14} color="var(--gray-400)" />
                      {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {booking.durationMinutes}min
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                      {isOnline ? <Video size={14} color="var(--gray-400)" /> : <Home size={14} color="var(--gray-400)" />}
                      {isOnline ? 'Online' : 'Home Tuition'}
                    </div>
                  </div>

                  {booking.status === 'upcoming' && booking.meetingLink && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '8px 16px', borderRadius: 999, background: '#059669', color: 'white', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}
                    >
                      <Video size={14} /> Join Session
                    </a>
                  )}
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
