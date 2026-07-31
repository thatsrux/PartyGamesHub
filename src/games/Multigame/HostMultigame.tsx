import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import { gameThemes } from '../../utils/theme';
import type { GameThemeKey } from '../../utils/theme';
import { Sparkles, Layers, Trophy } from 'lucide-react';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import PodiumTV from '../../components/shared/PodiumTV';
import LoadingScreen from '../../components/shared/LoadingScreen';

const catalogGameDetails: Record<string, { title: string; icon: string; themeKey: GameThemeKey }> = {
  vero_o_fake: { title: 'Vero o Falso', icon: '🃏', themeKey: 'vero_o_fake' },
  la_carriera: { title: 'La Carriera', icon: '⚽', themeKey: 'la_carriera' },
  impostore: { title: 'Impostore', icon: '🕵️‍♂️', themeKey: 'impostore' },
  nomi_cose_citta: { title: 'Nomi, Cose, Città', icon: '📝', themeKey: 'nomi_cose_citta' },
  falsario: { title: 'Il Falsario', icon: '🤥', themeKey: 'falsario' },
  disegnatore: { title: 'Disegnatore', icon: '🎨', themeKey: 'disegnatore' }
};

export default function HostMultigame({ lobbyCode }: { lobbyCode: string }) {
  const { lobby } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const multigameSession = lobby?.multigame_session;
  const players = lobby?.players || {};

  if (!multigameSession) return <LoadingScreen message="Caricamento in corso..." />;

  const playlist: string[] = multigameSession.playlist || [];
  const currentIndex: number = multigameSession.currentIndex ?? -1;

  if (gameState.phase === 'finished') {
    return (
      <GameLayoutTV themeKey="multigame" leaderboard={<MiniLeaderboardTV players={players} />}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0, width: '100%' }}>

          <PodiumTV 
            players={players} 
            points={Object.fromEntries(Object.entries(players).map(([id, p]: any) => [id, p.score || 0]))} 
          />
        </div>
      </GameLayoutTV>
    );
  }

  // Pre-game / Transition / Intermission screen
  const nextGameId = (currentIndex + 1 < playlist.length) ? playlist[currentIndex + 1] : null;
  const nextGameInfo = nextGameId ? catalogGameDetails[nextGameId] : null;
  const nextTheme = nextGameInfo ? (gameThemes[nextGameInfo.themeKey] || gameThemes.default) : gameThemes.default;

  return (
    <GameLayoutTV 
      themeKey="multigame"
      leaderboard={<MiniLeaderboardTV players={players} animateUpdates={true} />}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0, width: '100%', margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '2rem'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}
            >
              🔀
            </motion.div>
            <h1 style={{ 
              fontSize: '4.5rem', 
              fontWeight: '900',
              margin: 0, 
              background: 'linear-gradient(90deg, #f43f5e, #a855f7, #3b82f6, #10b981)',
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              Multi-Game
            </h1>
          </div>

          <div style={{ 
            width: '100%',
            maxWidth: '900px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '2.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
              <Layers color="#f43f5e" size={28} />
              Progresso Playlist ({Math.max(0, currentIndex + 1)} / {playlist.length})
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {playlist.map((key, idx) => {
                const info = catalogGameDetails[key] || { title: key, icon: '🎮', themeKey: 'default' };
                const isPast = idx <= currentIndex;
                const isNext = idx === currentIndex + 1;
                const theme = gameThemes[info.themeKey] || gameThemes.default;

                return (
                  <div
                    key={idx}
                    style={{
                      opacity: isPast ? 0.4 : 1,
                      transform: isNext ? 'scale(1.1)' : 'scale(1)',
                      position: 'relative',
                      padding: '1rem 1.5rem',
                      borderRadius: '1.5rem',
                      background: isNext ? theme.primaryColor : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${isNext ? 'white' : theme.primaryColor}`,
                      boxShadow: isNext ? `0 10px 25px -5px ${theme.primaryColor}` : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease',
                      filter: isPast ? 'grayscale(1)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '2rem', filter: isNext ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none' }}>{info.icon}</span>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
                      {info.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: `linear-gradient(90deg, ${nextTheme.primaryColor}30, rgba(255,255,255,0.1))`,
              border: `1px solid ${nextTheme.primaryColor}80`,
              borderRadius: '2rem',
              padding: '1.5rem 3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.2rem',
              boxShadow: `0 10px 30px ${nextTheme.primaryColor}20`
            }}
          >
            {nextGameId ? (
              <>
                <Sparkles color="white" size={32} />
                <span style={{ color: 'white', fontSize: '1.6rem', fontWeight: 'bold' }}>
                  Prossimo Gioco: {nextGameInfo?.title}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginLeft: '1rem' }}>
                  (In attesa dell'Admin)
                </span>
              </>
            ) : (
              <>
                <Trophy color="gold" size={32} />
                <span style={{ color: 'white', fontSize: '1.6rem', fontWeight: 'bold' }}>
                  Tutti i giochi sono stati completati!
                </span>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </GameLayoutTV>
  );
}
