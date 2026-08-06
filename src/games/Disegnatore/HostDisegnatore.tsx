import { useEffect, useRef, useState } from 'react';
import { floodFill } from '../../utils/drawing';
import { motion } from 'framer-motion';

import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import LiveGuessPopup, { type GuessEvent } from '../../components/shared/LiveGuessPopup';
import WaitingAdminTV from '../../components/shared/WaitingAdminTV';
import RoundLeaderboardTV from '../../components/shared/RoundLeaderboardTV';
import drawingWords from '../../data/disegnatore_words.json';
import WordRevealUI from '../../components/shared/WordRevealUI';

import GameLayoutTV from '../../components/shared/GameLayoutTV';
import GameTitleTV from '../../components/shared/GameTitleTV';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { getServerTime } from '../../utils/serverTime';

export default function HostDisegnatore({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [liveGuess, setLiveGuess] = useState<GuessEvent | null>(null);
  const [wrongPlayers, setWrongPlayers] = useState<string[]>([]);
  const processedAnswersRef = useRef<Record<string, boolean>>({});

  // Initialize Game
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const playerIds = Object.keys(players);
      if (playerIds.length === 0) return;

      const drawerId = playerIds[Math.floor(Math.random() * playerIds.length)];
      
      const wordChoices: string[] = [];
      const tempWords = [...drawingWords];
      for (let i = 0; i < 4; i++) {
        const rand = Math.floor(Math.random() * tempWords.length);
        wordChoices.push(tempWords[rand]);
        tempWords.splice(rand, 1);
      }

      updateGameState({
        phase: 'choose_word',
        round: 1,
        drawerId,
        wordChoices,
        word: null,
        revealSequence: null,
        drawnInRound: [drawerId],
        strokes: {},
        guesses: {},
        startTime: null
      });
    }
  }, [lobby]);

  // Draw strokes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const batches = Object.values(gameState.strokes || {}).sort((a: any, b: any) => a.timestamp - b.timestamp);
    const allPoints = batches.flatMap((b: any) => b);

    allPoints.forEach((pt: any) => {
      ctx.strokeStyle = pt.tool === 'eraser' ? '#ffffff' : (pt.color || '#000000');
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = pt.size || 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (pt.tool === 'brush' || pt.tool === 'eraser' || !pt.tool) {
        if (pt.type === 'start') {
          ctx.beginPath();
          ctx.moveTo(pt.x * canvas.width, pt.y * canvas.height);
          isDrawing = true;
        } else if (pt.type === 'line' && isDrawing) {
          ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
          ctx.stroke();
        } else if (pt.type === 'end') {
          isDrawing = false;
          ctx.closePath();
        }
      } else if (pt.tool === 'bucket') {
        floodFill(ctx, Math.floor(pt.x * canvas.width), Math.floor(pt.y * canvas.height), pt.color);
      } else if (pt.type === 'shape') {
        const sx = pt.startX * canvas.width;
        const sy = pt.startY * canvas.height;
        const ex = pt.endX * canvas.width;
        const ey = pt.endY * canvas.height;

        if (pt.tool === 'line') {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        } else if (pt.tool === 'rect') {
          ctx.strokeRect(sx, sy, ex - sx, ey - sy);
        } else if (pt.tool === 'circle') {
          ctx.beginPath();
          const radius = Math.hypot(ex - sx, ey - sy);
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });
  }, [gameState.strokes]);

  // Check guesses
  useEffect(() => {
    if (gameState.phase === 'draw') {
      const guesses = gameState.guesses || {};
      const targetWord = gameState.word?.toLowerCase();
      const durationMs = (gameState.settings?.duration || 60) * 1000;
      
      let updates: any = null;
      let newCorrectGuessers = { ...(gameState.correctGuessers || {}) };
      let newRoundPoints = { ...(gameState.roundPoints || {}) };
      let drawerGotPoints = !!newRoundPoints[gameState.drawerId];

      Object.entries(guesses).forEach(([id, guessData]: any) => {
        if (!guessData || id === gameState.drawerId) return;
        
        const guess = typeof guessData === 'object' ? guessData.value : guessData;
        const timeElapsed = typeof guessData === 'object' ? guessData.timeElapsed : 0;

        if (guess.toLowerCase() === targetWord) {
          if (!processedAnswersRef.current[id]) {
            processedAnswersRef.current[id] = true;
            
            const timeLeft = Math.max(0, durationMs - timeElapsed);
            const pointsEarned = 50 + (durationMs > 0 ? Math.floor((timeLeft / durationMs) * 150) : 0);
            
            newCorrectGuessers[id] = true;
            newRoundPoints[id] = pointsEarned;
            updatePlayerScore(id, pointsEarned);
            
            if (!drawerGotPoints) {
              newRoundPoints[gameState.drawerId] = 50;
              updatePlayerScore(gameState.drawerId, 50);
              drawerGotPoints = true;
            }

            updates = { ...updates, correctGuessers: newCorrectGuessers, roundPoints: newRoundPoints, [`guesses/${id}`]: null };
            
            setLiveGuess({
              id: getServerTime().toString() + Math.random(),
              playerId: id,
              playerName: players[id]?.name || 'Sconosciuto',
              playerPhoto: players[id]?.photo,
              text: "***",
              isCorrect: true
            });
          }
        } else {
          // Wrong guess
          const hash = `${id}_${guess}`;
          if (!processedAnswersRef.current[hash]) {
            processedAnswersRef.current[hash] = true;
            
            updates = { ...updates, [`guesses/${id}`]: null };
            
            setWrongPlayers(prev => [...prev, id]);
            setTimeout(() => setWrongPlayers(prev => prev.filter(p => p !== id)), 1500);
            
            setLiveGuess({
              id: getServerTime().toString() + Math.random(),
              playerId: id,
              playerName: players[id]?.name || 'Sconosciuto',
              playerPhoto: players[id]?.photo,
              text: guess,
              isCorrect: false
            });
          }
        }
      });

      if (updates) {
        updateGameState(updates);
      }

      const guessers = Object.keys(players).filter(id => id !== gameState.drawerId);
      const allGuessed = guessers.length > 0 && guessers.every(id => newCorrectGuessers[id]);
      
      if (allGuessed) {
        transitionToReveal();
      }
    }
  }, [gameState.guesses, gameState.phase]);

  const transitionToReveal = () => {
    const playerIds = Object.keys(players);
    let drawn = gameState.drawnInRound || [gameState.drawerId];
    if (!drawn.includes(gameState.drawerId)) drawn = [...drawn, gameState.drawerId];
    
    let currentRound = gameState.round || 1;
    let nextDrawerId = null;
    let isGameOver = false;

    if (drawn.length >= playerIds.length) {
      if (currentRound >= (gameState.settings?.rounds || 2)) {
         isGameOver = true;
      } else {
         currentRound++;
         drawn = [];
      }
    }
    
    if (!isGameOver) {
      const availablePlayers = playerIds.filter(id => !drawn.includes(id));
      nextDrawerId = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    }

    updateGameState({ 
       phase: 'reveal', 
       drawnInRound: drawn,
       nextRound: currentRound,
       nextDrawerId: nextDrawerId
    });
  };

  const handleTimeUp = () => {
    transitionToReveal();
  };

  const handleNextRound = () => {
    setLiveGuess(null);
    setWrongPlayers([]);
    processedAnswersRef.current = {};
    
    if (gameState.nextDrawerId) {
      const wordChoices: string[] = [];
      const tempWords = [...drawingWords];
      for (let i = 0; i < 4; i++) {
        const rand = Math.floor(Math.random() * tempWords.length);
        wordChoices.push(tempWords[rand]);
        tempWords.splice(rand, 1);
      }

      updateGameState({
        phase: 'choose_word',
        round: gameState.nextRound,
        drawerId: gameState.nextDrawerId,
        wordChoices,
        word: null,
        revealSequence: null,
        drawnInRound: gameState.drawnInRound || null,
        strokes: null,
        guesses: null,
        correctGuessers: null,
        roundPoints: null,
        startTime: null,
        action: null,
        nextDrawerId: null
      });
    } else {
      updateGameState({ phase: 'finished', action: null });
    }
  };

  useEffect(() => {
    if (gameState.action === 'next_round') {
      if (gameState.phase === 'reveal') {
        updateGameState({ phase: 'results', action: null });
      } else if (gameState.phase === 'results') {
        handleNextRound();
      }
    }
  }, [gameState.action, gameState.actionId, gameState.phase]);


  if (!gameState.phase) return <LoadingScreen message="Caricamento in corso..." />;

  const drawerName = players[gameState.drawerId]?.name;

  return (
    <GameLayoutTV 
      themeKey="disegnatore"
      leaderboard={gameState.phase !== 'finished' ? <MiniLeaderboardTV players={players} animateUpdates={true} /> : undefined}
    >
      
      {gameState.phase !== 'finished' && (
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 3} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        {gameState.phase !== 'finished' && <GameTitleTV title="Disegnatore" icon="🎨" themeKey="disegnatore" compact />}

        <div className="panel" style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {gameState.phase === 'choose_word' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: '3rem', borderRadius: '2rem', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                <Avatar photo={players[gameState.drawerId]?.photo} name={players[gameState.drawerId]?.name || 'Player'} size={120} />
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ position: 'absolute', inset: -15, border: '4px dashed var(--color-primary)', borderRadius: '50%' }}
                />
              </div>
              <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {players[gameState.drawerId]?.name} sta scegliendo...
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.5rem', margin: 0, fontStyle: 'italic' }}>
                In attesa che scelga cosa disegnare
              </p>
            </div>
          </motion.div>
        )}

        {gameState.phase === 'draw' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minHeight: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
              <Avatar photo={players[gameState.drawerId]?.photo} name={drawerName} size={40} />
              <span><span style={{ color: 'white' }}>{drawerName}</span> sta disegnando!</span>
            </h2>
            
            <WordRevealUI 
              word={gameState.word} 
              revealSequence={gameState.revealSequence || []} 
              startTime={gameState.startTime || getServerTime()} 
              durationMs={(gameState.settings?.duration || 60) * 1000} 
              isTV={true} 
            />

            <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ position: 'relative', height: '100%', maxWidth: '100%', aspectRatio: '4/3', background: '#ffffff', borderRadius: '1rem', border: '3px solid var(--color-primary)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <canvas 
                  ref={canvasRef}
                  width={1200}
                  height={900}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            
            <div style={{ width: '100%' }}>
              <ProgressBar durationMs={(gameState.settings?.duration || 60) * 1000} startTime={gameState.startTime} onComplete={handleTimeUp} />
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => {
                if (id === gameState.drawerId) return null;
                const isWrong = wrongPlayers.includes(id);
                return (
                  <div key={id} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    transform: isWrong ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      borderRadius: '50%', 
                      boxShadow: isWrong ? '0 0 20px red' : 'none',
                      transition: 'box-shadow 0.2s ease-in-out'
                    }}>
                      <Avatar photo={p.photo} name={p.name} size={48} />
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '1rem', minWidth: '100px', textAlign: 'center' }}>
                      {gameState.correctGuessers?.[id] ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>Indovinato!</span>
                      ) : (
                        gameState.guesses?.[id] ? (typeof gameState.guesses[id] === 'object' ? gameState.guesses[id].value : gameState.guesses[id]) : p.name
                      )}
                    </div>
                    <LiveGuessPopup guess={liveGuess?.playerId === id ? liveGuess : null} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
                La parola era
              </h2>
              <div style={{ 
                fontSize: '5rem', 
                fontWeight: '900',
                color: 'white', 
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                padding: '1.5rem 5rem',
                borderRadius: '2rem',
                display: 'inline-block',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                letterSpacing: '2px'
              }}>
                {gameState.word}
              </div>
            </div>

            {Object.keys(gameState.correctGuessers || {}).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', margin: '2rem 0', flex: 1, minHeight: 0, overflowY: 'auto', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', width: '500px', maxWidth: '90%' }}>
                  <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5))' }} />
                  <h3 style={{ color: 'var(--color-success)', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 2px 10px rgba(16,185,129,0.3)', margin: 0 }}>
                    Hanno indovinato 🎉
                  </h3>
                  <div style={{ flex: 1, height: '2px', background: 'linear-gradient(-90deg, transparent, rgba(16,185,129,0.5))' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '500px', maxWidth: '90%', paddingBottom: '1rem' }}>
                  {Object.keys(gameState.correctGuessers).map((guesserId, i) => (
                    <motion.div 
                      key={guesserId}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 * i }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))', 
                        padding: '0.8rem 1.5rem', 
                        borderRadius: '1rem', 
                        borderLeft: '6px solid var(--color-success)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Avatar photo={players[guesserId]?.photo} name={players[guesserId]?.name} size={36} />
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{players[guesserId]?.name}</span> 
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ color: 'var(--color-success)', fontWeight: '900', fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>+{gameState.roundPoints?.[guesserId] || 100}</span>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 * Object.keys(gameState.correctGuessers).length }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))', 
                      padding: '0.8rem 1.5rem', 
                      borderRadius: '1rem', 
                      borderLeft: '6px solid var(--color-primary)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      marginTop: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Avatar photo={players[gameState.drawerId]?.photo} name={drawerName} size={36} />
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{drawerName} <span style={{fontSize: '1rem', fontWeight: 'normal', opacity: 0.8}}>ha fatto un bel disegno 🎨</span></span> 
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: '900', fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>+{gameState.roundPoints?.[gameState.drawerId] || 50}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Bonus</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ 
                  margin: '3rem 0',
                  background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
                  padding: '1.5rem 3rem',
                  borderRadius: '1rem',
                  borderLeft: '6px solid var(--color-danger)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  display: 'inline-block'
                }}
              >
                <div style={{ fontSize: '2rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                  Tempo scaduto! Nessuno ha indovinato. ❌
                </div>
              </motion.div>
            )}

            {gameState.nextDrawerId && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '2rem', fontSize: '1.5rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem 3rem', borderRadius: '2rem', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              >
                Prossimo disegnatore: 
                <Avatar photo={players[gameState.nextDrawerId]?.photo} name={players[gameState.nextDrawerId]?.name} size={48} />
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}>{players[gameState.nextDrawerId]?.name}</span>
              </motion.div>
            )}

            <WaitingAdminTV />
          </motion.div>
        )}

        {gameState.phase === 'results' && (
          <RoundLeaderboardTV 
            players={players} 
            points={Object.fromEntries(Object.entries(players).map(([id, p]: any) => [id, p.score || 0]))} 
            roundPoints={gameState.roundPoints || {}} 
            roundName={`Round ${gameState.round || 1}`}
          />
        )}

        {gameState.phase === 'finished' && (
          <PodiumTV 
            players={players} 
            points={Object.fromEntries(Object.entries(players).map(([id, p]: any) => [id, p.score || 0]))} 
          />
        )}
      </div>
      </div>
    </GameLayoutTV>
  );
}
