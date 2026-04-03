'use client';
import { motion, AnimatePresence } from 'framer-motion';
import ConfidenceBar from './ConfidenceBar';

const MOOD_GLOWS = {
  calm:      (color) => `drop-shadow(0 0 5px ${color}44)`,
  confident: (color) => `drop-shadow(0 0 22px ${color})`,
  heated:    ()      => `drop-shadow(0 0 18px #ff4444)`,
  conceding: ()      => `drop-shadow(0 0 8px #aa44ff)`,
};

export default function RobotAvatar({ persona, isSpeaking, scratchpad, confidence = 75, mood = 'calm' }) {
  const glowFn = MOOD_GLOWS[mood] || MOOD_GLOWS.calm;
  const filter = isSpeaking ? `drop-shadow(0 0 20px ${persona.color})` : glowFn(persona.color);

  return (
    <motion.div
      className="robot-avatar"
      animate={{
        y: isSpeaking ? [0, -5, 0] : [0, -2, 0],
        opacity: isSpeaking ? 1 : 0.75,
      }}
      transition={{ 
        y: { duration: isSpeaking ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Avatar Display Layer */}
      <motion.div
        style={{
          width: '100px',
          height: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          filter,
        }}
        animate={{ scale: isSpeaking ? 1.15 : 0.9 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        <img 
          src={persona.id === 'user' 
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=HumanObserver&backgroundColor=00f0ff`
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name.replace(/\s+/g,'')}`} 
          alt={persona.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 2 }}
        />
        {/* Neural Processing Pulse */}
        {isSpeaking && (
          <motion.div
            style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${persona.color}44 0%, transparent 70%)`,
              zIndex: 1,
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>

      {/* Title block */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <motion.span 
            style={{ 
              color: isSpeaking ? persona.color : 'var(--text-muted)', 
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              cursor: 'help'
            }}
            animate={{ textShadow: isSpeaking ? `0 0 15px ${persona.color}` : 'none' }}
          >
            {persona.name}
          </motion.span>
          
          {/* Neural Profile Tooltip */}
          <div className="tooltip" style={{ 
            position: 'absolute', bottom: '150%', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.95)', border: `1px solid ${persona.color}`,
            padding: '10px', borderRadius: '8px', fontSize: '0.65rem', width: '200px',
            zIndex: 100, opacity: 0, pointerEvents: 'none', transition: 'all 0.3s',
            boxShadow: `0 0 20px ${persona.color}44`, backdropFilter: 'blur(10px)'
          }}>
            <div style={{ color: persona.color, fontWeight: 800, marginBottom: '4px', fontSize: '0.55rem' }}>NEURAL_PROFILE_DIRECTIVE:</div>
            <div style={{ color: '#fff', lineHeight: 1.4 }}>{persona.prompt}</div>
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid ${persona.color}` }} />
          </div>
          <style jsx>{`
            div:hover > .tooltip { opacity: 1; bottom: 160%; }
          `}</style>
        </div>

        {/* Confidence Bar */}
        <div style={{ width: '110px' }}>
          <ConfidenceBar persona={persona} confidence={confidence} />
        </div>

        {/* Mood indicator */}
        {mood !== 'calm' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: '0.5rem',
              padding: '1px 6px',
              borderRadius: '8px',
              background: mood === 'heated' ? '#ff444433' : mood === 'confident' ? '#ffb70033' : '#aa44ff33',
              color: mood === 'heated' ? '#ff4444' : mood === 'confident' ? '#ffb700' : '#aa44ff',
              border: `1px solid ${mood === 'heated' ? '#ff444466' : mood === 'confident' ? '#ffb70066' : '#aa44ff66'}`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
            }}
          >
            {mood === 'heated' ? '🔥 Heated' : mood === 'confident' ? '⚡ Confident' : '🤝 Conceding'}
          </motion.div>
        )}

        {/* Scratchpad Note Panel */}
        <AnimatePresence>
          {scratchpad && (
            <motion.div
               initial={{ opacity: 0, height: 0, y: -10 }}
               animate={{ opacity: 1, height: 'auto', y: 0 }}
               style={{
                 marginTop: '0.25rem',
                 padding: '0.5rem 0.6rem',
                 background: 'rgba(0,0,0,0.7)',
                 border: `1px solid ${persona.color}66`,
                 borderRadius: '12px',
                 fontSize: '0.65rem',
                 color: 'var(--text-main)',
                 width: '110px',
                 maxHeight: '80px',
                 overflowY: 'auto',
                 backdropFilter: 'blur(8px)',
                 boxShadow: `0 4px 20px rgba(0,0,0,0.6), inset 0 0 10px ${persona.color}22`,
                 zIndex: 10
               }}
            >
              <div style={{ color: persona.color, fontSize: '0.5rem', marginBottom: '2px', fontWeight: 800, letterSpacing: '0.05em' }}>TACTIC:</div>
              <div style={{ lineHeight: 1.2, fontStyle: 'italic', wordWrap: 'break-word' }}>{scratchpad}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
