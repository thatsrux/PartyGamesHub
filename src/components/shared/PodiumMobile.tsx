import { motion } from 'framer-motion';
import Avatar from './Avatar';

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
  return (
    <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>Classifica 🏆</h2>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxHeight: '40vh', overflowY: 'auto' }}>
        {Object.values(players || {})
          .sort((a: any, b: any) => b.score - a.score)
          .map((p: any, index: number) => {
            let medal = '';
            let color = 'var(--color-text)';
            
            if (index === 0) { medal = '🥇'; color = '#fbbf24'; }
            else if (index === 1) { medal = '🥈'; color = '#9ca3af'; }
            else if (index === 2) { medal = '🥉'; color = '#d97706'; }

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: index < 3 ? 'bold' : 'normal',
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  background: index === 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.05)',
                  padding: '0.8rem 1rem',
                  borderRadius: '0.5rem',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <span style={{ width: '20px', textAlign: 'center' }}>{medal}</span>
                  <Avatar photo={p.photo} name={p.name} size={32} />
                  <span>{p.name} {userId && p.name === players[userId]?.name ? '(Tu)' : ''}</span>
                </span>
                <span>{p.score} pt</span>
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
