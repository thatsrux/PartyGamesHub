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

import { ordinaQuestions } from './data';
import { getServerTime } from '../../utils/serverTime';
import { getCategoryColor } from '../../utils/categories';

// Funzione di shuffle (Fisher-Yates)
function shuffleArray(array: any[]) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

export default function HostOrdina({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  useEffect(() => {
    if (lobby && !gameState.phase) {
      let availableQ = [...ordinaQuestions];
      const excludedCategories = gameState.settings?.excludedCategories || [];
      if (excludedCategories.length > 0) {
        availableQ = availableQ.filter(q => !excludedCategories.includes(q.category || ''));
      }
      if (availableQ.length === 0) availableQ = [...ordinaQuestions]; // Fallback

      const totalRounds = Math.min(gameState.settings?.rounds || 5, availableQ.length);
      const sequence: number[] = [];
      
      while(sequence.length < totalRounds) {
        const rand = Math.floor(Math.random() * availableQ.length);
        if(!sequence.includes(rand)) sequence.push(rand);
      }

      const initialQ = availableQ[sequence[0]];

      updateGameState({
        phase: 'question',
        questionIndex: 0,
        totalRounds: totalRounds,
        sequence: sequence,
        question: initialQ,
        shuffledItems: shuffleArray(initialQ.items),
        answers: {},
        startTime: getServerTime()
      });
    }
  }, [lobby]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoundEnd = () => {
    const playerIds = Object.keys(players);
    const correctItems = gameState.question.items;

    playerIds.forEach(id => {
      const pAnswer = gameState.answers?.[id]; // Un array di stringhe ordinate dall'utente
      if (pAnswer && Array.isArray(pAnswer)) {
        let correctPositions = 0;
        for (let i = 0; i < correctItems.length; i++) {
            if (pAnswer[i] === correctItems[i]) {
                correctPositions++;
            }
        }
        
        // Calcola punti (es. 25 punti per ogni posizione corretta se sono 4 elementi = 100 max)
        const maxPoints = 100;
        const pointsPerItem = maxPoints / correctItems.length;
        let points = Math.floor(correctPositions * pointsPerItem);

        if (correctPositions === correctItems.length) {
            points += 50; // Bonus percorso netto
        }

        if (points > 0) {
            updatePlayerScore(id, points);
        }
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
        let availableQ = [...ordinaQuestions];
        const excludedCategories = gameState.settings?.excludedCategories || [];
        if (excludedCategories.length > 0) {
          availableQ = availableQ.filter(q => !excludedCategories.includes(q.category || ''));
        }
        if (availableQ.length === 0) availableQ = [...ordinaQuestions]; // Fallback

        const nextQIndex = sequence[nextIndex] !== undefined ? sequence[nextIndex] : Math.floor(Math.random() * availableQ.length);
        const nextQ = availableQ[nextQIndex];

        updateGameState({
          phase: 'question',
          questionIndex: nextIndex,
          question: nextQ,
          shuffledItems: shuffleArray(nextQ.items),
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

  return (
    <GameLayoutTV 
      themeKey="ordina"
      customBackground={gameState.question && gameState.phase !== 'finished' ? getCategoryColor(gameState.question.category) : undefined}
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
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.8))'
          }}
        >
          Ordina
        </motion.h1>

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
                fontSize: '3rem', 
                marginBottom: '2rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '2.5rem',
                borderRadius: '2rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                fontWeight: 800,
                textAlign: 'center',
                maxWidth: '900px'
                }}>"{currentQ.question}"</h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '1000px' }}>
                    {gameState.shuffledItems?.map((item: string, idx: number) => (
                        <motion.div key={idx} 
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
                            style={{
                                background: 'linear-gradient(135deg, #be123c 0%, #881337 100%)',
                                padding: '1rem 2rem',
                                borderRadius: '1rem',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'white',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            {item}
                        </motion.div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
              durationMs={(gameState.settings?.duration || 25) * 1000} 
              onComplete={handleRoundEnd} 
            />
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {currentQ.category && (
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                padding: '0.25rem 1rem',
                borderRadius: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {currentQ.category}
              </div>
            )}
            <h3 style={{ 
              fontSize: '2rem', 
              color: 'white', 
              marginBottom: '2rem',
              textAlign: 'center',
              maxWidth: '900px',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              "{currentQ.question}"
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
              {currentQ.items.map((item: string, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    style={{
                        background: 'linear-gradient(90deg, var(--color-success) 0%, #059669 100%)',
                        padding: '1.5rem 2rem',
                        borderRadius: '1rem',
                        fontSize: '2rem',
                        fontWeight: 900,
                        color: 'white',
                        boxShadow: '0 5px 15px rgba(16,185,129,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                  }}>
                      <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                          {idx + 1}
                      </span>
                      {item}
                  </motion.div>
              ))}
            </div>
            
            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '800px' }}>
              <h3>Risultati ({Math.floor(100 / currentQ.items.length)}pt a posizione corretta + 50pt bonus per percorso netto!):</h3>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  const pAnswer = gameState.answers?.[id];
                  let correctPositions = 0;
                  if (pAnswer && Array.isArray(pAnswer)) {
                      for (let i = 0; i < currentQ.items.length; i++) {
                          if (pAnswer[i] === currentQ.items[i]) correctPositions++;
                      }
                  }
                  const ptsPerItem = Math.floor(100 / currentQ.items.length);
                  let points = Math.floor(correctPositions * ptsPerItem);
                  if (correctPositions === currentQ.items.length) {
                      points += 50;
                  }
                  
                  return (
                    <li key={id} style={{ 
                      fontSize: '1.5rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      background: pAnswer !== undefined ? (points === 150 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)') : 'rgba(239, 68, 68, 0.2)', 
                      padding: '1rem', 
                      borderRadius: '1rem', 
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Avatar photo={p.photo} name={p.name} size={40} />
                        <span style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{p.name}</span> 
                      </div>
                      <span style={{ fontWeight: 800, color: pAnswer !== undefined ? (points > 0 ? 'var(--color-success)' : 'var(--color-warning)') : 'var(--color-danger)' }}>
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
