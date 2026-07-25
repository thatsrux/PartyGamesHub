export type GameThemeKey = 
  | 'default' 
  | 'disegnatore' 
  | 'la_carriera' 
  | 'falsario' 
  | 'impostore' 
  | 'nomi_cose_citta' 
  | 'vero_o_fake';

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
  }
};
