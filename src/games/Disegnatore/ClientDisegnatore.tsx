import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brush, 
  Eraser, 
  Minus, 
  Square, 
  Circle, 
  Maximize, 
  Minimize,
  Trash2 
} from 'lucide-react';
import { ref as dbRef, update } from 'firebase/database';
import { db } from '../../firebase';
import { useLobby } from '../../hooks/useLobby';
import PodiumMobile from '../../components/shared/PodiumMobile';
import RoundTracker from '../../components/shared/RoundTracker';
import ProgressBar from '../../components/shared/ProgressBar';
import RoundLeaderboardMobile from '../../components/shared/RoundLeaderboardMobile';
import WordRevealUI from '../../components/shared/WordRevealUI';

import GameLayoutMobile from '../../components/shared/GameLayoutMobile';

export default function ClientDisegnatore({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, setGameStatus } = useLobby(lobbyCode);
  
  const gameState = lobby?.game_state || {};
  const phase = gameState.phase;
  const isAdmin = Boolean(lobby?.players?.[userId]?.isAdmin);
  const isDrawer = gameState.drawerId === userId;
  
  const [guess, setGuess] = useState('');
  
  // Drawing Logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDrawingRef = useRef(false);
  const batchQueueRef = useRef<any[]>([]);

  // Advanced Tools State
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | 'line' | 'rect' | 'circle'>('brush');
  const [activeColor, setActiveColor] = useState<string>('#000000');
  const [activeSize, setActiveSize] = useState<number>(6);
  const [shapeStart, setShapeStart] = useState<{x: number, y: number} | null>(null);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const colors = ['#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#000000'];

  useEffect(() => {
    // Set internal resolution once (4:3 aspect ratio)
    if (canvasRef.current && previewCanvasRef.current) {
      canvasRef.current.width = 1200;
      canvasRef.current.height = 900;
      previewCanvasRef.current.width = 1200;
      previewCanvasRef.current.height = 900;
    }
  }, [phase]);

  useEffect(() => {
    // Throttled batch sender (Optimized for Firebase RTDB)
    if (!isDrawer || phase !== 'draw') return;

    const interval = setInterval(() => {
      if (batchQueueRef.current.length > 0) {
        const batch = [...batchQueueRef.current];
        batchQueueRef.current = [];
        
        // Push batch to firebase without overwriting
        const updates: any = {};
        updates[`lobbies/${lobbyCode}/game_state/strokes/${Date.now()}`] = batch;
        update(dbRef(db), updates);
      }
    }, 500); // Send every 500ms

    return () => clearInterval(interval);
  }, [isDrawer, phase, lobbyCode]);

  const getContexts = () => {
    const mainCtx = canvasRef.current?.getContext('2d');
    const prevCtx = previewCanvasRef.current?.getContext('2d');
    return { mainCtx, prevCtx };
  };

  const setStrokeStyle = (ctx: CanvasRenderingContext2D, isEraser: boolean) => {
    ctx.strokeStyle = isEraser ? '#ffffff' : activeColor;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = activeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (activeTool === 'brush' || activeTool === 'eraser') {
      batchQueueRef.current.push({ x, y, type: 'start', tool: activeTool, color: activeColor, size: activeSize });
      const { mainCtx } = getContexts();
      if (mainCtx) {
        setStrokeStyle(mainCtx, activeTool === 'eraser');
        mainCtx.beginPath();
        mainCtx.moveTo(x * 1200, y * 900);
      }
    } else {
      setShapeStart({ x, y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (activeTool === 'brush' || activeTool === 'eraser') {
      batchQueueRef.current.push({ x, y, type: 'line', tool: activeTool, color: activeColor, size: activeSize });
      const { mainCtx } = getContexts();
      if (mainCtx) {
        mainCtx.lineTo(x * 1200, y * 900);
        mainCtx.stroke();
      }
    } else if (shapeStart) {
      const { prevCtx } = getContexts();
      if (!prevCtx) return;
      prevCtx.clearRect(0, 0, 1200, 900);
      setStrokeStyle(prevCtx, false);
      
      const sx = shapeStart.x * 1200, sy = shapeStart.y * 900;
      const ex = x * 1200, ey = y * 900;

      if (activeTool === 'line') {
        prevCtx.beginPath(); prevCtx.moveTo(sx, sy); prevCtx.lineTo(ex, ey); prevCtx.stroke();
      } else if (activeTool === 'rect') {
        prevCtx.strokeRect(sx, sy, ex - sx, ey - sy);
      } else if (activeTool === 'circle') {
        prevCtx.beginPath();
        prevCtx.arc(sx, sy, Math.hypot(ex - sx, ey - sy), 0, Math.PI * 2);
        prevCtx.stroke();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;
    
    // Fallback bounds
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    if (activeTool === 'brush' || activeTool === 'eraser') {
      batchQueueRef.current.push({ x, y, type: 'end', tool: activeTool, color: activeColor, size: activeSize });
      const { mainCtx } = getContexts();
      if (mainCtx) mainCtx.closePath();
    } else if (shapeStart) {
      batchQueueRef.current.push({ type: 'shape', tool: activeTool, color: activeColor, size: activeSize, startX: shapeStart.x, startY: shapeStart.y, endX: x, endY: y });
      
      const { mainCtx, prevCtx } = getContexts();
      if (mainCtx && prevCtx) {
        setStrokeStyle(mainCtx, false);
        const sx = shapeStart.x * 1200, sy = shapeStart.y * 900;
        const ex = x * 1200, ey = y * 900;

        if (activeTool === 'line') {
          mainCtx.beginPath(); mainCtx.moveTo(sx, sy); mainCtx.lineTo(ex, ey); mainCtx.stroke();
        } else if (activeTool === 'rect') {
          mainCtx.strokeRect(sx, sy, ex - sx, ey - sy);
        } else if (activeTool === 'circle') {
          mainCtx.beginPath();
          mainCtx.arc(sx, sy, Math.hypot(ex - sx, ey - sy), 0, Math.PI * 2);
          mainCtx.stroke();
        }
        prevCtx.clearRect(0, 0, 1200, 900);
      }
      setShapeStart(null);
    }
  };

  const handleClear = () => {
    const { mainCtx } = getContexts();
    if (mainCtx) mainCtx.clearRect(0, 0, 1200, 900);
    updateGameState({ strokes: null });
  };

  const toggleFullscreen = () => {
    setIsPseudoFullscreen(prev => !prev);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'draw' || isDrawer || !guess.trim()) return;
    
    const timeElapsed = Date.now() - (gameState.startTime || Date.now());

    updateGameState({
      [`guesses/${userId}`]: { value: guess.trim(), timeElapsed }
    });
    setGuess('');
  };


  if (phase === 'finished') {
    return (
      <PodiumMobile 
        players={lobby?.players} 
        userId={userId} 
        isAdmin={isAdmin} 
        onReturnToLobby={() => setGameStatus('waiting')} 
      />
    );
  }

  if (phase === 'reveal') {
    const isWinner = gameState.correctGuessers?.[userId];

    return (
      <div className="container-mobile" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: isWinner ? 'var(--color-success)' : 'white', marginBottom: '0.5rem' }}>
            {isWinner ? '✅ Hai indovinato!' : 'La parola era:'}
          </h2>
          <p style={{ margin: '1rem 0', color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {gameState.word}
          </p>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
            >
              Vedi Classifica (Admin)
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="container-mobile" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
        <RoundLeaderboardMobile 
          players={lobby?.players} 
          points={Object.fromEntries(Object.entries(lobby?.players || {}).map(([id, p]: any) => [id, p.score || 0]))} 
          roundPoints={gameState.roundPoints || {}} 
          roundName={`Round ${gameState.round || 1}`}
        />
        
        {isAdmin && (
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '2rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
            onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
          >
            Prossimo Turno (Admin)
          </button>
        )}
      </div>
    );
  }

  const isFullscreenLayout = isPseudoFullscreen || isLandscape;

  if (phase === 'draw' || phase === 'finished' || phase === 'results') {
    if (isDrawer) {
      return (
        <GameLayoutMobile themeKey="disegnatore" style={{ padding: 0 }}>
          <div 
            ref={containerRef}
          className={isFullscreenLayout ? "" : "container-mobile"} 
          style={isFullscreenLayout ? { 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            zIndex: 99999, 
            background: 'var(--color-bg)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0.5rem' 
          } : { 
            justifyContent: 'flex-start', 
            paddingTop: '4rem', 
            background: 'var(--color-bg)' 
          }}
        >
          {!isFullscreenLayout && (
            <>
              <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
              <ProgressBar durationMs={(gameState.settings?.duration || 60) * 1000} startTime={gameState.startTime} />
            </>
          )}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ 
              display: 'flex', 
              flexDirection: isLandscape ? 'row' : 'column', 
              flex: 1, 
              minHeight: 0, 
              marginTop: isFullscreenLayout ? '0' : '1rem',
              overflowY: isFullscreenLayout ? 'hidden' : 'auto',
              gap: isLandscape ? '1rem' : '0'
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: isLandscape ? '320px' : '100%',
              flexShrink: 0,
              overflowY: isLandscape ? 'auto' : 'visible',
              paddingRight: isLandscape ? '0.5rem' : '0'
            }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.2rem', color: 'var(--color-primary)', fontSize: '1rem' }}>Devi disegnare:</h2>
                <h1 style={{ textAlign: 'center', marginBottom: '0.8rem', textTransform: 'uppercase', color: 'white', fontSize: '1.5rem', padding: '0 2.5rem' }}>{gameState.word}</h1>
                <button 
                  onClick={toggleFullscreen} 
                  style={{ 
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '0.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: isPseudoFullscreen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                    color: isPseudoFullscreen ? 'var(--color-primary)' : 'white',
                    border: isPseudoFullscreen ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.8rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  title={isPseudoFullscreen ? 'Riduci' : 'Espandi'}
                >
                   {isPseudoFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
              
              {/* Toolbar Panel (Premium UI) */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.8rem', 
              padding: '0.8rem', 
              background: 'rgba(20, 25, 35, 0.7)', 
              backdropFilter: 'blur(12px)',
              borderRadius: '1.2rem', 
              marginBottom: '0.8rem', 
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
              
              {/* Row 1: Tools */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '0.8rem', flex: 1, justifyContent: 'space-between' }}>
                  {[
                    { id: 'brush', icon: <Brush size={20} /> },
                    { id: 'eraser', icon: <Eraser size={20} /> },
                    { id: 'line', icon: <Minus size={20} /> },
                    { id: 'rect', icon: <Square size={20} /> },
                    { id: 'circle', icon: <Circle size={20} /> }
                  ].map(tool => (
                    <button 
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id as any)} 
                      style={{ 
                        padding: '0.5rem', 
                        background: activeTool === tool.id ? 'var(--color-primary)' : 'transparent', 
                        color: activeTool === tool.id ? 'white' : 'rgba(255,255,255,0.6)',
                        border: 'none',
                        borderRadius: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: activeTool === tool.id ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                        flex: 1
                      }}
                    >
                      {tool.icon}
                    </button>
                  ))}
                </div>
                <button onClick={handleClear} style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', cursor: 'pointer', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }} title="Pulisci lavagna">
                  <Trash2 size={22} />
                </button>
              </div>

              {/* Row 2: Colors, Sizes, Actions */}
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.2rem', paddingRight: '0.2rem' }}>
                
                {/* Sizes */}
                <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '0.8rem', flexShrink: 0 }}>
                  {[3, 6, 12].map(size => (
                    <button 
                      key={size} 
                      onClick={() => setActiveSize(size)} 
                      style={{ 
                        border: 'none', 
                        background: activeSize === size ? 'rgba(255,255,255,0.15)' : 'transparent', 
                        borderRadius: '0.6rem', 
                        width: '36px', 
                        height: '36px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        width: `${size + 2}px`, 
                        height: `${size + 2}px`, 
                        background: activeSize === size ? 'var(--color-primary)' : 'white', 
                        borderRadius: '50%',
                        boxShadow: activeSize === size ? '0 0 8px var(--color-primary)' : 'none'
                      }}></div>
                    </button>
                  ))}
                </div>
                
                {/* Colors */}
                <div style={{ display: 'flex', gap: '0.4rem', flex: 1, padding: '0.3rem', background: 'rgba(0,0,0,0.4)', borderRadius: '0.8rem', flexShrink: 0 }}>
                  {colors.map(c => (
                    <div 
                      key={c} 
                      onClick={() => setActiveColor(c)} 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: c, 
                        border: activeColor === c ? '3px solid white' : '2px solid rgba(255,255,255,0.1)', 
                        flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: activeColor === c ? `0 0 12px ${c}` : 'none',
                        transform: activeColor === c ? 'scale(1.1)' : 'scale(1)'
                      }} 
                    />
                  ))}
                </div>
              </div>
              </div>
            </div>

            <div style={
              isPseudoFullscreen 
              ? { flex: 1, minHeight: 0, minWidth: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }
              : { width: '100%', display: 'flex', justifyContent: 'center' }
            }>
              <div style={{ 
                position: 'relative', 
                height: isPseudoFullscreen ? '100%' : 'auto', 
                width: isPseudoFullscreen ? 'auto' : '100%',
                maxWidth: '100%', 
                aspectRatio: '4/3', 
                background: '#ffffff', 
                borderRadius: '1rem', 
                border: '2px solid var(--color-primary)', 
                touchAction: 'none', 
                overflow: 'hidden',
                flexShrink: 0,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}>
                <canvas 
                  ref={canvasRef}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
                />
                <canvas 
                  ref={previewCanvasRef}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onPointerOut={handlePointerUp}
                />
              </div>
            </div>
          </motion.div>
          </div>
        </GameLayoutMobile>
      );
    } else {
      // Guesser
      return (
        <GameLayoutMobile themeKey="disegnatore" style={{ justifyContent: 'center', padding: '4rem 2rem 2rem 2rem' }}>
          <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
          <ProgressBar durationMs={(gameState.settings?.duration || 60) * 1000} startTime={gameState.startTime} />
          <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '2rem' }}>
            {gameState.correctGuessers?.[userId] ? (
              <h2 style={{ textAlign: 'center', color: 'var(--color-success)', margin: '2rem 0' }}>✅ Hai indovinato! Attendi gli altri...</h2>
            ) : (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-primary)' }}>Cosa sta disegnando?</h2>
                
                <WordRevealUI 
                  word={gameState.word} 
                  revealSequence={gameState.revealSequence || []} 
                  startTime={gameState.startTime || Date.now()} 
                  durationMs={(gameState.settings?.duration || 60) * 1000} 
                  isTV={false} 
                />

                <form onSubmit={handleGuessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <input 
                    type="text" 
                    className="input" 
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="La tua risposta..."
                    style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center' }}
                    required
                  />
                  
                  <button 
                    type="submit" 
                    className="btn btn-giant btn-primary"
                    disabled={!guess.trim()}
                  >
                    INVIA IPOTESI
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </GameLayoutMobile>
      );
    }
  }

  return <div>Caricamento...</div>;
}
