import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gameThemes } from '../utils/theme';
import type { GameThemeKey } from '../utils/theme';
import Background from '../components/shared/Background';
import { ArrowLeft, Settings, Info } from 'lucide-react';

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
          maxWidth: '1400px', 
          paddingBottom: '4rem' 
        }}>
          {catalogData.map((game, index) => {
            const theme = gameThemes[game.id] || gameThemes.default;
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
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(0)' // Force GPU acceleration for smooth hover
                }}
                whileHover={game.status === 'available' ? { scale: 1.02, translateY: -5 } : {}}
              >
                {/* Theme Background Gradient (Subtle) */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: theme.backgroundGradient,
                  opacity: 0.3,
                  zIndex: -1
                }} />

                {/* Glowing top border based on theme */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: theme.primaryColor,
                  boxShadow: `0 0 20px ${theme.primaryColor}`
                }} />

                {game.status === 'coming_soon' && (
                  <div style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '-3rem',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '0.5rem 4rem',
                    transform: 'rotate(45deg)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    IN ARRIVO
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
                      Impostazioni Host
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
    </Background>
  );
}
