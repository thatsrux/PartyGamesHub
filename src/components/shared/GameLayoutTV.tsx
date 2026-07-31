import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { gameThemes } from '../../utils/theme';
import type { GameThemeKey } from '../../utils/theme';
import ScreenFitter from './ScreenFitter';

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
    <ScreenFitter>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        background: customBackground || theme.backgroundGradient, 
        overflow: 'hidden',
        position: 'relative',
        ...style
      }} className={className}>
        {/* Background Decorative Elements */}
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }} 
          style={{ 
            position: 'absolute', 
            top: '-20%', left: '-10%', 
            width: '50%', height: '50%', 
            background: theme.orb1Color, 
            borderRadius: '50%',
            pointerEvents: 'none'
          }} 
        />
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }} 
          style={{ 
            position: 'absolute', 
            bottom: '-20%', right: '-10%', 
            width: '60%', height: '60%', 
            background: theme.orb2Color, 
            borderRadius: '50%',
            pointerEvents: 'none'
          }} 
        />

        <div style={{ 
          display: 'flex', 
          width: '100%', 
          height: '100%', 
          margin: '0 auto',
          padding: '2rem 4rem', 
          zIndex: 1,
          gap: '4rem'
        }}>
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
      </div>
    </ScreenFitter>
  );
}
