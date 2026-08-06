import { motion } from 'framer-motion';
import Avatar from './Avatar';
import { splitFinalStandings } from '../../utils/ranking';
import './Podium.css';

const PODIUM_META = [
  { index: 1, place: 2, medal: '🥈' },
  { index: 0, place: 1, medal: '🥇' },
  { index: 2, place: 3, medal: '🥉' }
];

export default function PodiumTV({ players, points }: { players: any; points?: Record<string, number> }) {
  const { podium, others } = splitFinalStandings(players, points);

  return (
    <motion.section className={`final-standings-tv${others.length === 0 ? ' final-standings-tv--podium-only' : ''}`} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
      <header className="final-standings-tv__header">
        <span className="final-standings-tv__kicker">Partita conclusa</span>
        <h1><span>🏆</span> Classifica finale</h1>
        <p>Applausi per tutti. Ecco com'è andata!</p>
      </header>

      <div className="final-standings-tv__content">
        <div className="final-podium" aria-label="Podio dei primi tre giocatori">
          {PODIUM_META.map(({ index, place, medal }) => {
            const player = podium[index];
            if (!player) return <div className={`final-podium__slot final-podium__slot--${place} final-podium__slot--empty`} key={place} />;
            return (
              <motion.article
                className={`final-podium__slot final-podium__slot--${place}`}
                key={player.id}
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18, delay: place === 1 ? .08 : place * .12 }}
              >
                <div className="final-podium__player">
                  <span className="final-podium__medal">{medal}</span>
                  <div className="final-podium__avatar"><Avatar photo={player.photo} name={player.name} size={place === 1 ? 112 : 88} /></div>
                  <strong title={player.name}>{player.name}</strong>
                  <span>{player.score} pt</span>
                </div>
                <div className="final-podium__step"><b>{place}</b><small>posto</small></div>
              </motion.article>
            );
          })}
        </div>

        {others.length > 0 && (
          <aside className="final-ranking-list">
            <div className="final-ranking-list__heading"><span>Classifica completa</span><b>{podium.length + others.length} giocatori</b></div>
            <div className="final-ranking-list__scroll">
              {others.map((player, index) => (
                <motion.div className="final-ranking-row" key={player.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .35 + index * .05 }}>
                  <span className="final-ranking-row__rank">{player.rank}°</span>
                  <Avatar photo={player.photo} name={player.name} size={48} />
                  <strong title={player.name}>{player.name}</strong>
                  <b>{player.score} <small>pt</small></b>
                </motion.div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </motion.section>
  );
}
