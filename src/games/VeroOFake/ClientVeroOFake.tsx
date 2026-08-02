import { motion } from 'framer-motion';
import { getCategoryColor } from '../../utils/categories';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';
import { getServerTime } from '../../utils/serverTime';

export default function ClientVeroOFake({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const myAnswer = gameState.answers?.[userId];
  const phase = gameState.phase || 'question';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);

  const handleAnswer = (answer: 'vero' | 'falso') => {
    if (myAnswer || phase !== 'question') return; // Già risposto o non è il momento
    
    updateGameState({
      [`answers/${userId}`]: answer
    });
  };

  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => returnToLobbyOrNextGame()}
        themeKey="vero_o_fake"
        customBackground={gameState.question ? getCategoryColor(gameState.question.category) : undefined}
      />
    );
  }

  if (phase === 'reveal') {
    const isCorrect = myAnswer === gameState.question?.answer;
    
    return (
      <GameLayoutMobile themeKey="vero_o_fake" customBackground={gameState.question ? getCategoryColor(gameState.question.category) : undefined} style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 10} isMobile />
        <motion.div 
          className="panel" 
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }}
          style={{ 
            padding: '3rem 1.5rem', 
            borderRadius: '2rem', 
            boxShadow: isCorrect ? '0 0 40px rgba(16, 185, 129, 0.4)' : myAnswer ? '0 0 40px rgba(239, 68, 68, 0.4)' : 'none',
            border: isCorrect ? '2px solid var(--color-success)' : myAnswer ? '2px solid var(--color-danger)' : '2px solid var(--color-warning)'
          }}
        >
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: isCorrect ? 'var(--color-success)' : myAnswer ? 'var(--color-danger)' : 'var(--color-warning)' }}>
            {isCorrect ? '✅ ESATTA!' : myAnswer ? '❌ SBAGLIATA!' : '⏳ TEMPO SCADUTO'}
          </h2>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: getServerTime() })}
            >
              {(gameState.questionIndex || 0) + 1 >= (gameState.totalRounds || gameState.settings?.rounds || 10) ? 'Termina Partita (Admin)' : 'Prossimo Round (Admin)'}
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  return (
    <GameLayoutMobile themeKey="vero_o_fake" customBackground={gameState.question ? getCategoryColor(gameState.question.category) : undefined} style={{ justifyContent: 'center', paddingTop: '4rem' }}>
      <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 10} isMobile />
      <ProgressBar durationMs={(gameState.settings?.duration || 15) * 1000} startTime={gameState.startTime} />
      
      {!myAnswer ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', padding: '2rem 0' }}
        >
          {gameState.question && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1.5rem',
              borderRadius: '1rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ textAlign: 'center', color: 'white', fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 600 }}>
                "{gameState.question.text}"
              </h3>
            </div>
          )}
          <button 
            className="btn btn-giant" 
            style={{ 
              flex: 1, 
              backgroundColor: 'var(--color-success)', 
              color: 'white', 
              fontSize: '3.5rem', 
              fontWeight: 900,
              borderRadius: '2rem',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.5)'
            }}
            onClick={() => handleAnswer('vero')}
          >
            ✅ VERO
          </button>
          
          <button 
            className="btn btn-giant" 
            style={{ 
              flex: 1, 
              backgroundColor: 'var(--color-danger)', 
              color: 'white', 
              fontSize: '3.5rem', 
              fontWeight: 900,
              borderRadius: '2rem',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.5)'
            }}
            onClick={() => handleAnswer('falso')}
          >
            ❌ FALSO
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="panel"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>Risposta Inviata!</h2>
          <p className="animate-pulse" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
            In attesa degli altri giocatori...
          </p>
        </motion.div>
      )}
      
    </GameLayoutMobile>
  );
}
