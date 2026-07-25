import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, User } from 'lucide-react';
import './App.css';

import { useProfile } from './hooks/useProfile';
import Avatar from './components/shared/Avatar';
import ErrorBoundary from './components/ErrorBoundary';

// Placeholder Components for routes
import HostLobby from './pages/HostLobby';
import ClientJoin from './pages/ClientJoin';
import Profile from './pages/Profile';

function Home() {
  const navigate = useNavigate();
  const { profile } = useProfile(); // We'll need to import useProfile here too. Let's do it below.

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '3rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Gamepad2 size={64} color="var(--color-primary)" />
        </div>
        <h1>Party Hub</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginTop: '1rem' }}>
          La tua TV è lo schermo, il tuo telefono è il controller.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="panel"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}
      >
        <button className="btn btn-primary btn-giant" onClick={() => navigate('/host')}>
          Crea Stanza
        </button>
        <button className="btn btn-secondary btn-giant" onClick={() => navigate('/join')}>
          Partecipa
        </button>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn" 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '1rem 2rem',
              borderRadius: '2rem',
              width: '100%'
            }} 
            onClick={() => navigate('/profile')}
          >
            {profile ? (
              <>
                <Avatar photo={profile.photo} name={profile.name} size={40} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'left' }}>
                  Modifica Profilo ({profile.name})
                </span>
              </>
            ) : (
              <>
                <User />
                <span>Crea Profilo</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<HostLobby />} />
          <Route path="/join" element={<ClientJoin />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
