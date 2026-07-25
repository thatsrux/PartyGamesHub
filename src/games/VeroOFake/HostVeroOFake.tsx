import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';

import allQuestions from '../../data/vero_falso.json';
export default function HostVeroOFake({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  // Initialize game state if not set
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const allQ = allQuestions as any[];
      const selectedCategory = gameState.settings?.veroCategory;
      const filteredQ = selectedCategory && selectedCategory !== 'Tutte' 
        ? allQ.filter(q => q.category === selectedCategory) 
        : allQ;
      
      const availableQ = filteredQ.length > 0 ? filteredQ : allQ;
      const totalRounds = Math.min(gameState.settings?.rounds || 10, availableQ.length);
      const sequence: number[] = [];
      
      while(sequence.length < totalRounds) {
        const rand = Math.floor(Math.random() * availableQ.length);
        if(!sequence.includes(rand)) sequence.push(rand);
      }

      updateGameState({
        phase: 'question',
        questionIndex: 0,
        totalRounds: totalRounds,
        sequence: sequence,
        question: availableQ[sequence[0]],
        answers: {},
        startTime: Date.now()
      });
    }
  }, [lobby]);

  const handleRoundEnd = () => {
    const playerIds = Object.keys(players);
    playerIds.forEach(id => {
      if (gameState.answers?.[id] === gameState.question.answer) {
        updatePlayerScore(id, 100);
      }
    });
    updateGameState({ phase: 'reveal' });
  };

  useEffect(() => {
    if (gameState.phase === 'question') {
      const playerIds = Object.keys(players);
      const allAnswered = playerIds.length > 0 && playerIds.every(id => gameState.answers?.[id]);
      if (allAnswered) {
        handleRoundEnd();
      }
    }
  }, [players, gameState.phase, gameState.answers]);

  const handleNextRound = () => {
    const totalRounds = gameState.totalRounds || gameState.settings?.rounds || 10;
    if (currentQuestionIndex + 1 < totalRounds) {
      // Next question
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      updateGameState({
        phase: 'question',
        questionIndex: newIndex,
        question: allQuestions[gameState.sequence[newIndex]],
        startTime: Date.now(),
        answers: {}
      });
    } else {
      // Game over
      updateGameState({ phase: 'finished' });
    }
  };

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal') {
      const totalRounds = gameState.totalRounds || gameState.settings?.rounds || 10;
      if (gameState.questionIndex < totalRounds - 1) {
        const nextIndex = gameState.questionIndex + 1;
        const sequence = gameState.sequence || [];
        
        const allQ = allQuestions as any[];
        const selectedCategory = gameState.settings?.veroCategory;
        const filteredQ = selectedCategory && selectedCategory !== 'Tutte' 
          ? allQ.filter(q => q.category === selectedCategory) 
          : allQ;
        const availableQ = filteredQ.length > 0 ? filteredQ : allQ;

        const nextQIndex = sequence[nextIndex] !== undefined ? sequence[nextIndex] : Math.floor(Math.random() * availableQ.length);
        const nextQ = availableQ[nextQIndex];

        updateGameState({
          phase: 'question',
          questionIndex: nextIndex,
          question: nextQ,
          answers: null,
          action: null,
          startTime: Date.now()
        });
      } else {
        // Game over
        updateGameState({ phase: 'finished' });
      }
    }
  }, [gameState.action, gameState.actionId]);

  const currentQ = gameState.question || { text: 'Caricamento...', answer: 'vero' };

  if (!currentQ) return <div>Caricamento...</div>;

  return (
    <GameLayoutTV themeKey="vero_o_fake">
      
      {gameState.phase !== 'finished' && (
        <>
          <RoundTracker 
            current={(gameState.questionIndex || 0) + 1} 
            total={gameState.totalRounds || gameState.settings?.rounds || 10} 
          />
          <MiniLeaderboardTV players={players} animateUpdates={true} />
        </>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ 
            fontSize: '5rem', 
            marginBottom: '3rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0px 10px 20px rgba(0,0,0,0.3)'
          }}
        >
          Vero o Falso?
        </motion.h1>

        <div className="panel" style={{ maxWidth: '1200px', width: '90%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {gameState.phase === 'question' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ 
              fontSize: '3.5rem', 
              marginBottom: '2rem',
              background: 'rgba(255,255,255,0.05)',
              padding: '2.5rem',
              borderRadius: '2rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              fontWeight: 800
            }}>"{currentQ.text}"</h2>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => {
                return (
                  <div key={id} style={{ 
                    padding: '0.75rem 1.5rem', 
                    background: gameState.answers?.[id] ? 'var(--color-success)' : 'rgba(255,255,255,0.05)', 
                    borderRadius: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: gameState.answers?.[id] ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <Avatar photo={p.photo} name={p.name} size={36} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {p.name} {gameState.answers?.[id] && '✓'}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <ProgressBar 
              key={`progress-${gameState.questionIndex}`} 
              durationMs={(gameState.settings?.duration || 15) * 1000} 
              onComplete={handleRoundEnd} 
            />
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ 
              fontSize: '2.5rem', 
              color: 'white', 
              marginBottom: '1.5rem',
              textAlign: 'center',
              maxWidth: '900px',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              "{currentQ.text}"
            </h3>
            <div style={{
              background: currentQ.answer === 'vero' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${currentQ.answer === 'vero' ? 'var(--color-success)' : 'var(--color-danger)'}`,
              boxShadow: `0 0 40px ${currentQ.answer === 'vero' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              padding: '2rem 4rem',
              borderRadius: '2rem',
              marginBottom: '3rem'
            }}>
              <h2 style={{ fontSize: '4rem', fontWeight: 900, color: currentQ.answer === 'vero' ? 'var(--color-success)' : 'var(--color-danger)', textTransform: 'uppercase', margin: 0 }}>
                È {currentQ.answer}!
              </h2>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <h3>Risultati:</h3>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  const pAnswer = gameState.answers?.[id];
                  const correct = pAnswer === currentQ.answer;
                  return (
                    <li key={id} style={{ 
                      fontSize: '1.8rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      background: pAnswer ? (correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'rgba(255,255,255,0.05)', 
                      padding: '1rem 2rem', 
                      borderRadius: '1.5rem', 
                      width: '100%',
                      maxWidth: '600px',
                      justifyContent: 'space-between',
                      border: pAnswer ? (correct ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)') : '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Avatar photo={p.photo} name={p.name} size={48} />
                        <span style={{ fontWeight: 'bold' }}>{p.name}</span> 
                      </div>
                      <span style={{ fontWeight: 800, color: pAnswer ? (correct ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--color-warning)' }}>
                        {pAnswer ? (correct ? '✅ +100' : '❌ 0') : '⏳ 0'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
            
            <p style={{ marginTop: '3rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }} className="animate-pulse">
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
