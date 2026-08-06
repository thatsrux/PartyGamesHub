import type { ReactNode } from 'react';
import { gameThemes } from '../../utils/theme';
import type { GameThemeKey } from '../../utils/theme';

interface GameLayoutMobileProps {
  children: ReactNode;
  themeKey?: GameThemeKey;
  className?: string;
  style?: React.CSSProperties;
  customBackground?: string;
}

export default function GameLayoutMobile({ children, themeKey = 'default', className = '', style = {}, customBackground }: GameLayoutMobileProps) {
  const theme = gameThemes[themeKey];
  const defaultPadding = style.padding === undefined ? {
    paddingTop: '1.5rem',
    paddingRight: '1.5rem',
    paddingBottom: '1.5rem',
    paddingLeft: '1.5rem'
  } : {};

  return (
    <div 
      className="game-layout-mobile-shell"
      style={{ 
        background: customBackground || theme.backgroundGradient, 
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div 
        className={`game-layout-mobile ${className}`.trim()}
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          ...defaultPadding,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          ...style
        }}
      >
        {children}
      </div>
    </div>
  );
}
