import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLobby } from '../../hooks/useLobby';
import PodiumTV from '../../components/shared/PodiumTV';
import MiniLeaderboardTV from '../../components/shared/MiniLeaderboardTV';
import GameLayoutTV from '../../components/shared/GameLayoutTV';
import GameTitleTV from '../../components/shared/GameTitleTV';
import LoadingScreen from '../../components/shared/LoadingScreen';
import { getCategoryColor, CATEGORY_EMOJIS } from '../../utils/categories';
import Avatar from '../../components/shared/Avatar';

import { jeopardyCategories } from './data';
import type { JeopardyCategory } from './data';
import { getServerTime } from '../../utils/serverTime';
import './Jeopardy.css';

const encodeFirebaseKey = (str: string) => {
  return encodeURIComponent(str).replace(/\./g, '%2E');
};

const getUnusedQuestion = (pool: any[], used: Record<string, boolean>, newlyUsed: Record<string, boolean>) => {
  let available = pool.filter(q => !used[encodeFirebaseKey(q.question)]);
  if (available.length === 0) available = pool; // Fallback
  const selected = available[Math.floor(Math.random() * available.length)];
  newlyUsed[encodeFirebaseKey(selected.question)] = true;
  return selected;
};

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
         
         const usedQuestions = lobby?.used_jeopardy_questions || {};
         const newlyUsed: Record<string, boolean> = {};

         const boardData = finalCategories.map((catName: string) => {
            const originalCat = jeopardyCategories.find(c => c.name === catName);
            if (!originalCat) return null;
            return {
               name: catName,
               questions: {
                   100: getUnusedQuestion(originalCat.questions[100], usedQuestions, newlyUsed),
                   200: getUnusedQuestion(originalCat.questions[200], usedQuestions, newlyUsed),
                   300: getUnusedQuestion(originalCat.questions[300], usedQuestions, newlyUsed),
                   400: getUnusedQuestion(originalCat.questions[400], usedQuestions, newlyUsed),
                   500: getUnusedQuestion(originalCat.questions[500], usedQuestions, newlyUsed),
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
       const usedQuestions = lobby?.used_jeopardy_questions || {};
       const newlyUsed: Record<string, boolean> = {};

       const boardData = gameState.finalCategories.map((catName: string) => {
          const originalCat = jeopardyCategories.find(c => c.name === catName);
          if (!originalCat) return null;
          return {
             name: catName,
             questions: {
                 100: getUnusedQuestion(originalCat.questions[100], usedQuestions, newlyUsed),
                 200: getUnusedQuestion(originalCat.questions[200], usedQuestions, newlyUsed),
                 300: getUnusedQuestion(originalCat.questions[300], usedQuestions, newlyUsed),
                 400: getUnusedQuestion(originalCat.questions[400], usedQuestions, newlyUsed),
                 500: getUnusedQuestion(originalCat.questions[500], usedQuestions, newlyUsed),
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
        <div className="jeopardy-screen">
          <GameTitleTV title="Fase di voto" icon="🗳️" themeKey="jeopardy" className="jeopardy-title" />
          <p className="jeopardy-vote-subtitle">
            Guardate il telefono e scegliete 5 categorie! ({totalVotes} / {totalPlayers} hanno votato)
          </p>
          
          <div className="jeopardy-category-grid">
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
                   className="jeopardy-category-card"
                   style={{ background: getCategoryColor(cat) }}
                 >
                   <div className="jeopardy-category-card__emoji">{CATEGORY_EMOJIS[cat] || '❓'}</div>
                   <h3>{cat}</h3>
                   <div className="jeopardy-category-card__voters">
                     {voters.map((v, idx) => (
                       <div key={idx} className="jeopardy-voter-avatar" style={{ zIndex: idx }}>
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
         <div className="jeopardy-screen">
          <GameTitleTV title="Categorie scelte" icon="🏆" themeKey="jeopardy" className="jeopardy-title" />
          <p className="jeopardy-vote-subtitle">Ecco le 5 categorie selezionate per questa partita!</p>
          
          <div className="jeopardy-results-list">
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
                   className="jeopardy-result-card"
                   style={{ background: getCategoryColor(cat) }}
                 >
                   <div className="jeopardy-result-card__label">
                     <span className="jeopardy-result-card__emoji">{CATEGORY_EMOJIS[cat] || '❓'}</span>
                     <span>{cat}</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                     {voters.map((v, idx) => (
                       <div key={idx} className="jeopardy-voter-avatar" style={{ zIndex: idx }}>
                         <Avatar photo={v.photo} name={v.name} size={40} zoomFactor={1.35} />
                       </div>
                     ))}
                   </div>
                 </motion.div>
               );
            })}
          </div>
          
          <div className="jeopardy-results-note">
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
      <div className="jeopardy-screen">
        
        {gameState.phase !== 'finished' && (
            <GameTitleTV title="JEOPARDY!" icon="🧠" themeKey="jeopardy" className="jeopardy-title" compact />
        )}

        <div className="panel jeopardy-tv-panel">
        
        {gameState.phase === 'board' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%' }}>
            
            <div className="jeopardy-board" style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}>
                {categories.map((cat, idx) => (
                    <div key={idx} className="jeopardy-board__column">
                        <div className="jeopardy-board__category">
                            <span aria-hidden="true">{CATEGORY_EMOJIS[cat.name] || '❓'}</span>
                            {cat.name}
                        </div>
                        {[100, 200, 300, 400, 500].map(val => {
                            const isCompleted = completedCells.includes(`${cat.name}-${val}`);
                            return (
                                <div key={val} className={`jeopardy-board__cell${isCompleted ? ' jeopardy-board__cell--done' : ''}`}>
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
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="jeopardy-clue-stage">
            
            <div className="jeopardy-clue-meta">
                {currentCell.categoryName} - {currentCell.value}
            </div>

            <h2 className="jeopardy-clue">
              "{currentCell.questionObj.question}"
            </h2>
            
            {gameState.phase === 'reveal' && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }}
                    className="jeopardy-answer"
                >
                    {currentCell.questionObj.answer}
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
