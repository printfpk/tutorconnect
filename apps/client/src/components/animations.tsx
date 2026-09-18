import { motion, type Variants } from 'framer-motion';
import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import gsap from 'gsap';

/* ════════════════════════════════════════════
   TEXT REVEAL — Characters slide up with stagger
   ════════════════════════════════════════════ */

interface TextRevealProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  /** 'char' splits by character, 'word' by word */
  splitBy?: 'char' | 'word';
  /** Duration per unit in seconds */
  duration?: number;
  /** Stagger between units */
  stagger?: number;
}

const charVariants: Variants = {
  hidden: { y: '110%', opacity: 0, rotateX: -80 },
  visible: (i: number) => ({
    y: '0%',
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.03,
    },
  }),
};

const wordVariants: Variants = {
  hidden: { y: 40, opacity: 0, filter: 'blur(8px)' },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.08,
    },
  }),
};

export function TextReveal({
  text,
  className = '',
  style,
  delay = 0,
  splitBy = 'word',
  duration,
  stagger,
}: TextRevealProps) {
  const units = splitBy === 'char' ? text.split('') : text.split(' ');
  const variants = splitBy === 'char' ? charVariants : wordVariants;

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      style={{ ...style, perspective: '600px' }}
      initial="hidden"
      animate="visible"
    >
      {units.map((unit, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            custom={i + delay * 10}
            variants={{
              ...variants,
              visible: (idx: number) => ({
                ...(variants.visible as any)(idx),
                transition: {
                  ...(variants.visible as any)(idx).transition,
                  duration: duration ?? (variants.visible as any)(idx).transition.duration,
                  delay: (stagger ?? (variants.visible as any)(idx).transition.delay / (idx || 1)) * idx + delay,
                },
              }),
            }}
          >
            {unit}
            {splitBy === 'word' && i < units.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}


/* ════════════════════════════════════════════
   MAGNETIC BUTTON — Follows cursor on hover
   ════════════════════════════════════════════ */

interface MagneticProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  strength?: number;
}

export function Magnetic({ children, className = '', style, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    gsap.to(ref.current, { x, y, duration: 0.4, ease: 'power3.out' });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-block', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}


/* ════════════════════════════════════════════
   REVEAL — Scroll/viewport entry animation
   ════════════════════════════════════════════ */

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  once?: boolean;
  scale?: number;
  blur?: number;
}

export function Reveal({
  children,
  className = '',
  style,
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.7,
  once = true,
  scale,
  blur = 0,
}: RevealProps) {
  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      className={className}
      style={style}
      initial={{
        opacity: 0,
        ...directionMap[direction],
        scale: scale ?? 1,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: blur ? 'blur(0px)' : undefined,
      }}
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}


/* ════════════════════════════════════════════
   STAGGER CONTAINER — Children animate in sequence
   ════════════════════════════════════════════ */

interface StaggerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  delay?: number;
}

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0,
    },
  },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function Stagger({ children, className = '', style, stagger = 0.08, delay = 0 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.div className={className} style={style} variants={staggerChild}>
      {children}
    </motion.div>
  );
}


/* ════════════════════════════════════════════
   SMOOTH COUNTER — Counts up smoothly
   ════════════════════════════════════════════ */

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function SmoothCounter({ from = 0, to, duration = 2, delay = 0, suffix = '', prefix = '', className = '' }: CounterProps) {
  const [value, setValue] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obj = { val: from };
    const tween = gsap.to(obj, {
      val: to,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => setValue(Math.round(obj.val)),
    });
    return () => { tween.kill(); };
  }, [from, to, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}


/* ════════════════════════════════════════════
   GRADIENT BLOB — Animated morphing background
   ════════════════════════════════════════════ */

interface BlobProps {
  className?: string;
  color1?: string;
  color2?: string;
  size?: number;
  speed?: number;
}

export function GradientBlob({
  className = '',
  color1 = 'rgba(99, 102, 241, 0.3)',
  color2 = 'rgba(139, 92, 246, 0.15)',
  size = 500,
  speed = 8,
}: BlobProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    
    // Organic morphing with GSAP
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(el, {
      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
      duration: speed * 0.4,
      ease: 'sine.inOut',
    })
    .to(el, {
      borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
      duration: speed * 0.35,
      ease: 'sine.inOut',
    })
    .to(el, {
      borderRadius: '50% 50% 30% 70% / 60% 40% 60% 40%',
      duration: speed * 0.25,
      ease: 'sine.inOut',
    });

    // Subtle floating
    gsap.to(el, {
      y: -20,
      x: 10,
      duration: speed * 0.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    return () => { tl.kill(); gsap.killTweensOf(el); };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color1}, ${color2}, transparent 70%)`,
        filter: 'blur(60px)',
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      }}
    />
  );
}


/* ════════════════════════════════════════════
   CURSOR GLOW — Follows mouse with smooth trail
   ════════════════════════════════════════════ */

export function CursorGlow({ color = 'rgba(99, 102, 241, 0.08)', size = 400 }: { color?: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      gsap.to(el, {
        x: e.clientX - size / 2,
        y: e.clientY - size / 2,
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [size]);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 pointer-events-none z-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(20px)',
      }}
    />
  );
}
