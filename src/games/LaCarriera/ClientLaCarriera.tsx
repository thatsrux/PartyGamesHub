import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref as dbRef, get } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import ProgressBar from '../../components/shared/ProgressBar';

export default function ClientLaCarriera({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, setGameStatus } = useLobby(lobbyCode);
  
  const [guess, setGuess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const gameState = lobby?.game_state || {};
  const myAnswer = gameState.answers?.[userId];
  const phase = gameState.phase || 'question';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);

  // Carica il db solo all'inizio
  useEffect(() => {
    const fetchDB = async () => {
      const snapshot = await get(dbRef(db, 'games_data/footballers'));
      const data = snapshot.val() || [];
      const names = data.map((f: any) => f.name).sort();
      setAllPlayers(names);
    };
    fetchDB();
  }, []);

  // Pulisci l'input all'inizio di un nuovo round
  useEffect(() => {
    if (!myAnswer) {
      setGuess('');
    }
  }, [myAnswer, gameState.questionIndex]);

  // Rimuovi accenti e caratteri speciali per la ricerca
  const normalizeStr = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const suggestions = guess.trim() 
    ? allPlayers.filter(p => normalizeStr(p).includes(normalizeStr(guess)) && p !== guess)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (myAnswer || phase !== 'question' || !guess.trim()) return;
    
    const formattedGuess = guess.trim();
    
    // Validazione stringente: il nome DEVE essere nella lista
    if (!allPlayers.includes(formattedGuess)) {
      setError("⚠️ Seleziona un giocatore dalla tendina dei suggerimenti!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    updateGameState({
      [`answers/${userId}`]: formattedGuess
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
    const currentCareer = gameState.selectedCareers?.[gameState.questionIndex];
    const isCorrect = Boolean(myAnswer && currentCareer && myAnswer.toLowerCase().trim() === currentCareer.name.toLowerCase());

    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: isCorrect ? 'var(--color-success)' : '#ef4444' }}>
            {isCorrect ? '✅ Esatto!' : '❌ Sbagliato!'}
          </h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Hai risposto:</p>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--color-primary)' }}>
            {myAnswer || 'Nessuna risposta'}
          </h3>
          
          {!isCorrect && currentCareer && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>La risposta corretta era:</p>
              <p style={{ color: 'var(--color-success)', fontSize: '1.8rem', fontWeight: 'bold' }}>{currentCareer.name}</p>
            </div>
          )}
          
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

  if (myAnswer) {
    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <motion.div className="panel" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <h2 style={{ color: 'var(--color-success)', fontSize: '2.5rem' }}>Risposta inviata!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Hai scritto: <strong>{myAnswer}</strong></p>
          <div className="animate-pulse" style={{ marginTop: '3rem', fontSize: '1.2rem', marginBottom: '2rem' }}>
            In attesa degli altri giocatori...
          </div>
          
          <ProgressBar 
            key={`progress-${gameState.questionIndex}`}
            durationMs={(gameState.settings?.duration || 30) * 1000} 
            startTime={gameState.startTime} 
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-mobile" style={{ justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Chi è il giocatore?</h2>
        {gameState.settings?.rounds && (
          <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
            Round {gameState.questionIndex + 1} di {gameState.settings.rounds}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="panel">
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
            Guarda i loghi sulla TV e digita il nome esatto.
          </p>
          
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
              {error}
            </motion.div>
          )}

          <div className="input-group" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input 
                type="text" 
                className="input" 
                value={guess}
                onChange={(e) => {
                  setGuess(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                required
                autoFocus
                autoComplete="off"
                style={{ paddingRight: '3.5rem', width: '100%' }}
              />
              <button 
                type="submit" 
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  background: 'var(--color-primary)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}
              >
                ➤
              </button>
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#1a1a24', // Solid background to avoid transparency issues
                border: '2px solid var(--color-primary)',
                borderRadius: '0.8rem',
                maxHeight: '220px',
                overflowY: 'auto',
                zIndex: 50,
                marginTop: '0.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
              }}>
                {suggestions.map((s, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '1.2rem 1rem', 
                      borderBottom: '1px solid rgba(255,255,255,0.1)', 
                      cursor: 'pointer', 
                      textAlign: 'left',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => {
                      setGuess(s);
                      setShowSuggestions(false);
                      // Auto-submit the answer for maximum speed!
                      updateGameState({
                        [`answers/${userId}`]: s
                      });
                    }}
                  >
                    <span>{s}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', opacity: 0.8 }}>👆 Invia</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <ProgressBar 
            key={`progress-${gameState.questionIndex}`}
            durationMs={(gameState.settings?.duration || 30) * 1000} 
            startTime={gameState.startTime} 
          />
        </form>
      </motion.div>
    </div>
  );
}
