import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../components/ProtectedRoute';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AnimatedInput } from '../components/AnimatedInput';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions.');
      return;
    }
    try {
      await login(formData.email, formData.password);
      const user = useAuthStore.getState().user;
      toast.success('Welcome back!');
      navigate(getDashboardPath(user?.role || 'parent'));
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Login failed.');
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      padding: '16px',
      gap: '16px',
    }}>
      
      {/* ═══ LEFT SIDE — IMAGE ═══ */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '50%',
          height: 'calc(100vh - 32px)',
          position: 'sticky',
          top: '16px',
          borderRadius: '40px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
        className="hidden lg:flex"
      >
        <img 
          src="https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&w=1200&q=80" 
          alt="VR Neon" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        {/* Subtle overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, rgba(0,0,0,0.2) 100%)' }} />
        
        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 10, marginTop: '40px' }}>
          {/* Abstract geometric logo mimicking the UI design */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 8C15.1634 8 8 15.1634 8 24C8 32.8366 15.1634 40 24 40C32.8366 40 40 32.8366 40 24C40 15.1634 32.8366 8 24 8ZM24 36C17.3726 36 12 30.6274 12 24C12 17.3726 17.3726 12 24 12C30.6274 12 36 17.3726 36 24C36 30.6274 30.6274 36 24 36Z" fill="white"/>
            <path d="M24 16C19.5817 16 16 19.5817 16 24C16 28.4183 19.5817 32 24 32C28.4183 32 32 28.4183 32 24C32 19.5817 28.4183 16 24 16ZM24 28C21.7909 28 20 26.2091 20 24C20 21.7909 21.7909 20 24 20C26.2091 20 28 21.7909 28 24C28 26.2091 26.2091 28 24 28Z" fill="white"/>
            <path d="M30 18L18 30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 18L30 30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </motion.div>

      {/* ═══ RIGHT SIDE — FORM ═══ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <motion.div 
          style={{ width: '100%', maxWidth: '440px', padding: '20px 0' }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
          }}
        >
          {/* Back button */}
          <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
            <Link to="/" style={{ color: '#6b7280', display: 'inline-flex' }}>
              <ArrowLeft size={24} strokeWidth={1.5} />
            </Link>
          </motion.div>

          <motion.h1 variants={staggerItem} style={{ fontSize: '42px', fontWeight: 400, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Log in
          </motion.h1>
          
          <motion.p variants={staggerItem} style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px' }}>
            Don't have an account? <Link to="/register" style={{ color: '#111827', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>Create an Account</Link>
          </motion.p>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <motion.div variants={staggerItem} style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <AnimatedInput 
                type="email" 
                placeholder="john52martinez@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  fontSize: '15px',
                  borderRadius: '999px',
                  border: `1px solid ${focusedField === 'email' ? '#000000' : '#e5e7eb'}`,
                  outline: 'none',
                  color: '#111827',
                  background: 'transparent',
                  transition: 'border-color 0.2s',
                  fontFamily: '"Inter", sans-serif'
                }}
              />
            </motion.div>

            {/* Password Field */}
            <motion.div variants={staggerItem} style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Password</label>
              <AnimatedInput 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                style={{
                  width: '100%',
                  padding: '16px 54px 16px 24px',
                  fontSize: '15px',
                  borderRadius: '999px',
                  border: `1px solid ${focusedField === 'password' ? '#000000' : '#e5e7eb'}`,
                  outline: 'none',
                  color: '#111827',
                  background: 'transparent',
                  transition: 'border-color 0.2s',
                  fontFamily: '"Inter", sans-serif'
                }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '20px', top: '40px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
              </button>
            </motion.div>

            {/* Forgot Password */}
            <motion.div variants={staggerItem} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: '#111827', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                Forgot Password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={staggerItem}>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '999px',
                  background: '#000000',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Log in'}
              </motion.button>
            </motion.div>
          </form>

          {/* Terms Checkbox */}
          <motion.div variants={staggerItem} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
            <div 
              onClick={() => setAgreed(!agreed)}
              style={{
                width: '18px', height: '18px', borderRadius: '4px', background: agreed ? '#000000' : '#ffffff',
                border: `1px solid ${agreed ? '#000000' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {agreed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span style={{ fontSize: '13px', color: '#4b5563', cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
              I agree to the <span style={{ color: '#111827', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms & Condition</span>
            </span>
          </motion.div>

          {/* Divider */}
          <motion.div variants={staggerItem} style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 400 }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
          </motion.div>

          {/* Social Buttons */}
          <motion.div variants={staggerItem} style={{ display: 'flex', gap: '16px' }}>
            <motion.button 
              whileHover={{ backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                flex: 1, padding: '16px', borderRadius: '999px', border: '1px solid #e5e7eb', background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' 
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Continue with Google</span>
            </motion.button>

            <motion.button 
              whileHover={{ backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                flex: 1, padding: '16px', borderRadius: '999px', border: '1px solid #e5e7eb', background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' 
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Continue with Facebook</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
