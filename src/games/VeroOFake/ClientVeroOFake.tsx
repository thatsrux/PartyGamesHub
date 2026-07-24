import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';

export default function ClientVeroOFake({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, setGameStatus } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const myAnswer = gameState.answers?.[userId];
  const phase = gameState.phase || 'question';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);

  const handleAnswer = (answer: 'vero' | 'fake') => {
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
        onReturnToLobby={() => setGameStatus('waiting')} 
      />
    );
  }

  if (phase === 'reveal') {
    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '3rem', color: myAnswer ? 'white' : 'var(--color-text-muted)' }}>
            Hai risposto: <br/> 
            <span style={{ color: myAnswer === 'vero' ? 'var(--color-success)' : myAnswer === 'fake' ? 'var(--color-danger)' : 'gray' }}>
              {myAnswer ? myAnswer.toUpperCase() : 'NIENTE'}
            </span>
          </h2>
          <p style={{ marginTop: '2rem', fontSize: '1.2rem' }}>Guarda la TV per scoprire se è corretto!</p>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
            >
              Prossimo Round (Admin)
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-mobile" style={{ justifyContent: 'center' }}>
      
      {!myAnswer ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', padding: '2rem 0' }}
        >
          <button 
            className="btn btn-giant" 
            style={{ flex: 1, backgroundColor: 'var(--color-success)', color: 'white', fontSize: '4rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            onClick={() => handleAnswer('vero')}
          >
            VERO
          </button>
          
          <button 
            className="btn btn-giant" 
            style={{ flex: 1, backgroundColor: 'var(--color-danger)', color: 'white', fontSize: '4rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            onClick={() => handleAnswer('fake')}
          >
            FAKE
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
      
    </div>
  );
}
