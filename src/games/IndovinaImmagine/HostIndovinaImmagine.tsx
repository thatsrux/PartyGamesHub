import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { checkAnswerFuzzy } from '../../utils/fuzzyMatch';

import { indovinaImmagineQuestions } from './data';
import { getServerTime } from '../../utils/serverTime';

function PlayerHostAvatar({ id, p, gameState }: { id: string, p: any, gameState: any }) {
  const [feedback, setFeedback] = useState<'wrong' | 'correct' | null>(null);
  const feedbackData = gameState.guessFeedback?.[id];

  useEffect(() => {
    if (feedbackData?.timestamp && gameState.startTime && feedbackData.timestamp >= gameState.startTime) {
      setFeedback(feedbackData.status);
      const timer = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(timer);
    } else {
      setFeedback(null);
    }
  }, [feedbackData?.timestamp, gameState.startTime]);

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        initial={false}
        animate={{ 
          opacity: feedback ? 1 : 0, 
          y: feedback ? -35 : 0, 
          scale: feedback ? 1.2 : 0.5 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          marginLeft: '-15px',
          zIndex: 10,
          fontSize: '1.5rem',
          filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
          pointerEvents: 'none'
        }}
      >
        {feedback === 'correct' ? '✅' : feedback === 'wrong' ? '❌' : ''}
      </motion.div>
      <motion.div 
        animate={
          feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0], backgroundColor: 'rgba(239, 68, 68, 0.4)' } 
          : feedback === 'correct' || gameState.answers?.[id] ? { backgroundColor: 'var(--color-success)' } 
          : { backgroundColor: 'rgba(255,255,255,0.05)' }
        }
        transition={{ duration: 0.3 }}
        style={{
            padding: '0.75rem 1.5rem', 
            borderRadius: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: gameState.answers?.[id] ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
            border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Avatar photo={p.photo} name={p.name} size={36} />
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {p.name} {gameState.answers?.[id] && '✓'}
        </span>
      </motion.div>
    </div>
  );
}

export default function HostIndovinaImmagine({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const availableQ = [...indovinaImmagineQuestions];
      const totalRounds = Math.min(gameState.settings?.rounds || 4, availableQ.length);
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
    const durationMs = (gameState.settings?.duration || 20) * 1000;
    const startTime = gameState.startTime || getServerTime();
    const correctAnswers = gameState.question.answers;

    playerIds.forEach(id => {
      const pAnswer = gameState.answers?.[id];
      if (pAnswer && typeof pAnswer.answer === 'string') {
        const isCorrect = checkAnswerFuzzy(pAnswer.answer, correctAnswers);
        if (isCorrect) {
          const timeTaken = pAnswer.time - startTime;
          let speedBonus = 0;
          if (timeTaken < durationMs) {
            speedBonus = Math.floor(100 * (1 - (timeTaken / durationMs)));
          }
          updatePlayerScore(id, 100 + speedBonus);
        }
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
      const totalRounds = gameState.totalRounds || gameState.settings?.rounds || 4;
      if (gameState.questionIndex < totalRounds - 1) {
        const nextIndex = gameState.questionIndex + 1;
        const sequence = gameState.sequence || [];
        const availableQ = [...indovinaImmagineQuestions];

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

  const durationMs = (gameState.settings?.duration || 20) * 1000;

  return (
    <GameLayoutTV 
      themeKey="indovina_immagine"
      leaderboard={gameState.phase !== 'finished' ? <MiniLeaderboardTV players={players} animateUpdates={true} /> : undefined}
    >
      {gameState.phase !== 'finished' && (
        <RoundTracker 
          current={(gameState.questionIndex || 0) + 1} 
          total={gameState.totalRounds || gameState.settings?.rounds || 4} 
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
            background: 'linear-gradient(135deg, #a7f3d0 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0px 10px 20px rgba(0,0,0,0.3)'
          }}
        >
          Indovina l'Immagine
        </motion.h1>

        <div className="panel" style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {gameState.phase === 'question' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                
                <div style={{ 
                    position: 'relative',
                    width: '100%',
                    maxWidth: '1200px',
                    height: '65vh',
                    borderRadius: '2rem',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    border: '4px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <motion.img 
                        key={currentQ.imageUrl}
                        src={currentQ.imageUrl}
                        alt="Mistery"
                        initial={{ filter: 'blur(35px) brightness(0.5)', scale: 1.1 }}
                        animate={{ filter: 'blur(0px) brightness(1)', scale: 1 }}
                        transition={{ duration: durationMs / 1000, ease: "linear" }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {Object.entries(players).map(([id, p]: any) => (
                    <PlayerHostAvatar key={id} id={id} p={p} gameState={gameState} />
                ))}
                </div>
            </div>
            
            <ProgressBar startTime={gameState.startTime} 
              key={`progress-${gameState.questionIndex}`} 
              durationMs={durationMs} 
              onComplete={handleRoundEnd} 
            />
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{ 
                position: 'relative',
                width: '100%',
                maxWidth: '900px',
                height: '50vh',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                border: '4px solid var(--color-success)',
                marginBottom: '2rem',
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <img 
                    src={currentQ.imageUrl}
                    alt="Reveal"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(0px) brightness(1)'
                    }}
                />
            </div>

            <h3 style={{ 
              fontSize: '3rem', 
              color: 'var(--color-success)', 
              marginBottom: '2rem',
              textAlign: 'center',
              fontWeight: 900,
              textTransform: 'uppercase'
            }}>
              {currentQ.answers[0]}
            </h3>
            
            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '800px' }}>
              <h3>Risultati:</h3>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                {Object.entries(players).map(([id, p]: any) => {
                  const pAnsObj = gameState.answers?.[id];
                  const correctAnswers = currentQ.answers;
                  const isCorrect = pAnsObj && typeof pAnsObj.answer === 'string' && checkAnswerFuzzy(pAnsObj.answer, correctAnswers);
                  
                  const startTime = gameState.startTime || 0;
                  
                  let points = 0;
                  if (isCorrect && pAnsObj) {
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
                      background: pAnsObj ? (isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'rgba(255,255,255,0.05)', 
                      padding: '1rem 2rem', 
                      borderRadius: '1.5rem', 
                      width: '100%',
                      justifyContent: 'space-between',
                      border: pAnsObj ? (isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)') : '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Avatar photo={p.photo} name={p.name} size={48} />
                        <span style={{ fontWeight: 'bold' }}>{p.name}</span> 
                        {pAnsObj && !isCorrect && (
                            <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                                ("{pAnsObj.answer}")
                            </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 800, color: pAnsObj ? (isCorrect ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--color-warning)' }}>
                        {pAnsObj ? (isCorrect ? `✅ +${points}` : '❌ 0') : '⏳ 0'}
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
