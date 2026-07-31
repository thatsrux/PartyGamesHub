import re

with open('src/games/Disegnatore/ClientDisegnatore.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace reveal block
old_reveal = """  if (phase === 'reveal') {
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
  }"""

new_reveal = """  if (phase === 'reveal') {
    const isWinner = gameState.correctGuessers?.[userId];

    return (
      <GameLayoutMobile themeKey="disegnatore" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <RoundTracker current={gameState.round || 1} total={gameState.settings?.rounds || 5} isMobile />
        <motion.div className="panel" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2 style={{ fontSize: '1.5rem', color: isWinner ? 'var(--color-success)' : 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {isWinner ? '✅ Hai indovinato!' : 'La parola era:'}
          </h2>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900',
            color: 'white', 
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            padding: '1rem 2rem',
            borderRadius: '1.5rem',
            display: 'inline-block',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
            letterSpacing: '2px',
            marginTop: '1rem',
            marginBottom: '1rem'
          }}>
            {gameState.word}
          </div>
          
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
      </GameLayoutMobile>
    );
  }"""

# Replace results block
old_results = """  if (phase === 'results') {
    return (
      <div className="container-mobile" style={{ justifyContent: 'flex-start' }}>
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
  }"""

new_results = """  if (phase === 'results') {
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
            onClick={() => updateGameState({ action: 'next_round', actionId: Date.now() })}
          >
            Prossimo Turno (Admin)
          </button>
        )}
      </GameLayoutMobile>
    );
  }"""

content = content.replace(old_reveal, new_reveal)
content = content.replace(old_results, new_results)

with open('src/games/Disegnatore/ClientDisegnatore.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ClientDisegnatore.tsx")
