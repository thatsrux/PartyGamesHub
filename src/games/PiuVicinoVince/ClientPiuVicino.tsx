import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';
import { getServerTime } from '../../utils/serverTime';

export default function ClientPiuVicino({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const myAnswer = gameState.answers?.[userId];
  const phase = gameState.phase || 'question';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const currentQ = gameState.question;

  const [sliderValue, setSliderValue] = useState<number>(0);
  const [initializedForIndex, setInitializedForIndex] = useState<number>(-1);

  useEffect(() => {
    if (currentQ && phase === 'question' && myAnswer === undefined && gameState.questionIndex !== initializedForIndex) {
      setSliderValue(Math.floor((currentQ.min + currentQ.max) / 2));
      setInitializedForIndex(gameState.questionIndex);
    }
  }, [currentQ, phase, myAnswer, gameState.questionIndex, initializedForIndex]);

  const handleAnswer = () => {
    if (myAnswer !== undefined || phase !== 'question') return; 
    
    updateGameState({
      [`answers/${userId}`]: sliderValue
    });
  };

  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => returnToLobbyOrNextGame()}
        themeKey="piu_vicino"
      />
    );
  }

  if (phase === 'reveal') {
    const diff = myAnswer !== undefined ? Math.abs(myAnswer - currentQ?.answer) : null;
    const maxDiff = currentQ ? currentQ.max - currentQ.min : 1;
    let points = 0;
    if (diff !== null) {
      const normalizedDiff = diff / maxDiff;
      points = Math.floor(100 * Math.exp(-25 * Math.pow(normalizedDiff, 2)));
      if (diff === 0) points += 500; // Exact match bonus
    }
    
    return (
      <GameLayoutMobile themeKey="piu_vicino" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 5} isMobile />
        <motion.div 
          className="panel" 
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }}
          style={{ 
            padding: '3rem 1.5rem', 
            borderRadius: '2rem', 
            boxShadow: points > 0 ? '0 0 40px rgba(16, 185, 129, 0.4)' : myAnswer !== undefined ? '0 0 40px rgba(239, 68, 68, 0.4)' : 'none',
            border: points > 0 ? '2px solid var(--color-success)' : myAnswer !== undefined ? '2px solid var(--color-danger)' : '2px solid var(--color-warning)'
          }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: points > 0 ? 'var(--color-success)' : myAnswer !== undefined ? 'var(--color-danger)' : 'var(--color-warning)' }}>
            {points > 0 ? `+${points} PUNTI!` : myAnswer !== undefined ? '0 PUNTI' : '⏳ SCADUTO'}
          </h2>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
            <p style={{ margin: 0, color: 'white', fontWeight: 'bold' }}>La risposta esatta era:</p>
            <p style={{ fontSize: '2rem', color: 'var(--color-primary)', fontWeight: 900 }}>
              {currentQ?.answer} {currentQ?.unit || ''}
            </p>
            {myAnswer !== undefined && (
              <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                Tu hai detto: {myAnswer}
              </p>
            )}
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
    <GameLayoutMobile themeKey="piu_vicino" style={{ justifyContent: 'center', paddingTop: '4rem' }}>
      <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 5} isMobile />
      <ProgressBar durationMs={(gameState.settings?.duration || 20) * 1000} startTime={gameState.startTime} />
      
      {myAnswer === undefined ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', padding: '1rem 0' }}
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
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            
            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: '2rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {sliderValue} {currentQ?.unit || ''}
            </div>

            <input 
              type="range" 
              className="giant-slider"
              min={currentQ?.min || 0} 
              max={currentQ?.max || 100} 
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '0.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                <span>{currentQ?.min}</span>
                <span>{currentQ?.max}</span>
            </div>

          </div>

          <button 
            className="btn btn-giant" 
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'white', 
              fontSize: '2rem', 
              fontWeight: 900,
              borderRadius: '2rem',
              padding: '1.5rem',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
            }}
            onClick={handleAnswer}
          >
            CONFERMA
          </button>
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
            Hai scelto: {myAnswer} {currentQ?.unit || ''}
          </p>
          <p className="animate-pulse" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
            In attesa degli altri giocatori...
          </p>
        </motion.div>
      )}
      
    </GameLayoutMobile>
  );
}
