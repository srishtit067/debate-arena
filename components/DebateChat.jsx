'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FactCheckBadge from './FactCheckBadge';

export default function DebateChat({ messages, activePersona, isTyping, factChecks = {}, roundMarkers = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Build a merged list of messages + round markers
  const mergedItems = [];
  messages.forEach((msg, idx) => {
    const marker = roundMarkers.find(m => m.afterIndex === idx - 1);
    if (marker) {
      mergedItems.push({ type: 'marker', ...marker, key: `marker-${idx}` });
    }
    mergedItems.push({ type: 'message', msg, idx, key: `msg-${idx}` });
  });

  return (
    <div 
      className="glass-panel"
      style={{ 
        height: '420px', 
        overflowY: 'auto', 
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        scrollBehavior: 'smooth'
      }}
      ref={containerRef}
    >
      <AnimatePresence>
        {mergedItems.map((item) => {
          if (item.type === 'marker') {
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}
              >
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  — {item.label} —
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </motion.div>
            );
          }

          const { msg, idx } = item;
          const factCheck = factChecks[idx];
          const isJudge = msg.persona?.id === 'judge';

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                borderLeft: `4px solid ${msg.persona?.color || '#fff'}`,
                background: isJudge ? 'rgba(255,183,0,0.06)' : 'rgba(0,0,0,0.35)',
                boxShadow: isJudge ? '0 0 20px rgba(255,183,0,0.1)' : '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: msg.persona?.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isJudge ? '⚖️ ' : ''}{msg.persona?.name}
                </span>
                {factCheck && !isJudge && msg.text && (
                  <FactCheckBadge verdict={factCheck.verdict} note={factCheck.note} />
                )}
              </div>
              <div style={{ color: 'var(--text-main)', lineHeight: 1.6, fontSize: '1rem' }}>
                {msg.text}
              </div>
            </motion.div>
          );
        })}

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
            <div style={{ fontSize: '0.8rem', color: activePersona.color, fontWeight: 600, textTransform: 'uppercase' }}>
              {activePersona.name} IS ANALYZING
            </div>
            <motion.div style={{ display: 'flex', gap: '6px' }}
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
