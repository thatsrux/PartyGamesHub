import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';

export default function ClientFalsario({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, setGameStatus } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const phase = gameState.phase;
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  
  const myLie = gameState.lies?.[userId];
  const myVote = gameState.votes?.[userId];
  
  const [lieInput, setLieInput] = useState('');

  useEffect(() => {
    setLieInput('');
  }, [gameState.round]);

  const handleLieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'write_lie' || myLie || !lieInput.trim()) return;
    
    updateGameState({
      [`lies/${userId}`]: lieInput.trim()
    });
  };

  const handleVote = (option: string) => {
    if (phase !== 'vote' || myVote) return;
    updateGameState({
      [`votes/${userId}`]: option
    });
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
    const isCorrect = myVote === gameState.question?.truth;

    return (
      <GameLayoutMobile themeKey="falsario" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.totalRounds || gameState.settings?.rounds || 3} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {isCorrect ? 'Hai indovinato! ✅' : 'Sei stato ingannato! ❌'}
          </h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>Guarda la TV per i punteggi.</p>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
            >
              {(gameState.round || 1) >=(gameState.totalRounds || gameState.settings?.rounds || 3) ? 'Termina Partita (Admin)' : 'Prossimo Round (Admin)'}
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  if (phase === 'vote') {
    if (myVote) {
      return (
        <GameLayoutMobile themeKey="falsario" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <RoundTracker current={gameState.round || 1} total={gameState.totalRounds || gameState.settings?.rounds || 3} isMobile />
          <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h2 style={{ color: 'var(--color-success)', fontSize: '2.5rem' }}>Voto inviato!</h2>
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}
                />
                <p style={{ color: 'white', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>
                  In attesa degli altri giocatori...
                </p>
              </motion.div>
            </div>
          </motion.div>
        </GameLayoutMobile>
      );
    }

    return (
      <GameLayoutMobile themeKey="falsario" style={{ justifyContent: 'flex-start', paddingTop: '4rem' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.totalRounds || gameState.settings?.rounds || 3} isMobile />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <ProgressBar durationMs={30000} startTime={gameState.startTime} />
          
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '1.2rem', 
            borderRadius: '12px', 
            margin: '1.5rem 1rem 0 1rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ textAlign: 'center', color: 'white', fontSize: '1.1rem', lineHeight: '1.4', fontWeight: '500' }}>
              {gameState.question?.text}
            </h3>
          </div>

          <h2 style={{ textAlign: 'center', margin: '1.5rem 0 1rem', color: 'var(--color-primary)' }}>Qual è la verità?</h2>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
            {gameState.options?.map((opt: string, i: number) => {
              const isMyLie = opt === myLie;
              return (
                <button 
                  key={i}
                  className="btn"
                  disabled={isMyLie}
                  style={{ 
                    padding: '1.5rem', 
                    fontSize: '1.2rem', 
                    background: isMyLie ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                    border: isMyLie ? '1px dashed rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.2)',
                    opacity: isMyLie ? 0.5 : 1,
                    textAlign: 'center'
                  }}
                  onClick={() => handleVote(opt)}
                >
                  {opt} {isMyLie && '(La tua bugia)'}
                </button>
              );
            })}
          </div>
        </motion.div>
      </GameLayoutMobile>
    );
  }

  if (phase === 'write_lie') {
    if (myLie) {
      return (
        <GameLayoutMobile themeKey="falsario" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <RoundTracker current={gameState.round || 1} total={gameState.totalRounds || gameState.settings?.rounds || 3} isMobile />
          <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h2 style={{ color: 'var(--color-success)', fontSize: '2.5rem' }}>Bugia inviata!</h2>
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Guarda la TV in attesa degli altri.</p>
          </motion.div>
        </GameLayoutMobile>
      );
    }

    return (
      <GameLayoutMobile themeKey="falsario" style={{ justifyContent: 'center', paddingTop: '4rem' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.totalRounds || gameState.settings?.rounds || 3} isMobile />
        <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ProgressBar durationMs={(gameState.settings?.duration || 60) * 1000} startTime={gameState.startTime} />
          
          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            margin: '1.5rem 0',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Completa la frase:</p>
            <h3 style={{ color: 'white', fontSize: '1.3rem', lineHeight: '1.4' }}>
              {gameState.question?.text}
            </h3>
          </div>

          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Scrivi una bugia credibile!</h2>
          
          <form onSubmit={handleLieSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <input 
              type="text"
              value={lieInput}
              onChange={e => setLieInput(e.target.value)}
              className="input"
              placeholder="La tua risposta falsa..."
              style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center' }}
              autoFocus
              required
            />
            
            <button 
              type="submit" 
              className="btn btn-giant btn-primary"
              disabled={!lieInput.trim()}
            >
              INVIA
            </button>
          </form>
        </motion.div>
      </GameLayoutMobile>
    );
  }

  return <div>Caricamento...</div>;
}
