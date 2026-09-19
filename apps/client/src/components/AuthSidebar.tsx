import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Play, MapPin, Video, CheckCircle, BarChart2, FileText, Users, Scale, Calendar } from 'lucide-react';

/* ─── Slide data ─────────────────────────────────────────── */
const slides = [
  {
    tag: 'FIND THE RIGHT TUTOR',
    h1: 'REAL PEOPLE',
    h2: 'REAL PROGRESS',
    gradient: 'linear-gradient(90deg,#6366f1,#ec4899)',
    desc: [
      'Connect with trusted tutors near you for school,',
      'college, and life skills. Learn at your pace,',
      'with the right people.'
    ],
    quote: '"A better you is a brighter tomorrow."',
    bg: 'radial-gradient(ellipse at 20% 30%,rgba(255,183,140,.35) 0%,transparent 55%),radial-gradient(ellipse at 80% 80%,rgba(200,170,255,.4) 0%,transparent 55%),#fff8f5',
  },
  {
    tag: 'LEARN WITHOUT LIMITS',
    h1: 'LEARN ANYWHERE.',
    h2: 'GROW EVERYWHERE.',
    gradient: 'linear-gradient(90deg,#2563eb,#ea580c)',
    desc: [
      'Find verified tutors near you or online.',
      'Choose your subject, set your goals, and',
      'learn at your pace.'
    ],
    quote: '"Every learner has a brighter tomorrow."',
    bg: 'radial-gradient(ellipse at 80% 20%,rgba(255,200,150,.4) 0%,transparent 55%),radial-gradient(ellipse at 20% 80%,rgba(180,150,255,.35) 0%,transparent 55%),#f8f5ff',
  },
  {
    tag: 'POST YOUR NEED',
    h1: 'TURN YOUR NEEDS',
    h2: 'INTO PROGRESS.',
    gradient: 'linear-gradient(90deg,#4f46e5,#9333ea)',
    desc: [
      'Post a requirement, receive offers from qualified',
      'tutors, compare and choose the best fit —',
      'all in one place.'
    ],
    quote: '"The right tutor today, a brighter tomorrow."',
    bg: 'radial-gradient(ellipse at 50% 0%,rgba(150,220,255,.35) 0%,transparent 60%),radial-gradient(ellipse at 50% 100%,rgba(255,190,150,.3) 0%,transparent 60%),#f5faff',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Graphic: Slide 1 — Floating Cards + Podium ─────────── */
const Graphic1 = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Podium glow ring */}
    <div style={{
      position: 'absolute', bottom: '4%', left: '50%', transform: 'translateX(-50%)',
      width: '90%', height: '40px', borderRadius: '50%',
      background: 'radial-gradient(ellipse at center,rgba(255,255,255,.9) 0%,rgba(180,160,255,.15) 70%)',
      border: '1px solid rgba(255,255,255,.6)',
      boxShadow: '0 0 30px 10px rgba(180,160,255,.2)',
    }} />
    {/* Label */}
    <div style={{
      position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
      fontSize: '9px', fontWeight: 700, letterSpacing: '3px', color: '#6b7280', whiteSpace: 'nowrap',
    }}>MORE THAN CLASSES →</div>

    {/* Left card */}
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      style={{
        position: 'absolute', left: '2%', top: '18%',
        width: '34%', height: '52%',
        background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,.9)', borderRadius: '18px',
        boxShadow: '0 12px 32px rgba(0,0,0,.08)',
        overflow: 'hidden', transform: 'rotate(-4deg)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=300&q=80"
        alt="Academic"
        style={{ width: '100%', height: '65%', objectFit: 'cover' }} />
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Academic</div>
        <div style={{ fontSize: '8px', color: '#6b7280', marginTop: '2px' }}>BUILD STRONG FOUNDATIONS</div>
      </div>
    </motion.div>

    {/* Center card (front) */}
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: .5 }}
      style={{
        position: 'absolute', left: '28%', top: '8%', zIndex: 10,
        width: '40%', height: '62%',
        background: 'linear-gradient(160deg,rgba(255,255,255,.95),rgba(255,230,200,.9))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,.95)', borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(234,88,12,.18)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <img src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=300&q=80"
        alt="Music"
        style={{ width: '100%', height: '65%', objectFit: 'cover' }} />
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Music</div>
        <div style={{ fontSize: '9px', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>DISCOVER YOUR TALENT</div>
      </div>
    </motion.div>

    {/* Right card */}
    <motion.div
      animate={{ y: [0, -7, 0] }}
      transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1 }}
      style={{
        position: 'absolute', right: '2%', top: '22%',
        width: '32%', height: '48%',
        background: 'rgba(255,255,255,.65)', backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,.9)', borderRadius: '18px',
        boxShadow: '0 12px 32px rgba(0,0,0,.08)',
        overflow: 'hidden', transform: 'rotate(4deg)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80"
        alt="Skills"
        style={{ width: '100%', height: '62%', objectFit: 'cover' }} />
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>Skills</div>
        <div style={{ fontSize: '7px', color: '#6b7280', marginTop: '2px' }}>LEARN FOR A BRIGHTER FUTURE</div>
      </div>
    </motion.div>
  </div>
);

/* ─── Graphic: Slide 2 — Map + Tutor List ─────────────────── */
const Graphic2 = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {/* Photo at top */}
    <div style={{ height: '42%', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,.1)' }}>
      <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80"
        alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>

    {/* Glass UI card */}
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      style={{
        flex: 1,
        background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,.9)', borderRadius: '20px',
        boxShadow: '0 12px 40px rgba(0,0,0,.08)',
        padding: '14px', display: 'flex', gap: '10px', overflow: 'hidden',
      }}
    >
      {/* Radar */}
      <div style={{
        flex: '0 0 42%', background: 'rgba(255,255,255,.6)', borderRadius: '14px',
        padding: '10px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ fontSize: '9px', fontWeight: 700, marginBottom: '6px', color: '#111827' }}>Find Tutors Near You</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px', background: '#fff',
          padding: '4px 8px', borderRadius: '99px', fontSize: '8px', width: 'fit-content',
          boxShadow: '0 2px 4px rgba(0,0,0,.05)',
        }}>
          <MapPin size={8} color="#3b82f6" /> Bhubaneswar
        </div>
        {/* Concentric rings */}
        <div style={{
          position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
          width: '100px', height: '100px', borderRadius: '50%',
          border: '1px dashed rgba(59,130,246,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            border: '1px solid rgba(59,130,246,.2)', background: 'rgba(59,130,246,.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 0 4px rgba(59,130,246,.25)' }} />
          </div>
          <img src="https://i.pravatar.cc/60?img=1" style={{ position: 'absolute', top: '5px', left: '10px', width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #fff' }} />
          <img src="https://i.pravatar.cc/60?img=2" style={{ position: 'absolute', bottom: '15px', right: '5px', width: '22px', height: '22px', borderRadius: '50%', border: '1.5px solid #fff' }} />
          <img src="https://i.pravatar.cc/60?img=3" style={{ position: 'absolute', top: '35px', right: '-5px', width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #fff' }} />
        </div>
      </div>

      {/* Tutor list */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px', justifyContent: 'center' }}>
        {[
          { name: 'Ananya S.', rating: '4.9', sub: 'Mathematics', price: '₹600/hr', img: 4 },
          { name: 'Rahul K.', rating: '4.8', sub: 'Guitar Lessons', price: '₹500/hr', img: 11 },
          { name: 'Meera P.', rating: '4.9', sub: 'Painting & Art', price: '₹400/hr', img: 9 },
        ].map((t, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '10px', padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,.04)',
          }}>
            <img src={`https://i.pravatar.cc/60?img=${t.img}`} style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', color: '#111827' }}>
                {t.name} <CheckCircle size={8} color="#10b981" />
              </div>
              <div style={{ fontSize: '8px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>★ {t.rating} · {t.sub}</div>
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#111827', flexShrink: 0 }}>{t.price}</div>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

/* ─── Graphic: Slide 3 — Phone + Tutor Offers ─────────────── */
const Graphic3 = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* Decorative background book */}
    <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=300&q=80"
      alt="Books"
      style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '48%', height: '38%', objectFit: 'cover',
        borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,.1)', zIndex: 1,
      }} />

    {/* Phone frame */}
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
      style={{
        width: '72%', height: '92%', zIndex: 2,
        background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(20px)',
        border: '3px solid rgba(255,255,255,.95)', borderRadius: '28px',
        boxShadow: '0 20px 50px rgba(0,0,0,.1)',
        padding: '16px 14px',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Pill handle */}
      <div style={{ width: '32px', height: '3px', background: 'rgba(0,0,0,.1)', borderRadius: '2px', margin: '0 auto 12px' }} />

      <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>Mathematics Tutor Needed</div>
      <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '10px' }}>Class 10 • CBSE • Home Tuition</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
        {[
          { icon: <MapPin size={9} />, text: 'Bhubaneswar, 751001' },
          { icon: <Calendar size={9} />, text: 'Mon, Wed, Fri • 6–7 PM' },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '9px', color: '#4b5563', background: '#f3f4f6',
            padding: '6px 8px', borderRadius: '7px',
          }}>
            {row.icon} {row.text}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '10px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Tutor Offers (3)</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'hidden' }}>
        {[
          { name: 'Rahul Sharma', rating: '4.9', price: '₹3,500', match: true, img: 11 },
          { name: 'Priya Verma', rating: '4.8', price: '₹3,200', match: false, img: 5 },
          { name: 'Amit Patel', rating: '4.7', price: '₹4,000', match: false, img: 8 },
        ].map((t, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '10px', padding: '9px 10px',
            border: t.match ? '1px solid #10b981' : '1px solid #f3f4f6',
            boxShadow: '0 2px 8px rgba(0,0,0,.03)',
            position: 'relative', flexShrink: 0,
          }}>
            {t.match && (
              <div style={{
                position: 'absolute', top: '-7px', right: '10px',
                background: '#10b981', color: '#fff',
                fontSize: '7px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px',
              }}>Best Match</div>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '7px' }}>
              <img src={`https://i.pravatar.cc/60?img=${t.img}`} style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', color: '#111827' }}>
                  {t.name} <CheckCircle size={8} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '8px', color: '#6b7280' }}>★ {t.rating} · {t.price}/month</div>
              </div>
            </div>
            <button style={{
              width: '100%', padding: '5px',
              background: t.match ? '#111827' : '#f3f4f6',
              color: t.match ? '#fff' : '#374151',
              border: 'none', borderRadius: '6px',
              fontSize: '9px', fontWeight: 600, cursor: 'pointer',
            }}>View Profile</button>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

const Graphics = [<Graphic1 />, <Graphic2 />, <Graphic3 />];

/* ─── Main Sidebar ─────────────────────────────────────────── */
export const AuthSidebar: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % 3), 6000);
    return () => clearInterval(t);
  }, []);

  useGSAP(() => {
    const lines = gsap.utils.toArray('.gsap-line');
    if (!lines.length) return;
    
    gsap.fromTo(lines,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out', overwrite: true }
    );
  }, { dependencies: [current], scope: textRef });

  const slide = slides[current];

  const benefitsSlide1 = (
    <div style={{ marginTop: '20px' }}>
      <button style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(234,88,12,.4)', flexShrink: 0,
        }}>
          <Play fill="white" size={13} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Watch how it works</span>
      </button>

      <div style={{ display: 'flex', gap: '20px', marginTop: '28px', flexWrap: 'wrap' }}>
        {[
          { v: '10K+', l: 'Active Tutors' },
          { v: '25K+', l: 'Students Helped' },
          { v: '50+', l: 'Subjects & Skills' },
          { v: '4.8★', l: 'Average Rating' },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              {s.v.replace(/[+★]/, '')}<span style={{ color: '#ea580c' }}>{s.v.match(/[+★]/)?.[0] ?? ''}</span>
            </div>
            <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '3px' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const benefitsSlide2 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
      {[
        { icon: <MapPin size={16} color="#ec4899" />, title: 'Nearby Tutors', desc: 'Find qualified tutors around you' },
        { icon: <Video size={16} color="#3b82f6" />, title: 'Online or In-Person', desc: 'Learn the way you prefer' },
        { icon: <Users size={16} color="#ef4444" />, title: 'Verified & Trusted', desc: 'Real reviews from real students' },
        { icon: <BarChart2 size={16} color="#10b981" />, title: 'For Every Skill', desc: 'School, college, music, art & more' },
      ].map((item, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 + i * 0.08 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(255,255,255,.55)', padding: '10px 14px',
            borderRadius: '12px', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.7)',
          }}
        >
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {item.icon}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{item.title}</div>
            <div style={{ fontSize: '10px', color: '#4b5563' }}>{item.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const benefitsSlide3 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
      {[
        { icon: <FileText size={15} color="#3b82f6" />, title: '1. Post Your Requirement', desc: 'Tell us your subject, schedule, location and budget.' },
        { icon: <Users size={15} color="#10b981" />, title: '2. Receive Tutor Offers', desc: 'Qualified tutors near you send their proposals.' },
        { icon: <Scale size={15} color="#ec4899" />, title: '3. Compare & Choose', desc: 'Review profiles, ratings, prices and availability.' },
        { icon: <Calendar size={15} color="#ea580c" />, title: '4. Book & Start Learning', desc: 'Confirm your tutor and begin your journey.' },
      ].map((item, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 + i * 0.08 }}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            background: 'rgba(255,255,255,.6)', padding: '9px 12px',
            borderRadius: '12px', backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ padding: '6px', background: 'rgba(255,255,255,.85)', borderRadius: '8px', flexShrink: 0 }}>
            {item.icon}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>{item.title}</div>
            <div style={{ fontSize: '9px', color: '#4b5563', lineHeight: 1.4, marginTop: '2px' }}>{item.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const leftContent = [benefitsSlide1, benefitsSlide2, benefitsSlide3];

  return (
    <div style={{
      width: '100%', height: '100%',
      borderRadius: '28px', overflow: 'hidden',
      background: slide.bg,
      transition: 'background 1s ease',
      fontFamily: '"Inter", sans-serif',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 16px 40px rgba(0,0,0,.06)',
    }}>
      {/* ── TOP BAR ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 28px 0' }}>
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M24 8C15.16 8 8 15.16 8 24s7.16 16 16 16 16-7.16 16-16S32.84 8 24 8zm0 28c-6.63 0-12-5.37-12-12s5.37-12 12-12 12 5.37 12 12-5.37 12-12 12z" fill="#ea580c"/>
              <path d="M24 16c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#ea580c"/>
            </svg>
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-.4px', color: '#111827' }}>TutorConnect</span>
          </div>
          <div style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '1.8px', color: '#9ca3af', marginTop: '4px' }}>
            LEARN • GROW • TOGETHER
          </div>
        </div>

        {/* Top-right branding text on slides 2 & 3 */}
        <AnimatePresence mode="wait">
          {current > 0 && (
            <motion.div key={`tr-${current}`}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ textAlign: 'right', fontSize: '8px', fontWeight: 600, letterSpacing: '1.4px', color: '#4b5563', lineHeight: 1.8 }}
            >
              BETTER<br/>LEARNING<br/>BRIGHTER<br/>TOMORROWS
              <div style={{ width: '16px', height: '2px', background: '#ea580c', marginTop: '6px', marginLeft: 'auto' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BODY (LEFT TEXT + RIGHT GRAPHIC) ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: '20px 28px 0', gap: '12px', overflow: 'hidden' }}>

        {/* Left: Typography + slide-specific content */}
        <div style={{ flex: '0 0 46%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={textRef}>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ overflow: 'hidden', marginBottom: '12px' }}>
              <div className="gsap-line" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2px', color: '#4b5563' }}>
                {slide.tag}
              </div>
            </div>
            
            <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1px', margin: 0 }}>
              <div style={{ overflow: 'hidden' }}>
                <span className="gsap-line" style={{ color: '#1f2937', display: 'block' }}>{slide.h1}</span>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span className="gsap-line" style={{ display: 'block', backgroundImage: slide.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {slide.h2}
                </span>
              </div>
            </h1>
            
            <div style={{ marginTop: '12px', marginBottom: '4px' }}>
              {slide.desc.map((line, i) => (
                <div key={i} style={{ overflow: 'hidden' }}>
                  <p className="gsap-line" style={{ fontSize: '12px', lineHeight: 1.6, color: '#4b5563', margin: 0 }}>
                    {line}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={{ overflow: 'hidden' }}>
              <div className="gsap-line">
                {leftContent[current]}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Graphic area */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={`g-${current}`}
              initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .92 }}
              transition={{ duration: .5, ease }}
              style={{ position: 'absolute', inset: 0 }}
            >
              {Graphics[current]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── BOTTOM BAR ───────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 28px 20px' }}>
        {/* Quote */}
        <AnimatePresence mode="wait">
          <motion.div key={`q-${current}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: '160px' }}
          >
            <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#4b5563', lineHeight: 1.5, fontFamily: 'Georgia, serif' }}>
              {slide.quote}
            </div>
            <div style={{ width: '32px', height: '1px', background: '#9ca3af', marginTop: '8px' }} />
          </motion.div>
        </AnimatePresence>

        {/* Nav strip */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ fontSize: '7.5px', fontWeight: 600, letterSpacing: '1.5px', color: '#9ca3af' }}>
            LOCAL • TRUSTED • FLEXIBLE • FOR EVERY LEARNER
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#111827' }}>
              0{current + 1} <span style={{ color: '#9ca3af', margin: '0 2px' }}>/</span> 03
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[0, 1, 2].map(i => (
                <button key={i} onClick={() => setCurrent(i)} style={{
                  width: current === i ? '18px' : '8px', height: '4px',
                  borderRadius: '2px', background: current === i ? '#ea580c' : '#d1d5db',
                  border: 'none', padding: 0, cursor: 'pointer', transition: 'all .3s',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
