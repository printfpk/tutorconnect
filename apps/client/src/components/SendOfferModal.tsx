import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, TrendingDown, TrendingUp, Minus, Plus, CheckCircle, MessageSquare, IndianRupee } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Requirement {
  _id: string;
  subject: string;
  className: string;
  board: string;
  budgetMin: number;
  budgetMax: number;
  budgetType: string;
  isNegotiable: boolean;
  teachingMode: string;
}

interface SendOfferModalProps {
  requirement: Requirement | null;
  onClose: () => void;
  onSuccess: (reqId: string) => void;
}

export default function SendOfferModal({ requirement, onClose, onSuccess }: SendOfferModalProps) {
  const midBudget = requirement ? Math.round((requirement.budgetMin + requirement.budgetMax) / 2) : 0;
  const [proposedRate, setProposedRate] = useState(midBudget);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (requirement) {
      const mid = Math.round((requirement.budgetMin + requirement.budgetMax) / 2);
      setProposedRate(mid);
      setMessage('');
    }
  }, [requirement]);

  useEffect(() => {
    if (requirement) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [requirement]);

  if (!requirement) return null;

  const { budgetMin, budgetMax, budgetType, isNegotiable } = requirement;
  const perLabel = budgetType === 'hourly' ? '/hr' : '/mo';
  const clampedRate = Math.max(0, proposedRate);

  const priceStatus = () => {
    if (proposedRate < budgetMin) return { label: 'Below budget', color: '#e53e3e', icon: <TrendingDown size={14} />, bg: '#fff5f5' };
    if (proposedRate > budgetMax) return { label: 'Above budget', color: '#d97706', icon: <TrendingUp size={14} />, bg: '#fffbeb' };
    return { label: 'Within budget', color: '#059669', icon: <CheckCircle size={14} />, bg: '#f0fdf4' };
  };

  const status = priceStatus();

  const step = budgetType === 'hourly' ? 25 : 100;

  const handleSubmit = async () => {
    if (!proposedRate || proposedRate <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/requirements/${requirement._id}/offer`, {
        proposedRate,
        message: message.trim() || undefined,
      });
      toast.success('Offer sent successfully!');
      onSuccess(requirement._id);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to send offer';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const percentage = Math.min(100, Math.max(0, ((proposedRate - budgetMin) / Math.max(1, budgetMax - budgetMin)) * 100));

  return (
    <AnimatePresence>
      {requirement && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(2px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            style={{
              position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: '100%', maxWidth: 400, maxHeight: '90vh', background: 'white', borderRadius: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 1001, overflow: 'hidden',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-100)', position: 'relative', flexShrink: 0 }}>
              <button
                onClick={onClose}
                style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} color="var(--gray-400)" />
              </button>
              
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 4px' }}>
                Make an Offer
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Budget: <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>₹{budgetMin} - ₹{budgetMax}{perLabel}</span>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px', overflowY: 'auto' }}>
              {/* Proposed rate input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 8 }}>
                  Your Offer Price
                </label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee size={16} color="var(--gray-500)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    ref={inputRef}
                    type="number"
                    min="0"
                    value={proposedRate || ''}
                    onChange={e => setProposedRate(Number(e.target.value))}
                    style={{
                      width: '100%', padding: '12px 14px 12px 38px',
                      fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)',
                      border: '1.5px solid var(--gray-200)', borderRadius: 12, outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--gray-400)' }}>{perLabel}</span>
                </div>
                {/* Status pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: status.color, fontSize: '0.75rem', fontWeight: 600, marginTop: 8 }}>
                  {status.icon} {status.label}
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 8 }}>
                  Message <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Why should they choose you?"
                  rows={2}
                  maxLength={500}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 12,
                    fontSize: '0.85rem', fontFamily: 'var(--font-sans)', resize: 'vertical', outline: 'none',
                    color: 'var(--gray-800)', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid var(--gray-200)', background: 'white', color: 'var(--gray-700)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !proposedRate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1.5, padding: '11px', borderRadius: 12, border: 'none',
                    background: '#10b981', color: 'white', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Offer'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
