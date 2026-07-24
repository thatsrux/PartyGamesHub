import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLobby } from '../hooks/useLobby';
import ClientVeroOFake from '../games/VeroOFake/ClientVeroOFake';
import ClientLaCarriera from '../games/LaCarriera/ClientLaCarriera';
import ExitButton from '../components/shared/ExitButton';
import AdminTerminateButton from '../components/shared/AdminTerminateButton';
import FloatingLobbyCode from '../components/shared/FloatingLobbyCode';
import { useProfile } from '../hooks/useProfile';
import Avatar from '../components/shared/Avatar';

export default function ClientJoin() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';
  
  const { profile } = useProfile();
  const [code, setCode] = useState(codeFromUrl);
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultSettings: Record<string, any> = {
    'la_carriera': { rounds: 10, duration: 30 }
  };
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<any>(
    JSON.parse(localStorage.getItem('party_hub_game_settings_v2') || '{}')
  );
  const [tempSettings, setTempSettings] = useState<any>({});

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
    const playersInDb = lobbySnapshot.val().players || {};
    const isAdmin = Object.keys(playersInDb).length === 0;
    
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
        if (typeof rounds !== 'number' || rounds < 5 || rounds > 20) rounds = def.rounds;
        
        let duration = saved.duration;
        if (typeof duration !== 'number' || duration < 10 || duration > 60) duration = def.duration;
        
        setTempSettings({ ...saved, ...def, rounds, duration });
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
        const gameSet = localSettings[gameId] || defaultSettings[gameId] || {};
        setGameStatus('playing', gameId, { settings: gameSet });
      };

      return (
        <div className="container-mobile" style={{ justifyContent: 'center' }}>
          <ExitButton onExit={handleExit} />
          <FloatingLobbyCode code={code} />
          
          {settingsOpen ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="panel">
              <h2 style={{ color: 'var(--color-primary)', marginBottom: '2rem', textAlign: 'center' }}>Impostazioni</h2>
              
              {settingsOpen === 'la_carriera' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '1.2rem' }}>
                      <span>🎯 Numero di Round</span>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: 'var(--color-bg)', 
                        background: 'var(--color-primary)', 
                        padding: '0.2rem 0.8rem', 
                        borderRadius: '1rem' 
                      }}>
                        {Math.min(20, Math.max(5, tempSettings.rounds || 10))}
                      </span>
                    </label>
                    <input 
                      type="range" 
                      min="5" max="20" step="1"
                      value={Math.min(20, Math.max(5, tempSettings.rounds || 10))} 
                      onChange={e => setTempSettings({...tempSettings, rounds: parseInt(e.target.value) || 10})} 
                      style={{ 
                        accentColor: 'var(--color-primary)', 
                        width: '100%', 
                        height: '10px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
                      <span>5</span>
                      <span>20</span>
                    </div>
                  </div>

                  <div className="input-group" style={{ margin: 0 }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '1.2rem' }}>
                      <span>⏱️ Durata (secondi)</span>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: 'var(--color-bg)', 
                        background: 'var(--color-primary)', 
                        padding: '0.2rem 0.8rem', 
                        borderRadius: '1rem' 
                      }}>
                        {Math.min(60, Math.max(10, tempSettings.duration || 30))}s
                      </span>
                    </label>
                    <input 
                      type="range" 
                      min="10" max="60" step="5"
                      value={Math.min(60, Math.max(10, tempSettings.duration || 30))} 
                      onChange={e => setTempSettings({...tempSettings, duration: parseInt(e.target.value) || 30})} 
                      style={{ 
                        accentColor: 'var(--color-primary)', 
                        width: '100%', 
                        height: '10px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
                      <span>10s</span>
                      <span>60s</span>
                    </div>
                  </div>
                </div>
              )}
              
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
                    ✅ Vero o Fake?
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
                  <button className="btn btn-secondary" disabled style={{ flex: 1, opacity: 0.5 }}>
                    🕵️ Impostore (Prossimamente)
                  </button>
                  <button className="btn btn-secondary" disabled style={{ padding: '0 1rem', opacity: 0.5 }}>⚙️</button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" disabled style={{ flex: 1, opacity: 0.5 }}>
                    💰 Fanta-Asta (Prossimamente)
                  </button>
                  <button className="btn btn-secondary" disabled style={{ padding: '0 1rem', opacity: 0.5 }}>⚙️</button>
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
