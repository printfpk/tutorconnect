import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stagger, StaggerItem } from '../../components/animations';
import { IndianRupee, Clock, CheckCircle, XCircle, BookOpen, Send } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface MyOffer {
  _id: string;
  proposedRate: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  requirement: {
    _id: string;
    subject: string;
    className: string;
    board: string;
    budgetMin: number;
    budgetMax: number;
    budgetType: string;
    teachingMode: string;
    status: string;
  };
}

const statusConfig = {
  pending:  { label: 'Pending',  color: '#d97706', bg: '#fffbeb', icon: <Clock size={13} /> },
  accepted: { label: 'Accepted', color: '#059669', bg: '#f0fdf4', icon: <CheckCircle size={13} /> },
  rejected: { label: 'Declined', color: '#dc2626', bg: '#fef2f2', icon: <XCircle size={13} /> },
};

export default function TutorOffersPage() {
  const [offers, setOffers] = useState<MyOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/requirements/offers/mine')
      .then(res => setOffers(res.data?.data?.offers || []))
      .catch(() => toast.error('Failed to load offers'))
      .finally(() => setIsLoading(false));
  }, []);

  const pending  = offers.filter(o => o.status === 'pending');
  const accepted = offers.filter(o => o.status === 'accepted');
  const rejected = offers.filter(o => o.status === 'rejected');

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: '28px 0 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 6px' }}>
          My Offers
        </h1>
        <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.95rem' }}>
          Track all the offers you've sent to parents
        </p>
      </div>

      {/* Stats */}
      {!isLoading && offers.length > 0 && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Sent', value: offers.length, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Pending', value: pending.length, color: '#d97706', bg: '#fffbeb' },
            { label: 'Accepted', value: accepted.length, color: '#059669', bg: '#f0fdf4' },
            { label: 'Declined', value: rejected.length, color: '#dc2626', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: s.bg, border: `1.5px solid ${s.color}22`, borderRadius: 16, padding: '14px 18px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: s.color, opacity: 0.75 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)', fontSize: '0.95rem' }}>
          Loading your offers...
        </div>
      ) : offers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 24, border: '1.5px solid var(--gray-100)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--gray-300)' }}>
            <Send size={32} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>No offers sent yet</h3>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Go to Discover and send your first offer to a parent!</p>
        </div>
      ) : (
        <Stagger stagger={0.07} delay={0.05} style={{ display: 'grid', gap: 14 }}>
          {offers.map(offer => {
            const s = statusConfig[offer.status] || statusConfig.pending;
            const req = offer.requirement;
            const perLabel = req?.budgetType === 'hourly' ? '/hr' : '/mo';
            return (
              <StaggerItem key={offer._id}>
                <motion.div
                  whileHover={{ y: -2 }}
                  style={{ background: 'white', borderRadius: 20, padding: '20px 24px', border: '1.5px solid var(--gray-100)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', gap: 20, alignItems: 'center' }}
                >
                  {/* Subject icon */}
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--lavender-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={22} color="var(--indigo-deep)" />
                  </div>

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--gray-900)' }}>
                        {req?.subject || 'Unknown'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 700 }}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 6 }}>
                      {req?.className} · {req?.board} · {req?.teachingMode}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                      Parent's budget: <strong style={{ color: 'var(--gray-700)' }}>₹{req?.budgetMin}–₹{req?.budgetMax}{perLabel}</strong>
                    </div>
                    {offer.message && (
                      <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--gray-500)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        "{offer.message}"
                      </div>
                    )}
                  </div>

                  {/* Your rate */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 800, fontSize: '1.3rem', color: 'var(--indigo-deep)' }}>
                      <IndianRupee size={16} strokeWidth={2.5} />
                      {offer.proposedRate}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: 2 }}>Your offer{perLabel}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--gray-300)', marginTop: 4 }}>
                      {new Date(offer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
