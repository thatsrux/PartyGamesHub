import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import Avatar from '../components/shared/Avatar';
import Background from '../components/shared/Background';
import { gameThemes } from '../utils/theme';
import type { GameThemeKey } from '../utils/theme';
import SettingsSlider from '../components/shared/SettingsSlider';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, saveProfile, saveGameSettings, resetAllGameSettings, loading } = useProfile();
  
  const [view, setView] = useState<'profile' | 'catalog' | 'settings'>('profile');
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [tempSettings, setTempSettings] = useState<any>({});
  const [tempCategory, setTempCategory] = useState('');

  const defaultGameSettings: Record<string, any> = {
    'multigame': { rounds: 5, duration: 30, selectedGames: ['vero_o_fake', 'la_carriera', 'impostore', 'nomi_cose_citta', 'falsario', 'disegnatore'] },
    'vero_o_fake': { rounds: 10, duration: 15 },
    'la_carriera': { rounds: 10, duration: 30 },
    'impostore': { rounds: 5, duration: 60, impostoreCategory: 'Animali', impostorsCount: 1, impostorHint: false },
    'nomi_cose_citta': { rounds: 3, duration: 60, categories: ['Nomi', 'Cose', 'Città', 'Animali', 'Mestieri'] },
    'falsario': { rounds: 5, duration: 45 },
    'disegnatore': { rounds: 2, duration: 60 }
  };
  
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.photo) setPhoto(profile.photo);
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ridimensiona immagine (150x150)
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;

        // Crop al centro (quadrato)
        const size = Math.min(width, height);
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
          const base64 = canvas.toDataURL('image/jpeg', 0.8); // Qualità 80%
          setPhoto(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    await saveProfile(name.trim(), photo || undefined);
    setIsSaving(false);
    navigate('/');
  };

  if (loading) {
    return <div className="container" style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Caricamento...</div>;
  }

  const handleOpenSettings = (gameId: string) => {
    const saved = profile?.gameSettings?.[gameId] || {};
    const def = defaultGameSettings[gameId] || {};
    const rounds = saved.rounds || def.rounds;
    const duration = saved.duration || def.duration;
    const categories = saved.categories || def.categories;
    const selectedGames = saved.selectedGames || def.selectedGames || ['vero_o_fake', 'la_carriera', 'impostore', 'nomi_cose_citta', 'falsario', 'disegnatore'];
    
    setTempSettings({ ...saved, ...def, rounds, duration, categories, selectedGames });
    setTempCategory('');
    setSettingsOpen(gameId);
    setView('settings');
  };

  const handleSaveSettings = async () => {
    if (settingsOpen) {
      await saveGameSettings(settingsOpen, tempSettings);
      setSettingsOpen(null);
      setView('catalog');
    }
  };

  return (
    <Background theme="default">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem 1rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', marginTop: '2rem', maxWidth: view === 'profile' ? '600px' : '1200px', margin: '2rem auto 3rem auto', width: '100%' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            margin: 0,
            background: 'linear-gradient(to right, #60a5fa, #c084fc)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            textShadow: '0 5px 15px rgba(0,0,0,0.3)'
          }}>
            {view === 'profile' ? 'Profilo 👤' : 'Preferenze Giochi 🎮'}
          </h2>
          <button 
            className="btn btn-secondary" 
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.2rem', padding: '0.8rem 1.5rem', fontWeight: 'bold' }} 
            onClick={() => {
              if (view === 'settings') {
                setView('catalog');
                setSettingsOpen(null);
              } else if (view === 'catalog') {
                setView('profile');
              } else {
                navigate('/');
              }
            }}
          >
            Indietro
          </button>
        </header>

        {view === 'profile' && (
          <motion.form 
          onSubmit={handleSave}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '2.5rem', 
            maxWidth: '500px', 
            margin: '0 auto', 
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '2.5rem',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '3rem 2rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div 
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => setShowPhotoMenu(!showPhotoMenu)}
              >
                <div style={{ 
                  position: 'absolute', inset: -10, background: 'linear-gradient(45deg, #60a5fa, #c084fc)', borderRadius: '50%', opacity: 0.5, filter: 'blur(15px)', zIndex: -1 
                }} />
                <Avatar photo={photo} name={profile?.name || '?'} size={140} />
                <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.1)' }}>
                  {photo ? '✏️' : '📷'}
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
                        marginTop: '1rem',
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
                      📷 {photo ? 'Cambia Foto' : 'Carica Foto'}
                    </button>
                    {photo && (
                      <button
                        type="button"
                        style={{ background: 'transparent', border: 'none', color: '#fca5a5', padding: '0.8rem', cursor: 'pointer', textAlign: 'left', borderRadius: '0.5rem', fontWeight: 'bold' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => { setPhoto(null); setShowPhotoMenu(false); }}
                      >
                        🗑️ Rimuovi Foto
                      </button>
                    )}
                  </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label style={{ display: 'block', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', textAlign: 'center' }}>Il tuo Nickname</label>
            <input 
              type="text" 
              className="input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
              required
              autoComplete="off"
              style={{ 
                fontSize: '1.5rem',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1.5rem',
                padding: '1rem',
                width: '100%',
                fontWeight: 'bold'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginTop: '1rem' }}>
            <motion.button 
              type="button" 
              whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                width: '100%', 
                fontSize: '1.3rem', 
                fontWeight: 'bold',
                padding: '1.2rem', 
                borderRadius: '1.5rem', 
                background: 'linear-gradient(135deg, #fdba74, #f97316, #ea580c)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} 
              onClick={() => setView('catalog')}
            >
              <span style={{ fontSize: '1.5rem' }}>🎮</span> Preferenze Giochi
            </motion.button>

            <motion.button 
              type="submit" 
              whileHover={{ scale: (isSaving || !name.trim()) ? 1 : 1.02, boxShadow: (isSaving || !name.trim()) ? 'none' : '0 10px 25px -5px rgba(139, 92, 246, 0.4)' }}
              whileTap={{ scale: (isSaving || !name.trim()) ? 1 : 0.98 }}
              style={{ 
                width: '100%', 
                fontSize: '1.3rem', 
                fontWeight: 'bold',
                padding: '1.2rem', 
                borderRadius: '1.5rem',
                background: (isSaving || !name.trim()) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #a78bfa, #8b5cf6, #3b82f6)',
                color: (isSaving || !name.trim()) ? 'rgba(255,255,255,0.5)' : 'white',
                border: 'none',
                boxShadow: (isSaving || !name.trim()) ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.3)',
                cursor: (isSaving || !name.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                textShadow: (isSaving || !name.trim()) ? 'none' : '0 2px 4px rgba(0,0,0,0.2)'
              }} 
              disabled={isSaving || !name.trim()}
            >
              <span style={{ fontSize: '1.5rem' }}>💾</span> {isSaving ? 'Salvataggio...' : 'Salva Profilo'}
            </motion.button>
          </div>
        </motion.form>
        )}

        {view === 'catalog' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, paddingBottom: '2rem', display: 'flex', flexDirection: 'column', width: '100%', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '1rem' }}>Personalizza le impostazioni predefinite dei giochi per quando sarai tu l'Admin.</p>
              
              {profile?.gameSettings && Object.keys(profile.gameSettings).length > 0 && (
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    padding: '0.6rem 1.2rem', 
                    borderRadius: '1.5rem', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    color: '#fca5a5', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }} 
                  onClick={() => setShowResetConfirm(true)}
                >
                  🔄 Ripristina Preferenze
                </motion.button>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '1rem', width: '100%', margin: '0 auto' }}>
              {[
                { id: 'multigame', title: 'Multigame', icon: '🔀' },
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
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenSettings(game.id)}
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

                    <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, alignItems: 'center', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', width: '100%', flex: 1, justifyContent: 'center' }}>
                        <span style={{ fontSize: '3rem', textShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                          {game.icon}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', lineHeight: '1.2' }}>{game.title}</h3>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === 'settings' && settingsOpen && (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
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

                {settingsOpen === 'multigame' && (
                  <div className="input-group" style={{ margin: 0 }}>
                    <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block', color: 'rgba(255,255,255,0.8)' }}>
                      🎮 Giochi del Multi-Game ({tempSettings.selectedGames?.length || 0})
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                      {[
                        { id: 'vero_o_fake', title: 'Vero o Falso', icon: '🃏' },
                        { id: 'la_carriera', title: 'La Carriera', icon: '⚽' },
                        { id: 'impostore', title: 'Impostore', icon: '🕵️‍♂️' },
                        { id: 'nomi_cose_citta', title: 'Nomi, Cose', icon: '📝' },
                        { id: 'falsario', title: 'Falsario', icon: '🤥' },
                        { id: 'disegnatore', title: 'Disegnatore', icon: '🎨' }
                      ].map((g) => {
                        const isSel = (tempSettings.selectedGames || []).includes(g.id);
                        return (
                          <button
                            type="button"
                            key={g.id}
                            style={{
                              background: isSel ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                              color: 'white',
                              padding: '0.8rem 0.5rem',
                              borderRadius: '1.2rem',
                              border: isSel ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              transition: 'all 0.2s ease'
                            }}
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
                            <span>{g.icon}</span>
                            <span>{g.title}</span>
                          </button>
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
                      <button className="btn btn-primary" type="button" style={{ padding: '0 1.5rem', borderRadius: '1rem' }} onClick={() => {
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
                            <button type="button" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => {
                              setTempSettings({ ...tempSettings, categories: tempSettings.categories.filter((_: any, i: number) => i !== index) });
                            }}>✕</button>
                          </div>
                      ))}
                    </div>
                  </div>
                )}
                {settingsOpen === 'impostore' && (
                  <div className="input-group" style={{ margin: 0 }}>
                    <label style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'block', color: 'rgba(255,255,255,0.8)' }}>🗂️ Categoria</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {['Animali', 'Calciatori', 'Film / Serie TV', 'Cibo'].map((cat) => (
                          <button 
                            type="button"
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
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '1rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.1)' }} onClick={() => { setView('catalog'); setSettingsOpen(null); }}>Annulla</button>
                <button type="button" className="btn btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '1.5rem', background: gameThemes[settingsOpen as GameThemeKey]?.primaryColor || 'var(--color-primary)' }} onClick={handleSaveSettings}>Salva</button>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '2rem',
                padding: '2rem',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.2)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), transparent)',
                zIndex: 0
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1rem 0', color: '#fca5a5' }}>
                  Attenzione!
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem', lineHeight: '1.5' }}>
                  Sei sicuro di voler azzerare tutte le preferenze che hai salvato per i singoli giochi? Questa azione non può essere annullata.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '1rem', borderRadius: '1.2rem', background: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Annulla
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '1rem', borderRadius: '1.2rem', background: '#ef4444' }}
                    onClick={async () => {
                      await resetAllGameSettings();
                      setShowResetConfirm(false);
                    }}
                  >
                    Sì, Azzera
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Background>
  );
}
