import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';

import falsarioQuestions from '../../data/falsario.json';
import LoadingScreen from '../../components/shared/LoadingScreen';

export default function HostFalsario({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  // Initialize
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const allQ = falsarioQuestions as any[];
      // Filter by category if setting exists, else use all
      const selectedCategory = gameState.settings?.falsarioCategory;
      const filteredQ = selectedCategory && selectedCategory !== 'Tutte' 
        ? allQ.filter(q => q.category === selectedCategory) 
        : allQ;
      
      const availableQ = filteredQ.length > 0 ? filteredQ : allQ;
      const sequence: number[] = [];
      const totalRounds = Math.min(gameState.settings?.rounds || 5, availableQ.length);
      
      while(sequence.length < totalRounds) {
        const rand = Math.floor(Math.random() * availableQ.length);
        if(!sequence.includes(rand)) sequence.push(rand);
      }
      
      updateGameState({
        phase: 'write_lie',
        round: 1,
        totalRounds: totalRounds,
        sequence: sequence,
        question: availableQ[sequence[0]],
        lies: {},
        votes: {},
        startTime: Date.now()
      });
    }
  }, [lobby]);

  // Transition from write_lie to vote
  useEffect(() => {
    if (gameState.phase === 'write_lie') {
      const playerIds = Object.keys(players);
      const allLies = playerIds.length > 0 && playerIds.every(id => gameState.lies?.[id]);
      if (allLies) {
        handleGoToVote();
      }
    }
  }, [players, gameState.phase, gameState.lies]);

  const handleGoToVote = () => {
    // We want the original casing where possible, but for simplicity let's just use what they wrote
    const finalOptions = Array.from(new Set([
      gameState.question.truth,
      ...(Object.values(gameState.lies || {}) as string[])
    ])).sort(() => 0.5 - Math.random());

    updateGameState({
      phase: 'vote',
      options: finalOptions,
      startTime: Date.now()
    });
  };

  // Transition from vote to reveal
  useEffect(() => {
    if (gameState.phase === 'vote') {
      const playerIds = Object.keys(players);
      const allVoted = playerIds.length > 0 && playerIds.every(id => gameState.votes?.[id]);
      if (allVoted) {
        handleGoToReveal();
      }
    }
  }, [players, gameState.phase, gameState.votes]);

  const handleGoToReveal = () => {
    const playerIds = Object.keys(players);
    const truth = gameState.question.truth;
    const lies = gameState.lies || {};
    const votes = gameState.votes || {};

    // Calculate score additions locally first to prevent Firebase race conditions
    const scoreAdditions: Record<string, number> = {};

    playerIds.forEach(voterId => {
      const votedAnswer = votes[voterId];
      
      if (votedAnswer === truth) {
        // Correct answer
        scoreAdditions[voterId] = (scoreAdditions[voterId] || 0) + 100;
      } else {
        // Find who wrote this lie
        playerIds.forEach(liarId => {
          if (lies[liarId] === votedAnswer && liarId !== voterId) {
            scoreAdditions[liarId] = (scoreAdditions[liarId] || 0) + 100;
          }
        });
      }
    });

    // Apply all score additions
    Object.entries(scoreAdditions).forEach(([id, points]) => {
      updatePlayerScore(id, points);
    });

    updateGameState({ phase: 'reveal' });
  };

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal') {
      const currentRound = gameState.round || 1;
      const totalRounds = gameState.totalRounds || 5;
      
      if (currentRound < totalRounds) {
        const sequence = gameState.sequence || [];
        const allQ = falsarioQuestions as any[];
        const selectedCategory = gameState.settings?.falsarioCategory;
        const filteredQ = selectedCategory && selectedCategory !== 'Tutte' 
          ? allQ.filter(q => q.category === selectedCategory) 
          : allQ;
        const availableQ = filteredQ.length > 0 ? filteredQ : allQ;
        
        const nextQIndex = sequence[currentRound] !== undefined ? sequence[currentRound] : Math.floor(Math.random() * availableQ.length);
        const nextQ = availableQ[nextQIndex];

        updateGameState({
          phase: 'write_lie',
          round: currentRound + 1,
          question: nextQ,
          lies: null,
          votes: null,
          options: null,
          action: null,
          startTime: Date.now()
        });
      } else {
        updateGameState({ phase: 'finished', action: null });
      }
    }
  }, [gameState.action, gameState.actionId, gameState.phase]);


  if (!gameState.phase) return <LoadingScreen message="Caricamento in corso..." />;

  return (
    <GameLayoutTV 
      themeKey="falsario"
      leaderboard={gameState.phase !== 'finished' ? <MiniLeaderboardTV players={players} animateUpdates={true} /> : undefined}
    >
      
      {gameState.phase !== 'finished' && (
        <RoundTracker current={gameState.round || 1} total={gameState.totalRounds || 5} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '4rem', marginBottom: '2rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Il Falsario 🤥
        </motion.h1>

        <div className="panel" style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {gameState.phase === 'write_lie' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
                Completa la frase con una bugia credibile
              </h2>
              <h1 style={{ 
                fontSize: '3.5rem', 
                fontWeight: '900',
                color: 'white', 
                background: 'rgba(255,255,255,0.1)',
                padding: '2rem 4rem',
                borderRadius: '1.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.15)',
                margin: 0
              }}>
                "{gameState.question?.text}"
              </h1>
            </div>
            
            <ProgressBar durationMs={(gameState.settings?.duration || 60) * 1000} onComplete={handleGoToVote} />

            <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => (
                <div key={id} style={{ 
                  padding: '1rem',
                  background: gameState.lies?.[id] ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  opacity: gameState.lies?.[id] ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <Avatar photo={p.photo} name={p.name} size={48} />
                  <span style={{ fontWeight: 'bold' }}>{gameState.lies?.[id] ? 'Bugia Pronta ✓' : 'Sta scrivendo...'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'vote' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
                Qual è la verità?
              </h2>
              <h1 style={{ 
                fontSize: '3.5rem', 
                fontWeight: '900',
                color: 'white', 
                background: 'rgba(255,255,255,0.1)',
                padding: '2rem 4rem',
                borderRadius: '1.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.15)',
                margin: 0
              }}>
                "{gameState.question?.text}"
              </h1>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
              {gameState.options?.map((opt: string, i: number) => (
                <div key={i} style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '1.5rem 3rem', 
                  borderRadius: '1rem',
                  fontSize: '2rem',
                  border: '2px solid rgba(255,255,255,0.2)'
                }}>
                  {opt}
                </div>
              ))}
            </div>

            <ProgressBar durationMs={30000} onComplete={handleGoToReveal} />

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {Object.entries(players).map(([id, p]: any) => (
                <div key={id} style={{ opacity: gameState.votes?.[id] ? 1 : 0.3 }}>
                  <Avatar photo={p.photo} name={p.name} size={48} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>La Verità era:</h2>
            <h1 style={{ fontSize: '4rem', textTransform: 'uppercase', color: 'white', background: 'var(--color-success)', padding: '1.5rem 3rem', borderRadius: '24px', display: 'inline-block', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', marginBottom: '4rem', textAlign: 'center' }}>
              {gameState.question?.truth}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch' }}>
              {Object.entries(players).map(([id, p]: any, index: number) => {
                const votedFor = gameState.votes?.[id];
                const guessedTruth = votedFor === gameState.question.truth;
                
                let liarName = '';
                if (!guessedTruth) {
                  const liarEntry = Object.entries(gameState.lies || {}).find(([_, lie]) => lie === votedFor);
                  if (liarEntry && liarEntry[0] !== id) {
                    liarName = players[liarEntry[0]]?.name || 'nessuno';
                  } else {
                    liarName = 'se stesso';
                  }
                }
                
                return (
                  <motion.div 
                    key={id} 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.3, type: 'spring' }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.5rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '1.5rem 2rem', 
                      borderRadius: '16px',
                      borderLeft: `6px solid ${guessedTruth ? 'var(--color-success)' : 'var(--color-danger)'}`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Avatar photo={p.photo} name={p.name} size={64} />
                    
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.6rem', color: 'white', marginBottom: '0.4rem' }}>{p.name}</h3>
                      {guessedTruth ? (
                        <p style={{ color: 'var(--color-success)', fontSize: '1.2rem', fontWeight: '500' }}>Ha indovinato la verità!</p>
                      ) : (
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
                          È caduto nella trappola di <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{liarName}</span>!
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '0.8rem 1.2rem', borderRadius: '12px', minWidth: '120px' }}>
                       {guessedTruth ? (
                         <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-success)' }}>
                           +100 pt
                         </span>
                       ) : (
                         <>
                           <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>
                             0 pt
                           </span>
                           {liarName !== 'nessuno' && liarName !== 'se stesso' && (
                             <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--color-danger)', marginTop: '0.4rem' }}>
                               +100 a {liarName}
                             </span>
                           )}
                         </>
                       )}
                    </div>
                  </motion.div>
                );
              })}
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
