import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref as dbRef, get } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';

export default function ClientCollegamento({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, setGameStatus } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const phase = gameState.phase;
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  
  const myAnswer = gameState.answers?.[userId];
  
  const [guess, setGuess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDB = async () => {
      const snapshot = await get(dbRef(db, 'games_data/footballers'));
      const data = snapshot.val() || [];
      const names = data.map((f: any) => f.name).sort();
      setAllPlayers(names);
    };
    fetchDB();
  }, []);

  const normalizeStr = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const suggestions = guess.trim() 
    ? allPlayers.filter(p => normalizeStr(p).includes(normalizeStr(guess)) && p !== guess)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'question' || myAnswer || !guess.trim()) return;
    
    const formattedGuess = guess.trim();
    
    if (!allPlayers.includes(formattedGuess)) {
      setError("⚠️ Seleziona un giocatore dalla tendina!");
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
    const isCorrect = gameState.results?.[userId];

    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {isCorrect ? '✅ Collegamento Esatto!' : '❌ Sbagliato!'}
          </h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>Guarda la TV per i risultati di tutti.</p>
          
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

  if (phase === 'question') {
    if (myAnswer) {
      return (
        <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h2 style={{ color: 'var(--color-success)', fontSize: '2.5rem' }}>Risposta inviata!</h2>
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '1.5rem' }}>{myAnswer}</p>
            <p className="animate-pulse" style={{ marginTop: '3rem', fontSize: '1.2rem' }}>
              In attesa degli altri giocatori...
            </p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="container-mobile" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-primary)' }}>Chi ha giocato in entrambe?</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{gameState.clubs?.[0]}</div>
            <div>➕</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{gameState.clubs?.[1]}</div>
          </div>
          
          <form onSubmit={handleSubmit} className="panel" style={{ padding: '1.5rem' }}>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--color-danger)', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                {error}
              </motion.div>
            )}

            <div style={{ position: 'relative' }}>
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
                placeholder="Nome del giocatore..."
                required
                autoComplete="off"
                style={{ width: '100%' }}
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: '#1a1a24', border: '2px solid var(--color-primary)',
                  borderRadius: '0.8rem', maxHeight: '200px', overflowY: 'auto',
                  zIndex: 50, marginTop: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                }}>
                  {suggestions.map((s, i) => (
                    <div 
                      key={i} 
                      style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}
                      onClick={() => {
                        setGuess(s);
                        setShowSuggestions(false);
                        updateGameState({ [`answers/${userId}`]: s });
                      }}
                    >
                      {s} <span style={{ float: 'right', fontSize: '0.8rem', color: 'var(--color-primary)' }}>👆</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return <div>Caricamento...</div>;
}
