import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';

const questions = [
  { text: "Gary Lineker non ha mai preso un cartellino giallo in tutta la carriera", answer: "vero" },
  { text: "Un giocatore ha mai preso un cartellino rosso per aver risposto al cellulare in panchina?", answer: "vero" },
  { text: "Cristiano Ronaldo ha iniziato la sua carriera giocando come portiere", answer: "fake" },
  { text: "La partita con più gol nella storia è finita 149-0", answer: "vero" }
];

export default function HostVeroOFake({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  // Initialize game state if not set
  useEffect(() => {
    if (lobby && !gameState.phase) {
      updateGameState({
        phase: 'question',
        questionIndex: 0,
        startTime: Date.now()
      });
    }
  }, [lobby]);

  const handleRoundEnd = () => {
    const playerIds = Object.keys(players);
    playerIds.forEach(id => {
      if (gameState.answers?.[id] === questions[gameState.questionIndex].answer) {
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
    if (currentQuestionIndex + 1 < questions.length) {
      // Next question
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // Clear answers
      // We need to clear answers in players, wait, it's better if answers are in game_state
      // For simplicity, let's just use game_state.answers
      updateGameState({
        phase: 'question',
        questionIndex: newIndex,
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
      handleNextRound();
    }
  }, [gameState.action, gameState.actionId]);

  const currentQ = questions[gameState.questionIndex || 0];

  if (!currentQ) return <div>Caricamento...</div>;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ fontSize: '4rem', marginBottom: '3rem' }}
      >
        Vero o Fake?
      </motion.h1>

      <div className="panel" style={{ maxWidth: '1200px', width: '90%', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {gameState.phase === 'question' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{currentQ.text}</h2>
            <p style={{ color: 'var(--color-text-muted)' }} className="animate-pulse">
              Rispondete sul telefono!
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => (
                <div key={id} style={{ 
                  padding: '0.5rem 1rem', 
                  background: gameState.answers?.[id] ? 'var(--color-success)' : 'rgba(255,255,255,0.1)', 
                  borderRadius: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Avatar photo={p.photo} name={p.name} size={36} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {p.name} {gameState.answers?.[id] && '✓'}
                  </span>
                </div>
              ))}
            </div>
            
            <ProgressBar 
              key={`progress-${gameState.questionIndex}`} 
              durationMs={20000} 
              onComplete={handleRoundEnd} 
            />
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 style={{ fontSize: '3rem', color: currentQ.answer === 'vero' ? 'var(--color-success)' : 'var(--color-danger)', textTransform: 'uppercase' }}>
              È {currentQ.answer}!
            </h2>
            <div style={{ marginTop: '2rem' }}>
              <h3>Risultati:</h3>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  const pAnswer = gameState.answers?.[id];
                  const correct = pAnswer === currentQ.answer;
                  return (
                    <li key={id} style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 2rem', borderRadius: '1rem', width: 'fit-content' }}>
                      <Avatar photo={p.photo} name={p.name} size={40} />
                      <span style={{ fontWeight: 'bold' }}>{p.name}:</span> 
                      <span>{pAnswer ? (correct ? '✅ +100' : '❌ 0') : '⏳ Tempo scaduto'}</span>
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
          <PodiumTV players={players} />
        )}
      </div>
    </div>
  );
}
