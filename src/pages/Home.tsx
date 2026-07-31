import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, User } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import Avatar from '../components/shared/Avatar';
import Background from '../components/shared/Background';
import { db } from '../firebase';
import { ref, remove } from 'firebase/database';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useProfile();

  useEffect(() => {
    // Se atterriamo in Home, vuol dire che siamo usciti da qualsiasi lobby
    const code = sessionStorage.getItem('lobbyCode');
    const userId = sessionStorage.getItem('userId');
    const hostCode = sessionStorage.getItem('hostLobbyCode');
    
    if (code && userId) {
      // Rimuoviamo il giocatore dalla lobby
      const playerRef = ref(db, `lobbies/${code}/players/${userId}`);
      remove(playerRef).catch(() => {});
    }

    if (hostCode) {
      // Se era l'admin, spegniamo la TV
      const tvRef = ref(db, `lobbies/${hostCode}/tv_present`);
      remove(tvRef).catch(() => {});
    }

    // Puliamo lo storage
    sessionStorage.removeItem('lobbyCode');
    sessionStorage.removeItem('hostLobbyCode');
    sessionStorage.setItem('isJoined', 'false');
  }, []);

  return (
    <Background theme="default">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '1.5rem', 
              borderRadius: '2rem', 
              marginBottom: '1.5rem',
              boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.4)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Gamepad2 size={72} color="var(--color-primary)" />
          </motion.div>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '900', 
            margin: 0,
            background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            textShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            Party Hub
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem', 
            width: '100%', 
            maxWidth: '450px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            padding: '2.5rem',
            borderRadius: '2.5rem',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <button 
            className="btn btn-primary btn-giant" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '1.4rem', padding: '1.5rem' }}
            onClick={() => navigate('/host')}
          >
            <span style={{ fontSize: '1.8rem' }}>📺</span>
            Crea Stanza
          </button>
          <button 
            className="btn btn-secondary btn-giant" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '1.4rem', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => navigate('/join', { state: { fromHome: true } })}
          >
            <span style={{ fontSize: '1.8rem' }}>📱</span>
            Partecipa
          </button>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1rem', left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <button 
              className="btn" 
              style={{ 
                background: 'rgba(0,0,0,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '1rem 1.5rem',
                borderRadius: '1.5rem',
                width: '100%',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s ease',
                marginTop: '1rem'
              }} 
              onClick={() => navigate('/profile')}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
            >
              {profile ? (
                <>
                  <Avatar photo={profile.photo} name={profile.name} size={40} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'left', fontSize: '1.1rem', color: 'var(--color-text)' }}>
                    Modifica Profilo ({profile.name})
                  </span>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0.8rem' }}>
                  <User size={24} color="rgba(255,255,255,0.7)" />
                  <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>Crea Profilo</span>
                </div>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </Background>
  );
}
