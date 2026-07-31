import { motion } from 'framer-motion';
import Background from './Background';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Caricamento in corso..." }: LoadingScreenProps) {
  return (
    <Background theme="default">
      <div className="container-mobile" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '2rem',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '2rem',
            padding: '3rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{
              width: '4rem',
              height: '4rem',
              border: '4px solid rgba(139, 92, 246, 0.2)',
              borderTopColor: '#8b5cf6',
              borderRightColor: '#c084fc',
              borderRadius: '50%',
            }}
          />
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.8rem', 
            fontWeight: '800',
            background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            textShadow: '0 5px 15px rgba(0,0,0,0.2)'
          }}>
            {message}
          </h2>
        </motion.div>
      </div>
    </Background>
  );
}
