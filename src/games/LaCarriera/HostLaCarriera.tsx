import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref as dbRef, get } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';

export default function HostLaCarriera({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [selectedCareers, setSelectedCareers] = useState<any[]>([]);
  const [teamsDb, setTeamsDb] = useState<any[]>([]);

  useEffect(() => {
    get(dbRef(db, 'games_data/teams')).then(snap => setTeamsDb(snap.val() || []));
  }, []);

  // Initialize game state if not set
  useEffect(() => {
    const initGame = async () => {
      if (lobby && !gameState.phase) {
        // Scarica dal db firebase
        const snapshot = await get(dbRef(db, 'games_data/footballers'));
        const footballersData = snapshot.val() || [];
        
        const rounds = gameState.settings?.rounds || 10;
        // Seleziona le carriere casuali
        const shuffled = [...footballersData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, rounds);
        
        updateGameState({
          phase: 'question',
          questionIndex: 0,
          clueIndex: 0,
          startTime: Date.now(),
          selectedCareers: selected
        });
      }
    };
    initGame();
  }, [lobby]);

  // Sync internal state with Firebase state
  useEffect(() => {
    if (gameState.questionIndex !== undefined) {
      setCurrentQuestionIndex(gameState.questionIndex);
    }
    if (gameState.clueIndex !== undefined) {
      setClueIndex(gameState.clueIndex);
    }
    if (gameState.selectedCareers) {
      setSelectedCareers(gameState.selectedCareers);
    }
  }, [gameState.questionIndex, gameState.clueIndex, gameState.selectedCareers]);

  // Timer for clues
  useEffect(() => {
    if (gameState.phase !== 'question') return;

    const currentCareer = selectedCareers[currentQuestionIndex];
    if (!currentCareer) return;

    // Distribute clues over 80% of the total round duration
    const durationMs = (gameState.settings?.duration || 30) * 1000;
    const spawnWindowMs = durationMs * 0.8;
    const intervalMs = currentCareer.clues.length > 1 ? spawnWindowMs / (currentCareer.clues.length - 1) : 3000;

    const timer = setInterval(() => {
      const nextClue = clueIndex + 1;
      if (nextClue < currentCareer.clues.length) {
        updateGameState({ clueIndex: nextClue });
      } else {
        // All clues shown, wait for ProgressBar to complete the round
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [gameState.phase, clueIndex, currentQuestionIndex, selectedCareers, gameState.settings?.duration]);

  // Check if everyone answered
  useEffect(() => {
    if (gameState.phase === 'question') {
      const playerIds = Object.keys(players);
      const allAnswered = playerIds.length > 0 && playerIds.every(id => gameState.answers?.[id]);
      if (allAnswered) {
        handleRoundEnd();
      }
    }
  }, [players, gameState.phase, gameState.answers]);

  const handleRoundEnd = () => {
    const playerIds = Object.keys(players);
    const currentCareer = selectedCareers[currentQuestionIndex];
    
    playerIds.forEach(id => {
      const answer = gameState.answers?.[id];
      if (answer && answer.toLowerCase().trim() === currentCareer.name.toLowerCase()) {
        updatePlayerScore(id, 100);
      }
    });
    
    updateGameState({ phase: 'reveal' });
  };

  const handleNextRound = () => {
    if (currentQuestionIndex + 1 < selectedCareers.length) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setClueIndex(0);
      updateGameState({
        phase: 'question',
        questionIndex: newIndex,
        clueIndex: 0,
        startTime: Date.now(),
        answers: {},
        action: null
      });
    } else {
      updateGameState({ phase: 'finished', action: null });
    }
  };

  // Listen to Admin commands
  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal') {
      handleNextRound();
    }
  }, [gameState.action, gameState.actionId]);

  const currentCareer = selectedCareers[currentQuestionIndex];

  if (!currentCareer) return <div>Caricamento...</div>;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ fontSize: '4rem', marginBottom: '0.5rem' }}
      >
        La Carriera
      </motion.h1>
      
      {gameState.settings?.rounds && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          style={{ marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 'bold' }}
        >
          Round {currentQuestionIndex + 1} di {gameState.settings.rounds}
        </motion.div>
      )}

      <div className="panel" style={{ maxWidth: '1600px', width: '95%', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {gameState.phase === 'question' && (
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Chi ha giocato in queste squadre?</h2>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              flexWrap: 'wrap', 
              gap: '1rem', 
              justifyContent: 'center', 
              alignContent: 'flex-start',
              marginTop: '1.5rem', 
              padding: '1rem',
              borderRadius: '1rem',
              background: 'rgba(0,0,0,0.2)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)'
            }}>
              {currentCareer.clues.slice(0, clueIndex + 1).map((clueData: any, idx: number) => {
                const isObject = typeof clueData === 'object' && clueData !== null;
                const clueName = isObject ? clueData.name : clueData;
                const clueLogo = isObject ? clueData.logo : null;
                const clueYears = isObject ? clueData.years : null;
                
                return (
                  <motion.div 
                    key={idx}
                    layout
                    initial={{ opacity: 0, scale: 0.5, x: -50, rotateX: -90 }}
                    animate={{ opacity: 1, scale: 1, x: 0, rotateX: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)', 
                      padding: '1rem', 
                      borderRadius: '1rem',
                      width: '320px', 
                      minHeight: '75px', 
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '5px', bottom: 0, background: 'var(--color-primary)' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flexGrow: 1, justifyContent: 'center' }}>
                      <span style={{ 
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)', 
                        lineHeight: 1.2,
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        wordBreak: 'break-word'
                      }}>
                        {clueName}
                      </span>
                      {clueYears && (
                        <span style={{ 
                          fontSize: '1.1rem', 
                          color: 'var(--color-primary)', 
                          fontWeight: 'bold', 
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)', 
                          textAlign: 'center' 
                        }}>
                          {clueYears}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
              durationMs={(gameState.settings?.duration || 30) * 1000} 
              onComplete={handleRoundEnd}
            />
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--color-text-muted)' }}>Il calciatore era:</h2>
            <h1 style={{ fontSize: '4rem', color: 'var(--color-primary)', textTransform: 'uppercase', margin: '1rem 0' }}>
              {currentCareer.name}
            </h1>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'row',
                flexWrap: 'wrap', 
                gap: '1rem', 
                justifyContent: 'center', 
                alignContent: 'flex-start',
                marginTop: '2rem', 
                padding: '1.5rem',
                borderRadius: '1rem',
                background: 'rgba(0,0,0,0.2)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
              }}>
                {currentCareer.clues.map((clueData: any, idx: number) => {
                  const isObject = typeof clueData === 'object' && clueData !== null;
                  const clueName = isObject ? clueData.name : clueData;
                  const clueLogo = isObject ? clueData.logo : null;
                  const clueYears = isObject ? clueData.years : null;
                  
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '1rem',
                        width: '280px', 
                        minHeight: '65px', 
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '5px', bottom: 0, background: 'var(--color-primary)' }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flexGrow: 1, justifyContent: 'center' }}>
                        <span style={{ 
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)', 
                          lineHeight: 1.2,
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          whiteSpace: 'normal',
                          textAlign: 'center',
                          wordBreak: 'break-word'
                        }}>
                          {clueName}
                        </span>
                        {clueYears && (
                          <span style={{ 
                            fontSize: '1rem', 
                            color: 'var(--color-primary)', 
                            fontWeight: 'bold', 
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)', 
                            textAlign: 'center' 
                          }}>
                            {clueYears}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            <div style={{ marginTop: '2rem' }}>
              <h3>Risultati:</h3>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  const pAnswer = gameState.answers?.[id];
                  const correct = pAnswer && pAnswer.toLowerCase().trim() === currentCareer.name.toLowerCase();
                  return (
                    <li key={id} style={{ 
                      fontSize: '1.5rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '0.5rem 1.5rem', 
                      borderRadius: '1rem', 
                      width: '450px',
                      maxWidth: '95%'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Avatar photo={p.photo} name={p.name} size={40} />
                        <span style={{ fontWeight: 'bold' }}>{p.name}:</span> 
                      </div>
                      <span style={{ textAlign: 'right' }}>{pAnswer ? (correct ? '✅ +100' : `❌ (${pAnswer})`) : '⏳ Tempo scaduto'}</span>
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
