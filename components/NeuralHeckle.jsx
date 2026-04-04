'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mic, MicOff } from 'lucide-react';

export default function NeuralHeckle({ onHeckle, disabled, countdown, onSkip, isYourTurn, onTypingChange }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const newText = finalTranscript || interimTranscript;
        if (newText) {
          setText(prev => {
            const updated = (prev.trim() + ' ' + newText).trim();
            if (onTypingChange) onTypingChange(updated.length > 0);
            return updated;
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }
  }, [onTypingChange]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRecording) recognitionRef.current.stop();
    if (!text.trim() || disabled) return;
    onHeckle(text.trim());
    setText('');
    if (onTypingChange) onTypingChange(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (onTypingChange) onTypingChange(val.length > 0);
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-field"
              placeholder={isYourTurn ? "STATE YOUR ARGUMENT TO THE MACHINES..." : (disabled ? "WAITING FOR NEURAL SLOT..." : "TYPE CHALLENGE OR COMMAND...")}
              value={text}
              onChange={handleInputChange}
              onFocus={() => { if (text.length > 0 && onTypingChange) onTypingChange(true); }}
              onBlur={() => { if (onTypingChange) onTypingChange(false); }}
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

        {(isYourTurn || status === 'playing') && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <button
              type="button"
              onClick={toggleRecording}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '20px',
                background: isRecording ? '#ff4444' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isRecording ? '#ff4444' : 'rgba(255,255,255,0.1)'}`,
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: isRecording ? '0 0 15px rgba(255, 68, 68, 0.4)' : 'none'
              }}
            >
              {isRecording ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Mic size={14} />
                  </motion.div>
                  RECORDING... (SPEAK NOW)
                </>
              ) : (
                <>
                  <Mic size={14} color="var(--primary)" />
                  SPEAK YOUR ARGUMENT 🎤
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
