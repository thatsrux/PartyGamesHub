import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref as dbRef, get } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';

export default function HostFantaAsta({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  // Initialize game state
  useEffect(() => {
    const initGame = async () => {
      if (lobby && !gameState.phase) {
        // Scarica dal db firebase
        const snapshot = await get(dbRef(db, 'games_data/footballers'));
        const footballersData = snapshot.val() || [];
        
        const rounds = gameState.settings?.players || 5;
        const initialBudget = gameState.settings?.budget || 500;

        const shuffled = [...footballersData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, rounds);
        
        const budgets: Record<string, number> = {};
        const squads: Record<string, string[]> = {};
        
        Object.keys(players).forEach(id => {
          budgets[id] = initialBudget;
          squads[id] = [];
        });

        updateGameState({
          phase: 'auction',
          auctionIndex: 0,
          auctionPlayers: selected,
          budgets,
          squads,
          bids: {},
          startTime: Date.now()
        });
      }
    };
    initGame();
  }, [lobby]);

  // Check if everyone bid
  useEffect(() => {
    if (gameState.phase === 'auction') {
      const playerIds = Object.keys(players);
      const allBid = playerIds.length > 0 && playerIds.every(id => gameState.bids?.[id] !== undefined);
      if (allBid) {
        handleAuctionEnd();
      }
    }
  }, [players, gameState.phase, gameState.bids]);

  const handleAuctionEnd = () => {
    const playerIds = Object.keys(players);
    const bids = gameState.bids || {};
    
    let maxBid = -1;
    let winners: string[] = [];
    
    playerIds.forEach(id => {
      const bid = bids[id] || 0;
      if (bid > maxBid) {
        maxBid = bid;
        winners = [id];
      } else if (bid === maxBid) {
        winners.push(id);
      }
    });

    const currentFootballer = gameState.auctionPlayers[gameState.auctionIndex];
    let winnerId = null;
    let winningBid = 0;
    
    const newBudgets = { ...gameState.budgets };
    const newSquads = { ...gameState.squads };

    // If there's a unique winner and they bid more than 0
    if (winners.length === 1 && maxBid > 0) {
      winnerId = winners[0];
      winningBid = maxBid;
      newBudgets[winnerId] -= winningBid;
      newSquads[winnerId].push(currentFootballer.name);
    }

    updateGameState({ 
      phase: 'reveal_bids', 
      winnerId,
      winningBid,
      budgets: newBudgets,
      squads: newSquads
    });
  };

  const handleNextRound = () => {
    if (gameState.auctionIndex + 1 < gameState.auctionPlayers.length) {
      updateGameState({
        phase: 'auction',
        auctionIndex: gameState.auctionIndex + 1,
        bids: {},
        startTime: Date.now(),
        action: null,
        winnerId: null,
        winningBid: 0
      });
    } else {
      updateGameState({ phase: 'finished', action: null });
    }
  };

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal_bids') {
      handleNextRound();
    }
  }, [gameState.action, gameState.phase]);

  if (!gameState.phase) return <div>Caricamento...</div>;

  const currentFootballer = gameState.auctionPlayers?.[gameState.auctionIndex];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '4rem', marginBottom: '1rem' }}>
        Fanta-Asta al Buio 💰
      </motion.h1>
      
      {gameState.phase !== 'finished' && (
        <div style={{ marginBottom: '1rem', fontSize: '1.5rem', color: 'var(--color-primary)' }}>
          Giocatore {gameState.auctionIndex + 1} di {gameState.auctionPlayers?.length}
        </div>
      )}

      <div className="panel" style={{ maxWidth: '1400px', width: '95%', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {gameState.phase === 'auction' && currentFootballer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-warning)' }}>All'Asta Ora:</h2>
            <h1 style={{ fontSize: '5rem', textTransform: 'uppercase', margin: '2rem 0' }}>{currentFootballer.name}</h1>
            
            <ProgressBar key={`prog-${gameState.auctionIndex}`} durationMs={20000} onComplete={handleAuctionEnd} />
            
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => (
                <div key={id} style={{ 
                  padding: '1rem',
                  background: gameState.bids?.[id] !== undefined ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <Avatar photo={p.photo} name={p.name} size={48} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{p.name}</div>
                    <div style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>Budget: {gameState.budgets?.[id]}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'reveal_bids' && currentFootballer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)' }}>Offerte per <strong style={{ color: 'white' }}>{currentFootballer.name}</strong></h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '3rem 0', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => {
                const bid = gameState.bids?.[id] || 0;
                const isWinner = id === gameState.winnerId;
                
                return (
                  <motion.div 
                    key={id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      background: isWinner ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
                      padding: '2rem',
                      borderRadius: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem',
                      border: isWinner ? '3px solid #10b981' : 'none'
                    }}
                  >
                    <Avatar photo={p.photo} name={p.name} size={64} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{p.name}</div>
                    <div style={{ fontSize: '2.5rem', color: isWinner ? 'white' : 'var(--color-primary)', fontWeight: 'bold' }}>{bid} 💰</div>
                  </motion.div>
                );
              })}
            </div>

            {gameState.winnerId ? (
              <h2 style={{ fontSize: '3rem', color: 'var(--color-success)' }}>
                {players[gameState.winnerId].name} si aggiudica il giocatore!
              </h2>
            ) : (
              <h2 style={{ fontSize: '3rem', color: 'var(--color-danger)' }}>
                Nessuno vince l'asta (Pareggio o zero offerte)
              </h2>
            )}

            <p style={{ marginTop: '3rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }} className="animate-pulse">
              In attesa dell'Admin...
            </p>
          </motion.div>
        )}

        {gameState.phase === 'finished' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '3rem' }}>Rose Finali</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => (
                <div key={id} style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '1rem', width: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem' }}>
                    <Avatar photo={p.photo} name={p.name} size={48} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{p.name}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', minHeight: '150px' }}>
                    {gameState.squads?.[id]?.map((player: string, i: number) => (
                      <li key={i} style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: 'var(--color-success)' }}>⚽ {player}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '1rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>Avanzo: {gameState.budgets?.[id]} 💰</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '3rem' }}>
               <button className="btn btn-secondary" onClick={() => updateGameState({ phase: 'finished', action: 'terminate' })}>Torna alla Lobby</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
