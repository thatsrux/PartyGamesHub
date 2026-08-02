export type GameThemeKey = 
  | 'default' 
  | 'disegnatore' 
  | 'la_carriera' 
  | 'falsario' 
  | 'impostore' 
  | 'nomi_cose_citta' 
  | 'vero_o_fake'
  | 'multigame'
  | 'quiz4'
  | 'piu_vicino'
  | 'ordina'
  | 'indovina_immagine'
  | 'jeopardy';

export interface GameTheme {
  backgroundGradient: string;
  orb1Color: string;
  orb2Color: string;
  primaryColor: string;
}

export const gameThemes: Record<GameThemeKey, GameTheme> = {
  default: {
    backgroundGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    orb1Color: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)', 
    orb2Color: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(0,0,0,0) 70%)',  
    primaryColor: '#6366f1'
  },
  disegnatore: {
    backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
    orb1Color: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, rgba(0,0,0,0) 70%)',
    orb2Color: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)',
    primaryColor: '#3b82f6'
  },
  la_carriera: {
    backgroundGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #10b981 100%)',
    orb1Color: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(0,0,0,0) 70%)', 
    orb2Color: 'radial-gradient(circle, rgba(132,204,22,0.2) 0%, rgba(0,0,0,0) 70%)',  
    primaryColor: '#10b981'
  },
  falsario: {
    backgroundGradient: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #dc2626 100%)',
    orb1Color: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, rgba(0,0,0,0) 70%)', 
    orb2Color: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0) 70%)',   
    primaryColor: '#ef4444'
  },
  impostore: {
    backgroundGradient: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
    orb1Color: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(0,0,0,0) 70%)', 
    orb2Color: 'radial-gradient(circle, rgba(190,18,60,0.2) 0%, rgba(0,0,0,0) 70%)',   
    primaryColor: '#8b5cf6'
  },
  nomi_cose_citta: {
    backgroundGradient: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #d97706 100%)',
    orb1Color: 'radial-gradient(circle, rgba(234,179,8,0.25) 0%, rgba(0,0,0,0) 70%)', 
    orb2Color: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(0,0,0,0) 70%)', 
    primaryColor: '#f59e0b'
  },
  vero_o_fake: {
    backgroundGradient: 'linear-gradient(135deg, #4a044e 0%, #701a75 50%, #d946ef 100%)',
    orb1Color: 'radial-gradient(circle, rgba(217,70,239,0.25) 0%, rgba(0,0,0,0) 70%)', 
    orb2Color: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(0,0,0,0) 70%)',  
    primaryColor: '#d946ef'
  },
  multigame: {
    backgroundGradient: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 25%, #831843 50%, #064e3b 75%, #0f172a 100%)',
    orb1Color: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(59,130,246,0.25) 50%, rgba(0,0,0,0) 70%)', 
    orb2Color: 'radial-gradient(circle, rgba(234,179,8,0.3) 0%, rgba(168,85,247,0.25) 50%, rgba(0,0,0,0) 70%)',  
    primaryColor: '#f43f5e'
  },
  quiz4: {
    backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0ea5e9 100%)',
    orb1Color: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, rgba(0,0,0,0) 70%)',
    orb2Color: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(0,0,0,0) 70%)',
    primaryColor: '#0ea5e9'
  },
  piu_vicino: {
    backgroundGradient: 'linear-gradient(135deg, #451a03 0%, #b45309 50%, #f59e0b 100%)',
    orb1Color: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(0,0,0,0) 70%)',
    orb2Color: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(0,0,0,0) 70%)',
    primaryColor: '#f59e0b'
  },
  ordina: {
    backgroundGradient: 'linear-gradient(135deg, #4a044e 0%, #9d174d 50%, #e11d48 100%)',
    orb1Color: 'radial-gradient(circle, rgba(225,29,72,0.25) 0%, rgba(0,0,0,0) 70%)',
    orb2Color: 'radial-gradient(circle, rgba(251,113,133,0.2) 0%, rgba(0,0,0,0) 70%)',
    primaryColor: '#e11d48'
  },
  indovina_immagine: {
    backgroundGradient: 'linear-gradient(135deg, #022c22 0%, #047857 50%, #10b981 100%)',
    orb1Color: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(0,0,0,0) 70%)',
    orb2Color: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, rgba(0,0,0,0) 70%)',
    primaryColor: '#10b981'
  },
  jeopardy: {
    backgroundGradient: 'linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #2563eb 100%)',
    orb1Color: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(0,0,0,0) 70%)',
    orb2Color: 'radial-gradient(circle, rgba(250,204,21,0.2) 0%, rgba(0,0,0,0) 70%)',
    primaryColor: '#3b82f6'
  }
};
