'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrendingDebates({ onTopicSelect }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadStep, setLoadStep] = useState(0);

  const loadMessages = [
    "Scanning global trends...",
    "Analyzing conversations...",
    "Generating debate topics..."
  ];

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    if (loading && loadStep < loadMessages.length - 1) {
      const timer = setTimeout(() => setLoadStep(s => s + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [loading, loadStep]);

  const fetchTrending = async () => {
    try {
      const res = await fetch('/api/trending');
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      console.error('Failed to fetch trending', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: '600px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.6rem', 
        marginBottom: '1rem',
        color: 'var(--primary)',
        fontSize: '0.85rem',
        fontWeight: 700,
        letterSpacing: '0.1em'
      }}>
        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>⚡</motion.span>
        TRENDING_DEBATE_MODULE.V12.0
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              padding: '2rem', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '12px',
              border: '1px dashed rgba(0,240,255,0.2)',
              textAlign: 'center',
              color: 'var(--primary)',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {loadMessages[loadStep] || "Processing..."}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="topics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}
          >
            {topics.map((topic, i) => (
              <motion.button
                key={i}
                onClick={() => onTopicSelect(topic)}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,240,255,0.08)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '1rem 1.2rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(0,240,255,0.15)',
                  borderRadius: '10px',
                  color: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border 0.3s ease'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 500, paddingRight: '40px' }}>
                  {topic}
                </div>
                
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(0,240,255,0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ fontSize: '0.8rem' }}>🔥</span> TRENDING
                </motion.div>

                {/* Spectral Background Pulse */}
                <motion.div 
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.05), transparent)',
                    pointerEvents: 'none'
                  }}
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
