import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { gameThemes } from '../../utils/theme';
import type { GameThemeKey } from '../../utils/theme';

interface GameLayoutTVProps {
  children: ReactNode;
  themeKey?: GameThemeKey;
  leaderboard?: ReactNode;
}

export default function GameLayoutTV({ children, themeKey = 'default', leaderboard }: GameLayoutTVProps) {
  const theme = gameThemes[themeKey];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      background: theme.backgroundGradient, 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Decorative Elements */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }} 
        style={{ 
          position: 'absolute', 
          top: '-20vh', left: '-10vw', 
          width: '50vw', height: '50vw', 
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
          bottom: '-20vh', right: '-10vw', 
          width: '60vw', height: '60vw', 
          background: theme.orb2Color, 
          borderRadius: '50%',
          pointerEvents: 'none'
        }} 
      />

      <div style={{ 
        display: 'flex', 
        width: '100%', 
        height: '100%', 
        maxWidth: '1600px',
        margin: '0 auto',
        padding: 'max(env(safe-area-inset-top, 20px), 3vh) max(env(safe-area-inset-right, 20px), 3vw) max(env(safe-area-inset-bottom, 20px), 3vh) max(env(safe-area-inset-left, 20px), 3vw)', 
        zIndex: 1,
        gap: '2rem'
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
            width: 'clamp(300px, 25vw, 400px)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {leaderboard}
          </div>
        )}
      </div>
    </div>
  );
}
