import { motion } from 'framer-motion';
import Avatar from './Avatar';
import AnimatedScore from './AnimatedScore';
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

export default function RoundLeaderboardMobile({ 
  players, 
  points, 
  roundPoints,
  roundName
}: { 
  players: any, 
  points: Record<string, number>, 
  roundPoints: Record<string, number>,
  roundName?: string
}) {
  const playersWithScore = Object.fromEntries(
    Object.entries(players || {}).map(([id, p]: any) => [id, { ...p, score: points?.[id] || 0 }])
  );
  const rankedPlayers = computeRanking(playersWithScore);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--color-success)', marginBottom: '1.5rem', textAlign: 'center' }}>
        Risultati {roundName || 'Round'}
      </h1>
      
      <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', maxHeight: '55vh', overflowY: 'auto', padding: '0.5rem' }}>
        {rankedPlayers.map((p: any) => {
          const id = p.id;
          const targetScore = p.score;
          const rp = roundPoints?.[id] || 0;
          const previousScore = targetScore - rp;
          
          const pIndex = Object.keys(players).sort().indexOf(id);
          const bgGradient = PLAYER_GRADIENTS[pIndex % PLAYER_GRADIENTS.length];
          const borderColor = PLAYER_BORDERS[pIndex % PLAYER_BORDERS.length];

          return (
            <motion.div 
              layout 
              key={id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bgGradient, padding: '1rem', borderRadius: '1rem', border: `2px solid ${borderColor}`, boxShadow: `0 4px 15px ${borderColor.replace('0.6', '0.1')}` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: p.rank === 1 ? '#fbbf24' : p.rank === 2 ? '#9ca3af' : p.rank === 3 ? '#d97706' : 'var(--color-text-muted)',
                  width: '30px',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  {p.rank}°
                </div>
                <Avatar photo={p.photo} name={p.name} size={40} />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              </div>
              <AnimatedScore previousScore={previousScore} roundPoints={rp} targetScore={targetScore} isMobile={true} />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
