import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stagger, StaggerItem } from '../../components/animations';
import { requirementsApi } from '../../lib/requirementsApi';
import type { Requirement } from '../../lib/requirementsApi';
import { BookOpen, MapPin, Clock, IndianRupee, Users, ArrowRight, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h}h ago`;
  const m = Math.floor(diff / 60000);
  return `${m}m ago`;
};

export default function MyRequestsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'closed'>('open');

  useEffect(() => {
    fetchMyReqs();
  }, []);

  const fetchMyReqs = async () => {
    setIsLoading(true);
    try {
      const res = await requirementsApi.getMine();
      setRequirements(res.data.data.requirements || []);
    } catch (err) {
      toast.error('Failed to load your requests');
    } finally {
      setIsLoading(false);
    }
  };

  const closeReq = async (id: string) => {
    if (!window.confirm('Are you sure you want to close this requirement? Tutors will no longer be able to send offers.')) return;
    try {
      await requirementsApi.close(id);
      toast.success('Requirement closed successfully');
      setRequirements(prev => prev.map(r => r._id === id ? { ...r, status: 'closed' } : r));
    } catch (err) {
      toast.error('Could not close requirement');
    }
  };

  const filtered = requirements.filter(r => r.status === filter);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <Stagger stagger={0.06} delay={0.05}>
        <div style={{ padding: '28px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <StaggerItem>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gray-900)', marginBottom: 8 }}>
                My <span className="gradient-text">Requests</span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Track your posted learning requirements and manage tutor offers.</p>
            </StaggerItem>
          </div>
          <StaggerItem>
            <Link to="/requirements/new">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
                style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 700 }}
              >
                + New Request
              </motion.button>
            </Link>
          </StaggerItem>
        </div>
      </Stagger>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1.5px solid var(--gray-100)', paddingBottom: 16 }}>
        {[
          { id: 'open', label: 'Active Requests' },
          { id: 'closed', label: 'Past / Closed' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            style={{
              padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filter === tab.id ? 'var(--gray-900)' : 'transparent',
              color: filter === tab.id ? '#fff' : 'var(--gray-500)',
              fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, border: '4px solid var(--gray-200)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: 'white', borderRadius: 24, padding: '60px 20px', border: '1px dashed var(--gray-300)', textAlign: 'center' }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', margin: '0 auto 20px' }}>
              <BookOpen size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>No {filter} requests</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto 24px' }}>
              {filter === 'open' ? "You don't have any active requirements posted right now." : "You haven't closed any requirements yet."}
            </p>
            {filter === 'open' && (
              <Link to="/requirements/new">
                <button className="btn btn-primary">Post a Requirement</button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: 16 }}>
            {filtered.map((req, i) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}
                style={{
                  background: 'white', borderRadius: 20, padding: 24, border: '1.5px solid var(--gray-100)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: req.status === 'open' ? 'linear-gradient(to bottom, #10b981, #059669)' : 'var(--gray-300)' }} />
                
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--indigo-light)', color: 'var(--indigo-deep)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {req.className} • {req.board}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Posted {timeAgo(req.createdAt)}</span>
                    </div>
                    
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>
                      {req.subject} Tutor
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                        <MapPin size={14} className="text-gray-400" /> {req.teachingMode.replace('_', ' ')}
                      </div>
                      {(req as any).budgetType !== 'hourly' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                          <Clock size={14} className="text-gray-400" /> {req.schedule?.days?.length || 0} days/week
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                        <IndianRupee size={14} className="text-gray-400" /> {req.budgetMin} - {req.budgetMax} / {(req as any).budgetType === 'hourly' ? 'hr' : 'mo'}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 0 }}>
                      {req.description ? (req.description.length > 150 ? req.description.slice(0, 150) + '...' : req.description) : 'No description provided.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200, alignItems: 'stretch' }}>
                    <div style={{ background: 'var(--lavender-soft)', border: '1px solid var(--lavender)', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--indigo-deep)', lineHeight: 1 }}>{req.offersReceived || 0}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--indigo)', marginTop: 4 }}>Offers Received</div>
                    </div>
                    
                    {filter === 'open' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button onClick={() => closeReq(req._id)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid var(--gray-200)', background: '#fff', color: 'var(--gray-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} whileHover={{ background: 'var(--gray-50)' }} whileTap={{ scale: 0.95 }}>
                          <Trash2 size={16} />
                        </motion.button>
                        <Link to={`/offers?req=${req._id}`} style={{ flex: 4 }}>
                          <motion.button className="btn btn-primary" style={{ width: '100%', padding: '10px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} whileTap={{ scale: 0.95 }}>
                            View Offers <ArrowRight size={14} />
                          </motion.button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
