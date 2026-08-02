import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { getCategoryColor, CATEGORY_EMOJIS } from '../../utils/categories';
import Avatar from '../../components/shared/Avatar';

import { jeopardyCategories } from './data';
import type { JeopardyCategory } from './data';
import { getServerTime } from '../../utils/serverTime';

export default function HostJeopardy({ lobbyCode }: { lobbyCode: string }) {
  const { lobby, updateGameState } = useLobby(lobbyCode);
  const gameState = lobby?.game_state || {};
  const players = lobby?.players || {};
  
  useEffect(() => {
    if (lobby && !gameState.phase) {
      const mode = gameState.settings?.categorySelectionMode || 'admin';
      
      if (mode === 'vote') {
         updateGameState({
            phase: 'voting',
            votes: {},
            startTime: getServerTime()
         });
      } else {
         const adminCats = gameState.settings?.adminCategories || [];
         const finalCategories = adminCats.length === 5 ? adminCats : ['Cinema e Serie TV', 'Storia e Mitologia', 'Musica', 'Scienza e Natura', 'Sport'];
         
         const boardData = finalCategories.map((catName: string) => {
            const originalCat = jeopardyCategories.find(c => c.name === catName);
            if (!originalCat) return null;
            return {
               name: catName,
               questions: {
                   100: originalCat.questions[100][Math.floor(Math.random() * originalCat.questions[100].length)],
                   200: originalCat.questions[200][Math.floor(Math.random() * originalCat.questions[200].length)],
                   300: originalCat.questions[300][Math.floor(Math.random() * originalCat.questions[300].length)],
                   400: originalCat.questions[400][Math.floor(Math.random() * originalCat.questions[400].length)],
                   500: originalCat.questions[500][Math.floor(Math.random() * originalCat.questions[500].length)],
               }
            }
         }).filter(Boolean);

         updateGameState({
            phase: 'board',
            categories: boardData,
            completedCells: [], 
            currentCell: null,
            startTime: getServerTime()
         });
      }
    }
  }, [lobby]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (gameState.phase === 'voting') {
       if (gameState.forceStart) {
           const votes = gameState.votes || {};
           const tally: Record<string, number> = {};
           Object.values(votes).forEach((playerVotes: any) => {
              playerVotes.forEach((v: string) => {
                 tally[v] = (tally[v] || 0) + 1;
              });
           });
           
           const entries = Object.entries(tally).map(e => ({ cat: e[0], count: e[1], r: Math.random() }));
           entries.sort((a, b) => {
               if (b.count !== a.count) return b.count - a.count;
               return b.r - a.r;
           });
           const sorted = entries.map(e => e.cat);
           
           const fallback = ['Cinema e Serie TV', 'Storia e Mitologia', 'Musica', 'Scienza e Natura', 'Tecnologia e Videogiochi', 'Letteratura e Arte', 'Geografia', 'Cucina e Tradizioni', 'Cultura Pop e Gossip', 'Sport']
             .map(cat => ({ cat, r: Math.random() }))
             .sort((a, b) => b.r - a.r)
             .map(e => e.cat);
             
           const finalCategories = [...sorted, ...fallback].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);
           
           updateGameState({
               phase: 'voting_results',
               forceStart: null,
               finalCategories: finalCategories,
               tally: tally
           });
       } else {
           const totalVotes = Object.keys(gameState.votes || {}).length;
           const totalPlayers = Object.keys(players).length;
           if (totalVotes > 0 && totalVotes === totalPlayers) {
               updateGameState({ forceStart: true });
           }
       }
    }
  }, [gameState.phase, gameState.votes, gameState.forceStart, players]);

  useEffect(() => {
    if (gameState.phase === 'voting_results' && gameState.startBoard) {
       const boardData = gameState.finalCategories.map((catName: string) => {
          const originalCat = jeopardyCategories.find(c => c.name === catName);
          if (!originalCat) return null;
          return {
             name: catName,
             questions: {
                 100: originalCat.questions[100][Math.floor(Math.random() * originalCat.questions[100].length)],
                 200: originalCat.questions[200][Math.floor(Math.random() * originalCat.questions[200].length)],
                 300: originalCat.questions[300][Math.floor(Math.random() * originalCat.questions[300].length)],
                 400: originalCat.questions[400][Math.floor(Math.random() * originalCat.questions[400].length)],
                 500: originalCat.questions[500][Math.floor(Math.random() * originalCat.questions[500].length)],
             }
          }
       }).filter(Boolean);
       
       updateGameState({
           phase: 'board',
           startBoard: null,
           categories: boardData,
           completedCells: [],
           currentCell: null,
           startTime: getServerTime()
       });
    }
  }, [gameState.phase, gameState.startBoard]);

  useEffect(() => {
    if (gameState.phase === 'board' && gameState.completedCells?.length === 25) {
        updateGameState({ phase: 'finished' });
    }
  }, [gameState.phase, gameState.completedCells]);

  if (gameState.phase === 'voting') {
    const totalVotes = Object.keys(gameState.votes || {}).length;
    const totalPlayers = Object.keys(players).length;
    
    const ALL_JEOPARDY_CATEGORIES = [
      'Cinema e Serie TV', 'Storia e Mitologia', 'Musica', 'Scienza e Natura',
      'Tecnologia e Videogiochi', 'Letteratura e Arte', 'Geografia',
      'Cucina e Tradizioni', 'Cultura Pop e Gossip', 'Sport'
    ];
    
    return (
      <GameLayoutTV themeKey="jeopardy">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '4rem', color: 'white', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>Fase di Voto</h1>
          <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
            Guardate il telefono e scegliete 5 categorie! ({totalVotes} / {totalPlayers} hanno votato)
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', width: '100%', maxWidth: '1400px' }}>
            {ALL_JEOPARDY_CATEGORIES.map(cat => {
               const voters = Object.entries(gameState.liveVotes || {})
                 .filter(([_, pVotes]: [string, any]) => pVotes.includes(cat))
                 .map(([pId]) => players[pId])
                 .filter(Boolean);
                 
               return (
                 <motion.div
                   key={cat}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   style={{
                     position: 'relative',
                     background: getCategoryColor(cat),
                     padding: '2.5rem 1.5rem',
                     borderRadius: '1.5rem',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                     border: '2px solid rgba(255,255,255,0.2)',
                     marginBottom: '2rem'
                   }}
                 >
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>{CATEGORY_EMOJIS[cat] || '❓'}</div>
                     <h3 style={{ color: 'white', margin: 0, textAlign: 'center', fontSize: '1.6rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                       {cat}
                     </h3>
                   </div>
                   <div style={{ 
                       position: 'absolute', 
                       bottom: '-25px', 
                       left: 0, 
                       right: 0, 
                       display: 'flex', 
                       justifyContent: 'center',
                       alignItems: 'center'
                   }}>
                     {voters.map((v, idx) => (
                       <div key={idx} style={{ 
                           marginLeft: idx === 0 ? 0 : '-15px', 
                           zIndex: idx, 
                           border: '3px solid rgba(255,255,255,0.8)', 
                           borderRadius: '50%', 
                           boxShadow: '0 4px 6px rgba(0,0,0,0.5)' 
                       }}>
                         <Avatar photo={v.photo} name={v.name} size={45} zoomFactor={1.35} />
                       </div>
                     ))}
                   </div>
                 </motion.div>
               );
            })}
          </div>
        </div>
      </GameLayoutTV>
    );
  }

  if (gameState.phase === 'voting_results') {
    const finalCats = gameState.finalCategories || [];
    return (
      <GameLayoutTV themeKey="jeopardy">
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '4rem', color: 'white', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>Risultati Votazione</h1>
          <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)', marginBottom: '3rem' }}>Ecco le 5 categorie selezionate per questa partita!</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '800px' }}>
            {finalCats.map((cat: string, index: number) => {
               const voters = Object.entries(gameState.votes || {})
                 .filter(([_, pVotes]: [string, any]) => pVotes.includes(cat))
                 .map(([pId]) => players[pId])
                 .filter(Boolean);
                 
               return (
                 <motion.div
                   key={`${cat}-results`}
                   initial={{ opacity: 0, x: -50 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.2 }}
                   style={{
                     background: getCategoryColor(cat),
                     padding: '1.5rem 2rem',
                     borderRadius: '1rem',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                     border: '2px solid rgba(255,255,255,0.2)',
                     minHeight: '120px'
                   }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                     <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{CATEGORY_EMOJIS[cat] || '❓'}</span>
                     <span style={{ fontSize: '2.2rem', color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{cat}</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                     {voters.map((v, idx) => (
                       <div key={idx} style={{ marginLeft: idx === 0 ? 0 : '-10px', zIndex: idx, border: '2px solid rgba(255,255,255,0.8)', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                         <Avatar photo={v.photo} name={v.name} size={40} zoomFactor={1.35} />
                       </div>
                     ))}
                   </div>
                 </motion.div>
               );
            })}
          </div>
          
          <div style={{ marginTop: '3rem', color: 'white', fontSize: '1.2rem', opacity: 0.7 }}>
            L'Admin può avviare la partita dal telefono.
          </div>
         </div>
      </GameLayoutTV>
    );
  }

  if (!gameState.categories) return <LoadingScreen message="Caricamento in corso..." />;

  const categories = gameState.categories as JeopardyCategory[];
  const completedCells = gameState.completedCells || [];
  const currentCell = gameState.currentCell; // { categoryName, value, questionObj }

  return (
    <GameLayoutTV 
      themeKey="jeopardy"
      leaderboard={gameState.phase !== 'finished' ? <MiniLeaderboardTV players={players} animateUpdates={true} /> : undefined}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0, padding: '2rem' }}>
        
        {gameState.phase !== 'finished' && (
            <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
                fontSize: '4.5rem', 
                marginBottom: '2rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #fde047 0%, #eab308 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0px 10px 20px rgba(0,0,0,0.3)'
            }}
            >
            JEOPARDY!
            </motion.h1>
        )}

        <div className="panel" style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: gameState.phase === 'board' ? '1rem' : '2rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {gameState.phase === 'board' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${categories.length}, 1fr)`, gap: '1rem', width: '100%', height: '100%' }}>
                {categories.map((cat, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ 
                            background: 'var(--color-primary)', 
                            color: 'white', 
                            padding: '1.5rem 1rem', 
                            borderRadius: '1rem', 
                            textAlign: 'center', 
                            fontWeight: 900, 
                            fontSize: '1.5rem',
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100px'
                        }}>
                            {cat.name}
                        </div>
                        {[100, 200, 300, 400, 500].map(val => {
                            const isCompleted = completedCells.includes(`${cat.name}-${val}`);
                            return (
                                <div key={val} style={{
                                    flex: 1,
                                    background: isCompleted ? 'rgba(0,0,0,0.2)' : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    fontWeight: 900,
                                    color: isCompleted ? 'rgba(255,255,255,0.1)' : '#fde047',
                                    boxShadow: isCompleted ? 'none' : '0 5px 15px rgba(0,0,0,0.4)',
                                    border: isCompleted ? '1px solid rgba(255,255,255,0.05)' : '2px solid rgba(255,255,255,0.2)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {isCompleted ? '' : val}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

          </motion.div>
        )}

        {(gameState.phase === 'question' || gameState.phase === 'reveal') && currentCell && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
            
            <div style={{
                background: 'var(--color-primary)',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '2rem',
                fontSize: '2rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                marginBottom: '1rem'
            }}>
                {currentCell.categoryName} - {currentCell.value}
            </div>

            <h2 style={{ 
              fontSize: '4rem', 
              color: 'white', 
              marginBottom: '3rem',
              textAlign: 'center',
              maxWidth: '1200px',
              fontWeight: 800,
              textShadow: '0 4px 10px rgba(0,0,0,0.5)',
              padding: '2rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '2rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              "{currentCell.questionObj.question}"
            </h2>
            
            {gameState.phase === 'reveal' && (
                <motion.div 
                    initial={{ y: 50, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                    background: 'rgba(250, 204, 21, 0.2)',
                    padding: '2rem 4rem',
                    borderRadius: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 0 40px rgba(250, 204, 21, 0.3)',
                    border: '3px solid #fde047'
                }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fde047', margin: 0, textAlign: 'center' }}>
                    {currentCell.questionObj.answer}
                </h2>
                </motion.div>
            )}

          </motion.div>
        )}

          {gameState.phase === 'finished' && (
            <PodiumTV 
              players={players} 
              points={Object.fromEntries(Object.entries(players).map(([id, p]: any) => [id, p.score || 0]))} 
            />
          )}
        </div>
      </div>
    </GameLayoutTV>
  );
}
