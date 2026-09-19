import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../components/ProtectedRoute';
import { Eye, EyeOff, ArrowLeft, Loader2, Users, BookOpen, GraduationCap, MapPin, Phone, Check } from 'lucide-react';
import { AnimatedInput } from '../components/AnimatedInput';
import { AnimatedEye } from '../components/AnimatedEye';
import { AuthSidebar } from '../components/AuthSidebar';
import toast from 'react-hot-toast';

type RoleOption = 'parent' | 'student' | 'tutor';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    pincode: '', password: '', role: '' as RoleOption | '',
    location: undefined as { type: 'Point'; coordinates: [number, number] } | undefined,
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const pwRules = [
    { id: 'len', label: '8+ characters', test: (pw: string) => pw.length >= 8 },
    { id: 'up', label: 'Uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
    { id: 'low', label: 'Lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
    { id: 'num', label: 'Number', test: (pw: string) => /[0-9]/.test(pw) },
    { id: 'sp', label: 'Special character', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
  ];
  const passedRules = pwRules.filter(r => r.test(formData.password));
  const pwStrength = passedRules.length / pwRules.length;
  const isPwValid = pwStrength === 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions.');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await register({
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, phone: formData.phone || undefined,
        pincode: formData.pincode, password: formData.password,
        confirmPassword: formData.password, role: formData.role as RoleOption,
        location: formData.location,
      });
      toast.success('Account created successfully!');
      navigate(getDashboardPath(useAuthStore.getState().user?.role || 'parent'));
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Registration failed.');
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#ffffff', fontFamily: '"Inter", sans-serif', padding: '16px', gap: '16px' }}>
      {/* ═══ LEFT SIDE — IMAGES/BRANDING ═══ */}
      <div 
        className="hidden lg:block"
        style={{ 
          width: '50%', 
          height: 'calc(100vh - 32px)',
          position: 'sticky',
          top: '16px',
        }}
      >
        <AuthSidebar />
      </div>

      {/* ═══ RIGHT SIDE — FORM ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              style={{ width: '100%', maxWidth: '440px', padding: '20px 0' }}
              initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
                <Link to="/" style={{ color: '#6b7280', display: 'inline-flex' }}>
                  <ArrowLeft size={24} strokeWidth={1.5} />
                </Link>
              </motion.div>

              <motion.h1 variants={staggerItem} style={{ fontSize: '42px', fontWeight: 400, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Join Us
              </motion.h1>
              <motion.p variants={staggerItem} style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px' }}>
                Already have an account? <Link to="/login" style={{ color: '#111827', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>Log in</Link>
              </motion.p>

              <motion.div variants={staggerItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {[
                  { id: 'parent', label: 'I am a Parent', icon: <Users size={20} /> },
                  { id: 'student', label: 'I am a Student', icon: <BookOpen size={20} /> },
                  { id: 'tutor', label: 'I am a Tutor', icon: <GraduationCap size={20} /> },
                ].map((role) => (
                  <div 
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id as RoleOption })}
                    style={{
                      padding: '20px 24px', borderRadius: '999px', border: `2px solid ${formData.role === role.id ? '#000000' : '#e5e7eb'}`,
                      display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                      background: formData.role === role.id ? '#fafafa' : '#ffffff', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ color: formData.role === role.id ? '#000000' : '#9ca3af' }}>{role.icon}</div>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>{role.label}</span>
                    <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${formData.role === role.id ? '#000000' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {formData.role === role.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#000000' }} />}
                    </div>
                  </div>
                ))}
              </motion.div>
              
              <motion.div variants={staggerItem}>
                <button
                  onClick={() => formData.role ? setStep(2) : toast.error('Please select a role')}
                  style={{
                    width: '100%', padding: '18px', borderRadius: '999px', background: formData.role ? '#000000' : '#e5e7eb',
                    color: formData.role ? '#ffffff' : '#9ca3af', fontSize: '16px', fontWeight: 500, border: 'none', cursor: formData.role ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s'
                  }}
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              style={{ width: '100%', maxWidth: '440px', padding: '20px 0' }}
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
                <button onClick={() => setStep(1)} style={{ color: '#6b7280', display: 'inline-flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <ArrowLeft size={24} strokeWidth={1.5} />
                </button>
              </motion.div>

              <motion.h1 variants={staggerItem} style={{ fontSize: '42px', fontWeight: 400, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Create an Account
              </motion.h1>
              <motion.p variants={staggerItem} style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px' }}>
                Already have an account? <Link to="/login" style={{ color: '#111827', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>Log in</Link>
              </motion.p>

              <form onSubmit={handleSubmit}>
                <motion.div variants={staggerItem} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>First Name</label>
                    <AnimatedInput type="text" placeholder="John" required
                      value={formData.firstName} onChange={(e: any) => setFormData({...formData, firstName: e.target.value})}
                      onFocus={() => setFocusedField('fn')} onBlur={() => setFocusedField(null)}
                      style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'fn' ? '#000000' : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s', fontFamily: '"Inter", sans-serif' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Last Name</label>
                    <AnimatedInput type="text" placeholder="Doe" required
                      value={formData.lastName} onChange={(e: any) => setFormData({...formData, lastName: e.target.value})}
                      onFocus={() => setFocusedField('ln')} onBlur={() => setFocusedField(null)}
                      style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'ln' ? '#000000' : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s', fontFamily: '"Inter", sans-serif' }} />
                  </div>
                </motion.div>

                <motion.div variants={staggerItem} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Email Address</label>
                  <AnimatedInput type="email" placeholder="john@example.com" required
                    value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                    onFocus={() => setFocusedField('em')} onBlur={() => setFocusedField(null)}
                    style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'em' ? '#000000' : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s', fontFamily: '"Inter", sans-serif' }} />
                </motion.div>

                <motion.div variants={staggerItem} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Pincode</label>
                    <input type="text" placeholder="560001" required maxLength={6}
                      value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                      onFocus={() => setFocusedField('pc')} onBlur={() => setFocusedField(null)}
                      style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'pc' ? '#000000' : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Phone (Optional)</label>
                    <input type="text" placeholder="+1234567890"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      onFocus={() => setFocusedField('ph')} onBlur={() => setFocusedField(null)}
                      style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'ph' ? '#000000' : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s' }} />
                  </div>
                </motion.div>

                <motion.div variants={staggerItem} style={{ marginBottom: '24px', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Password</label>
                  <AnimatedInput type={showPassword ? 'text' : 'password'} placeholder="Password" required
                    value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})}
                    onFocus={() => setFocusedField('pw')} onBlur={() => setFocusedField(null)}
                    style={{ width: '100%', padding: '16px 54px 16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'pw' ? (isPwValid ? '#10b981' : '#000000') : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s', fontFamily: '"Inter", sans-serif' }} />
                  <div style={{ position: 'absolute', right: '16px', top: '34px' }}>
                    <AnimatedEye 
                      show={showPassword} 
                      onClick={() => setShowPassword(!showPassword)} 
                      isValid={isPwValid} 
                      passwordLength={formData.password.length}
                    />
                  </div>

                  <AnimatePresence>
                    {(formData.password.length > 0 || focusedField === 'pw') && !isPwValid && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        style={{ overflow: 'hidden', padding: '0 8px' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {pwRules.map(rule => {
                            const pass = rule.test(formData.password);
                            return (
                              <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: pass ? '#10b981' : '#9ca3af', transition: 'color 0.3s' }}>
                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: pass ? '#10b981' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                                  {pass && <Check size={10} strokeWidth={3} color="white" />}
                                </div>
                                {rule.label}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    style={{ width: '100%', padding: '18px', borderRadius: '999px', background: '#000000', color: '#ffffff', fontSize: '16px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div variants={staggerItem} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                <div onClick={() => setAgreed(!agreed)} style={{ width: '18px', height: '18px', borderRadius: '4px', background: agreed ? '#000000' : '#ffffff', border: `1px solid ${agreed ? '#000000' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {agreed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '13px', color: '#4b5563', cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
                  I agree to the <span style={{ color: '#111827', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms & Condition</span>
                </span>
              </motion.div>

              <motion.div variants={staggerItem} style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
                <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 400 }}>or</span>
                <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
              </motion.div>

              <motion.div variants={staggerItem} style={{ display: 'flex', gap: '16px' }}>
                <motion.button whileHover={{ backgroundColor: '#f9fafb' }} whileTap={{ scale: 0.98 }} style={{ flex: 1, padding: '16px', borderRadius: '999px', border: '1px solid #e5e7eb', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Continue with Google</span>
                </motion.button>
                <motion.button whileHover={{ backgroundColor: '#f9fafb' }} whileTap={{ scale: 0.98 }} style={{ flex: 1, padding: '16px', borderRadius: '999px', border: '1px solid #e5e7eb', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Continue with Facebook</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
