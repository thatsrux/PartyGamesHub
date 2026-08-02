import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import LoadingScreen from '../../components/shared/LoadingScreen';

import { piuVicinoQuestions } from './data';
import { getServerTime } from '../../utils/serverTime';

export default function HostPiuVicino({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const availableQ = [...piuVicinoQuestions];
      const totalRounds = Math.min(gameState.settings?.rounds || 5, availableQ.length);
      const sequence: number[] = [];
      
      while(sequence.length < totalRounds) {
        const rand = Math.floor(Math.random() * availableQ.length);
        if(!sequence.includes(rand)) sequence.push(rand);
      }

      const baseQ = availableQ[sequence[0]];
      const span = baseQ.max - baseQ.min;
      const shift = Math.round((Math.random() * 0.6 - 0.3) * span);
      let newMin = baseQ.min + shift;
      let newMax = baseQ.max + shift;
      if (newMin >= baseQ.answer) newMin = baseQ.answer - Math.max(1, Math.round(span * 0.1));
      if (newMax <= baseQ.answer) newMax = baseQ.answer + Math.max(1, Math.round(span * 0.1));

      updateGameState({
        phase: 'question',
        questionIndex: 0,
        totalRounds: totalRounds,
        sequence: sequence,
        question: { ...baseQ, min: newMin, max: newMax },
        answers: {},
        startTime: getServerTime()
      });
    }
  }, [lobby]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoundEnd = () => {
    const playerIds = Object.keys(players);
    const q = gameState.question;
    const maxDiff = q.max - q.min;

    playerIds.forEach(id => {
      const pAnswer = gameState.answers?.[id];
      if (pAnswer !== undefined) {
        const diff = Math.abs(pAnswer - q.answer);
        const normalizedDiff = diff / maxDiff;
        let points = Math.floor(100 * Math.exp(-25 * Math.pow(normalizedDiff, 2)));
        if (diff === 0) points += 50;
        updatePlayerScore(id, points);
      }
    });
    updateGameState({ phase: 'reveal' });
  };

  useEffect(() => {
    if (gameState.phase === 'question') {
      const playerIds = Object.keys(players);
      const allAnswered = playerIds.length > 0 && playerIds.every(id => gameState.answers?.[id] !== undefined);
      if (allAnswered) {
        handleRoundEnd();
      }
    }
  }, [players, gameState.phase, gameState.answers]);

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal') {
      const totalRounds = gameState.totalRounds || gameState.settings?.rounds || 5;
      if (gameState.questionIndex < totalRounds - 1) {
        const nextIndex = gameState.questionIndex + 1;
        const sequence = gameState.sequence || [];
        const availableQ = [...piuVicinoQuestions];

        const nextQIndex = sequence[nextIndex] !== undefined ? sequence[nextIndex] : Math.floor(Math.random() * availableQ.length);
        const baseQ = availableQ[nextQIndex];
        const span = baseQ.max - baseQ.min;
        const shift = Math.round((Math.random() * 0.6 - 0.3) * span);
        let newMin = baseQ.min + shift;
        let newMax = baseQ.max + shift;
        if (newMin >= baseQ.answer) newMin = baseQ.answer - Math.max(1, Math.round(span * 0.1));
        if (newMax <= baseQ.answer) newMax = baseQ.answer + Math.max(1, Math.round(span * 0.1));
        const nextQ = { ...baseQ, min: newMin, max: newMax };

        updateGameState({
          phase: 'question',
          questionIndex: nextIndex,
          question: nextQ,
          answers: null,
          action: null,
          startTime: getServerTime()
        });
      } else {
        updateGameState({ phase: 'finished' });
      }
    }
  }, [gameState.action, gameState.actionId]);

  const currentQ = gameState.question;

  if (!currentQ) return <LoadingScreen message="Caricamento in corso..." />;

  // Ordinamento per vicinanza durante la fase reveal
  const sortedPlayers = Object.entries(players).sort((a: any, b: any) => {
    const ansA = gameState.answers?.[a[0]];
    const ansB = gameState.answers?.[b[0]];
    if (ansA === undefined && ansB === undefined) return 0;
    if (ansA === undefined) return 1;
    if (ansB === undefined) return -1;
    return Math.abs(ansA - currentQ.answer) - Math.abs(ansB - currentQ.answer);
  });

  return (
    <GameLayoutTV 
      themeKey="piu_vicino"
      leaderboard={gameState.phase !== 'finished' ? <MiniLeaderboardTV players={players} animateUpdates={true} /> : undefined}
    >
      {gameState.phase !== 'finished' && (
        <RoundTracker 
          current={(gameState.questionIndex || 0) + 1} 
          total={gameState.totalRounds || gameState.settings?.rounds || 5} 
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ 
            fontSize: '5rem', 
            marginBottom: '2rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0px 10px 20px rgba(0,0,0,0.3)'
          }}
        >
          Più Vicino Vince
        </motion.h1>

        <div className="panel" style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {gameState.phase === 'question' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ 
                fontSize: '3.5rem', 
                marginBottom: '1rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '2.5rem',
                borderRadius: '2rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                fontWeight: 800,
                textAlign: 'center'
                }}>"{currentQ.question}"</h2>

                <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)', marginBottom: '3rem' }}>
                   Da {currentQ.min} a {currentQ.max} {currentQ.unit || ''}
                </p>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {Object.entries(players).map(([id, p]: any) => {
                    return (
                    <div key={id} style={{ 
                        padding: '0.75rem 1.5rem', 
                        background: gameState.answers?.[id] !== undefined ? 'var(--color-success)' : 'rgba(255,255,255,0.05)', 
                        borderRadius: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: gameState.answers?.[id] !== undefined ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s ease'
                    }}>
                        <Avatar photo={p.photo} name={p.name} size={36} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {p.name} {gameState.answers?.[id] !== undefined && '✓'}
                        </span>
                    </div>
                    )
                })}
                </div>
            </div>
            
            <ProgressBar startTime={gameState.startTime} 
              key={`progress-${gameState.questionIndex}`} 
              durationMs={(gameState.settings?.duration || 20) * 1000} 
              onComplete={handleRoundEnd} 
            />
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ 
              fontSize: '2.5rem', 
              color: 'white', 
              marginBottom: '1rem',
              textAlign: 'center',
              maxWidth: '900px',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              "{currentQ.question}"
            </h3>
            
            <div style={{
              background: 'rgba(245, 158, 11, 0.2)',
              padding: '1.5rem 3rem',
              borderRadius: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)',
              border: '2px solid var(--color-primary)'
            }}>
              <h2 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0 }}>
                {currentQ.answer} {currentQ.unit || ''}
              </h2>
            </div>
            
            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '800px' }}>
              <h3>Classifica Round:</h3>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                {sortedPlayers.map(([id, p]: any, index: number) => {
                  const pAnswer = gameState.answers?.[id];
                  const diff = pAnswer !== undefined ? Math.abs(pAnswer - currentQ.answer) : null;
                  let points = 0;
                  if (diff !== null) {
                      const normalizedDiff = diff / (currentQ.max - currentQ.min);
                      points = Math.floor(100 * Math.exp(-25 * Math.pow(normalizedDiff, 2)));
                      if (diff === 0) points += 50;
                  }
                  
                  return (
                    <li key={id} style={{ 
                      fontSize: '1.8rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      background: index === 0 && pAnswer !== undefined ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255,255,255,0.05)', 
                      padding: '1rem 2rem', 
                      borderRadius: '1.5rem', 
                      width: '100%',
                      justifyContent: 'space-between',
                      border: index === 0 && pAnswer !== undefined ? '1px solid rgba(250, 204, 21, 0.5)' : '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.5rem', width: '30px', textAlign: 'center', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' }}>#{index + 1}</span>
                        <Avatar photo={p.photo} name={p.name} size={48} />
                        <span style={{ fontWeight: 'bold' }}>{p.name}</span> 
                        {pAnswer !== undefined && (
                            <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginLeft: '1rem' }}>
                                (Ha detto {pAnswer})
                            </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 800, color: pAnswer !== undefined && points > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {pAnswer !== undefined ? `+${points}` : '0'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
            
            <p style={{ marginTop: '2rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }} className="animate-pulse">
              In attesa che l'Admin passi al prossimo round...
            </p>
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
