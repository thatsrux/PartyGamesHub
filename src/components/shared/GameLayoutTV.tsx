import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { gameThemes } from '../../utils/theme';
import type { GameThemeKey } from '../../utils/theme';
import ScreenFitter from './ScreenFitter';
import Background from './Background';

interface GameLayoutTVProps {
  children: ReactNode;
  themeKey?: GameThemeKey;
  leaderboard?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  customBackground?: string;
}

export default function GameLayoutTV({ children, themeKey = 'default', leaderboard, className = '', style = {}, customBackground }: GameLayoutTVProps) {
  const theme = gameThemes[themeKey];

  return (
    <Background theme={themeKey} customBackground={customBackground}>
      <ScreenFitter>
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          height: '100%', 
          margin: '0 auto',
          padding: '2rem 4rem', 
          zIndex: 1,
          gap: '4rem',
          ...style
        }} className={className}>
          {/* Main Game Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minWidth: 0 // Prevent flex children from overflowing
          }}>
            {children}
          </div>

          {/* Sidebar for Leaderboard */}
          {leaderboard && (
            <div style={{
              width: '400px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}>
              <div id="round-tracker-slot" />
              {leaderboard}
            </div>
          )}
        </div>
      </ScreenFitter>
    </Background>
  );
}
