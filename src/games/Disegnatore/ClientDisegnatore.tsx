import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref as dbRef, update } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';

export default function ClientDisegnatore({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, setGameStatus } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const phase = gameState.phase;
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const isDrawer = gameState.drawerId === userId;
  
  const [guess, setGuess] = useState('');
  
  // Drawing Logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const batchQueueRef = useRef<any[]>([]);

  useEffect(() => {
    // Throttled batch sender (Optimized for Firebase RTDB)
    if (!isDrawer || phase !== 'draw') return;

    const interval = setInterval(() => {
      if (batchQueueRef.current.length > 0) {
        const batch = [...batchQueueRef.current];
        batchQueueRef.current = [];
        
        // Push batch to firebase without overwriting
        const updates: any = {};
        updates[`lobbies/${lobbyCode}/game_state/strokes/${Date.now()}`] = batch;
        update(dbRef(db), updates);
      }
    }, 500); // Send every 500ms

    return () => clearInterval(interval);
  }, [isDrawer, phase, lobbyCode]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    addPoint(e, 'start');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    addPoint(e, 'line');
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDrawing(false);
    addPoint(e, 'end');
  };

  const addPoint = (e: React.PointerEvent, type: 'start' | 'line' | 'end') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Normalize coordinates (0 to 1) for the TV to scale them
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    batchQueueRef.current.push({ x, y, type });

    // Draw locally for the user
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (type === 'start') {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    } else if (type === 'line') {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    } else {
      ctx.closePath();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    // Delete all strokes in DB
    updateGameState({ strokes: null });
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'draw' || isDrawer || !guess.trim()) return;
    
    updateGameState({
      [`guesses/${userId}`]: guess.trim()
    });
    setGuess('');
  };


  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => setGameStatus('waiting')} 
      />
    );
  }

  if (phase === 'reveal') {
    const isWinner = gameState.winnerId === userId;

    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: isWinner ? 'var(--color-success)' : 'white' }}>
            {isWinner ? '✅ Hai indovinato!' : 'Risultati!'}
          </h2>
          <p style={{ margin: '1rem 0', color: 'var(--color-primary)', fontSize: '2rem', textTransform: 'uppercase' }}>
            {gameState.word}
          </p>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
            >
              Termina Partita (Admin)
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  if (phase === 'draw') {
    if (isDrawer) {
      return (
        <div className="container-mobile" style={{ justifyContent: 'flex-start', paddingTop: '1rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary)', fontSize: '1.5rem' }}>Devi disegnare:</h2>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase', color: 'white' }}>{gameState.word}</h1>
            
            <div style={{ flex: 1, background: '#111', borderRadius: '1rem', border: '2px solid var(--color-primary)', touchAction: 'none', position: 'relative' }}>
              <canvas 
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerOut={handlePointerUp}
              />
            </div>
            
            <button className="btn btn-danger" style={{ marginTop: '1rem', padding: '1rem' }} onClick={handleClear}>
              🗑️ Cancella tutto
            </button>
          </motion.div>
        </div>
      );
    } else {
      // Guesser
      return (
        <div className="container-mobile" style={{ justifyContent: 'center' }}>
          <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary)' }}>Cosa sta disegnando?</h2>
            
            <form onSubmit={handleGuessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <input 
                type="text" 
                className="input" 
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="La tua risposta..."
                style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center' }}
                required
              />
              
              <button 
                type="submit" 
                className="btn btn-giant btn-primary"
                disabled={!guess.trim()}
              >
                INVIA IPOTESI
              </button>
            </form>
          </motion.div>
        </div>
      );
    }
  }

  return <div>Caricamento...</div>;
}
