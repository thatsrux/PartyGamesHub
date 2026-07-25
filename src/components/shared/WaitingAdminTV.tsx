import { motion } from 'framer-motion';

export default function WaitingAdminTV() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      style={{ 
        marginTop: '2rem', 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '0.8rem' 
      }}
    >
      <motion.div 
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: '18px',
          height: '18px',
          border: '2px solid rgba(255,255,255,0.1)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%'
        }}
      />
      <motion.span 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        style={{ 
          color: 'var(--color-text-muted)', 
          fontSize: '1rem', 
          textTransform: 'uppercase', 
          letterSpacing: '2px',
          fontWeight: 'bold'
        }}
      >
        In attesa dell'Admin
      </motion.span>
    </motion.div>
  );
}
