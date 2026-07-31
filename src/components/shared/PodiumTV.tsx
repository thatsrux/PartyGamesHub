import { motion } from 'framer-motion';
import Avatar from './Avatar';
import { computeRanking } from '../../utils/ranking';



export default function PodiumTV({ players, points }: { players: any, points: Record<string, number> }) {
  const playersWithScore = Object.fromEntries(
    Object.entries(players || {}).map(([id, p]: any) => [id, { ...p, score: points?.[id] || 0 }])
  );
  const rankedPlayers = computeRanking(playersWithScore);
  
  const top1 = rankedPlayers.filter(p => p.rank === 1);
  const top2 = rankedPlayers.filter(p => p.rank === 2);
  const top3 = rankedPlayers.filter(p => p.rank === 3);

  const podiumSteps = [
    { rank: 2, players: top2, height: '25vh', color: '#9ca3af', medal: '🥈', delay: 0.2 },
    { rank: 1, players: top1, height: '35vh', color: '#fbbf24', medal: '🥇', delay: 0 },
    { rank: 3, players: top3, height: '15vh', color: '#b45309', medal: '🥉', delay: 0.4 },
  ];

  return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'hidden', flex: 1, justifyContent: 'center' }}>
      <h1 style={{ fontSize: 'clamp(3rem, 6vh, 5rem)', color: 'var(--color-primary)', marginBottom: '6vh', marginTop: '0', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Classifica Finale</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '3vw', flexShrink: 0 }}>
        {podiumSteps.map(step => {
          if (step.players.length === 0) return null;
          return (
            <motion.div key={`rank-${step.rank}`} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: step.delay }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 4 - step.rank }}>
              <div style={{ marginBottom: '2vh', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {step.players.map(p => (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar photo={p.photo} name={p.name} size={step.rank === 1 ? 130 : 90} />
                    <div style={{ fontSize: 'clamp(1.5rem, 3vh, 2.5rem)', fontWeight: 'bold', marginTop: '1vh', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{p.name}</div>
                    <div style={{ fontSize: 'clamp(1.2rem, 2vh, 1.8rem)', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>{p.score} pt</div>
                  </div>
                ))}
              </div>
              <div style={{ 
                minWidth: 'clamp(150px, 20vw, 300px)',
                padding: '0 1.5rem',
                width: '100%',
                height: step.height, 
                backgroundColor: step.color,
                borderRadius: '2rem 2rem 0 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 'clamp(4rem, 10vh, 8rem)',
                fontWeight: 'bold',
                color: 'rgba(0,0,0,0.5)',
                boxShadow: `0 0 40px ${step.color}`
              }}>
                {step.medal}
              </div>
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
}
