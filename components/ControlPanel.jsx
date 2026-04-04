'use client';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

export default function ControlPanel({ status, onPlayPause, onNext, isTyping, onReset, onEndDebate }) {
  const isPlaying = status === 'playing';
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={onPlayPause}
          style={{ minWidth: '140px' }}
        >
          {isPlaying ? <><Pause size={18} /> PAUSE</> : <><Play size={18} /> {status === 'idle' ? 'START' : 'RESUME'}</>}
        </button>

        <button
          className="btn"
          onClick={onNext}
          disabled={isTyping || isPlaying || status === 'finished'}
          style={{ minWidth: '140px' }}
        >
          <SkipForward size={18} /> NEXT TURN
        </button>

        <button
          className="btn"
          onClick={onReset}
          style={{ minWidth: '150px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <RotateCcw size={18} /> NEW SIMULATION
        </button>
      </div>

      {status === 'debating' && (
        <button 
          className="btn" 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            background: 'rgba(255, 68, 68, 0.1)', 
            border: '1px solid rgba(255, 68, 68, 0.3)', 
            color: '#ff4444',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.1em'
          }} 
          onClick={onEndDebate}
        >
          TERMINATE SIMULATION ⚡
        </button>
      )}
    </div>
  );
}
