import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gameThemes } from '../utils/theme';
import type { GameThemeKey } from '../utils/theme';
import Background from '../components/shared/Background';
import { ArrowLeft, Settings, Info, Check, Sparkles } from 'lucide-react';

interface GameItem {
  id: GameThemeKey;
  title: string;
  icon: string;
  description: string;
  settings: { name: string; desc: string }[];
  status: 'available' | 'coming_soon';
}

const catalogData: GameItem[] = [
  {
    id: 'multigame',
    title: 'Multigame',
    icon: '🔀',
    description: 'Modalità di gioco multipla! Combina più minigiochi in una singola sessione. Scegli quali giochi della raccolta attivare per la sfidante playlist del Multi-Game.',
    settings: [
      { name: 'Playlist Giochi', desc: 'Seleziona quali giochi del catalogo far ruotare durante la Multi-Game.' }
    ],
    status: 'available'
  },
  {
    id: 'vero_o_fake',
    title: 'Vero o Falso',
    icon: '🃏',
    description: 'Metti alla prova le tue conoscenze! La TV mostrerà una carta di un calciatore con delle statistiche. Il tuo compito è indovinare se quella carta è VERA o se è stata falsificata.',
    settings: [
      { name: 'Vite (Es. 3)', desc: 'Ogni errore ti farà perdere una vita. Chi perde tutte le vite viene eliminato.' },
      { name: 'Durata (Es. 20s)', desc: 'I secondi a disposizione per ogni round prima dello scadere del tempo.' }
    ],
    status: 'available'
  },
  {
    id: 'la_carriera',
    title: 'La Carriera',
    icon: '⚽',
    description: 'Il classico gioco indovina-calciatore. Sulla TV verranno mostrati, uno ad uno, i club in cui ha giocato il calciatore misterioso e i relativi anni. Usa la testiera del tuo telefono per provare ad indovinare!',
    settings: [
      { name: 'Round (Es. 10)', desc: 'Il numero totale di calciatori misteriosi da indovinare per decretare il vincitore.' },
      { name: 'Durata (Es. 30s)', desc: 'I secondi a disposizione per rispondere. I club usciranno gradualmente durante questo lasso di tempo.' }
    ],
    status: 'available'
  },
  {
    id: 'nomi_cose_citta',
    title: 'Nomi, Cose, Città',
    icon: '📝',
    description: 'Il grande classico. Scrivi una parola per ogni categoria che inizia con la lettera estratta. Chi fa prima blocca il tempo!',
    settings: [
      { name: 'Rounds', desc: 'Numero di lettere estratte prima di terminare.' }
    ],
    status: 'available'
  },
  {
    id: 'impostore',
    title: 'Impostore',
    icon: '🕵️‍♂️',
    description: 'Un gioco di deduzione sociale. Tutti i giocatori riceveranno una parola segreta... tranne uno! L\'Impostore deve fingere di sapere di cosa si parla, mentre gli altri devono scovarlo.',
    settings: [
      { name: 'Numero Impostori', desc: 'Quanti giocatori ricevono il ruolo di impostore.' },
      { name: 'Tema Parole', desc: 'La categoria di parole segrete da utilizzare (Calcio, Film, Videogiochi).' }
    ],
    status: 'available'
  },
  {
    id: 'disegnatore',
    title: 'Disegnatore',
    icon: '🎨',
    description: 'Un giocatore disegnerà un oggetto misterioso sul suo telefono (che comparirà in tempo reale sulla TV). Gli altri dovranno indovinare il prima possibile scrivendo la risposta!',
    settings: [],
    status: 'available'
  },
  {
    id: 'falsario',
    title: 'Il Falsario',
    icon: '🤥',
    description: 'Scrivi una bugia credibile per completare la frase. Poi, vota la risposta che ritieni corretta. Attento a non farti ingannare dalle bugie degli altri!',
    settings: [],
    status: 'available'
  }
];

