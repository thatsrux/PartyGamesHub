import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedScore({ previousScore, roundPoints, targetScore, isMobile = false }: { previousScore: number, roundPoints: number, targetScore: number, isMobile?: boolean }) {
  const [displayScore, setDisplayScore] = useState(previousScore);
  const [showAdded, setShowAdded] = useState(false);
  const [isAbsorbing, setIsAbsorbing] = useState(false);

  useEffect(() => {
    setDisplayScore(previousScore);
    setShowAdded(false);
    setIsAbsorbing(false);

    // 1. Show the "+X" text
    const t1 = setTimeout(() => setShowAdded(true), 1200);
    
    // 2. Trigger the +X flying into the score
    const t2 = setTimeout(() => {
       setShowAdded(false);
    }, 2500);
    
    // 3. Right as the +X hits the score, absorb it and count up
    const t3 = setTimeout(() => {
       setIsAbsorbing(true);
       
       let start = previousScore;
       const duration = 800;
       const startTime = performance.now();
       
       const updateScore = (time: number) => {
         const elapsed = time - startTime;
         const progress = Math.min(elapsed / duration, 1);
         const easeProgress = 1 - Math.pow(1 - progress, 3);
         
         setDisplayScore(Math.floor(start + (targetScore - start) * easeProgress));
         
         if (progress < 1) {
           requestAnimationFrame(updateScore);
         } else {
           setDisplayScore(targetScore);
           // After counting is done, scale back down
           setTimeout(() => setIsAbsorbing(false), 200);
         }
       };
       requestAnimationFrame(updateScore);
       
    }, 2700);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [previousScore, targetScore, roundPoints]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem', justifyContent: 'flex-end', minWidth: isMobile ? '80px' : '160px' }}>
       <AnimatePresence>
         {showAdded && roundPoints > 0 && (
           <motion.div
             initial={{ opacity: 0, y: isMobile ? 10 : 20, scale: 0.5 }}
             animate={{ opacity: 1, y: 0, scale: 1.1 }}
             exit={{ opacity: 0, x: isMobile ? 10 : 20, scale: 0.5 }}
             transition={{ duration: 0.4, ease: "anticipate" }}
             style={{ 
               color: 'var(--color-success)', 
               fontWeight: 'bold', 
               fontSize: isMobile ? '1.5rem' : '2.5rem',
               textShadow: '0 0 10px rgba(34,197,94,0.5)',
               zIndex: 10
             }}
           >
             +{roundPoints}
           </motion.div>
         )}
       </AnimatePresence>
       
       <motion.div
         animate={{ 
           scale: isAbsorbing ? 1.2 : 1,
           color: isAbsorbing ? '#fbbf24' : '#ffffff',
           textShadow: isAbsorbing ? '0 0 20px #fbbf24' : '0 2px 10px rgba(0,0,0,0.5)'
         }}
         transition={{ duration: 0.3 }}
         style={{ fontSize: isMobile ? '1.8rem' : '3.5rem', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}
       >
         {displayScore} pt
       </motion.div>
    </div>
  );
}
