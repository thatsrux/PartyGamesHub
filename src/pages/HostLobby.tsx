import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Settings } from 'lucide-react';
import { useLobby } from '../hooks/useLobby';
import HostVeroOFake from '../games/VeroOFake/HostVeroOFake';
import HostLaCarriera from '../games/LaCarriera/HostLaCarriera';
import FloatingLobbyCode from '../components/shared/FloatingLobbyCode';
import ErrorBoundary from '../components/ErrorBoundary';
import Avatar from '../components/shared/Avatar';

function HostLobbyContent() {
  const navigate = useNavigate();
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { lobby, createLobby, setGameStatus, userId } = useLobby(lobbyCode);

  const handleCreateNew = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setLobbyCode(code);
  };

  const handleJoinExisting = async () => {
    if (inputCode.length !== 4) return;
    
    const { get, ref } = await import('firebase/database');
    const { db } = await import('../firebase');
    const snapshot = await get(ref(db, `lobbies/${inputCode}`));
    
    if (snapshot.exists()) {
      setError(null);
      setLobbyCode(inputCode);
      setIsCreated(true); // Evita che l'useEffect sovrascriva la stanza
    } else {
      setError("Stanza non trovata! Controlla il codice.");
    }
  };

  // Crea la stanza solo quando siamo autenticati e vogliamo crearla nuova
  useEffect(() => {
    if (lobbyCode && userId && !isCreated) {
      createLobby(lobbyCode);
      setIsCreated(true);
    }
  }, [lobbyCode, userId, isCreated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Se non ci sono più giocatori durante una partita, interrompi e torna in attesa
  useEffect(() => {
    if (lobby?.status === 'playing') {
      const players = lobby.players || {};
      if (Object.keys(players).length === 0) {
        setGameStatus('waiting');
      }
    }
  }, [lobby?.status, lobby?.players, setGameStatus]);

  if (!lobbyCode) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem', justifyContent: 'center', alignItems: 'center' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="panel" style={{ textAlign: 'center', padding: '4rem', maxWidth: '600px', width: '100%' }}>
          <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '1rem' }}>Host Dashboard 📺</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem', fontSize: '1.2rem' }}>Crea una nuova stanza o ricollegati a una esistente</p>
          
          <button className="btn btn-giant btn-primary" style={{ width: '100%', marginBottom: '2rem', fontSize: '1.5rem', padding: '2rem' }} onClick={handleCreateNew}>
            ➕ Crea Nuova Stanza
          </button>
          
          <div style={{ position: 'relative', margin: '3rem 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ position: 'relative', background: 'var(--color-panel)', padding: '0 1rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>OPPURE</span>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{ color: 'var(--color-danger)', marginTop: '2rem', fontWeight: 'bold' }}
            >
              {error}
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: error ? '1rem' : '2rem' }}>
            <input 
              className="input" 
              maxLength={4}
              value={inputCode} 
              style={{ textTransform: 'uppercase', flex: 2, fontSize: '1.5rem', textAlign: 'center' }}
              onChange={e => setInputCode(e.target.value.toUpperCase())} 
              onKeyDown={(e) => e.key === 'Enter' && handleJoinExisting()}
            />
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '1.2rem' }} onClick={handleJoinExisting}>
              Collega TV
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem', justifyContent: 'center', alignItems: 'center' }}>
        <h2 className="animate-pulse" style={{ color: 'var(--color-primary)' }}>Caricamento Stanza...</h2>
      </div>
    );
  }

  const playersList = lobby?.players 
    ? Object.values(lobby.players).sort((a: any, b: any) => {
        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;
        return (a.joinedAt || 0) - (b.joinedAt || 0);
      })
    : [];
  
  if (lobby?.status === 'playing' && lobbyCode) {
    if (lobby.game_selected === 'vero_o_fake') {
      return (
        <>
          <HostVeroOFake lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
    if (lobby.game_selected === 'la_carriera') {
      return (
        <>
          <HostLaCarriera lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
  }

  const joinUrl = `${window.location.origin}/join?code=${lobbyCode}`;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Settings color="var(--color-primary)" />
          Host Dashboard
        </h2>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Esci</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1 }}>
        {/* Left Column: QR and Code */}
        <motion.div 
          className="panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Vai su <strong>{window.location.host}/join</strong> e inserisci il codice:
            </p>
            <h1 style={{ fontSize: '5rem', letterSpacing: '0.5rem', color: 'var(--color-primary)' }}>
              {lobbyCode || '...'}
            </h1>
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem' }}>
            {lobbyCode && (
              <QRCodeSVG 
                value={joinUrl}
                size={256}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
              />
            )}
          </div>
        </motion.div>

        {/* Right Column: Players and Game Start */}
        <motion.div 
          className="panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <Users />
            Giocatori Connessi ({playersList.length})
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {playersList.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                <p className="animate-pulse">In attesa di giocatori...</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {playersList.map((p, i) => {
                  const colors = [
                    'rgba(99, 102, 241, 0.15)', // Indigo
                    'rgba(236, 72, 153, 0.15)', // Pink
                    'rgba(14, 165, 233, 0.15)', // Sky
                    'rgba(16, 185, 129, 0.15)', // Emerald
                    'rgba(245, 158, 11, 0.15)', // Amber
                    'rgba(139, 92, 246, 0.15)', // Violet
                  ];
                  const borderColors = [
                    '#6366f1',
                    '#ec4899',
                    '#0ea5e9',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                  ];
                  return (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ 
                      padding: '1.2rem', 
                      background: colors[i % colors.length], 
                      marginBottom: '0.8rem', 
                      borderRadius: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      borderLeft: `5px solid ${borderColors[i % borderColors.length]}`,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    <Avatar photo={p.photo} name={p.name} size={64} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h4 style={{ fontSize: '1.8rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{p.name}</h4>
                      {p.isAdmin && (
                        <span style={{ 
                          fontSize: '0.9rem', 
                          background: 'var(--color-primary)', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '1rem', 
                          marginTop: '0.5rem', 
                          display: 'inline-block',
                          fontWeight: 'bold'
                        }}>
                          👑 ADMIN
                        </span>
                      )}
                    </div>
                  </motion.li>
                )})}
              </ul>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            {playersList.length > 0 ? (
              <p style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }} className="animate-pulse">
                In attesa che l'Admin ({playersList.find((p: any) => p.isAdmin)?.name || '...'}) avvii la partita dal suo telefono...
              </p>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>
                Il primo giocatore a connettersi sarà l'Admin della stanza.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function HostLobby() {
  return (
    <ErrorBoundary>
      <HostLobbyContent />
    </ErrorBoundary>
  );
}
