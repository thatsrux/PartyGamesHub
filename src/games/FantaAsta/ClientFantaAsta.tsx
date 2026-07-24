import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';

export default function ClientFantaAsta({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const phase = gameState.phase;
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const myBudget = gameState.budgets?.[userId] || 0;
  const myBid = gameState.bids?.[userId];
  
  const [bidValue, setBidValue] = useState<number | ''>('');

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'auction' || myBid !== undefined || bidValue === '') return;
    
    const val = Number(bidValue);
    if (val < 0 || val > myBudget) return;

    updateGameState({
      [`bids/${userId}`]: val
    });
  };

  if (phase === 'finished') {
    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>Asta Terminata!</h2>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '1.5rem' }}>Guarda le rose sulla TV.</p>
      </div>
    );
  }

  if (phase === 'reveal_bids') {
    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Guarda la TV!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Chi si sarà aggiudicato il giocatore?</p>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
            >
              Prossima Asta (Admin)
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  if (phase === 'auction') {
    if (myBid !== undefined) {
      return (
        <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h2 style={{ color: 'var(--color-success)', fontSize: '2.5rem' }}>Offerta Inviata!</h2>
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Hai offerto {myBid} crediti.</p>
            <p className="animate-pulse" style={{ marginTop: '3rem', fontSize: '1.2rem' }}>
              In attesa degli altri presidenti...
            </p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="container-mobile" style={{ justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel" style={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Il tuo budget:</span>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-success)', margin: 0 }}>{myBudget} 💰</h2>
          </div>

          <form onSubmit={handleBid} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="input-group">
              <label style={{ textAlign: 'center', fontSize: '1.2rem' }}>Quanto offri per questo giocatore?</label>
              <input 
                type="number"
                min="0"
                max={myBudget}
                value={bidValue}
                onChange={e => setBidValue(e.target.value === '' ? '' : Number(e.target.value))}
                className="input"
                style={{ fontSize: '3rem', textAlign: 'center', height: '80px', background: 'rgba(0,0,0,0.3)' }}
                autoFocus
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-giant btn-primary"
              disabled={bidValue === '' || Number(bidValue) > myBudget || Number(bidValue) < 0}
            >
              INVIA OFFERTA SEGRETA
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return <div>Caricamento...</div>;
}
