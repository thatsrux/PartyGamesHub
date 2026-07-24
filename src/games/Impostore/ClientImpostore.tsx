import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';

export default function ClientImpostore({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, setGameStatus } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const phase = gameState.phase;
  const myRole = gameState.roles?.[userId];
  const myVote = gameState.votes?.[userId];
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const players = lobby?.players || {};

  const handleVote = (votedId: string) => {
    if (myVote || phase !== 'voting') return;
    updateGameState({
      [`votes/${userId}`]: votedId
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

  if (phase === 'results') {
    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Guarda la TV!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>I risultati sono stati svelati.</p>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
            >
              Termina Partita (Admin)
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  if (phase === 'voting') {
    if (myVote) {
      return (
        <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h2 style={{ color: 'var(--color-success)', fontSize: '2.5rem' }}>Voto inviato!</h2>
            <p className="animate-pulse" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
              In attesa degli altri giocatori...
            </p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="container-mobile" style={{ justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-danger)' }}>Chi è l'impostore?</h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>Tocca il nome del giocatore che sospetti.</p>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(players).map(([id, p]: any) => {
              if (id === userId) return null; // Can't vote for yourself
              return (
                <button 
                  key={id}
                  className="btn"
                  style={{ 
                    padding: '1.5rem', 
                    fontSize: '1.5rem', 
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => handleVote(id)}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'discussion') {
    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <motion.div className="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-warning)' }}>Discussione in corso</h2>
          <p style={{ margin: '2rem 0', fontSize: '1.2rem' }}>
            {myRole === 'imposter' ? 'Usa le risposte degli altri per dedurre di cosa stanno parlando e non farti scoprire!' : `Fai domande per trovare chi non conosce la parola (${gameState.secretWord}).`}
          </p>
          {isAdmin && (
            <button 
              className="btn btn-danger" 
              style={{ marginTop: '2rem', width: '100%', padding: '1rem' }}
              onClick={() => updateGameState({ action: 'start_voting', actionId: Date.now() })}
            >
              Salta Discussione (Vota Subito)
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // Reveal Roles
  if (phase === 'reveal_roles') {
    const isImposter = myRole === 'imposter';
    
    return (
      <div className="container-mobile" style={{ justifyContent: 'center' }}>
        <motion.div 
          className="panel"
          initial={{ scale: 0.5, rotateY: 90 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{ 
            textAlign: 'center', 
            background: isImposter ? 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
            border: `2px solid ${isImposter ? '#ef4444' : '#3b82f6'}`
          }}
        >
          <h2 style={{ fontSize: '2rem', color: isImposter ? '#fca5a5' : '#bfdbfe', marginBottom: '1rem' }}>Il tuo ruolo:</h2>
          <h1 style={{ fontSize: '3.5rem', color: 'white', textTransform: 'uppercase', marginBottom: '2rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            {isImposter ? 'Impostore' : 'Innocente'}
          </h1>

          {isImposter ? (
            <p style={{ fontSize: '1.2rem', color: '#fecaca' }}>
              Non farti scoprire! Cerca di mimetizzarti tra gli innocenti.
            </p>
          ) : (
            <div>
              <p style={{ fontSize: '1.2rem', color: '#bfdbfe', marginBottom: '0.5rem' }}>La parola segreta è:</p>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                {gameState.secretWord}
              </div>
            </div>
          )}

          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem', background: 'white', color: 'black' }}
              onClick={() => updateGameState({ action: 'start_discussion', actionId: Date.now() })}
            >
              Inizia Discussione (Admin)
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return <div>Caricamento...</div>;
}
