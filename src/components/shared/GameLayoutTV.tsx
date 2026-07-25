import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { gameThemes } from '../../utils/theme';
import type { GameThemeKey } from '../../utils/theme';

interface GameLayoutTVProps {
  children: ReactNode;
  themeKey?: GameThemeKey;
}

export default function GameLayoutTV({ children, themeKey = 'default' }: GameLayoutTVProps) {
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
        flexDirection: 'column',
        width: '100%', 
        height: '100%', 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem', 
        zIndex: 1 
      }}>
        {children}
      </div>
    </div>
  );
}
