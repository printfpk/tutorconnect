import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { requirementsApi, type Requirement } from '../../lib/requirementsApi';
import api from '../../lib/api';
import { Reveal, Stagger, StaggerItem, SmoothCounter } from '../../components/animations';
import {
  Search, MapPin, Zap, Calendar, Star, ArrowRight, ChevronRight,
  FileText, MessageSquare, Clock, Users, CheckCircle, TrendingUp,
  Navigation, Filter, Heart, MoreHorizontal, Play, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Categories ─────────────────────────────────── */
const CATEGORIES = [
  { name: 'Mathematics', icon: 'π', color: '#3b82f6', bg: '#eff6ff' },
  { name: 'Science', icon: '⚛', color: '#ef4444', bg: '#fef2f2' },
  { name: 'Music', icon: '♫', color: '#f59e0b', bg: '#fffbeb' },
  { name: 'Art & Craft', icon: '🎨', color: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Coding', icon: '</>', color: '#10b981', bg: '#ecfdf5' },
  { name: 'Languages', icon: '🌐', color: '#6366f1', bg: '#eef2ff' },
  { name: 'Dance', icon: '💃', color: '#f97316', bg: '#fff7ed' },
  { name: 'Chess', icon: '♟', color: '#ec4899', bg: '#fdf2f8' },
];

/* ─── Map component (Right Sidebar) ──────────────── */
function MiniMapArea({ tutors = [] }: { tutors: any[] }) {
  const pins = tutors.slice(0, 3).map((t, i) => ({
    id: t._id || i,
    x: 20 + i * 20, 
    y: 30 + i * 15, 
    img: t.avatar || `https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=random`
  }));
  pins.push({ id: 'user', x: 50, y: 50, img: '' }); // User pin

  return (
    <div style={{
      background: 'white', borderRadius: 24, padding: '20px',
      border: '1px solid var(--gray-100)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)' }}>Tutors Near You</h3>
          <span style={{ background: '#ecfdf5', color: '#10b981', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }}/> Live
          </span>
        </div>
        <button style={{ background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
          View Map <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ position: 'relative', height: 180, borderRadius: 16, overflow: 'hidden', background: '#f8fafc', border: '1px solid var(--gray-100)' }}>
        {/* Map lines background */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
          <path d="M 0,50% Q 30%,40% 50%,50% T 100%,50%" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M 50%,0 L 50%,100%" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M 0,20% L 100%,80%" stroke="#e2e8f0" strokeWidth="2" fill="none" />
          <path d="M 0,80% L 100%,20%" stroke="#e2e8f0" strokeWidth="2" fill="none" />
        </svg>
        
        {/* Radar circles */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 140, height: 140, borderRadius: '50%', border: '1px dashed #cbd5e1', opacity: 0.5 }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '1px dashed #cbd5e1', opacity: 0.5 }} />

        {/* Pins */}
        {pins.map(pin => (
          <div key={pin.id} style={{
            position: 'absolute', left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%,-50%)',
            zIndex: pin.id === 'user' ? 10 : 5
          }}>
            {pin.id === 'user' ? (
              // User pin
              <div style={{ position: 'relative' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#3b82f6', border: '3px solid white', boxShadow: '0 2px 8px rgba(59,130,246,0.5)' }} />
                <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', animation: 'pulse 2s ease-out infinite' }} />
              </div>
            ) : (
              // Tutor pin
              <div style={{
                width: 24, height: 24, borderRadius: '50%', border: '2px solid white', overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <img src={pin.img} alt="Tutor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────── */
export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('All');
  const [myRequirements, setMyRequirements] = useState<Requirement[]>([]);
  const [nearbyTutors, setNearbyTutors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch real requirements for this user
        const reqRes = await requirementsApi.getMine();
        setMyRequirements(reqRes.data.data.requirements || []);

        // Real tutors API does not exist yet. Using empty state until backend is built.
        setNearbyTutors([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = "Good morning,";
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, padding: '24px 0 40px' }}>
      
      {/* ══════════════ LEFT / MAIN COLUMN ══════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
        
        {/* ── HERO BANNER ── */}
        <Reveal delay={0.05} direction="up">
          <div style={{
            position: 'relative', borderRadius: 28, overflow: 'hidden',
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
            padding: '40px 32px 100px', // Extra bottom padding to overlap the cards
            boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
          }}>
            {/* Background artwork (Gradient & Image) */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '60%', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #fdfbfb 0%, transparent 100%)', zIndex: 1 }} />
              <img 
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                alt="Student learning" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, maskImage: 'linear-gradient(to left, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 100%)' }} 
              />
              {/* Floating pills on the image */}
              <motion.div style={{ position: 'absolute', top: 40, right: 120, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 2 }} animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <span style={{ color: '#8b5cf6' }}>Mathematics</span>
              </motion.div>
              <motion.div style={{ position: 'absolute', top: 90, right: 60, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 2 }} animate={{ y: [0, 5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                <span style={{ color: '#10b981' }}>Coding</span>
              </motion.div>
              <motion.div style={{ position: 'absolute', bottom: 120, right: 100, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 2 }} animate={{ y: [0, -4, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                <span style={{ color: '#f59e0b' }}>Drawing</span>
              </motion.div>
            </div>

            {/* Text Content */}
            <div style={{ position: 'relative', zIndex: 5, maxWidth: '65%' }}>
              <div style={{ fontSize: '1.1rem', color: 'var(--gray-600)', fontWeight: 500, marginBottom: 4 }}>{greeting}</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1 }}>
                {user?.firstName || 'Prashanta'} <span style={{ display: 'inline-block', animation: 'wave 2s infinite', transformOrigin: '70% 70%' }}>👋</span>
              </h1>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>Find the right person to learn from.</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', lineHeight: 1.5, maxWidth: 420 }}>
                Explore trusted tutors around you, compare their offers, and learn on your terms.
              </p>
            </div>

            {/* Floating Search Bar */}
            <motion.div
              style={{
                position: 'absolute', left: 32, right: 32, bottom: 20, zIndex: 10,
                background: 'white', borderRadius: 999, padding: '8px 8px 8px 24px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: searchFocused ? '0 12px 40px rgba(0,0,0,0.1)' : '0 8px 24px rgba(0,0,0,0.06)',
                border: searchFocused ? '2px solid var(--indigo)' : '2px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <Search size={20} color="var(--gray-400)" />
              <input
                placeholder="What do you want to learn today?"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--gray-800)', background: 'transparent' }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div style={{ width: 1, height: 24, background: 'var(--gray-200)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', color: 'var(--gray-600)', fontSize: '0.85rem', fontWeight: 500 }}>
                <MapPin size={16} color="#f43f5e" /> Bhubaneswar, 751001
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'var(--gray-50)', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer' }}>
                5 km <ChevronRight size={14} />
              </div>
              <motion.button
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gray-900)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          </div>
        </Reveal>

        {/* ── QUICK ACTION CARDS ── */}
        <Stagger stagger={0.1} delay={0.2}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: -10 }}>
            {/* Find a Tutor - High contrast fix */}
            <StaggerItem>
              <Link to="/tutors" style={{ textDecoration: 'none' }}>
                <motion.div
                  style={{
                    background: '#111827', borderRadius: 24, padding: '24px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    height: '100%', display: 'flex', flexDirection: 'column'
                  }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(92,106,196,0.3)' }}
                >
                  <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" alt="Tutor" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,24,39,0.9), rgba(17,24,39,0.1))', zIndex: 1 }} />
                  
                  <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Search size={20} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)', marginBottom: 6 }}>Find a Tutor</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, maxWidth: '85%' }}>Explore verified tutors around you.</p>
                  </div>
                  <div style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-end', marginTop: 12, width: 32, height: 32, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', color: '#111827' }}>
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>

            {/* Post a Requirement */}
            <StaggerItem>
              <Link to="/requirements/new" style={{ textDecoration: 'none' }}>
                <motion.div
                  style={{
                    background: 'white', borderRadius: 24, padding: '24px', position: 'relative', overflow: 'hidden',
                    border: '1px solid var(--gray-100)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    height: '100%', display: 'flex', flexDirection: 'column'
                  }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(16,185,129,0.1)' }}
                >
                  {/* Decorative background shapes */}
                  <div style={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, borderRadius: '20px', background: 'rgba(16,185,129,0.05)', transform: 'rotate(15deg)' }} />
                  <div style={{ position: 'absolute', right: 20, top: 20, width: 80, height: 80, borderRadius: '16px', background: 'rgba(16,185,129,0.08)', transform: 'rotate(-10deg)' }} />
                  
                  <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <FileText size={20} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Post a Requirement</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', lineHeight: 1.4, maxWidth: '65%' }}>Tell tutors what you need and receive offers.</p>
                  </div>
                  <div style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-start', marginTop: 12, width: 32, height: 32, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: '#10b981' }}>
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>

            {/* Flash Tutoring */}
            <StaggerItem>
              <Link to="/flash" style={{ textDecoration: 'none' }}>
                <motion.div
                  style={{
                    background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', borderRadius: 24, padding: '24px', position: 'relative', overflow: 'hidden',
                    border: '1px solid rgba(244,63,94,0.1)', boxShadow: '0 4px 20px rgba(244,63,94,0.05)',
                    height: '100%', display: 'flex', flexDirection: 'column'
                  }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(244,63,94,0.15)' }}
                >
                  {/* Huge lightning icon in bg */}
                  <Zap size={140} color="white" fill="white" style={{ position: 'absolute', right: -20, top: 0, opacity: 0.5, transform: 'rotate(15deg)' }} />
                  
                  <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(244,63,94,0.15)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} fill="#f43f5e" />
                      </div>
                      <span style={{ background: '#fecdd3', color: '#e11d48', fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#e11d48' }} /> LIVE
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Need a Tutor Now?</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.4, maxWidth: '75%' }}>Find available tutors instantly.</p>
                  </div>
                  <div style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-start', marginTop: 12, width: 32, height: 32, borderRadius: '50%', background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(244,63,94,0.3)', color: 'white' }}>
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          </div>
        </Stagger>

        {/* ── TUTORS AROUND YOU ── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>Tutors around you</h2>
              <button style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <ArrowRight size={12} color="var(--gray-600)" />
              </button>
            </div>
            <button style={{ background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#5c6ac4', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              View on Map <MapPin size={14} />
            </button>
          </div>
          
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {['All', 'Mathematics', 'Science', 'Music', 'Art', 'Coding', 'Languages', 'Dance'].map((filter, i) => (
              <button
                key={filter}
                onClick={() => setActiveSubjectFilter(filter)}
                style={{
                  padding: '6px 16px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: activeSubjectFilter === filter ? 'var(--gray-900)' : 'white',
                  color: activeSubjectFilter === filter ? 'white' : 'var(--gray-600)',
                  border: activeSubjectFilter === filter ? '1px solid var(--gray-900)' : '1px solid var(--gray-200)',
                  transition: 'all 0.2s',
                }}
              >
                {filter}
              </button>
            ))}
            <button style={{ padding: '6px 16px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, background: 'white', color: 'var(--gray-600)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              More <ChevronRight size={14} />
            </button>
          </div>

          {/* Horizontal Scroll Tutors */}
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 24, scrollbarWidth: 'none', margin: '0 -24px', paddingLeft: 24, paddingRight: 24 }}>
            {isLoading ? (
              <div style={{ padding: 24, color: 'var(--gray-500)', fontSize: '0.9rem' }}>Loading tutors...</div>
            ) : nearbyTutors.length > 0 ? (
              nearbyTutors.map((tutor) => (
                <motion.div
                  key={tutor._id}
                  style={{
                    minWidth: 280, maxWidth: 280,
                    background: 'white', borderRadius: 24, padding: '16px',
                    border: '1px solid var(--gray-100)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    position: 'relative'
                  }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
                >
                  <img src={tutor.avatar || `https://ui-avatars.com/api/?name=${tutor.firstName}+${tutor.lastName}`} alt={tutor.firstName} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 16, marginBottom: 12 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gray-900)' }}>{tutor.firstName} {tutor.lastName}</h3>
                  </div>
                  <motion.button
                    style={{ width: '100%', padding: '10px 0', background: 'var(--gray-900)', color: 'white', border: 'none', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
                    whileHover={{ scale: 1.02, background: 'black' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Profile <ArrowRight size={14} />
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <div style={{ padding: '24px 32px', background: 'var(--gray-50)', borderRadius: 24, border: '1px dashed var(--gray-300)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 12, minWidth: 400 }}>
                <Search size={20} color="var(--gray-400)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-700)' }}>No tutors found in your area yet.</div>
                  <div style={{ fontSize: '0.85rem' }}>We are expanding our network! Try broadening your search.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── POPULAR CATEGORIES ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>Popular Categories</h2>
            <button style={{ background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              Explore All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                whileHover={{ y: -4 }}
              >
                <div style={{ width: 60, height: 60, borderRadius: 20, background: 'white', border: '1px solid var(--gray-100)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: cat.bg, color: cat.color, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-700)', textAlign: 'center' }}>{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      {/* ══════════════ RIGHT SIDEBAR ══════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Map Widget */}
        <MiniMapArea tutors={nearbyTutors} />

        {/* Your Learning Requests */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>Your Learning Requests</h3>
            <Link to="/my-requests" style={{ background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isLoading ? (
              <div style={{ padding: 16, color: 'var(--gray-500)', fontSize: '0.85rem' }}>Loading your requests...</div>
            ) : myRequirements.length > 0 ? (
              myRequirements.slice(0, 3).map((req, i) => (
                <motion.div
                  key={req._id}
                  style={{ background: 'white', borderRadius: 20, padding: '16px', border: '1px solid var(--gray-100)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 12 }}
                  whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: i % 2 === 0 ? '#eff6ff' : '#fdf2f8', color: i % 2 === 0 ? '#3b82f6' : '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>{req.teachingMode === 'offline' ? 'Home Tuition' : 'Online'}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 4 }}>
                      <strong style={{ color: 'var(--gray-600)' }}>{req.offersReceived}</strong> offers received
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: req.status === 'open' ? '#ecfdf5' : '#eff6ff', color: req.status === 'open' ? '#10b981' : '#3b82f6', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>{req.status}</span>
                    <button style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                      <ArrowRight size={12} color="var(--gray-500)" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
               <div style={{ background: 'white', borderRadius: 20, padding: '24px 16px', border: '1px dashed var(--gray-300)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                 <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                   <AlertCircle size={20} />
                 </div>
                 <div>
                   <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>No active requests</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>Post a requirement to get offers from top tutors.</div>
                 </div>
                 <Link to="/requirements/new" style={{ marginTop: 8, padding: '8px 16px', background: 'var(--gray-900)', color: 'white', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>Post a Requirement</Link>
               </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>Upcoming Sessions</h3>
            <button style={{ background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          
          <div style={{ background: 'white', borderRadius: 20, padding: '24px 16px', border: '1px dashed var(--gray-300)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
            <Calendar size={24} color="var(--gray-400)" />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>No upcoming sessions</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Book a tutor to start learning!</div>
          </div>
        </div>

        {/* Ad Banner */}
        <div style={{
          position: 'relative', borderRadius: 24, overflow: 'hidden', height: 160,
          background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-end', padding: 20
        }}>
          <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Ad background" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-display)', lineHeight: 1.2, marginBottom: 4 }}>
              Learning is a<br/>brighter tomorrow.
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', margin: 0 }}>Real people. Real progress.</p>
              <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Play size={14} color="var(--gray-900)" fill="var(--gray-900)" style={{ marginLeft: 2 }} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
