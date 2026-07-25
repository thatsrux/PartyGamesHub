import { motion } from 'framer-motion';
import Avatar from './Avatar';

import { computeRanking } from '../../utils/ranking';

export default function PodiumMobile({ 
  players, 
  userId, 
  isAdmin, 
  onReturnToLobby 
}: { 
  players: any, 
  userId: string | null, 
  isAdmin: boolean, 
  onReturnToLobby: () => void 
}) {
  const rankedPlayers = computeRanking(players);

  return (
    <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>Classifica 🏆</h2>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxHeight: '40vh', overflowY: 'auto' }}>
        {rankedPlayers.map((p: any, index: number) => {
            let medal = '';
            let color = 'var(--color-text)';
            
            if (p.rank === 1) { medal = '🥇'; color = '#fbbf24'; }
            else if (p.rank === 2) { medal = '🥈'; color = '#9ca3af'; }
            else if (p.rank === 3) { medal = '🥉'; color = '#d97706'; }
            else { medal = `${p.rank}°`; color = 'var(--color-text-muted)'; }

            return (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: p.rank <= 3 ? 'bold' : 'normal',
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  background: p.rank === 1 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.05)',
                  padding: '0.8rem 1rem',
                  borderRadius: '0.5rem',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                  <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold', flexShrink: 0 }}>{medal}</span>
                  <Avatar photo={p.photo} name={p.name} size={32} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name} {userId && p.id === userId ? '(Tu)' : ''}
                  </span>
                </span>
                <span style={{ flexShrink: 0 }}>{p.score} pt</span>
              </motion.div>
            )
          })}
      </div>

      {isAdmin ? (
        <button 
          className="btn btn-secondary" 
          style={{ marginTop: '2rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }} 
          onClick={onReturnToLobby}
        >
          Torna alla Lobby (Admin)
        </button>
      ) : (
        <p style={{ marginTop: '2rem', color: 'var(--color-text-muted)' }} className="animate-pulse">
          In attesa dell'Admin...
        </p>
      )}
    </div>
  );
}
