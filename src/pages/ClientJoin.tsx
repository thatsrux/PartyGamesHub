import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLobby } from '../hooks/useLobby';
import ClientVeroOFake from '../games/VeroOFake/ClientVeroOFake';
import ClientLaCarriera from '../games/LaCarriera/ClientLaCarriera';
import ClientImpostore from '../games/Impostore/ClientImpostore';
import ClientNomiCoseCitta from '../games/NomiCoseCitta/ClientNomiCoseCitta';

import ClientFalsario from '../games/Falsario/ClientFalsario';
import ClientDisegnatore from '../games/Disegnatore/ClientDisegnatore';
import ClientMultigame from '../games/Multigame/ClientMultigame';
import ClientQuiz4 from '../games/Quiz4Risposte/ClientQuiz4';
import ClientPiuVicino from '../games/PiuVicinoVince/ClientPiuVicino';
import ClientOrdina from '../games/Ordina/ClientOrdina';
import ClientIndovinaImmagine from '../games/IndovinaImmagine/ClientIndovinaImmagine';
import ClientJeopardy from '../games/Jeopardy/ClientJeopardy';

import ExitButton from '../components/shared/ExitButton';
import AdminTerminateButton from '../components/shared/AdminTerminateButton';
import PhotoCropper from '../components/shared/PhotoCropper';
import FloatingLobbyCode from '../components/shared/FloatingLobbyCode';
import { useProfile } from '../hooks/useProfile';
import Avatar from '../components/shared/Avatar';
import LoadingScreen from '../components/shared/LoadingScreen';
import SettingsSlider from '../components/shared/SettingsSlider';
import CareerModeSetting from '../games/LaCarriera/CareerModeSetting';
import { gameThemes } from '../utils/theme';
import type { GameThemeKey } from '../utils/theme';
import Background from '../components/shared/Background';

import { ALL_CATEGORIES, getCategoryColor, CATEGORY_COUNTS } from '../utils/categories';
import { GAMES_CONFIG } from '../config/gamesConfig';
import ManagePlayersModal from '../components/shared/ManagePlayersModal';
import AdminPlayersButton from '../components/shared/AdminPlayersButton';

