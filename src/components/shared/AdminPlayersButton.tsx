import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPlayersButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      className="floating-admin-players"
      initial={{ opacity: 0, scale: .9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: .94 }}
      onClick={onClick}
      aria-label="Gestisci giocatori"
      title="Gestisci giocatori"
    >
      <Users size={22} aria-hidden="true" />
    </motion.button>
  );
}
