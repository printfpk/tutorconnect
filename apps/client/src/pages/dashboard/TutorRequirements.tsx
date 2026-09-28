import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stagger, StaggerItem } from '../../components/animations';
import {
  MapPin, Clock, Send, Eye, CheckCircle, Search,
  TrendingUp, Users, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import SendOfferModal from '../../components/SendOfferModal';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Science', 'Hindi', 'Computer Science'];

interface Requirement {
  _id: string;
  subject: string;
  className: string;
  board: string;
  teachingMode: string;
  tutorType: string;
  schedule?: { days?: string[]; preferredTime?: string; sessionsPerWeek?: number };
  budgetMin: number;
  budgetMax: number;
  isNegotiable: boolean;
  description?: string;
  status: string;
  offersReceived: number;
  createdAt: string;
  location?: { coordinates?: [number, number]; address?: string; pincode?: string };
  postedBy?: { _id: string; firstName: string; lastName: string; pincode?: string };
}

export default function TutorRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentOffers, setSentOffers] = useState<string[]>([]);
  const [activeSubject, setActiveSubject] = useState('All');
  const [searchVal, setSearchVal] = useState('');
  const [offerTarget, setOfferTarget] = useState<Requirement | null>(null);

  const fetchRequirements = () => {
    setIsLoading(true);
    setError(null);

    api.get('/requirements/discover')
      .then(res => {
        const data = res?.data?.data?.requirements;
        setRequirements(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Failed to fetch requirements:', err);
        setError('Could not load requirements. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleSendOffer = (req: Requirement) => {
    if (sentOffers.includes(req._id)) return;
    setOfferTarget(req);
  };

  const filtered = requirements.filter(r => {
    if (searchVal && !r.subject.toLowerCase().includes(searchVal.toLowerCase())) return false;
    if (activeSubject !== 'All' && !r.subject.toLowerCase().includes(activeSubject.toLowerCase())) return false;
    return true;
  });

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  const formatSchedule = (req: Requirement) => {
    if (!req.schedule) return '';
    const days = req.schedule.days?.join('/') || '';
    const time = req.schedule.preferredTime || '';
    return [days, time].filter(Boolean).join(' · ');
  };

  return (
    <div>
      <SendOfferModal
        requirement={offerTarget}
        onClose={() => setOfferTarget(null)}
        onSuccess={(reqId) => setSentOffers(prev => [...prev, reqId])}
      />
      {/* Header */}
      <Stagger stagger={0.06} delay={0.05}>
        <div style={{ padding: '28px 0 24px' }}>
          <StaggerItem>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gray-900)', marginBottom: 8 }}>
              Students looking for{' '}
              <span style={{ background: 'linear-gradient(135deg, #10b981, #5c6ac4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                tutors near you
              </span>
            </h1>
          </StaggerItem>
          <StaggerItem>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>
                {isLoading ? (
                  'Loading...'
                ) : (
                  <><strong style={{ color: '#10b981' }}>{filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}</strong> near you</>
                )}
              </span>
              {!isLoading && requirements.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--gray-400)', fontWeight: 500 }}>
                  <TrendingUp size={13} style={{ color: '#10b981' }} />
                  {requirements.filter(r => (Date.now() - new Date(r.createdAt).getTime()) < 86400000).length} new today
                </div>
              )}
              <button onClick={fetchRequirements} title="Refresh" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4 }}>
                <RefreshCw size={14} />
              </button>
            </div>
          </StaggerItem>

          {/* Search */}
          <StaggerItem>
            <div style={{ display: 'flex', gap: 10, maxWidth: 580, marginBottom: 16 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search by subject..."
                  style={{
                    width: '100%', padding: '10px 14px 10px 40px',
                    border: '2px solid var(--gray-200)', borderRadius: 999,
                    fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
                    color: 'var(--gray-800)', outline: 'none', background: 'white',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
          </StaggerItem>

          {/* Filters */}
          <StaggerItem>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SUBJECTS.map(s => (
                <motion.button key={s}
                  style={{
                    padding: '5px 13px', borderRadius: 999, border: '1.5px solid',
                    borderColor: activeSubject === s ? '#10b981' : 'var(--gray-200)',
                    background: activeSubject === s ? 'rgba(16,185,129,0.08)' : 'white',
                    color: activeSubject === s ? '#059669' : 'var(--gray-600)',
                    fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSubject(s)}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </StaggerItem>
        </div>
      </Stagger>

      {/* Loading state */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
          <Loader2 size={40} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--gray-500)', margin: 0 }}>Loading requirements near you...</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <AlertCircle size={36} color="#e53e3e" style={{ marginBottom: 12 }} />
          <p style={{ color: '#c53030', fontWeight: 600, margin: '0 0 16px' }}>{error}</p>
          <button onClick={fetchRequirements} className="btn btn-primary" style={{ borderRadius: 999, padding: '10px 24px' }}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filtered.length === 0 && (
        <div style={{ background: 'white', borderRadius: 20, padding: 60, textAlign: 'center', border: '1px solid var(--gray-200)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Search size={28} color="var(--gray-400)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 8px' }}>
            {requirements.length === 0 ? 'No requirements posted yet' : 'No results match your filter'}
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0 0 20px' }}>
            {requirements.length === 0
              ? 'Be the first to know — check back soon or update your location settings.'
              : 'Try changing the subject filter or search term.'}
          </p>
          {activeSubject !== 'All' && (
            <button onClick={() => setActiveSubject('All')} className="btn btn-outline" style={{ borderRadius: 999, padding: '9px 22px' }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Cards feed */}
      {!isLoading && !error && (
        <AnimatePresence>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((req, i) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  style={{
                    background: 'white', borderRadius: 20, padding: '22px 24px',
                    border: `1.5px solid ${sentOffers.includes(req._id) ? 'rgba(16,185,129,0.3)' : 'var(--gray-100)'}`,
                    boxShadow: sentOffers.includes(req._id) ? '0 0 0 3px rgba(16,185,129,0.08), 0 4px 20px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative', overflow: 'hidden',
                  }}
                  whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}
                >
                  {/* Top accent bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: req.tutorType === 'hourly' ? 'linear-gradient(90deg, #f59e0b, #f97316)' : 'linear-gradient(90deg, #10b981, #5c6ac4)' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'flex-start' }}>
                    <div>
                      {/* Tags row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Needs Tutor
                        </span>
                        <span style={{ background: req.teachingMode === 'online' ? 'rgba(92,106,196,0.08)' : 'rgba(245,158,11,0.08)', color: req.teachingMode === 'online' ? '#5c6ac4' : '#d97706', fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize' }}>
                          {req.teachingMode}
                        </span>
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                          background: req.tutorType === 'hourly' ? '#fef3c7' : '#dbeafe',
                          color: req.tutorType === 'hourly' ? '#92400e' : '#1e40af',
                        }}>
                          {req.tutorType === 'hourly' ? '⏱ Hourly' : '📅 Monthly'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--gray-400)' }}>{timeAgo(req.createdAt)}</span>
                      </div>

                      {/* Title */}
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 3 }}>
                        {req.subject}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', fontWeight: 500, marginBottom: 12 }}>
                        {req.className} · {req.board}
                      </div>

                      {/* Details */}
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                        {req.location?.pincode && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 500 }}>
                            <MapPin size={13} style={{ color: 'var(--gray-400)' }} />
                            Pincode: {req.location.pincode}
                          </div>
                        )}
                        {formatSchedule(req) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 500 }}>
                            <Clock size={13} style={{ color: 'var(--gray-400)' }} />
                            {formatSchedule(req)}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 500 }}>
                          <Users size={13} style={{ color: 'var(--gray-400)' }} />
                          {req.offersReceived} {req.offersReceived === 1 ? 'tutor interested' : 'tutors interested'}
                        </div>
                      </div>

                      {req.description && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray-500)', lineHeight: 1.5, maxWidth: 500 }}>
                          {req.description.slice(0, 120)}{req.description.length > 120 ? '…' : ''}
                        </p>
                      )}
                    </div>

                    {/* Budget + actions */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 2 }}>
                        ₹{req.budgetMin.toLocaleString()}
                        <span style={{ fontWeight: 600, color: 'var(--gray-500)', fontSize: '0.9rem' }}>–{req.budgetMax.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: 12 }}>
                        {req.tutorType === 'hourly' ? 'per hour' : 'per month'} {req.isNegotiable && '· Negotiable'}
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Link to={`/tutor/requirements/${req._id}`}>
                          <motion.button
                            className="btn btn-ghost"
                            style={{ padding: '9px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            <Eye size={13} /> View
                          </motion.button>
                        </Link>
                        <motion.button
                          onClick={() => !sentOffers.includes(req._id) && handleSendOffer(req)}
                          style={{
                            padding: '9px 18px', borderRadius: 999, border: 'none',
                            background: sentOffers.includes(req._id) ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, #10b981, #059669)',
                            color: sentOffers.includes(req._id) ? '#10b981' : 'white',
                            fontSize: '0.78rem', fontWeight: 700, cursor: sentOffers.includes(req._id) ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                            boxShadow: sentOffers.includes(req._id) ? 'none' : '0 4px 14px rgba(16,185,129,0.35)',
                          }}
                          whileHover={!sentOffers.includes(req._id) ? { scale: 1.04, boxShadow: '0 6px 20px rgba(16,185,129,0.45)' } : {}}
                          whileTap={!sentOffers.includes(req._id) ? { scale: 0.97 } : {}}
                        >
                          {sentOffers.includes(req._id) ? <><CheckCircle size={13} /> Offer Sent</> : <><Send size={13} /> Send Offer</>}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
