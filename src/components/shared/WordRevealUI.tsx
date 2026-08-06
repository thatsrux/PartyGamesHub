import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WordRevealUI.css';

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
      const elapsed = Date.now() - startTime;
      const revealInterval = durationMs / (revealSequence.length + 1);
      const numRevealed = Math.min(revealSequence.length, Math.max(0, Math.floor(elapsed / revealInterval)));
      setRevealedIndices(new Set(revealSequence.slice(0, numRevealed)));
    };

    updateRevealed();
    const interval = window.setInterval(updateRevealed, 500);
    return () => window.clearInterval(interval);
  }, [word, revealSequence, startTime, durationMs]);

  if (!word) return null;

  const words = word.trim().split(/\s+/).filter(Boolean);
  const longestWord = Math.max(1, ...words.map(part => Array.from(part).length));
  const mobileTileVw = Math.min(9, 82 / longestWord);
  const tvTileRem = Math.min(4, 64 / longestWord);
  const tileSize = isTV ? `clamp(1.8rem, ${tvTileRem}rem, 4rem)` : `clamp(.72rem, ${mobileTileVw}vw, 2.2rem)`;

  let globalIndex = 0;

  return (
    <div
      className={`word-reveal${isTV ? ' word-reveal--tv' : ''}`}
      style={{ '--word-tile-size': tileSize } as React.CSSProperties}
      aria-label={`${words.length} ${words.length === 1 ? 'parola' : 'parole'}`}
    >
      {words.map((part, wordIndex) => (
        <div className="word-reveal__word" key={`${part}-${wordIndex}`} aria-label={`Parola ${wordIndex + 1}`}>
          {Array.from(part).map((char, charIndex) => {
            const currentIndex = globalIndex++;
            const isRevealed = revealedIndices.has(currentIndex);
            return (
              <div className={`word-reveal__tile${isRevealed ? ' word-reveal__tile--revealed' : ''}`} key={`${charIndex}-${char}`}>
                <AnimatePresence>
                  {isRevealed && (
                    <motion.span initial={{ scale: .5, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: .5, opacity: 0, y: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
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
