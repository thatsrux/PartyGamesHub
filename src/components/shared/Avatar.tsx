export default function Avatar({ 
  photo, 
  name, 
  size = 40 
}: { 
  photo?: string | null, 
  name: string, 
  size?: number 
}) {
  if (photo) {
    return (
      <img 
        src={photo} 
        alt={name} 
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(255,255,255,0.1)',
          background: 'var(--color-panel)'
        }} 
      />
    );
  }

  // Fallback to initial
  const safeName = name || '?';
  const initial = safeName.charAt(0).toUpperCase();
  // Generate a consistent background color based on name
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: size * 0.4,
      border: '2px solid rgba(255,255,255,0.2)'
    }}>
      {initial}
    </div>
  );
}
