'use client';
import { Play, Pause, SkipForward } from 'lucide-react';

export default function ControlPanel({ status, onPlayPause, onNext, isTyping }) {
  const isPlaying = status === 'playing';
  return (
    <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem', marginTop: '1rem' }}>
      <button
        className="btn btn-primary"
        onClick={onPlayPause}
      >
        {isPlaying ? <><Pause size={18} /> PAUSE</> : <><Play size={18} /> {status === 'idle' ? 'START DEBATE' : 'RESUME'}</>}
      </button>

      <button
        className="btn"
        onClick={onNext}
        disabled={isTyping || isPlaying}
      >
        <SkipForward size={18} /> NEXT TURN
      </button>
    </div>
  );
}
