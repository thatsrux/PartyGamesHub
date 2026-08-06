import { Crown, Library } from 'lucide-react';

interface CareerModeSettingProps {
  value?: string;
  onChange: (value: 'icone' | 'completo') => void;
}

const options = [
  { id: 'icone' as const, title: 'Icone', description: '67 nomi immediati', Icon: Crown },
  { id: 'completo' as const, title: 'Completo', description: 'Tutte le 145 carriere', Icon: Library },
];

export default function CareerModeSetting({ value = 'icone', onChange }: CareerModeSettingProps) {
  return (
    <div className="input-group" style={{ margin: 0 }}>
      <label style={{ marginBottom: '.65rem', fontSize: '1.1rem' }}>⚽ Difficoltà del catalogo</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
        {options.map(({ id, title, description, Icon }) => {
          const active = value === id;
          return (
            <button
              key={id} type="button" onClick={() => onChange(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '.75rem', padding: '1rem', textAlign: 'left',
                color: 'white', cursor: 'pointer', borderRadius: '1.1rem',
                background: active ? 'rgba(16,185,129,.24)' : 'rgba(255,255,255,.05)',
                border: active ? '2px solid #34d399' : '1px solid rgba(255,255,255,.1)',
                boxShadow: active ? '0 8px 24px rgba(16,185,129,.16)' : 'none',
              }}
            >
              <Icon size={24} color={active ? '#bef264' : '#94a3b8'} />
              <span><strong style={{ display: 'block', fontSize: '1rem' }}>{title}</strong><span style={{ color: 'rgba(255,255,255,.58)', fontSize: '.76rem' }}>{description}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
