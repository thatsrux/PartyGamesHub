import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { gameThemes, type GameThemeKey } from '../../utils/theme';
import './GameTitleTV.css';

interface GameTitleTVProps {
  title: string;
  icon: string;
  themeKey?: GameThemeKey;
  eyebrow?: string;
  compact?: boolean;
  className?: string;
}

export default function GameTitleTV({
  title,
  icon,
  themeKey = 'default',
  eyebrow = 'PartyHub Game',
  compact = false,
  className = ''
}: GameTitleTVProps) {
  const style = {
    '--game-title-accent': gameThemes[themeKey].primaryColor
  } as CSSProperties;

  return (
    <motion.header
      className={`game-title-tv${compact ? ' game-title-tv--compact' : ''} ${className}`.trim()}
      style={style}
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <span className="game-title-tv__icon" aria-hidden="true">{icon}</span>
      <span className="game-title-tv__copy">
        <span className="game-title-tv__eyebrow">{eyebrow}</span>
        <span className="game-title-tv__title">{title}</span>
      </span>
    </motion.header>
  );
}
