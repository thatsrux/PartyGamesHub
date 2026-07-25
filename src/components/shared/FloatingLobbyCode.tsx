export default function FloatingLobbyCode({ code }: { code: string }) {
  return (
    <div style={{
      position: 'fixed',
      top: 'max(env(safe-area-inset-top, 20px), 3vh)',
      left: 'max(env(safe-area-inset-left, 20px), 3vw)',
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '8px 20px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
    }}>
      <span style={{ color: 'var(--color-primary)', fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 'bold', letterSpacing: '3px' }}>{code}</span>
    </div>
  );
}
