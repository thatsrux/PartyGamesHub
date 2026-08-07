import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLobby } from '../../hooks/useLobby';
import Background from '../../components/shared/Background';
import PodiumMobile from '../../components/shared/PodiumMobile';
import { gameThemes } from '../../utils/theme';
import type { GameThemeKey } from '../../utils/theme';
import { PlayCircle, Sparkles, CheckCircle2, Trophy, XCircle } from 'lucide-react';
import { ref, update } from 'firebase/database';
import { db } from '../../firebase';
import ManagePlayersModal from '../../components/shared/ManagePlayersModal';
import AdminPlayersButton from '../../components/shared/AdminPlayersButton';

const catalogGameDetails: Record<string, { title: string; icon: string; themeKey: GameThemeKey }> = {
  vero_o_fake: { title: 'Vero o Falso', icon: '🃏', themeKey: 'vero_o_fake' },
  la_carriera: { title: 'La Carriera', icon: '⚽', themeKey: 'la_carriera' },
  impostore: { title: 'Impostore', icon: '🕵️‍♂️', themeKey: 'impostore' },
  nomi_cose_citta: { title: 'Nomi, Cose, Città', icon: '📝', themeKey: 'nomi_cose_citta' },
  falsario: { title: 'Il Falsario', icon: '🤥', themeKey: 'falsario' },
  disegnatore: { title: 'Disegnatore', icon: '🎨', themeKey: 'disegnatore' },
  quiz4: { title: 'Quiz 4 Risposte', icon: '⭐', themeKey: 'quiz4' },
  piu_vicino: { title: 'Più Vicino Vince', icon: '🎯', themeKey: 'piu_vicino' },
  ordina: { title: 'Ordina', icon: '📋', themeKey: 'ordina' },
  indovina_immagine: { title: 'Indovina l\'Immagine', icon: '🖼️', themeKey: 'indovina_immagine' },
  jeopardy: { title: 'Jeopardy', icon: '🧠', themeKey: 'jeopardy' }
};


