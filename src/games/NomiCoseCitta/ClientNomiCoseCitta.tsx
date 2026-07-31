import { useState, useEffect } from 'react';

import { useLobby } from '../../hooks/useLobby';
import Avatar from '../../components/shared/Avatar';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';

export default function ClientNomiCoseCitta({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const phase = gameState.phase;
  const CATEGORIES: string[] = gameState.settings?.categories || ['Nomi', 'Cose', 'Città', 'Animali', 'Mestieri'];
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (phase === 'spin') {
      setLocalAnswers({});
    }
  }, [phase]);

  const handleInputChange = (category: string, value: string) => {
    const newAnswers = { ...localAnswers, [category]: value };
    setLocalAnswers(newAnswers);
    // Auto-save
    updateGameState({
      [`answers/${userId}/${category}`]: value
    });
  };

  const handleStop = () => {
    updateGameState({ [`readyPlayers/${userId}`]: true });
  };

  const handleCancelReady = () => {
    updateGameState({ [`readyPlayers/${userId}`]: false });
  };

  const toggleValidation = (category: string, pId: string, word: string) => {
    if (!isAdmin || word === '-') return;
    const startsWithLetter = word.startsWith(gameState.letter?.toLowerCase() || 'a');
    const current = gameState.validations?.[category]?.[pId] ?? startsWithLetter;
    updateGameState({ [`validations/${category}/${pId}`]: !current });
  };

  const confirmValidations = () => {
    updateGameState({ action: 'calculate_points', actionId: Date.now() });
  };

  if (phase === 'spin') {
    return (
      <GameLayoutMobile themeKey="nomi_cose_citta" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 3} isMobile />
        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Estrazione in corso...</h2>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Guarda la TV!</p>
      </GameLayoutMobile>
    );
  }

  if (phase === 'write') {
    const isReady = gameState.readyPlayers?.[userId];
    const duration = (gameState.settings?.duration || 60) * 1000;
    const startTime = gameState.endTime ? gameState.endTime - duration : Date.now();

    if (isReady) {
      return (
        <GameLayoutMobile themeKey="nomi_cose_citta" style={{ padding: '4rem 1rem 1rem 1rem', justifyContent: 'center', textAlign: 'center' }}>
          <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 3} isMobile />
          <ProgressBar durationMs={duration} startTime={startTime} />
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-success)', marginTop: '2rem' }}>Sei pronto!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
            In attesa degli altri giocatori...
          </p>
          <button className="btn btn-secondary btn-giant" onClick={handleCancelReady}>
            Annulla (Modifica)
          </button>
        </GameLayoutMobile>
      );
    }

    return (
      <GameLayoutMobile themeKey="nomi_cose_citta" style={{ padding: '4rem 1rem 1rem 1rem' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 3} isMobile />
        <ProgressBar durationMs={duration} startTime={startTime} />
        <div style={{ textAlign: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Lettera</span>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {gameState.letter}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <div key={cat} className="input-group">
              <label>{cat}</label>
              <input 
                type="text" 
                className="input" 
                value={localAnswers[cat] || ''}
                onChange={e => handleInputChange(cat, e.target.value)}
                placeholder={`Inserisci ${cat.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>

        <button className="btn btn-giant btn-primary" onClick={handleStop} style={{ background: 'var(--color-success)' }}>
          Ho finito!
        </button>
      </GameLayoutMobile>
    );
  }

  if (phase === 'validate') {
    if (!isAdmin) {
      return (
        <GameLayoutMobile themeKey="nomi_cose_citta" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 3} isMobile />
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-warning)' }}>Tempo Scaduto!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>L'Admin sta convalidando le risposte...</p>
        </GameLayoutMobile>
      );
    }

    // Admin validation screen
    return (
      <GameLayoutMobile themeKey="nomi_cose_citta" style={{ padding: '4rem 1rem 1rem 1rem', overflowY: 'auto' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 3} isMobile />
        <h2 style={{ textAlign: 'center', color: 'var(--color-primary)', marginBottom: '1rem' }}>Convalida Risposte</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Tocca le parole per segnarle come non valide. Se bocci una parola, tutti coloro che l'hanno scritta prenderanno 0.
        </p>

        {CATEGORIES.map(cat => {
          const submissions = Object.keys(lobby?.players || {}).map(pId => {
            const rawWord = gameState.answers?.[pId]?.[cat];
            const word = (rawWord || '').toLowerCase().trim();
            return { pId, word: word || '-' };
          });
          
          return (
            <div key={cat} style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem' }}>
              <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>{cat}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {submissions.map((sub, i) => {
                    const player = lobby?.players?.[sub.pId];
                    const startsWithLetter = sub.word.startsWith(gameState.letter?.toLowerCase() || 'a');
                    const isValid = gameState.validations?.[cat]?.[sub.pId] ?? startsWithLetter;
                    
                    return (
                      <div 
                        key={i}
                        onClick={() => toggleValidation(cat, sub.pId, sub.word)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.8rem 1rem',
                          borderRadius: '0.5rem',
                          background: isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${isValid ? 'var(--color-success)' : 'var(--color-danger)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isValid ? 1 : 0.6, flex: 1, minWidth: 0 }}>
                          <Avatar photo={player?.photo} name={player?.name || 'Sconosciuto'} size={28} />
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player?.name}</span>
                        </div>
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '1.2rem',
                          textDecoration: isValid ? 'none' : 'line-through',
                          color: isValid ? 'var(--color-success)' : 'var(--color-danger)',
                          flexShrink: 0
                        }}>
                          {sub.word.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
            </div>
          );
        })}

        <button className="btn btn-giant btn-primary" onClick={confirmValidations} style={{ marginTop: '2rem', width: '100%' }}>
          CONFERMA E CALCOLA PUNTI
        </button>
      </GameLayoutMobile>
    );
  }

  if (phase === 'results') {
    return (
      <GameLayoutMobile themeKey="nomi_cose_citta" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 3} isMobile />
        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-success)', marginBottom: '2rem' }}>Guarda la TV!</h2>
        
        {isAdmin && (
          <button className="btn btn-primary btn-giant" onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}>
            {(gameState.round || 1) >= (gameState.settings?.rounds || 3) ? 'Vai alla Classifica Finale' : 'Prossimo Round'}
          </button>
        )}
      </GameLayoutMobile>
    );
  }

  if (phase === 'finished') {
    return (
      <GameLayoutMobile themeKey="nomi_cose_citta" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>Partita Finita!</h2>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '1.5rem' }}>Guarda il podio sulla TV.</p>
        
        {isAdmin && (
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '3rem', padding: '1.5rem', width: '100%' }}
            onClick={() => returnToLobbyOrNextGame()}
          >
            Torna alla Lobby (Admin)
          </button>
        )}
      </GameLayoutMobile>
    );
  }

  return <div>Caricamento...</div>;
}
