'use client';
import { motion } from 'framer-motion';

export default function ConfidenceBar({ persona, confidence }) {
  const color = confidence > 70 ? '#00ff88' : confidence > 40 ? '#ffb700' : '#ff4444';
  
  return (
    <div style={{ width: '100%', marginTop: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Confidence</span>
        <span style={{ fontSize: '0.5rem', color, fontWeight: 700 }}>{Math.round(confidence)}%</span>
      </div>
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: '4px', background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 8px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
