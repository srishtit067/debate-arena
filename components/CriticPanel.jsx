'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function CriticPanel({ roundNumber, roundTheme, criticResult, personas }) {
  if (!criticResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,183,0,0.3)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.6rem', color: '#ffb700', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', borderLeft: '3px solid #ffb700', paddingLeft: '8px' }}>
          ROUND {roundNumber} CRITIQUE — {roundTheme?.toUpperCase()}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {personas.map(p => {
          const score = criticResult.scores?.[p.id];
          if (!score) return null;
          return (
            <div key={p.id} style={{
              flex: '1', minWidth: '110px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${p.color}44`,
              borderRadius: '8px',
              padding: '0.5rem 0.6rem',
            }}>
              <div style={{ fontSize: '0.6rem', color: p.color, fontWeight: 700, marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: score.score > 70 ? '#00ff88' : score.score > 40 ? '#ffb700' : '#ff4444' }}>{score.score}<span style={{ fontSize: '0.6rem', opacity: 0.6 }}>/100</span></div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', marginTop: '3px', lineHeight: 1.3 }}>{score.feedback}</div>
              {score.fallacy && (
                <div style={{ marginTop: '4px', fontSize: '0.55rem', color: '#ff4444', background: '#ff444422', padding: '2px 6px', borderRadius: '8px', display: 'inline-block' }}>⚠ {score.fallacy}</div>
              )}
            </div>
          );
        })}
      </div>
      {criticResult.mvp && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: '#ffb700', textAlign: 'right' }}>
          🏆 MVP this round: <strong>{personas.find(p => p.id === criticResult.mvp)?.name || criticResult.mvp}</strong>
        </div>
      )}
    </motion.div>
  );
}
