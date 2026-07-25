import { motion, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import { computeRanking } from '../../utils/ranking';

function AnimatedScore({ value }: { value: number }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!nodeRef.current) return;
    const currentVal = parseInt(nodeRef.current.textContent || '0');
    if (currentVal === value) return;
    
    const controls = animate(currentVal, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(v) {
        if (nodeRef.current) {
          nodeRef.current.textContent = Math.round(v).toString();
        }
      }
    });
    return () => controls.stop();
  }, [value]);

  return <div ref={nodeRef}>{value}</div>;
}

function PlayerRow({ p, animateUpdates }: { p: any, animateUpdates?: boolean }) {
  const [highlight, setHighlight] = useState(false);
  const prevScore = useRef(p.score || 0);

  useEffect(() => {
    if (animateUpdates && p.score > prevScore.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 2000);
      prevScore.current = p.score;
      return () => clearTimeout(timer);
    }
  }, [p.score, animateUpdates]);

  return (
    <motion.div 
      layout 
      initial={false}
      animate={highlight ? { 
        scale: [1, 1.05, 1], 
        backgroundColor: ['rgba(255,255,255,0)', 'rgba(16,185,129,0.4)', 'rgba(255,255,255,0)'],
        boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 20px rgba(16,185,129,0.5)', '0 0 0px rgba(16,185,129,0)']
      } : { backgroundColor: 'rgba(255,255,255,0)', boxShadow: '0 0 0px rgba(0,0,0,0)', scale: 1 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.2rem', 
        fontSize: '1.6rem',
        padding: '0.5rem',
        borderRadius: '1rem'
      }}
    >
      <div style={{ width: '40px', fontWeight: 'bold', color: p.rank === 1 ? '#fbbf24' : p.rank === 2 ? '#9ca3af' : p.rank === 3 ? '#d97706' : 'var(--color-text-muted)' }}>
        {p.rank}°
      </div>
      <Avatar photo={p.photo} name={p.name} size={48} />
      <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px', fontWeight: 'bold' }}>
        {p.name}
      </div>
      <div style={{ fontWeight: 'bold', color: 'var(--color-success)', fontSize: '2rem' }}>
        {animateUpdates ? <AnimatedScore value={p.score || 0} /> : (p.score || 0)}
      </div>
    </motion.div>
  );
}

export default function MiniLeaderboardTV({ players, animateUpdates }: { players: any, animateUpdates?: boolean }) {
  const rankedPlayers = computeRanking(players);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || el.scrollHeight <= el.clientHeight) return;

    let scrollPos = 0;
    let direction = 1;
    
    const interval = setInterval(() => {
      scrollPos += 0.5 * direction;
      
      if (scrollPos >= el.scrollHeight - el.clientHeight + 10) {
        direction = -1;
        scrollPos = el.scrollHeight - el.clientHeight;
      } else if (scrollPos <= -10) {
        direction = 1;
        scrollPos = 0;
      }
      
      if (scrollPos >= 0 && scrollPos <= el.scrollHeight - el.clientHeight) {
        el.scrollTop = scrollPos;
      }
    }, 20);

    return () => clearInterval(interval);
  }, [rankedPlayers.length]);

  return (
    <div style={{ 
      background: 'rgba(0,0,0,0.6)', 
      borderRadius: '1rem', 
      padding: '2rem', 
      border: '1px solid rgba(255,255,255,0.1)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.8rem', color: 'var(--color-primary)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>Classifica</h3>
      
      <div 
        ref={scrollRef}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.8rem',
          overflowY: 'hidden',
          flex: 1,
          paddingRight: '0.5rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {rankedPlayers.map((p: any) => (
          <PlayerRow key={p.id} p={p} animateUpdates={animateUpdates} />
        ))}
      </div>
    </div>
  );
}
