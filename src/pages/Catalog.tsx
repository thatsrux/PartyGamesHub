import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const catalogData = [
  {
    id: 'vero_o_fake',
    title: 'Vero o Fake',
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
    id: 'fanta_asta',
    title: 'Fanta-Asta al Buio',
    icon: '💰',
    description: 'Un\'asta spietata in cui tutti hanno un budget segreto. Cerca di aggiudicarti i giocatori migliori senza far capire ai tuoi avversari quanti crediti ti restano!',
    settings: [
      { name: 'Budget Iniziale', desc: 'Crediti di partenza per ogni giocatore.' },
      { name: 'Giocatori per Rosa', desc: 'Quanti giocatori formano la squadra finale.' }
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
    title: 'Disegnatore Bendato',
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
  },
  {
    id: 'collegamento',
    title: 'Il Collegamento',
    icon: '🔗',
    description: 'Sulla TV vedrai i loghi di due squadre di club diverse. Il tuo compito sul telefono sarà trovare il nome di un giocatore che abbia giocato in entrambe queste squadre nella sua carriera.',
    settings: [],
    status: 'available'
  }
];

export default function Catalog() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowY: 'auto' }}>
      <button 
        className="btn"
        style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(255,255,255,0.1)' }}
        onClick={() => navigate('/')}
      >
        ⬅️ Torna indietro
      </button>

      <motion.h1 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '2rem', marginTop: '3rem', textAlign: 'center' }}
      >
        Catalogo Giochi
      </motion.h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', width: '100%', paddingBottom: '4rem' }}>
        {catalogData.map((game, index) => (
          <motion.div 
            key={game.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="panel"
            style={{ 
              padding: '2rem', 
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
              borderLeft: game.status === 'available' ? '5px solid var(--color-primary)' : '5px solid var(--color-text-muted)',
              opacity: game.status === 'available' ? 1 : 0.7
            }}
          >
            {game.status === 'coming_soon' && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '-2.5rem',
                background: 'var(--color-text-muted)',
                color: 'white',
                padding: '0.2rem 3rem',
                transform: 'rotate(45deg)',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                IN ARRIVO
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem' }}>{game.icon}</span>
              <h2 style={{ fontSize: '2rem', margin: 0, color: game.status === 'available' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {game.title}
              </h2>
            </div>
            
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--color-text)', marginBottom: '1.5rem' }}>
              {game.description}
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '0.8rem' }}>
              <h3 style={{ color: 'var(--color-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚙️ Impostazioni Host
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {game.settings.map((s, i) => (
                  <li key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{s.name}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{s.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
