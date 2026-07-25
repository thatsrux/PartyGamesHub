import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import Avatar from '../../components/shared/Avatar';
import PodiumTV from '../../components/shared/PodiumTV';
import RoundLeaderboardTV from '../../components/shared/RoundLeaderboardTV';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import ProgressBar from '../../components/shared/ProgressBar';

const ALPHABET = 'ABCDEFGHILMNOPQRSTUVZ'.split('');

export default function HostNomiCoseCitta({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  const CATEGORIES: string[] = gameState.settings?.categories || ['Nomi', 'Cose', 'Città', 'Animali', 'Mestieri'];
  
  const [displayedLetter, setDisplayedLetter] = useState('A');




  // Initialization
  useEffect(() => {
    if (lobby && !gameState.phase) {
      updateGameState({
        phase: 'spin',
        round: 1
      }).catch(e => {
        console.error("Crash during initialization:", e);
      });
    }
  }, [lobby]);

  // Phase: spin
  useEffect(() => {
    if (gameState.phase === 'spin') {
      let interval = setInterval(() => {
        setDisplayedLetter(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        
        // Pick a letter not used
        const available = ALPHABET.filter(l => !(gameState.usedLetters || []).includes(l));
        const finalLetter = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : 'A';
        
        setDisplayedLetter(finalLetter);
        
        // Dopo 2 secondi, andiamo in scrittura
        setTimeout(() => {
          updateGameState({
            phase: 'write',
            letter: finalLetter,
            usedLetters: [...(gameState.usedLetters || []), finalLetter],
            endTime: Date.now() + (gameState.settings?.duration || 60) * 1000,
            answers: null,
            validations: null,
            readyPlayers: null
          });
        }, 3000);
        
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [gameState.phase]);

  // Timer per la fase write
  useEffect(() => {
    if (gameState.phase === 'write' && gameState.endTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((gameState.endTime - Date.now()) / 1000));
        
        const allReady = Object.keys(players).length > 0 && Object.keys(players).every(pId => gameState.readyPlayers?.[pId]);

        if (remaining <= 0 || allReady) {
          clearInterval(interval);
          updateGameState({ phase: 'validate' });
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [gameState.phase, gameState.endTime, gameState.readyPlayers, players]);

  // Gestione azioni
  useEffect(() => {
    if (!gameState.action) return;
    
    if (gameState.action === 'calculate_points' && gameState.phase === 'validate') {
       const points = { ...gameState.points };
       const roundPoints: Record<string, number> = {};
       const answers = gameState.answers || {};
       const validations = gameState.validations || {};
       
       Object.keys(answers).forEach(userId => {
         CATEGORIES.forEach(cat => {
           const word = answers[userId][cat]?.toLowerCase().trim();
           if (!word) return;
           
           const startsWithLetter = word.startsWith(gameState.letter?.toLowerCase() || 'a');
           const isValid = validations[cat]?.[userId] ?? startsWithLetter;
           
           if (!isValid) return;
           
           const othersWithSameWord = Object.keys(answers).filter(id => id !== userId && answers[id][cat]?.toLowerCase().trim() === word);

           if (othersWithSameWord.length > 0) {
             points[userId] = (points[userId] || 0) + 1;
             roundPoints[userId] = (roundPoints[userId] || 0) + 1;
           } else {
             points[userId] = (points[userId] || 0) + 3;
             roundPoints[userId] = (roundPoints[userId] || 0) + 3;
           }
         });
       });

       updateGameState({ phase: 'results', points, roundPoints, action: null });
    }
    
    if (gameState.action === 'next_round' && gameState.phase === 'results') {
       const totalRounds = gameState.settings?.rounds || 3;
       if ((gameState.round || 1) >= totalRounds) {
         updateGameState({ phase: 'finished', action: null });
       } else {
         updateGameState({ phase: 'spin', round: (gameState.round || 1) + 1, action: null });
       }
    }
  }, [gameState.action, gameState.actionId, gameState.phase, gameState.endTime, gameState.round, gameState.points]);

  if (!gameState.phase) return <div>Caricamento...</div>;

  return (
    <GameLayoutTV 
      themeKey="nomi_cose_citta"
      leaderboard={gameState.phase !== 'finished' && gameState.phase !== 'results' ? <MiniLeaderboardTV players={players} animateUpdates={true} /> : undefined}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
      {gameState.phase !== 'finished' && gameState.phase !== 'results' && (
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 3} />
      )}

      {gameState.phase === 'spin' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '2rem' }}>Estrazione Lettera...</h1>
          <div style={{ fontSize: 'clamp(8rem, 15vw, 15rem)', fontWeight: 'bold', color: 'var(--color-primary)', textShadow: '0 0 20px var(--color-primary)' }}>
            {displayedLetter}
          </div>
        </motion.div>
      )}

      {gameState.phase === 'write' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
          <div style={{ fontSize: 'clamp(4rem, 8vw, 8rem)', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '2rem' }}>
            Lettera {gameState.letter}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <div key={cat} style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '1rem', fontSize: 'clamp(1.2rem, 2vw, 2rem)' }}>
                {cat}
              </div>
            ))}
          </div>

          <div style={{ width: '80%', margin: '4rem auto 0 auto' }}>
            <ProgressBar durationMs={(gameState.settings?.duration || 60) * 1000} startTime={gameState.endTime - (gameState.settings?.duration || 60) * 1000} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
             {Object.keys(players).map(pId => {
                const player = players[pId];
                const isReady = gameState.readyPlayers?.[pId];
                return (
                  <div key={pId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: isReady ? 1 : 0.5 }}>
                    <Avatar photo={player.photo} name={player.name} size={60} />
                    <span style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{player.name}</span>
                    <span style={{ color: isReady ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {isReady ? '✓ Pronto' : '✗ Non pronto'}
                    </span>
                  </div>
                );
             })}
          </div>
        </motion.div>
      )}

      {gameState.phase === 'validate' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', maxWidth: '1400px' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-primary)', marginBottom: '2rem' }}>L'Admin sta correggendo...</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxHeight: '70vh', overflowY: 'auto', padding: '1rem' }}>
            {CATEGORIES.map(cat => {
               const submissions = Object.keys(players).map(pId => {
                 const rawWord = gameState.answers?.[pId]?.[cat];
                 const word = (rawWord || '').toLowerCase().trim();
                 return { pId, word: word || '-' };
               });

               return (
                 <div key={cat} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>{cat}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                         {submissions.map((sub: any, i) => {
                            const player = players[sub.pId];
                            const startsWithLetter = sub.word.startsWith(gameState.letter?.toLowerCase() || 'a');
                            const isValid = gameState.validations?.[cat]?.[sub.pId] ?? startsWithLetter;
                            
                            return (
                              <div 
                                key={i} 
                                style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  padding: '0.8rem 1rem',
                                  borderRadius: '0.5rem',
                                  background: isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  border: `1px solid ${isValid ? 'var(--color-success)' : 'var(--color-danger)'}`,
                                }}
                              >
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', opacity: isValid ? 1 : 0.6 }}>
                                   <Avatar photo={player?.photo} name={player?.name || 'Sconosciuto'} size={40} />
                                   <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{player?.name}</span>
                                 </div>
                                 <span style={{ 
                                   fontSize: '1.8rem', 
                                   fontWeight: 'bold',
                                   color: isValid ? 'var(--color-success)' : 'var(--color-danger)',
                                   textDecoration: isValid ? 'none' : 'line-through'
                                 }}>
                                   {sub.word.toUpperCase()}
                                 </span>
                              </div>
                            );
                         })}
                      </div>
                 </div>
               )
            })}
          </div>
        </motion.div>
      )}

      {gameState.phase === 'results' && (
        <RoundLeaderboardTV 
          players={players} 
          points={gameState.points || {}} 
          roundPoints={gameState.roundPoints || {}} 
          roundName={`Round ${gameState.round || 1}`}
        />
      )}

      {gameState.phase === 'finished' && (
        <PodiumTV players={players} points={gameState.points || {}} />
      )}
        </div>
    </GameLayoutTV>
  );
}
