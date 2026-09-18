import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../components/ProtectedRoute';
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowRight, Loader2, Sparkles, Star, BookOpen, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Refs for GSAP
  const leftRef = useRef<HTMLDivElement>(null);
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Organic blob floating
    [orb1, orb2, orb3].forEach((ref, i) => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        y: `random(-30, 30)`,
        x: `random(-20, 20)`,
        rotation: `random(-8, 8)`,
        duration: 4 + i * 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    });

    // Floating geometric shapes
    shapeRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        y: `random(-25, 25)`,
        x: `random(-15, 15)`,
        rotation: `random(-20, 20)`,
        duration: 5 + i * 0.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.3,
      });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      const user = useAuthStore.getState().user;
      toast.success('Welcome back!');
      navigate(getDashboardPath(user?.role || 'parent'));
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Login failed.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      background: '#020005',
    }}>

      {/* ════ FULL BACKGROUND ════ */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* Rich gradient base */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #020005 0%, #0a0118 40%, #050010 100%)',
        }} />

        {/* Vivid orbs — BIG and VISIBLE */}
        <div ref={orb1} style={{
          position: 'absolute', width: 600, height: 600, top: '-10%', right: '-5%',
          borderRadius: '50%', filter: 'blur(100px)',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(79, 70, 229, 0.1) 50%, transparent 80%)',
        }} />
        <div ref={orb2} style={{
          position: 'absolute', width: 500, height: 500, bottom: '-10%', left: '0%',
          borderRadius: '50%', filter: 'blur(90px)',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 80%)',
        }} />
        <div ref={orb3} style={{
          position: 'absolute', width: 400, height: 400, top: '40%', left: '30%',
          borderRadius: '50%', filter: 'blur(80px)',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(2, 132, 199, 0.05) 50%, transparent 80%)',
        }} />

        {/* Floating geometric shapes */}
        {[
          { top: '15%', left: '8%', size: 60, rotate: 45, border: 'rgba(139,92,246,0.3)', bg: 'rgba(139,92,246,0.05)' },
          { top: '60%', left: '15%', size: 40, rotate: 20, border: 'rgba(236,72,153,0.25)', bg: 'rgba(236,72,153,0.04)' },
          { top: '25%', left: '40%', size: 30, rotate: 60, border: 'rgba(56,189,248,0.2)', bg: 'rgba(56,189,248,0.03)', round: true },
          { top: '75%', left: '35%', size: 50, rotate: 30, border: 'rgba(139,92,246,0.2)', bg: 'rgba(139,92,246,0.04)' },
          { top: '10%', left: '45%', size: 24, rotate: 0, border: 'rgba(253,186,116,0.3)', bg: 'rgba(253,186,116,0.06)', round: true },
        ].map((s, i) => (
          <div
            key={i}
            ref={(el) => { shapeRefs.current[i] = el; }}
            style={{
              position: 'absolute', top: s.top, left: s.left,
              width: s.size, height: s.size,
              border: `1.5px solid ${s.border}`,
              background: s.bg,
              borderRadius: (s as any).round ? '50%' : '12px',
              transform: `rotate(${s.rotate}deg)`,
              backdropFilter: 'blur(4px)',
            }}
          />
        ))}

        {/* Dot grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* ════ LEFT SIDE ════ */}
      <div ref={leftRef} style={{
        width: '55%', display: 'none', position: 'relative', zIndex: 10,
        padding: '4rem', alignItems: 'center', justifyContent: 'center',
      }} className="lg:!flex">
        <div style={{ maxWidth: 540 }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}
          >
            <motion.div
              style={{
                width: 56, height: 56, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                boxShadow: '0 0 30px rgba(124,58,237,0.4)',
              }}
              animate={{ boxShadow: ['0 0 20px rgba(124,58,237,0.3)', '0 0 40px rgba(124,58,237,0.5)', '0 0 20px rgba(124,58,237,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <GraduationCap size={30} color="white" />
            </motion.div>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              TutorConnect
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 28 }}
          >
            <span style={{ fontSize: 72, display: 'block', color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Find the</span>
            <span style={{
              fontSize: 72, display: 'block',
              background: 'linear-gradient(to right, #ffffff 0%, #a5b4fc 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              textShadow: '0 0 30px rgba(165,180,252,0.3)',
              paddingRight: 10,
            }}>
              Perfect Tutor
            </span>
            <span style={{ fontSize: 72, display: 'block', color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Near You</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: 40, maxWidth: 440 }}
          >
            Connect with verified educators for school subjects, music, art, coding and more. Post your requirement, compare, and start learning.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10, marginBottom: 48 }}
          >
            {[
              { text: 'Location-Based', icon: '📍' },
              { text: 'Verified Tutors', icon: '✅' },
              { text: 'Flash Tutoring', icon: '⚡' },
              { text: 'Real-time Chat', icon: '💬' },
            ].map((f, i) => (
              <motion.span
                key={f.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  padding: '8px 18px', borderRadius: 999,
                  fontSize: 13, fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(12px)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                {f.icon} {f.text}
              </motion.span>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <div style={{ display: 'flex' }}>
              {['🧑‍🏫', '👩‍🎓', '👨‍💻', '🎵', '📐'].map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.08, type: 'spring', stiffness: 400, damping: 15 }}
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, marginLeft: i > 0 ? -8 : 0,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  {e}
                </motion.div>
              ))}
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>Trusted by 1,000+ families</div>
              <div style={{ fontSize: 13 }}>
                <span style={{ color: '#fbbf24' }}>★★★★★</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 6 }}>4.8 average rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ════ RIGHT — FORM ════ */}
      <div style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', zIndex: 10,
      }} className="lg:!w-[45%]">
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 24, padding: '40px 36px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Top gradient accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, #7c3aed, #6366f1, #c084fc, #f0abfc)',
            }} />

            {/* Mobile logo */}
            <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                <GraduationCap size={20} color="white" />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-display)' }}>
                TutorConnect
              </span>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4, fontFamily: 'var(--font-display)' }}
            >
              Welcome back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}
            >
              Sign in to continue your learning journey
            </motion.p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                style={{ marginBottom: 20 }}
              >
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 6, letterSpacing: '0.01em' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: focusedField === 'email' ? '#6366f1' : '#94a3b8',
                    transition: 'color 0.2s',
                  }} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%', padding: '14px 16px 14px 44px',
                      fontSize: 15, fontWeight: 600, borderRadius: 14,
                      border: `2px solid ${focusedField === 'email' ? '#6366f1' : '#e2e8f0'}`,
                      background: focusedField === 'email' ? '#faf5ff' : 'white',
                      color: '#0f172a', outline: 'none', opacity: 1,
                      boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(99,102,241,0.08)' : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                style={{ marginBottom: 28 }}
              >
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: focusedField === 'pw' ? '#6366f1' : '#94a3b8',
                    transition: 'color 0.2s',
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField('pw')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '14px 44px 14px 44px',
                      fontSize: 15, fontWeight: 600, borderRadius: 14,
                      border: `2px solid ${focusedField === 'pw' ? '#6366f1' : '#e2e8f0'}`,
                      background: focusedField === 'pw' ? '#faf5ff' : 'white',
                      color: '#0f172a', outline: 'none', opacity: 1,
                      boxShadow: focusedField === 'pw' ? '0 0 0 4px rgba(99,102,241,0.08)' : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#94a3b8', padding: 2,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 35px rgba(99,102,241,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{
                    width: '100%', padding: '16px 24px', borderRadius: 14,
                    fontSize: 16, fontWeight: 700, color: 'white',
                    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 8px 25px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                    position: 'relative', overflow: 'hidden',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {/* Animated shine */}
                  <motion.div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                  />
                  {isLoading ? (
                    <><Loader2 size={20} className="animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign in <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#94a3b8' }}>New here?</span>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)' }} />
            </div>

            {/* Register CTA */}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02, borderColor: '#a5b4fc', background: '#faf5ff' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  width: '100%', padding: '14px 24px', borderRadius: 14,
                  fontSize: 14, fontWeight: 700, color: '#475569',
                  background: 'white', border: '2px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer',
                }}
              >
                Create your account <ArrowRight size={15} />
              </motion.div>
            </Link>
          </div>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{ textAlign: 'center' as const, marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.25)' }}
          >
            Find, compare, and book trusted tutors near you
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
