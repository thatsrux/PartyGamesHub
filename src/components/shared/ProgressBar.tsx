import { useEffect, useRef } from 'react';
import { getServerTime } from '../../utils/serverTime';

interface ProgressBarProps {
  durationMs: number;
  startTime?: number;
  onComplete?: () => void;
}

export default function ProgressBar({ durationMs, startTime, onComplete }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    // Se non c'è startTime (es. gioco legacy), usiamo il getServerTime() iniziale
    const actualStartTime = startTime || getServerTime();
    completedRef.current = false;

    let animationFrameId: number;

    const update = () => {
      const now = getServerTime();
      const elapsed = Math.max(0, now - actualStartTime);
      const remainingMs = Math.max(0, durationMs - elapsed);
      const percent = (remainingMs / durationMs) * 100;

      if (barRef.current) {
        barRef.current.style.width = `${percent}%`;
        
        // Color transition logic (green -> yellow -> red)
        if (percent > 50) {
           barRef.current.style.backgroundColor = '#22c55e'; // Green
        } else if (percent > 20) {
           barRef.current.style.backgroundColor = '#eab308'; // Yellow
        } else {
           barRef.current.style.backgroundColor = '#ef4444'; // Red
        }
      }

      if (remainingMs <= 0) {
        if (!completedRef.current) {
          completedRef.current = true;
          if (onComplete) {
              onComplete();
          }
        }
      } else {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [durationMs, startTime, onComplete]);

  return (
    <div style={{ 
      width: '100%', 
      height: '15px', 
      background: 'rgba(255,255,255,0.1)', 
      borderRadius: '10px', 
      overflow: 'hidden',
      marginTop: '2rem',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
    }}>
      <div
        ref={barRef}
        style={{ 
          height: '100%', 
          borderRadius: '10px',
          width: '100%',
          backgroundColor: '#22c55e',
          // Nessuna transizione CSS: aggiorniamo a 60fps direttamente
          // Questo risolve il problema delle animazioni messe in pausa su mobile quando si backgrounda l'app
          transition: 'none' 
        }}
      />
    </div>
  );
}
