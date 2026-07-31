import re

# ---- Update HostVeroOFake.tsx ----
with open('src/games/VeroOFake/HostVeroOFake.tsx', 'r', encoding='utf-8') as f:
    vof_content = f.read()

vof_old = """          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ 
              fontSize: '3.5rem', """

vof_new = """          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {currentQ.category && (
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1.5rem',
                borderRadius: '2rem',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {currentQ.category}
              </div>
            )}
            <h2 style={{ 
              fontSize: '3.5rem', """

vof_content = vof_content.replace(vof_old, vof_new)

with open('src/games/VeroOFake/HostVeroOFake.tsx', 'w', encoding='utf-8') as f:
    f.write(vof_content)

# ---- Update HostFalsario.tsx ----
with open('src/games/Falsario/HostFalsario.tsx', 'r', encoding='utf-8') as f:
    falsario_content = f.read()

falsario_old_write = """            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
                Inserisci una bugia credibile per:
              </h2>"""

falsario_new_write = """            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              {gameState.question?.category && (
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '2rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  {gameState.question.category}
                </div>
              )}
              <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
                Inserisci una bugia credibile per:
              </h2>"""

falsario_old_vote = """            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
                Qual è la verità?
              </h2>"""

falsario_new_vote = """            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              {gameState.question?.category && (
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '2rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  {gameState.question.category}
                </div>
              )}
              <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '3px' }}>
                Qual è la verità?
              </h2>"""

falsario_content = falsario_content.replace(falsario_old_write, falsario_new_write)
falsario_content = falsario_content.replace(falsario_old_vote, falsario_new_vote)

with open('src/games/Falsario/HostFalsario.tsx', 'w', encoding='utf-8') as f:
    f.write(falsario_content)

print("Updated TV Host files")
