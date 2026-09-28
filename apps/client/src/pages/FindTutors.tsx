import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, Stagger, StaggerItem } from '../components/animations';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import {
  Search, MapPin, Star, CheckCircle, Filter, SlidersHorizontal,
  Heart, ChevronDown, Grid3X3, List, X, SearchX, AlertCircle, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Music', 'Coding', 'Science'];
const DISTANCES = ['Any', '< 2 km', '< 5 km', '< 10 km'];
const MODES = ['All', 'Home Tuition', 'Online'];

export default function FindTutors() {
  const { user } = useAuthStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchVal, setSearchVal] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [activeDistance, setActiveDistance] = useState('Any');
  const [activeMode, setActiveMode] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      setIsLoading(true);
      try {
        // Attempt to fetch tutors from API
        const res = await api.get('/tutors');
        setTutors(res.data.data.tutors || []);
      } catch (err) {
        console.warn("Tutor API is not available yet. Showing empty state.");
        setTutors([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTutors();
  }, []);

  const toggleFav = (id: string) => setFavorites(f => f.includes(id) ? f.filter(i => i !== id) : [...f, id]);

  const filtered = tutors.filter(t => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const tSubject = (t.subject || '').toLowerCase();
    
    if (searchVal && !fullName.includes(searchVal.toLowerCase()) && !tSubject.includes(searchVal.toLowerCase())) return false;
    if (activeSubject !== 'All' && !(t.subjects || []).includes(activeSubject) && tSubject !== activeSubject.toLowerCase()) return false;
    if (activeMode === 'Home Tuition' && !t.teachingMode?.includes('offline')) return false;
    if (activeMode === 'Online' && !t.teachingMode?.includes('online')) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <Stagger stagger={0.06} delay={0.05}>
        <div style={{ padding: '28px 0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <StaggerItem>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gray-900)', marginBottom: 8 }}>
                  Find <span className="gradient-text">tutors</span> in your area
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)', marginBottom: 20 }}>
                  {isLoading ? 'Searching for tutors...' : `${filtered.length} verified tutors available`}
                </p>
              </StaggerItem>
            </div>
          </div>

          {(user?.role === 'parent' || user?.role === 'student') && (
            <StaggerItem>
              <div style={{ 
                background: 'white', border: '1px solid var(--gray-200)', borderRadius: 20, 
                padding: '16px', display: 'flex', alignItems: 'center', gap: 12, 
                marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' 
              }}>
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`} 
                  alt="User" 
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} 
                />
                
                <Link to="/requirements/new" style={{ flex: 1, textDecoration: 'none' }}>
                  <motion.div 
                    style={{ 
                      background: 'var(--gray-50)', padding: '12px 20px', borderRadius: 999, 
                      color: 'var(--gray-500)', fontSize: '0.9rem', cursor: 'pointer', 
                      border: '1px solid var(--gray-100)', transition: 'all 0.2s'
                    }}
                    whileHover={{ background: 'var(--gray-100)' }}
                  >
                    What kind of tutor are you looking for, {user?.firstName}?
                  </motion.div>
                </Link>
                
                <Link to="/requirements/new" style={{ textDecoration: 'none' }}>
                  <motion.button 
                    style={{ 
                      background: 'var(--indigo)', color: 'white', padding: '10px 24px', 
                      borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '0.9rem', 
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(92,106,196,0.2)'
                    }} 
                    whileHover={{ scale: 1.05, boxShadow: '0 6px 16px rgba(92,106,196,0.3)' }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileText size={16} /> Post
                  </motion.button>
                </Link>
              </div>
            </StaggerItem>
          )}

          {/* Search */}
          <StaggerItem>
            <div style={{ display: 'flex', gap: 10, maxWidth: 640 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search by name, subject..."
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    border: '2px solid var(--gray-200)', borderRadius: 999,
                    fontSize: '0.88rem', fontFamily: 'var(--font-sans)',
                    color: 'var(--gray-800)', outline: 'none',
                    transition: 'all 0.2s', background: 'white',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--indigo)'; e.target.style.boxShadow = '0 0 0 3px rgba(92,106,196,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <motion.button
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 999, border: '2px solid var(--gray-200)', background: 'white', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-600)', cursor: 'pointer', transition: 'all 0.2s' }}
                whileHover={{ borderColor: 'var(--indigo)', color: 'var(--indigo-deep)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilterOpen(o => !o)}
              >
                <SlidersHorizontal size={15} /> Filters
              </motion.button>
            </div>
          </StaggerItem>
        </div>
      </Stagger>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        {/* Subject filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SUBJECTS.map(s => (
            <motion.button
              key={s}
              style={{
                padding: '5px 13px', borderRadius: 999,
                border: '1.5px solid', transition: 'all 0.15s',
                borderColor: activeSubject === s ? 'var(--indigo)' : 'var(--gray-200)',
                background: activeSubject === s ? 'var(--lavender-soft)' : 'white',
                color: activeSubject === s ? 'var(--indigo-deep)' : 'var(--gray-600)',
                fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSubject(s)}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* Spacer + view toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {[{ icon: <Grid3X3 size={14} />, val: 'grid' as const }, { icon: <List size={14} />, val: 'list' as const }].map(v => (
            <motion.button
              key={v.val}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderColor: view === v.val ? 'var(--indigo)' : 'var(--gray-200)',
                background: view === v.val ? 'var(--lavender-soft)' : 'white',
                color: view === v.val ? 'var(--indigo-deep)' : 'var(--gray-400)',
                cursor: 'pointer',
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setView(v.val)}
            >
              {v.icon}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mode filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {MODES.map(m => (
          <motion.button
            key={m}
            style={{
              padding: '5px 13px', borderRadius: 999, border: '1.5px solid',
              borderColor: activeMode === m ? '#10b981' : 'var(--gray-200)',
              background: activeMode === m ? 'rgba(16,185,129,0.08)' : 'white',
              color: activeMode === m ? '#059669' : 'var(--gray-600)',
              fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMode(m)}
          >
            {m}
          </motion.button>
        ))}
        <span style={{ marginLeft: 8, fontSize: '0.78rem', color: 'var(--gray-400)', alignSelf: 'center' }}>
          {filtered.length} tutors
        </span>
      </div>

      {/* Tutor grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}
          >
            <div style={{ width: 40, height: 40, border: '4px solid var(--gray-200)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'white', borderRadius: 24, padding: '60px 20px',
              border: '1px dashed var(--gray-300)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', marginBottom: 20 }}>
              <SearchX size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>No tutors found</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', maxWidth: 400, marginBottom: 24 }}>
              We couldn't find any tutors matching your current filters. Try adjusting your search criteria or explore other subjects.
            </p>
            <motion.button
              onClick={() => { setSearchVal(''); setActiveSubject('All'); setActiveMode('All'); }}
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              Clear Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeSubject}-${view}-${activeMode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(3, 1fr)' : '1fr', gap: 16 }}
          >
            {filtered.map((tutor, i) => (
              <motion.div
                key={tutor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  style={{
                    background: 'white', borderRadius: view === 'grid' ? 20 : 16,
                    padding: view === 'grid' ? '20px' : '16px 20px',
                    border: '1.5px solid var(--gray-100)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: view === 'list' ? 'flex' : 'block',
                    alignItems: view === 'list' ? 'center' : undefined,
                    gap: view === 'list' ? 16 : undefined,
                    cursor: 'pointer',
                    position: 'relative', overflow: 'hidden',
                  }}
                  whileHover={{ y: view === 'grid' ? -5 : -2, boxShadow: '0 16px 40px rgba(0,0,0,0.08)', borderColor: 'rgba(92,106,196,0.3)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  {/* Subtle color top bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, #5c6ac4, #7c3aed)` }} />

                  {/* Avatar row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: view === 'grid' ? 14 : 0 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div className="avatar" style={{ width: view === 'grid' ? 52 : 44, height: view === 'grid' ? 52 : 44, fontSize: '1.2rem', overflow: 'hidden' }}>
                        <img src={tutor.avatar || `https://ui-avatars.com/api/?name=${tutor.firstName}+${tutor.lastName}`} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                      </div>
                      {tutor.isVerified && (
                        <span style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#10b981', border: '2px solid white' }} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--gray-900)' }}>{tutor.firstName} {tutor.lastName}</span>
                        {tutor.isVerified && <CheckCircle size={13} style={{ color: '#10b981', flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 500 }}>{tutor.subject || 'Various Subjects'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={11} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--gray-800)' }}>{tutor.rating || 0}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>({tutor.reviewCount || 0})</span>
                        </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--gray-300)' }}>·</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--indigo-deep)', background: 'var(--lavender-soft)', padding: '2px 6px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                            <MapPin size={10} /> Pincode: {tutor.pincode}
                          </span>
                      </div>
                    </div>

                    {/* Fav + price for list view */}
                    {view === 'list' && (
                      <>
                        <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)' }}>₹{tutor.hourlyRate || 500}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--gray-400)' }}>/hr</span></div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{tutor.experienceYears || 0} years exp</div>
                        </div>
                        <motion.button
                          style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: favorites.includes(tutor._id) ? '#f43f5e' : 'var(--gray-300)' }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => toggleFav(tutor._id)}
                        >
                          <Heart size={16} fill={favorites.includes(tutor._id) ? '#f43f5e' : 'none'} />
                        </motion.button>
                        <Link to={`/tutors/${tutor._id}`}>
                          <motion.button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', borderRadius: 999 }} whileTap={{ scale: 0.97 }}>
                            View Profile
                          </motion.button>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Grid only content */}
                  {view === 'grid' && (
                    <>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: 4 }}>{tutor.qualification || 'Certified Tutor'} · {tutor.experienceYears || 0} years exp</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {(tutor.teachingMode || ['offline', 'online']).map((t: string) => (
                            <span key={t} style={{ padding: '2px 8px', borderRadius: 999, background: t === 'online' ? 'rgba(92,106,196,0.08)' : 'rgba(245,158,11,0.08)', color: t === 'online' ? '#5c6ac4' : '#d97706', fontSize: '0.66rem', fontWeight: 600, textTransform: 'capitalize' }}>
                              {t === 'offline' ? 'Home' : 'Online'}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)' }}>₹{tutor.hourlyRate || 500}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--gray-400)' }}>/hr</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <motion.button
                            style={{ padding: 7, background: 'none', border: 'none', cursor: 'pointer', color: favorites.includes(tutor._id) ? '#f43f5e' : 'var(--gray-300)', borderRadius: 8 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => toggleFav(tutor._id)}
                          >
                            <Heart size={15} fill={favorites.includes(tutor._id) ? '#f43f5e' : 'none'} />
                          </motion.button>
                          <Link to={`/tutors/${tutor._id}`}>
                            <motion.button
                              className="btn btn-primary"
                              style={{ padding: '7px 14px', fontSize: '0.76rem', borderRadius: 999 }}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            >
                              View
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
