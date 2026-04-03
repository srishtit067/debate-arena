'use client';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = { STRONG: '#00ff88', WEAK: '#ffb700', FALLACY: '#ff4444' };
const ICONS = { STRONG: '✓', WEAK: '⚠', FALLACY: '✗' };

export default function FactCheckBadge({ verdict, note }) {
  if (!verdict) return null;
  const color = COLORS[verdict] || '#aaa';
  
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      title={note}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        background: `${color}22`,
        border: `1px solid ${color}66`,
        color,
        cursor: 'help',
        marginLeft: '8px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {ICONS[verdict]} {verdict}
    </motion.span>
  );
}
