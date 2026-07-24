import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';

const secretWords = [
  "Fuorigioco", "Calcio di Rigore", "VAR", "Mondiale", "Pallone d'Oro", 
  "Rovesciata", "Triplete", "Scudetto", "Derby", "Calciomercato",
  "Champions League", "Cartellino Rosso", "Portiere", "Cucchiaio", "Capitano"
];

export default function HostImpostore({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  // Initialize game state
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const playerIds = Object.keys(players);
      if (playerIds.length === 0) return;
      
      const imposterId = playerIds[Math.floor(Math.random() * playerIds.length)];
      const secretWord = secretWords[Math.floor(Math.random() * secretWords.length)];
      
      const roles: Record<string, string> = {};
      playerIds.forEach(id => {
        roles[id] = id === imposterId ? 'imposter' : 'innocent';
      });

      updateGameState({
        phase: 'reveal_roles',
        roles,
        secretWord,
        startTime: Date.now(),
        votes: {}
      });
    }
  }, [lobby]);

  // Handle phase transitions
  useEffect(() => {
    if (gameState.action === 'start_discussion' && gameState.phase === 'reveal_roles') {
      updateGameState({
        phase: 'discussion',
        startTime: Date.now(),
        action: null
      });
    } else if (gameState.action === 'start_voting' && gameState.phase === 'discussion') {
      updateGameState({
        phase: 'voting',
        startTime: Date.now(),
        action: null
      });
    }
  }, [gameState.action, gameState.phase]);

  // Check voting completion
  useEffect(() => {
    if (gameState.phase === 'voting') {
      const playerIds = Object.keys(players);
      const allVoted = playerIds.length > 0 && playerIds.every(id => gameState.votes?.[id]);
      if (allVoted) {
        handleVotingEnd();
      }
    }
  }, [players, gameState.phase, gameState.votes]);

  const handleVotingEnd = () => {
    const playerIds = Object.keys(players);
    const imposterId = playerIds.find(id => gameState.roles?.[id] === 'imposter');
    
    if (!imposterId) return;

    // Tally votes
    const voteCounts: Record<string, number> = {};
    Object.values(gameState.votes || {}).forEach((votedFor: any) => {
      voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
    });

    let maxVotes = 0;
    let mostVotedIds: string[] = [];
    
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedIds = [id];
      } else if (count === maxVotes) {
        mostVotedIds.push(id);
      }
    });

    const imposterCaught = mostVotedIds.includes(imposterId) && mostVotedIds.length === 1;

    // Assign points
    playerIds.forEach(id => {
      if (gameState.roles?.[id] === 'imposter') {
        if (!imposterCaught) updatePlayerScore(id, 200); // Imposter wins
      } else {
        if (imposterCaught) updatePlayerScore(id, 100); // Innocents win
      }
    });

    updateGameState({ phase: 'results', imposterCaught, mostVotedIds });
  };

  const handleNextRound = () => {
    // Single round game for now, or could loop. Let's make it finish.
    updateGameState({ phase: 'finished', action: null });
  };

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'results') {
      handleNextRound();
    }
  }, [gameState.action, gameState.phase]);


  if (!gameState.phase) return <div>Caricamento...</div>;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '4rem', marginBottom: '2rem' }}>
        L'Impostore 🕵️‍♂️
      </motion.h1>

      <div className="panel" style={{ maxWidth: '1200px', width: '90%', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {gameState.phase === 'reveal_roles' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Guarda il tuo telefono!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.5rem' }}>
              Tutti hanno ricevuto una parola segreta... tranne uno.
            </p>
            <div style={{ marginTop: '3rem' }}>
              <p className="animate-pulse" style={{ color: 'var(--color-primary)' }}>In attesa che l'Admin avvii la discussione...</p>
            </div>
          </motion.div>
        )}

        {gameState.phase === 'discussion' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-warning)', marginBottom: '1rem' }}>Fase di Discussione</h2>
            <p style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>Fatevi delle domande e cercate di capire chi sta mentendo!</p>
            
            <ProgressBar durationMs={(gameState.settings?.duration || 60) * 1000} onComplete={() => updateGameState({ phase: 'voting', startTime: Date.now() })} />
            
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => (
                <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                  <Avatar photo={p.photo} name={p.name} size={64} />
                  <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'voting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-danger)' }}>Votate sul telefono!</h2>
            <p style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', margin: '1rem 0 3rem' }}>Chi è l'impostore?</p>
            
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => (
                <div key={id} style={{ 
                  padding: '1rem 2rem', 
                  background: gameState.votes?.[id] ? 'var(--color-success)' : 'rgba(255,255,255,0.1)', 
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  opacity: gameState.votes?.[id] ? 1 : 0.5
                }}>
                  <Avatar photo={p.photo} name={p.name} size={48} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {p.name} {gameState.votes?.[id] && '✓'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '3rem' }}>
              <ProgressBar durationMs={30000} onComplete={handleVotingEnd} />
            </div>
          </motion.div>
        )}

        {gameState.phase === 'results' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {gameState.imposterCaught ? (
              <h2 style={{ fontSize: '3rem', color: 'var(--color-success)' }}>L'impostore è stato catturato! 🎉</h2>
            ) : (
              <h2 style={{ fontSize: '3rem', color: 'var(--color-danger)' }}>L'impostore l'ha fatta franca! 😈</h2>
            )}
            
            <div style={{ margin: '3rem 0' }}>
              <h3 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>L'impostore era:</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  if (gameState.roles?.[id] === 'imposter') {
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(239, 68, 68, 0.2)', padding: '1rem 3rem', borderRadius: '2rem', border: '2px solid #ef4444' }}>
                        <Avatar photo={p.photo} name={p.name} size={80} />
                        <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{p.name}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '1rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Riepilogo Voti:</h4>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  const votedForId = gameState.votes?.[id];
                  const votedForName = votedForId ? players[votedForId]?.name : 'Nessuno';
                  return (
                    <div key={id} style={{ fontSize: '1.2rem', textAlign: 'left' }}>
                      <strong>{p.name}</strong> ha votato ➡️ <span style={{ color: 'var(--color-secondary)' }}>{votedForName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

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
