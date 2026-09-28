import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stagger, StaggerItem } from '../../components/animations';
import { Calendar, Clock, MapPin, Search, ChevronRight, Video, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchVal, setSearchVal] = useState('');

  // Dummy bookings for the UI showcase since booking backend might not be fully implemented
  const bookings = [
    {
      _id: '1',
      tutor: { _id: 't1', firstName: 'Sarah', lastName: 'Johnson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson' },
      subject: 'Mathematics',
      date: new Date(Date.now() + 86400000 * 2), // 2 days from now
      time: '10:00 AM',
      duration: 60,
      mode: 'Online',
      status: 'confirmed'
    },
    {
      _id: '2',
      tutor: { _id: 't2', firstName: 'Michael', lastName: 'Chen', avatar: 'https://ui-avatars.com/api/?name=Michael+Chen' },
      subject: 'Physics',
      date: new Date(Date.now() - 86400000 * 5), // 5 days ago
      time: '04:00 PM',
      duration: 90,
      mode: 'Home Tuition',
      status: 'completed'
    }
  ];

  const filteredBookings = bookings.filter(b => 
    (activeTab === 'upcoming' ? b.date > new Date() : b.date < new Date()) &&
    (b.subject.toLowerCase().includes(searchVal.toLowerCase()) || b.tutor.firstName.toLowerCase().includes(searchVal.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)' }}>Bookings</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Manage your tutoring sessions and schedule.</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, background: 'var(--gray-100)', padding: 4, borderRadius: 12 }}>
          <button 
            onClick={() => setActiveTab('upcoming')}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: activeTab === 'upcoming' ? 'white' : 'transparent', boxShadow: activeTab === 'upcoming' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', fontWeight: 600, color: activeTab === 'upcoming' ? 'var(--gray-900)' : 'var(--gray-500)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: activeTab === 'past' ? 'white' : 'transparent', boxShadow: activeTab === 'past' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', fontWeight: 600, color: activeTab === 'past' ? 'var(--gray-900)' : 'var(--gray-500)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Past Sessions
          </button>
        </div>

        <div style={{ position: 'relative', width: 280 }}>
          <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search sessions..." 
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            style={{ width: '100%', padding: '10px 16px 10px 42px', borderRadius: 999, border: '1px solid var(--gray-200)', outline: 'none' }}
          />
        </div>
      </div>

      <Stagger>
        {filteredBookings.length === 0 ? (
          <div style={{ background: 'white', padding: 60, borderRadius: 24, border: '1px solid var(--gray-200)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Calendar size={32} color="var(--gray-400)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>No sessions found</h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>You don't have any {activeTab} bookings at the moment.</p>
            <Link to="/tutors" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 24px', borderRadius: 999 }}>
              Find a Tutor
            </Link>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <StaggerItem key={booking._id}>
              <motion.div 
                style={{ background: 'white', borderRadius: 24, border: '1px solid var(--gray-200)', padding: 24, marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center', position: 'relative', overflow: 'hidden' }}
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
              >
                {/* Date Block */}
                <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--lavender-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--indigo)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {booking.date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.1 }}>
                    {booking.date.getDate()}
                  </span>
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)' }}>{booking.subject}</h3>
                    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: booking.status === 'confirmed' ? '#dcfce7' : '#f3f4f6', color: booking.status === 'confirmed' ? '#166534' : '#374151' }}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> {booking.time} ({booking.duration} mins)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {booking.mode === 'Online' ? <Video size={16} /> : <MapPin size={16} />} 
                      {booking.mode}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={booking.tutor.avatar} alt="Tutor" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--gray-700)' }}>{booking.tutor.firstName} {booking.tutor.lastName}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeTab === 'upcoming' ? (
                    <>
                      <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 999, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <FileText size={16} /> Resources
                      </button>
                      <button style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 999, background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 600 }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 999 }}>
                      Leave Review
                    </button>
                  )}
                </div>
              </motion.div>
            </StaggerItem>
          ))
        )}
      </Stagger>
    </div>
  );
}
