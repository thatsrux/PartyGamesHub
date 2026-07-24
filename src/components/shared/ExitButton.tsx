import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ExitButton({ onExit }: { onExit: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowConfirm(true)}
        style={{
          position: 'fixed',
          top: '15px',
          right: '15px',
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid var(--color-danger)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2000,
          backdropFilter: 'blur(5px)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
        }}
        title="Esci dalla Lobby"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </motion.button>

      {showConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="panel"
            style={{ padding: '2rem', textAlign: 'center', maxWidth: '300px', width: '90%' }}
          >
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'white' }}>Sei sicuro di voler uscire?</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>No</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--color-danger)', color: 'white' }} onClick={() => { setShowConfirm(false); onExit(); }}>Sì</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
