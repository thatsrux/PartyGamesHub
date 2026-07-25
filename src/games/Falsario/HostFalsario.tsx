import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import RoundTracker from '../../components/shared/RoundTracker';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';

const questions = [
  { text: "Il soprannome d'infanzia di Pelé era...", truth: "Dico" },
  { text: "Prima di diventare famoso, Cristiano Ronaldo veniva chiamato...", truth: "Crybaby" },
  { text: "Il vero nome di Kakà è Ricardo Izecson dos Santos Leite. 'Kakà' deriva da...", truth: "Suo fratello" }
];

export default function HostFalsario({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  // Initialize
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const randomQ = questions[Math.floor(Math.random() * questions.length)];
      
      updateGameState({
        phase: 'write_lie',
        round: 1,
        question: randomQ,
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

    playerIds.forEach(voterId => {
      const votedAnswer = votes[voterId];
      
      if (votedAnswer === truth) {
        // Correct answer
        updatePlayerScore(voterId, 100);
      } else {
        // Find who wrote this lie
        playerIds.forEach(liarId => {
          if (lies[liarId] === votedAnswer && liarId !== voterId) {
            updatePlayerScore(liarId, 100);
          }
        });
      }
    });

    updateGameState({ phase: 'reveal' });
  };

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal') {
      const currentRound = gameState.round || 1;
      const totalRounds = Math.min(gameState.settings?.rounds || 3, questions.length);
      
      if (currentRound < totalRounds) {
        // Pick the next question (or a random unplayed one). We'll just use the index for simplicity.
        const randomQ = questions[currentRound % questions.length];
        updateGameState({
          phase: 'write_lie',
          round: currentRound + 1,
          question: randomQ,
          lies: {},
          votes: {},
          options: null,
          action: null,
          startTime: Date.now()
        });
      } else {
        updateGameState({ phase: 'finished', action: null });
      }
    }
  }, [gameState.action, gameState.phase]);


  if (!gameState.phase) return <div>Caricamento...</div>;

  return (
    <GameLayoutTV themeKey="falsario">
      
      {gameState.phase !== 'finished' && (
        <>
          <RoundTracker current={gameState.round || 1} total={Math.min(gameState.settings?.rounds || 3, questions.length)} />
          <MiniLeaderboardTV players={players} animateUpdates={true} />
        </>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '4rem', marginBottom: '2rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Il Falsario 🤥
        </motion.h1>

        <div className="panel" style={{ maxWidth: '1200px', width: '90%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {gameState.phase === 'write_lie' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Completa la frase con una bugia credibile:</h2>
            <h1 style={{ fontSize: '3rem', margin: '2rem 0' }}>"{gameState.question?.text}"</h1>
            
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
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-warning)' }}>Qual è la verità?</h2>
            <h1 style={{ fontSize: '3rem', margin: '1rem 0 3rem' }}>"{gameState.question?.text}"</h1>

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--color-success)', marginBottom: '2rem' }}>La Verità era:</h2>
            <h1 style={{ fontSize: '4rem', textTransform: 'uppercase', color: 'white', background: 'rgba(16, 185, 129, 0.2)', padding: '2rem', borderRadius: '1rem', display: 'inline-block' }}>
              {gameState.question?.truth}
            </h1>

            <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--color-text-muted)' }}>Chi ha ingannato chi?</h3>
              {Object.entries(players).map(([id, p]: any) => {
                const votedFor = gameState.votes?.[id];
                if (votedFor !== gameState.question.truth) {
                  // Find liar
                  const liarEntry = Object.entries(gameState.lies || {}).find(([_, lie]) => lie === votedFor);
                  const liarName = liarEntry && liarEntry[0] !== id ? players[liarEntry[0]]?.name : 'nessuno';
                  
                  return (
                    <div key={id} style={{ fontSize: '1.2rem' }}>
                      <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{liarName}</span> ha ingannato <span style={{ fontWeight: 'bold' }}>{p.name}</span>! <span style={{ color: 'var(--color-warning)' }}>(+100)</span>
                    </div>
                  );
                } else {
                   return (
                    <div key={id} style={{ fontSize: '1.2rem', color: 'var(--color-success)' }}>
                      <span style={{ fontWeight: 'bold' }}>{p.name}</span> ha indovinato la verità! (+100)
                    </div>
                  );
                }
              })}
            </div>
            
            <p style={{ marginTop: '3rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }} className="animate-pulse">
              In attesa dell'Admin...
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
