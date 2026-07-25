import { motion } from 'framer-motion';
import Avatar from './Avatar';
import { computeRanking } from '../../utils/ranking';

const PLAYER_GRADIENTS = [
  'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.1))',
  'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.1))',
  'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.1))',
  'linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(217, 119, 6, 0.1))',
  'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(124, 58, 237, 0.1))',
  'linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(219, 39, 119, 0.1))',
  'linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(2, 132, 199, 0.1))',
  'linear-gradient(135deg, rgba(249, 115, 22, 0.4), rgba(234, 88, 12, 0.1))',
];

const PLAYER_BORDERS = [
  'rgba(239, 68, 68, 0.6)',
  'rgba(59, 130, 246, 0.6)',
  'rgba(16, 185, 129, 0.6)',
  'rgba(245, 158, 11, 0.6)',
  'rgba(139, 92, 246, 0.6)',
  'rgba(236, 72, 153, 0.6)',
  'rgba(14, 165, 233, 0.6)',
  'rgba(249, 115, 22, 0.6)',
];

export default function PodiumTV({ players, points }: { players: any, points: Record<string, number> }) {
  const playersWithScore = Object.fromEntries(
    Object.entries(players || {}).map(([id, p]: any) => [id, { ...p, score: points?.[id] || 0 }])
  );
  const rankedPlayers = computeRanking(playersWithScore);
  
  const top1 = rankedPlayers.filter(p => p.rank === 1);
  const top2 = rankedPlayers.filter(p => p.rank === 2);
  const top3 = rankedPlayers.filter(p => p.rank === 3);

  const podiumSteps = [
    { rank: 2, players: top2, height: '220px', color: '#9ca3af', medal: '🥈', delay: 0.2 },
    { rank: 1, players: top1, height: '300px', color: '#fbbf24', medal: '🥇', delay: 0 },
    { rank: 3, players: top3, height: '170px', color: '#b45309', medal: '🥉', delay: 0.4 },
  ];

  const rest = rankedPlayers.filter(p => p.rank > 3);

  return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '90vh', overflowY: 'auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '4rem', marginTop: '1rem' }}>Classifica Finale</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '2rem', marginBottom: '4rem' }}>
        {podiumSteps.map(step => {
          if (step.players.length === 0) return null;
          return (
            <motion.div key={`rank-${step.rank}`} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: step.delay }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 4 - step.rank }}>
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {step.players.map(p => (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar photo={p.photo} name={p.name} size={step.rank === 1 ? 100 : 80} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>{p.score} pt</div>
                  </div>
                ))}
              </div>
              <div style={{ 
                minWidth: '150px',
                padding: '0 1rem',
                width: '100%',
                height: step.height, 
                backgroundColor: step.color,
                borderRadius: '1rem 1rem 0 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '6rem',
                fontWeight: 'bold',
                color: 'rgba(0,0,0,0.5)',
                boxShadow: `0 0 20px ${step.color}`
              }}>
                {step.medal}
              </div>
            </motion.div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', padding: '0 2rem' }}>
          {rest.map((p: any, idx) => {
            const pIndex = Object.keys(players).sort().indexOf(p.id);
            const bgGradient = PLAYER_GRADIENTS[pIndex % PLAYER_GRADIENTS.length];
            const borderColor = PLAYER_BORDERS[pIndex % PLAYER_BORDERS.length];

            return (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  background: bgGradient, padding: '1rem 2rem', borderRadius: '1rem', 
                  border: `2px solid ${borderColor}`, boxShadow: `0 4px 20px ${borderColor.replace('0.6', '0.15')}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', width: '40px' }}>{p.rank}°</span>
                  <Avatar photo={p.photo} name={p.name} size={50} />
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{p.name}</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {p.score} pt
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
