import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedEyeProps {
  show: boolean;
  onClick: () => void;
  isValid: boolean;
  passwordLength: number;
}

export const AnimatedEye: React.FC<AnimatedEyeProps> = ({ show, onClick, isValid, passwordLength }) => {
  const pupilControls = useAnimation();
  const colorControls = useAnimation();
  const upperLidControls = useAnimation();
  const eyebrowControls = useAnimation();

  const OPEN_LID = "M 2 14 Q 12 4 22 14";
  const CLOSED_LID = "M 2 14 Q 12 18 22 14";
  const EYEBROW_NORMAL = "M 5 8 Q 12 4 19 8";
  const EYEBROW_RAISED = "M 5 6 Q 12 2 19 6";

  // The eye is always open unless blinking, but changes color based on 'show'
  useEffect(() => {
    if (!isValid) {
      upperLidControls.start({ 
        d: OPEN_LID, 
        transition: { type: 'spring', stiffness: 400, damping: 25 } 
      });
      // Grey when hidden, Black when showing password
      colorControls.start({ color: show ? '#111827' : '#9ca3af' });
    }
  }, [show, isValid, upperLidControls, colorControls]);

  // Handle pupil movement based on typing (left to right)
  useEffect(() => {
    if (!isValid) {
      // Calculate pupil X position based on text length (simulating reading/typing left to right)
      // 0 chars = looking left (-5), 10+ chars = looking right (+5)
      const targetX = Math.max(-5, Math.min(5, (passwordLength * 1) - 5));
      
      // Add a tiny bit of vertical jitter so it looks alive while typing
      const targetY = passwordLength > 0 ? (Math.random() * 2 - 1) : 0;
      
      pupilControls.start({ 
        x: targetX, 
        y: targetY, 
        scale: show ? 1.2 : 1, // slightly larger pupil when password is visible
        fill: show ? '#111827' : 'transparent',
        transition: { type: 'spring', stiffness: 400, damping: 20 } 
      });
      eyebrowControls.start({ d: EYEBROW_NORMAL });
      
    } else {
      // Valid! Perform the satisfying green blink
      const blink = async () => {
        // 1. Instantly turn green and raise eyebrow in surprise/success
        colorControls.start({ color: '#10b981' });
        eyebrowControls.start({ d: EYEBROW_RAISED, transition: { type: 'spring' } });
        
        // Center the pupil and make it solid green
        pupilControls.start({ 
          x: 0, y: 0, 
          scale: 1.2, 
          fill: '#10b981',
          transition: { duration: 0.2 }
        });
        
        // 2. The Blink (Close fast, open smooth)
        await upperLidControls.start({ d: CLOSED_LID, transition: { duration: 0.1 } });
        await upperLidControls.start({ d: OPEN_LID, transition: { duration: 0.2, type: 'spring' } });
      };
      
      blink();
    }
  }, [passwordLength, isValid, show, pupilControls, colorControls, upperLidControls, eyebrowControls]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4px', outline: 'none'
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={colorControls}
      initial={{ color: '#9ca3af' }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        
        {/* The Eyebrow */}
        <motion.path 
          animate={eyebrowControls} 
          initial={{ d: EYEBROW_NORMAL }} 
        />
        
        {/* The Lower Eyelid (Static) */}
        <path d="M 2 14 Q 12 20 22 14" />
        
        {/* The Upper Eyelid (Animated for blinking) */}
        <motion.path 
          animate={upperLidControls} 
          initial={{ d: OPEN_LID }} 
        />
        
        {/* The Pupil (Retina) */}
        <motion.circle 
          cx="12" cy="14" r="3" 
          animate={pupilControls}
          initial={{ scale: 1 }}
        />
      </svg>
    </motion.button>
  );
};
