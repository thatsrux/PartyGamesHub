import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminTerminateButton({ onTerminate }: { onTerminate: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowConfirm(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          border: '1px solid var(--color-danger)',
          color: 'white',
          padding: '0.6rem 1rem',
          borderRadius: '2rem',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          zIndex: 2000,
          backdropFilter: 'blur(5px)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        <span>🛑</span>
        <span>Termina Game</span>
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
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'white' }}>Terminare il game?</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>No</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--color-danger)', color: 'white' }} onClick={() => { setShowConfirm(false); onTerminate(); }}>Sì</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
