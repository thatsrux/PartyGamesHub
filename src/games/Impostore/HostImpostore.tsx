import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';

import impostoreCategoriesData from '../../data/impostore_categories.json';
import footballersData from '../../data/footballers.json';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { getServerTime } from '../../utils/serverTime';

const fallbackWords = [
  "Fuorigioco", "Calcio di Rigore", "VAR", "Mondiale", "Pallone d'Oro", 
  "Rovesciata", "Triplete", "Scudetto", "Derby", "Calciomercato",
  "Champions League", "Cartellino Rosso", "Portiere", "Cucchiaio", "Capitano"
];

const getWordsForCategory = (category: string) => {
  if (category === 'Calciatori') {
    return footballersData.map((f: any) => f.name);
  }
  
  if (category && (impostoreCategoriesData as any)[category]) {
    return (impostoreCategoriesData as any)[category];
  }
  
  return fallbackWords;
};

export default function HostImpostore({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  const startNewRound = (roundNum: number) => {
    const playerIds = Object.keys(players);
    if (playerIds.length === 0) return;
    
    const requestedCount = gameState.settings?.impostorsCount || 1;
    const impostorsCount = Math.min(requestedCount, Math.max(1, playerIds.length - 1));
    
    const shuffledForImpostors = [...playerIds].sort(() => 0.5 - Math.random());
    const imposterIds = shuffledForImpostors.slice(0, impostorsCount);
    
    const category = gameState.settings?.impostoreCategory || 'Animali';
    const words = getWordsForCategory(category);
    
    const secretWordIndex = Math.floor(Math.random() * words.length);
    const secretWord = words[secretWordIndex];
    
    let hintWord = null;
    if (gameState.settings?.impostorHint) {
      const availableHints = words.filter((_: string, i: number) => i !== secretWordIndex);
      if (availableHints.length > 0) {
        hintWord = availableHints[Math.floor(Math.random() * availableHints.length)];
      }
    }
    
    const roles: Record<string, string> = {};
    playerIds.forEach(id => {
      roles[id] = imposterIds.includes(id) ? 'imposter' : 'innocent';
    });

    const speakingOrder = [...playerIds].sort(() => 0.5 - Math.random());

    updateGameState({
      phase: 'reveal_roles',
      round: roundNum,
      roles,
      secretWord,
      hintWord,
      speakingOrder,
      currentSpeakerIndex: 0,
      startTime: getServerTime(),
      votes: null,
      eliminatedIds: [],
      eliminatedThisRound: null,
      action: null,
      imposterCaught: null,
      mostVotedIds: null
    });
  };

  // Initialize game state
  useEffect(() => {
    if (lobby && !gameState.phase) {
      startNewRound(1);
    }
  }, [lobby]);

  // Handle phase transitions
  useEffect(() => {
    if (gameState.action === 'start_discussion' && gameState.phase === 'reveal_roles') {
      updateGameState({
        phase: 'speaking',
        startTime: getServerTime(),
        action: null
      });
    } else if (gameState.action === 'next_speaker' && gameState.phase === 'speaking') {
      const nextIndex = (gameState.currentSpeakerIndex || 0) + 1;
      if (nextIndex >= (gameState.speakingOrder || []).length) {
        // Everyone spoke, go to voting
        updateGameState({
          phase: 'voting',
          startTime: getServerTime(),
          action: null
        });
      } else {
        updateGameState({
          currentSpeakerIndex: nextIndex,
          startTime: getServerTime(), // Reset timer for next speaker if we add one, or just update state
          action: null
        });
      }
    } else if (gameState.action === 'start_voting' && (gameState.phase === 'speaking' || gameState.phase === 'discussion')) {
      updateGameState({
        phase: 'voting',
        startTime: getServerTime(),
        action: null
      });
    }
  }, [gameState.action, gameState.actionId, gameState.phase, gameState.currentSpeakerIndex, gameState.speakingOrder]);

  // Check voting completion
  useEffect(() => {
    if (gameState.phase === 'voting') {
      const playerIds = Object.keys(players);
      const eliminatedIds = gameState.eliminatedIds || [];
      const alivePlayerIds = playerIds.filter(id => !eliminatedIds.includes(id));
      const allVoted = alivePlayerIds.length > 0 && alivePlayerIds.every(id => gameState.votes?.[id]);
      if (allVoted) {
        handleVotingEnd();
      }
    }
  }, [players, gameState.phase, gameState.votes, gameState.eliminatedIds]);

  const handleVotingEnd = () => {
    const playerIds = Object.keys(players);
    const imposterIds = playerIds.filter(id => gameState.roles?.[id] === 'imposter');
    const eliminatedIds = gameState.eliminatedIds || [];
    
    if (imposterIds.length === 0) return;

    // Tally votes
    const voteCounts: Record<string, number> = {};
    Object.entries(gameState.votes || {}).forEach(([voterId, votedFor]: [string, any]) => {
      if (!eliminatedIds.includes(voterId) && !eliminatedIds.includes(votedFor)) {
        voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
      }
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

    const eliminatedThisRound = mostVotedIds.length === 1 ? mostVotedIds[0] : null;
    let newEliminatedIds = [...eliminatedIds];
    if (eliminatedThisRound) {
        newEliminatedIds.push(eliminatedThisRound);
    }
    
    const imposterCaught = eliminatedThisRound ? imposterIds.includes(eliminatedThisRound) : false;
    const alivePlayersCount = playerIds.length - newEliminatedIds.length;

    const gameWonByImposter = !imposterCaught && alivePlayersCount <= 2;

    if (imposterCaught) {
      playerIds.forEach(id => {
        if (gameState.roles?.[id] !== 'imposter') {
          updatePlayerScore(id, 100);
        }
      });
    } else if (gameWonByImposter) {
      playerIds.forEach(id => {
        if (gameState.roles?.[id] === 'imposter') {
          updatePlayerScore(id, 500);
        }
      });
    }

    updateGameState({ 
      phase: 'eliminated_reveal', 
      imposterCaught,
      gameWonByImposter,
      mostVotedIds, 
      eliminatedIds: newEliminatedIds, 
      eliminatedThisRound, 
      votes: null, 
      action: null 
    });
  };

  const handleNextRound = () => {
    const currentRound = gameState.round || 1;
    const totalRounds = gameState.settings?.rounds || 5;
    
    if (currentRound < totalRounds) {
      startNewRound(currentRound + 1);
    } else {
      updateGameState({ phase: 'finished', action: null });
    }
  };

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'results') {
      handleNextRound();
    }
  }, [gameState.action, gameState.actionId, gameState.phase]);


  if (!gameState.phase) return <LoadingScreen message="Caricamento in corso..." />;

  return (
    <GameLayoutTV 
      themeKey="impostore"
      leaderboard={gameState.phase !== 'finished' ? <MiniLeaderboardTV players={players} animateUpdates={true} /> : undefined}
    >
      
      {gameState.phase !== 'finished' && (
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} />
      )}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '4rem', marginBottom: '2rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          L'Impostore 🕵️‍♂️
        </motion.h1>

        <div className="panel" style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2rem' }}>
        
        {gameState.phase === 'reveal_roles' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>Guarda il tuo telefono!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.8rem', marginBottom: '3rem' }}>
              Tutti hanno ricevuto una parola segreta... tranne qualcuno.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ duration: 2, repeat: Infinity }}
                style={{ color: 'var(--color-secondary)', fontSize: '1.2rem' }}
              >
                In attesa che l'Admin avvii i turni di parola...
              </motion.p>
            </div>
          </motion.div>
        )}

        {gameState.phase === 'speaking' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3.5rem', color: 'var(--color-warning)', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Fase di Parola</h2>
            <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)', marginBottom: '4rem' }}>A turno, fornite un indizio (1 o 2 parole) che dimostri che conoscete la parola segreta!</p>
            
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', paddingTop: '3rem' }}>
              {(gameState.speakingOrder || []).map((id: string, index: number) => {
                const isCurrent = index === gameState.currentSpeakerIndex;
                const isEliminated = gameState.eliminatedIds?.includes(id);
                if (isEliminated) return null;

                return (
                  <motion.div 
                    key={id} 
                    animate={{ 
                      scale: isCurrent ? 1.2 : 0.8,
                      opacity: isCurrent ? 1 : 0.4,
                      y: isCurrent ? -20 : 0
                    }}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      position: 'relative'
                    }}
                  >
                    {isCurrent && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        style={{ position: 'absolute', top: '-3rem', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}
                      >
                        Parla ora 👇
                      </motion.div>
                    )}
                    <div style={{
                      borderRadius: '50%',
                      boxShadow: isCurrent ? '0 0 30px rgba(59, 130, 246, 0.6)' : 'none',
                      border: isCurrent ? '4px solid var(--color-primary)' : '4px solid transparent',
                      transition: 'all 0.3s ease'
                    }}>
                      <Avatar photo={players[id]?.photo} name={players[id]?.name} size={isCurrent ? 120 : 80} />
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: isCurrent ? '1.8rem' : '1.2rem', color: isCurrent ? 'white' : 'rgba(255,255,255,0.6)' }}>
                      {players[id]?.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'discussion' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3.5rem', color: 'var(--color-warning)', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Discussione Libera</h2>
            <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)', marginBottom: '4rem' }}>Confrontatevi! Chi ha dato un indizio sospetto?</p>
            
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.keys(players).map(id => {
                const isEliminated = gameState.eliminatedIds?.includes(id);
                if (isEliminated) return null;
                
                return (
                  <motion.div 
                    key={id} 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 + Math.random(), delay: Math.random() }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                  >
                    <div style={{ borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)' }}>
                      <Avatar photo={players[id]?.photo} name={players[id]?.name} size={90} />
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{players[id]?.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'voting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3.5rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>Votate sul telefono!</h2>
            <p style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>Chi volete eliminare?</p>
            
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => {
                if (gameState.eliminatedIds?.includes(id)) return null;
                const hasVoted = gameState.votes?.[id];
                
                return (
                  <div key={id} style={{ 
                    padding: '1rem 2rem', 
                    background: hasVoted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)', 
                    border: hasVoted ? '2px solid var(--color-success)' : '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    opacity: hasVoted ? 1 : 0.6,
                    transform: hasVoted ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <Avatar photo={p.photo} name={p.name} size={60} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {p.name} {hasVoted && '✅'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '4rem', maxWidth: '600px', margin: '4rem auto 0' }}>
              <ProgressBar durationMs={30000} startTime={gameState.startTime} onComplete={handleVotingEnd} />
            </div>
          </motion.div>
        )}

        {gameState.phase === 'eliminated_reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', color: 'white', marginBottom: '2rem' }}>La maggioranza ha deciso di eliminare...</h2>
            
            {gameState.eliminatedThisRound ? (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }} 
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 1 }}
                style={{ margin: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ border: '5px solid var(--color-danger)', borderRadius: '50%', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)' }}>
                  <Avatar 
                    photo={players[gameState.eliminatedThisRound]?.photo} 
                    name={players[gameState.eliminatedThisRound]?.name} 
                    size={150} 
                  />
                </div>
                <h1 style={{ fontSize: '4rem', color: 'var(--color-danger)', marginTop: '1.5rem', textTransform: 'uppercase' }}>
                  {players[gameState.eliminatedThisRound]?.name}
                </h1>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 2.5 }}
                  style={{ marginTop: '2rem', padding: '1.5rem 3rem', background: 'rgba(255,255,255,0.1)', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <p style={{ fontSize: '1.5rem', color: 'white', margin: 0 }}>Il suo ruolo era: <strong style={{ color: 'var(--color-primary)', fontSize: '2rem' }}>Innocente</strong></p>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 4 }}
                  style={{ fontSize: '2.5rem', color: 'var(--color-warning)', marginTop: '3rem' }}
                >
                  L'Impostore è ancora tra noi! 👀
                </motion.h2>
              </motion.div>
            ) : (
              <h2 style={{ fontSize: '3rem', color: 'var(--color-warning)', marginTop: '3rem' }}>Nessuno! Parità assoluta.</h2>
            )}
          </motion.div>
        )}

        {gameState.phase === 'results' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
            {gameState.imposterCaught ? (
              <h2 style={{ fontSize: '4rem', color: 'var(--color-success)', textShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>Impostore Smascherato! 🎉</h2>
            ) : (
              <h2 style={{ fontSize: '4rem', color: 'var(--color-danger)', textShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>L'impostore l'ha fatta franca! 😈</h2>
            )}
            
            <div style={{ margin: '4rem 0' }}>
              <h3 style={{ color: 'var(--color-text-muted)', fontSize: '1.8rem', marginBottom: '2rem' }}>
                {Object.values(gameState.roles || {}).filter(r => r === 'imposter').length > 1 ? 'Gli impostori erano:' : 'L\'impostore era:'}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  if (gameState.roles?.[id] === 'imposter') {
                    const wasCaught = gameState.eliminatedThisRound === id;
                    return (
                      <motion.div 
                        initial={{ scale: 0.5 }} 
                        animate={{ scale: 1 }}
                        key={id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1.5rem', 
                          background: wasCaught ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', 
                          padding: '1.5rem 3rem', 
                          borderRadius: '2rem', 
                          border: `3px solid ${wasCaught ? '#ef4444' : 'var(--color-primary)'}`,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                      >
                        <Avatar photo={p.photo} name={p.name} size={90} />
                        <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{p.name}</span>
                        {wasCaught && <span style={{ fontSize: '3rem' }}>❌</span>}
                      </motion.div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
              <h4 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontSize: '1.5rem' }}>Riepilogo Ultimi Voti:</h4>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  const votedForId = gameState.votes?.[id];
                  if (!votedForId) return null;
                  const votedForName = players[votedForId]?.name;
                  return (
                    <div key={id} style={{ fontSize: '1.3rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '1rem' }}>
                      <strong>{p.name}</strong> ➡️ <span style={{ color: 'var(--color-secondary)' }}>{votedForName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem 2.5rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
              >
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}
                />
                <p style={{ color: 'white', fontSize: '1.2rem', margin: 0, fontWeight: '500', letterSpacing: '1px' }}>
                  L'Admin sta scegliendo il prossimo round...
                </p>
              </motion.div>
            </div>
          </motion.div>
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
