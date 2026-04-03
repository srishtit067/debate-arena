'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudienceTicker({ reactions }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      background: 'rgba(0,0,0,0.4)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '6px 0',
      position: 'relative',
    }}>
      <span style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
        background: 'linear-gradient(90deg, rgba(10,10,15,0.95), transparent)',
        display: 'flex', alignItems: 'center', paddingLeft: '10px',
        fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        CROWD
      </span>
      <motion.div
        style={{ display: 'flex', gap: '3rem', paddingLeft: '90px', whiteSpace: 'nowrap' }}
        animate={{ x: [0, -reactions.length * 300] }}
        transition={{ duration: reactions.length * 6, ease: 'linear', repeat: Infinity }}
      >
        {[...reactions, ...reactions].map((r, i) => (
          <span key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
            💬 {r}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
