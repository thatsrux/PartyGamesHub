import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref as dbRef, get } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import Avatar from '../../components/shared/Avatar';
import ProgressBar from '../../components/shared/ProgressBar';

export default function HostCollegamento({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState, updatePlayerScore } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  const [footballersData, setFootballersData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDB = async () => {
      const snapshot = await get(dbRef(db, 'games_data/footballers'));
      setFootballersData(snapshot.val() || []);
    };
    fetchDB();
  }, []);

  // Initialize game state
  useEffect(() => {
    if (lobby && !gameState.phase && footballersData.length > 0) {
      // Find a valid challenge (a player with at least 2 distinct clubs)
      const validPlayers = footballersData.filter(p => p.career && p.career.length >= 2);
      const randomPlayer = validPlayers[Math.floor(Math.random() * validPlayers.length)];
      
      // Get 2 unique clubs
      const uniqueClubs = Array.from(new Set(randomPlayer.career.map((c: any) => c.name)));
      const shuffledClubs = uniqueClubs.sort(() => 0.5 - Math.random());
      const challengeClubs = [shuffledClubs[0], shuffledClubs[1]];

      updateGameState({
        phase: 'question',
        clubs: challengeClubs,
        answers: {},
        startTime: Date.now(),
        // We save the original player just as an example solution
        exampleSolution: randomPlayer.name 
      });
    }
  }, [lobby, footballersData]);

  // Check answers completion
  useEffect(() => {
    if (gameState.phase === 'question') {
      const playerIds = Object.keys(players);
      const allAnswered = playerIds.length > 0 && playerIds.every(id => gameState.answers?.[id]);
      if (allAnswered) {
        handleRoundEnd();
      }
    }
  }, [players, gameState.phase, gameState.answers]);

  const checkAnswer = (playerName: string, requiredClubs: string[]) => {
    const player = footballersData.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (!player || !player.career) return false;

    const playerClubs = player.career.map((c: any) => c.name);
    return requiredClubs.every(rc => playerClubs.includes(rc));
  };

  const handleRoundEnd = () => {
    const playerIds = Object.keys(players);
    const requiredClubs = gameState.clubs || [];
    const results: Record<string, boolean> = {};

    playerIds.forEach(id => {
      const answer = gameState.answers?.[id];
      if (answer) {
        const isCorrect = checkAnswer(answer, requiredClubs);
        results[id] = isCorrect;
        if (isCorrect) {
          updatePlayerScore(id, 100);
        }
      } else {
        results[id] = false;
      }
    });

    updateGameState({ phase: 'reveal', results });
  };

  const handleNextRound = () => {
    updateGameState({ phase: 'finished', action: null });
  };

  useEffect(() => {
    if (gameState.action === 'next_round' && gameState.phase === 'reveal') {
      handleNextRound();
    }
  }, [gameState.action, gameState.phase]);


  if (!gameState.phase) return <div>Caricamento...</div>;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '4rem', marginBottom: '2rem' }}>
        Il Collegamento 🔗
      </motion.h1>

      <div className="panel" style={{ maxWidth: '1200px', width: '90%', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {gameState.phase === 'question' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>Trova un giocatore che abbia giocato in ENTRAMBE queste squadre:</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', margin: '3rem 0' }}>
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ fontSize: '3rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '1rem' }}>
                {gameState.clubs?.[0]}
              </motion.div>
              <div style={{ fontSize: '4rem' }}>➕</div>
              <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ fontSize: '3rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '1rem' }}>
                {gameState.clubs?.[1]}
              </motion.div>
            </div>
            
            <ProgressBar durationMs={45000} onComplete={handleRoundEnd} />

            <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(players).map(([id, p]: any) => (
                <div key={id} style={{ 
                  padding: '1rem',
                  background: gameState.answers?.[id] ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  opacity: gameState.answers?.[id] ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <Avatar photo={p.photo} name={p.name} size={48} />
                  <span style={{ fontWeight: 'bold' }}>{gameState.answers?.[id] ? 'Risposta Inviata ✓' : 'Sta scrivendo...'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState.phase === 'reveal' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '2rem', color: 'var(--color-warning)' }}>Risultati!</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', margin: '3rem 0' }}>
              {Object.entries(players).map(([id, p]: any) => {
                const answer = gameState.answers?.[id];
                const isCorrect = gameState.results?.[id];
                
                return (
                  <div key={id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '2rem', 
                    background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                    padding: '1rem 3rem', borderRadius: '2rem', width: '80%', maxWidth: '800px'
                  }}>
                    <Avatar photo={p.photo} name={p.name} size={64} />
                    <div style={{ flex: 1, textAlign: 'left', fontSize: '1.5rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{p.name}</span> ha scritto: <br/>
                      <span style={{ color: isCorrect ? 'var(--color-success)' : 'white', fontSize: '2rem', fontWeight: 'bold' }}>{answer || 'Nessuna risposta'}</span>
                    </div>
                    <div style={{ fontSize: '3rem' }}>
                      {isCorrect ? '✅' : '❌'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '2rem', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>
              Es. di risposta corretta: <strong style={{ color: 'white' }}>{gameState.exampleSolution}</strong>
            </div>

            <p style={{ marginTop: '3rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }} className="animate-pulse">
              In attesa dell'Admin...
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
