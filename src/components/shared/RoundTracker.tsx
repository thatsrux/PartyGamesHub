import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export default function RoundTracker({ current, total, isMobile = false }: { current: number, total: number, isMobile?: boolean }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById('round-tracker-slot'));
  }, []);

  if (isMobile) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          position: 'fixed', 
          top: '15px', 
          right: '15px', 
          fontSize: '1rem', 
          fontWeight: 'bold', 
          background: 'rgba(255,255,255,0.1)', 
          padding: '0.5rem 1rem', 
          borderRadius: '2rem', 
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 1500,
          backdropFilter: 'blur(5px)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
        }}
      >
        Round {current} / {total}
      </motion.div>
    );
  }

  // TV (Host) Layout
  const content = (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        background: 'rgba(255,255,255,0.1)', 
        padding: '1.2rem 1.5rem', 
        borderRadius: '1rem', 
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        textAlign: 'center',
        width: '100%',
        flexShrink: 0
      }}
    >
      Round {current} di {total}
    </motion.div>
  );

  if (slot) {
    return createPortal(content, slot);
  }

  // Fallback while waiting for slot or if no sidebar is present
  return (
    <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 100 }}>
      {content}
    </div>
  );
}
