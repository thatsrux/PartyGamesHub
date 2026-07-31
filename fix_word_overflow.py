import re

with open('src/games/Disegnatore/ClientDisegnatore.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_style = """          <div style={{ 
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
          }}>"""

new_style = """          <div style={{ 
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
          }}>"""

content = content.replace(old_style, new_style)

with open('src/games/Disegnatore/ClientDisegnatore.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ClientDisegnatore.tsx")
