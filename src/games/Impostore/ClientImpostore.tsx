import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';

export default function ClientImpostore({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, setGameStatus } = useLobby(lobbyCode);
  const [showSecretWord, setShowSecretWord] = useState(false);
  
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
      <GameLayoutMobile themeKey="impostore" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Guarda la TV!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>I risultati sono stati svelati.</p>
          
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
      </GameLayoutMobile>
    );
  }

  if (phase === 'eliminated_reveal') {
    const isGameOver = gameState.imposterCaught || gameState.gameWonByImposter;

    return (
      <GameLayoutMobile themeKey="impostore" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Guarda la TV!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Scopri l'esito della votazione.</p>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ phase: isGameOver ? 'results' : 'discussion', action: null, actionId: Date.now() })}
            >
              {isGameOver ? 'Vedi Risultati (Admin)' : 'Continua Discussione (Admin)'}
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  const isEliminated = gameState.eliminatedIds?.includes(userId);
  if (isEliminated) {
    return (
      <GameLayoutMobile themeKey="impostore" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ border: '2px solid var(--color-danger)' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-danger)' }}>Eliminato 👻</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>Sei stato fatto fuori. Guarda la TV per scoprire cosa succede ora!</p>
        </motion.div>
      </GameLayoutMobile>
    );
  }

  if (phase === 'voting') {
    if (myVote) {
      return (
        <GameLayoutMobile themeKey="impostore" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
          <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h2 style={{ color: 'var(--color-success)', fontSize: '2.5rem' }}>Voto inviato!</h2>
            <p className="animate-pulse" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
              In attesa degli altri giocatori...
            </p>
          </motion.div>
        </GameLayoutMobile>
      );
    }

    return (
      <GameLayoutMobile themeKey="impostore" style={{ justifyContent: 'center', paddingTop: '4rem' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        <ProgressBar durationMs={30000} startTime={gameState.startTime} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-danger)' }}>
            {myRole === 'imposter' ? 'Chi vuoi far fuori?' : "Chi è l'impostore?"}
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
            {myRole === 'imposter' ? 'Vota un innocente per eliminarlo e farla franca!' : 'Tocca il nome del giocatore che sospetti.'}
          </p>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(players).map(([id, p]: any) => {
              if (id === userId) return null; // Can't vote for yourself
              if (gameState.eliminatedIds?.includes(id)) return null; // Can't vote for eliminated players
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
                    justifyContent: 'center',
                    width: '100%',
                    minWidth: 0
                  }}
                  onClick={() => handleVote(id)}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </GameLayoutMobile>
    );
  }

  if (phase === 'speaking' || phase === 'discussion') {
    const isImposter = myRole === 'imposter';
    const isMyTurn = phase === 'speaking' && gameState.speakingOrder?.[gameState.currentSpeakerIndex] === userId;
    const currentSpeakerName = phase === 'speaking' ? players[gameState.speakingOrder?.[gameState.currentSpeakerIndex]]?.name : null;

    return (
      <GameLayoutMobile themeKey="impostore" style={{ 
        justifyContent: 'center', 
        textAlign: 'center',
        background: isMyTurn ? (isImposter ? 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)' : 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)') : undefined
      }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        
        <motion.div className="panel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ 
          background: isMyTurn ? 'rgba(255,255,255,0.1)' : undefined,
          border: isMyTurn ? (isImposter ? '2px solid #ef4444' : '2px solid #10b981') : undefined
        }}>
          {isMyTurn ? (
            <>
              <h1 style={{ fontSize: '3.5rem', color: isImposter ? '#fca5a5' : '#6ee7b7', marginBottom: '1rem', textTransform: 'uppercase' }}>Tocca a te!</h1>
              <p style={{ fontSize: '1.3rem', marginBottom: '2rem' }}>
                Di' ad alta voce il tuo indizio (una o due parole).
              </p>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '3rem' }}>

                {isImposter ? (
                  <>
                    <h2 style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '0.5rem' }}>Impostore</h2>
                    {gameState.hintWord ? (
                      <div>
                        <p style={{ fontSize: '1rem', color: '#fca5a5' }}>Il tuo indizio è:</p>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{gameState.hintWord}</div>
                        <p style={{ fontSize: '0.9rem', color: '#fca5a5', marginTop: '0.5rem' }}>(Una parola vicina a quella vera)</p>
                      </div>
                    ) : (
                      <p style={{ fontSize: '1.1rem', color: '#fca5a5' }}>Procedi alla cieca e cerca di non farti scoprire!</p>
                    )}
                  </>
                ) : (
                  <>
                    {showSecretWord ? (
                      <div 
                        style={{ fontSize: 'clamp(2.5rem, 10vw, 3.5rem)', fontWeight: 'bold', cursor: 'pointer', lineHeight: '1.2', wordBreak: 'break-word' }}
                        onClick={() => setShowSecretWord(false)}
                      >
                        {gameState.secretWord}
                        <div style={{ fontSize: '1.2rem', fontWeight: 'normal', opacity: 0.7, marginTop: '1rem' }}>Tocca per nascondere</div>
                      </div>
                    ) : (
                      <button 
                        className="btn" 
                        style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '1rem', fontSize: '1.5rem', width: '100%' }}
                        onClick={() => setShowSecretWord(true)}
                      >
                        👁️ Mostra parola
                      </button>
                    )}
                  </>
                )}
              </div>

              <button 
                className="btn btn-primary btn-giant" 
                style={{ width: '100%', padding: '2rem 1rem', fontSize: '1.5rem', borderRadius: '1.5rem', background: isImposter ? '#ef4444' : '#10b981', color: 'white', border: 'none' }}
                onClick={() => updateGameState({ action: 'next_speaker', actionId: Date.now() })}
              >
                Ho dato l'indizio!
              </button>
            </>
          ) : phase === 'speaking' ? (
            <>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)' }}>Turno di parola</h2>
              <div style={{ margin: '3rem 0' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>È il turno di:</p>
                <h1 style={{ fontSize: '3rem', color: 'white', margin: '1rem 0' }}>{currentSpeakerName}</h1>
                <p className="animate-pulse" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Ascolta attentamente il suo indizio...</p>
              </div>

              {isAdmin && (
                <button 
                  className="btn" 
                  style={{ marginTop: '2rem', width: '100%', padding: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
                  onClick={() => updateGameState({ action: 'next_speaker', actionId: Date.now() })}
                >
                  Salta Turno (Admin)
                </button>
              )}
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--color-warning)' }}>Discussione Libera</h2>
              <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Cercate di capire chi sta mentendo!</p>
            </>
          )}

          {isAdmin && (
            <button 
              className="btn btn-danger" 
              style={{ marginTop: '3rem', width: '100%', padding: '1rem' }}
              onClick={() => updateGameState({ action: 'start_voting', actionId: Date.now() })}
            >
              Vota Subito (Admin)
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  // Reveal Roles
  if (phase === 'reveal_roles') {
    const isImposter = myRole === 'imposter';
    
    return (
      <GameLayoutMobile themeKey="impostore" style={{ justifyContent: 'center', paddingTop: '4rem' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
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
          {isImposter ? (
            <div>
              <h1 style={{ fontSize: 'clamp(2.5rem, 10vw, 3.5rem)', color: 'white', textTransform: 'uppercase', marginBottom: '2rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)', wordBreak: 'break-word' }}>
                Impostore
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#fecaca', marginBottom: '2rem' }}>
                Non farti scoprire! Cerca di mimetizzarti tra gli innocenti.
              </p>
              {gameState.hintWord && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem' }}>
                  <p style={{ fontSize: '1.1rem', color: '#fca5a5', marginBottom: '0.5rem' }}>Il tuo indizio segreto è:</p>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{gameState.hintWord}</div>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>(È una parola della stessa categoria, usala a tuo vantaggio!)</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '2rem 1.5rem', 
                  borderRadius: '1rem', 
                  fontSize: showSecretWord ? 'clamp(3rem, 12vw, 4rem)' : '1.8rem', 
                  fontWeight: 'bold', 
                  color: 'white', 
                  wordBreak: 'break-word',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}
                onClick={() => setShowSecretWord(!showSecretWord)}
              >
                {showSecretWord ? (
                  <>
                    <span style={{ lineHeight: '1.1' }}>{gameState.secretWord}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'normal', opacity: 0.7 }}>Tocca per nascondere</span>
                  </>
                ) : (
                  '👁️ Mostra parola'
                )}
              </div>
            </div>
          )}

          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem', background: 'white', color: 'black' }}
              onClick={() => updateGameState({ action: 'start_discussion', actionId: Date.now() })}
            >
              Inizia Turni (Admin)
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  return <div>Caricamento...</div>;
}
