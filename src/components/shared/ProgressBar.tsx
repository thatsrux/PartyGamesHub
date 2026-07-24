import { motion } from 'framer-motion';

interface ProgressBarProps {
  durationMs: number;
  startTime?: number;
  onComplete?: () => void;
}

export default function ProgressBar({ durationMs, startTime, onComplete }: ProgressBarProps) {
  const elapsed = startTime ? Math.max(0, Date.now() - startTime) : 0;
  const remainingMs = Math.max(0, durationMs - elapsed);
  const initialPercent = (remainingMs / durationMs) * 100;
  
  if (remainingMs === 0 && onComplete) {
    // If already finished when mounting, we could trigger onComplete immediately
    // but usually we just let the parent handle it or we just return an empty bar
  }

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
      <motion.div
        initial={{ width: `${initialPercent}%`, backgroundColor: '#22c55e' }}
        animate={{ 
          width: '0%', 
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'] 
        }}
        transition={{ 
          width: { duration: remainingMs / 1000, ease: 'linear' },
          backgroundColor: { duration: remainingMs / 1000, ease: 'linear', times: [0, 0.5, 1] }
        }}
        onAnimationComplete={onComplete}
        style={{ height: '100%', borderRadius: '10px' }}
      />
    </div>
  );
}
