import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref as dbRef, get } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundTracker from '../../components/shared/RoundTracker';
import RoundLeaderboardMobile from '../../components/shared/RoundLeaderboardMobile';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';

export default function ClientLaCarriera({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
  const [guess, setGuess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const gameState = lobby?.game_state || {};
  const myAnswerData = gameState.answers?.[userId];
  const myAnswer = typeof myAnswerData === 'object' ? myAnswerData?.value : myAnswerData;
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

  // Pulisci l'input all'inizio di un nuovo round o quando la risposta viene rifiutata
  useEffect(() => {
    if (!myAnswer) {
      setGuess('');
    }
  }, [myAnswer, gameState.questionIndex]);

  // Gestione feedback errore se l'Host rifiuta la risposta
  useEffect(() => {
    if (isSubmitting && !myAnswer && phase === 'question') {
      // Host ha cancellato la risposta -> era errata
      setIsSubmitting(false);
      setError("❌ Sbagliato, riprova!");
      setTimeout(() => setError(null), 3000);
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } else if (isSubmitting && myAnswer && phase !== 'question') {
      // Round finito, reset submit
      setIsSubmitting(false);
    }
  }, [myAnswer, isSubmitting, phase]);

  const [guessFeedback, setGuessFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Rimuovi accenti e caratteri speciali per la ricerca
  const normalizeStr = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ø/g, 'o')
      .replace(/æ/g, 'ae')
      .replace(/œ/g, 'oe')
      .replace(/ß/g, 'ss')
      .replace(/ł/g, 'l')
      .replace(/ð/g, 'd')
      .replace(/þ/g, 'th')
      .replace(/đ/g, 'd');
  };

  const suggestions = guess.trim() 
    ? allPlayers.filter(p => normalizeStr(p).includes(normalizeStr(guess)) && p !== guess)
    : [];

  const currentCareer = gameState.selectedCareers?.[gameState.questionIndex];

  const handleSubmit = (e?: React.FormEvent, directGuess?: string) => {
    if (e) e.preventDefault();
    const guessToSubmit = (directGuess || guess).trim();
    if (myAnswer || phase !== 'question' || !guessToSubmit) return;
    
    // Validazione stringente: il nome DEVE essere nella lista
    if (!allPlayers.includes(guessToSubmit)) {
      setError("⚠️ Seleziona un giocatore dalla tendina dei suggerimenti!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const isCorrect = Boolean(currentCareer && guessToSubmit.toLowerCase() === currentCareer.name.toLowerCase());

    if (isCorrect) {
      setGuessFeedback('correct');
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      updateGameState({
        [`answers/${userId}`]: {
          value: guessToSubmit,
          timeElapsed: Date.now() - (gameState.startTime || Date.now())
        },
        [`guessFeedback/${userId}`]: { status: 'correct', timestamp: Date.now() }
      });
    } else {
      setGuessFeedback('wrong');
      if (navigator.vibrate) navigator.vibrate([300]);
      setGuess('');
      setTimeout(() => setGuessFeedback(null), 800);
      
      updateGameState({
        [`guessFeedback/${userId}`]: { status: 'wrong', timestamp: Date.now() }
      });
    }
  };

  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => returnToLobbyOrNextGame()} 
      />
    );
  }

  if (phase === 'reveal') {
    const isCorrect = Boolean(myAnswer && currentCareer && myAnswer.toLowerCase().trim() === currentCareer.name.toLowerCase());

    return (
      <GameLayoutMobile themeKey="la_carriera" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.settings?.rounds || 10} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          {!myAnswer ? (
            <>
              <h2 style={{ fontSize: '2.5rem', color: '#ef4444' }}>Tempo scaduto!</h2>
              <div style={{ marginTop: '2rem' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>La risposta corretta era:</p>
                <p style={{ color: 'var(--color-success)', fontSize: '1.8rem', fontWeight: 'bold' }}>{currentCareer?.name}</p>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '2.5rem', color: isCorrect ? 'var(--color-success)' : '#ef4444' }}>
                {isCorrect ? '✅ Esatto!' : '❌ Sbagliato!'}
              </h2>
              <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Hai risposto:</p>
              <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--color-primary)' }}>
                {myAnswer}
              </h3>
              
              {!isCorrect && currentCareer && (
                <div style={{ marginTop: '2rem' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>La risposta corretta era:</p>
                  <p style={{ color: 'var(--color-success)', fontSize: '1.8rem', fontWeight: 'bold' }}>{currentCareer.name}</p>
                </div>
              )}
            </>
          )}
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
            >
              Vedi Classifica (Admin)
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  if (phase === 'results') {
    return (
      <GameLayoutMobile themeKey="la_carriera" style={{ justifyContent: 'center' }}>
        <RoundLeaderboardMobile 
          players={lobby?.players} 
          points={Object.fromEntries(Object.entries(lobby?.players || {}).map(([id, p]: any) => [id, p.score || 0]))} 
          roundPoints={gameState.roundPoints || {}} 
          roundName={`Round ${(gameState.questionIndex || 0) + 1}`}
        />
        
        {isAdmin && (
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '2rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
            onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
          >
            Prossimo Round (Admin)
          </button>
        )}
      </GameLayoutMobile>
    );
  }

  const isMyAnswerCorrect = Boolean(myAnswer && currentCareer && myAnswer.toLowerCase().trim() === currentCareer.name.toLowerCase());

  if (myAnswer && isMyAnswerCorrect) {
    return (
      <GameLayoutMobile themeKey="la_carriera" style={{ justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
        <motion.div className="panel" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <h2 style={{ color: 'var(--color-success)', fontSize: '2.5rem' }}>
            ✅ Esatto!
          </h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Hai risposto:</p>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--color-primary)' }}>
            {myAnswer}
          </h3>
          <div className="animate-pulse" style={{ marginTop: '3rem', fontSize: '1.2rem', marginBottom: '2rem' }}>
            In attesa degli altri giocatori...
          </div>
          
          <ProgressBar 
            key={`progress-${gameState.questionIndex}`}
            durationMs={(gameState.settings?.duration || 30) * 1000} 
            startTime={gameState.startTime} 
          />
        </motion.div>
      </GameLayoutMobile>
    );
  }

  return (
    <GameLayoutMobile themeKey="la_carriera" style={{ padding: '4rem 1rem 1rem 1rem' }}>
      <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.settings?.rounds || 10} isMobile />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Chi è il giocatore?</h2>
        {gameState.settings?.rounds && (
          <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
            Round {gameState.questionIndex + 1} di {gameState.settings.rounds}
          </div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="panel"
          animate={
            guessFeedback === 'wrong' 
              ? { x: [-10, 10, -10, 10, 0], backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)' } 
              : guessFeedback === 'correct' 
              ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)' } 
              : { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }
          }
          transition={{ duration: 0.4 }}
        >
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
            Guarda i loghi sulla TV e digita il nome esatto.
          </p>
          
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '1rem' }}>
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
                      handleSubmit(undefined, s);
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
        </motion.form>
      </motion.div>
    </GameLayoutMobile>
  );
}
