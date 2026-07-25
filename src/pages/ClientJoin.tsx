import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLobby } from '../hooks/useLobby';
import ClientVeroOFake from '../games/VeroOFake/ClientVeroOFake';
import ClientLaCarriera from '../games/LaCarriera/ClientLaCarriera';
import ClientImpostore from '../games/Impostore/ClientImpostore';
import ClientNomiCoseCitta from '../games/NomiCoseCitta/ClientNomiCoseCitta';

import ClientFalsario from '../games/Falsario/ClientFalsario';
import ClientDisegnatore from '../games/Disegnatore/ClientDisegnatore';
import ExitButton from '../components/shared/ExitButton';
import AdminTerminateButton from '../components/shared/AdminTerminateButton';
import FloatingLobbyCode from '../components/shared/FloatingLobbyCode';
import { useProfile } from '../hooks/useProfile';
import Avatar from '../components/shared/Avatar';
import SettingsSlider from '../components/shared/SettingsSlider';
import { gameThemes } from '../utils/theme';
import type { GameThemeKey } from '../utils/theme';
import Background from '../components/shared/Background';

export default function ClientJoin() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';
  
  const { profile } = useProfile();
  const [code, setCode] = useState(codeFromUrl);
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultSettings: Record<string, any> = {
    'vero_o_fake': { rounds: 10, duration: 15 },
    'la_carriera': { rounds: 10, duration: 30 },
    'impostore': { rounds: 5, duration: 60, impostoreCategory: 'Animali', impostorsCount: 1, impostorHint: false },
    'nomi_cose_citta': { rounds: 3, duration: 60, categories: ['Nomi', 'Cose', 'Città', 'Animali', 'Mestieri'] },
    'falsario': { rounds: 5, duration: 45 },
    'disegnatore': { rounds: 2, duration: 60 }
  };
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<any>({});
  const [tempCategory, setTempCategory] = useState('');
  const [localSettings, setLocalSettings] = useState<any>({});
  
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
          setTempPhoto(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Pre-fill nickname if profile exists
  useEffect(() => {
    if (profile?.name && !isJoined) {
      setNickname(profile.name);
    }
  }, [profile, isJoined]);

  const { lobby, joinLobby, leaveLobby, updateGameState, userId, setGameStatus } = useLobby(isJoined ? code : null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!nickname.trim()) return;
    
    if (code.length !== 4) {
      setError("Stanza non trovata! Controlla il codice sulla TV.");
      return;
    }
    
    const { get, ref } = await import('firebase/database');
    const { db } = await import('../firebase');
    
    // Check if lobby exists
    const lobbySnapshot = await get(ref(db, `lobbies/${code}`));
    if (!lobbySnapshot.exists()) {
      setError("Stanza non trovata! Controlla il codice sulla TV.");
      return;
    }

    // Lasciamo che sia useLobby.ts ad auto-promuovere il primo tramite joinedAt in modo sicuro
    const isAdmin = false;
    
    const finalPhoto = tempPhoto === '' ? null : (tempPhoto || profile?.photo);
    await joinLobby(code, nickname, finalPhoto, isAdmin);
    setIsJoined(true);
  };

  const handleExit = async () => {
    await leaveLobby();
    window.location.href = '/';
  };

  if (isJoined) {
    const myPlayer = userId && lobby?.players ? lobby.players[userId] : null;
    const adminPlayer = lobby?.players ? Object.values(lobby.players).find((p: any) => p.isAdmin) as any : null;

    if (lobby?.status === 'playing' && userId) {
      
      const renderGame = () => {
        if (lobby.game_selected === 'vero_o_fake') {
          return <ClientVeroOFake lobbyCode={code} userId={userId} />;
        }
        if (lobby.game_selected === 'la_carriera') {
          return <ClientLaCarriera lobbyCode={code} userId={userId} />;
        }
        if (lobby.game_selected === 'impostore') {
          return <ClientImpostore lobbyCode={code} userId={userId} />;
        }
        if (lobby.game_selected === 'nomi_cose_citta') {
          return <ClientNomiCoseCitta lobbyCode={code} userId={userId} />;
        }

        if (lobby.game_selected === 'falsario') {
          return <ClientFalsario lobbyCode={code} userId={userId} />;
        }
        if (lobby.game_selected === 'disegnatore') {
          return <ClientDisegnatore lobbyCode={code} userId={userId} />;
        }
        return null;
      };

      return (
        <>
          <ExitButton onExit={handleExit} />
          <FloatingLobbyCode code={code} />
          {myPlayer?.isAdmin && lobby.game_state?.phase !== 'finished' && (
            <AdminTerminateButton onTerminate={() => updateGameState({ phase: 'finished', action: 'terminate' })} />
          )}
          {renderGame()}
        </>
      );
    }

    if (myPlayer?.isAdmin && lobby?.status === 'waiting') {
      const openSettings = (game: string) => {
        const profSaved = profile?.gameSettings?.[game] || {};
        const saved = localSettings[game] || {};
        const def = defaultSettings[game] || {};
        
        const rounds = saved.rounds || profSaved.rounds || def.rounds;
        const duration = saved.duration || profSaved.duration || def.duration;
        const categories = saved.categories || profSaved.categories || def.categories;
        const impostoreCategory = saved.impostoreCategory || profSaved.impostoreCategory || def.impostoreCategory;
        const impostorsCount = saved.impostorsCount ?? profSaved.impostorsCount ?? def.impostorsCount;
        const impostorHint = saved.impostorHint ?? profSaved.impostorHint ?? def.impostorHint;
        
        setTempSettings({ ...def, ...profSaved, ...saved, rounds, duration, categories, impostoreCategory, impostorsCount, impostorHint });
        setTempCategory('');
        setSettingsOpen(game);
      };

      const saveSettings = () => {
        if (settingsOpen) {
          const newSettings = { ...localSettings, [settingsOpen]: tempSettings };
          setLocalSettings(newSettings);
          setSettingsOpen(null);
        }
      };

      const handleStartGame = (gameId: string) => {
        try {
          let gameSet = { ...defaultSettings[gameId], ...(profile?.gameSettings?.[gameId] || {}), ...(localSettings[gameId] || {}) };
          
          if (gameId === 'nomi_cose_citta') {
            if (!gameSet.categories || gameSet.categories.length === 0) {
              gameSet.categories = defaultSettings[gameId].categories;
            }
          }
          
          // Firebase non accetta undefined, quindi filtriamo l'oggetto
          gameSet = JSON.parse(JSON.stringify(gameSet));
          
          setGameStatus('playing', gameId, { settings: gameSet }).catch((e: any) => {
             alert('Errore in setGameStatus: ' + e.message);
          });
        } catch (e: any) {
          alert('Errore in handleStartGame: ' + e.message);
        }
      };
      return (
        <Background theme="default">
          <div style={{ flex: 1, overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '4rem', zIndex: 10 }}>
                <ExitButton onExit={handleExit} />
                <FloatingLobbyCode code={code} />
              </div>
              
              {settingsOpen ? (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="panel"
                    style={{ 
                      width: '100%',
                      maxWidth: '500px',
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '2rem',
                      border: `1px solid ${gameThemes[settingsOpen as GameThemeKey]?.primaryColor || 'rgba(255,255,255,0.05)'}`,
                      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px ${gameThemes[settingsOpen as GameThemeKey]?.primaryColor || 'rgba(0,0,0,0)'}30`,
                      padding: '2.5rem 1.5rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: gameThemes[settingsOpen as GameThemeKey]?.backgroundGradient || 'transparent',
                      opacity: 0.15,
                      zIndex: 0
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ 
                      fontSize: '2rem', 
                      fontWeight: '900', 
                      marginBottom: '2rem',
                      textAlign: 'center',
                      color: gameThemes[settingsOpen as GameThemeKey]?.primaryColor || '#fff',
                      textShadow: `0 0 20px ${gameThemes[settingsOpen as GameThemeKey]?.primaryColor || '#fff'}80`
                    }}>
                      {[
                        { id: 'vero_o_fake', title: 'Vero o Falso' },
                        { id: 'la_carriera', title: 'La Carriera' },
                        { id: 'impostore', title: 'Impostore' },
                        { id: 'nomi_cose_citta', title: 'Nomi, Cose, Città' },
                        { id: 'falsario', title: 'Il Falsario' },
                        { id: 'disegnatore', title: 'Disegnatore' }
                      ].find(g => g.id === settingsOpen)?.title || 'Impostazioni'}
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
                      <SettingsSlider 
                        label="Numero di Round"
                        icon="🎯"
                        value={tempSettings.rounds || (settingsOpen === 'disegnatore' ? 2 : (settingsOpen === 'nomi_cose_citta' ? 3 : 5))}
                        min={1} max={settingsOpen === 'disegnatore' ? 4 : (settingsOpen === 'nomi_cose_citta' ? 10 : 20)} step={1}
                        onChange={(val) => setTempSettings({ ...tempSettings, rounds: val })}
                      />
                      
                      <SettingsSlider 
                        label="Durata (secondi)"
                        icon="⏱️"
                        suffix="s"
                        value={tempSettings.duration || 30}
                        min={10} max={120} step={5}
                        onChange={(val) => setTempSettings({ ...tempSettings, duration: val })}
                      />

                      {settingsOpen === 'nomi_cose_citta' && (
                        <div className="input-group" style={{ margin: 0 }}>
                          <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block', color: 'rgba(255,255,255,0.8)' }}>🏷️ Categorie ({tempSettings.categories?.length || 0})</label>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input type="text" className="input" placeholder="Nuova categoria" value={tempCategory} onChange={e => setTempCategory(e.target.value)} onKeyDown={e => {
                                if (e.key === 'Enter' && tempCategory.trim()) {
                                  if (!tempSettings.categories?.includes(tempCategory.trim())) {
                                    setTempSettings({ ...tempSettings, categories: [...(tempSettings.categories || []), tempCategory.trim()] });
                                  }
                                  setTempCategory('');
                                }
                            }} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            <button className="btn btn-primary" style={{ padding: '0 1.5rem', borderRadius: '1rem' }} onClick={() => {
                                if (tempCategory.trim()) {
                                  if (!tempSettings.categories?.includes(tempCategory.trim())) {
                                    setTempSettings({ ...tempSettings, categories: [...(tempSettings.categories || []), tempCategory.trim()] });
                                  }
                                  setTempCategory('');
                                }
                            }}>Aggiungi</button>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {(tempSettings.categories || []).map((cat: string, index: number) => (
                                <div key={index} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span>{cat}</span>
                                  <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => {
                                    setTempSettings({ ...tempSettings, categories: tempSettings.categories.filter((_: any, i: number) => i !== index) });
                                  }}>✕</button>
                                </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {settingsOpen === 'impostore' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                          <SettingsSlider 
                            label="Numero Impostori" 
                            value={tempSettings.impostorsCount || 1} 
                            min={1} 
                            max={3} 
                            step={1} 
                            onChange={(v) => setTempSettings({ ...tempSettings, impostorsCount: v })} 
                            theme={gameThemes.impostore}
                          />
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>Indizio Impostori</div>
                              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Ricevono una parola simile a quella segreta per mimetizzarsi.</div>
                            </div>
                            <button 
                              className="btn" 
                              style={{ 
                                background: tempSettings.impostorHint ? 'var(--color-success)' : 'rgba(255,255,255,0.2)', 
                                border: 'none', 
                                padding: '0.8rem 1.5rem', 
                                borderRadius: '2rem',
                                color: 'white',
                                fontWeight: 'bold',
                                transition: 'background 0.3s ease',
                                fontSize: '1.1rem'
                              }}
                              onClick={() => setTempSettings({ ...tempSettings, impostorHint: !tempSettings.impostorHint })}
                            >
                              {tempSettings.impostorHint ? 'ON' : 'OFF'}
                            </button>
                          </div>
                          
                          <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block', color: 'rgba(255,255,255,0.8)' }}>🗂️ Categoria</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {['Animali', 'Calciatori', 'Film / Serie TV', 'Cibo'].map((cat) => (
                                <button 
                                  key={cat} 
                                  style={{ 
                                    background: tempSettings.impostoreCategory === cat ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', 
                                    color: '#fff',
                                    padding: '0.8rem 1rem', 
                                    borderRadius: '1.5rem', 
                                    border: tempSettings.impostoreCategory === cat ? '2px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer', 
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    flex: '1 1 calc(50% - 0.5rem)',
                                    transition: 'all 0.2s'
                                  }} 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setTempSettings({ ...tempSettings, impostoreCategory: cat });
                                  }}
                                >
                                  {cat}
                                </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      )}
                    </div>
              
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.1)' }} onClick={() => setSettingsOpen(null)}>Annulla</button>
                <button className="btn btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '1.5rem', background: gameThemes[settingsOpen as GameThemeKey]?.primaryColor || 'var(--color-primary)' }} onClick={saveSettings}>Salva</button>
              </div>
              </div>
            </motion.div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, paddingBottom: '2rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ 
                      fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                      fontWeight: '900', 
                      margin: '0',
                      background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', 
                      WebkitBackgroundClip: 'text', 
                      WebkitTextFillColor: 'transparent', 
                      textShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>Sei l'Admin 👑</h2>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '1rem', width: '100%', margin: '0 auto' }}>
                    {[
                      { id: 'vero_o_fake', title: 'Vero o Falso', icon: '🃏' },
                      { id: 'la_carriera', title: 'La Carriera', icon: '⚽' },
                      { id: 'impostore', title: 'Impostore', icon: '🕵️‍♂️' },
                      { id: 'nomi_cose_citta', title: 'Nomi, Cose, Città', icon: '📝' },
                      { id: 'falsario', title: 'Il Falsario', icon: '🤥' },
                      { id: 'disegnatore', title: 'Disegnatore', icon: '🎨' }
                    ].map((game) => {
                      const theme = gameThemes[game.id as GameThemeKey] || gameThemes.default;
                      return (
                        <motion.div 
                          key={game.id} 
                          style={{ 
                            position: 'relative',
                            display: 'flex', 
                            flexDirection: 'column',
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid rgba(255,255,255,0.1)`,
                            borderRadius: '1.2rem',
                            overflow: 'hidden',
                            boxShadow: '0 15px 30px -10px rgba(0,0,0,0.4)',
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: theme.backgroundGradient,
                            opacity: 0.2,
                            zIndex: 0
                          }} />
                          
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: theme.primaryColor,
                            boxShadow: `0 0 15px ${theme.primaryColor}`
                          }} />

                          <div style={{ position: 'relative', zIndex: 1, padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1, alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                              <span style={{ fontSize: '2.5rem', textShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                                {game.icon}
                              </span>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.2' }}>{game.title}</h3>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.4rem', width: '100%', marginTop: 'auto' }}>
                              <button 
                                className="btn" 
                                style={{ 
                                  flex: 1, 
                                  background: theme.primaryColor,
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.9rem',
                                  padding: '0.6rem 0.2rem',
                                  borderRadius: '0.8rem',
                                  border: 'none',
                                  boxShadow: `0 4px 15px ${theme.primaryColor}50`
                                }} 
                                onClick={(e) => { e.stopPropagation(); handleStartGame(game.id); }}
                              >
                                Avvia
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ 
                                  padding: '0.6rem 0.8rem', 
                                  borderRadius: '0.8rem',
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  fontSize: '1rem'
                                }} 
                                onClick={(e) => { e.stopPropagation(); openSettings(game.id); }}
                              >
                                ⚙️
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </Background>
      );
    }

    return (
      <Background theme="default">
        <div className="container-mobile" style={{ height: '100%', justifyContent: 'center', textAlign: 'center' }}>
          <ExitButton onExit={handleExit} />
          <FloatingLobbyCode code={code} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              borderRadius: '2rem',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '3rem 2rem'
            }}
          >
            <div className="animate-pulse" style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '5rem' }}>🎮</span>
            </div>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '900', 
              margin: '0 0 1rem 0',
              background: 'linear-gradient(to right, #60a5fa, #c084fc)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent'
            }}>Sei dentro!</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.3rem', lineHeight: '1.6' }}>
              Guarda lo schermo principale.<br/>
              <span style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
                {adminPlayer?.name 
                  ? `In attesa che l'Admin (${adminPlayer.name}) avvii la partita...` 
                  : `In attesa che l'Admin avvii la partita...`}
              </span>
            </p>
          </motion.div>
        </div>
      </Background>
    );
  }

  return (
    <Background theme="default">
      <div className="container-mobile" style={{ height: '100%', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '900', 
              margin: 0,
              background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              textShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              Partecipa
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginTop: '0.5rem' }}>Entra nella stanza con il codice</p>
          </div>
          
          <form onSubmit={handleJoin} className="panel" style={{ 
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              borderRadius: '2.5rem',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '2.5rem'
          }}>
            <div className="input-group">
              <label htmlFor="code" style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '1rem', textAlign: 'center' }}>Codice Stanza (4 Lettere)</label>
              <input 
                id="code"
                type="text" 
                className="input" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={4}
                required
                style={{ 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5rem', 
                  fontWeight: 'bold', 
                  fontSize: '2rem', 
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1.5rem',
                  padding: '1rem',
                  width: '100%'
                }}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
              <label htmlFor="nickname" style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '1rem', textAlign: 'center' }}>Il tuo Nickname e Foto</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowPhotoMenu(!showPhotoMenu)}>
                  <div style={{ 
                    position: 'absolute', inset: -5, background: 'linear-gradient(45deg, #60a5fa, #c084fc)', borderRadius: '50%', opacity: 0.5, filter: 'blur(10px)', zIndex: -1 
                  }} />
                  <Avatar photo={tempPhoto === '' ? null : (tempPhoto || profile?.photo)} name={nickname || profile?.name || '?'} size={90} />
                  <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--color-primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.1)' }}>
                    {(tempPhoto === '' ? null : (tempPhoto || profile?.photo)) ? '✏️' : '📷'}
                  </div>
                </div>

                <AnimatePresence>
                  {showPhotoMenu && (
                    <>
                      <div 
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                        onClick={(e) => { e.stopPropagation(); setShowPhotoMenu(false); }}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          marginLeft: '-85px',
                          marginTop: '0.5rem',
                          background: 'rgba(30, 30, 30, 0.9)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '1rem',
                          padding: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          zIndex: 50,
                          width: '170px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                      >
                      <button
                        type="button"
                        style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.8rem', cursor: 'pointer', textAlign: 'left', borderRadius: '0.5rem', fontWeight: 'bold' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
                      >
                        📷 {(tempPhoto === '' ? null : (tempPhoto || profile?.photo)) ? 'Cambia Foto' : 'Carica Foto'}
                      </button>
                      {(tempPhoto === '' ? null : (tempPhoto || profile?.photo)) && (
                        <button
                          type="button"
                          style={{ background: 'transparent', border: 'none', color: '#fca5a5', padding: '0.8rem', cursor: 'pointer', textAlign: 'left', borderRadius: '0.5rem', fontWeight: 'bold' }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => { setTempPhoto(''); setShowPhotoMenu(false); }}
                        >
                          🗑️ Rimuovi Foto
                        </button>
                      )}
                    </motion.div>
                    </>
                  )}
                </AnimatePresence>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  id="nickname"
                  type="text" 
                  className="input" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={15}
                  style={{ 
                    flex: 1, 
                    fontSize: '1.3rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1.5rem',
                    padding: '1rem',
                    width: '100%'
                  }}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{ color: '#f87171', marginBottom: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}
              >
                {error}
              </motion.div>
            )}

            <button type="submit" className="btn btn-primary btn-giant" style={{ width: '100%', fontSize: '1.4rem', padding: '1.2rem', borderRadius: '1.5rem', marginTop: '1rem' }}>
              Entra nella Stanza
            </button>
          </form>
        </motion.div>
      </div>
    </Background>
  );
}
