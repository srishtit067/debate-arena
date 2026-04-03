'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function NeuralHeckle({ onHeckle, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onHeckle(text.trim());
    setText('');
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="input-field"
            placeholder={disabled ? "WAITING FOR NEURAL SLOT..." : "INTERJECT / CHALLENGE THE BOT..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              fontSize: '0.85rem',
              padding: '0.75rem 1rem',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '20px',
            }}
          />
          <AnimatePresence>
            {!disabled && text.trim() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}
              >
                <Zap size={14} color="var(--primary)" fill="var(--primary)" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="btn btn-primary"
          style={{
            borderRadius: '20px',
            padding: '0 1.25rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            minWidth: '100px'
          }}
        >
          CHALLENGE
        </button>
      </form>
      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '6px', textAlign: 'center', letterSpacing: '0.05em' }}>
        NEURAL INTERJECTION: THE NEXT BOT WILL BE FORCED TO ADAPT TO YOUR INPUT.
      </div>
    </div>
  );
}
