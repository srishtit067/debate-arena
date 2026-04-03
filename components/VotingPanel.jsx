'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VotingPanel({ personas, onVote, userVote }) {
  const [tallies] = useState(() => {
    const t = {};
    personas.forEach(p => { t[p.id] = Math.floor(Math.random() * 40) + 20; });
    return t;
  });

  const total = Object.values(tallies).reduce((a, b) => a + b, 0) + (userVote ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: 'rgba(0,0,0,0.7)',
        border: '1px solid rgba(0,240,255,0.3)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(16px)',
        marginBottom: '1rem',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>AUDIENCE VOTE</div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
          {userVote ? 'You voted! Judge AI is deliberating...' : 'Who won the debate? Vote before the judge reveals!'}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {personas.map(p => {
          const count = tallies[p.id] + (userVote === p.id ? 1 : 0);
          const pct = Math.round((count / total) * 100);
          return (
            <div key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <button
                  onClick={() => !userVote && onVote(p.id)}
                  disabled={!!userVote}
                  style={{
                    background: userVote === p.id ? `${p.color}33` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${userVote === p.id ? p.color : 'rgba(255,255,255,0.1)'}`,
                    color: userVote === p.id ? p.color : 'rgba(255,255,255,0.7)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: userVote === p.id ? 700 : 400,
                    cursor: userVote ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {userVote === p.id ? '✓ ' : ''}{p.name}
                </button>
                {userVote && <span style={{ fontSize: '0.7rem', color: p.color, fontWeight: 700 }}>{pct}%</span>}
              </div>
              {userVote && (
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${p.color}88, ${p.color})`, borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
