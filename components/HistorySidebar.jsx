'use client';
import { motion } from 'framer-motion';

export default function HistorySidebar({ historyItems, onSelect, activeId }) {
  return (
    <div className="glass-panel" style={{ 
      width: '260px', 
      height: 'calc(100vh - 150px)', 
      overflowY: 'auto', 
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'sticky',
      top: '20px'
    }}>
      <h3 style={{ fontSize: '0.8rem', color: 'var(--primary)', letterSpacing: '0.15em', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
        Simulation History
      </h3>
      
      {historyItems.length === 0 ? (
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2rem' }}>
          No past simulations yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {historyItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onSelect(item)}
              whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
              style={{
                textAlign: 'left',
                padding: '0.75rem',
                borderRadius: '10px',
                background: activeId === item.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                border: `1px solid ${activeId === item.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: activeId === item.id ? 'var(--primary)' : 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {item.topic}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>
                {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
