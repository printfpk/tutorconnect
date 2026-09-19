import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedInput } from '../components/AnimatedInput';
import { Eye, EyeOff, ArrowLeft, Loader2, Check } from 'lucide-react';
import { AnimatedEye } from '../components/AnimatedEye';
import { AuthSidebar } from '../components/AuthSidebar';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    code1: '', code2: '', code3: '', code4: '',
    newPassword: '',
    confirmPassword: ''
  });

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const pwRules = [
    { id: 'len', label: '8+ characters', test: (pw: string) => pw.length >= 8 },
    { id: 'up', label: 'Uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
    { id: 'low', label: 'Lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
    { id: 'num', label: 'Number', test: (pw: string) => /[0-9]/.test(pw) },
    { id: 'sp', label: 'Special character', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
  ];
  const passedRules = pwRules.filter(r => r.test(formData.newPassword));
  const pwStrength = passedRules.length / pwRules.length;
  const isPwValid = pwStrength === 1;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      toast.success('Verification code sent to your email!');
    }, 1000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = `${formData.code1}${formData.code2}${formData.code3}${formData.code4}`;
    if (code.length < 4) {
      toast.error('Please enter the 4-digit code');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      toast.success('Code verified successfully!');
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    }, 1000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 1);
    setFormData(prev => ({ ...prev, [`code${index}`]: value }));
    
    // Auto-advance
    if (value && index < 4) {
      const nextInput = document.getElementById(`code${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !formData[`code${index}` as keyof typeof formData] && index > 1) {
      const prevInput = document.getElementById(`code${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', backgroundColor: '#ffffff',
      fontFamily: '"Inter", sans-serif', padding: '16px', gap: '16px'
    }}>
      
      {/* ═══ LEFT SIDE — IMAGES/BRANDING ═══ */}
      <div 
        className="hidden lg:block"
        style={{
          width: '50%', height: 'calc(100vh - 32px)', position: 'sticky', top: '16px'
        }}
      >
        <AuthSidebar />
      </div>

      {/* ═══ RIGHT SIDE — FORM ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <AnimatePresence mode="wait">
          
          {/* STEP 1: FORGOT PASSWORD */}
          {step === 1 && (
            <motion.div 
              key="step1" style={{ width: '100%', maxWidth: '440px', padding: '20px 0' }}
              initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            >
              <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
                <Link to="/login" style={{ color: '#6b7280', display: 'inline-flex' }}><ArrowLeft size={24} strokeWidth={1.5} /></Link>
              </motion.div>
              <motion.h1 variants={staggerItem} style={{ fontSize: '42px', fontWeight: 400, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Forgot Password
              </motion.h1>
              <motion.p variants={staggerItem} style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px' }}>
                We'll send a verification code to your email address
              </motion.p>
              <form onSubmit={handleSendCode}>
                <motion.div variants={staggerItem} style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Email Address</label>
                  <AnimatedInput 
                    type="email" placeholder="john52martinez@gmail.com" required
                    value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    style={{ width: '100%', padding: '16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'email' ? '#000000' : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s', fontFamily: '"Inter", sans-serif' }}
                  />
                </motion.div>
                <motion.div variants={staggerItem}>
                  <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    style={{ width: '100%', padding: '18px', borderRadius: '999px', background: '#000000', color: '#ffffff', fontSize: '16px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Verification Code'}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: VERIFICATION CODE */}
          {step === 2 && (
            <motion.div 
              key="step2" style={{ width: '100%', maxWidth: '440px', padding: '20px 0' }}
              initial={{ opacity: 0, x: 20 }} animate="visible" exit={{ opacity: 0, x: -20 }}
              variants={{ visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
                <button onClick={() => setStep(1)} style={{ color: '#6b7280', display: 'inline-flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ArrowLeft size={24} strokeWidth={1.5} /></button>
              </motion.div>
              <motion.h1 variants={staggerItem} style={{ fontSize: '42px', fontWeight: 400, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Verification Code
              </motion.h1>
              <motion.p variants={staggerItem} style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px' }}>
                We sent you verification code on <span style={{ fontWeight: 600, color: '#111827' }}>{formData.email}</span>
              </motion.p>
              <form onSubmit={handleVerifyCode}>
                <motion.div variants={staggerItem} style={{ display: 'flex', gap: '16px', marginBottom: '16px', justifyContent: 'flex-start' }}>
                  {[1, 2, 3, 4].map((index) => (
                    <AnimatedInput 
                      key={index} id={`code${index}`} type="text" inputMode="numeric" maxLength={1} required
                      value={formData[`code${index}` as keyof typeof formData]} 
                      onChange={(e: any) => handleCodeChange(e, index)}
                      onKeyDown={(e: any) => handleCodeKeyDown(e, index)}
                      onFocus={() => setFocusedField(`code${index}`)} onBlur={() => setFocusedField(null)}
                      style={{ 
                        width: '80px', height: '56px', textAlign: 'center', fontSize: '24px', fontWeight: 500, borderRadius: '999px',
                        border: `1px solid ${focusedField === `code${index}` ? '#000000' : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s', fontFamily: '"Inter", sans-serif'
                      }}
                    />
                  ))}
                </motion.div>
                <motion.div variants={staggerItem} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Resend Code in: <span style={{ fontWeight: 600, color: '#111827' }}>00:24</span></span>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    style={{ width: '100%', padding: '18px', borderRadius: '999px', background: '#000000', color: '#ffffff', fontSize: '16px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <motion.div 
              key="step3" style={{ width: '100%', maxWidth: '440px', padding: '20px 0' }}
              initial={{ opacity: 0, x: 20 }} animate="visible"
              variants={{ visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
                <button onClick={() => setStep(2)} style={{ color: '#6b7280', display: 'inline-flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ArrowLeft size={24} strokeWidth={1.5} /></button>
              </motion.div>
              <motion.h1 variants={staggerItem} style={{ fontSize: '42px', fontWeight: 400, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Reset Password
              </motion.h1>
              <motion.p variants={staggerItem} style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px' }}>
                Your new password must be different from your previous passwords.
              </motion.p>
              <form onSubmit={handleResetPassword}>
                <motion.div variants={staggerItem} style={{ marginBottom: '24px', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>New Password</label>
                  <AnimatedInput 
                    type={showPassword ? 'text' : 'password'} placeholder="New Password" required
                    value={formData.newPassword} onChange={(e: any) => setFormData({...formData, newPassword: e.target.value})}
                    onFocus={() => setFocusedField('np')} onBlur={() => setFocusedField(null)}
                    style={{ width: '100%', padding: '16px 54px 16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'np' ? (isPwValid ? '#10b981' : '#000000') : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s', fontFamily: '"Inter", sans-serif' }}
                  />
                  <div style={{ position: 'absolute', right: '16px', top: '34px' }}>
                    <AnimatedEye 
                      show={showPassword} 
                      onClick={() => setShowPassword(!showPassword)} 
                      isValid={isPwValid}
                      passwordLength={formData.newPassword.length}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {(formData.newPassword.length > 0 || focusedField === 'np') && !isPwValid && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        style={{ overflow: 'hidden', padding: '0 8px' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {pwRules.map(rule => {
                            const pass = rule.test(formData.newPassword);
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
                
                <motion.div variants={staggerItem} style={{ marginBottom: '32px', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Confirm Password</label>
                  <AnimatedInput 
                    type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" required
                    value={formData.confirmPassword} onChange={(e: any) => setFormData({...formData, confirmPassword: e.target.value})}
                    onFocus={() => setFocusedField('cp')} onBlur={() => setFocusedField(null)}
                    style={{ width: '100%', padding: '16px 54px 16px 24px', fontSize: '15px', borderRadius: '999px', border: `1px solid ${focusedField === 'cp' ? '#000000' : '#e5e7eb'}`, outline: 'none', color: '#111827', background: 'transparent', transition: 'border-color 0.2s', fontFamily: '"Inter", sans-serif' }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '20px', top: '40px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    {showConfirmPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                  </button>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    style={{ width: '100%', padding: '18px', borderRadius: '999px', background: '#000000', color: '#ffffff', fontSize: '16px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
