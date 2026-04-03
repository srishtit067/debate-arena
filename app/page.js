'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RobotAvatar from '@/components/RobotAvatar';
import DebateChat from '@/components/DebateChat';
import ControlPanel from '@/components/ControlPanel';
import LiveWallpaper from '@/components/LiveWallpaper';
import StartSequence from '@/components/StartSequence';
import PDFGenerator from '@/components/PDFGenerator';
import CriticPanel from '@/components/CriticPanel';
import VotingPanel from '@/components/VotingPanel';
import AudienceTicker from '@/components/AudienceTicker';
import HistorySidebar from '@/components/HistorySidebar';
import NeuralHeckle from '@/components/NeuralHeckle';
import { personas, humanPersona } from '@/lib/mockDebate';

const TOTAL_ROUNDS = 5;
const MAX_TURNS_BASE = personas.length * TOTAL_ROUNDS;

export default function Home() {
  const [topic, setTopic] = useState('Should humanity prioritize space exploration or ocean conservation?');
  const [topicLocked, setTopicLocked] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | initializing | playing | paused | voting | judging | finished
  const [participationMode, setParticipationMode] = useState('watch'); // watch | interact
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [history, setHistory] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Multi-agent state
  const [confidences, setConfidences] = useState(() => {
    const init = {};
    personas.forEach(p => { init[p.id] = 75; });
    return init;
  });
  const [moods, setMoods] = useState(() => {
    const init = {};
    personas.forEach(p => { init[p.id] = 'calm'; });
    return init;
  });
  const [plannerData, setPlannerData] = useState(null);
  const [factChecks, setFactChecks] = useState({});
  const [audienceReactions, setAudienceReactions] = useState([]);
  const [criticResults, setCriticResults] = useState({}); // keyed by roundNumber
  const [roundScoreHistory, setRoundScoreHistory] = useState([]);
  const [roundMarkers, setRoundMarkers] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [roundSpeakingOrder, setRoundSpeakingOrder] = useState([]);
  const [activeHeckle, setActiveHeckle] = useState(null);
  const [heckleCountdown, setHeckleCountdown] = useState(0);
  
  // History State
  const [historyItems, setHistoryItems] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  const statusRef = useRef(status);
  const historyRef = useRef(history);
  const audioRef = useRef(null);
  const isTypingRef = useRef(isTyping);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { isTypingRef.current = isTyping; }, [isTyping]);

  const activePersonas = participationMode === 'interact' ? [...personas, humanPersona] : personas;
  const turnsPerRound = activePersonas.length;
  const maxTurns = turnsPerRound * TOTAL_ROUNDS;

  const currentRound = Math.floor(turnIndex / turnsPerRound) + 1;
  const isRoundEnd = turnIndex > 0 && turnIndex % turnsPerRound === 0;

  // Determine active persona based on dynamic round order
  const getActivePersona = () => {
    if (status === 'judging') return { id: 'judge', name: 'THE JUDGE AI', color: '#ffb700' };
    const roundTurnIndex = turnIndex % turnsPerRound;
    if (roundSpeakingOrder && roundSpeakingOrder.length === turnsPerRound) {
      const pId = roundSpeakingOrder[roundTurnIndex];
      return activePersonas.find(p => p.id === pId) || activePersonas[roundTurnIndex];
    }
    return activePersonas[roundTurnIndex];
  };

  const activePersona = getActivePersona();

  // ─── Planner Agent ───────────────────────────────────────────
  const callPlanner = useCallback(async (roundNum, roundScores) => {
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          roundNumber: roundNum, 
          roundScores,
          participationMode,
          activePersonas
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlannerData(data);
        if (data.speakingOrder) setRoundSpeakingOrder(data.speakingOrder);
        return data;
      }
    } catch (e) { console.error('Planner error:', e); }
    return null;
  }, [topic, roundScoreHistory]);

  // ─── Fact Check (parallel, non-blocking) ─────────────────────
  const callFactCheck = useCallback(async (argument, personaName, msgIndex) => {
    try {
      const res = await fetch('/api/factcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argument, personaName }),
      });
      if (res.ok) {
        const data = await res.json();
        setFactChecks(prev => ({ ...prev, [msgIndex]: data }));
      }
    } catch (e) { console.error('FactCheck error:', e); }
  }, []);

  // ─── Audience Agent (parallel, non-blocking) ─────────────────
  const callAudience = useCallback(async (argument, personaName) => {
    try {
      const res = await fetch('/api/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argument, personaName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reaction) setAudienceReactions(prev => [...prev.slice(-9), data.reaction]);
      }
    } catch (e) { console.error('Audience error:', e); }
  }, []);

  // ─── Critic Agent (called at end of each round) ───────────────
  const callCritic = useCallback(async (roundArgs, roundNum, roundTheme) => {
    try {
      const res = await fetch('/api/critic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundArguments: roundArgs, roundTheme }),
      });
      if (res.ok) {
        const data = await res.json();
        setCriticResults(prev => ({ ...prev, [roundNum]: { ...data, roundTheme } }));

        // Update confidences and moods based on scores
        setConfidences(prev => {
          const next = { ...prev };
          if (data.scores) {
            Object.entries(data.scores).forEach(([agentId, score]) => {
              const delta = (score.score - 70) * 0.3; // smooth drift
              next[agentId] = Math.max(10, Math.min(100, prev[agentId] + delta));
            });
          }
          return next;
        });
        setMoods(prev => {
          const next = { ...prev };
          if (data.scores) {
            Object.entries(data.scores).forEach(([agentId, score]) => {
              const conf = confidences[agentId] || 75;
              if (score.fallacy) next[agentId] = 'conceding';
              else if (score.score >= 80) next[agentId] = 'confident';
              else if (conf < 45) next[agentId] = 'heated';
              else next[agentId] = 'calm';
            });
          }
          return next;
        });

        setRoundScoreHistory(prev => [...prev, data]);
        return data;
      }
    } catch (e) { console.error('Critic error:', e); }
    return null;
  }, [confidences]);

  // ─── Main Debate Turn ─────────────────────────────────────────
  const handleNextTurn = useCallback(async () => {
    if (isTypingRef.current) return;
    setIsTyping(true);

    const currentHistory = historyRef.current;
    
    // Dynamic persona retrieval
    const persona = getActivePersona();
    
    // HUMAN TURN HANDLING
    if (persona.id === 'user') {
      setStatus('waiting-for-user');
      setIsTyping(false);
      return;
    }

    const conf = confidences[persona.id] || 75;
    const mood = moods[persona.id] || 'calm';
    const msgIndex = currentHistory.length;

    setHistory(prev => [...prev, { persona, text: '', rawText: '', scratchpad: '' }]);

    try {
      const res = await fetch('/api/debate-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          history: currentHistory,
          activePersona: persona,
          plannerAngle: plannerData?.instruction || '',
          roundTheme: plannerData?.roundTheme || '',
          confidence: conf,
          mood,
          userHeckle: activeHeckle,
        }),
      });

      if (activeHeckle) setActiveHeckle(null); // Clear after sending

      if (!res.ok) throw new Error('API Error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value, { stream: true });
        fullText += textChunk;

        setHistory(prev => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          let currentFull = (newHistory[lastIndex].rawText || '') + textChunk;
          let displayTxt = currentFull;
          let note = newHistory[lastIndex].scratchpad || '';

          const noteMatch = currentFull.match(/\[(.*?)\]/s);
          if (noteMatch && currentFull.indexOf('[') < 30 && currentFull.indexOf(']') < 400) {
            let rawNote = noteMatch[1].trim();
            if (rawNote.toUpperCase().startsWith('NOTE:')) rawNote = rawNote.substring(5).trim();
            note = rawNote;
            const splitIndex = currentFull.indexOf(']') + 1;
            displayTxt = currentFull.substring(splitIndex).trim();
          }

          newHistory[lastIndex] = { ...newHistory[lastIndex], rawText: currentFull, text: displayTxt, scratchpad: note };
          return newHistory;
        });
      }

      // Fire parallel non-blocking agents after turn completes
      const spokenText = fullText.replace(/\[.*?\]/s, '').trim();
      if (spokenText) {
        callFactCheck(spokenText, persona.name, msgIndex);
        callAudience(spokenText, persona.name);
      }

    } catch (e) {
      console.error(e);
      setHistory(prev => {
        const newHistory = [...prev];
        const lastIdx = newHistory.length - 1;
        newHistory[lastIdx] = { ...newHistory[lastIdx], text: newHistory[lastIdx].text + ' [ERROR: AI Core disconnected]' };
        return newHistory;
      });
    }

    setIsTyping(false);
    setTurnIndex(prev => prev + 1);
  }, [turnIndex, confidences, moods, plannerData, topic, callFactCheck, callAudience, activePersonas, turnsPerRound]);

  const handleUserSubmit = (text) => {
    if (status !== 'waiting-for-user') return;
    const persona = humanPersona;
    const msgIndex = history.length;
    
    setHistory(prev => [...prev, { 
      persona, 
      text, 
      rawText: text, 
      scratchpad: 'The human interjects with original perspective.' 
    }]);

    callFactCheck(text, persona.name, msgIndex);
    callAudience(text, persona.name);
    
    setStatus('playing');
    setTurnIndex(prev => prev + 1);
  };

  // ─── Judge Turn ───────────────────────────────────────────────
  const handleJudgeTurn = useCallback(async () => {
    if (isTypingRef.current) return;
    setIsTyping(true);

    const judgePersona = { id: 'judge', name: 'THE JUDGE AI', color: '#ffb700' };
    const currentHistory = historyRef.current;

    // Build score summary for judge
    const scoreSummary = Object.entries(criticResults)
      .map(([round, result]) => {
        const scores = Object.entries(result.scores || {})
          .map(([id, s]) => `${personas.find(p=>p.id===id)?.name||id}: ${s.score}/100`)
          .join(', ');
        return `Round ${round}: ${scores}`;
      }).join('\n');

    const voteInfo = userVote 
      ? `The audience voted for: ${personas.find(p => p.id === userVote)?.name || userVote}.`
      : '';

    setHistory(prev => [...prev, { persona: judgePersona, text: '', rawText: '', scratchpad: '' }]);

    try {
      const res = await fetch('/api/debate-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history: currentHistory, scoreSummary, voteInfo }),
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
          newHistory[lastIndex] = { ...newHistory[lastIndex], text: newHistory[lastIndex].text + textChunk };
          return newHistory;
        });
      }
    } catch (e) {
      console.error(e);
      setHistory(prev => {
        const nh = [...prev];
        nh[nh.length - 1] = { ...nh[nh.length - 1], text: nh[nh.length - 1].text + ' [ERROR: Judge disconnected]' };
        return nh;
      });
    }

    setIsTyping(false);
    setStatus('finished');
    
    // Auto-save to history
    saveToHistory({
      topic,
      history: [...currentHistory, { persona: judgePersona, text: '', rawText: '', scratchpad: '' }],
      userVote,
      confidences,
      roundMarkers,
      participationMode,
      activePersonas
    });
  }, [criticResults, userVote, topic, confidences, roundMarkers]);

  // ─── History Management ─────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    }
  }, []);

  const saveToHistory = async (data) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchHistory();
    } catch (e) {
      console.error('Error saving to history:', e);
    }
  };

  const loadHistoryItem = (item) => {
    setActiveHistoryId(item.id);
    setTopic(item.topic);
    setHistory(item.history || []);
    setStatus(item.status || 'finished');
    setTurnIndex((item.history?.length || 0));
    setCriticResults(item.criticResults || {});
    setConfidences(item.confidences || { optimist: 75, skeptic: 75, comedy: 75, analyst: 75 });
    setRoundMarkers(item.roundMarkers || []);
    setTopicLocked(true);
    setUserVote(item.userVote);
    if (item.participationMode) setParticipationMode(item.participationMode);
  };

  const resetSimulation = () => {
    setStatus('idle');
    setTopicLocked(false);
    setHistory([]);
    setTurnIndex(0);
    setIsTyping(false);
    setConfidences({ optimist: 75, skeptic: 75, comedy: 75, analyst: 75 });
    setMoods({ optimist: 'calm', skeptic: 'calm', comedy: 'calm', analyst: 'calm' });
    setPlannerData(null);
    setFactChecks({});
    setAudienceReactions([]);
    setCriticResults({});
    setRoundScoreHistory([]);
    setRoundMarkers([]);
    setUserVote(null);
    setActiveHistoryId(null);
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ─── Main Orchestration Loop ──────────────────────────────────
  useEffect(() => {
    let timeout;
    if (status === 'playing' && !isTyping) {
      if (turnIndex >= maxTurns) {
        setStatus('voting');
        return;
      }

      // 3-SECOND READING BUFFER after every AI speech
      timeout = setTimeout(() => {
        if (statusRef.current !== 'playing') return;
        
        // Start of a new round: call planner first
        const isNewRound = turnIndex % turnsPerRound === 0;
        if (isNewRound) {
          const rNum = Math.floor(turnIndex / turnsPerRound) + 1;
          // Add a round marker to chat
          setRoundMarkers(prev => {
            const alreadyHas = prev.find(m => m.roundNumber === rNum);
            if (alreadyHas) return prev;
            return [...prev, { afterIndex: historyRef.current.length - 1, label: `Round ${rNum}${plannerData?.roundTheme ? ': ' + plannerData.roundTheme : ''}`, roundNumber: rNum }];
          });
          callPlanner(rNum, roundScoreHistory).then(() => {
            timeout = setTimeout(() => {
              if (statusRef.current === 'playing') handleNextTurn();
            }, 3000);
          });
          return;
        }

        // End of a turn: Check for Interception Window
        setHeckleCountdown(5);
      }, 3000); // Wait 3 seconds for human to read before starting any timer
    } else if (status === 'judging' && !isTyping) {
      timeout = setTimeout(() => { handleJudgeTurn(); }, 4000);
    }

    return () => clearTimeout(timeout);
  }, [status, isTyping, turnIndex]);

  // Interception Timer Countdown: PAUSABLE
  useEffect(() => {
    let interval;
    if (status === 'playing' && heckleCountdown > 0 && !isUserTyping) {
      interval = setInterval(() => {
        setHeckleCountdown(prev => {
          if (prev <= 1) {
            handleNextTurn();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, heckleCountdown, isUserTyping, handleNextTurn]);

  // Smooth Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  // ─── End of each round: trigger critic ───────────────────────
  useEffect(() => {
    if (turnIndex > 0 && turnIndex % turnsPerRound === 0 && status === 'playing') {
      const completedRound = Math.floor((turnIndex - 1) / turnsPerRound) + 1;
      if (!criticResults[completedRound]) {
        const roundArgs = historyRef.current.slice(-turnsPerRound).filter(h => h.persona?.id !== 'judge');
        const theme = plannerData?.roundTheme || `Round ${completedRound}`;
        callCritic(roundArgs, completedRound, theme);
      }
    }
  }, [turnIndex]);

  // ─── Player Controls ──────────────────────────────────────────
  const togglePlay = () => {
    if (status === 'idle' && !topicLocked) {
      setTopicLocked(true);
      audioRef.current?.play().catch(() => {});
    }
    setStatus(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const manuallyNext = () => {
    if (!topicLocked) setTopicLocked(true);
    setStatus('paused');
    handleNextTurn();
  };

  const handleUserVote = (personaId) => {
    setUserVote(personaId);
  };

  const handleRevealVerdict = () => {
    setStatus('judging');
  };

  return (
    <>
      <LiveWallpaper />
      <AnimatePresence>
        {status === 'initializing' && (
          <StartSequence onComplete={() => setStatus('playing')} />
        )}
      </AnimatePresence>
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1400px' }}>
        <audio ref={audioRef} loop src="/bg-music.mp3" preload="auto" style={{ display: 'none' }} />

        <motion.div
           style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1 }}
        >
          {/* Cyber Glitch Heading */}
          <motion.h1 
            className="text-gradient"
            style={{ 
              fontSize: '4.2rem',
              fontWeight: 950,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              lineHeight: 1,
              position: 'relative',
              display: 'inline-block',
              filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.4))',
              whiteSpace: 'nowrap'
            }}
          >
            {/* Main Title Cluster */}
            <motion.span
              style={{ position: 'relative', zIndex: 2 }}
              animate={{ 
                textShadow: [
                  '2px 0 0 #ff00c1, -2px 0 0 #00fff9',
                  '-2px 0 0 #ff00c1, 2px 0 0 #00fff9',
                  '1px 0 0 #ff00c1, -1px 0 0 #00fff9',
                  '0 0 0 #ff00c1, 0 0 0 #00fff9'
                ],
                x: [0, -1, 1, 0]
              }}
              transition={{ duration: 0.15, repeat: Infinity, repeatType: 'mirror', repeatDelay: 4 }}
            >
              MULTI-MIND SIMULATOR
            </motion.span>

            {/* Scanning Laser Beam */}
            <motion.div 
               style={{
                 position: 'absolute',
                 left: 0, width: '100%', height: '3px',
                 background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                 boxShadow: '0 0 25px var(--primary)',
                 zIndex: 10
               }}
               animate={{ top: ['-10%', '110%', '-10%'] }}
               transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />

            {/* Background Static Layer */}
            <motion.span
               style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, zIndex: 1, pointerEvents: 'none' }}
               animate={{ opacity: [0.1, 0.2, 0.1] }}
               transition={{ duration: 0.1, repeat: Infinity }}
            >
              MULTI-MIND SIMULATOR
            </motion.span>
          </motion.h1>

          {/* Subtitle / Status */}
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.5em', opacity: 0.6 }}>
            NEURAL_CORE_v9.2 // STATUS: {status.toUpperCase()}
          </div>
        </motion.div>

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
                <button key={idx} onClick={() => setTopic(t)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.target.style.background = 'rgba(0,240,255,0.1)'; e.target.style.color = 'var(--primary)'; e.target.style.borderColor = 'var(--primary)'; }}
                  onMouseOut={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >{t}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => setParticipationMode('watch')}
                  style={{ 
                    padding: '8px 24px', borderRadius: '25px', fontSize: '0.8rem', fontWeight: 700,
                    background: participationMode === 'watch' ? 'var(--primary)' : 'transparent',
                    color: participationMode === 'watch' ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.3s'
                  }}
                >
                  WATCH MODE
                </button>
                <button 
                  onClick={() => setParticipationMode('interact')}
                  style={{ 
                    padding: '8px 24px', borderRadius: '25px', fontSize: '0.8rem', fontWeight: 700,
                    background: participationMode === 'interact' ? 'var(--primary)' : 'transparent',
                    color: participationMode === 'interact' ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.3s'
                  }}
                >
                  INTERACT MODE
                </button>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                {participationMode === 'watch' ? "Observe the 4 machine minds battle. You can still interject manually." : "You join as a 5th seat. The machines will wait for your formal turn."}
              </p>
            </div>

            {/* Neural Council Manifest */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.7rem', color: 'var(--primary)', letterSpacing: '0.2em', marginBottom: '1rem', opacity: 0.8 }}>NEURAL_COUNCIL_MANIFEST</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
                {personas.map(p => (
                  <div key={p.id} style={{ padding: '0.75rem', borderRadius: '12px', border: `1px solid ${p.color}44`, background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                    <div style={{ color: p.color, fontWeight: 900, fontSize: '0.75rem', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{p.prompt.split('.')[0]}.</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', position: 'relative', overflow: 'hidden' }} onClick={() => {
              setTopicLocked(true);
              setStatus('initializing');
              if (audioRef.current) { audioRef.current.volume = 0.4; audioRef.current.play().catch(() => {}); }
            }}>
              LAUNCH ARENA
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel" 
            style={{ 
              padding: '1.5rem', marginBottom: '2rem', background: 'rgba(0,240,255,0.05)', 
              border: '1px solid var(--primary)', textAlign: 'center',
              position: 'relative', overflow: 'hidden'
            }}
          >
            {status === 'initializing' && (
              <motion.div 
                style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: 'var(--primary)', opacity: 0.1, zIndex: 0 }}
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Directive</h3>
              <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>"{topic}"</p>
              {plannerData && (
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  Planner: {plannerData.instruction}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Arena Layout */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', opacity: topicLocked ? 1 : 0.5, pointerEvents: topicLocked ? 'auto' : 'none', transition: 'all 0.5s' }}>
          
          {/* Left: History Sidebar */}
          <HistorySidebar 
            historyItems={historyItems} 
            onSelect={loadHistoryItem} 
            activeId={activeHistoryId} 
          />

          {/* Center: Avatar Colosseum */}
          <div className="glass-panel" style={{ 
            flex: '1', minWidth: '320px', 
            display: 'grid', 
            gridTemplateColumns: participationMode === 'interact' ? '1fr 1fr' : '1fr 1fr', 
            gap: '2rem', padding: '2rem', position: 'relative', placeItems: 'center' 
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%)', zIndex: 0 }} />
            {activePersonas.map((p) => {
              const lastMsg = [...history].reverse().find(h => h.persona.id === p.id);
              const isSpeaking = (isTyping && activePersona?.id === p.id) || (status === 'waiting-for-user' && p.id === 'user');
              return (
                <div key={p.id} style={{ zIndex: 1, gridColumn: (p.id === 'user') ? 'span 2' : 'auto' }}>
                  <RobotAvatar
                    persona={p}
                    isSpeaking={isSpeaking}
                    scratchpad={lastMsg?.scratchpad}
                    confidence={confidences[p.id] ?? 75}
                    mood={moods[p.id] ?? 'calm'}
                  />
                </div>
              );
            })}
          </div>

          {/* Right: Chat & Controls */}
          <div style={{ flex: '1.5', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <DebateChat
              messages={history}
              activePersona={status === 'judging' ? { id: 'judge', name: 'THE JUDGE AI', color: '#ffb700' } : activePersona}
              isTyping={isTyping}
              factChecks={factChecks}
              roundMarkers={roundMarkers}
            />

            <AudienceTicker reactions={audienceReactions} />

            {/* Critic panels after each completed round */}
            {Object.entries(criticResults)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([rNum, result]) => (
                <CriticPanel
                  key={rNum}
                  roundNumber={rNum}
                  roundTheme={result.roundTheme}
                  criticResult={result}
                  personas={personas}
                />
              ))}

            {/* Voting panel after round 5 */}
            {(status === 'voting') && (
              <>
                <VotingPanel personas={personas} onVote={handleUserVote} userVote={userVote} />
                {userVote && (
                  <button className="btn btn-primary" style={{ marginBottom: '1rem', padding: '0.85rem', fontWeight: 700, letterSpacing: '0.1em' }} onClick={handleRevealVerdict}>
                    ⚖️ REVEAL JUDGE VERDICT
                  </button>
                )}
              </>
            )}

            <ControlPanel
              status={status}
              onPlayPause={togglePlay}
              onNext={manuallyNext}
              isTyping={isTyping}
              onReset={resetSimulation}
            />

            {(status === 'playing' || status === 'waiting-for-user') && (
              <NeuralHeckle 
                onHeckle={(text) => status === 'waiting-for-user' ? handleUserSubmit(text) : setActiveHeckle(text)} 
                disabled={isTyping} 
                countdown={heckleCountdown}
                onSkip={() => setHeckleCountdown(0)}
                isYourTurn={status === 'waiting-for-user'}
                onTypingChange={setIsUserTyping}
              />
            )}

            {status === 'finished' && (
              <PDFGenerator 
                topic={topic} 
                history={history} 
                criticResults={criticResults} 
                userVote={userVote} 
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
