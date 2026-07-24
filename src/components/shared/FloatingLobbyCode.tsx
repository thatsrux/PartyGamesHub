export default function FloatingLobbyCode({ code }: { code: string }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '15px',
      right: '15px',
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '5px 15px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <span style={{ color: 'var(--color-primary)', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>{code}</span>
    </div>
  );
}
