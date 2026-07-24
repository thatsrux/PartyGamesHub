import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import Avatar from '../components/shared/Avatar';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, saveProfile, loading } = useProfile();
  
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.photo) setPhoto(profile.photo);
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ridimensiona immagine (150x150)
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;

        // Crop al centro (quadrato)
        const size = Math.min(width, height);
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
          const base64 = canvas.toDataURL('image/jpeg', 0.8); // Qualità 80%
          setPhoto(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    await saveProfile(name.trim(), photo || undefined);
    setIsSaving(false);
    navigate('/');
  };

  if (loading) {
    return <div className="container" style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Caricamento...</div>;
  }

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Il Tuo Profilo 👤</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Indietro</button>
      </header>

      <motion.form 
        onSubmit={handleSave}
        className="panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '500px', margin: '0 auto', width: '100%' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Avatar photo={photo} name={profile?.name || '?'} size={120} />
          
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => fileInputRef.current?.click()}
          >
            Cambia Foto
          </button>
          </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Nickname</label>
          <input 
            type="text" 
            className="input" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={15}
            required
            autoComplete="off"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-giant" disabled={isSaving || !name.trim()}>
          {isSaving ? 'Salvataggio...' : 'Salva Profilo'}
        </button>
      </motion.form>
    </div>
  );
}
