import { motion } from 'framer-motion';
import Avatar from './Avatar';
import type { GameThemeKey } from '../../utils/theme';
import GameLayoutMobile from './GameLayoutMobile';
import { computeRanking } from '../../utils/ranking';
import './Podium.css';

export default function PodiumMobile({
  players,
  userId,
  isAdmin,
  onReturnToLobby,
  themeKey = 'default',
  customBackground
}: {
  players: any;
  userId: string | null;
  isAdmin: boolean;
  onReturnToLobby: () => void;
  themeKey?: GameThemeKey;
  customBackground?: string;
}) {
  const rankedPlayers = computeRanking(players);
  const winner = rankedPlayers[0];

  return (
    <GameLayoutMobile themeKey={themeKey} customBackground={customBackground}>
      <main className="final-standings-mobile">
        <header className="final-standings-mobile__header">
          <span>Partita conclusa</span>
          <h1>Classifica finale</h1>
          <p>🏆 Che partita!</p>
        </header>

        {winner && (
          <motion.section className="mobile-winner-card" initial={{ opacity: 0, y: 24, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
            <div className="mobile-winner-card__crown">👑</div>
            <div className="mobile-winner-card__avatar"><Avatar photo={winner.photo} name={winner.name} size={86} /></div>
            <span>1° posto</span>
            <strong>{winner.name}{userId === winner.id ? ' · Tu' : ''}</strong>
            <b>{winner.score} pt</b>
          </motion.section>
        )}

        <section className="mobile-final-list" aria-label="Classifica completa">
          {rankedPlayers.slice(1).map((player, index) => (
            <motion.article className={`mobile-final-row${userId === player.id ? ' mobile-final-row--me' : ''}`} key={player.id} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 + index * .045 }}>
              <span className="mobile-final-row__rank">{player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `${player.rank}°`}</span>
              <Avatar photo={player.photo} name={player.name} size={42} />
              <strong>{player.name}{userId === player.id ? ' · Tu' : ''}</strong>
              <b>{player.score} <small>pt</small></b>
            </motion.article>
          ))}
        </section>

        {isAdmin ? (
          <button className="btn btn-primary final-standings-mobile__action" onClick={onReturnToLobby}>Torna alla lobby</button>
        ) : (
          <p className="final-standings-mobile__waiting animate-pulse">In attesa dell'Admin...</p>
        )}
      </main>
    </GameLayoutMobile>
  );
}
