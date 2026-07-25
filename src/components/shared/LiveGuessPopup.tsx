import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type GuessEvent = {
  id: string; // unique event id
  playerId: string;
  playerName: string;
  playerPhoto?: string;
  text: string;
  isCorrect: boolean;
};

interface Props {
  guess: GuessEvent | null;
}

export default function LiveGuessPopup({ guess }: Props) {
  const [currentGuess, setCurrentGuess] = useState<GuessEvent | null>(null);

  useEffect(() => {
    if (guess) {
      setCurrentGuess(guess);
      const timer = setTimeout(() => {
        setCurrentGuess((prev) => prev?.id === guess.id ? null : prev);
      }, 1500); 
      return () => clearTimeout(timer);
    } else {
      setCurrentGuess(null);
    }
  }, [guess]);

  return (
    <AnimatePresence>
      {currentGuess && (
        <motion.div
          key={currentGuess.id}
          initial={{ opacity: 0, y: 15, x: '-50%', scale: 0, rotate: -20 }}
          animate={{ opacity: 1, y: -30, x: '-50%', scale: 1.2, rotate: 0 }}
          exit={{ opacity: 0, y: -50, x: '-50%', scale: 0, rotate: 20 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          style={{
            position: 'absolute',
            top: '0%',
            left: '50%',
            background: currentGuess.isCorrect ? 'var(--color-success)' : 'var(--color-danger)',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 15px ${currentGuess.isCorrect ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
            border: '3px solid rgba(255,255,255,0.8)',
            zIndex: 50,
            pointerEvents: 'none'
          }}
        >
          <span style={{ 
            fontSize: '1.4rem', 
            fontWeight: '900', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {currentGuess.isCorrect ? '✓' : '✖'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
