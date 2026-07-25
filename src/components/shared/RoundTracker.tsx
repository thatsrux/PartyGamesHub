import { motion } from 'framer-motion';

export default function RoundTracker({ current, total, isMobile = false }: { current: number, total: number, isMobile?: boolean }) {
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
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ 
        position: 'absolute', 
        top: '2rem', 
        right: '2rem', 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        background: 'rgba(255,255,255,0.1)', 
        padding: '0.8rem 1.5rem', 
        borderRadius: '2rem', 
        border: '1px solid rgba(255,255,255,0.2)',
        zIndex: 100,
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
      }}
    >
      Round {current} di {total}
    </motion.div>
  );
}
