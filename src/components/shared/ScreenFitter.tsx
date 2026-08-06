import { useEffect, useState } from 'react';

interface ScreenFitterProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export default function ScreenFitter({ children, width = 1920, height = 1080 }: ScreenFitterProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.visualViewport?.width || window.innerWidth;
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const scaleX = viewportWidth / width;
      const scaleY = viewportHeight / height;
      const newScale = Math.min(scaleX, scaleY);
      
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    window.visualViewport?.addEventListener('resize', calculateScale);
    return () => {
      window.removeEventListener('resize', calculateScale);
      window.visualViewport?.removeEventListener('resize', calculateScale);
    };
  }, [width, height]);

  return (
    <div className="screen-fitter" style={{
      width: '100vw',
      height: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: 'transparent'
    }}>
      <div className="screen-fitter-stage" style={{
        '--host-vw': `${width / 100}px`,
        '--host-vh': `${height / 100}px`,
        width: width,
        height: height,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        position: 'relative',
        flexShrink: 0
      } as React.CSSProperties}>
        {children}
      </div>
    </div>
  );
}
