import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ref as dbRef, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';

const drawingWords = ["Pallone", "Porta", "Arbitro", "Cartellino", "Coppa", "Guanti", "Fischietto", "Bandierina", "Scarpini", "Stadio"];

export default function HostDisegnatore({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokesQueue, setStrokesQueue] = useState<any[]>([]);

  // Initialize Game
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const playerIds = Object.keys(players);
      if (playerIds.length === 0) return;

      const drawerId = playerIds[Math.floor(Math.random() * playerIds.length)];
      const word = drawingWords[Math.floor(Math.random() * drawingWords.length)];

      updateGameState({
        phase: 'draw',
        drawerId,
        word,
        strokes: {},
        guesses: {},
        startTime: Date.now()
      });
    }
  }, [lobby]);

  // Handle incoming strokes from Firebase RTDB (Listen directly for performance)
  useEffect(() => {
    if (gameState.phase !== 'draw') return;

    const strokesRef = dbRef(db, `lobbies/${lobbyCode}/game_state/strokes`);
    const unsubscribe = onValue(strokesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Flatten the batches of strokes
        const allStrokes = Object.values(data).flat();
        setStrokesQueue(allStrokes);
      } else {
        // Clear canvas
        setStrokesQueue([]);
      }
    });

    return () => unsubscribe();
  }, [lobbyCode, gameState.phase]);

  // Draw strokes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw everything for simplicity (fast enough for small/medium drawings)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let isDrawing = false;

    strokesQueue.forEach((pt: any) => {
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
    });
  }, [strokesQueue]);

  // Check guesses
  useEffect(() => {
    if (gameState.phase === 'draw') {
      const guesses = gameState.guesses || {};
      const targetWord = gameState.word?.toLowerCase();
      
      let winnerId = null;
      Object.entries(guesses).forEach(([id, guess]: any) => {
        if (guess.toLowerCase() === targetWord) {
          winnerId = id;
        }
      });

      if (winnerId) {
        // Winner found!
        updatePlayerScore(winnerId, 100);
        updatePlayerScore(gameState.drawerId, 50); // Drawer gets points too!
        updateGameState({ phase: 'reveal', winnerId });
      }
    }
  }, [gameState.guesses, gameState.phase]);

  const handleTimeUp = () => {
    updateGameState({ phase: 'reveal', winnerId: null });
  };

  const handleNextRound = () => {
    updateGameState({ phase: 'finished', action: null });
  };

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal') {
      handleNextRound();
    }
  }, [gameState.action, gameState.phase]);


  if (!gameState.phase) return <div>Caricamento...</div>;

  const drawerName = players[gameState.drawerId]?.name;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Disegnatore Bendato 🎨
      </motion.h1>

      <div className="panel" style={{ maxWidth: '1200px', width: '90%', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {gameState.phase === 'draw' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
              <span style={{ color: 'white' }}>{drawerName}</span> sta disegnando!
            </h2>
            
            <div style={{ position: 'relative', width: '800px', height: '400px', background: '#111', borderRadius: '1rem', border: '3px solid var(--color-primary)', overflow: 'hidden', marginBottom: '2rem' }}>
              <canvas 
                ref={canvasRef}
                width={800}
                height={400}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
            <ProgressBar durationMs={60000} onComplete={handleTimeUp} />

            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => {
                if (id === gameState.drawerId) return null;
                return (
                  <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Avatar photo={p.photo} name={p.name} size={48} />
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '1rem', minWidth: '100px' }}>
                      {gameState.guesses?.[id] || '...'}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '2rem', color: 'var(--color-warning)' }}>
              La parola era: <span style={{ color: 'white', textTransform: 'uppercase' }}>{gameState.word}</span>
            </h2>

            {gameState.winnerId ? (
              <div style={{ fontSize: '2rem', color: 'var(--color-success)', margin: '3rem 0' }}>
                <span style={{ fontWeight: 'bold' }}>{players[gameState.winnerId]?.name}</span> ha indovinato! 🎉 <br/>
                <span style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>+100 punti! (+50 a {drawerName})</span>
              </div>
            ) : (
              <div style={{ fontSize: '2rem', color: 'var(--color-danger)', margin: '3rem 0' }}>
                Tempo scaduto! Nessuno ha indovinato. ❌
              </div>
            )}

            <p style={{ marginTop: '3rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }} className="animate-pulse">
              In attesa dell'Admin...
            </p>
          </motion.div>
        )}

        {gameState.phase === 'finished' && (
          <PodiumTV players={players} />
        )}
      </div>
    </div>
  );
}
