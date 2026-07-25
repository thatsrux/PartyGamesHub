import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    'impostore': { rounds: 5, duration: 60, impostoreCategory: 'Animali' },
    'nomi_cose_citta': { rounds: 3, duration: 60, categories: ['Nomi', 'Cose', 'Città', 'Animali', 'Mestieri'] },
    'falsario': { rounds: 5, duration: 45 },
    'disegnatore': { rounds: 2, duration: 60 }
  };
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<any>({});
  const [tempCategory, setTempCategory] = useState('');
  const [localSettings, setLocalSettings] = useState<any>(
    JSON.parse(localStorage.getItem('party_hub_game_settings_v2') || '{}')
  );

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

    // Check if it's the first player
    // Lasciamo che sia useLobby.ts ad auto-promuovere il primo tramite joinedAt in modo sicuro
    const isAdmin = false;
    
    await joinLobby(code, nickname, profile?.photo, isAdmin);
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
        const saved = localSettings[game] || {};
        const def = defaultSettings[game] || {};
        
        let rounds = saved.rounds;
        if (game === 'nomi_cose_citta') {
          if (typeof rounds !== 'number' || rounds < 1 || rounds > 10) rounds = def.rounds || 3;
        } else if (game === 'la_carriera') {
          if (typeof rounds !== 'number' || rounds < 5 || rounds > 20) rounds = def.rounds;
        } else if (game === 'disegnatore') {
          if (typeof rounds !== 'number' || rounds < 1 || rounds > 4) rounds = def.rounds || 2;
        }
        
        let duration = saved.duration;
        if (typeof duration !== 'number' || duration < 10 || duration > 60) duration = def.duration;
        
        let categories = saved.categories && saved.categories.length > 0 ? saved.categories : def.categories || [];
        
        setTempSettings({ ...saved, ...def, rounds, duration, categories });
        setTempCategory('');
        setSettingsOpen(game);
      };

      const saveSettings = () => {
        if (settingsOpen) {
          const newSettings = { ...localSettings, [settingsOpen]: tempSettings };
          setLocalSettings(newSettings);
          localStorage.setItem('party_hub_game_settings_v2', JSON.stringify(newSettings));
          setSettingsOpen(null);
        }
      };

      const handleStartGame = (gameId: string) => {
        try {
          let gameSet = { ...defaultSettings[gameId], ...(localSettings[gameId] || {}) };
          
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
        <div className="container-mobile" style={{ justifyContent: 'center' }}>
          <ExitButton onExit={handleExit} />
          <FloatingLobbyCode code={code} />
          
          {settingsOpen ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="panel">
              <h2 style={{ color: 'var(--color-primary)', marginBottom: '2rem', textAlign: 'center' }}>Impostazioni</h2>
              
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
                    <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block' }}>🏷️ Categorie ({tempSettings.categories?.length || 0})</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                       <input type="text" className="input" placeholder="Nuova categoria" value={tempCategory} onChange={e => setTempCategory(e.target.value)} onKeyDown={e => {
                          if (e.key === 'Enter' && tempCategory.trim()) {
                             if (!tempSettings.categories?.includes(tempCategory.trim())) {
                               setTempSettings({ ...tempSettings, categories: [...(tempSettings.categories || []), tempCategory.trim()] });
                             }
                             setTempCategory('');
                          }
                       }} />
                       <button className="btn btn-primary" onClick={() => {
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
                            <button style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => {
                              setTempSettings({ ...tempSettings, categories: tempSettings.categories.filter((_: any, i: number) => i !== index) });
                            }}>✕</button>
                          </div>
                       ))}
                    </div>
                  </div>
                )}
                {settingsOpen === 'impostore' && (
                  <div className="input-group" style={{ margin: 0 }}>
                    <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block' }}>🗂️ Categoria</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                       {['Animali', 'Calciatori', 'Film / Serie TV', 'Cibo'].map((cat) => (
                          <button 
                            key={cat} 
                            style={{ 
                              background: tempSettings.impostoreCategory === cat ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', 
                              color: tempSettings.impostoreCategory === cat ? '#fff' : 'var(--color-text)',
                              padding: '0.8rem 1rem', 
                              borderRadius: '2rem', 
                              border: tempSettings.impostoreCategory === cat ? '2px solid transparent' : '2px solid rgba(255,255,255,0.2)',
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
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSettingsOpen(null)}>Annulla</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveSettings}>Salva</button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel">
              <h2 style={{ color: 'var(--color-primary)', marginBottom: '2rem', textAlign: 'center' }}>Sei l'Admin 👑</h2>
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Scegli il gioco da avviare:</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleStartGame('vero_o_fake')}>
                    ✅ Vero o Falso?
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => openSettings('vero_o_fake')}>⚙️</button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#3b82f6' }} onClick={() => handleStartGame('la_carriera')}>
                    🔍 La Carriera
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => openSettings('la_carriera')}>⚙️</button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={() => handleStartGame('impostore')}>
                    🕵️ Impostore
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => openSettings('impostore')}>⚙️</button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#f59e0b' }} onClick={() => handleStartGame('nomi_cose_citta')}>
                    📝 Nomi, Cose, Città
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => openSettings('nomi_cose_citta')}>⚙️</button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#8b5cf6' }} onClick={() => handleStartGame('falsario')}>
                    🤥 Il Falsario
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => openSettings('falsario')}>⚙️</button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#db2777' }} onClick={() => handleStartGame('disegnatore')}>
                    🎨 Disegnatore Bendato
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => openSettings('disegnatore')}>⚙️</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <ExitButton onExit={handleExit} />
        <FloatingLobbyCode code={code} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="panel"
        >
          <div className="animate-pulse" style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '4rem' }}>🎮</span>
          </div>
          <h2 style={{ color: 'var(--color-primary)' }}>Sei dentro!</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginTop: '1rem' }}>
            Guarda lo schermo principale.<br/>
            {adminPlayer?.name 
              ? `In attesa che l'Admin (${adminPlayer.name}) avvii la partita...` 
              : `In attesa che l'Admin avvii la partita...`}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-mobile">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Partecipa</h1>
        
        <form onSubmit={handleJoin} className="panel">
          <div className="input-group">
            <label htmlFor="code">Codice Stanza (4 Lettere)</label>
            <input 
              id="code"
              type="text" 
              className="input" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={4}
              required
              style={{ textTransform: 'uppercase', letterSpacing: '0.2rem', fontWeight: 'bold' }}
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="nickname">Il tuo Nickname</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {profile?.photo && (
                <Avatar photo={profile.photo} name={nickname || 'T'} size={48} />
              )}
              <input 
                id="nickname"
                type="text" 
                className="input" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={15}
                style={{ flex: 1 }}
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{ color: 'var(--color-danger)', marginBottom: '1.5rem', fontWeight: 'bold' }}
            >
              {error}
            </motion.div>
          )}

          <button type="submit" className="btn btn-primary btn-giant">
            Entra
          </button>
        </form>
      </motion.div>
    </div>
  );
}
