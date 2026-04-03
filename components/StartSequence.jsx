'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StartSequence({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => setPhase(3), 4500);
    const t4 = setTimeout(() => onComplete(), 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const messages = [
    "ESTABLISHING NEURAL LINK...",
    "SYNCING PERSONA MATRICES...",
    "ARENA LOCKED.",
    "COMMENCING DEBATE"
  ];

  return (
    <motion.div 
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <AnimatePresence mode="wait">
        <motion.div
           key={phase}
           initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
           animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
           exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
           transition={{ duration: 0.5, type: 'spring' }}
        >
          <h2 
            className={phase === 3 ? "cyber-glitch" : "cyber-text"} 
            data-text={messages[phase]}
          >
            {messages[phase]}
          </h2>
        </motion.div>
      </AnimatePresence>
      
      {/* Decorative scanning line */}
      <motion.div 
        style={{
           width: '100%',
           height: '2px',
           background: 'var(--primary)',
           position: 'absolute',
           boxShadow: '0 0 20px var(--primary)'
        }}
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}
