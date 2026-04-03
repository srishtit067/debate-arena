'use client';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = { STRONG: '#00ff88', WEAK: '#ffb700', FALLACY: '#ff4444' };
const ICONS = { STRONG: '✓', WEAK: '⚠', FALLACY: '✗' };

export default function FactCheckBadge({ verdict, note, searchSnippet, source }) {
  if (!verdict) return null;
  const color = COLORS[verdict] || '#aaa';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      title={searchSnippet ? `🔎 ${searchSnippet}\nSource: ${source}` : note}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        background: `${color}15`,
        border: `1px solid ${color}44`,
        color,
        cursor: 'help',
        marginLeft: '8px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        boxShadow: `0 0 10px ${color}11`
      }}
    >
      <span style={{ fontSize: '0.8rem' }}>{ICONS[verdict]}</span>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: '0.55rem', opacity: 0.8, marginBottom: '1px' }}>VERDICT</span>
        <span>{verdict}</span>
      </div>
      {source && (
        <div style={{ borderLeft: `1px solid ${color}33`, paddingLeft: '6px', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: '0.55rem', opacity: 0.8, marginBottom: '1px' }}>SOURCE</span>
          <span style={{ fontSize: '0.6rem', color: '#fff', opacity: 0.7 }}>{source.toUpperCase()}</span>
        </div>
      )}
    </motion.div>
  );
}
