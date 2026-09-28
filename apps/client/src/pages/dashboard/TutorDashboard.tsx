import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Reveal, Stagger, StaggerItem, SmoothCounter } from '../../components/animations';
import {
  Search, Send, Calendar, Zap, Star, MapPin, CheckCircle,
  TrendingUp, Clock, ArrowRight, ChevronRight,
  Navigation, Filter, Eye, Loader2, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { requirementsApi, flashApi, type Requirement, type FlashRequest, type Offer } from '../../lib/requirementsApi';
import toast from 'react-hot-toast';

/* ─── Helper ─────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function minsUntil(dateStr: string): number {
  return Math.max(0, Math.floor((new Date(dateStr).getTime() - Date.now()) / 60000));
}

function modeLabel(mode: string): string {
  const map: Record<string, string> = {
    home_tuition: 'Home', online: 'Online', at_tutor_place: 'Tutor Place', any: 'Any',
  };
  return map[mode] ?? mode;
}

/* ─── Live Requirement Card (real data) ──────── */
function LiveRequirementCard({ req, delay, isSending, alreadySent, onSendOffer }: {
  req: Requirement; delay: number; isSending: boolean; alreadySent: boolean; onSendOffer: () => void;
}) {
  const modeColor = req.teachingMode === 'online' ? { bg: 'rgba(92,106,196,0.08)', color: '#5c6ac4' }
    : { bg: 'rgba(245,158,11,0.08)', color: '#d97706' };

  return (
    <Reveal delay={delay} direction="up">
      <motion.div
        style={{ background: 'white', borderRadius: 20, padding: '20px', border: '1.5px solid var(--gray-100)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 999 }}>Needs Tutor</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--gray-400)' }}>{timeAgo(req.createdAt)}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 2 }}>{req.subject}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 500 }}>{req.className} · {req.board}</div>
          </div>
          <span style={{ ...modeColor, fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{modeLabel(req.teachingMode)}</span>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {req.schedule?.preferredTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} style={{ color: 'var(--gray-400)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                {req.schedule.days?.slice(0, 3).join('/') || 'Flexible'} · {req.schedule.preferredTime}
              </span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>
              ₹{req.budgetMin.toLocaleString()}–{req.budgetMax.toLocaleString()}/mo
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              {req.isNegotiable && <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>✓ Negotiable</span>}
              <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>{req.offersReceived} offers sent</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/tutor/requirements/${req._id}`}>
              <motion.button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }} whileTap={{ scale: 0.96 }}>
                <Eye size={13} /> View
              </motion.button>
            </Link>
            <motion.button
              className="btn"
              style={{
                padding: '8px 16px', fontSize: '0.78rem',
                background: alreadySent ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: alreadySent ? '#10b981' : 'white',
                borderRadius: 999, border: 'none',
                display: 'flex', alignItems: 'center', gap: 5,
                opacity: isSending ? 0.7 : 1,
              }}
              whileHover={!alreadySent ? { scale: 1.04, boxShadow: '0 4px 16px rgba(16,185,129,0.4)' } : {}}
              whileTap={!alreadySent ? { scale: 0.97 } : {}}
              onClick={!alreadySent ? onSendOffer : undefined}
              disabled={isSending || alreadySent}
            >
              {isSending ? <Loader2 size={13} className="animate-spin" /> : alreadySent ? <><CheckCircle size={13} /> Sent</> : <><Send size={13} /> Send Offer</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── Map for tutors (student requirement map) ── */
function TutorMapArea() {
  const pins = [
    { id: 1, x: 30, y: 40, label: 'Maths·10', urgent: false },
    { id: 2, x: 52, y: 55, label: 'Physics·12', urgent: false },
    { id: 3, x: 68, y: 30, label: 'English·9', urgent: false },
    { id: 4, x: 22, y: 68, label: 'Science·8', urgent: true },
    { id: 5, x: 78, y: 62, label: 'Hindi·7', urgent: false },
  ];

  return (
    <div className="map-area" style={{ height: '100%', minHeight: 260 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
        {[...Array(8)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 12.5}%`} x2="100%" y2={`${i * 12.5}%`} stroke="#10b981" strokeWidth="0.5" />
        ))}
        {[...Array(8)].map((_, i) => (
          <line key={`v${i}`} x1={`${i * 12.5}%`} y1="0" x2={`${i * 12.5}%`} y2="100%" stroke="#10b981" strokeWidth="0.5" />
        ))}
        <path d="M 0,48% L 100%,52%" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.4" />
        <path d="M 42%,0 L 38%,100%" stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.3" />
      </svg>

      {/* Your location */}
      <div style={{ position: 'absolute', left: '48%', top: '48%', transform: 'translate(-50%,-50%)', zIndex: 10 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10b981', border: '3px solid white', boxShadow: '0 2px 8px rgba(16,185,129,0.5)' }} />
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', animation: 'pulse 2s ease-out infinite' }} />
      </div>

      {/* Student requirement pins */}
      {pins.map((pin) => (
        <motion.div
          key={pin.id}
          style={{ position: 'absolute', left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%,-100%)', zIndex: 5 }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3 + pin.id, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div style={{
            background: pin.urgent ? '#f43f5e' : '#10b981',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: '0.62rem', fontWeight: 700,
            color: 'white',
            boxShadow: `0 4px 12px ${pin.urgent ? 'rgba(244,63,94,0.4)' : 'rgba(16,185,129,0.3)'}`,
            whiteSpace: 'nowrap',
          }}>
            {pin.urgent && '⚡ '}{pin.label}
          </div>
          <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${pin.urgent ? '#f43f5e' : '#10b981'}`, margin: '0 auto' }} />
        </motion.div>
      ))}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
        borderRadius: 10, padding: '7px 12px',
        fontSize: '0.68rem', color: 'var(--gray-600)', fontWeight: 500,
        border: '1px solid var(--gray-100)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        You · Bhubaneswar · 12 student needs
      </div>
    </div>
  );
}

/* ─── Requirement card (tutor view) ─────────────── */
function RequirementFeedCard({ req, delay }: { req: typeof NEARBY_REQUIREMENTS[0]; delay: number }) {
  const [sent, setSent] = useState(false);
  return (
    <Reveal delay={delay} direction="up">
      <motion.div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '20px',
          border: '1.5px solid var(--gray-100)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
        }}
        whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 999 }}>
                Needs Tutor
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--gray-400)' }}>{req.postedAgo}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 2 }}>
              {req.subject}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 500 }}>{req.class}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <MapPin size={11} /> {req.distance} km
            </div>
            <span style={{
              background: req.location === 'Online' ? 'rgba(92,106,196,0.08)' : 'rgba(245,158,11,0.08)',
              color: req.location === 'Online' ? '#5c6ac4' : '#d97706',
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
            }}>
              {req.location}
            </span>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} style={{ color: 'var(--gray-400)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{req.schedule}</span>
          </div>
        </div>

        {/* Budget */}
        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>
              ₹{req.budgetMin.toLocaleString()}–{req.budgetMax.toLocaleString()}/mo
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              {req.negotiable && (
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>✓ Negotiable</span>
              )}
              <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>
                {req.interestedCount} tutors interested
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/tutor/requirements/${req.id}`}>
              <motion.button
                className="btn btn-ghost"
                style={{ padding: '8px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                whileTap={{ scale: 0.96 }}
              >
                <Eye size={13} /> View
              </motion.button>
            </Link>
            <motion.button
              className="btn"
              style={{
                padding: '8px 16px', fontSize: '0.78rem',
                background: sent ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: sent ? '#10b981' : 'white',
                borderRadius: 999, border: 'none',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
              whileHover={!sent ? { scale: 1.04, boxShadow: '0 4px 16px rgba(16,185,129,0.4)' } : {}}
              whileTap={!sent ? { scale: 0.97 } : {}}
              onClick={() => setSent(true)}
            >
              {sent ? <><CheckCircle size={13} /> Sent</> : <><Send size={13} /> Send Offer</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── Flash request card ─────────────────────────── */
function FlashRequestCard({ req }: { req: FlashRequest }) {
  const startsIn = minsUntil(req.startsAt);
  const isUrgent = startsIn < 30;

  return (
    <motion.div
      style={{
        background: isUrgent
          ? 'linear-gradient(135deg, #1a0a2e, #2d1854)'
          : 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 18,
        padding: '18px',
        border: isUrgent ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ scale: 1.02, boxShadow: isUrgent ? '0 8px 30px rgba(244,63,94,0.2)' : '0 8px 20px rgba(0,0,0,0.2)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {isUrgent && (
        <motion.div
          style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'radial-gradient(circle at top right, rgba(244,63,94,0.08), transparent 60%)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <motion.span
                style={{
                  background: isUrgent ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.15)',
                  color: isUrgent ? '#f43f5e' : '#f59e0b',
                  fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em',
                  padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase',
                }}
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                ⚡ Flash Request
              </motion.span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>
              {req.subject}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{req.className}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>₹{req.ratePerSession}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{req.sessionDurationHours}hr session</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {[
            { icon: <Clock size={11} />, text: startsIn > 0 ? `Starts in ${startsIn} min` : 'Starting now' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
              {item.icon} {item.text}
            </div>
          ))}
        </div>

        <Link to={`/tutor/flash/${req._id}`}>
          <motion.button
            className="btn"
            style={{
              width: '100%', padding: '10px', borderRadius: 12,
              background: isUrgent ? 'linear-gradient(135deg, #f43f5e, #ec4899)' : 'rgba(255,255,255,0.1)',
              color: 'white', border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.82rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
            whileHover={{ scale: 1.03, boxShadow: isUrgent ? '0 4px 20px rgba(244,63,94,0.4)' : undefined }}
            whileTap={{ scale: 0.97 }}
          >
            View Request <ArrowRight size={14} />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Main Tutor Dashboard ───────────────────────── */
export default function TutorDashboard() {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [flashRequests, setFlashRequests] = useState<FlashRequest[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingFlash, setLoadingFlash] = useState(true);
  const [sendingOffer, setSendingOffer] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Get the tutor's location (browser geolocation, fall back to a default)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 20.2961, lng: 85.8245 }) // default: Bhubaneswar
    );
  }, []);

  // Fetch nearby requirements
  const fetchRequirements = useCallback(async () => {
    if (!coords) return;
    setLoadingReqs(true);
    try {
      const subjectFilter = activeFilter !== 'All' && !['Online', 'Home', 'Under 2 km'].includes(activeFilter)
        ? activeFilter : undefined;
      const modeFilter = activeFilter === 'Online' ? 'online'
        : activeFilter === 'Home' ? 'home_tuition' : undefined;
      const radius = activeFilter === 'Under 2 km' ? 2 : 10;
      const res = await requirementsApi.getNearby(coords.lat, coords.lng, radius, { subject: subjectFilter, teachingMode: modeFilter });
      setRequirements(res.data.data.requirements);
    } catch { /* silent */ }
    finally { setLoadingReqs(false); }
  }, [coords, activeFilter]);

  // Fetch nearby flash requests
  const fetchFlash = useCallback(async () => {
    if (!coords) return;
    setLoadingFlash(true);
    try {
      const res = await flashApi.getNearby(coords.lat, coords.lng, 5);
      setFlashRequests(res.data.data.flashes);
    } catch { /* silent */ }
    finally { setLoadingFlash(false); }
  }, [coords]);

  // Fetch my offers
  const fetchMyOffers = useCallback(async () => {
    try {
      const res = await requirementsApi.getMyOffers();
      setMyOffers(res.data.data.offers);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchRequirements(); }, [fetchRequirements]);
  useEffect(() => { fetchFlash(); fetchMyOffers(); }, [fetchFlash, fetchMyOffers]);

  const handleSendOffer = async (requirementId: string, budgetMin: number) => {
    setSendingOffer(requirementId);
    try {
      await requirementsApi.sendOffer(requirementId, { proposedRate: budgetMin, message: 'I am interested in this requirement.' });
      toast.success('Offer sent successfully!');
      await fetchRequirements(); // refresh
      await fetchMyOffers();
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || 'Failed to send offer');
    } finally {
      setSendingOffer(null);
    }
  };

  const stats = [
    { label: 'Nearby Needs', value: requirements.length, icon: <Search size={19} />, color: '#5c6ac4', bg: 'var(--lavender-soft)' },
    { label: 'Offers Sent', value: myOffers.length, icon: <Send size={19} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Active Bookings', value: 0, icon: <Calendar size={19} />, color: '#10b981', bg: 'var(--mint-soft)' },
    { label: 'Rating', value: 49, icon: <Star size={19} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.06)', display: '—' },
  ];

  const filters = ['All', 'Mathematics', 'Science', 'English', 'Online', 'Home', 'Under 2 km'];

  return (
    <div>
      {/* ══════ HERO ══════ */}
      <Stagger stagger={0.06} delay={0.05}>
        <div style={{ padding: '32px 0 28px' }}>
          <StaggerItem>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ width: 24, height: 2, background: '#10b981', borderRadius: 999, display: 'inline-block' }} />
              {greeting}, {user?.firstName}
            </span>
          </StaggerItem>

          <StaggerItem>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1,
              color: 'var(--gray-900)', marginBottom: 10,
            }}>
              Find students.
              <br />
              <span style={{ background: 'linear-gradient(135deg, #10b981, #5c6ac4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Build impact.
              </span>
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', maxWidth: 460, lineHeight: 1.6 }}>
              <strong style={{ color: '#10b981', fontWeight: 700 }}>12 students</strong> are looking for tutors near you today.
              Send offers and grow your teaching practice.
            </p>
          </StaggerItem>
        </div>
      </Stagger>

      {/* ══════ STATS ══════ */}
      <Stagger stagger={0.07} delay={0.25}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <motion.div
                style={{
                  background: 'white',
                  borderRadius: 18,
                  padding: '18px',
                  border: '1px solid var(--gray-100)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}
                whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                    {s.display ?? <SmoothCounter to={s.value} />}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      {/* ══════ FLASH REQUESTS ══════ */}
      {(loadingFlash || flashRequests.length > 0) && (
        <div style={{ marginBottom: 36 }}>
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="section-title">⚡ Flash Requests</div>
              <motion.span
                style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, letterSpacing: '0.05em' }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                LIVE
              </motion.span>
            </div>
            <Link to="/tutor/flash" style={{ textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, color: 'var(--indigo)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {loadingFlash ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--gray-400)' }}>
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {flashRequests.map((req) => (
                <FlashRequestCard key={req._id} req={req} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ REQUIREMENT FEED + MAP ══════ */}
      <div style={{ marginBottom: 36 }}>
        <div className="section-header">
          <div className="section-title">Students looking for tutors near you</div>
          <Link to="/tutor/requirements" style={{ textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, color: 'var(--indigo)', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--gray-400)' }} />
          {filters.map(f => (
            <motion.button
              key={f}
              style={{
                padding: '5px 13px', borderRadius: 999, border: '1.5px solid',
                borderColor: activeFilter === f ? '#10b981' : 'var(--gray-200)',
                background: activeFilter === f ? 'rgba(16,185,129,0.08)' : 'white',
                color: activeFilter === f ? '#059669' : 'var(--gray-600)',
                fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </motion.button>
          ))}
        </div>

        {/* Requirement cards + Map */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          {/* Left: feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {loadingReqs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : requirements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-400)', background: 'white', borderRadius: 20, border: '1.5px dashed var(--gray-200)' }}>
                <Search size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>No requirements found nearby.</p>
                <p style={{ fontSize: '0.78rem', margin: '4px 0 0', opacity: 0.7 }}>Try increasing the radius or removing filters.</p>
              </div>
            ) : (
              requirements.slice(0, 3).map((req, i) => (
                <LiveRequirementCard
                  key={req._id}
                  req={req}
                  delay={i * 0.06}
                  isSending={sendingOffer === req._id}
                  alreadySent={myOffers.some(o => (o.requirement as any)?._id === req._id || (o.requirement as any) === req._id)}
                  onSendOffer={() => handleSendOffer(req._id, req.budgetMin)}
                />
              ))
            )}
            {requirements.length > 3 && (
              <Link to="/tutor/requirements" style={{ textDecoration: 'none' }}>
                <motion.button
                  className="btn btn-ghost"
                  style={{ width: '100%', padding: '12px', fontSize: '0.82rem', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  See all {requirements.length} requirements <ArrowRight size={13} />
                </motion.button>
              </Link>
            )}
          </div>


          {/* Right: map */}
          <div style={{ position: 'sticky', top: 80 }}>
            <Reveal delay={0.2} direction="right">
              <div style={{ marginBottom: 14 }}>
                <TutorMapArea />
              </div>

              {/* Profile completion */}
              <div style={{
                background: 'white', borderRadius: 18, padding: '18px',
                border: '1px solid var(--gray-100)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--gray-900)' }}>Your Profile</div>
                  <Link to="/tutor/profile" style={{ textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, color: 'var(--indigo)' }}>Edit →</Link>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--gray-500)' }}>Profile completion</span>
                  <span style={{ fontWeight: 700, color: '#5c6ac4' }}>20%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'var(--gray-100)', overflow: 'hidden', marginBottom: 12 }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #5c6ac4, #7c3aed)' }}
                    initial={{ width: 0 }}
                    animate={{ width: '20%' }}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                {[
                  { icon: <Star size={12} />, label: 'Rating', value: '—' },
                  { icon: <CheckCircle size={12} />, label: 'Sessions', value: '0' },
                  { icon: <TrendingUp size={12} />, label: 'Response rate', value: '—' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--gray-500)' }}>
                      {item.icon} {item.label}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-800)' }}>{item.value}</span>
                  </div>
                ))}
                <Link to="/tutor/profile">
                  <motion.button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 14, padding: '10px', fontSize: '0.82rem', borderRadius: 12 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Complete Profile
                  </motion.button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ══════ MY RECENT OFFERS ══════ */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-title">Recent offers sent</div>
          <Link to="/tutor/offers" style={{ textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, color: 'var(--indigo)', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>
            {myOffers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>
                <Send size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>No offers sent yet.</p>
                <p style={{ fontSize: '0.75rem', margin: '4px 0 0', opacity: 0.7 }}>Browse requirements above and send your first offer!</p>
              </div>
            ) : (
              <Stagger stagger={0.07} delay={0.1}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myOffers.slice(0, 5).map((offer) => (
                    <StaggerItem key={offer._id}>
                      <motion.div
                        style={{
                          background: 'white', borderRadius: 14, padding: '14px 18px',
                          border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}
                        whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: offer.status === 'accepted' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: offer.status === 'accepted' ? '#10b981' : '#f59e0b',
                          }}>
                            {offer.status === 'accepted' ? <CheckCircle size={16} /> : <Send size={16} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: 2 }}>
                              {(offer.requirement as any)?.subject} · {(offer.requirement as any)?.className}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                              {timeAgo(offer.createdAt)} · ₹{offer.proposedRate}/mo
                            </div>
                          </div>
                        </div>
                        <span style={{
                          background: offer.status === 'accepted' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.08)',
                          color: offer.status === 'accepted' ? '#10b981' : '#d97706',
                          fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px',
                          borderRadius: 999, letterSpacing: '0.04em', textTransform: 'capitalize',
                        }}>
                          {offer.status === 'accepted' ? '✓ Accepted' : '● Pending'}
                        </span>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </div>
              </Stagger>
            )}
      </div>
    </div>
  );
}
