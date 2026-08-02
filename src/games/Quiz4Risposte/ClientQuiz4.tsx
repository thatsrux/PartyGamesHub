import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';
import { getServerTime } from '../../utils/serverTime';

export default function ClientQuiz4({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const myAnswerObj = gameState.answers?.[userId];
  const myAnswer = myAnswerObj?.answer;
  const phase = gameState.phase || 'question';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const currentQ = gameState.question;

  const handleAnswer = (index: number) => {
    if (myAnswerObj || phase !== 'question') return; 
    
    updateGameState({
      [`answers/${userId}`]: { answer: index, time: getServerTime() }
    });
  };

  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => returnToLobbyOrNextGame()}
        themeKey="quiz4"
      />
    );
  }

  const optionColors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];

  if (phase === 'reveal') {
    const isCorrect = myAnswer === currentQ?.correctIndex;
    
    return (
      <GameLayoutMobile themeKey="quiz4" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 5} isMobile />
        <motion.div 
          className="panel" 
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }}
          style={{ 
            padding: '3rem 1.5rem', 
            borderRadius: '2rem', 
            boxShadow: isCorrect ? '0 0 40px rgba(16, 185, 129, 0.4)' : myAnswer !== undefined ? '0 0 40px rgba(239, 68, 68, 0.4)' : 'none',
            border: isCorrect ? '2px solid var(--color-success)' : myAnswer !== undefined ? '2px solid var(--color-danger)' : '2px solid var(--color-warning)'
          }}
        >
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: isCorrect ? 'var(--color-success)' : myAnswer !== undefined ? 'var(--color-danger)' : 'var(--color-warning)' }}>
            {isCorrect ? '✅ ESATTA!' : myAnswer !== undefined ? '❌ SBAGLIATA!' : '⏳ TEMPO SCADUTO'}
          </h2>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
            <p style={{ margin: 0, color: 'white', fontWeight: 'bold' }}>Risposta corretta:</p>
            <p style={{ fontSize: '1.5rem', color: optionColors[currentQ?.correctIndex], fontWeight: 900 }}>
              {currentQ?.options[currentQ?.correctIndex]}
            </p>
          </div>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: getServerTime() })}
            >
              {(gameState.questionIndex || 0) + 1 >= (gameState.totalRounds || gameState.settings?.rounds || 5) ? 'Termina Partita (Admin)' : 'Prossimo Round (Admin)'}
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  return (
    <GameLayoutMobile themeKey="quiz4" style={{ justifyContent: 'center', paddingTop: '4rem' }}>
      <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 5} isMobile />
      <ProgressBar durationMs={(gameState.settings?.duration || 15) * 1000} startTime={gameState.startTime} />
      
      {!myAnswerObj ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', padding: '1rem 0' }}
        >
          {currentQ && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1.5rem',
              borderRadius: '1rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              marginBottom: '1rem'
            }}>
              <h3 style={{ textAlign: 'center', color: 'white', fontSize: '1.3rem', fontStyle: 'italic', fontWeight: 600 }}>
                "{currentQ.question}"
              </h3>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
            {currentQ?.options.map((opt: string, idx: number) => (
              <button 
                key={idx}
                style={{ 
                  backgroundColor: optionColors[idx], 
                  color: 'white', 
                  fontSize: '1.2rem', 
                  fontWeight: 800,
                  borderRadius: '1rem',
                  boxShadow: `0 5px 15px ${optionColors[idx]}80`,
                  border: 'none',
                  padding: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => handleAnswer(idx)}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="panel"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}
        >
          <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>Risposta Inviata!</h2>
          <p className="animate-pulse" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
            Hai scelto: {currentQ?.options[myAnswer]}
          </p>
          <p className="animate-pulse" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
            In attesa degli altri giocatori...
          </p>
        </motion.div>
      )}
      
    </GameLayoutMobile>
  );
}
