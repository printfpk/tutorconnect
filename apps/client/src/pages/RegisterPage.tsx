import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../components/ProtectedRoute';
import { GradientBlob } from '../components/animations';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin,
  GraduationCap, BookOpen, Users,
  Loader2, CheckCircle2, ArrowRight, ArrowLeft, Zap, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

type RoleOption = 'parent' | 'student' | 'tutor';

const roles = [
  {
    value: 'parent' as RoleOption, label: 'Parent', emoji: '👨‍👩‍👧',
    desc: 'Find and book tutors for your children',
    icon: <Users size={24} strokeWidth={2.2} />,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glow: 'rgba(99,102,241,0.35)',
    lightBg: 'rgba(99,102,241,0.06)',
    accent: '#6366f1',
  },
  {
    value: 'student' as RoleOption, label: 'Student', emoji: '🎓',
    desc: 'Discover tutors and start learning',
    icon: <BookOpen size={24} strokeWidth={2.2} />,
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    glow: 'rgba(6,182,212,0.35)',
    lightBg: 'rgba(6,182,212,0.06)',
    accent: '#06b6d4',
  },
  {
    value: 'tutor' as RoleOption, label: 'Tutor', emoji: '🧑‍🏫',
    desc: 'Teach students in your neighborhood',
    icon: <GraduationCap size={24} strokeWidth={2.2} />,
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    glow: 'rgba(245,158,11,0.35)',
    lightBg: 'rgba(245,158,11,0.06)',
    accent: '#f59e0b',
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    pincode: '', password: '', confirmPassword: '',
    role: '' as RoleOption | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    shapeRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        y: `random(-25, 25)`, x: `random(-15, 15)`, rotation: `random(-15, 15)`,
        duration: 5 + i * 0.8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.3,
      });
    });
  }, []);

  const validateStep1 = () => {
    if (!formData.role) { setErrors({ role: 'Please select your role' }); return false; }
    setErrors({}); return true;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = 'Required';
    if (!formData.lastName.trim()) e.lastName = 'Required';
    if (!formData.email.trim()) e.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = 'Enter valid 6-digit pincode';
    if (!formData.password) e.password = 'Required';
    else if (formData.password.length < 8) e.password = 'Min 8 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      e.password = 'Need uppercase, lowercase & number';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateStep2()) return;
    try {
      await register({
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, phone: formData.phone || undefined,
        pincode: formData.pincode, password: formData.password,
        confirmPassword: formData.confirmPassword, role: formData.role as RoleOption,
      });
      toast.success('Welcome to TutorConnect! 🎉');
      navigate(getDashboardPath(useAuthStore.getState().user?.role || 'parent'));
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Registration failed.');
    }
  };

  const pwStr = (
    (formData.password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(formData.password) ? 1 : 0) +
    (/[a-z]/.test(formData.password) ? 1 : 0) +
    (/\d/.test(formData.password) ? 1 : 0)
  );

  const selectedRole = roles.find(r => r.value === formData.role);

  // Reusable input
  const Field = ({ id, label, icon, req = true, type = 'text', placeholder, value, onChange, error, note, inputMode, maxLength }: any) => (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6, letterSpacing: '0.02em' }}>
        {label} {req && <span style={{ color: '#f43f5e' }}>*</span>}
        {note && <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 4, fontSize: 12 }}>{note}</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focusedField === id ? '#6366f1' : '#94a3b8', transition: 'color 0.2s',
          }}>{icon}</div>
        )}
        <input
          id={id} type={type} inputMode={inputMode} maxLength={maxLength}
          placeholder={placeholder} value={value} onChange={onChange}
          onFocus={() => setFocusedField(id)} onBlur={() => setFocusedField(null)}
          required={req}
          style={{
            width: '100%', padding: `13px 16px 13px ${icon ? '42px' : '14px'}`,
            fontSize: 14, borderRadius: 12,
            border: `2px solid ${focusedField === id ? '#6366f1' : '#e2e8f0'}`,
            background: focusedField === id ? '#faf5ff' : 'white',
            color: '#0f172a', outline: 'none',
            boxShadow: focusedField === id ? '0 0 0 4px rgba(99,102,241,0.06)' : 'none',
            transition: 'all 0.25s ease',
          }}
        />
      </div>
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: '#0a0118' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0118 0%, #1a0533 25%, #0d1b3e 50%, #1a0533 75%, #0a0118 100%)' }} />
        <GradientBlob className="top-[-12%] left-[-8%]" color1="rgba(99,102,241,0.3)" color2="rgba(139,92,246,0.12)" size={550} speed={11} />
        <GradientBlob className="bottom-[-10%] right-[-5%]" color1="rgba(236,72,153,0.2)" color2="rgba(244,63,94,0.08)" size={400} speed={13} />
        <GradientBlob className="top-[45%] right-[20%]" color1="rgba(14,165,233,0.15)" color2="rgba(99,102,241,0.06)" size={300} speed={15} />
        {/* Shapes */}
        {[
          { t: '12%', l: '10%', s: 55, rot: 45, c: 'rgba(139,92,246,0.25)' },
          { t: '65%', l: '12%', s: 35, rot: 20, c: 'rgba(236,72,153,0.2)', round: true },
          { t: '22%', l: '42%', s: 28, rot: 60, c: 'rgba(56,189,248,0.2)', round: true },
          { t: '78%', l: '38%', s: 45, rot: 30, c: 'rgba(139,92,246,0.18)' },
        ].map((s, i) => (
          <div key={i} ref={el => { shapeRefs.current[i] = el; }} style={{
            position: 'absolute', top: s.t, left: s.l, width: s.s, height: s.s,
            border: `1.5px solid ${s.c}`, background: s.c.replace(/[\d.]+\)$/, '0.03)'),
            borderRadius: (s as any).round ? '50%' : 10, transform: `rotate(${s.rot}deg)`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* ═══ LEFT ═══ */}
      <div style={{ width: '55%', display: 'none', position: 'relative', zIndex: 10, padding: '3.5rem', alignItems: 'center', justifyContent: 'center' }} className="lg:!flex">
        <div style={{ maxWidth: 520 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
            <motion.div
              style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 0 25px rgba(124,58,237,0.4)' }}
              animate={{ boxShadow: ['0 0 20px rgba(124,58,237,0.3)', '0 0 40px rgba(124,58,237,0.5)', '0 0 20px rgba(124,58,237,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            ><GraduationCap size={26} color="white" /></motion.div>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>TutorConnect</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.06, marginBottom: 24 }}>
              <span style={{ fontSize: 64, display: 'block', color: 'white' }}>Join Our</span>
              <span style={{ fontSize: 64, display: 'block', background: 'linear-gradient(135deg, #a78bfa, #c084fc, #f0abfc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Learning</span>
              <span style={{ fontSize: 64, display: 'block', color: 'white' }}>Community</span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', marginBottom: 40, maxWidth: 420 }}>
            Whether you're a parent, student, or educator — TutorConnect matches you with the right people in your neighborhood.
          </motion.p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { v: '1,000+', l: 'Verified Tutors', e: '🎓' },
              { v: '50+', l: 'Subjects', e: '📚' },
              { v: '4.8★', l: 'Average Rating', e: '⭐' },
              { v: '<5km', l: 'Avg Distance', e: '📍' },
            ].map((s, i) => (
              <motion.div key={s.l}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.12)' }}
                style={{
                  padding: '18px 20px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(8px)', cursor: 'default',
                  transition: 'border-color 0.3s',
                }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.e}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>{s.v}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT — FORM ═══ */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 10 }} className="lg:!w-[45%]">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 430 }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.97)', borderRadius: 28,
            padding: '36px 32px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Gradient top accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #c084fc, #f0abfc, #f472b6)',
            }} />

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 2, fontFamily: 'var(--font-display)' }}>Create account</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
              Step {step} of 2 — {step === 1 ? 'Choose your role' : 'Your details'}
            </p>

            {/* Progress */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1, height: 5, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: s <= step ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                /* ═══ STEP 1 — ROLE SELECTION ═══ */
                <motion.div key="s1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {roles.map((r, i) => {
                      const selected = formData.role === r.value;
                      const hovered = hoveredRole === r.value;
                      return (
                        <motion.button
                          key={r.value}
                          type="button"
                          onClick={() => { setFormData({ ...formData, role: r.value }); setErrors({}); }}
                          onMouseEnter={() => setHoveredRole(r.value)}
                          onMouseLeave={() => setHoveredRole(null)}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            width: '100%', padding: '16px 18px', borderRadius: 18, textAlign: 'left' as const,
                            display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                            border: `2.5px solid ${selected ? r.accent : hovered ? 'rgba(99,102,241,0.15)' : '#f1f5f9'}`,
                            background: selected ? r.lightBg : hovered ? 'rgba(248,250,252,1)' : 'white',
                            boxShadow: selected
                              ? `0 0 0 4px ${r.glow.replace('0.35', '0.08')}, 0 8px 25px ${r.glow.replace('0.35', '0.12')}`
                              : hovered ? '0 4px 15px rgba(0,0,0,0.04)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                            transform: selected ? 'scale(1.02)' : hovered ? 'translateX(4px)' : 'none',
                          }}
                        >
                          {/* Icon container */}
                          <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            background: selected || hovered ? r.gradient : '#f8fafc',
                            color: selected || hovered ? 'white' : '#94a3b8',
                            boxShadow: selected ? `0 4px 15px ${r.glow}` : hovered ? `0 4px 12px ${r.glow.replace('0.35', '0.2')}` : 'none',
                            transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                          }}>
                            {r.icon}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{r.label}</span>
                              <span style={{ fontSize: 16 }}>{r.emoji}</span>
                            </div>
                            <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{r.desc}</span>
                          </div>

                          {/* Selection indicator */}
                          <AnimatePresence>
                            {selected ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                              >
                                <CheckCircle2 size={22} style={{ color: r.accent }} />
                              </motion.div>
                            ) : (
                              <motion.div
                                animate={{ x: hovered ? 3 : 0, opacity: hovered ? 0.5 : 0.15 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight size={18} style={{ color: '#94a3b8' }} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>

                  {errors.role && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{errors.role}</p>}

                  {/* Continue button — PREMIUM */}
                  <motion.button
                    type="button"
                    onClick={() => { if (validateStep1()) setStep(2); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', padding: '18px 28px', borderRadius: 16,
                      fontSize: 16, fontWeight: 700, color: 'white',
                      background: selectedRole
                        ? selectedRole.gradient
                        : 'linear-gradient(135deg, #6366f1, #7c3aed, #8b5cf6)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: selectedRole
                        ? `0 8px 30px ${selectedRole.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`
                        : '0 8px 30px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                      position: 'relative', overflow: 'hidden',
                      letterSpacing: '0.01em',
                      transition: 'box-shadow 0.4s ease',
                    }}
                  >
                    {/* Shine sweep */}
                    <motion.div
                      style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                    />
                    Continue
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                      <ArrowRight size={20} />
                    </motion.div>
                  </motion.button>
                </motion.div>
              ) : (
                /* ═══ STEP 2 — DETAILS ═══ */
                <motion.form key="s2" onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field id="fn" label="First name" icon={<User size={16} />} placeholder="First"
                      value={formData.firstName} onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} error={errors.firstName} />
                    <Field id="ln" label="Last name" placeholder="Last"
                      value={formData.lastName} onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} error={errors.lastName} />
                  </div>

                  <Field id="em" label="Email" icon={<Mail size={16} />} type="email" placeholder="you@example.com"
                    value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} error={errors.email} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field id="ph" label="Phone" icon={<Phone size={16} />} req={false} note="(optional)" placeholder="+91 XXXXX"
                      value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} />
                    <Field id="pc" label="Pincode" icon={<MapPin size={16} />} inputMode="numeric" maxLength={6} placeholder="560001"
                      value={formData.pincode} onChange={(e: any) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} error={errors.pincode} />
                  </div>

                  {/* Info */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
                    borderRadius: 12, background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.04))',
                    border: '1px solid rgba(99,102,241,0.08)',
                  }}>
                    <Zap size={13} style={{ color: '#6366f1', marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: '#6366f1', lineHeight: 1.5 }}>
                      Pincode matches you with nearby tutors. Google Maps location can be added later.
                    </p>
                  </div>

                  <Field id="pw" label="Password" icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters"
                    value={formData.password} onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} error={errors.password} />
                  
                  {formData.password && (
                    <div style={{ display: 'flex', gap: 4, marginTop: -8 }}>
                      {[1,2,3,4].map(l => (
                        <motion.div key={l} style={{ flex: 1, height: 3, borderRadius: 999, transformOrigin: 'left' }}
                          animate={{
                            scaleX: l <= pwStr ? 1 : 0.3,
                            backgroundColor: l <= pwStr ? ['#ef4444','#f59e0b','#fbbf24','#10b981'][pwStr-1] : '#e2e8f0',
                          }}
                          transition={{ duration: 0.4 }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ position: 'relative' }}>
                    <Field id="cpw" label="Confirm password" icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'} placeholder="Repeat password"
                      value={formData.confirmPassword} onChange={(e: any) => setFormData({ ...formData, confirmPassword: e.target.value })} error={errors.confirmPassword} />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        style={{ position: 'absolute', right: 12, top: 36 }}>
                        <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                      </motion.div>
                    )}
                  </div>

                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />} {showPassword ? 'Hide' : 'Show'} passwords
                  </button>

                  <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                    <motion.button type="button" onClick={() => setStep(1)}
                      whileHover={{ borderColor: '#a5b4fc' }} whileTap={{ scale: 0.97 }}
                      style={{
                        padding: '14px 18px', borderRadius: 14, fontSize: 14, fontWeight: 700,
                        color: '#475569', background: 'white', border: '2px solid #e2e8f0',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                      <ArrowLeft size={16} /> Back
                    </motion.button>

                    <motion.button type="submit" disabled={isLoading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{
                        flex: 1, padding: '14px 20px', borderRadius: 14,
                        fontSize: 15, fontWeight: 700, color: 'white',
                        background: selectedRole ? selectedRole.gradient : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: `0 8px 25px ${selectedRole ? selectedRole.glow : 'rgba(99,102,241,0.3)'}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                        opacity: isLoading ? 0.7 : 1, position: 'relative', overflow: 'hidden',
                      }}>
                      <motion.div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                        animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }} />
                      {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : <>Create account <ArrowRight size={16} /></>}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
              Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
