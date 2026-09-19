import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerStyle?: React.CSSProperties;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({ value, type = 'text', placeholder, style, containerStyle, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const valStr = String(value || '');

  return (
    <div style={{ position: 'relative', width: '100%', ...containerStyle }}>
      {/* 1. The Real Input */}
      <input
        {...props}
        type={type === 'password' ? 'password' : 'text'}
        value={value}
        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
        style={{
          ...style,
          color: 'transparent',     // Hide real text
          caretColor: '#111827',    // Keep cursor visible
          position: 'relative',
          zIndex: 2,                // Clickable
          background: 'transparent',
        }}
      />

      {/* 2. The Animated Overlay */}
      <div 
        style={{
          position: 'absolute',
          left: style?.paddingLeft || '24px',
          right: style?.paddingRight || '24px',
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontFamily: style?.fontFamily || 'inherit',
          fontSize: style?.fontSize,
        }}
      >
        {/* Placeholder */}
        {!valStr && <span style={{ color: '#9ca3af', position: 'absolute' }}>{placeholder}</span>}
        
        {/* Animated Characters */}
        <div style={{ display: 'flex' }}>
          <AnimatePresence>
            {valStr.split('').map((char, i) => (
              <motion.span
                key={`${i}-${char}`}
                initial={{ opacity: 0, y: 10, scale: 0.5, rotateX: 90, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  mass: 0.5 
                }}
                style={{ 
                  display: 'inline-block', 
                  color: '#111827',
                  // Slightly adjust password bullet size to match native look
                  fontSize: type === 'password' ? '1.2em' : 'inherit',
                  transformOrigin: 'bottom center'
                }}
              >
                {type === 'password' ? '•' : (char === ' ' ? '\u00A0' : char)}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
