import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, BookOpen, MapPin, Calendar, IndianRupee, Check, Flame } from 'lucide-react';
import { AnimatedInput } from '../components/AnimatedInput';
import { getDashboardPath } from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Steps:
//   1 → Subject / Class / Board
//   2 → Teaching Mode (online / offline / both)
//   3 → Monthly or Hourly  ← NEW position
//   4 → Schedule (days/sessions) — shown ONLY for monthly
//   5 → Budget
// Hourly users jump: 1 → 2 → 3 → 5  (step 4 is skipped)

export default function PostRequirementPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    className: '',
    board: 'CBSE',
    teachingMode: 'online' as 'online' | 'home_tuition' | 'at_tutor_place' | 'any',
    budgetType: '' as 'monthly' | 'hourly' | '',
    scheduleDays: [] as string[],
    preferredTime: 'Flexible',
    sessionsPerWeek: 3,
    budgetMin: '',
    budgetMax: '',
    isNegotiable: true,
    description: '',
    pincode: '',
    address: ''
  });

  const isHourly = formData.budgetType === 'hourly';

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter(d => d !== day)
        : [...prev.scheduleDays, day]
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.subject || !formData.className)) {
      toast.error('Please fill in the subject and class');
      return;
    }
    if (step === 2 && formData.teachingMode !== 'online' && !formData.pincode) {
      toast.error('Pincode is required for offline tutoring');
      return;
    }
    if (step === 3 && !formData.budgetType) {
      toast.error('Please choose monthly or hourly');
      return;
    }
    if (step === 4 && !isHourly && formData.scheduleDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    if (step === 3 && isHourly) {
      // Hourly users skip the schedule step entirely
      setStep(5);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.budgetMin || !formData.budgetMax) {
      toast.error('Please enter your budget');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        subject: formData.subject,
        className: formData.className,
        board: formData.board,
        teachingMode: formData.teachingMode,
        budgetType: formData.budgetType || 'monthly',
        schedule: isHourly
          ? { days: [], preferredTime: 'Flexible', sessionsPerWeek: 1 }
          : { days: formData.scheduleDays, preferredTime: formData.preferredTime, sessionsPerWeek: formData.sessionsPerWeek },
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        isNegotiable: formData.isNegotiable,
        description: formData.description
      };

      if (formData.teachingMode !== 'online') {
        payload.location = {
          type: 'Point',
          coordinates: [0, 0],
          pincode: formData.pincode,
          address: formData.address
        };
      }

      await api.post('/requirements', payload);
      toast.success('Requirement posted successfully!');
      navigate(getDashboardPath(user?.role || 'parent'));
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to post requirement');
    } finally {
      setIsLoading(false);
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  // Progress bar: monthly = 5 logical steps, hourly = 4 (step 4 is skipped)
  // Map current step → filled segments
  const totalSegments = isHourly ? 4 : 5;
  const filledSegments = isHourly
    ? step === 5 ? 4 : step  // after skip, step 5 = segment 4
    : step;

  const stepTitles: Record<number, string> = {
    1: 'What do you want to learn?',
    2: 'How do you want to learn?',
    3: 'What type of tutor?',
    4: isHourly ? 'What is your budget?' : 'When do you want to learn?',
    5: 'What is your budget?',
  };
  const stepDescs: Record<number, string> = {
    1: 'Tell us the subject and class you need a tutor for.',
    2: 'Choose your preferred teaching mode and location.',
    3: 'This shapes the rest of your requirement.',
    4: isHourly ? `Set a budget range (₹ per hour).` : 'Set your preferred schedule and days.',
    5: `Set a budget range (₹ per ${isHourly ? 'hour' : 'month'}).`,
  };

  const stepIcons: Record<number, React.ReactNode> = {
    1: <BookOpen size={32} color="#111827" strokeWidth={1.5} />,
    2: <MapPin size={32} color="#111827" strokeWidth={1.5} />,
    3: <Flame size={32} color="#f97316" strokeWidth={1.5} />,
    4: isHourly ? <IndianRupee size={32} color="#111827" strokeWidth={1.5} /> : <Calendar size={32} color="#111827" strokeWidth={1.5} />,
    5: <IndianRupee size={32} color="#111827" strokeWidth={1.5} />,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa', fontFamily: '"Inter", sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => {
            if (step === 1) navigate(-1);
            else if (step === 5 && isHourly) setStep(3); // hourly: back from budget goes to type selection
            else setStep(s => s - 1);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '15px', fontWeight: 500 }}
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {Array.from({ length: totalSegments }, (_, i) => (
              <div
                key={i}
                style={{
                  width: '36px', height: '4px', borderRadius: '2px',
                  background: i < filledSegments ? '#111827' : '#e5e7eb',
                  transition: 'background 0.3s'
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ width: '60px' }} />
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{
          width: '100%',
          maxWidth: step === 3 ? '580px' : '520px',
          background: '#fff',
          padding: '48px',
          borderRadius: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          border: '1px solid #f3f4f6',
          transition: 'max-width 0.35s ease'
        }}>

          {/* Step header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: step === 3 ? '#fff7ed' : '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s'
            }}>
              {stepIcons[step]}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {stepTitles[step]}
              </h1>
              <p style={{ color: '#6b7280', fontSize: '15px', marginTop: '4px' }}>
                {stepDescs[step]}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial="hidden" animate="visible"
              exit={{ opacity: 0, x: -20, transition: { duration: 0.18 } }}
              variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.07 } } }}
            >

              {/* ── STEP 1 ── Subject / Class / Board */}
              {step === 1 && (
                <div>
                  <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Subject</label>
                    <AnimatedInput
                      placeholder="e.g. Mathematics, Physics, Guitar"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      onFocus={() => setFocusedField('sub')} onBlur={() => setFocusedField(null)}
                      style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'sub' ? '#000' : '#e5e7eb'}`, outline: 'none' }}
                    />
                  </motion.div>

                  <motion.div variants={staggerItem} style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Class / Standard</label>
                      <AnimatedInput
                        placeholder="e.g. Class 10"
                        value={formData.className}
                        onChange={e => setFormData({ ...formData, className: e.target.value })}
                        onFocus={() => setFocusedField('cls')} onBlur={() => setFocusedField(null)}
                        style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'cls' ? '#000' : '#e5e7eb'}`, outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Board</label>
                      <select
                        value={formData.board}
                        onChange={e => setFormData({ ...formData, board: e.target.value })}
                        onFocus={() => setFocusedField('brd')} onBlur={() => setFocusedField(null)}
                        style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'brd' ? '#000' : '#e5e7eb'}`, outline: 'none', background: 'transparent', appearance: 'none', color: '#111827' }}
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                        <option value="Odisha Board">Odisha Board</option>
                        <option value="IGCSE">IGCSE</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </motion.div>

                  <motion.button variants={staggerItem} onClick={handleNext}
                    style={{ width: '100%', padding: '18px', borderRadius: '999px', background: '#111827', color: '#fff', fontSize: '16px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                    Continue
                  </motion.button>
                </div>
              )}

              {/* ── STEP 2 ── Teaching Mode */}
              {step === 2 && (
                <div>
                  <motion.div variants={staggerItem} style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '16px' }}>Preferred Teaching Mode</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {[
                        { value: 'online', label: '🖥️ Online' },
                        { value: 'home_tuition', label: '🏠 Home Tuition' },
                        { value: 'at_tutor_place', label: "📍 Tutor's Place" },
                        { value: 'any', label: '🔄 Any Mode' },
                      ].map(({ value, label }) => (
                        <div
                          key={value}
                          onClick={() => setFormData({ ...formData, teachingMode: value as any })}
                          style={{ flex: 1, padding: '14px 8px', textAlign: 'center', borderRadius: '12px', border: `2px solid ${formData.teachingMode === value ? '#111827' : '#e5e7eb'}`, background: formData.teachingMode === value ? '#fafafa' : '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '13px', color: formData.teachingMode === value ? '#111827' : '#6b7280', transition: 'all 0.2s' }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {formData.teachingMode !== 'online' && formData.teachingMode !== 'any' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Pincode</label>
                          <AnimatedInput
                            placeholder="e.g. 560001"
                            value={formData.pincode}
                            onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                            onFocus={() => setFocusedField('pin')} onBlur={() => setFocusedField(null)}
                            maxLength={6}
                            style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'pin' ? '#000' : '#e5e7eb'}`, outline: 'none' }}
                          />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Address (Optional)</label>
                          <textarea
                            placeholder="Locality, street, etc."
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            onFocus={() => setFocusedField('addr')} onBlur={() => setFocusedField(null)}
                            style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'addr' ? '#000' : '#e5e7eb'}`, outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: '"Inter", sans-serif' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button variants={staggerItem} onClick={handleNext}
                    style={{ width: '100%', padding: '18px', borderRadius: '999px', background: '#111827', color: '#fff', fontSize: '16px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                    Continue
                  </motion.button>
                </div>
              )}

              {/* ── STEP 3 ── Monthly vs Hourly */}
              {step === 3 && (
                <div>
                  <motion.div variants={staggerItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>

                    {/* Monthly Card */}
                    <motion.div
                      onClick={() => setFormData({ ...formData, budgetType: 'monthly' })}
                      whileHover={{ y: -3, boxShadow: '0 14px 40px rgba(0,0,0,0.12)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        position: 'relative', padding: '28px', borderRadius: '20px', cursor: 'pointer', overflow: 'hidden',
                        border: `2px solid ${formData.budgetType === 'monthly' ? '#111827' : '#e5e7eb'}`,
                        background: formData.budgetType === 'monthly' ? '#111827' : '#fff',
                        boxShadow: formData.budgetType === 'monthly' ? '0 8px 30px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                      }}
                    >
                      {/* HOT badge */}
                      <div style={{
                        position: 'absolute', top: '16px', right: '16px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '4px 12px', borderRadius: '999px',
                        background: 'linear-gradient(135deg, #f97316, #ef4444)',
                        color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em',
                        boxShadow: '0 2px 10px rgba(249,115,22,0.55)',
                      }}>
                        <Flame size={11} /> HOT
                      </div>
                      {formData.budgetType === 'monthly' && (
                        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '24px', height: '24px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} color="#111827" strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>📅</div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: formData.budgetType === 'monthly' ? '#fff' : '#111827', margin: '0 0 8px' }}>
                        Monthly Tutor
                      </h3>
                      <p style={{ fontSize: '14px', color: formData.budgetType === 'monthly' ? 'rgba(255,255,255,0.72)' : '#6b7280', margin: 0, lineHeight: 1.6 }}>
                        Hire a dedicated tutor for regular, ongoing classes. Pay a fixed monthly fee. Best for school subjects &amp; long-term learning.
                      </p>
                      <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Regular classes', 'Fixed schedule', 'Better bonding', 'Cost effective'].map(tag => (
                          <span key={tag} style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, background: formData.budgetType === 'monthly' ? 'rgba(255,255,255,0.15)' : '#f3f4f6', color: formData.budgetType === 'monthly' ? '#fff' : '#374151' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Hourly Card */}
                    <motion.div
                      onClick={() => setFormData({ ...formData, budgetType: 'hourly' })}
                      whileHover={{ y: -3, boxShadow: '0 14px 40px rgba(124,58,237,0.18)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        position: 'relative', padding: '28px', borderRadius: '20px', cursor: 'pointer', overflow: 'hidden',
                        border: `2px solid ${formData.budgetType === 'hourly' ? '#7c3aed' : '#e5e7eb'}`,
                        background: formData.budgetType === 'hourly' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff',
                        boxShadow: formData.budgetType === 'hourly' ? '0 8px 30px rgba(124,58,237,0.28)' : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                      }}
                    >
                      {/* INSTANT badge */}
                      <div style={{
                        position: 'absolute', top: '16px', right: '16px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '4px 12px', borderRadius: '999px',
                        background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                        color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em',
                        boxShadow: '0 2px 10px rgba(124,58,237,0.45)',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}>
                        ⚡ INSTANT
                      </div>
                      {formData.budgetType === 'hourly' && (
                        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '24px', height: '24px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} color="#7c3aed" strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>⏱️</div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: formData.budgetType === 'hourly' ? '#fff' : '#111827', margin: '0 0 8px' }}>
                        Hourly / Instant Tutor
                      </h3>
                      <p style={{ fontSize: '14px', color: formData.budgetType === 'hourly' ? 'rgba(255,255,255,0.72)' : '#6b7280', margin: 0, lineHeight: 1.6 }}>
                        Book a tutor on demand for specific hours or sessions. Pay per hour. Great for exam prep, doubt-clearing &amp; last-minute help.
                      </p>
                      <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Flexible booking', 'Pay per session', 'Exam prep', 'On-demand'].map(tag => (
                          <span key={tag} style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, background: formData.budgetType === 'hourly' ? 'rgba(255,255,255,0.15)' : '#f3f4f6', color: formData.budgetType === 'hourly' ? '#fff' : '#374151' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.button
                    variants={staggerItem}
                    onClick={handleNext}
                    disabled={!formData.budgetType}
                    style={{
                      width: '100%', padding: '18px', borderRadius: '999px',
                      background: formData.budgetType ? '#111827' : '#e5e7eb',
                      color: formData.budgetType ? '#fff' : '#9ca3af',
                      fontSize: '16px', fontWeight: 500, border: 'none',
                      cursor: formData.budgetType ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s'
                    }}
                  >
                    {formData.budgetType === 'hourly' ? '⚡ Continue — Skip to Budget' : 'Continue'}
                  </motion.button>
                </div>
              )}

              {/* ── STEP 4 ── Schedule (Monthly only) */}
              {step === 4 && !isHourly && (
                <div>
                  <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>Preferred Days</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {DAYS_OF_WEEK.map(day => {
                        const isSelected = formData.scheduleDays.includes(day);
                        return (
                          <div
                            key={day}
                            onClick={() => toggleDay(day)}
                            style={{ padding: '10px 16px', borderRadius: '999px', border: `1px solid ${isSelected ? '#111827' : '#e5e7eb'}`, background: isSelected ? '#111827' : '#fff', color: isSelected ? '#fff' : '#4b5563', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            {isSelected && <Check size={14} />} {day.slice(0, 3)}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Sessions per week</label>
                      <select
                        value={formData.sessionsPerWeek}
                        onChange={e => setFormData({ ...formData, sessionsPerWeek: Number(e.target.value) })}
                        onFocus={() => setFocusedField('sess')} onBlur={() => setFocusedField(null)}
                        style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'sess' ? '#000' : '#e5e7eb'}`, outline: 'none', background: 'transparent', appearance: 'none' }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Sessions</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Preferred Time</label>
                      <select
                        value={formData.preferredTime}
                        onChange={e => setFormData({ ...formData, preferredTime: e.target.value })}
                        onFocus={() => setFocusedField('time')} onBlur={() => setFocusedField(null)}
                        style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'time' ? '#000' : '#e5e7eb'}`, outline: 'none', background: 'transparent', appearance: 'none' }}
                      >
                        <option value="Flexible">Flexible</option>
                        <option value="Morning">Morning (8AM – 12PM)</option>
                        <option value="Afternoon">Afternoon (12PM – 4PM)</option>
                        <option value="Evening">Evening (4PM – 8PM)</option>
                      </select>
                    </div>
                  </motion.div>

                  <motion.button variants={staggerItem} onClick={handleNext}
                    style={{ width: '100%', padding: '18px', borderRadius: '999px', background: '#111827', color: '#fff', fontSize: '16px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                    Continue
                  </motion.button>
                </div>
              )}

              {/* ── STEP 5 ── Budget (both types) */}
              {step === 5 && (
                <form onSubmit={handleSubmit}>
                  {/* Context reminder pill */}
                  <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px',
                      background: isHourly ? 'linear-gradient(135deg, #ede9fe, #ddd6fe)' : '#f0fdf4',
                      border: `1px solid ${isHourly ? '#c4b5fd' : '#bbf7d0'}`,
                      fontSize: '13px', fontWeight: 600,
                      color: isHourly ? '#6d28d9' : '#15803d',
                    }}>
                      {isHourly ? '⏱️ Hourly / Instant tutor' : '📅 Monthly tutor'}
                      <span style={{ fontWeight: 400, color: isHourly ? '#7c3aed' : '#16a34a' }}>
                        — budget in ₹ per {isHourly ? 'hour' : 'month'}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                        Min Budget (₹ / {isHourly ? 'hr' : 'mo'})
                      </label>
                      <AnimatedInput
                        type="number"
                        placeholder={isHourly ? 'e.g. 150' : 'e.g. 2000'}
                        value={formData.budgetMin}
                        onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                        onFocus={() => setFocusedField('bmin')} onBlur={() => setFocusedField(null)}
                        style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'bmin' ? '#000' : '#e5e7eb'}`, outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                        Max Budget (₹ / {isHourly ? 'hr' : 'mo'})
                      </label>
                      <AnimatedInput
                        type="number"
                        placeholder={isHourly ? 'e.g. 500' : 'e.g. 5000'}
                        value={formData.budgetMax}
                        onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                        onFocus={() => setFocusedField('bmax')} onBlur={() => setFocusedField(null)}
                        style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'bmax' ? '#000' : '#e5e7eb'}`, outline: 'none' }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div
                      onClick={() => setFormData({ ...formData, isNegotiable: !formData.isNegotiable })}
                      style={{ width: '20px', height: '20px', borderRadius: '6px', background: formData.isNegotiable ? '#111827' : '#fff', border: `1px solid ${formData.isNegotiable ? '#111827' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      {formData.isNegotiable && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '14px', color: '#4b5563', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, isNegotiable: !formData.isNegotiable })}>
                      Budget is negotiable
                    </span>
                  </motion.div>

                  <motion.div variants={staggerItem} style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Any specific requirements? (Optional)</label>
                    <textarea
                      placeholder="e.g. Need help specifically with Algebra, prefer female tutor, etc."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      onFocus={() => setFocusedField('desc')} onBlur={() => setFocusedField(null)}
                      style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '12px', border: `1px solid ${focusedField === 'desc' ? '#000' : '#e5e7eb'}`, outline: 'none', resize: 'vertical', minHeight: '100px', fontFamily: '"Inter", sans-serif' }}
                    />
                  </motion.div>

                  <motion.button
                    variants={staggerItem} type="submit" disabled={isLoading}
                    style={{ width: '100%', padding: '18px', borderRadius: '999px', background: '#111827', color: '#fff', fontSize: '16px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Post Requirement'}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
