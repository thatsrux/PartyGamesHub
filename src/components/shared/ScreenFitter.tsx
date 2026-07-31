import { useEffect, useState } from 'react';

interface ScreenFitterProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export default function ScreenFitter({ children, width = 1920, height = 1080 }: ScreenFitterProps) {
  const [scale, setScale] = useState(1);
  const [dynamicWidth, setDynamicWidth] = useState(width);
  const [dynamicHeight, setDynamicHeight] = useState(height);

  useEffect(() => {
    const calculateScale = () => {
      const scaleX = window.innerWidth / width;
      const scaleY = window.innerHeight / height;
      const newScale = Math.min(scaleX, scaleY);
      
      setScale(newScale);
      setDynamicWidth(window.innerWidth / newScale);
      setDynamicHeight(window.innerHeight / newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [width, height]);

  return (
    <div style={{
      width: '100vw',
      height: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: 'transparent'
    }}>
      <div style={{
        width: dynamicWidth,
        height: dynamicHeight,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        position: 'relative',
        flexShrink: 0
      }}>
        {children}
      </div>
    </div>
  );
}
