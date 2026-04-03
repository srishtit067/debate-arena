'use client';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

export default function ControlPanel({ status, onPlayPause, onNext, isTyping, onReset }) {
  const isPlaying = status === 'playing';
  return (
    <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem', marginTop: '1rem' }}>
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
  );
}
