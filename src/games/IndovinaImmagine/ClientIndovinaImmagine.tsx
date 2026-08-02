import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';
import { checkAnswerFuzzy } from '../../utils/fuzzyMatch';
import { getServerTime } from '../../utils/serverTime';

export default function ClientIndovinaImmagine({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const myAnswerObj = gameState.answers?.[userId];
  const myAnswer = myAnswerObj?.answer;
  const phase = gameState.phase || 'question';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const currentQ = gameState.question;

  const [inputValue, setInputValue] = useState("");
  const [guessFeedback, setGuessFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (phase === 'question' && !myAnswerObj) {
      setInputValue("");
      setGuessFeedback(null);
    }
  }, [phase, myAnswerObj, gameState.questionIndex]);

  const handleAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (myAnswerObj || phase !== 'question' || !inputValue.trim()) return; 
    
    const isCorrect = checkAnswerFuzzy(inputValue.trim(), currentQ?.answers || []);
    
    if (isCorrect) {
      setGuessFeedback('correct');
      if (navigator.vibrate) navigator.vibrate(50);
      updateGameState({
        [`answers/${userId}`]: { answer: inputValue.trim(), time: getServerTime() },
        [`guessFeedback/${userId}`]: { status: 'correct', timestamp: getServerTime() }
      });
    } else {
      setGuessFeedback('wrong');
      setInputValue(''); // Clear input for next try
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      updateGameState({
        [`guessFeedback/${userId}`]: { status: 'wrong', timestamp: getServerTime() }
      });
      setTimeout(() => setGuessFeedback(null), 1500);
    }
  };

  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => returnToLobbyOrNextGame()}
        themeKey="indovina_immagine"
      />
    );
  }

  if (phase === 'reveal') {
    const correctAnswers = currentQ?.answers || [];
    const isCorrect = myAnswer && typeof myAnswer === 'string' && checkAnswerFuzzy(myAnswer, correctAnswers);
    
    return (
      <GameLayoutMobile themeKey="indovina_immagine" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 4} isMobile />
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
            <p style={{ margin: 0, color: 'white', fontWeight: 'bold' }}>La risposta corretta era:</p>
            <p style={{ fontSize: '1.5rem', color: 'var(--color-success)', fontWeight: 900, textTransform: 'uppercase' }}>
              {currentQ?.answers[0]}
            </p>
          </div>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: getServerTime() })}
            >
              {(gameState.questionIndex || 0) + 1 >= (gameState.totalRounds || gameState.settings?.rounds || 4) ? 'Termina Partita (Admin)' : 'Prossimo Round (Admin)'}
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  return (
    <GameLayoutMobile themeKey="indovina_immagine" style={{ justifyContent: 'center', paddingTop: '4rem' }}>
      <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 4} isMobile />
      <ProgressBar durationMs={(gameState.settings?.duration || 20) * 1000} startTime={gameState.startTime} />
      
      {!myAnswerObj ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', padding: '1rem 0' }}
        >
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ textAlign: 'center', color: 'white', fontSize: '1.5rem', marginBottom: '2rem' }}>
                Guarda la TV e scrivi cosa vedi!
            </h3>
            
            <form onSubmit={handleAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="La tua risposta..."
                    style={{
                        padding: '1.5rem',
                        fontSize: '1.5rem',
                        borderRadius: '1.5rem',
                        border: guessFeedback === 'wrong' ? '2px solid var(--color-danger)' : 'none',
                        outline: 'none',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.9)',
                        color: 'black',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s'
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />

                {guessFeedback === 'wrong' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', position: 'absolute', width: '100%', top: '-2rem' }}
                  >
                    ❌ Sbagliato, riprova!
                  </motion.div>
                )}

                <button 
                    type="submit"
                    className="btn btn-giant" 
                    style={{ 
                        backgroundColor: 'var(--color-primary)', 
                        color: 'white', 
                        fontSize: '1.5rem', 
                        fontWeight: 900,
                        borderRadius: '1.5rem',
                        padding: '1.5rem',
                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                        marginTop: '1rem'
                    }}
                    disabled={!inputValue.trim()}
                >
                    INVIA RISPOSTA
                </button>
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="panel"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}
        >
          <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>Risposta Corretta! ✅</h2>
          <p className="animate-pulse" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
            In attesa degli altri giocatori...
          </p>
        </motion.div>
      )}
      
    </GameLayoutMobile>
  );
}
