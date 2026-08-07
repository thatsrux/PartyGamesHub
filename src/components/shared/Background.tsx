import { motion } from 'framer-motion';
import { gameThemes } from '../../utils/theme';
import type { GameThemeKey } from '../../utils/theme';

interface BackgroundProps {
  theme?: GameThemeKey;
  children?: React.ReactNode;
  customBackground?: string;
  contentRef?: React.Ref<HTMLDivElement>;
}

export default function Background({ theme = 'default', children, customBackground, contentRef }: BackgroundProps) {
  const currentTheme = gameThemes[theme];

  return (
    <div className="app-background" style={{
      display: 'flex', 
      flexDirection: 'column', 
      height: '100dvh', /* Fix iOS Safari bouncing */
      background: customBackground || currentTheme.backgroundGradient, 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Decorative Elements */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }} 
        style={{ 
          position: 'absolute', 
          top: '-20vh', 
          left: '-10vw', 
          width: '50vw', 
          height: '50vw', 
          background: currentTheme.orb1Color, 
          borderRadius: '50%',
          zIndex: 0
        }} 
      />
      <motion.div 
        animate={{ rotate: -360 }} 
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }} 
        style={{ 
          position: 'absolute', 
          bottom: '-20vh', 
          right: '-10vw', 
          width: '60vw', 
          height: '60vw', 
          background: currentTheme.orb2Color, 
          borderRadius: '50%',
          zIndex: 0
        }} 
      />
      
      {/* Content wrapper */}
      <div ref={contentRef} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
