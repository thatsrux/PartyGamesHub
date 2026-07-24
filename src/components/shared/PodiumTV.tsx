import { motion } from 'framer-motion';
import Avatar from './Avatar';

export default function PodiumTV({ players }: { players: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>Classifica Finale 🏆</h2>
      
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
        {Object.values(players || {})
          .sort((a: any, b: any) => b.score - a.score)
          .map((p: any, index: number) => {
            let medal = '';
            let color = 'var(--color-text)';
            let scale = 1;
            
            if (index === 0) { medal = '🥇'; color = '#fbbf24'; scale = 1.2; }
            else if (index === 1) { medal = '🥈'; color = '#9ca3af'; scale = 1.1; }
            else if (index === 2) { medal = '🥉'; color = '#d97706'; scale = 1.05; }

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                style={{ 
                  fontSize: index < 3 ? '2rem' : '1.2rem', 
                  fontWeight: index < 3 ? 'bold' : 'normal',
                  color: color,
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  background: index === 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.05)',
                  padding: '1rem 2rem',
                  borderRadius: '1rem',
                  width: '100%',
                  maxWidth: '500px',
                  justifyContent: 'space-between',
                  transform: `scale(${scale})`
                }}
              >
                <span style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span>{medal}</span>
                  <Avatar photo={p.photo} name={p.name} size={48} />
                  <span>{p.name}</span>
                </span>
                <span>{p.score} pt</span>
              </motion.div>
            )
          })}
      </div>

      <p style={{ marginTop: '3rem', color: 'var(--color-text-muted)' }} className="animate-pulse">
        In attesa che l'Admin decida cosa fare...
      </p>
    </motion.div>
  );
}
