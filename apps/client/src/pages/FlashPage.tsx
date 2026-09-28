import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Clock, IndianRupee, BookOpen, RefreshCw, Send, CheckCircle, Filter, Wifi, WifiOff } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Stagger, StaggerItem } from '../components/animations';

interface HourlyRequirement {
  _id: string;
  subject: string;
  className: string;
  board: string;
  teachingMode: string;
  budgetMin: number;
  budgetMax: number;
  budgetType: string;
  isNegotiable: boolean;
  description?: string;
  location?: { address?: string; pincode?: string };
  schedule?: { preferredTime?: string };
  postedBy?: { firstName: string; lastName: string };
  offersReceived: number;
  createdAt: string;
}

const MODE_LABELS: Record<string, string> = {
  online: '🖥️ Online',
  home_tuition: '🏠 Home Tuition',
  at_tutor_place: "📍 Tutor's Place",
  any: '🔄 Any Mode',
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function TutorFlashFeed() {
  const [requirements, setRequirements] = useState<HourlyRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offersSent, setOffersSent] = useState<Set<string>>(new Set());
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchHourly = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all open requirements and filter for hourly on client side
      const res = await api.get<{ data: { requirements: HourlyRequirement[] } }>('/requirements/mine');
      // Actually fetch all requirements — use the nearby endpoint with a broad radius
      // or a general GET. Fallback: use /requirements with a query param.
      // We'll use the nearby endpoint with 0,0 coords and a very large radius for now,
      // since the tutor's location is not available here yet.
      const allRes = await api.get<any>('/requirements/nearby?lat=0&lng=0&radius=10000');
      const all: HourlyRequirement[] = allRes.data?.data?.requirements || [];
      const hourly = all.filter((r: HourlyRequirement) => (r as any).budgetType === 'hourly');
      setRequirements(hourly);
      setLastRefreshed(new Date());
    } catch {
      // If nearby fails (no coords), fetch mine as fallback
      try {
        const fallback = await api.get<any>('/requirements/mine');
        const all: HourlyRequirement[] = fallback.data?.data?.requirements || [];
        const hourly = all.filter((r: HourlyRequirement) => (r as any).budgetType === 'hourly');
        setRequirements(hourly);
        setLastRefreshed(new Date());
      } catch {
        toast.error('Could not load hourly requests');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHourly();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchHourly, 60000);
    return () => clearInterval(interval);
  }, [fetchHourly]);

  const sendOffer = async (reqId: string) => {
    try {
      await api.post(`/requirements/${reqId}/offer`, { proposedRate: 0, message: 'I am interested in this hourly requirement.' });
      setOffersSent(prev => new Set(prev).add(reqId));
      toast.success('Offer sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Could not send offer');
    }
  };

  const filtered = modeFilter === 'all' ? requirements : requirements.filter(r => r.teachingMode === modeFilter);

  return (
    <div>
      {/* Header */}
      <Stagger stagger={0.06} delay={0.03}>
        <div style={{ padding: '28px 0 20px' }}>
          <StaggerItem>
            <motion.div
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 999, padding: '4px 14px', marginBottom: 12 }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e', display: 'block' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f43f5e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Feed</span>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gray-900)', marginBottom: 8 }}>
              ⚡ Hourly Requests
              <br />
              <span style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Instant sessions near you.
              </span>
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)', maxWidth: 460, lineHeight: 1.6 }}>
              These are students/parents looking for hourly or on-demand tutors. Send an offer to connect instantly.
            </p>
          </StaggerItem>
        </div>
      </Stagger>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Mode filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: '🔍 All' },
            { value: 'online', label: '🖥️ Online' },
            { value: 'home_tuition', label: '🏠 Home' },
            { value: 'at_tutor_place', label: "📍 My Place" },
            { value: 'any', label: '🔄 Any' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setModeFilter(value)}
              style={{
                padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${modeFilter === value ? '#111827' : 'var(--gray-200)'}`,
                background: modeFilter === value ? '#111827' : '#fff', color: modeFilter === value ? '#fff' : 'var(--gray-600)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
            Updated {timeAgo(lastRefreshed.toISOString())}
          </span>
          <motion.button
            onClick={fetchHourly}
            disabled={isLoading}
            whileTap={{ scale: 0.93 }}
            style={{ padding: '7px 14px', borderRadius: 999, border: '1.5px solid var(--gray-200)', background: '#fff', fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <motion.div animate={isLoading ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.8, repeat: isLoading ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={13} />
            </motion.div>
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16 }}>
            <motion.div
              style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              animate={{ scale: [1, 1.12, 1], boxShadow: ['0 0 0 0 rgba(244,63,94,0.3)', '0 0 0 18px rgba(244,63,94,0)', '0 0 0 0 rgba(244,63,94,0)'] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <Zap size={28} color="white" fill="white" />
            </motion.div>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', fontWeight: 500 }}>Fetching hourly requests...</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '1.5px solid var(--gray-100)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>⚡</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
              No hourly requests right now
            </h3>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', maxWidth: 320, margin: '0 auto 20px' }}>
              When students or parents post hourly/instant requirements, they'll appear here in real time.
            </p>
            <motion.button
              onClick={fetchHourly}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '10px 24px', borderRadius: 999, background: '#111827', color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} /> Check Again
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 16 }}>
              {filtered.length} hourly request{filtered.length !== 1 ? 's' : ''} available
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.map((req, i) => {
                const sent = offersSent.has(req._id);
                return (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
                    style={{
                      background: '#fff', borderRadius: 20, padding: '22px',
                      border: sent ? '2px solid #10b981' : '1.5px solid var(--gray-100)',
                      boxShadow: sent ? '0 0 0 3px rgba(16,185,129,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                      position: 'relative', overflow: 'hidden', transition: 'border 0.2s',
                    }}
                  >
                    {/* Accent top bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #f43f5e, #ec4899)' }} />

                    {/* ⏱ INSTANT badge */}
                    <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 3, padding: '3px 10px', borderRadius: 999, background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em' }}>
                      ⚡ INSTANT
                    </div>

                    {/* Subject + Class */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(236,72,153,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={20} color="#f43f5e" strokeWidth={1.8} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 64 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 2 }}>
                          {req.subject}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                          {req.className} · {req.board}
                        </div>
                      </div>
                    </div>

                    {/* Details chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'var(--gray-50)', fontSize: '0.74rem', fontWeight: 500, color: 'var(--gray-600)' }}>
                        <Wifi size={11} /> {MODE_LABELS[req.teachingMode] || req.teachingMode}
                      </div>
                      {req.location?.pincode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'var(--gray-50)', fontSize: '0.74rem', fontWeight: 500, color: 'var(--gray-600)' }}>
                          <MapPin size={11} /> {req.location.pincode}
                        </div>
                      )}
                      {req.schedule?.preferredTime && req.schedule.preferredTime !== 'Flexible' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'var(--gray-50)', fontSize: '0.74rem', fontWeight: 500, color: 'var(--gray-600)' }}>
                          <Clock size={11} /> {req.schedule.preferredTime}
                        </div>
                      )}
                    </div>

                    {/* Budget */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                          <IndianRupee size={14} strokeWidth={2.5} />
                          {req.budgetMin.toLocaleString()}
                          <span style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--gray-400)' }}>–{req.budgetMax.toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>per hour {req.isNegotiable && '· Negotiable'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{req.offersReceived} offers</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 2 }}>{timeAgo(req.createdAt)}</div>
                      </div>
                    </div>

                    {req.description && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', background: 'var(--gray-50)', borderRadius: 10, padding: '8px 12px', marginBottom: 14, lineHeight: 1.5 }}>
                        "{req.description.slice(0, 90)}{req.description.length > 90 ? '…' : ''}"
                      </div>
                    )}

                    {/* CTA */}
                    <motion.button
                      onClick={() => !sent && sendOffer(req._id)}
                      whileHover={!sent ? { scale: 1.03, boxShadow: '0 6px 20px rgba(244,63,94,0.35)' } : {}}
                      whileTap={!sent ? { scale: 0.97 } : {}}
                      style={{
                        width: '100%', padding: '11px', borderRadius: 12, border: 'none',
                        background: sent ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, #f43f5e, #ec4899)',
                        color: sent ? '#10b981' : 'white',
                        fontSize: '0.85rem', fontWeight: 700, cursor: sent ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        boxShadow: sent ? 'none' : '0 4px 14px rgba(244,63,94,0.3)',
                        transition: 'background 0.2s',
                      }}
                    >
                      {sent ? <><CheckCircle size={15} /> Offer Sent!</> : <><Send size={14} /> Send Offer</>}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
