import { useState, useRef, useEffect } from 'react';
import { floodFill } from '../../utils/drawing';
import { motion } from 'framer-motion';
import { 
  Brush, 
  Eraser, 
  Minus, 
  Square, 
  Circle, 
  Maximize, 
  Minimize,
  Trash2,
  Palette,
  PaintBucket
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
import LoadingScreen from '../../components/shared/LoadingScreen';
import { getServerTime } from '../../utils/serverTime';
import './Disegnatore.css';

const DRAWING_COLORS = ['#111827', '#ffffff', '#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function ClientDisegnatore({ lobbyCode, userId }: { lobbyCode: string, userId: string }) {
  const { lobby, updateGameState, returnToLobbyOrNextGame } = useLobby(lobbyCode);
  
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
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | 'line' | 'rect' | 'circle' | 'bucket'>('brush');
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
        updates[`lobbies/${lobbyCode}/game_state/strokes/${getServerTime()}`] = batch;
        update(dbRef(db), updates);
      }
    }, 150); // Send every 150ms

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

    if (activeTool === 'bucket') {
      const { mainCtx } = getContexts();
      if (!mainCtx) return;
      
      const px = Math.floor(x * 1200);
      const py = Math.floor(y * 900);
      floodFill(mainCtx, px, py, activeColor);
      
      batchQueueRef.current.push({
        tool: 'bucket',
        color: activeColor,
        x,
        y,
        timestamp: getServerTime()
      });
      return;
    }

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
    
    const timeElapsed = getServerTime() - (gameState.startTime || getServerTime());

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
        onReturnToLobby={() => returnToLobbyOrNextGame()}
        themeKey="disegnatore"
      />
    );
  }

  if (phase === 'reveal') {
    const isWinner = gameState.correctGuessers?.[userId];

    return (
      <GameLayoutMobile themeKey="disegnatore" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '1.5rem', color: isWinner ? 'var(--color-success)' : 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {isWinner ? '✅ Hai indovinato!' : 'La parola era:'}
          </h2>
          <div style={{ 
            fontSize: 'clamp(1.2rem, 8vw, 2.2rem)', 
            fontWeight: '900',
            color: 'white', 
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            padding: '1rem clamp(1rem, 4vw, 2rem)',
            borderRadius: '1.5rem',
            display: 'inline-block',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
            letterSpacing: '1px',
            marginTop: '1rem',
            marginBottom: '1rem',
            maxWidth: '100%',
            wordWrap: 'break-word',
            boxSizing: 'border-box'
          }}>
            {gameState.word}
          </div>
          
          {isAdmin && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '3rem', width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={() => updateGameState({ action: 'next_round', actionId: getServerTime() })}
            >
              Vedi Classifica (Admin)
            </button>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  if (phase === 'results') {
    return (
      <GameLayoutMobile themeKey="disegnatore" style={{ justifyContent: 'flex-start' }}>
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
            onClick={() => updateGameState({ action: 'next_round', actionId: getServerTime() })}
          >
            Prossimo Turno (Admin)
          </button>
        )}
      </GameLayoutMobile>
    );
  }

  if (phase === 'choose_word') {
    const isDrawer = userId === gameState.drawerId;
    return (
      <GameLayoutMobile themeKey="disegnatore" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          {isDrawer ? (
            <>
              <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1.5rem' }}>
                Scegli cosa disegnare:
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {gameState.wordChoices?.map((choice: string, idx: number) => (
                  <button
                    key={idx}
                    className="btn btn-primary"
                    style={{ padding: '1.5rem', fontSize: '1.2rem', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)' }}
                    onClick={() => {
                      const visibleChars = Array.from(choice).map((char, index) => char !== ' ' ? index : -1).filter(i => i !== -1);
                      for (let i = visibleChars.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [visibleChars[i], visibleChars[j]] = [visibleChars[j], visibleChars[i]];
                      }
                      const revealSequence = visibleChars.slice(0, Math.max(0, visibleChars.length - 1));

                      updateGameState({ 
                        phase: 'draw', 
                        word: choice, 
                        wordChoices: null, 
                        revealSequence, 
                        startTime: getServerTime() 
                      });
                    }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <h2 style={{ color: 'white', fontSize: '1.5rem' }}>
                {lobby?.players?.[gameState.drawerId]?.name || 'Il disegnatore'} sta scegliendo...
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                In attesa che scelga la parola da disegnare
              </p>
            </div>
          )}
        </motion.div>
      </GameLayoutMobile>
    );
  }

  const isFullscreenLayout = isPseudoFullscreen || isLandscape;

  if (phase === 'draw' || phase === 'finished' || phase === 'results') {
    if (isDrawer) {
      return (
        <GameLayoutMobile themeKey="disegnatore" style={{ padding: 0 }}>
          <div 
            ref={containerRef}
          className={`${isFullscreenLayout ? '' : 'container-mobile'} drawer-studio${isFullscreenLayout ? ' drawer-studio--fullscreen' : ''}${isLandscape ? ' drawer-studio--landscape' : ''}`}
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
            className="drawer-workspace"
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
            <div className="drawer-sidebar" style={{
              display: 'flex', 
              flexDirection: 'column',
              width: isLandscape ? '320px' : '100%',
              flexShrink: 0,
              overflowY: isLandscape ? 'auto' : 'visible',
              paddingRight: isLandscape ? '0.5rem' : '0'
            }}>
              <div className="drawer-prompt">
                <div className="drawer-prompt__copy">
                  <span>La tua parola</span>
                  <strong>{gameState.word}</strong>
                </div>
                <button 
                  onClick={toggleFullscreen} 
                  className="drawer-expand-button"
                  aria-label={isPseudoFullscreen ? 'Riduci la lavagna' : 'Espandi la lavagna'}
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
              
              <div className="drawer-toolbar" aria-label="Strumenti da disegno">
                <div className="drawer-toolbar__section">
                  <span className="drawer-toolbar__label">Strumento</span>
                  <div className="drawer-tools">
                    {[
                      { id: 'brush', label: 'Pennello', icon: <Brush size={20} /> },
                      { id: 'bucket', label: 'Riempi', icon: <PaintBucket size={20} /> },
                      { id: 'eraser', label: 'Gomma', icon: <Eraser size={20} /> },
                      { id: 'line', label: 'Linea', icon: <Minus size={20} /> },
                      { id: 'rect', label: 'Rettangolo', icon: <Square size={20} /> },
                      { id: 'circle', label: 'Cerchio', icon: <Circle size={20} /> }
                    ].map(tool => (
                      <button
                        type="button"
                        key={tool.id}
                        className={`drawer-tool${activeTool === tool.id ? ' drawer-tool--active' : ''}`}
                        onClick={() => setActiveTool(tool.id as typeof activeTool)}
                        aria-label={tool.label}
                        aria-pressed={activeTool === tool.id}
                        title={tool.label}
                      >
                        {tool.icon}
                      </button>
                    ))}
                    <button type="button" onClick={handleClear} className="drawer-tool drawer-tool--danger" aria-label="Pulisci la lavagna" title="Pulisci lavagna">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="drawer-toolbar__section">
                  <span className="drawer-toolbar__label">Spessore</span>
                  <div className="drawer-sizes">
                    {[3, 6, 12].map(size => (
                      <button
                        type="button"
                        key={size}
                        className={`drawer-size${activeSize === size ? ' drawer-size--active' : ''}`}
                        onClick={() => setActiveSize(size)}
                        aria-label={`Tratto ${size === 3 ? 'sottile' : size === 6 ? 'medio' : 'spesso'}`}
                        aria-pressed={activeSize === size}
                      >
                        <span style={{ width: size + 2, height: size + 2 }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="drawer-toolbar__section drawer-toolbar__section--colors">
                  <span className="drawer-toolbar__label">Colore</span>
                  <div className="drawer-colors no-scrollbar">
                    <label className="drawer-custom-color" style={{ '--drawing-color': activeColor } as React.CSSProperties}>
                      <Palette size={18} />
                      <span>Altro</span>
                      <input type="color" value={activeColor} onChange={(event) => setActiveColor(event.target.value)} aria-label="Scegli un colore personalizzato" />
                    </label>
                    {DRAWING_COLORS.map(color => (
                      <button
                        type="button"
                        key={color}
                        className={`drawer-color${activeColor.toLowerCase() === color ? ' drawer-color--active' : ''}`}
                        style={{ '--drawing-color': color } as React.CSSProperties}
                        onClick={() => setActiveColor(color)}
                        aria-label={`Scegli il colore ${color}`}
                        aria-pressed={activeColor.toLowerCase() === color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-canvas-area" style={
              isPseudoFullscreen 
              ? { flex: 1, minHeight: 0, minWidth: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }
              : { width: '100%', display: 'flex', justifyContent: 'center' }
            }>
              <div className="drawer-canvas-shell" style={{
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
                  startTime={gameState.startTime || getServerTime()} 
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

  return <LoadingScreen message="Caricamento in corso..." />;
}
