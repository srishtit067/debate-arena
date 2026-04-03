// components/DebateChat.jsx
'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DebateChat({ messages, activePersona, isTyping }) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div 
      className="glass-panel"
      style={{ 
        height: '350px', 
        overflowY: 'auto', 
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        scrollBehavior: 'smooth'
      }}
      ref={containerRef}
    >
      <AnimatePresence>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              borderLeft: `4px solid ${msg.persona.color}`,
              background: 'rgba(0,0,0,0.4)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: msg.persona.color, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {msg.persona.name}
            </div>
            <div style={{ color: 'var(--text-main)', lineHeight: 1.6, fontSize: '1.05rem' }}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && activePersona && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              borderLeft: `4px solid ${activePersona.color}`,
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}
          >
             <div style={{ fontSize: '0.85rem', color: activePersona.color, fontWeight: 600, textTransform: 'uppercase' }}>
              {activePersona.name} IS ANALYZING
            </div>
            <motion.div style={{display:'flex', gap:'6px'}}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div style={{ width: 6, height: 6, background: activePersona.color, borderRadius: '50%' }} />
              <div style={{ width: 6, height: 6, background: activePersona.color, borderRadius: '50%' }} />
              <div style={{ width: 6, height: 6, background: activePersona.color, borderRadius: '50%' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
