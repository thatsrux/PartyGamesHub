import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, remove } from 'firebase/database';
import { db } from '../../firebase';
import Avatar from './Avatar';
import { Users, UserMinus, X } from 'lucide-react';

interface ManagePlayersModalProps {
  lobbyCode: string;
  players: Record<string, any>;
  currentUserId: string;
  onClose: () => void;
}

export default function ManagePlayersModal({ lobbyCode, players, currentUserId, onClose }: ManagePlayersModalProps) {
  const [kickingPlayerId, setKickingPlayerId] = useState<string | null>(null);

  const handleKick = async (playerId: string) => {
    try {
      setKickingPlayerId(playerId);
      await remove(ref(db, `lobbies/${lobbyCode}/players/${playerId}`));
    } catch (e: any) {
      alert("Errore durante l'espulsione: " + e.message);
    } finally {
      setKickingPlayerId(null);
    }
  };

  const playersList = Object.entries(players || {})
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return (a.joinedAt || 0) - (b.joinedAt || 0);
    });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="panel"
        style={{
          width: '100%',
          maxWidth: '400px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <Users size={24} color="#60a5fa" />
          Gestisci Giocatori
        </h2>

        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '0.5rem' }}>
          <AnimatePresence>
            {playersList.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Nessun giocatore</p>
            ) : (
              playersList.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.8rem',
                    borderRadius: '1rem',
                    border: p.isAdmin ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', overflow: 'hidden' }}>
                    <Avatar photo={p.photo} name={p.name} size={40} />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
                        {p.name} {p.id === currentUserId ? '(Tu)' : ''}
                      </span>
                      {p.isAdmin && <span style={{ fontSize: '0.8rem', color: '#60a5fa' }}>Admin</span>}
                    </div>
                  </div>
                  
                  {!p.isAdmin && (
                    <button
                      onClick={() => handleKick(p.id)}
                      disabled={kickingPlayerId === p.id}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid var(--color-danger)',
                        color: 'var(--color-danger)',
                        padding: '0.5rem',
                        borderRadius: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: kickingPlayerId === p.id ? 'not-allowed' : 'pointer',
                        opacity: kickingPlayerId === p.id ? 0.5 : 1
                      }}
                      title="Caccia giocatore"
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
