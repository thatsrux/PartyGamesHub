import { Crown, Library, Trophy } from 'lucide-react';
import { careerPlayers } from './data';
import type { CareerMode } from './data';

interface CareerModeSettingProps {
  value?: string;
  onChange: (value: CareerMode) => void;
}

const playableCareers = careerPlayers.filter((player) => player.teams.length >= 2);
const iconCount = playableCareers.filter((player) => player.tier === 'icone').length;
const currentChampionCount = playableCareers.filter((player) => player.tier === 'campioni').length;

const options = [
  { id: 'icone' as const, title: 'Icone', description: `${iconCount} leggende`, Icon: Crown },
  { id: 'campioni' as const, title: 'Campioni attuali', description: `${currentChampionCount} protagonisti di oggi`, Icon: Trophy },
  { id: 'completo' as const, title: 'Completo', description: `Tutte le ${playableCareers.length} carriere`, Icon: Library },
];

export default function CareerModeSetting({ value = 'icone', onChange }: CareerModeSettingProps) {
  return (
    <div className="input-group" style={{ margin: 0 }}>
      <label style={{ marginBottom: '.65rem', fontSize: '1.1rem' }}>⚽ Difficoltà del catalogo</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr))', gap: '.75rem' }}>
        {options.map(({ id, title, description, Icon }) => {
          const active = value === id;
          return (
            <button
              key={id} type="button" onClick={() => onChange(id)}
              aria-pressed={active}
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
