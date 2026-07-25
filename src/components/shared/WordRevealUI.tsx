import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordRevealUIProps {
  word: string;
  revealSequence: number[];
  startTime: number;
  durationMs: number;
  isTV?: boolean;
}

export default function WordRevealUI({ word, revealSequence, startTime, durationMs, isTV = false }: WordRevealUIProps) {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!word || !revealSequence || revealSequence.length === 0) {
      setRevealedIndices(new Set());
      return;
    }

    const updateRevealed = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const revealInterval = durationMs / (revealSequence.length + 1);
      
      const numRevealed = Math.min(
        revealSequence.length,
        Math.max(0, Math.floor(elapsed / revealInterval))
      );

      setRevealedIndices(new Set(revealSequence.slice(0, numRevealed)));
    };

    updateRevealed();
    const interval = setInterval(updateRevealed, 500);

    return () => clearInterval(interval);
  }, [word, revealSequence, startTime, durationMs]);

  if (!word) return null;

  const words = word.split(' ');

  const tileSize = isTV ? '4rem' : 'min(9vw, 2.2rem)';
  const fontSize = isTV ? '2.5rem' : 'min(5.5vw, 1.4rem)';
  const gap = isTV ? '0.8rem' : 'min(1.5vw, 0.3rem)';
  const wordGap = isTV ? '2rem' : '1rem';

  let globalIndex = 0;

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'center', 
      gap: wordGap,
      marginBottom: isTV ? '1.5rem' : '1rem',
      padding: '0.5rem',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      {words.map((w, wIndex) => (
        <div key={wIndex} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: gap }}>
          {w.split('').map((char, cIndex) => {
            const currentIndex = globalIndex++;
            const isRevealed = revealedIndices.has(currentIndex);

            return (
              <div 
                key={cIndex} 
                style={{ 
                  width: tileSize, 
                  height: tileSize, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: isRevealed ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                  color: isRevealed ? 'white' : 'transparent',
                  borderRadius: '0.5rem',
                  fontSize: fontSize,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  border: isRevealed ? '2px solid var(--color-primary)' : '2px dashed rgba(255,255,255,0.2)',
                  boxShadow: isRevealed ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <AnimatePresence>
                  {isRevealed && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.5, opacity: 0, y: -10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {char}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
