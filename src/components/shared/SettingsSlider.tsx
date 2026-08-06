import { useId } from 'react';

export default function SettingsSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = '',
  icon = ''
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  suffix?: string;
  icon?: string;
}) {
  const safeValue = Math.min(max, Math.max(min, value));
  const inputId = useId();

  return (
    <div className="input-group" style={{ margin: 0 }}>
      <label htmlFor={inputId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '1.2rem' }}>
        <span>{icon} {label}</span>
        <span style={{ 
          fontWeight: 'bold', 
          color: 'var(--color-bg)', 
          background: 'var(--color-primary)', 
          padding: '0.2rem 0.8rem', 
          borderRadius: '1rem' 
        }}>
          {safeValue}{suffix}
        </span>
      </label>
      <input 
        id={inputId}
        type="range" 
        min={min} max={max} step={step}
        value={safeValue} 
        aria-valuetext={`${safeValue}${suffix}`}
        onChange={e => onChange(parseInt(e.target.value) || min)} 
        style={{ 
          accentColor: 'var(--color-primary)', 
          width: '100%', 
          height: '10px', 
          borderRadius: '5px', 
          cursor: 'pointer',
          outline: 'none'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}
