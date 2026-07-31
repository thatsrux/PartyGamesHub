import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useLobby } from '../hooks/useLobby';
import HostVeroOFake from '../games/VeroOFake/HostVeroOFake';
import HostLaCarriera from '../games/LaCarriera/HostLaCarriera';
import HostImpostore from '../games/Impostore/HostImpostore';
import HostNomiCoseCitta from '../games/NomiCoseCitta/HostNomiCoseCitta';

import HostFalsario from '../games/Falsario/HostFalsario';
import HostDisegnatore from '../games/Disegnatore/HostDisegnatore';
import HostMultigame from '../games/Multigame/HostMultigame';
import FloatingLobbyCode from '../components/shared/FloatingLobbyCode';
import ErrorBoundary from '../components/ErrorBoundary';
import Avatar from '../components/shared/Avatar';
import Background from '../components/shared/Background';
import ScreenFitter from '../components/shared/ScreenFitter';

function HostLobbyContent() {
  const [lobbyCode, setLobbyCode] = useState<string | null>(() => sessionStorage.getItem('hostLobbyCode'));
  const [inputCode, setInputCode] = useState('');
  const [isCreated, setIsCreated] = useState(() => !!sessionStorage.getItem('hostLobbyCode'));
  const [hasBeenPopulated, setHasBeenPopulated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { lobby, createLobby, setGameStatus, returnToLobbyOrNextGame, userId } = useLobby(lobbyCode);

  const handleCreateNew = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    sessionStorage.setItem('hostLobbyCode', code);
    setLobbyCode(code);
  };

  const handleJoinExisting = async () => {
    if (inputCode.length !== 4) return;
    
    const { get, ref } = await import('firebase/database');
    const { db } = await import('../firebase');
    const snapshot = await get(ref(db, `lobbies/${inputCode}`));
    
    if (snapshot.exists()) {
      setError(null);
      sessionStorage.setItem('hostLobbyCode', inputCode);
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
        returnToLobbyOrNextGame();
      }
    }
  }, [lobby?.status, lobby?.players, setGameStatus, returnToLobbyOrNextGame]);

  // Se la stanza è stata popolata e poi si svuota, crea automaticamente una nuova stanza
  useEffect(() => {
    if (lobby) {
      const playerCount = lobby.players ? Object.keys(lobby.players).length : 0;
      if (playerCount > 0 && !hasBeenPopulated) {
        setHasBeenPopulated(true);
      } else if (playerCount === 0 && hasBeenPopulated) {
        setHasBeenPopulated(false);
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        sessionStorage.setItem('hostLobbyCode', code);
        setIsCreated(false);
        setLobbyCode(code);
      }
    }
  }, [lobby?.players, hasBeenPopulated, lobby]);

  if (!lobbyCode) {
    return (
      <Background theme="default">
        <ScreenFitter>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '2rem', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              style={{ 
                textAlign: 'center', 
                padding: '4rem', 
                maxWidth: '600px', 
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2.5rem',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 style={{ 
                fontSize: '3rem', 
                fontWeight: '900', 
                marginBottom: '1rem',
                background: 'linear-gradient(to right, #60a5fa, #c084fc)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>Host Dashboard</h2>
              
              <button 
                className="btn btn-giant btn-primary" 
                style={{ width: '100%', marginBottom: '2rem', fontSize: '1.5rem', padding: '1.5rem', borderRadius: '1.5rem' }} 
                onClick={handleCreateNew}
              >
                ➕ Crea Nuova Stanza
              </button>
              
              <div style={{ position: 'relative', margin: '3rem 0' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}></div>
                <span style={{ position: 'relative', background: '#1e1b4b', padding: '0 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', borderRadius: '1rem' }}>OPPURE</span>
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
                  style={{ 
                    textTransform: 'uppercase', 
                    flex: 2, 
                    fontSize: '1.5rem', 
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1.2rem',
                    color: 'white'
                  }}
                  onChange={e => setInputCode(e.target.value.toUpperCase())} 
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinExisting()}
                />
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, fontSize: '1.2rem', borderRadius: '1.2rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }} 
                  onClick={handleJoinExisting}
                >
                  Collega TV
                </button>
              </div>
            </motion.div>
          </div>
        </ScreenFitter>
      </Background>
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
    if (lobby.game_selected === 'multigame') {
      return (
        <>
          <HostMultigame lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
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
    if (lobby.game_selected === 'impostore') {
      return (
        <>
          <HostImpostore lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
    if (lobby.game_selected === 'nomi_cose_citta') {
      return (
        <>
          <HostNomiCoseCitta lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
    if (lobby.game_selected === 'falsario') {
      return (
        <>
          <HostFalsario lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
    if (lobby.game_selected === 'disegnatore') {
      return (
        <>
          <HostDisegnatore lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
  }

  const joinUrl = `${window.location.origin}/join?code=${lobbyCode}`;

  return (
    <Background theme="default">
      <ScreenFitter>
        <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, width: '100%', height: '100%', padding: '2rem 3rem', zIndex: 1, gap: '3rem' }}>
          
          {/* Left Side: Big QR & Code */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            style={{ flex: '0 1 40%', minWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: '3.5rem', borderRadius: '3rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '650px' }}>
              <h1 style={{ fontSize: '8.5rem', fontWeight: '900', letterSpacing: '1.2rem', background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 2rem 0', textShadow: '0 10px 30px rgba(0,0,0,0.3)', lineHeight: 1 }}>
                {lobbyCode || '...'}
              </h1>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {lobbyCode && (
                  <QRCodeSVG 
                    value={joinUrl}
                    size={350}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    bgColor={"#ffffff"}
                    fgColor={"#1e1b4b"}
                    level={"H"}
                  />
                )}
              </div>
              <p style={{ marginTop: '2.5rem', fontSize: '1.6rem', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.3rem', margin: '2.5rem 0 0 0' }}>
                Inquadra per giocare
              </p>
            </div>
          </motion.div>

          {/* Right Side: Players Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', minWidth: '400px', height: '100%', padding: '1rem' }}
          >
            <h2 style={{ 
              fontSize: '3rem', 
              margin: '0 0 2rem 0',
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'linear-gradient(to right, #ffffff, #a5b4fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              👥 Giocatori <span style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '0.2rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '2rem',
                WebkitTextFillColor: 'white',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>{playersList.length}</span>
            </h2>
            
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '1.5rem', overflowY: 'auto', paddingRight: '1rem' }}>
              {playersList.length === 0 ? (
                <div style={{ width: '100%', height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.p 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}
                  >
                    La stanza è vuota...
                  </motion.p>
                </div>
              ) : (
                playersList.map((p, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.6, delay: i * 0.05 }}
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(10px)',
                      border: p.isAdmin ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '2rem',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      minWidth: '220px'
                    }}
                  >
                    <Avatar photo={p.photo} name={p.name} size={64} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                      {p.isAdmin && <span style={{ color: '#60a5fa', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1rem' }}>👑 Admin</span>}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {playersList.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ marginTop: 'auto', padding: '2rem', borderRadius: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}
              >
                {/* Animated glowing background */}
                <motion.div 
                  animate={{ 
                    background: [
                      'linear-gradient(45deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
                      'linear-gradient(45deg, rgba(147,51,234,0.1) 0%, rgba(236,72,153,0.1) 100%)',
                      'linear-gradient(45deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)'
                    ] 
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: 0, zIndex: 0, borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <p style={{ fontSize: '1.6rem', margin: 0, fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '2.2rem', display: 'inline-block' }}>
                        ✨
                      </span>
                      <span style={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>
                        In attesa che l'Admin
                      </span>
                      <motion.strong 
                        animate={{ backgroundPosition: ['0% center', '200% center'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        style={{ 
                        background: 'linear-gradient(to right, #60a5fa, #c084fc, #60a5fa)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent',
                        padding: '0.3rem 1rem',
                        backgroundClip: 'text',
                        border: '2px solid rgba(192,132,252,0.3)',
                        borderRadius: '1rem',
                        boxShadow: '0 0 20px rgba(192,132,252,0.2) inset, 0 0 15px rgba(96, 165, 250, 0.3)'
                      }}>
                        {playersList.find((p: any) => p.isAdmin)?.name}
                      </motion.strong>
                      <span style={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>
                        scelga il gioco...
                      </span>
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </ScreenFitter>
    </Background>
  );
}

export default function HostLobby() {
  return (
    <ErrorBoundary>
      <HostLobbyContent />
    </ErrorBoundary>
  );
}
