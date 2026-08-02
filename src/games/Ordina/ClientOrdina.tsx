import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import GameLayoutMobile from '../../components/shared/GameLayoutMobile';
import { getServerTime } from '../../utils/serverTime';
import { getCategoryColor } from '../../utils/categories';

function SortableOrdinaItem({ id, item, index }: { id: string, item: string, index: number }) {
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
    padding: '1.2rem',
    borderRadius: '1rem',
    background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
    color: 'white',
    border: `1.5px solid rgba(255,255,255,0.1)`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'grab',
    touchAction: 'none',
    marginBottom: '1rem',
    boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.2)'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>{item}</div>
      <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>↕️</div>
    </div>
  );
}

export default function ClientOrdina({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const myAnswer = gameState.answers?.[userId]; // is an array of strings if answered
  const phase = gameState.phase || 'question';
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const currentQ = gameState.question;
  const shuffledItems = gameState.shuffledItems || [];

  const [items, setItems] = useState<string[]>([]);
  const initializedForIndex = useRef<number>(-1);

  useEffect(() => {
    if (phase === 'question' && myAnswer === undefined && shuffledItems.length > 0 && gameState.questionIndex !== initializedForIndex.current) {
      setItems([...shuffledItems]);
      initializedForIndex.current = gameState.questionIndex;
    }
  }, [phase, myAnswer, shuffledItems, gameState.questionIndex]);

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAnswer = () => {
    if (myAnswer !== undefined || phase !== 'question') return; 
    
    updateGameState({
      [`answers/${userId}`]: items
    });
  };

  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => returnToLobbyOrNextGame()}
        themeKey="ordina"
        customBackground={gameState.question ? getCategoryColor(gameState.question.category) : undefined}
      />
    );
  }

  if (phase === 'reveal') {
    let correctPositions = 0;
    if (myAnswer && Array.isArray(myAnswer) && currentQ?.items) {
        for (let i = 0; i < currentQ.items.length; i++) {
            if (myAnswer[i] === currentQ.items[i]) correctPositions++;
        }
    }
    let points = 0;
    if (currentQ?.items) {
      const ptsPerItem = Math.floor(100 / currentQ.items.length);
      points = Math.floor(correctPositions * ptsPerItem);
      if (correctPositions === currentQ.items.length) {
          points += 50; // Bonus
      }
    }
    
    return (
      <GameLayoutMobile themeKey="ordina" customBackground={gameState.question ? getCategoryColor(gameState.question.category) : undefined} style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 5} isMobile />
        <motion.div 
          className="panel" 
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }}
          style={{ 
            padding: '2rem 1rem', 
            borderRadius: '2rem', 
            boxShadow: points === 150 ? '0 0 40px rgba(16, 185, 129, 0.4)' : points > 0 ? '0 0 40px rgba(245, 158, 11, 0.4)' : 'none',
            border: points === 150 ? '2px solid var(--color-success)' : points > 0 ? '2px solid var(--color-warning)' : '2px solid var(--color-danger)'
          }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: points === 150 ? 'var(--color-success)' : points > 0 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
            {points > 0 ? `+${points} PUNTI!` : myAnswer !== undefined ? '0 PUNTI' : '⏳ SCADUTO'}
          </h2>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
            <p style={{ margin: 0, color: 'white', fontWeight: 'bold', marginBottom: '1rem' }}>L'ordine corretto era:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentQ?.items.map((item: string, idx: number) => {
                    const isMyCorrect = myAnswer && myAnswer[idx] === item;
                    return (
                        <div key={idx} style={{ 
                            background: isMyCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', 
                            padding: '0.5rem', 
                            borderRadius: '0.5rem',
                            border: isMyCorrect ? '1px solid var(--color-success)' : '1px solid rgba(255,255,255,0.1)',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ color: 'var(--color-primary)' }}>{idx + 1}.</span> {item}
                        </div>
                    );
                })}
            </div>
          </div>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '2rem', width: '100%', padding: '1rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: getServerTime() })}
            >
              {(gameState.questionIndex || 0) + 1 >= (gameState.totalRounds || gameState.settings?.rounds || 5) ? 'Termina Partita' : 'Prossimo Round'}
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  return (
    <GameLayoutMobile themeKey="ordina" customBackground={gameState.question ? getCategoryColor(gameState.question.category) : undefined} style={{ justifyContent: 'center', paddingTop: '4rem' }}>
      <RoundTracker current={(gameState.questionIndex || 0) + 1} total={gameState.totalRounds || gameState.settings?.rounds || 5} isMobile />
      <ProgressBar durationMs={(gameState.settings?.duration || 25) * 1000} startTime={gameState.startTime} />
      
      {myAnswer === undefined ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', padding: '1rem 0' }}
        >
          {currentQ && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1rem',
              borderRadius: '1rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              marginBottom: '0.5rem'
            }}>
              <h3 style={{ textAlign: 'center', color: 'white', fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 600 }}>
                {currentQ.question}
              </h3>
            </div>
          )}
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
             {/* Using DndContext for Drag & Drop */}
             <DndContext 
               sensors={sensors}
               collisionDetection={closestCenter}
               onDragEnd={handleDragEnd}
             >
               <SortableContext 
                 items={items}
                 strategy={verticalListSortingStrategy}
               >
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   {items.map((item, idx) => (
                     <SortableOrdinaItem 
                       key={item} 
                       id={item} 
                       item={item}
                       index={idx}
                     />
                   ))}
                 </div>
               </SortableContext>
             </DndContext>
          </div>

          <button 
            className="btn btn-giant" 
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'white', 
              fontSize: '1.8rem', 
              fontWeight: 900,
              borderRadius: '2rem',
              padding: '1.2rem',
              boxShadow: '0 10px 25px rgba(225, 29, 72, 0.4)',
              marginTop: '1rem'
            }}
            onClick={handleAnswer}
          >
            CONFERMA
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="panel"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}
        >
          <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>Risposta Inviata!</h2>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.7 }}>
             {myAnswer.map((item: string, i: number) => (
                 <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                     {i+1}. {item}
                 </div>
             ))}
          </div>
          <p className="animate-pulse" style={{ marginTop: '1.5rem', fontSize: '1.2rem' }}>
            In attesa degli altri...
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '2rem' }}
            onClick={() => updateGameState({ [`answers/${userId}`]: null })}
          >
            Modifica Risposta
          </button>
        </motion.div>
      )}
      
    </GameLayoutMobile>
  );
}
