'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function RobotAvatar({ persona, isSpeaking, scratchpad }) {
  return (
    <motion.div
      className="robot-avatar"
      animate={{
        y: isSpeaking ? [0, -5, 0] : [0, -2, 0],
        opacity: isSpeaking ? 1 : 0.6,
      }}
      transition={{ 
        y: { duration: isSpeaking ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative'
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
          filter: isSpeaking ? `drop-shadow(0 0 20px ${persona.color})` : `drop-shadow(0 0 5px ${persona.color}44)`
        }}
        animate={{
          scale: isSpeaking ? 1.15 : 0.9
        }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        <img 
          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name.replace(/\s+/g,'')}`} 
          alt={persona.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </motion.div>

      {/* Title block */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
        <motion.span 
          style={{ 
            color: isSpeaking ? persona.color : 'var(--text-muted)', 
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.85rem'
          }}
          animate={{
              textShadow: isSpeaking ? `0 0 15px ${persona.color}` : 'none'
          }}
        >
          {persona.name}
        </motion.span>

        {/* Scratchpad Note Panel */}
        <AnimatePresence>
          {scratchpad && (
            <motion.div
               initial={{ opacity: 0, height: 0, y: -10 }}
               animate={{ opacity: 1, height: 'auto', y: 0 }}
               style={{
                 marginTop: '0.5rem',
                 padding: '0.6rem 0.8rem',
                 background: 'rgba(0,0,0,0.7)',
                 border: `1px solid ${persona.color}66`,
                 borderRadius: '12px',
                 fontSize: '0.7rem',
                 color: 'var(--text-main)',
                 width: '100%',
                 minWidth: '110px',
                 maxHeight: '100px',
                 overflowY: 'auto',
                 backdropFilter: 'blur(8px)',
                 boxShadow: `0 4px 20px rgba(0,0,0,0.6), inset 0 0 10px ${persona.color}22`,
                 zIndex: 10
               }}
            >
              <div style={{ color: persona.color, fontSize: '0.55rem', marginBottom: '2px', fontWeight: 800, letterSpacing: '0.05em' }}>TACTIC:</div>
              <div style={{ lineHeight: 1.2, fontStyle: 'italic', wordWrap: 'break-word' }}>{scratchpad}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
