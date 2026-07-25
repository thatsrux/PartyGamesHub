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
import FloatingLobbyCode from '../components/shared/FloatingLobbyCode';
import ErrorBoundary from '../components/ErrorBoundary';
import Avatar from '../components/shared/Avatar';

function HostLobbyContent() {
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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Decorative Elements */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '-20vh', left: '-10vw', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 200, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', bottom: '-20vh', right: '-10vw', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />

      <div style={{ display: 'flex', width: '100%', height: '100%', padding: '4rem', zIndex: 1, gap: '4rem' }}>
        
        {/* Left Side: Big QR & Code */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: '4rem', borderRadius: '3rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '7rem', fontWeight: '900', letterSpacing: '1rem', background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 3rem 0', textShadow: '0 10px 30px rgba(0,0,0,0.3)', lineHeight: 1 }}>
              {lobbyCode || '...'}
            </h1>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              {lobbyCode && (
                <QRCodeSVG 
                  value={joinUrl}
                  size={320}
                  bgColor={"#ffffff"}
                  fgColor={"#1e1b4b"}
                  level={"H"}
                />
              )}
            </div>
            <p style={{ marginTop: '2.5rem', fontSize: '1.5rem', color: 'rgba(255,255,255,0.6)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.3rem', margin: '2.5rem 0 0 0' }}>
              Inquadra per giocare
            </p>
          </div>
        </motion.div>

        {/* Right Side: Players Grid */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem' }}
        >
          <h2 style={{ fontSize: '3rem', color: 'white', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Giocatori ({playersList.length})
          </h2>
          
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '1.5rem', overflowY: 'auto', paddingRight: '1rem' }}>
            {playersList.length === 0 ? (
              <div style={{ width: '100%', height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} className="animate-pulse">La stanza è vuota...</p>
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
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ marginTop: 'auto', padding: '2rem', borderRadius: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
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
              {playersList.length > 0 ? (
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
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                  <motion.span animate={{ opacity: [0.3, 1] }} transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}>📡</motion.span>
                  Il primo giocatore a connettersi sarà l'Admin della stanza.
                </p>
              )}
            </div>
          </motion.div>
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
