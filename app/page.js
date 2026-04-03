'use client';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import RobotAvatar from '@/components/RobotAvatar';
import DebateChat from '@/components/DebateChat';
import ControlPanel from '@/components/ControlPanel';
import LiveWallpaper from '@/components/LiveWallpaper';
import StartSequence from '@/components/StartSequence';
import PDFGenerator from '@/components/PDFGenerator';
import { personas } from '@/lib/mockDebate';

const MAX_TURNS = 20;

export default function Home() {
  const [topic, setTopic] = useState('Should humanity prioritize space exploration or ocean conservation?');
  const [topicLocked, setTopicLocked] = useState(false);
  
  // Debate State
  // status: 'idle', 'playing', 'paused', 'finished'
  const [status, setStatus] = useState('idle');
  const [history, setHistory] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const statusRef = useRef(status);
  const audioRef = useRef(null);
  
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const activePersona = personas[turnIndex % personas.length];

  const handleNextTurn = async () => {
    if (isTyping) return;
    setIsTyping(true);
    
    // Add empty message placeholder for current persona
    setHistory(prev => [...prev, { persona: activePersona, text: '', rawText: '', scratchpad: '' }]);
    
    try {
      const res = await fetch('/api/debate-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          history,
          activePersona,
        }),
      });

      if (!res.ok) throw new Error('API Error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value, { stream: true });
        
        // Update the last message in history with the streaming chunk
        setHistory(prev => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          
          let currentFullText = (newHistory[lastIndex].rawText || "") + textChunk;
          
          let displayTxt = currentFullText;
          let note = newHistory[lastIndex].scratchpad || "";
          
          const noteMatch = currentFullText.match(/\[(.*?)\]/s);
          if (noteMatch && currentFullText.indexOf('[') < 30 && currentFullText.indexOf(']') < 400) {
             let rawNote = noteMatch[1].trim();
             if (rawNote.toUpperCase().startsWith('NOTE:')) rawNote = rawNote.substring(5).trim();
             note = rawNote;
             
             // Strip everything up to the closing bracket from the display text
             const splitIndex = currentFullText.indexOf(']') + 1;
             displayTxt = currentFullText.substring(splitIndex).trim();
          }

          newHistory[lastIndex] = {
             ...newHistory[lastIndex],
             rawText: currentFullText,
             text: displayTxt,
             scratchpad: note
          };
          return newHistory;
        });
      }
    } catch (e) {
       console.error(e);
       setHistory(prev => {
          const newHistory = [...prev];
          const lastIdx = newHistory.length - 1;
          newHistory[lastIdx] = {
              ...newHistory[lastIdx],
              text: newHistory[lastIdx].text + " [ERROR: Connection lost to AI Core. Check API Key or limit.]"
          };
          return newHistory;
       });
    }

    setIsTyping(false);
    setTurnIndex(prev => prev + 1);
  };

  const handleJudgeTurn = async () => {
    if (isTyping) return;
    setIsTyping(true);

    const judgePersona = { id: 'judge', name: 'THE JUDGE AI', color: '#ffb700' };
    setHistory(prev => [...prev, { persona: judgePersona, text: '', rawText: '', scratchpad: '' }]);

    try {
      const res = await fetch('/api/debate-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history }),
      });

      if (!res.ok) throw new Error('API Error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value, { stream: true });
        
        setHistory(prev => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          newHistory[lastIndex] = {
             ...newHistory[lastIndex],
             text: newHistory[lastIndex].text + textChunk
          };
          return newHistory;
        });
      }
    } catch (e) {
       console.error(e);
       setHistory(prev => {
          const newHistory = [...prev];
          const lastIdx = newHistory.length - 1;
          newHistory[lastIdx] = { ...newHistory[lastIdx], text: newHistory[lastIdx].text + " [ERROR: Judge disconnected]" };
          return newHistory;
       });
    }

    setIsTyping(false);
    setStatus('finished');
  };

  useEffect(() => {
    let timeout;
    if (status === 'playing' && !isTyping) {
      if (turnIndex >= MAX_TURNS) {
         setStatus('judging');
      } else {
         timeout = setTimeout(() => {
           if (statusRef.current === 'playing') {
             handleNextTurn();
           }
         }, 4500);
      }
    } else if (status === 'judging' && !isTyping) {
      // Let the judge pause for dramatic effect
      timeout = setTimeout(() => {
         handleJudgeTurn();
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [status, isTyping, turnIndex]);

  const togglePlay = () => {
    if (status === 'idle' && !topicLocked) {
      setTopicLocked(true);
      if (audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(e => console.log("Audio error:", e));
      }
    }
    setStatus(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const manuallyNext = () => {
    if (!topicLocked) setTopicLocked(true);
    setStatus('paused');
    handleNextTurn();
  };

  return (
    <>
      <LiveWallpaper />
      <AnimatePresence>
        {status === 'initializing' && (
           <StartSequence onComplete={() => setStatus('playing')} />
        )}
      </AnimatePresence>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <audio ref={audioRef} loop src="/bg-music.mp3" preload="auto" />

        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>ARENA.AI</h1>
      
      {!topicLocked ? (
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', fontWeight: 500 }}>Enter Debate Directive</h2>
          <input 
            type="text" 
            className="input-field" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)}
            disabled={topicLocked}
            style={{ maxWidth: '600px', marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem' }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '750px', margin: '0 auto 1.5rem auto' }}>
            {[
              "Should humanity merge with AI or remain biological?",
              "Is colonizing Mars a moral imperative or an arrogant mistake?",
              "Should highly advanced AI be granted human rights?",
              "Will mind-uploading create true immortality or a hollow digital clone?",
              "Should memory-altering technology be legalized for therapy?",
              "Will mandatory Universal Basic Income save us or destroy ambition?"
            ].map((t, idx) => (
               <button 
                 key={idx} 
                 onClick={() => setTopic(t)}
                 style={{ 
                   background: 'rgba(255,255,255,0.05)', 
                   border: '1px solid rgba(255,255,255,0.1)', 
                   color: 'var(--text-muted)', 
                   padding: '0.4rem 0.8rem', 
                   borderRadius: '20px', 
                   fontSize: '0.8rem',
                   cursor: 'pointer',
                   transition: 'all 0.2s',
                 }}
                 onMouseOver={(e) => { e.target.style.background = 'rgba(0, 240, 255, 0.1)'; e.target.style.color = 'var(--primary)'; e.target.style.borderColor = 'var(--primary)'; }}
                 onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
               >
                 {t}
               </button>
            ))}
          </div>

          <div>
            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => { 
                setTopicLocked(true); 
                setStatus('initializing'); 
                if (audioRef.current) {
                  audioRef.current.volume = 0.4;
                  audioRef.current.play().catch(e => console.log("Audio error:", e));
                }
              }}>
              LAUNCH ARENA
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(0,240,255,0.05)', border: '1px solid var(--primary)', textAlign: 'center' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Directive</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>"{topic}"</p>
        </div>
      )}

      {/* Arena Layout */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', opacity: topicLocked ? 1 : 0.5, pointerEvents: topicLocked ? 'auto' : 'none', transition: 'all 0.5s' }}>
        
        {/* Left Side: Avatar Colosseum */}
        <div className="glass-panel" style={{ flex: '1', minWidth: '320px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '2rem', padding: '2rem', position: 'relative', placeItems: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%)', zIndex: 0 }} />
          {personas.map((p, i) => {
             const lastMsg = [...history].reverse().find(h => h.persona.id === p.id);
             return (
               <div key={p.id} style={{ zIndex: 1 }}>
                 <RobotAvatar 
                   persona={p} 
                   isSpeaking={isTyping && activePersona.id === p.id} 
                   scratchpad={lastMsg?.scratchpad}
                 />
               </div>
             );
          })}
        </div>

        {/* Right Side: Chat & Controls */}
        <div style={{ flex: '1.5', minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
          <DebateChat 
            messages={history} 
            activePersona={activePersona} 
            isTyping={isTyping} 
          />
          <ControlPanel 
            status={status}
            onPlayPause={togglePlay}
            onNext={manuallyNext}
            isTyping={isTyping}
          />
          {status === 'finished' && <PDFGenerator topic={topic} history={history} />}
        </div>
      </div>
    </div>
    </>
  );
}
