'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NeuralHUD() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1000,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {/* HUD Scanlines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
        backgroundSize: '100% 3px, 5px 100%',
        opacity: 0.2,
        mixBlendMode: 'overlay'
      }} />

      {/* Floating Corner Brackets */}
      <CornerBracket pos="top-left" />
      <CornerBracket pos="top-right" />
      <CornerBracket pos="bottom-left" />
      <CornerBracket pos="bottom-right" />

      {/* Dynamic Data Stream (Left) */}
      <DataStream side="left" />
      <DataStream side="right" />

      {/* Neural Core Label */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.6rem',
          color: 'var(--primary)',
          letterSpacing: '0.5em',
          fontWeight: 900,
          textShadow: '0 0 10px var(--primary)',
          opacity: 0.6
        }}
      >
        // STATUS: NEURAL_REASONING_ACTIVE
      </motion.div>
    </div>
  );
}

function CornerBracket({ pos }) {
  const isTop = pos.includes('top');
  const isLeft = pos.includes('left');
  
  return (
    <motion.div
      animate={{ opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: '40px',
        [isLeft ? 'left' : 'right']: '40px',
        width: '30px',
        height: '30px',
        borderTop: isTop ? '2px solid var(--primary)' : 'none',
        borderBottom: !isTop ? '2px solid var(--primary)' : 'none',
        borderLeft: isLeft ? '2px solid var(--primary)' : 'none',
        borderRight: !isLeft ? '2px solid var(--primary)' : 'none',
        opacity: 0.3
      }}
    />
  );
}

function DataStream({ side }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        [side]: '40px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '0.45rem',
        color: 'var(--primary)',
        fontFamily: 'monospace',
        width: '60px',
        opacity: 0.2,
        textAlign: side,
        lineHeight: 1.8
      }}
    >
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], x: side === 'left' ? [0, 5, 0] : [0, -5, 0] }}
          transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
        >
          {Math.random().toString(36).substring(7).toUpperCase()}
        </motion.div>
      ))}
    </motion.div>
  );
}
