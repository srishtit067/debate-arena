'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function NeuralHeckle({ onHeckle, disabled, countdown, onSkip, isYourTurn }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onHeckle(text.trim());
    setText('');
  };

  return (
    <div style={{ 
      marginTop: '1rem', 
      padding: isYourTurn ? '1rem' : '0',
      background: isYourTurn ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
      borderRadius: '20px',
      border: isYourTurn ? '1px solid var(--primary)' : 'none',
      boxShadow: isYourTurn ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
      transition: 'all 0.5s'
    }}>
      <AnimatePresence>
        {(countdown > 0 || isYourTurn) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ 
              marginBottom: '0.8rem', 
              textAlign: 'center',
              padding: '8px',
              background: isYourTurn ? 'var(--primary)' : 'rgba(0, 240, 255, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 240, 255, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
              <span style={{ fontSize: '0.7rem', color: isYourTurn ? '#000' : 'var(--primary)', fontWeight: 900, letterSpacing: '0.15em' }}>
                {isYourTurn ? "🚨 NEURAL CORE ACTIVATED: YOUR TURN" : `NEURAL INTERCEPTION WINDOW: ${countdown}s`}
              </span>
              {!isYourTurn && (
                <button 
                  type="button"
                  onClick={onSkip}
                  style={{ fontSize: '0.6rem', background: 'transparent', border: 'none', color: '#fff', opacity: 0.5, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  PROCEED NOW
                </button>
              )}
            </div>
            {!isYourTurn && (
              <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '4px', borderRadius: '1px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="input-field"
            placeholder={isYourTurn ? "STATE YOUR ARGUMENT TO THE MACHINES..." : (disabled ? "WAITING FOR NEURAL SLOT..." : "TYPE CHALLENGE OR COMMAND...")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            autoFocus={isYourTurn}
            style={{
              width: '100%',
              fontSize: '0.85rem',
              padding: '0.75rem 1rem',
              border: isYourTurn ? '1px solid var(--primary)' : '1px solid rgba(0, 240, 255, 0.2)',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '20px',
              boxShadow: isYourTurn ? 'inset 0 0 10px rgba(0, 240, 255, 0.2)' : 'none'
            }}
          />
          <AnimatePresence>
            {(isYourTurn || (!disabled && text.trim())) && (
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
            padding: '0 1.5rem',
            fontSize: '0.8rem',
            fontWeight: 900,
            letterSpacing: '0.05em',
            minWidth: '120px',
            boxShadow: isYourTurn ? '0 0 20px var(--primary)' : 'none'
          }}
        >
          {isYourTurn ? "TRANSMIT" : "INTERJECT"}
        </button>
      </form>
    </div>
  );
}
