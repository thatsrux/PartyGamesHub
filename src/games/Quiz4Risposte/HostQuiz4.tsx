import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import GameTitleTV from '../../components/shared/GameTitleTV';
import LoadingScreen from '../../components/shared/LoadingScreen';

import { getCategoryColor } from '../../utils/categories';
import allQuestions from '../../data/quiz4.json';
import { getServerTime } from '../../utils/serverTime';

export default function HostQuiz4({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const allQ = allQuestions as any[];
      const excludedCategories = gameState.settings?.excludedCategories || [];
      const filteredQ = allQ.filter(q => !excludedCategories.includes(q.category));
      const availableQ = filteredQ.length > 0 ? filteredQ : allQ;
      const totalRounds = Math.min(gameState.settings?.rounds || 5, availableQ.length);
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
        startTime: getServerTime()
      });
    }
  }, [lobby]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoundEnd = () => {
    const playerIds = Object.keys(players);
    const durationMs = (gameState.settings?.duration || 15) * 1000;
    const startTime = gameState.startTime || getServerTime();

    playerIds.forEach(id => {
      const pAnswer = gameState.answers?.[id];
      if (pAnswer !== undefined && pAnswer.answer === gameState.question.correctIndex) {
        // Calcolo bonus velocità
        const timeTaken = pAnswer.time - startTime;
        let speedBonus = 0;
        if (timeTaken < durationMs) {
          // Bonus lineare fino a +100
          speedBonus = Math.floor(100 * (1 - (timeTaken / durationMs)));
        }
        updatePlayerScore(id, 100 + speedBonus);
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

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal') {
      const totalRounds = gameState.totalRounds || gameState.settings?.rounds || 5;
      if (gameState.questionIndex < totalRounds - 1) {
        const nextIndex = gameState.questionIndex + 1;
        const sequence = gameState.sequence || [];
        
        const allQ = allQuestions as any[];
        const excludedCategories = gameState.settings?.excludedCategories || [];
        const filteredQ = allQ.filter(q => !excludedCategories.includes(q.category));
        const availableQ = filteredQ.length > 0 ? filteredQ : allQ;

        const nextQIndex = sequence[nextIndex] !== undefined ? sequence[nextIndex] : Math.floor(Math.random() * availableQ.length);
        const nextQ = availableQ[nextQIndex];

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

  const optionColors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e']; // Red, Blue, Yellow, Green

  return (
    <GameLayoutTV 
      themeKey="quiz4"
      customBackground={gameState.question ? getCategoryColor(gameState.question.category) : undefined}
      leaderboard={gameState.phase !== 'finished' ? <MiniLeaderboardTV players={players} animateUpdates={true} /> : undefined}
    >
      {gameState.phase !== 'finished' && (
        <RoundTracker 
          current={(gameState.questionIndex || 0) + 1} 
          total={gameState.totalRounds || gameState.settings?.rounds || 5} 
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        
        {gameState.phase !== 'finished' && <GameTitleTV title="Quiz 4 Risposte" icon="⭐" themeKey="quiz4" />}

        <div className="panel" style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {gameState.phase === 'question' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {currentQ.category && (
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '2rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}>
                    {currentQ.category}
                  </div>
                )}
                <h2 style={{ 
                fontSize: '3.5rem', 
                marginBottom: '3rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '2.5rem',
                borderRadius: '2rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                fontWeight: 800,
                textAlign: 'center'
                }}>"{currentQ.question}"</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', maxWidth: '1000px' }}>
                    {currentQ.options.map((opt: string, idx: number) => (
                        <div key={idx} style={{
                            background: optionColors[idx],
                            padding: '1.5rem',
                            borderRadius: '1.5rem',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                        }}>
                            {opt}
                        </div>
                    ))}
                </div>

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
            </div>
            
            <ProgressBar startTime={gameState.startTime} 
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
              "{currentQ.question}"
            </h3>
            
            <div style={{
              background: optionColors[currentQ.correctIndex],
              padding: '1.5rem 3rem',
              borderRadius: '2rem',
              marginBottom: '2rem',
              boxShadow: `0 0 40px ${optionColors[currentQ.correctIndex]}80`,
              border: '2px solid white'
            }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', margin: 0 }}>
                {currentQ.options[currentQ.correctIndex]}
              </h2>
            </div>
            
            <div style={{ marginTop: '2rem', width: '100%', maxWidth: '800px' }}>
              <h3>Risultati:</h3>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  const pAnsObj = gameState.answers?.[id];
                  const pAnswer = pAnsObj?.answer;
                  const correct = pAnswer === currentQ.correctIndex;
                  const startTime = gameState.startTime || 0;
                  const durationMs = (gameState.settings?.duration || 15) * 1000;
                  
                  let points = 0;
                  if(correct && pAnsObj) {
                     const timeTaken = pAnsObj.time - startTime;
                     points = 100;
                     if(timeTaken < durationMs) points += Math.floor(100 * (1 - (timeTaken / durationMs)));
                  }

                  return (
                    <li key={id} style={{ 
                      fontSize: '1.8rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      background: pAnswer !== undefined ? (correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'rgba(255,255,255,0.05)', 
                      padding: '1rem 2rem', 
                      borderRadius: '1.5rem', 
                      width: '100%',
                      justifyContent: 'space-between',
                      border: pAnswer !== undefined ? (correct ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)') : '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Avatar photo={p.photo} name={p.name} size={48} />
                        <span style={{ fontWeight: 'bold' }}>{p.name}</span> 
                        {pAnswer !== undefined && !correct && (
                            <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)' }}>
                                ({currentQ.options[pAnswer]})
                            </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 800, color: pAnswer !== undefined ? (correct ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--color-warning)' }}>
                        {pAnswer !== undefined ? (correct ? `✅ +${points}` : '❌ 0') : '⏳ 0'}
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