export default function ClientJoin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const codeFromUrl = (searchParams.get('code') || '').trim().toUpperCase().slice(0, 4);
  const storedCode = (sessionStorage.getItem('lobbyCode') || '').trim().toUpperCase().slice(0, 4);
  const { profile, saveProfile, loading: profileLoading } = useProfile();
  const initialIsJoined = sessionStorage.getItem('isJoined') === 'true';
  const [code, setCode] = useState(codeFromUrl || (initialIsJoined ? storedCode : ''));
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(initialIsJoined);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const defaultSettings: Record<string, any> = Object.keys(GAMES_CONFIG).reduce((acc, key) => {
    acc[key] = GAMES_CONFIG[key].defaultSettings;
    return acc;
  }, {} as Record<string, any>);
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [multigameSubgameMode, setMultigameSubgameMode] = useState<boolean>(false);
  const [tempSettings, setTempSettings] = useState<any>({});
  const [tempCategory, setTempCategory] = useState('');
  const [localSettings, setLocalSettings] = useState<any>({});
  
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showManagePlayers, setShowManagePlayers] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const profileInitializedRef = useRef(false);
  const reconciledLobbyProfileRef = useRef('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageToCrop(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Pre-fill nickname if profile exists
  useEffect(() => {
    if (!isJoined && !profileLoading && !profileInitializedRef.current) {
      if (profile?.name) setNickname(profile.name);
      profileInitializedRef.current = true;
    }
  }, [profile, profileLoading, isJoined]);

  // Subscribe to lobby to check if we are already in it (for auto-rejoin)
  const { lobby, joinLobby, leaveLobby, updateGameState, userId, setGameStatus, isLoading: lobbyLoading } = useLobby(code || null);

  // Auto-rejoin / Kick logic if page is refreshed
  useEffect(() => {
    if (userId && !lobbyLoading) {
      if (lobby === null && isJoined) {
        // La lobby non esiste più
        setIsJoined(false);
        sessionStorage.setItem('isJoined', 'false');
        setError("La stanza è stata chiusa dall'host.");
      } else if (lobby) {
        if (lobby.players && lobby.players[userId]) {
          // Player is successfully in the lobby
          if (code) sessionStorage.setItem('lobbyCode', code);
          if (!isJoined) {
            setIsJoined(true);
            sessionStorage.setItem('isJoined', 'true');
          }
          if (lobby.players[userId].name) {
            setNickname(lobby.players[userId].name);
          }

          const lobbyPlayer = lobby.players[userId];
          const signature = `${lobbyPlayer.name}\u0000${lobbyPlayer.photo || ''}`;
          if (
            reconciledLobbyProfileRef.current !== signature &&
            (profile?.name !== lobbyPlayer.name || (profile?.photo || null) !== (lobbyPlayer.photo || null))
          ) {
            reconciledLobbyProfileRef.current = signature;
            saveProfile(lobbyPlayer.name, lobbyPlayer.photo || null).catch(console.error);
          }
        } else if (isJoined) {
          // Player thinks they are joined, but Firebase says they are NOT in the players list (e.g. kicked)
          setIsJoined(false);
          sessionStorage.setItem('isJoined', 'false');
          setError("Sei stato disconnesso o espulso dalla stanza.");
        }
      }
    }
  }, [isJoined, userId, lobby, lobbyLoading, profile, saveProfile, code]);

  // Controlla se la stanza in memoria è stata eliminata (e pulisce l'input per non far perdere tempo)
  useEffect(() => {
    const initialCode = codeFromUrl || storedCode;
    if (initialCode && !isJoined) {
      import('firebase/database').then(({ get, ref }) => {
        import('../firebase').then(({ db }) => {
          get(ref(db, `lobbies/${initialCode}`)).then(snapshot => {
            if (!snapshot.exists()) {
              setCode('');
              if (storedCode === initialCode) {
                sessionStorage.removeItem('lobbyCode');
              }
            }
          }).catch(console.error);
        });
      });
    }
  }, [codeFromUrl, storedCode, isJoined]);

  // Se l'utente ricarica la pagina /join (non dalla home) e NON è in una lobby e NON ha scansionato un QR, torna alla home
  useEffect(() => {
    const isFromHome = location.state?.fromHome;
    if (!isFromHome && !codeFromUrl && sessionStorage.getItem('isJoined') !== 'true') {
      navigate('/');
    }
  }, [codeFromUrl, navigate, location]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!nickname.trim()) return;
    
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length !== 4) {
      setError("Stanza non trovata! Controlla il codice sulla TV.");
      return;
    }
    
    setIsJoining(true);
    try {
      const cleanNickname = nickname.trim().slice(0, 15);
      const { get, ref } = await import('firebase/database');
      const { db } = await import('../firebase');

      // Check if lobby exists
      const lobbySnapshot = await get(ref(db, `lobbies/${normalizedCode}`));
      if (!lobbySnapshot.exists()) {
        setError("Stanza non trovata! Controlla il codice sulla TV.");
        return;
      }

      const finalPhoto = tempPhoto === '' ? null : (tempPhoto || profile?.photo || null);
      await joinLobby(normalizedCode, cleanNickname, finalPhoto, false);
      await saveProfile(cleanNickname, finalPhoto);
      sessionStorage.setItem('lobbyCode', normalizedCode);
      sessionStorage.setItem('isJoined', 'true');
      setCode(normalizedCode);
      setNickname(cleanNickname);
      setIsJoined(true);
    } catch (joinError) {
      console.error(joinError);
      setError('Non è stato possibile entrare. Controlla la connessione e riprova.');
    } finally {
      setIsJoining(false);
    }
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
        if (lobby.game_selected === 'multigame') {
          return <ClientMultigame lobbyCode={code} userId={userId} />;
        }
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
        if (lobby.game_selected === 'quiz4') {
          return <ClientQuiz4 lobbyCode={code} userId={userId} />;
        }
        if (lobby.game_selected === 'piu_vicino') {
          return <ClientPiuVicino lobbyCode={code} userId={userId} />;
        }
        if (lobby.game_selected === 'ordina') {
          return <ClientOrdina lobbyCode={code} userId={userId} />;
        }
        if (lobby.game_selected === 'indovina_immagine') {
          return <ClientIndovinaImmagine lobbyCode={code} userId={userId} />;
        }
        if (lobby.game_selected === 'jeopardy') {
          return <ClientJeopardy lobbyCode={code} userId={userId} />;
        }
        return null;
      };

      return (
        <>
          <ExitButton onExit={handleExit} />
          <button
            className="btn btn-secondary lobby-profile-button"
            style={{
              position: 'fixed',
              bottom: 'max(env(safe-area-inset-bottom, 20px), 3vh)',
              left: 'max(env(safe-area-inset-left, 20px), 3vw)',
              background: 'rgba(0, 0, 0, 0.68)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '12px',
              padding: '8px 20px',
              fontWeight: 'bold',
              zIndex: 2000,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              fontSize: '1rem',
            }}
            onClick={() => navigate('/profile')}
          >
            Profilo 👤
          </button>
          <FloatingLobbyCode code={code} isClient />
          {myPlayer?.isAdmin && lobby.game_state?.phase !== 'finished' && lobby.game_selected !== 'multigame' && (
            <AdminTerminateButton onTerminate={() => updateGameState({ phase: 'finished', action: 'terminate' })} />
          )}
          {renderGame()}
        </>
      );
    }

    if (myPlayer?.isAdmin && lobby?.status === 'waiting') {
      const openSettings = (game: string, isSubgame = false) => {
        const profSaved = profile?.gameSettings?.[game] || {};
        let saved;
        
        if (isSubgame) {
          saved = localSettings.multigame?.subgames?.[game] || {};
        } else {
          saved = localSettings[game] || {};
        }
        
        const def = defaultSettings[game] || {};
        
        let rounds = saved.rounds || profSaved.rounds || def.rounds;
        if (game === 'multigame' && rounds === 5) {
          rounds = 1;
        }
        const duration = saved.duration || profSaved.duration || def.duration;
        const categories = saved.categories || profSaved.categories || def.categories;
        const selectedGames = saved.selectedGames || profSaved.selectedGames || def.selectedGames || ['vero_o_fake', 'la_carriera', 'impostore', 'nomi_cose_citta', 'falsario', 'disegnatore', 'quiz4', 'piu_vicino', 'ordina', 'indovina_immagine', 'jeopardy'];
        const impostoreCategory = saved.impostoreCategory || profSaved.impostoreCategory || def.impostoreCategory;
        const impostorsCount = saved.impostorsCount ?? profSaved.impostorsCount ?? def.impostorsCount;
        const impostorHint = saved.impostorHint ?? profSaved.impostorHint ?? def.impostorHint;
        const categorySelectionMode = saved.categorySelectionMode || profSaved.categorySelectionMode || def.categorySelectionMode;
        const adminCategories = saved.adminCategories || profSaved.adminCategories || def.adminCategories;
        
        setTempSettings({ ...def, ...profSaved, ...saved, rounds, duration, categories, selectedGames, impostoreCategory, impostorsCount, impostorHint, categorySelectionMode, adminCategories });
        setTempCategory('');
        setSettingsOpen(game);
        setMultigameSubgameMode(isSubgame);
      };

      const saveSettings = () => {
        if (settingsOpen) {
          if (settingsOpen === 'jeopardy' && tempSettings.categorySelectionMode === 'admin') {
            if (!tempSettings.adminCategories || tempSettings.adminCategories.length !== 5) {
              alert('Devi selezionare esattamente 5 categorie per Jeopardy.');
              return;
            }
          }
          if (multigameSubgameMode) {
             const currentMultigame = localSettings.multigame || { subgames: {} };
             const newMultigame = { 
               ...currentMultigame, 
               subgames: { ...(currentMultigame.subgames || {}), [settingsOpen]: tempSettings } 
             };
             setLocalSettings({ ...localSettings, multigame: newMultigame });
             // After saving a subgame, go back to multigame settings
             openSettings('multigame', false);
          } else {
             const newSettings = { ...localSettings, [settingsOpen]: tempSettings };
             setLocalSettings(newSettings);
             setSettingsOpen(null);
          }
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
          
          if (gameId === 'multigame') {
            const subgamesOverrides = localSettings.multigame?.subgames || {};
            const multigameSettings = (gameSet.selectedGames || ['vero_o_fake', 'la_carriera', 'impostore', 'nomi_cose_citta', 'falsario', 'disegnatore', 'quiz4', 'piu_vicino', 'ordina', 'indovina_immagine', 'jeopardy']).reduce((acc: any, subGameId: string) => {
               acc[subGameId] = {
                  ...defaultSettings[subGameId],
                  ...(profile?.gameSettings?.[subGameId] || {}),
                  ...(subgamesOverrides[subGameId] || {})
               };
               return acc;
            }, {});

            setGameStatus('playing', 'multigame', {
              multigame_session: {
                playlist: Array.from({ length: gameSet.rounds || 1 }).flatMap(() => (gameSet.selectedGames || ['vero_o_fake', 'la_carriera', 'impostore', 'nomi_cose_citta', 'falsario', 'disegnatore', 'quiz4', 'piu_vicino', 'ordina', 'indovina_immagine', 'jeopardy'])),
                currentIndex: -1,
                settings: JSON.parse(JSON.stringify(multigameSettings))
              },
              phase: 'transition'
            }).catch((e: any) => {
              alert('Errore in setGameStatus (multigame): ' + e.message);
            });
            return;
          }
          
          setGameStatus('playing', gameId, { settings: gameSet }).catch((e: any) => {
             alert('Errore in setGameStatus: ' + e.message);
          });
        } catch (e: any) {
          alert('Errore in handleStartGame: ' + e.message);
        }
      };
      return (
        <Background theme="default">
          <div style={{ flex: 1, overflowY: 'visible', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <ExitButton onExit={handleExit} />
              <button 
                className="btn btn-secondary lobby-profile-button"
                style={{ 
                  position: 'fixed', 
                  bottom: 'max(env(safe-area-inset-bottom, 20px), 3vh)', 
                  left: 'max(env(safe-area-inset-left, 20px), 3vw)', 
                  background: 'rgba(0, 0, 0, 0.6)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px', 
                  padding: '8px 20px', 
                  fontWeight: 'bold',
                  zIndex: 1000,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  fontSize: '1rem'
                }} 
                onClick={() => navigate('/profile')}
              >
                Profilo 👤
              </button>
              {myPlayer?.isAdmin && (
                <AdminPlayersButton onClick={() => setShowManagePlayers(true)} />
              )}
              <FloatingLobbyCode code={code} isClient />
              
              {showManagePlayers && (
                <ManagePlayersModal 
                  lobbyCode={code} 
                  players={lobby?.players || {}} 
                  currentUserId={userId || ''} 
                  onClose={() => setShowManagePlayers(false)} 
                />
              )}
              
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
                        { id: 'multigame', title: 'Multigame 🔀' },
                        { id: 'vero_o_fake', title: 'Vero o Falso' },
                        { id: 'la_carriera', title: 'La Carriera' },
                        { id: 'impostore', title: 'Impostore' },
                        { id: 'nomi_cose_citta', title: 'Nomi, Cose, Città' },
                        { id: 'falsario', title: 'Il Falsario' },
                        { id: 'disegnatore', title: 'Disegnatore' },
                        { id: 'quiz4', title: 'Quiz 4 Risposte' },
                        { id: 'piu_vicino', title: 'Più Vicino Vince' },
                        { id: 'ordina', title: 'Ordina' },
                        { id: 'indovina_immagine', title: 'Indovina l\'Immagine' },
                        { id: 'jeopardy', title: 'Jeopardy' }
                      ].find(g => g.id === settingsOpen)?.title || 'Impostazioni'}
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
                      {GAMES_CONFIG[settingsOpen]?.hasRounds && (
                        <SettingsSlider 
                          label="Rounds"
                          icon="🔄"
                          value={tempSettings.rounds || GAMES_CONFIG[settingsOpen]?.defaultSettings?.rounds || 5}
                          min={GAMES_CONFIG[settingsOpen]?.minRounds || 1} 
                          max={GAMES_CONFIG[settingsOpen]?.maxRounds || 20} 
                          step={1}
                          onChange={(val) => setTempSettings({ ...tempSettings, rounds: val })}
                        />
                      )}
                      
                      {GAMES_CONFIG[settingsOpen]?.hasDuration && (
                        <SettingsSlider 
                          label="Durata (secondi)"
                          icon="⏱️"
                          suffix="s"
                          value={tempSettings.duration || 30}
                          min={10} max={120} step={5}
                          onChange={(val) => setTempSettings({ ...tempSettings, duration: val })}
                        />
                      )}

                      {settingsOpen === 'la_carriera' && (
                        <CareerModeSetting value={tempSettings.careerMode} onChange={(careerMode) => setTempSettings({ ...tempSettings, careerMode })} />
                      )}

                      {settingsOpen === 'multigame' && (
                        <div className="input-group" style={{ margin: 0 }}>
                          <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block', color: 'rgba(255,255,255,0.8)' }}>
                            🔀 Seleziona Giochi
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {[
                              { id: 'vero_o_fake', title: 'Vero o Falso', icon: '🃏' },
                              { id: 'la_carriera', title: 'La Carriera', icon: '⚽' },
                              { id: 'impostore', title: 'Impostore', icon: '🕵️‍♂️' },
                              { id: 'nomi_cose_citta', title: 'Nomi, Cose, Città', icon: '📝' },
                              { id: 'falsario', title: 'Falsario', icon: '🤥' },
                              { id: 'disegnatore', title: 'Disegnatore', icon: '🎨' },
                              { id: 'quiz4', title: 'Quiz 4 Risposte', icon: '⭐' },
                              { id: 'piu_vicino', title: 'Più Vicino Vince', icon: '🎯' },
                              { id: 'ordina', title: 'Ordina', icon: '📋' },
                              { id: 'indovina_immagine', title: 'Indovina l\'Immagine', icon: '🖼️' },
                              { id: 'jeopardy', title: 'Jeopardy', icon: '🧠' }
                            ].map((g) => {
                              const isSel = (tempSettings.selectedGames || []).includes(g.id);
                              const theme = gameThemes[g.id as GameThemeKey] || gameThemes.default;
                              return (
                                <motion.div 
                                  key={g.id} 
                                  style={{ 
                                    position: 'relative',
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    background: 'rgba(255,255,255,0.03)',
                                    backdropFilter: 'blur(10px)',
                                    border: isSel ? `2px solid ${theme.primaryColor}` : `1px solid rgba(255,255,255,0.1)`,
                                    borderRadius: '1.2rem',
                                    overflow: 'hidden',
                                    boxShadow: isSel ? `0 10px 25px -5px ${theme.primaryColor}80` : '0 15px 30px -10px rgba(0,0,0,0.4)',
                                    cursor: 'pointer'
                                  }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const current = tempSettings.selectedGames || [];
                                    if (current.includes(g.id)) {
                                      if (current.length > 1) {
                                        setTempSettings({ ...tempSettings, selectedGames: current.filter((x: string) => x !== g.id) });
                                      }
                                    } else {
                                      setTempSettings({ ...tempSettings, selectedGames: [...current, g.id] });
                                    }
                                  }}
                                >
                                  <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: theme.backgroundGradient,
                                    opacity: isSel ? 0.3 : 0.1,
                                    zIndex: 0
                                  }} />
                                  
                                  {isSel && (
                                    <div style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      height: '4px',
                                      background: theme.primaryColor,
                                      boxShadow: `0 0 15px ${theme.primaryColor}`
                                    }} />
                                  )}

                                  <div style={{ position: 'relative', zIndex: 1, padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1, alignItems: 'center', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                                      <span style={{ fontSize: '2.5rem', textShadow: '0 5px 15px rgba(0,0,0,0.3)', opacity: isSel ? 1 : 0.5, transition: 'opacity 0.2s ease' }}>
                                        {g.icon}
                                      </span>
                                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.2', color: isSel ? 'white' : 'rgba(255,255,255,0.6)', transition: 'color 0.2s ease' }}>{g.title}</h3>
                                      </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '0.4rem', width: '100%', marginTop: 'auto', opacity: isSel ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: isSel ? 'auto' : 'none' }}>
                                      <button 
                                        className="btn btn-secondary" 
                                        style={{ 
                                          flex: 1,
                                          padding: '0.6rem 0.8rem', 
                                          borderRadius: '0.8rem',
                                          background: 'rgba(255,255,255,0.1)',
                                          border: '1px solid rgba(255,255,255,0.1)',
                                          fontSize: '1rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '0.5rem'
                                        }} 
                                        onClick={(e) => { e.stopPropagation(); openSettings(g.id, true); }}
                                      >
                                        Impostazioni ⚙️
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                          

                        </div>
                      )}

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

                      
                      {GAMES_CONFIG[settingsOpen]?.hasCategories && (
                        <div className="input-group" style={{ margin: 0 }}>
                          <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block', color: 'rgba(255,255,255,0.8)' }}>🗂️ Categorie (Seleziona per includere)</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {ALL_CATEGORIES.map((cat) => {
                              const isSelected = tempSettings.excludedCategories ? !tempSettings.excludedCategories.includes(cat) : true;
                              return (
                                <button 
                                  type="button"
                                  key={cat} 
                                  style={{ 
                                    background: isSelected ? getCategoryColor(cat) : 'rgba(255,255,255,0.1)', 
                                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.5)',
                                    padding: '0.8rem 1rem', 
                                    borderRadius: '1.5rem', 
                                    border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer', 
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    flex: '1 1 calc(50% - 0.5rem)',
                                    transition: 'all 0.2s',
                                    opacity: isSelected ? 1 : 0.6
                                  }} 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    let excluded = tempSettings.excludedCategories || [];
                                    if (isSelected) {
                                      excluded = [...excluded, cat];
                                    } else {
                                      excluded = excluded.filter((c: string) => c !== cat);
                                    }
                                    setTempSettings({ ...tempSettings, excludedCategories: excluded });
                                  }}
                                >
                                  {cat} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({CATEGORY_COUNTS[settingsOpen as 'vero_o_fake' | 'falsario' | 'quiz4']?.[cat] || 0})</span>
                                </button>
                              );
                            })}
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
                      
                      {settingsOpen === 'jeopardy' && (
                        <div className="input-group" style={{ margin: 0 }}>
                          <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block', color: 'rgba(255,255,255,0.8)' }}>
                            📊 Selezione Categorie (Scegli 5)
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '1.5rem' }}>
                            <button
                              type="button"
                              style={{ flex: 1, padding: '0.8rem', borderRadius: '1rem', border: 'none', background: tempSettings.categorySelectionMode === 'admin' ? 'var(--color-primary)' : 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                              onClick={() => setTempSettings({ ...tempSettings, categorySelectionMode: 'admin' })}
                            >
                              Scelta Admin
                            </button>
                            <button
                              type="button"
                              style={{ flex: 1, padding: '0.8rem', borderRadius: '1rem', border: 'none', background: tempSettings.categorySelectionMode === 'vote' ? 'var(--color-primary)' : 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                              onClick={() => setTempSettings({ ...tempSettings, categorySelectionMode: 'vote' })}
                            >
                              Voto Giocatori
                            </button>
                          </div>
                          
                          {tempSettings.categorySelectionMode === 'admin' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {[
                                'Cinema e Serie TV', 'Storia e Mitologia', 'Musica', 'Scienza e Natura',
                                'Tecnologia e Videogiochi', 'Letteratura e Arte', 'Geografia',
                                'Cucina e Tradizioni', 'Cultura Pop e Gossip', 'Sport'
                              ].map(cat => {
                                const isSelected = (tempSettings.adminCategories || []).includes(cat);
                                return (
                                  <button
                                    type="button"
                                    key={cat}
                                    style={{
                                      background: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.5)',
                                      padding: '0.8rem 1rem',
                                      borderRadius: '1.5rem',
                                      border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: '0.9rem',
                                      flex: '1 1 calc(50% - 0.5rem)',
                                      transition: 'all 0.2s',
                                      opacity: isSelected ? 1 : 0.6
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      let current = tempSettings.adminCategories || [];
                                      if (isSelected) {
                                        setTempSettings({ ...tempSettings, adminCategories: current.filter((c: string) => c !== cat) });
                                      } else if (current.length < 5) {
                                        setTempSettings({ ...tempSettings, adminCategories: [...current, cat] });
                                      }
                                    }}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          )}
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
                  <div className="admin-game-picker-heading">
                    <h2 style={{ 
                      fontSize: 'clamp(1.7rem, 8vw, 4rem)',
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
                      { id: 'multigame', title: 'Multigame', icon: '🔀' },
                      { id: 'vero_o_fake', title: 'Vero o Falso', icon: '🃏' },
                      { id: 'la_carriera', title: 'La Carriera', icon: '⚽' },
                      { id: 'impostore', title: 'Impostore', icon: '🕵️‍♂️' },
                      { id: 'nomi_cose_citta', title: 'Nomi, Cose, Città', icon: '📝' },
                      { id: 'falsario', title: 'Il Falsario', icon: '🤥' },
                      { id: 'disegnatore', title: 'Disegnatore', icon: '🎨' },
                      { id: 'quiz4', title: 'Quiz 4 Risposte', icon: '⭐' },
                      { id: 'piu_vicino', title: 'Più Vicino Vince', icon: '🎯' },
                      { id: 'ordina', title: 'Ordina', icon: '📋' },
                      { id: 'indovina_immagine', title: 'Indovina l\'Immagine', icon: '🖼️' },
                      { id: 'jeopardy', title: 'Jeopardy', icon: '🧠' }
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

    if (!lobby || lobbyLoading) {
      return <LoadingScreen message="Riconnessione alla stanza..." />;
    }

    return (
      <Background theme="default">
        <div className="container-mobile" style={{ height: '100%', justifyContent: 'center', textAlign: 'center' }}>
          <ExitButton onExit={handleExit} />
          <button 
            className="btn btn-secondary lobby-profile-button"
            style={{ 
              position: 'fixed', 
              bottom: 'max(env(safe-area-inset-bottom, 20px), 3vh)', 
              left: 'max(env(safe-area-inset-left, 20px), 3vw)', 
              background: 'rgba(0, 0, 0, 0.6)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              padding: '8px 20px', 
              fontWeight: 'bold',
              zIndex: 1000,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              fontSize: '1rem'
            }} 
            onClick={() => navigate('/profile')}
          >
            Profilo 👤
          </button>
          <FloatingLobbyCode code={code} isClient />
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
      {imageToCrop && (
        <PhotoCropper 
          imageSrc={imageToCrop} 
          onCropComplete={(croppedImage) => {
            setTempPhoto(croppedImage);
            setImageToCrop(null);
          }} 
          onCancel={() => setImageToCrop(null)} 
        />
      )}
      <div className="container-mobile join-page" style={{ flex: 1, overflowY: 'visible' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-start', paddingBottom: '1rem', width: '100%' }}>
          <button 
            className="btn btn-secondary" 
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.2rem', padding: '0.8rem 1.5rem', fontWeight: 'bold', fontSize: '1rem' }} 
            onClick={() => navigate('/')}
          >
            Indietro
          </button>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: '450px', margin: '0 auto', paddingBottom: '2rem' }}
          >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="join-title" style={{
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
          
          <form onSubmit={handleJoin} className="panel join-card" style={{
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
                  onChange={(e) => {
                    profileInitializedRef.current = true;
                    setNickname(e.target.value);
                  }}
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

            <button type="submit" disabled={isJoining} className="btn btn-primary btn-giant" style={{ width: '100%', fontSize: '1.4rem', padding: '1.2rem', borderRadius: '1.5rem', marginTop: '1rem', opacity: isJoining ? 0.65 : 1 }}>
              {isJoining ? 'Ingresso in corso...' : 'Entra nella Stanza'}
            </button>
          </form>
        </motion.div>
        </div>
      </div>
    </Background>
  );
}