function SortableGameItem({ id, info, theme, isNext }: { id: string, info: any, theme: any, isNext: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
    padding: '1.2rem 1.5rem',
    borderRadius: '1.5rem',
    background: 'rgba(0,0,0,0.3)',
    border: `1.5px solid ${isNext ? theme.primaryColor : 'rgba(255,255,255,0.1)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    cursor: 'grab',
    touchAction: 'none',
    marginBottom: '1rem',
    boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.5)' : 'none'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: theme.backgroundGradient,
        opacity: isNext ? 0.2 : 0,
        zIndex: 0
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
        <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>≡</span>
        <span style={{ fontSize: '2.2rem' }}>{info.icon}</span>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>{info.title}</span>
      </div>
    </div>
  );
}

export default function ClientMultigame({ lobbyCode, userId }: { lobbyCode: string; userId: string }) {
  const { lobby, setGameStatus } = useLobby(lobbyCode);

  const multigameSession = lobby?.multigame_session || {};
  const myPlayer = lobby?.players?.[userId];
  const isAdmin = myPlayer?.isAdmin;
  const [showConfirm, setShowConfirm] = useState(false);
  const [showManagePlayers, setShowManagePlayers] = useState(false);

  const playlist: string[] = multigameSession.playlist || [];
  const currentIndex: number = multigameSession.currentIndex ?? -1;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [upcomingGames, setUpcomingGames] = useState<string[]>([]);
  const upcomingGamesRef = useRef(upcomingGames);
  upcomingGamesRef.current = upcomingGames;
  
  useEffect(() => {
    setUpcomingGames(playlist.slice(currentIndex + 1));
  }, [playlist.join(','), currentIndex]);

  const handleLaunchNextSubGame = async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) return;
    
    const nextGameId = playlist[nextIndex];
    const settings = multigameSession.settings || {};
    
    // Aggiorna l'indice
    const lobbyRef = ref(db, `lobbies/${lobbyCode}/multigame_session`);
    await update(lobbyRef, { currentIndex: nextIndex });

    // Avvia il subgame
    setGameStatus('playing', nextGameId, {
      settings: settings[nextGameId] || {}
    });
  };

  const handleTerminateSession = async () => {
    const lobbyRef = ref(db, `lobbies/${lobbyCode}/game_state`);
    await update(lobbyRef, { phase: 'finished' });
  };

  const isFinished = currentIndex + 1 >= playlist.length;
  const nextGameId = isFinished ? null : playlist[currentIndex + 1];
  const nextGameInfo = nextGameId ? catalogGameDetails[nextGameId] : null;
  const nextTheme = nextGameInfo ? (gameThemes[nextGameInfo.themeKey] || gameThemes.default) : gameThemes.default;

  if (lobby?.game_state?.phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby.players || {}} 
        userId={userId}
        isAdmin={!!isAdmin}
        onReturnToLobby={() => {
          if (isAdmin) {
            setGameStatus('waiting');
          }
        }}
      />
    );
  }

  return (
    <Background theme="multigame">
      <motion.div layoutScroll className="container-mobile no-scrollbar" style={{ overflowY: 'visible', display: 'flex', flexDirection: 'column' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🔀</div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              margin: 0,
              background: 'linear-gradient(to right, #f43f5e, #a855f7, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}>
              Multi-Game
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              {isAdmin 
                ? (isFinished ? 'La sessione è terminata!' : 'Scegli quando avviare il prossimo gioco') 
                : 'L\'Admin sta scegliendo il prossimo minigioco'}
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '2.5rem',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 1rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} color="#f43f5e" />
              Playlist Sessione ({Math.max(0, currentIndex + 1)} / {playlist.length}):
            </h3>

            {/* Giochi passati o in corso */}
            {playlist.slice(0, currentIndex + 1).map((key, idx) => {
              const info = catalogGameDetails[key] || { title: key, icon: '🎮', themeKey: 'default' };

              return (
                <div
                  key={`past-${key}-${idx}`}
                  style={{
                    position: 'relative',
                    padding: '1.2rem 1.5rem',
                    borderRadius: '1.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    opacity: 0.5,
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
                    <span style={{ fontSize: '2.2rem' }}>{info.icon}</span>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'line-through' }}>{info.title}</span>
                  </div>
                  <div style={{ zIndex: 1, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={20} color="#10b981" />
                  </div>
                </div>
              );
            })}

            {/* Giochi futuri */}
            {isAdmin ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={async (event) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    const oldIndex = upcomingGames.indexOf(active.id as string);
                    const newIndex = upcomingGames.indexOf(over.id as string);
                    const newOrder = arrayMove(upcomingGames, oldIndex, newIndex);
                    
                    setUpcomingGames(newOrder);
                    
                    const newPlaylist = [...playlist.slice(0, currentIndex + 1), ...newOrder];
                    const lobbyRef = ref(db, `lobbies/${lobbyCode}/multigame_session`);
                    await update(lobbyRef, { playlist: newPlaylist });
                  }
                }}
              >
                <SortableContext items={upcomingGames} strategy={verticalListSortingStrategy}>
                  <div style={{ display: 'flex', flexDirection: 'column', padding: 0, margin: 0 }}>
                    {upcomingGames.map((key, relIdx) => {
                      const info = catalogGameDetails[key] || { title: key, icon: '🎮', themeKey: 'default' };
                      const theme = gameThemes[info.themeKey] || gameThemes.default;
                      const isNext = relIdx === 0;

                      return (
                        <SortableGameItem 
                          key={key} 
                          id={key} 
                          info={info} 
                          theme={theme} 
                          isNext={isNext} 
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              upcomingGames.map((key, relIdx) => {
                const info = catalogGameDetails[key] || { title: key, icon: '🎮', themeKey: 'default' };
                const theme = gameThemes[info.themeKey] || gameThemes.default;
                const isNext = relIdx === 0;

                return (
                  <div
                    key={`upcoming-${key}`}
                    style={{
                      position: 'relative',
                      padding: '1.2rem 1.5rem',
                      borderRadius: '1.5rem',
                      background: 'rgba(0,0,0,0.3)',
                      border: `1.5px solid ${isNext ? theme.primaryColor : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: theme.backgroundGradient,
                      opacity: isNext ? 0.2 : 0,
                      zIndex: 0
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
                      <span style={{ fontSize: '2.2rem' }}>{info.icon}</span>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>{info.title}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {!isFinished ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    borderRadius: '1.5rem',
                    background: nextTheme.primaryColor,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    boxShadow: `0 10px 25px -5px ${nextTheme.primaryColor}80`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.8rem',
                    border: 'none',
                    color: 'white'
                  }}
                  onClick={handleLaunchNextSubGame}
                >
                  <PlayCircle size={24} />
                  Avvia {nextGameInfo?.title}
                </button>
              ) : (
                <div style={{ textAlign: 'center', color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  <Trophy size={48} style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                  Hai completato tutti i giochi!
                </div>
              )}

              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowConfirm(true)}
                className="multigame-terminate-button"
                aria-label="Termina la sessione Multi-Game"
              >
                <XCircle size={18} aria-hidden="true" />
                <span>Termina<span className="multigame-terminate-label-full"> Multi-Game</span></span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {isAdmin && (
          <AdminPlayersButton onClick={() => setShowManagePlayers(true)} />
        )}

        {showManagePlayers && isAdmin && (
          <ManagePlayersModal 
            lobbyCode={lobbyCode} 
            players={lobby?.players || {}} 
            currentUserId={userId} 
            onClose={() => setShowManagePlayers(false)} 
          />
        )}

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
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'white' }}>Terminare il Multi-Game?</h3>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>No</button>
                <button className="btn btn-primary" style={{ flex: 1, background: 'var(--color-danger)', color: 'white' }} onClick={() => { setShowConfirm(false); handleTerminateSession(); }}>Sì</button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </Background>
  );
}