export default function Catalog() {
  const navigate = useNavigate();
  const [selectedGames, setSelectedGames] = useState<string[]>([
    'vero_o_fake', 'la_carriera', 'impostore', 'nomi_cose_citta', 'falsario', 'disegnatore'
  ]);
  const [showMultiModal, setShowMultiModal] = useState(false);

  const toggleGameSelection = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      if (selectedGames.length > 1) {
        setSelectedGames(selectedGames.filter(id => id !== gameId));
      }
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  const playableGames = catalogData.filter(g => g.id !== 'multigame');

  return (
    <Background theme="default">
      <div className="container" style={{ padding: '2rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowY: 'auto' }}>
        <button 
          className="btn"
          style={{ 
            position: 'absolute', 
            top: '2rem', 
            left: '2rem', 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '1rem 1.5rem',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={24} />
          Torna indietro
        </button>

        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '4rem' }}
        >
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '900', 
            margin: 0,
            background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            textShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            Catalogo Giochi
          </h1>
          <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)', marginTop: '1rem' }}>Scegli il prossimo gioco per la tua stanza</p>
        </motion.div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2.5rem', 
          width: '100%', 
          paddingBottom: '4rem' 
        }}>
          {catalogData.map((game, index) => {
            const theme = gameThemes[game.id] || gameThemes.default;
            const isMulti = game.id === 'multigame';

            return (
              <motion.div 
                key={game.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
                style={{ 
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '2.5rem',
                  opacity: game.status === 'available' ? 1 : 0.7,
                  background: isMulti 
                    ? 'linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(59,130,246,0.15) 100%)' 
                    : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: isMulti 
                    ? '2px solid rgba(244,63,94,0.4)' 
                    : `1px solid rgba(255,255,255,0.1)`,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isMulti 
                    ? '0 25px 50px -12px rgba(244, 63, 94, 0.3)' 
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(0)',
                  cursor: isMulti ? 'pointer' : 'default'
                }}
                whileHover={game.status === 'available' ? { scale: 1.02, translateY: -5 } : {}}
                onClick={() => {
                  if (isMulti) setShowMultiModal(true);
                }}
              >
                {/* Theme Background Gradient (Subtle) */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: theme.backgroundGradient,
                  opacity: isMulti ? 0.4 : 0.3,
                  zIndex: -1
                }} />

                {/* Glowing top border based on theme */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: isMulti 
                    ? 'linear-gradient(90deg, #f43f5e, #a855f7, #3b82f6, #10b981)' 
                    : theme.primaryColor,
                  boxShadow: `0 0 20px ${theme.primaryColor}`
                }} />

                {isMulti && (
                  <div style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'linear-gradient(135deg, #f43f5e, #a855f7)',
                    color: 'white',
                    padding: '0.4rem 1rem',
                    borderRadius: '1rem',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 15px rgba(244,63,94,0.4)'
                  }}>
                    <Sparkles size={14} /> MULTI-MODE
                  </div>
                )}
                
                <div style={{ padding: '3rem 3rem 2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      fontSize: '3.5rem', 
                      background: 'rgba(0,0,0,0.3)', 
                      width: '80px', 
                      height: '80px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: '2rem',
                      boxShadow: `0 10px 25px -5px ${theme.primaryColor}40`,
                      border: `1px solid rgba(255,255,255,0.1)`
                    }}>
                      {game.icon}
                    </div>
                    <h2 style={{ fontSize: '2.2rem', margin: 0, color: game.status === 'available' ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: '800' }}>
                      {game.title}
                    </h2>
                  </div>
                  
                  <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem', flex: 1 }}>
                    {game.description}
                  </p>
                  
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ color: theme.primaryColor, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      <Settings size={20} />
                      {isMulti ? 'Clicca per scegliere i giochi della Multi-Game' : 'Impostazioni Host'}
                    </h3>
                    {game.settings.length > 0 ? (
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: 0, margin: 0 }}>
                        {game.settings.map((s, i) => (
                          <li key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>{s.name}</span>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.4' }}>{s.desc}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                        <Info size={18} />
                        <span style={{ fontSize: '1rem' }}>Nessuna impostazione pre-partita.</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Multigame Selection Modal */}
      <AnimatePresence>
        {showMultiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(15px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setShowMultiModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '650px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #31103f 50%, #0f172a 100%)',
                border: '2px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '2.5rem',
                padding: '2.5rem',
                boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.4)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🔀</div>
                <h2 style={{
                  fontSize: '2.2rem',
                  fontWeight: '900',
                  margin: '0 0 0.5rem 0',
                  background: 'linear-gradient(to right, #f43f5e, #a855f7, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Multi-Game
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: 0 }}>
                  Seleziona i giochi del catalogo che desideri includere nel Multi-Game:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {playableGames.map((game) => {
                  const isSelected = selectedGames.includes(game.id);
                  const theme = gameThemes[game.id] || gameThemes.default;

                  return (
                    <motion.div
                      key={game.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding: '1.2rem 1.5rem',
                        borderRadius: '1.5rem',
                        background: isSelected 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.3)',
                        border: `2px solid ${isSelected ? theme.primaryColor : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: isSelected ? `0 0 20px ${theme.primaryColor}40` : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => toggleGameSelection(game.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{game.icon}</span>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{game.title}</span>
                      </div>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isSelected ? theme.primaryColor : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}>
                        {isSelected && <Check size={18} />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '1rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.1)' }}
                  onClick={() => {
                    if (selectedGames.length === playableGames.length) {
                      setSelectedGames([playableGames[0].id]);
                    } else {
                      setSelectedGames(playableGames.map(g => g.id));
                    }
                  }}
                >
                  {selectedGames.length === playableGames.length ? 'Deseleziona Tutti' : 'Seleziona Tutti'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '1.5rem',
                    background: 'linear-gradient(135deg, #f43f5e, #a855f7)',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                  onClick={() => setShowMultiModal(false)}
                >
                  Conferma ({selectedGames.length} Giochi)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Background>
  );
}

