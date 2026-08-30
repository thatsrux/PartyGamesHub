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
import HostQuiz4 from '../games/Quiz4Risposte/HostQuiz4';
import HostPiuVicino from '../games/PiuVicinoVince/HostPiuVicino';
import HostOrdina from '../games/Ordina/HostOrdina';
import HostIndovinaImmagine from '../games/IndovinaImmagine/HostIndovinaImmagine';
import HostJeopardy from '../games/Jeopardy/HostJeopardy';
import FloatingLobbyCode from '../components/shared/FloatingLobbyCode';
import ErrorBoundary from '../components/ErrorBoundary';
import Avatar from '../components/shared/Avatar';
import Background from '../components/shared/Background';
import ScreenFitter from '../components/shared/ScreenFitter';
import LoadingScreen from '../components/shared/LoadingScreen';
import { GAMES_CONFIG } from '../config/gamesConfig';
import { gameThemes } from '../utils/theme';
import type { GameThemeKey } from '../utils/theme';
import './HostLobby.css';

const GAME_TAGLINES: Record<string, string> = {
  multigame: 'Una playlist, mille sfide',
  vero_o_fake: 'Fidati del tuo istinto',
  quiz4: 'Quattro risposte, una sola giusta',
  la_carriera: 'Riconosci il campione dai club',
  impostore: 'Trova chi sta bluffando',
  nomi_cose_citta: 'Velocità e fantasia',
  falsario: 'Inventala così bene da convincere tutti',
  disegnatore: 'Disegna, intuisci, indovina',
  piu_vicino: 'La stima migliore vince',
  ordina: 'Metti tutto al posto giusto',
  indovina_immagine: 'Scopri cosa si nasconde',
  jeopardy: 'Scegli la categoria e rischia'
};

const lobbyCatalog = Object.values(GAMES_CONFIG);

function HostLobbyContent() {
  const [lobbyCode, setLobbyCode] = useState<string | null>(() => sessionStorage.getItem('hostLobbyCode'));
  const [inputCode, setInputCode] = useState('');
  const [isCreated, setIsCreated] = useState(() => !!sessionStorage.getItem('hostLobbyCode'));
  const [isCreating, setIsCreating] = useState(false);
  const [hasBeenPopulated, setHasBeenPopulated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { lobby, createLobby, setGameStatus, returnToLobbyOrNextGame, userId, isLoading, error: lobbyError } = useLobby(lobbyCode);

  const handleCreateNew = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setError(null);
    setIsCreated(false);
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
    if (!lobbyCode || !userId || isCreated || isCreating) return;

    let active = true;
    setIsCreating(true);
    setError(null);

    createLobby(lobbyCode)
      .then(() => {
        if (active) setIsCreated(true);
      })
      .catch((creationError) => {
        console.error('Lobby creation error:', creationError);
        if (!active) return;
        sessionStorage.removeItem('hostLobbyCode');
        setLobbyCode(null);
        setIsCreated(false);
        setError('Non è stato possibile creare la stanza. Riprova.');
      })
      .finally(() => {
        if (active) setIsCreating(false);
      });

    return () => { active = false; };
  }, [lobbyCode, userId, isCreated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Una stanza salvata nella sessione può essere stata eliminata mentre l'host
  // era chiuso. In quel caso torniamo alla dashboard invece di mostrare un loader infinito.
  useEffect(() => {
    if (!lobbyCode || !isCreated || isCreating || isLoading || lobby) return;

    const timeout = window.setTimeout(() => {
      sessionStorage.removeItem('hostLobbyCode');
      setLobbyCode(null);
      setIsCreated(false);
      setError(lobbyError || 'La stanza precedente non è più disponibile. Creane una nuova.');
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [lobbyCode, isCreated, isCreating, isLoading, lobby, lobbyError]);

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
    return <LoadingScreen message="Caricamento Stanza..." />;
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
    if (lobby.game_selected === 'quiz4') {
      return (
        <>
          <HostQuiz4 lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
    if (lobby.game_selected === 'piu_vicino') {
      return (
        <>
          <HostPiuVicino lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
    if (lobby.game_selected === 'ordina') {
      return (
        <>
          <HostOrdina lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
    if (lobby.game_selected === 'indovina_immagine') {
      return (
        <>
          <HostIndovinaImmagine lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
    if (lobby.game_selected === 'jeopardy') {
      return (
        <>
          <HostJeopardy lobbyCode={lobbyCode} />
          <FloatingLobbyCode code={lobbyCode} />
        </>
      );
    }
  }

  const joinUrl = `${window.location.origin}/join?code=${lobbyCode}`;

  return (
    <Background theme="default">
      <ScreenFitter>
        <main className="host-lobby-shell">
          <motion.section className="host-join-card" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: .3 }}>
            <div className="host-join-card__brand"><span>🎉</span><strong>PartyHub</strong></div>
            <div className="host-join-card__eyebrow">Entra nella stanza</div>
            <h1 className="host-join-code">{lobbyCode || '...'}</h1>
            <div className="host-qr-wrap">
              {lobbyCode && <QRCodeSVG value={joinUrl} size={300} bgColor="#ffffff" fgColor="#1e1b4b" level="H" />}
            </div>
            <p className="host-join-card__hint"><span>📱</span> Inquadra il QR oppure vai su PartyHub e inserisci il codice</p>
          </motion.section>

          <motion.section className="host-lobby-content" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
            <div className="host-players-panel">
              <header className="host-section-heading">
                <div>
                  <h2>Giocatori <b>{playersList.length}</b></h2>
                </div>
                <span className="host-live-pill"><i /> Live</span>
              </header>

              <div className={`host-player-grid${playersList.length === 0 ? ' host-player-grid--empty' : ''}`}>
                {playersList.length === 0 ? (
                  <motion.div className="host-empty-state" animate={{ opacity: [.58, 1, .58] }} transition={{ duration: 2.2, repeat: Infinity }}>
                    <span>👋</span>
                    <strong>Pronti ad accogliere il primo giocatore</strong>
                  </motion.div>
                ) : playersList.map((p: any, index) => (
                  <motion.article
                    className={`host-player-card${p.isAdmin ? ' host-player-card--admin' : ''}`}
                    key={`${p.name}-${index}`}
                    initial={{ opacity: 0, y: 18, scale: .92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', bounce: .36, delay: index * .04 }}
                  >
                    <div className="host-player-card__avatar"><Avatar photo={p.photo} name={p.name} size={70} /></div>
                    <div className="host-player-card__copy">
                      <h3>{p.name}</h3>
                      <span>{p.isAdmin ? '👑 Admin · sceglie il gioco' : '✓ Pronto a giocare'}</span>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <section className="host-catalog" aria-label="Catalogo giochi PartyHub">
              <header className="host-catalog__heading">
                <h2>Che cosa giochiamo?</h2>
              </header>
              <div className="host-catalog__viewport">
                <div className="host-catalog__track">
                  {[false, true].map(duplicate => (
                    <div className="host-catalog__group" key={duplicate ? 'copy' : 'main'} aria-hidden={duplicate || undefined}>
                      {lobbyCatalog.map(game => {
                        const accent = gameThemes[game.id as GameThemeKey]?.primaryColor || gameThemes.default.primaryColor;
                        return (
                          <article className="host-game-card" key={`${duplicate ? 'copy-' : ''}${game.id}`} style={{ '--game-accent': accent } as React.CSSProperties}>
                            <span className="host-game-card__icon">{game.icon}</span>
                            <div><strong>{game.title}</strong><small>{GAME_TAGLINES[game.id]}</small></div>
                          </article>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </motion.section>
        </main>
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
