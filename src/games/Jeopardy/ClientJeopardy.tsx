import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';
import Avatar from '../../components/shared/Avatar';
import type { JeopardyCategory } from './data';
import { CATEGORY_EMOJIS } from '../../utils/categories';

export default function ClientJeopardy({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, updatePlayerScore, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const phase = gameState.phase || 'board';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const players = lobby?.players || {};
  
  const categories = gameState.categories as JeopardyCategory[];
  const completedCells = gameState.completedCells || [];
  const currentCell = gameState.currentCell;
  const [myVotes, setMyVotes] = useState<string[]>([]);

  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => returnToLobbyOrNextGame()}
        themeKey="jeopardy"
      />
    );
  }

  if (phase === 'voting') {
    const hasVoted = !!gameState.votes?.[userId];
    const totalVotes = Object.keys(gameState.votes || {}).length;
    const totalPlayers = Object.keys(players).length;
    
    if (hasVoted) {
      return (
        <GameLayoutMobile themeKey="jeopardy" style={{ justifyContent: 'center', textAlign: 'center' }}>
           <h2 style={{ color: 'white', marginBottom: '1rem' }}>In attesa degli altri...</h2>
           <p style={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: 'bold' }}>{totalVotes} / {totalPlayers}</p>
           {isAdmin && (
             <button className="btn btn-primary" onClick={() => updateGameState({ forceStart: true })} style={{ marginTop: '2rem' }}>
               Forza Avvio
             </button>
           )}
        </GameLayoutMobile>
      );
    }
    
    const ALL_JEOPARDY_CATEGORIES = [
      'Cinema e Serie TV', 'Storia e Mitologia', 'Musica', 'Scienza e Natura',
      'Tecnologia e Videogiochi', 'Letteratura e Arte', 'Geografia',
      'Cucina e Tradizioni', 'Cultura Pop e Gossip', 'Sport'
    ];
    
    return (
      <GameLayoutMobile themeKey="jeopardy" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
         <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>Vota 5 Categorie!</h2>
         <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '2rem' }}>Selezionate: {myVotes.length} / 5</p>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
            {ALL_JEOPARDY_CATEGORIES.map(cat => {
               const isSel = myVotes.includes(cat);
               return (
                 <button
                   key={cat}
                   onClick={() => {
                     let newVotes = myVotes;
                     if (isSel) {
                       newVotes = myVotes.filter(c => c !== cat);
                     } else if (myVotes.length < 5) {
                       newVotes = [...myVotes, cat];
                     }
                     setMyVotes(newVotes);
                     updateGameState({ [`liveVotes/${userId}`]: newVotes });
                   }}
                   style={{
                     flex: '1 1 calc(50% - 0.5rem)',
                     padding: '1.2rem 0.5rem',
                     borderRadius: '1rem',
                     border: isSel ? '2px solid white' : '2px solid transparent',
                     background: isSel ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                     color: 'white',
                     fontWeight: 'bold',
                     transition: 'all 0.2s',
                     opacity: myVotes.length >= 5 && !isSel ? 0.4 : 1,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '0.5rem',
                     boxShadow: isSel ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                   }}
                 >
                    <span style={{ fontSize: '2rem' }}>{CATEGORY_EMOJIS[cat] || '❓'}</span>
                    <span style={{ fontSize: '1rem', textAlign: 'center', lineHeight: '1.2' }}>{cat}</span>
                 </button>
               )
            })}
         </div>
         <button 
           className="btn btn-primary" 
           disabled={myVotes.length !== 5}
           onClick={() => {
              updateGameState({ [`votes/${userId}`]: myVotes });
           }}
           style={{ padding: '1.5rem', fontSize: '1.2rem', opacity: myVotes.length === 5 ? 1 : 0.5 }}
         >
           Conferma Voto
         </button>
      </GameLayoutMobile>
    );
  }

  if (phase === 'voting_results') {
    return (
      <GameLayoutMobile themeKey="jeopardy" style={{ justifyContent: 'center', textAlign: 'center' }}>
         <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '2rem' }}>Risultati!</h2>
         <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '2rem' }}>Guarda la TV per scoprire le categorie vincitrici.</p>
         
         {isAdmin && (
           <button 
             className="btn btn-primary" 
             onClick={() => updateGameState({ startBoard: true })}
             style={{ padding: '1.5rem', fontSize: '1.5rem', marginTop: '2rem', width: '100%' }}
           >
             Inizia Gioco!
           </button>
         )}
      </GameLayoutMobile>
    );
  }

  // --- VISTA ADMIN ---
  if (isAdmin) {
      const handleCellClick = (catName: string, value: number, questionObj: any) => {
          updateGameState({
              phase: 'question',
              currentCell: { categoryName: catName, value, questionObj }
          });
      };

      const handleAssignPoints = (playerId: string, points: number) => {
          updatePlayerScore(playerId, points);
      };

      const handleBackToBoard = () => {
          const cellId = `${currentCell.categoryName}-${currentCell.value}`;
          const isAlreadyCompleted = completedCells.includes(cellId);
          updateGameState({
              phase: 'board',
              completedCells: isAlreadyCompleted ? completedCells : [...completedCells, cellId],
              currentCell: null
          });
      };

      return (
          <GameLayoutMobile themeKey="jeopardy" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem', textAlign: 'center', border: '1px solid var(--color-primary)' }}>
                  <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Pannello Admin</h3>
              </div>

              {phase === 'board' && categories && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                      <p style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Seleziona una cella per i giocatori:</p>
                      
                      {categories.map((cat, idx) => (
                          <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem' }}>
                              <h4 style={{ color: 'white', textAlign: 'center', margin: '0 0 1rem 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>{cat.name}</h4>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                  {([100, 200, 300, 400, 500] as const).map(val => {
                                      const isCompleted = completedCells.includes(`${cat.name}-${val}`);
                                      return (
                                          <button
                                            key={val}
                                            onClick={() => handleCellClick(cat.name, val, cat.questions[val])}
                                            style={{
                                                flex: '1 1 18%',
                                                padding: '0.8rem 0',
                                                background: isCompleted ? 'rgba(0,0,0,0.3)' : 'var(--color-primary)',
                                                color: isCompleted ? 'rgba(255,255,255,0.4)' : 'white',
                                                border: isCompleted ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                borderRadius: '0.5rem',
                                                fontWeight: 'bold',
                                                fontSize: '1rem'
                                            }}
                                          >
                                              {val}
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>
                      ))}
                      
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem', marginTop: '1rem' }}>
                         <h4 style={{ color: 'white', textAlign: 'center', margin: '0 0 1rem 0' }}>Gestione Punti Manuale</h4>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                             {Object.entries(players).map(([id, p]: any) => (
                                 <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                                     <span style={{ color: 'white', fontWeight: 'bold' }}>{p.name}</span>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                         <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '40px', textAlign: 'center' }}>{p.score || 0}</span>
                                         <div style={{ display: 'flex', gap: '0.5rem' }}>
                                             <button onClick={() => handleAssignPoints(id, 100)} style={{ background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 'bold' }}>+</button>
                                             <button onClick={() => handleAssignPoints(id, -100)} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 'bold' }}>-</button>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                      </div>

                      <button 
                        className="btn btn-danger" 
                        onClick={() => updateGameState({ phase: 'finished' })}
                        style={{ marginTop: '2rem', padding: '1rem' }}
                      >
                          Termina Partita
                      </button>
                  </div>
              )}

              {phase === 'question' && currentCell && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '1rem' }}>
                          <h3 style={{ color: 'var(--color-primary)', margin: '0 0 1rem 0' }}>{currentCell.categoryName} - {currentCell.value}</h3>
                          <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>"{currentCell.questionObj.question}"</p>
                      </div>
                      
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '1.5rem', fontSize: '1.5rem', marginTop: 'auto' }}
                        onClick={() => updateGameState({ phase: 'reveal' })}
                      >
                          Rivela Risposta in TV
                      </button>
                  </div>
              )}

              {phase === 'reveal' && currentCell && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                      <div style={{ background: 'rgba(250, 204, 21, 0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #fde047' }}>
                          <p style={{ color: '#fde047', fontSize: '1.5rem', fontWeight: 900, textAlign: 'center', margin: 0 }}>
                              {currentCell.questionObj.answer}
                          </p>
                      </div>
                      
                      <p style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', marginTop: '1rem' }}>Assegna Punti ({currentCell.value}):</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {Object.entries(players).map(([id, p]: any) => (
                              <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <Avatar photo={p.photo} name={p.name} size={32} />
                                      <span style={{ color: 'white', fontWeight: 'bold' }}>{p.name}</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      <button onClick={() => handleAssignPoints(id, currentCell.value)} style={{ background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 'bold' }}>+</button>
                                      <button onClick={() => handleAssignPoints(id, -currentCell.value)} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 'bold' }}>-</button>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '1.5rem', fontSize: '1.2rem', marginTop: 'auto' }}
                        onClick={handleBackToBoard}
                      >
                          Torna al Tabellone
                      </button>
                  </div>
              )}
          </GameLayoutMobile>
      );
  }

  // --- VISTA GIOCATORE NORMALE ---
  return (
    <GameLayoutMobile themeKey="jeopardy" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <motion.div 
          className="panel"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          style={{ padding: '3rem 2rem', borderRadius: '2rem' }}
        >
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Jeopardy!</h2>
            
            {phase === 'board' && (
                <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Guarda la TV per scegliere la categoria e prenota la tua risposta a voce!
                </p>
            )}
            
            {(phase === 'question' || phase === 'reveal') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '4rem' }}>🗣️</div>
                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900 }}>
                        Rispondi ad alta voce!
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                        L'Admin assegnerà i punti.
                    </p>
                </div>
            )}
        </motion.div>
    </GameLayoutMobile>
  );
}
